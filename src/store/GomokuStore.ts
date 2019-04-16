/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:18:50
 */

import { observable, when } from 'mobx';
import { asyncAction } from 'mobx-async-action';
import { ignore } from 'mobx-sync';
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

  @observable meta: RoomPrefabMetadata<GomokuPrefabDocument> = {
    prefab: ANY,
    count: 0,
    freeCount: 0,
    busyCount: 0,
  };

  @observable room: GomokuRoomDocument | undefined = undefined;

  async initSocket() {
    const token = await gomokuGetAccessToken({});
    this.socket = new SocketClient({
      url: appendQuery(token.address, { token: token.token }),
    });
    this.socket.connect();
    await when(() => this.socket.status === 'connected');
    const meta = await this.socket.request('room.listPrefab');
    this.meta = meta[0];
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
    (roomId?: number) =>
      this.socket.request<RoomEnterEvent, GomokuRoomDocument>('room.enter', {
        roomId: roomId,
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
