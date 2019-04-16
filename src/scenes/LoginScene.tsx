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
import {
  btnFocusProps,
  Focusable,
  FocusableContainer,
  inputFocusProps,
} from '../components/Focusable';
import { KeyboardReceiver } from '../components/KeyboardReceiver';
import { Gomoku, Paths } from '../store/GomokuStore';
import { User } from '../store/UserStore';
import { userLogin, userRegister } from '../utils/service/api';
import { ServiceError } from '../utils/service/ServiceError';

@observer
export class LoginScene extends Component {
  @observable
  private username = '';
  @observable
  private password = '';
  @observable error = '';
  private handleChange = memoize(
    (key: 'username' | 'password') => (value: string) => {
      if (value.length > 20) {
        return;
      }
      this[key] = value;
    },
  );

  private loading = false;

  private handleAnonymous = async () => {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const doc = await userLogin({
        kind: 'username',
        username: '',
        mobile: '',
        email: '',
        password: '',
        withToken: true,
        anonymous: true,
      });
      User.login(doc);
      await Gomoku.initSocket();
      Gomoku.path = Paths.RoomList;
    } catch (e) {
      this.error = e.message || e + '';
    }
    this.loading = false;
  };

  private handleLogin = async () => {
    if (this.loading) {
      return;
    }
    if (this.username.length < 6 || this.password.length < 6) {
      this.error = 'Please input username & password, both min length is 6.';
    }
    this.loading = false;
    try {
      const doc = await userLogin({
        kind: 'username',
        username: this.username,
        password: this.password,
        mobile: '',
        email: '',
        withToken: true,
        anonymous: false,
      });
      User.login(doc);
      await Gomoku.initSocket();
      Gomoku.path = Paths.RoomList;
    } catch (e) {
      if (e instanceof ServiceError && e.code === 404) {
        this.loading = false;
        try {
          await userRegister({
            username: this.username,
            mobile: '',
            email: '',
            password: this.password,
            nickname: this.username,
          });
          await this.handleLogin();
        } catch (e) {
          this.error = e.message || e + '';
        }
      } else {
        this.error = e.message || e + '';
      }
    }
    this.loading = false;
  };

  private handleExit = () => {
    process.exit(0);
  };

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
            <KeyboardReceiver onEnter={this.handleAnonymous}>
              Anonymous
            </KeyboardReceiver>
          </Focusable>
          <Focusable
            y={2}
            x={0}
            margin={1}
            underline
            focusProps={btnFocusProps}
          >
            <KeyboardReceiver onEnter={this.handleLogin}>Go</KeyboardReceiver>
          </Focusable>
          <Focusable
            y={2}
            x={1}
            margin={1}
            underline
            focusProps={btnFocusProps}
          >
            <KeyboardReceiver onEnter={this.handleExit}>Exit</KeyboardReceiver>
          </Focusable>
        </Box>
        <Color red={!this.loading} cyan={this.loading}>
          <Text>{this.loading ? 'LoginScene...' : this.error || ' '}</Text>
        </Color>
      </FocusableContainer>
    );
  }
}
