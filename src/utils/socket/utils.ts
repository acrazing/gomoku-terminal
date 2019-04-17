/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-17 13:25:51
 */

import { lowerFirst } from 'lodash';
import { SMap } from 'monofile-utilities/lib/map';
import { SocketClient } from './SocketClient';

function resolveHandlers(module: any, pool: SMap<string> = {}): SMap<string> {
  if (!module) {
    return pool;
  }
  const keys = Object.getOwnPropertyNames(module);
  keys.forEach((key) => {
    if (pool[key]) {
      return;
    }
    const match = key.match(/^handle([A-Z][a-z$]+)([A-Z][A-Za-z]+)$/);
    if (!match) {
      return;
    }
    pool[key] =
      lowerFirst(match[1].replace(/\$/g, '-')) + '.' + lowerFirst(match[2]);
  });
  return resolveHandlers(Object.getPrototypeOf(module), pool);
}

export function mountHandlers(module: any, client: SocketClient) {
  const pool = resolveHandlers(module);
  for (const key in pool) {
    if (pool.hasOwnProperty(key)) {
      client.use(pool[key], module[key]);
    }
  }
}

export function unmountHandlers(module: any, client: SocketClient) {
  const pool = resolveHandlers(module);
  for (const key in pool) {
    if (pool.hasOwnProperty(key)) {
      client.off(pool[key], module[key]);
    }
  }
}
