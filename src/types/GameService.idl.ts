/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-18 23:36:19
 */

import { code } from '../utils/service/ServiceError';

export const RoomIdExhausted = code(999001, '服务器资源不足');
export const UserInRoomAlready = code(999002, '您已经在房间内了');
export const InvalidBoardLocation = code(999003, '无效的位置');
export const InvalidUserRound = code(999004, '非法游戏玩家');
export const InvalidGameStatus = code(999005, '无效的游戏状态');
export const InvalidUserStatus = code(999006, '无效的用户状态');
export const RoomIsFilled = code(999008, '房间已满');
export const RoomSeatIsUsed = code(999010, '其它玩家捷足先登了');
export const UserInGameAlready = code(999011, '您已经在游戏中了');
