/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-14 18:34:02
 */

import Signals = NodeJS.Signals;
import { noop } from 'monofile-utilities/lib/consts';

const signals: Signals[] = ['SIGTERM', 'SIGHUP', 'SIGINT', 'SIGQUIT'];

signals.forEach((sig) => {
  process.on(sig, () => {
    console.log('sig: %s', sig);
    process.exit(0);
  });
});

setTimeout(noop, 10e3);
