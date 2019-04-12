/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-03-29 14:02:20
 */

const bits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const locs = new Uint8Array(127).fill(0xff);

for (let i = 0; i < bits.length; i++) {
  locs[bits.charCodeAt(i)] = i;
}

/**
 * integer to string
 * @param i
 * @param radix
 * @return {string} always fine
 */
export function itos(i: number, radix = 62) {
  if (i === 0) {
    return '0';
  }
  let o = '';
  let prev = '';
  if (i < 0) {
    prev = '-';
    i = -i;
  }
  while (i !== 0) {
    o = bits.charAt(i % radix) + o;
    i = Math.floor(i / radix);
  }
  return prev + o;
}

const caches: Float64Array[] = [];

for (let i = 2; i < 63; i++) {
  const max = Math.ceil(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(i));
  caches.push(new Float64Array(max));
  for (let j = 0; j < max; j++) {
    caches[i - 2][j] = i ** j;
  }
}

/**
 * string to integer
 * @param s
 * @param radix
 * @return {number} finite number if format is correct, else is NaN
 */
export function stoi(s: string, radix = 62) {
  let o = 0;
  let start = s.length - 1;
  let end = -1;
  if (s.charAt(0) === '-') {
    end = 0;
  }
  const cache = caches[radix - 2];
  for (let i = start; i > end; i--) {
    const p = locs[s.charCodeAt(i)];
    if (p >= radix) {
      return NaN;
    }
    o += cache[start - i] * p;
  }
  return end === 0 ? -o : o;
}
