/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-03-30 18:16:06
 *
 * toString:36 x 109 ops/sec ±2.09% (70 runs sampled)
 * parseInt:36 x 189 ops/sec ±2.56% (73 runs sampled)
 * itos:36 x 121 ops/sec ±1.48% (76 runs sampled)
 * stoi:36 x 243 ops/sec ±3.57% (75 runs sampled)
 * itos:62 x 129 ops/sec ±1.71% (72 runs sampled)
 * stoi:62 x 260 ops/sec ±2.04% (78 runs sampled)
 * date.now x 396 ops/sec ±1.73% (84 runs sampled)
 *
 * result:
 *
 * 1. stoi, itos is faster than parseInt, Number.toString
 * 2. stoi, itos with 62 radix is faster than 36 radix
 * 3. Date.now is faster than upon, do not need to care the system call
 */

import { Suite } from 'benchmark';
import { shuffle } from 'lodash';
import { itos, stoi } from './numberFormat';

const cases: [string, string, string, string, number][] = [];

for (let i = 0; i < 10000; i++) {
  const now = Date.now();
  cases.push([itos(now, 36), itos(now), itos(now, 16), itos(10), now]);
}

for (let i = 0; i < 10000; i++) {
  const now = -Date.now();
  cases.push([itos(now, 36), itos(now), itos(now, 16), itos(10), now]);
}

export const suite = new Suite('number format')
  .add('toString:36', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => int.toString(36));
  })
  .add('parseInt:36', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => parseInt(s36, 36));
  })
  .add('itos:36', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => itos(int, 36));
  })
  .add('stoi:36', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => stoi(s36, 36));
  })
  .add('toString:16', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => int.toString(16));
  })
  .add('parseInt:16', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => parseInt(s16, 16));
  })
  .add('itos:16', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => itos(int, 16));
  })
  .add('stoi:16', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => stoi(s16, 16));
  })
  .add('toString:10', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => int.toString(10));
  })
  .add('parseInt:10', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => parseInt(s10, 10));
  })
  .add('itos:10', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => itos(int, 10));
  })
  .add('stoi:10', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => stoi(s10, 10));
  })
  .add('itos:62', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => itos(int));
  })
  .add('stoi:62', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => stoi(s62));
  })
  .add('date.now', () => {
    shuffle(cases).forEach(([s36, s62, s16, s10, int]) => Date.now());
  });
