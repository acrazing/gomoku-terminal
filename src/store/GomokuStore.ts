/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:50
 */

export class GomokuStore {
  inject() {
    return (Gomoku = this);
  }
}

export let Gomoku: GomokuStore;
