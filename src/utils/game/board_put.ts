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
import TypedArray = NodeJS.TypedArray;

export class Board<T extends number, B extends TypedArray = Uint8Array> {
  readonly data: B;

  constructor(
    readonly width: number,
    readonly height: number,
    initial: T,
    readonly Factory: new (n: number) => B = Int8Array as any,
  ) {
    this.data = new Factory(width * height);
    this.data.fill(initial);
  }

  get(x: number, y: number) {
    return this.data[y * this.width + x] as T;
  }

  set(x: number, y: number, value: T) {
    this.data[y * this.width + x] = value;
  }

  row(y: number) {
    return this.data.slice(y * this.width, (y + 1) * this.width);
  }

  col(x: number) {
    const col = new this.Factory(this.height);
    for (let i = 0; i < this.height; i++) {
      col[i] = this.get(x, i);
    }
    return col;
  }

  display(chars = '⋅•◦') {
    let str =
      '  ' +
      Array(this.width)
        .fill(0)
        .map((_, index) => itos(index))
        .join(' ') +
      '\n';
    for (let y = 0; y < this.height; y++) {
      str += itos(y);
      for (let x = 0; x < this.width; x++) {
        const value = this.get(x, y);
        str += ' ' + chars.charAt(value) || itos(value);
      }
      str += '\n';
    }
    return str;
  }
}

export type BoardCoord = [number, number];

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
