/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Color, Text } from 'ink';
import { pad, padEnd } from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react/custom';
import { T_SECOND } from 'monofile-utilities/lib/consts';
import * as React from 'react';
import { Component } from 'react';
import {
  Focusable,
  FocusableContainer,
  inputFocusProps,
} from '../components/Focusable';
import { KeyboardReceiver } from '../components/KeyboardReceiver';
import { Gomoku, Paths } from '../store/GomokuStore';
import { GomokuRoomDocument } from '../types/GomokuModule.idl';
import { itos } from '../utils/misc/numberFormat';

@observer
export class RoomListScene extends Component {
  private refreshTimer!: any;
  @observable private error = '';
  @observable private loading = false;
  private keys = ['r', 'n'];

  constructor(props: {}) {
    super(props);
  }

  private handleRefresh = async () => {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      Gomoku.listRoom();
      this.error = '';
    } catch (e) {
      this.error = e.message || e + '';
    }
    this.loading = false;
  };

  private handleNew = async () => {
    try {
      await Gomoku.enterRoom();
      Gomoku.path = Paths.Board;
    } catch (e) {
      this.error = e + '';
    }
  };

  private handleEnter = (room: GomokuRoomDocument) => async () => {
    try {
      await Gomoku.enterRoom(room.id);
      Gomoku.path = Paths.Board;
    } catch (e) {
      this.error = e + '';
    }
  };

  private handlePress = (key: string) => {
    switch (key) {
      case 'r':
      case 'R':
        this.handleRefresh();
        break;
      case 'n':
      case 'N':
        this.handleNew();
        break;
    }
  };

  componentDidMount() {
    this.refreshTimer = setInterval(this.handleRefresh, T_SECOND * 10);
    this.handleRefresh();
  }

  componentWillUnmount(): void {
    clearInterval(this.refreshTimer);
  }

  render() {
    return (
      <FocusableContainer>
        <>
          <KeyboardReceiver focus keys={this.keys} onPress={this.handlePress} />
          <Text bold>RoomList({Gomoku.meta.count})</Text>
          <Box height={14} margin={1} flexDirection="column">
            {Gomoku.rooms.map((room, index) => {
              const id = ` ∙ [${itos(room.id)}] `;
              let user = `u(${room.players[0] ? room.players[0]!.id : '-'})`;
              user += ' ⬌ ';
              user += `u(${room.players[1] ? room.players[1]!.id : '-'}) `;
              return (
                <Focusable
                  y={index + 1}
                  x={0}
                  key={index}
                  width={38}
                  focusProps={inputFocusProps}
                >
                  <KeyboardReceiver onEnter={this.handleEnter(room)}>
                    <Color
                      red={!!room.game}
                      green={room.players.indexOf(null) > -1}
                      gray={!room.game && room.players.indexOf(null) === -1}
                    >
                      {padEnd(id, 38 - user.length, ' ')}
                    </Color>
                    <Box>{user}</Box>
                  </KeyboardReceiver>
                </Focusable>
              );
            })}
            <Focusable
              y={6}
              x={0}
              width={38}
              focusProps={inputFocusProps}
              marginTop={1}
              cyan
            >
              <KeyboardReceiver onEnter={this.handleNew}>
                {pad('New (N)', 38, ' ')}
              </KeyboardReceiver>
            </Focusable>
          </Box>
          <Color
            gray={!this.error && !this.loading}
            red={!!this.error && !this.loading}
          >
            {this.loading
              ? 'LoadingScene...'
              : this.error
              ? this.error
              : 'Press R to refresh room list.'}
          </Color>
        </>
      </FocusableContainer>
    );
  }
}
