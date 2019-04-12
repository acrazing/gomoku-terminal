/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:33
 */

import { ignore } from 'mobx-sync';
import { noop, T_DAY } from 'monofile-utilities/lib/consts';
import Timer = NodeJS.Timer;

export class UserStore {
  @ignore
  timer = setInterval(noop, T_DAY) as Timer;

  exit() {
    this.timer.unref();
    process.exit(0);
  }

  inject() {
    return (User = this);
  }
}

export let User: UserStore;
