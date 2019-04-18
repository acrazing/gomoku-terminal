/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:50
 */

import { action, observable, when } from 'mobx';
import { asyncAction } from 'mobx-async-action';
import { ANY } from 'monofile-utilities/lib/consts';
import { Enum } from 'monofile-utilities/lib/enum';
import { appendQuery } from 'monofile-utilities/lib/query-string';
import { GomokuRoomDocument } from '../types/GomokuModule.idl';
import { GomokuPrefabDocument } from '../types/GomokuService.idl';
import {
  RoomEnterEvent,
  RoomListData,
  RoomListEvent,
  RoomPrefabMetadata,
} from '../types/RoomModule.idl';
import { debug } from '../utils/misc/log';
import { gomokuGetAccessToken } from '../utils/service/api';
import { SocketClient } from '../utils/socket/SocketClient';
import { SocketEvents } from '../utils/socket/types';

export const Paths = Enum({
  Loading: '',
  Login: '',
  RoomList: '',
  Profile: '',
  Board: '',
});

export type Paths = Enum<typeof Paths>;

export class GomokuStore {
  @observable
  path: Paths = Paths.Loading;
  socket!: SocketClient;
  rooms = observable.array<GomokuRoomDocument>();
  @observable
  meta: RoomPrefabMetadata<GomokuPrefabDocument> = {
    prefab: ANY,
    count: 0,
    freeCount: 0,
    busyCount: 0,
  };
  @observable room!: GomokuRoomDocument;

  @action
  push(path: Paths) {
    this.path = path;
  }

  async initSocket() {
    const token = await gomokuGetAccessToken({});
    this.socket = new SocketClient({
      url: appendQuery(token.address, { token: token.token }),
    });
    this.socket.connect();
    await when(() => this.socket.status === 'connected');
    const meta = await this.socket.request('room.listPrefab');
    this.meta = meta[0];
    if (__DEV__) {
      this.socket.on(SocketEvents.Message, (msg) => {
        if (msg && 'kind' in msg) {
          debug('socket message', msg.kind + msg.id, msg.key, msg.data);
        }
      });
      this.socket.on(SocketEvents.Send, (kind, key, data, id) => {
        debug('socket send', kind + id, key, data);
      });
    }
  }

  listRoom = asyncAction(
    () =>
      this.socket.request<RoomListEvent, RoomListData<GomokuRoomDocument>>(
        'room.list',
        { prefabId: this.meta.prefab.id },
      ),
    (data) => {
      this.rooms.replace(data.rooms);
      this.meta.count = data.count;
    },
  );

  enterRoom = asyncAction(
    (roomId?: number | null) =>
      this.socket.request<RoomEnterEvent, GomokuRoomDocument>('room.enter', {
        roomId: roomId === -1 ? void 0 : roomId,
        prefabId: roomId ? void 0 : this.meta.prefab.id,
      }),
    (room) => {
      this.room = room;
    },
  );

  inject() {
    return (Gomoku = this);
  }
}

export let Gomoku: GomokuStore;
