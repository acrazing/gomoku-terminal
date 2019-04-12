/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-03-29 14:26:44
 */

import { T_DAY } from 'monofile-utilities/lib/consts';
import { itos, stoi } from './numberFormat';

describe('number format', () => {
  it('should format correctly', () => {
    const cases: [number, string][] = [
      [0, '0'],
      [1, '1'],
      [-1, '-1'],
      [0xff, 'FF'],
      [-0xff, '-FF'],
      [0x100, '100'],
      [-0x100, '-100'],
    ];
    for (const [i, s] of cases) {
      expect(itos(i, 16)).toBe(s);
      expect(stoi(s, 16)).toBe(i);
    }
    const case62: [number, string][] = [
      [T_DAY, '5qWaO'],
      [T_DAY * 365, 'YQDqDI'],
      [0xffffffff, '4gfFC3'],
      [Number.MAX_SAFE_INTEGER, 'fFgnDxSe7'],
    ];
    for (const [i, s] of case62) {
      expect(itos(i)).toBe(s);
      expect(stoi(s)).toBe(i);
    }
    expect(stoi('?')).toBeNaN();
  });
});
