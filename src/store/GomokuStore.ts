/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:50
 */

import { observable, when } from 'mobx';
import { ignore } from 'mobx-sync';
import { Enum } from 'monofile-utilities/lib/enum';
import { appendQuery } from 'monofile-utilities/lib/query-string';
import { GomokuRoomDocument } from '../types/GomokuModule.idl';
import { gomokuGetAccessToken } from '../utils/service/api';
import { SocketClient } from '../utils/socket/SocketClient';

export const Paths = Enum({
  Loading: '',
  Login: '',
  RoomList: '',
  Profile: '',
  Board: '',
});

export type Paths = Enum<typeof Paths>;

export class GomokuStore {
  @ignore
  @observable
  path: Paths = Paths.Loading;

  socket!: SocketClient;

  rooms = observable.array<GomokuRoomDocument>();

  async initSocket() {
    const token = await gomokuGetAccessToken({});
    this.socket = new SocketClient({
      url: appendQuery(token.address, { token: token.token }),
    });
    this.socket.connect();
    await when(() => this.socket.status === 'connected');
  }

  inject() {
    return (Gomoku = this);
  }
}

export let Gomoku: GomokuStore;
