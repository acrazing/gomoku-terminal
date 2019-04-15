/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-18 23:32:19
 */

/**
 * 操作记录:
 *
 * @typedef {string} playRecord:
 *
 *  格式:
 *      <x><y><ts>
 *      <x><y><ts>
 *      ...
 *  说明:
 *      - x, y: 坐标, 62进制, 大写, [0, F), 2 byte
 *      - ts: 时间, 相对于 createdAt, 毫秒, 不超过一年(864e5, 62进制, YQDqDI), 6 bytes
 *  最多走 15 * 15 步, 长度为 15 * 15 * 8
 */

import { Enum } from 'monofile-utilities/lib/enum';
import { Omit } from 'monofile-utilities/lib/types';
import {
  BaseDocument,
  defineLabels,
  EnableStatus,
  IdInput,
  IdsInput,
  ListResponse,
  PaginationInput,
} from './messages';
import { RoomPrefab, RoomPrefabLabels } from './RoomModule.idl';

export const GomokuOverReason = Enum({
  WIN: '游戏获胜',
  STEP_TIMEOUT: '步时超时',
  TOTAL_TIMEOUT: '局时超时',
  // TODO: handle the following over reasons in service, game
  //  1. draw will not change any score
  //  2. give up is same to upon
  //  3. need to check board status in game
  GIVE_UP: '认输',
  AGREE_PEACE: '平局',
  BOARD_EXHAUSTED: '平局',
});

export type GomokuOverReason = Enum<typeof GomokuOverReason>;

export const GomokuGameMode = Enum({
  ONLINE: '在线游戏',
  OFFLINE: '离线游戏',
});

export type GomokuGameMode = Enum<typeof GomokuGameMode>;

export const GomokuPrefabGroup = Enum({
  NORMAL: '普通场',
  MASTER: '高手场',
  GREAT_MASTER: '大师场',
});

export type GomokuPrefabGroup = Enum<typeof GomokuPrefabGroup>;

export const GomokuRole = Enum({
  BLACK: '先手',
  WHITE: '后手',
});

export type GomokuRole = Enum<typeof GomokuRole>;

export interface GomokuPrefabDocument extends BaseDocument, RoomPrefab {
  mode: GomokuGameMode;
  group: GomokuPrefabGroup;
  gameTimeout: number; // second
  stepTimeout: number; // second
  minEnterScore: number;
  maxEnterScore: number;
  status: EnableStatus;
}

export interface GomokuGameDocument extends BaseDocument {
  mode: GomokuGameMode;
  prefabId: number;
  blackSeat: number;
  overReason: GomokuOverReason | null;
  winnerRole: GomokuRole | null;
  record: string;
}

export interface GomokuGameUserDocument extends BaseDocument {
  gameId: number;
  userId: number;
  seat: number;
  role: GomokuRole;
  initialScore: number;
  score: number | null;
  usedTime: number;
}

export interface GomokuUserDocument extends BaseDocument {
  userId: number; // user id
  onlineScore: number;
  onlineCount: number;
  onlineWinCount: number;
  onlineBlackCount: number;
  onlineBlackWinCount: number;
  onlineMaxWinningStreak: number;
  onlineCurrentWinningStreak: number;
  offlineScore: number;
  offlineCount: number;
  offlineWinCount: number;
  offlineBlackCount: number;
  offlineBlackWinCount: number;
}

export const GomokuPrefabLabels = defineLabels<GomokuPrefabDocument>({
  ...RoomPrefabLabels,
  mode: '游戏类型',
  group: '分组',
  gameTimeout: '游戏超时时间',
  stepTimeout: '步时超时时间',
  minEnterScore: '最低入场积分',
  maxEnterScore: '最高入场积分',
  status: '状态',
});

export const GomokuGameLabels = defineLabels<GomokuGameDocument>({
  previous: '上一局连续的游戏ID',
  mode: '类型',
  prefabId: '游戏配置',
  blackSeat: '庄家座位',
  overReason: '结束原因',
  winnerRole: '获胜角色',
  record: '操作记录',
});

export const GomokuGameUserLabels = defineLabels<GomokuGameUserDocument>({
  gameId: '游戏 ID',
  userId: '用户 ID',
  seat: '座位',
  role: '角色',
  initialScore: '初始积分',
  score: '得分',
  usedTime: '游戏用时',
});

export interface GomokuGamePublicDocument extends GomokuGameDocument {
  // 按角色排序
  players: GomokuGameUserDocument[];
}

