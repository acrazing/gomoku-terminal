/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-10 22:29:19
 */

import { itos } from './numberFormat';

const fn = () => '';

export function uid(min = 1, max = 62 ** 2 - 1, prefix = fn, radix = 62) {
  let id = min - 1;
  return () => {
    id = id + 1;
    if (id > max) {
      id = min;
    }
    return prefix() + itos(id, radix);
  };
}
