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
      this.data = this.parse(initialData);
    }
  }

  private parse(data: string) {
    return data
      .trim()
      .split('\n')
      .reduce(
        (prev, now) => {
          const sep = now.indexOf(':');
          if (sep === -1) {
            throw new Error(`invalid data line(:)`);
          }
          prev[now.substr(0, sep)] = now.substr(sep + 1);
          return prev;
        },
        {} as SMap<string>,
      );
  }

  private stringify(data: SMap<string>) {
    return Object.keys(data)
      .map((key) => `${key}:${data[key]}`)
      .join('\n');
  }

  destroy() {
    fs.writeFileSync(this.filename, this.stringify(this.data));
    fs.unlinkSync(this.filename + '.lock');
  }

  setItem(key: string, value: string): Promise<void> {
    if (key.indexOf(':') > -1) {
      throw new Error('invalid item key');
    }
    this.data[key] = value;
    return fs.writeFile(this.filename, this.stringify(this.data));
  }

  async getItem(key: string): Promise<string | null> {
    if (this.data.hasOwnProperty(key)) {
      return this.data[key];
    }
    return null;
  }

  removeItem(key: string): Promise<void> {
    delete this.data[key];
    return fs.writeFile(this.filename, this.stringify(this.data));
  }
}
