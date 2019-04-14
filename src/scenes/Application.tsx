/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:56:28
 */

import { Box } from 'ink';
import { observer } from 'mobx-react/custom';
import * as React from 'react';
import { Component, ComponentClass } from 'react';
import { Gomoku, Paths } from '../store/GomokuStore';
import { Board } from './Board';
import { Loading } from './Loading';
import { Login } from './Login';
import { Profile } from './Profile';
import { RoomList } from './RoomList';

const scenes: { [P in Paths]: ComponentClass<any> } = {
  [Paths.Board]: Board,
  [Paths.Profile]: Profile,
  [Paths.RoomList]: RoomList,
  [Paths.Login]: Login,
  [Paths.Loading]: Loading,
};

@observer
export class Application extends Component {
  render() {
    const Scene = scenes[Gomoku.path];
    return (
      <Box
        height={20}
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Scene />
      </Box>
    );
  }
}
