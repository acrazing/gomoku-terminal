/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-02-16 17:32:26
 */

import { MMap, SMap } from 'monofile-utilities/lib/map';
import { createTypeTree } from 'monofile-utilities/lib/type-tree';
import { SocketUserDocument } from '../utils/socket/types';

export interface RoomDocument<UD> {
  id: number;
  players: Array<UD | null>;
  viewers: UD[];
  game: any;
}

export enum RoomUserStatus {
  // 不在房间
  Free = 'Free',
  // 在房间未要求准备
  Pending = 'Pending',
  // 要求准备
  Unready = 'Unready',
  // 已准备
  Ready = 'Ready',
  /**
   * 当玩家在游戏当中时, 所有的状态管理都交给游戏模块去管理,
   * 此时如果玩家断开连接, 会通知所有其它玩家, 恢复时亦然.
   *
   * 玩家游戏开始时, 游戏模块有业务通知房间模块房间游戏开始, 以及哪些玩家参与了游戏.
   * 玩家游戏结束时, 游戏模块有业务通知房间模块玩家游戏已结束, 以及房间游戏是否结束.
   */
  Playing = 'Playing',
  // 旁观
  View = 'View',
}

export interface RoomUserDocument extends SocketUserDocument {
  status: RoomUserStatus;
  seat: number | undefined;
  since: number;
}

export const RoomLabels: SMap<string> = {
  roomId: '房间号',
  seat: '座位号',
  prefabId: '房间类型',
};

export enum RoomExitReason {
  EnterTimeout = 'EnterTimeout',
  ReadyTimeout = 'ReadyTimeout',
  Disconnect = 'Disconnect',
  UserExit = 'UserExit',
  RoomDestroy = 'RoomDestroy',
}

export type RoomExitEvent = {
  roomId: number;
  userId: number;
  seat: number;
  reason: RoomExitReason;
};

export interface RoomPrefab {
  id: number;
  name: string;
  seat: number;
  autoReady: boolean;
  readyTimeout: number; // second;
  allowSitInGame: boolean;
}

export const RoomPrefabLabels: MMap<RoomPrefab, string> = {
  id: '预设 id',
  name: '名称',
  seat: '座位数量',
  autoReady: '自动准备',
  readyTimeout: '准备超时时间',
  allowSitInGame: '游戏中允许坐下',
};

/**
 * 1. 随机加入(Free): undefined + undefined + number
 * 2. 指定加入(Not-Play): number + (undefined | null | number) + undefined
 * 3. 正常创建(Free): null + (undefined | null | number) + number
 * 4. 异常同步(Not-Free): undefined + undefined + undefined
 */
export interface RoomEnterEvent {
  // null: 创建
  // undefined: 随机, 没有就创建
  // number: 指定
  roomId?: number | null;
  // null: 旁观
  // undefined: 随机
  // number: 指定
  seat?: number | null;
  // undefined: 随机
  // number: 指定
  prefabId?: number;
}

export const RoomEvents = createTypeTree('room', {
  leave: '',
  enter: '',
  askReady: '',
  ready: '',
  unready: '',
});
