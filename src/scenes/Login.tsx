/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';
import { memoize } from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react/custom';
import * as React from 'react';
import { Component } from 'react';
import {
  btnFocusProps,
  Focusable,
  FocusableContainer,
  inputFocusProps,
} from '../components/Focusable';

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
      <FocusableContainer>
        <Text bold>Login</Text>
        <Box
          marginTop={1}
          marginBottom={1}
          alignItems="flex-start"
          flexDirection="column"
        >
          <Focusable y={0} x={0} underline={true} focusProps={inputFocusProps}>
            <InkTextInput
              placeholder="username            "
              value={this.username}
              onChange={this.handleChange('username')}
            />
          </Focusable>
          <Focusable y={1} x={0} underline={true} focusProps={inputFocusProps}>
            <InkTextInput
              placeholder="password            "
              value={this.password}
              onChange={this.handleChange('password')}
              mask="*"
            />
          </Focusable>
        </Box>
        <Box flexDirection="row">
          <Focusable
            y={2}
            x={-1}
            margin={1}
            underline
            focusProps={btnFocusProps}
          >
            Anonymous
          </Focusable>
          <Focusable
            y={2}
            x={0}
            margin={1}
            underline
            focusProps={btnFocusProps}
          >
            Go
          </Focusable>
          <Focusable
            y={2}
            x={1}
            margin={1}
            underline
            focusProps={btnFocusProps}
          >
            Exit
          </Focusable>
        </Box>
      </FocusableContainer>
    );
  }
}
