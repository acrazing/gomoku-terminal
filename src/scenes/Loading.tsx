/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:56:21
 */

import { Box, Text } from 'ink';
import * as React from 'react';
import { PureComponent } from 'react';
import { Gomoku } from '../store/GomokuStore';
import { User } from '../store/UserStore';
import { userGet } from '../utils/service/api';

export class Loading extends PureComponent {
  async componentDidMount() {
    if (!User.userId) {
      Gomoku.path = 'Login';
      return;
    }
    try {
      const user = await userGet({});
      User.set(user);
      await Gomoku.initSocket();
      Gomoku.path = 'RoomList';
    } catch (e) {
      Gomoku.path = 'Login';
    }
  }

  render() {
    return (
      <Box>
        <Text bold>Loading...</Text>
      </Box>
    );
  }
}
