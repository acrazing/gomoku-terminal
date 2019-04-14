/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:33
 */

import { computed, extendObservable, observable } from 'mobx';
import { ignore } from 'mobx-sync';
import { noop, T_DAY } from 'monofile-utilities/lib/consts';
import { UserGetOutput } from '../types/UserService.idl';
import Timer = NodeJS.Timer;

export class UserStore {
  @ignore
  timer = setInterval(noop, T_DAY) as Timer;

  users = observable.map<number, UserGetOutput>();

  @observable userId = 0;
  @observable token = '';

  @computed
  get user() {
    return this.users.get(this.userId);
  }

  get(id: number) {
    return this.users.get(id);
  }

  set(doc: Partial<UserGetOutput>, id = doc.id) {
    if (!id) {
      throw new Error('id should not be empty');
    }
    const old = this.users.get(id);
    this.users.set(
      id,
      old ? extendObservable(old, doc) : (doc as UserGetOutput),
    );
  }

  exit() {
    this.timer.unref();
    process.exit(0);
  }

  inject() {
    return (User = this);
  }
}

export let User: UserStore;
