/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Color } from 'ink';
import { memoize } from 'lodash';
import { computed, observable } from 'mobx';
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
import { Gomoku } from '../store/GomokuStore';
import { User } from '../store/UserStore';
import { Board } from '../utils/game/board_put';
import { Piece } from '../utils/game/GomokuMachine';
import { itos } from '../utils/misc/numberFormat';

const my = Array(15)
  .fill(0)
  .map((_, i) => i);

const mx = my.slice();

const chars = '⋅•◦';

@observer
export class BoardScene extends Component {
  private keys = ['g', 'G', 'p', 'P', 'a', 'A', 'd', 'D', 'e', 'E'];
  private labels = '0123456789ABCDEF'.split('');
  @observable
  private board = new Board(15, 15, Piece.Empty);

  private handlePress = (key: string) => {
    if (0) {
      console.log(this.board, chars, this.me, this.it, key);
    }
  };

  private handlePlay = memoize(
    (x: number, y: number) => () => {
      console.log(x, y);
    },
    (x, y) => x + '-' + y,
  );

  @computed
  private get me() {
    return Gomoku.room
      ? Gomoku.room.players[0] && Gomoku.room.players[0]!.id === User.userId
        ? Gomoku.room.players[0]
        : Gomoku.room.players[1]
      : null;
  }

  @computed
  private get it() {
    return Gomoku.room
      ? Gomoku.room.players[0]
        ? Gomoku.room.players[0]!.id === User.userId
          ? Gomoku.room.players[1]
          : Gomoku.room.players[0]
        : null
      : null;
  }

  render() {
    return (
      <FocusableContainer>
        <Box width={51} flexDirection="row">
          <KeyboardReceiver keys={this.keys} onPress={this.handlePress} focus />
          <Box width={10}>Opponent</Box>
          <Box width={31} flexDirection="column">
            <Color gray>{'  ' + this.labels.join(' ')}</Color>
            {my.map((y) => {
              return (
                <Box key={y} flexDirection="row">
                  <Color gray>{itos(y)}</Color>
                  {mx.map((x) => (
                    <Box key={x}>
                      {' '}
                      <Focusable y={y} x={x} focusProps={inputFocusProps}>
                        <KeyboardReceiver onEnter={this.handlePlay(x, y)}>
                          {chars.charAt(this.board.get(x, y))}
                        </KeyboardReceiver>
                      </Focusable>
                    </Box>
                  ))}
                </Box>
              );
            })}
            <Box>
              <Focusable
                y={16}
                x={0}
                margin={1}
                underline
                focusProps={btnFocusProps}
              >
                <KeyboardReceiver>Exit(E)</KeyboardReceiver>
              </Focusable>
              <Focusable
                y={16}
                x={1}
                margin={1}
                underline
                focusProps={btnFocusProps}
              >
                <KeyboardReceiver>Ready(R)</KeyboardReceiver>
              </Focusable>
              <Focusable
                y={16}
                x={2}
                margin={1}
                underline
                focusProps={btnFocusProps}
              >
                <KeyboardReceiver>Give Up(Q)</KeyboardReceiver>
              </Focusable>
            </Box>
          </Box>
          <Box width={10}>Me</Box>
        </Box>
      </FocusableContainer>
    );
  }
}
