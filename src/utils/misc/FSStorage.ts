/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 17:08:16
 */

import fs from 'fs-extra';
import { AsyncStorage } from 'mobx-sync';
import { SMap } from 'monofile-utilities/lib/map';

export class FSStorage implements AsyncStorage {
  private data: SMap<string> = {};

  constructor(readonly filename: string) {}

  init() {
    const pidFile = this.filename + '.lock';
    try {
      fs.writeFileSync(pidFile, process.pid + '', {
        flag: 'wx',
      });
    } catch (e) {
      if (e.code === 'EEXIST') {
        let pid = '';
        try {
          pid = fs.readFileSync(pidFile, 'utf8').trim();
        } catch {}
        throw new Error(
          `An old process(pid: ${pid}) is running, please check it. If you ensure the process is killed, please delete the lock file(${pidFile}), and then restart your application.`,
        );
      }
      throw new Error(
        `write lock file "${this.filename}.lock" error: ${e.code}`,
      );
    }
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(this.filename, '');
      return;
    }
    const initialData = fs.readFileSync(this.filename, 'utf8');
    if (initialData) {
      this.data = JSON.parse(initialData);
    }
  }

  destroy() {
    fs.writeJSONSync(this.filename, this.data);
    fs.unlinkSync(this.filename + '.lock');
  }

  setItem(key: string, value: string): Promise<void> {
    this.data[key] = value;
    return fs.writeJSON(this.filename, this.data);
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.data.hasOwnProperty(key)) {
      return this.data[key];
    }
    return null;
  }

  removeItem(key: string): Promise<void> {
    delete this.data[key];
    return fs.writeJSON(this.filename, this.data);
  }
}
