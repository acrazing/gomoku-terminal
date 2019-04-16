/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-16 22:00:18
 */

import { createWriteStream, WriteStream } from 'fs';

let ws: WriteStream;

export function debug(...args: any[]) {
  if (__DEV__) {
    if (!ws) {
      ws = createWriteStream('./debug.log', { flags: 'w+' });
    }
    ws.write(JSON.stringify(args) + '\n');
  }
}
