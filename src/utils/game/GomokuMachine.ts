/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-31 20:37:50
 */

import dayjs from 'dayjs';
import {
  InvalidBoardLocation,
  InvalidGameStatus,
  InvalidUserRound,
} from '../../types/GameService.idl';
import { GomokuPlayEvent } from '../../types/GomokuModule.idl';
import { GomokuGameDocument, GomokuRole } from '../../types/GomokuService.idl';
import { ServiceError } from '../service/ServiceError';
import {
  Board,
  BoardCoord,
  boardDecodeRecord,
  BoardHand,
  boardInit,
} from './board_put';

export enum Piece {
  Empty = 0,
  Black = 1,
  White = 2,
}

const BOARD_SIZE = 15;

export class GomokuMachine {
  readonly id: number;
  readonly board: Board<Piece>;
  readonly history: BoardHand[];
  winner: GomokuRole | null;
  winnerLocation: [BoardCoord, BoardCoord] | null;
  readonly createdAt: number;

  constructor(game: GomokuGameDocument) {
    this.id = game.id;
    this.createdAt = dayjs(game.createdAt).valueOf();
    this.winner = null;
    this.winnerLocation = null;
    this.board = boardInit(BOARD_SIZE, BOARD_SIZE, Piece.Empty);
    this.history = boardDecodeRecord(game.record || '');
  }

  /**
   * 计算状态:
   *
   * 1. 游戏是否结束
   * 2. 是否禁手
   *
   * 先只算游戏是否结束, 不考虑禁手
   */
  private computeWinner(): GomokuRole | null {
    const { x, y } = this.history[this.history.length - 1];
    const winner =
      this.history.length % 2 ? GomokuRole.BLACK : GomokuRole.WHITE;
    let i: number;
    let j: number;
    let ok = true;
    // 0
    for (i = 1; i < 5; i++) {
      if (x + i >= BOARD_SIZE || this.board[y][x + i] !== this.board[y][x]) {
        break;
      }
    }
    for (j = 5 - i; j > 0; j--) {
      if (x - j < 0 || this.board[y][x - j] !== this.board[y][x]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      this.winner = winner;
      this.winnerLocation = [[x + i - 5, y], [x + i - 1, y]];
      return winner;
    }
    ok = true;
    // 45
    for (i = 1; i < 5; i++) {
      if (
        y - i < 0 ||
        x + i >= BOARD_SIZE ||
        this.board[y - i][x + i] !== this.board[y][x]
      ) {
        break;
      }
    }
    for (j = 5 - i; j > 0; j--) {
      if (
        y + j >= BOARD_SIZE ||
        x - j < 0 ||
        this.board[y + j][x - j] !== this.board[y][x]
      ) {
        ok = false;
        break;
      }
    }
    if (ok) {
      this.winner = winner;
      this.winnerLocation = [[x + i - 5, y + 5 - i], [x + i - 1, y + 1 - i]];
      return winner;
    }
    ok = true;
    // 90
    for (i = 1; i < 5; i++) {
      if (y - i < 0 || this.board[y - i][x] !== this.board[y][x]) {
        break;
      }
    }
    for (j = 5 - i; j > 0; j--) {
      if (y + j >= BOARD_SIZE || this.board[y + j][x] !== this.board[y][x]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      this.winner = winner;
      this.winnerLocation = [[x, y - i + 1], [x, y + 5 - i]];
      return winner;
    }
    ok = true;
    // 135
    for (i = 1; i < 5; i++) {
      if (
        y - i < 0 ||
        x - i < 0 ||
        this.board[y - i][x - i] !== this.board[y][x]
      ) {
        break;
      }
    }
    for (j = 5 - i; j > 0; j--) {
      if (
        y + j >= BOARD_SIZE ||
        x + j >= BOARD_SIZE ||
        this.board[y + j][x + j] !== this.board[y][x]
      ) {
        ok = false;
        break;
      }
    }
    if (ok) {
      this.winner = winner;
      this.winnerLocation = [[x - i + 1, y - i + 1], [x + i - 5, y + i - 5]];
      return winner;
    }
    return null;
  }

  go(role: GomokuRole, event: GomokuPlayEvent) {
    if (
      this.winner !== null ||
      event.gameId !== this.id ||
      event.index !== this.history.length
    ) {
      throw new ServiceError(InvalidGameStatus);
    }
    if ((role === 'BLACK') !== (this.history.length % 2 === 0)) {
      throw new ServiceError(InvalidUserRound);
    }
    const [x, y] = event.location;
    if (!this.board[y] || this.board[y][x] !== Piece.Empty) {
      throw new ServiceError(InvalidBoardLocation);
    }
    this.board[y][x] = this.history.length % 2 ? Piece.White : Piece.Black;
    const hand: BoardHand = { x, y, t: Date.now() - this.createdAt };
    this.history.push(hand);
    this.computeWinner();
    return hand;
  }
}
