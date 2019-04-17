/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Color, Text } from 'ink';
import { pad, padEnd } from 'lodash';
import { action, observable } from 'mobx';
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
import { Gomoku } from '../store/GomokuStore';
import { UserInGameAlready } from '../types/GameService.idl';
import { GomokuRoomDocument } from '../types/GomokuModule.idl';
import { itos } from '../utils/misc/numberFormat';

@observer
export class RoomListScene extends Component {
  private refreshTimer!: any;
  @observable private error = '';
  @observable private loading = false;
  private keys = ['r', 'n'];

  @action
  private set(error = this.error, loading = this.loading) {
    this.error = error;
    this.loading = loading;
  }

  constructor(props: {}) {
    super(props);
  }

  private handleRefresh = async () => {
    if (this.loading) {
      return;
    }
    this.set(void 0, true);
    try {
      await Gomoku.listRoom();
      this.set('', false);
      if (__DEV__ && Gomoku.rooms.length > 0) {
        await this.handleEnter(Gomoku.rooms[0])();
      }
    } catch (e) {
      if (e.code === UserInGameAlready.value) {
        await Gomoku.enterRoom(-1);
        Gomoku.push('Board');
      }
      this.set(e.message || e + '', false);
    }
  };

  private handleNew = async () => {
    if (this.loading) {
      return;
    }
    this.set(void 0, true);
    try {
      await Gomoku.enterRoom();
      Gomoku.push('Board');
    } catch (e) {
      this.set(e + '', false);
    }
  };

  private handleEnter = (room: GomokuRoomDocument) => async () => {
    try {
      await Gomoku.enterRoom(room.id);
      Gomoku.push('Board');
    } catch (e) {
      this.set(e + '');
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