export const GomokuGameResultLabels = defineLabels<GomokuGamePublicDocument>({
  ...GomokuGameLabels,
  players: '玩家列表',
});

export const GomokuUserLabels = defineLabels<GomokuUserDocument>({
  userId: '用户 ID',
  onlineScore: '在线游戏积分',
  onlineCount: '在线游戏局数',
  onlineWinCount: '在线游戏获胜局数',
  onlineBlackCount: '在线游戏先手局数',
  onlineBlackWinCount: '在线游戏先手获胜局数',
  onlineMaxWinningStreak: '最高连胜',
  onlineCurrentWinningStreak: '当前连胜',
  offlineScore: '离线游戏积分',
  offlineCount: '离线游戏局数',
  offlineWinCount: '离线游戏获胜局数',
  offlineBlackCount: '离线游戏先手局数',
  offlineBlackWinCount: '离线游戏先手获胜局数',
});

export const GomokuLabels = Object.assign(
  {
    ids: 'ID 列表',
    gameId: '游戏 ID',
    index: '操作序号',
    location: '落子位置',
  },
  GomokuUserLabels,
  GomokuGameLabels,
  GomokuGameResultLabels,
  GomokuGameUserLabels,
  GomokuOverReason.labels,
);

export type GomokuCreatePrefabInput = Omit<
  GomokuPrefabDocument,
  keyof BaseDocument | 'status' | 'seat' | 'allowSitInGame'
>;
export type GomokuCreatePrefabOutput = GomokuPrefabDocument;
export type GomokuUpdatePrefabInput = IdInput &
  Partial<
    Omit<
      GomokuPrefabDocument,
      keyof BaseDocument | 'id' | 'mode' | 'group' | 'seat' | 'allowSitInGame'
    >
  >;
export type GomokuUpdatePrefabOutput = void;
export type GomokuGetPrefabInput = IdInput;
export type GomokuGetPrefabOutput = GomokuPrefabDocument;
export type GomokuListPrefabInput = PaginationInput &
  Partial<
    Omit<
      GomokuPrefabDocument,
      | keyof BaseDocument
      | 'seat'
      | 'allowSitInGame'
      | 'autoReady'
      | 'readyTimeout'
    >
  >;
export type GomokuListPrefabOutput = ListResponse<GomokuPrefabDocument>;
export type GomokuCreateGameInput = {
  prefabId: number;
  mode: GomokuGameMode;
  players: number[]; // 按座位来给
  blackSeat: number;
};
export type GomokuCreateGameOutput = GomokuGamePublicDocument;
export type GomokuUpdateGameInput = Pick<
  GomokuGameDocument,
  'id' | 'overReason' | 'record' | 'winnerRole'
>;
export type GomokuUpdateGameOutput = GomokuGamePublicDocument;
export type GomokuGetGameInput = IdInput;
export type GomokuGetGameOutput = GomokuGamePublicDocument;
export type GomokuListGameInput = {
  mode?: GomokuGameMode;
  userId?: number; // 限制用户 id
  isOver?: boolean; // 是否进行中...
  isWinner?: boolean; // 限制的用户 id 必须是赢家
  seat?: number; // 限定座位
} & PaginationInput;
export type GomokuListGameOutput = ListResponse<GomokuGamePublicDocument>;
export type GomokuGetUserInput = IdInput;
export type GomokuGetUserOutput = GomokuUserDocument;
export type GomokuListUserInput = IdsInput & PaginationInput;
export type GomokuListUserOutput = ListResponse<GomokuUserDocument>;

export interface GomokuServiceIdl {
  createPrefab(input: GomokuCreatePrefabInput): GomokuCreatePrefabOutput;
  updatePrefab(input: GomokuUpdatePrefabInput): GomokuUpdatePrefabOutput;
  getPrefab(input: GomokuGetPrefabInput): GomokuGetPrefabOutput;
  listPrefab(input: GomokuListPrefabInput): GomokuListPrefabOutput;
  createGame(input: GomokuCreateGameInput): GomokuCreateGameOutput;
  updateGame(input: GomokuUpdateGameInput): GomokuUpdateGameOutput;
  getGame(input: GomokuGetGameInput): GomokuGetGameOutput;
  listGame(input: GomokuListGameInput): GomokuListGameOutput;
  getUser(input: GomokuGetUserInput): GomokuGetUserOutput;
  listUser(input: GomokuListUserInput): GomokuListUserOutput;
}
