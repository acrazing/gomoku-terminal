/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:50
 */

import { ignore } from 'mobx-sync';
import { Enum } from 'monofile-utilities/lib/enum';

export const Paths = Enum({
  Loading: '',
  Login: '',
  RoomList: '',
  Profile: '',
  Board: '',
});

export type Paths = Enum<typeof Paths>;

export class GomokuStore {
  @ignore path: Paths = Paths.Loading;

  inject() {
    return (Gomoku = this);
  }
}

export let Gomoku: GomokuStore;
