/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-17 16:49:45
 */

import { T_SECOND } from 'monofile-utilities/lib/consts';

export function remains(
  since: number,
  timeout: number,
  offset: number,
): string {
  return Math.floor((timeout - (Date.now() + offset - since)) / T_SECOND) + 's';
}
