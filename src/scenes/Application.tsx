/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:56:28
 */

import { Box, Color } from 'ink';
import { observer } from 'mobx-react/custom';
import * as React from 'react';
import { Component, ComponentClass } from 'react';
import { Gomoku, Paths } from '../store/GomokuStore';
import { BoardScene } from './BoardScene';
import { LoadingScene } from './LoadingScene';
import { LoginScene } from './LoginScene';
import { ProfileScene } from './ProfileScene';
import { RoomListScene } from './RoomListScene';

const scenes: { [P in Paths]: ComponentClass<any> } = {
  [Paths.Board]: BoardScene,
  [Paths.Profile]: ProfileScene,
  [Paths.RoomList]: RoomListScene,
  [Paths.Login]: LoginScene,
  [Paths.Loading]: LoadingScene,
};

@observer
export class Application extends Component {
  render() {
    const Scene = scenes[Gomoku.path];
    return (
      <>
        <Box
          height={20}
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Scene />
        </Box>
        <Color gray>Tips: use ↤ ↦ ↥ ↧ to focus items.</Color>
      </>
    );
  }
}
