/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Color, Text } from 'ink';
import InkTextInput from 'ink-text-input';
import { memoize } from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react/custom';
import * as React from 'react';
import { Component } from 'react';

@observer
export class Login extends Component {
  @observable
  private username = '';
  @observable
  private password = '';
  private handleChange = memoize(
    (key: 'username' | 'password') => (value: string) => {
      this[key] = value;
    },
  );

  render() {
    return (
      <>
        <Text bold>Login</Text>
        <Box
          marginTop={1}
          marginBottom={1}
          alignItems="flex-start"
          flexDirection="column"
        >
          <Box width={20}>
            <Color underline>
              <InkTextInput
                placeholder="username            "
                value={this.username}
                onChange={this.handleChange('username')}
                focus={false}
              />
            </Color>
          </Box>
          <Box>
            <Color underline>
              <InkTextInput
                placeholder="password            "
                value={this.password}
                onChange={this.handleChange('password')}
                mask="*"
                focus={false}
              />
            </Color>
          </Box>
        </Box>
        <Box flexDirection="row">
          <Box margin={1}>Go</Box>
          <Box margin={1}>Anonymous</Box>
          <Box margin={1}>Exit</Box>
        </Box>
      </>
    );
  }
}
