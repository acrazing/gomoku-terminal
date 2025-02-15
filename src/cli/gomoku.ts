#!/usr/bin/env node
/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:02:42
 */

(global as any).__DEV__ = process.env.NODE_ENV === 'development';
(global as any).WebSocket = require('ws');
require('mobx').configure({ enforceActions: __DEV__ ? 'observed' : 'never' });
require('mobx-sync').config({ ssr: false });

import { render } from 'ink';
import { AsyncTrunk, ignore } from 'mobx-sync';
import { createElement } from 'react';
import yargs, { Arguments } from 'yargs';
import { Application } from '../scenes/Application';
import { GomokuStore } from '../store/GomokuStore';
import { UserStore } from '../store/UserStore';
import { FSStorage } from '../utils/misc/FSStorage';
import { API } from '../utils/service/api';
import Signals = NodeJS.Signals;

const expandHomeDir = require('expand-home-dir');

interface CommandLineArguments extends Arguments {
  api: string;
  store: string;
}

const argv = yargs
  .alias('help', 'h')
  .string('api')
  .default('api', 'http://23.106.139.99:5001')
  .describe('api', 'the api host')
  .string('store')
  .default('store', '~/.gomoku-terminal.json')
  .describe('store', 'the config & session store file')
  .usage('$0 [options]')
  .help().argv as CommandLineArguments;

class Store {
  user = new UserStore().inject();
  @ignore gomoku = new GomokuStore().inject();
}

async function gomoku() {
  if (process.stdout.columns! < 71 || process.stdout.rows! < 20) {
    console.warn(
      'WARNING: your terminal size is less than 71(w) x 20(h), please resize your window.',
    );
  }
  API.config({ host: argv.api });
  const storage = new FSStorage(expandHomeDir(argv.store));
  storage.init();
  process.on('exit', () => {
    console.log('exiting...');
    storage.destroy();
  });
  process.on('unhandledRejection', () => process.exit(1));
  process.on('uncaughtException', () => process.exit(1));
  const signals: Signals[] = [
    'SIGTERM',
    'SIGHUP',
    'SIGINT',
    'SIGQUIT',
    'SIGABRT',
  ];
  signals.forEach((signal) => process.on(signal, () => process.exit(0)));
  process.stdout.write('\u001bc');
  const store = new Store();
  const trunk = new AsyncTrunk(store, { storage, delay: 50 });
  await trunk.init();
  const ink = render(createElement(Application), { debug: false });
  await ink.waitUntilExit();
}

gomoku().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
