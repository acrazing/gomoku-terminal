/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-16 22:00:18
 */

import dayjs from 'dayjs';
import { createWriteStream, WriteStream } from 'fs';

let ws: WriteStream;

export function debug(...args: any[]) {
  if (__DEV__) {
    if (!ws) {
      ws = createWriteStream('./debug.log', { flags: 'w+' });
    }
    ws.write(
      JSON.stringify(
        [process.pid, dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')].concat(args),
      ) + '\n',
    );
  }
}
