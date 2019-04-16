/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-02-20 20:44:17
 */

import { createTypeTree } from 'monofile-utilities/lib/type-tree';
import { BoardCoord, BoardHand } from '../utils/game/board_put';
import { ServiceError } from '../utils/service/ServiceError';
import {
  GomokuGameUserDocument,
  GomokuOverReason,
  GomokuRole,
} from './GomokuService.idl';
import { RoomDocument, RoomUserDocument } from './RoomModule.idl';

export const GomokuEvents = createTypeTree('gomoku', {
  start: 'start',
  askPlay: 'askPlay',
  play: 'play',
  over: 'over',
  askPeace: 'askPeace',
  replyPeace: 'replyPeace',
});

export interface GomokuRoomUserDocument extends RoomUserDocument {}

export interface GomokuActionDocument {
  since: number;
  timeout: number;
  gameId: number;
  index: number;
  userId: number;
}

export interface GomokuOnlineGameDocument {
  id: number;
  players: GomokuGameUserDocument[];
  createdAt: number;
  record: string;
  action: GomokuActionDocument;
}

export interface GomokuRoomDocument
  extends RoomDocument<GomokuRoomUserDocument> {
  game: GomokuOnlineGameDocument;
}

export interface GomokuStartEvent extends GomokuOnlineGameDocument {}

export interface GomokuAskPlayEvent {
  gameId: number;
  index: number;
  timeout: number;
  userId: number;
}

export interface GomokuPlayEvent {
  gameId: number;
  index: number;
  location: BoardCoord;
}

export interface GomokuUserPlayEvent {
  userId: number;
  gameId: number;
  index: number;
  hand: BoardHand;
  next: GomokuActionDocument | undefined;
}

export interface GomokuOverEvent {
  ok: boolean;
  id: number;
  roomId: number;
  players: undefined | GomokuGameUserDocument[];
  createdAt: number;
  record: string;
  winner: null | GomokuRole;
  winnerLocation: null | [BoardCoord, BoardCoord];
  overReason: GomokuOverReason;
  reason: ServiceError;
}

export interface GomokuAskPeaceEvent {
  guid: number;
  gameId: number;
}

export interface GomokuTransmitAskPeaceEvent {
  guid: number;
  gameId: number;
  userId: number;
}

export interface GomokuReplyPeaceEvent {
  guid: number;
  gameId: number;
  accept: boolean;
}

export interface GomokuTransmitReplyPeaceEvent {
  guid: number;
  gameId: number;
  accept: boolean;
  userId: number;
}

export interface GomokuGiveUpEvent {
  gameId: number;
}
