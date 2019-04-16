/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box } from 'ink';
import { memoize } from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react/custom';
import * as React from 'react';
import { Component } from 'react';
import { Focusable, FocusableContainer } from '../components/Focusable';
import { KeyboardReceiver } from '../components/KeyboardReceiver';
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
    console.log(this.board, chars);
  };

  private handlePlay = memoize(
    (x: number, y: number) => () => {
      console.log(x, y);
    },
    (x, y) => x + '-' + y,
  );

  render() {
    return (
      <FocusableContainer>
        <Box width={40} flexDirection="row">
          <KeyboardReceiver keys={this.keys} onPress={this.handlePress} focus />
          <Box width={10}>Opponent</Box>
          <Box width={31} flexDirection="column">
            <Box>{'  ' + this.labels.join(' ')}</Box>
            {my.map((y) => {
              return (
                <Box key={y} flexDirection="column">
                  <Box>{itos(y)}</Box>
                  {mx.map((x) => (
                    <Box flexDirection="row" key={x}>
                      <Box> </Box>
                      <Focusable y={y} x={x}>
                        <KeyboardReceiver onEnter={this.handlePlay(x, y)}>
                          {`${y}-${x}`}
                        </KeyboardReceiver>
                      </Focusable>
                    </Box>
                  ))}
                </Box>
              );
            })}
            <Box>
              <Focusable y={16} x={0} margin={1}>
                <KeyboardReceiver>Exit(E)</KeyboardReceiver>
              </Focusable>
              <Focusable y={16} x={1} margin={1}>
                <KeyboardReceiver>Ready(E)</KeyboardReceiver>
              </Focusable>
              <Focusable y={16} x={2} margin={1}>
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
