/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-31 21:05:01
 *
 * 落子类棋牌类游戏通用工具
 * 比如 五子棋, 围棋, 黑白棋
 */

// board[x][y]
// 左上为 (0, 0)
// 右下为 (width, height)
import { itos, stoi } from '../misc/numberFormat';

export type Board<T extends number> = T[][];

export type BoardCoord = [number, number];

export function boardInit<T extends number>(
  width: number,
  height: number,
  initial: T,
): Board<T> {
  const board: T[][] = [];
  for (let y = 0; y < height; y++) {
    board.push(new Array(width).fill(initial));
  }
  return board;
}

export function boardDisplay(board: number[][], chars = '⋅•◦') {
  return [
    '  ' +
      Array(board[0].length)
        .fill(0)
        .map((_, index) => itos(index))
        .join(' '),
  ]
    .concat(
      board.map(
        (row, index) =>
          itos(index) +
          ' ' +
          row.map((value) => chars.charAt(value) || itos(value)).join(' '),
      ),
    )
    .join('\n');
}

export interface BoardHand {
  x: number;
  y: number;
  t: number;
}

export function boardDecodeHand(hand: string): BoardHand {
  const t = stoi(hand.substr(2)) || 0;
  const c0 = hand.charAt(0);
  const c1 = hand.charAt(1);
  if (c0 === '-' && c1 === '-') {
    return { x: -1, y: -1, t };
  }
  const x = stoi(c0);
  const y = stoi(c1);
  return { x, y, t };
}

export function boardEncodeHand({ x, y, t }: BoardHand) {
  if (x === -1 && y === -1) {
    return '--' + itos(t);
  }
  return itos(x) + itos(y) + itos(t);
}

export function boardDecodeRecord(record: string): BoardHand[] {
  record = record.trim();
  if (!record) {
    return [];
  }
  return record.split(',').map(boardDecodeHand);
}

export function boardEncodeRecord(record: BoardHand[]): string {
  return record.map(boardEncodeHand).join(',');
}
