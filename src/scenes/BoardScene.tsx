/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-12 16:04:48
 */

import { Box, Color } from 'ink';
import { memoize } from 'lodash';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react/custom';
import { ANY, T_SECOND } from 'monofile-utilities/lib/consts';
import * as React from 'react';
import { Component } from 'react';
import {
  btnFocusProps,
  Focusable,
  FocusableContainer,
  inputFocusProps,
} from '../components/Focusable';
import { ignoreCase, KeyboardReceiver } from '../components/KeyboardReceiver';
import { Gomoku } from '../store/GomokuStore';
import { User } from '../store/UserStore';
import {
  GomokuOverEvent,
  GomokuPlayEvent,
  GomokuRoomUserDocument,
  GomokuStartEvent,
  GomokuTransmitAskPeaceEvent,
  GomokuTransmitReplyPeaceEvent,
  GomokuUserPlayEvent,
} from '../types/GomokuModule.idl';
import { RoomExitReason, RoomUserStatus } from '../types/RoomModule.idl';
import { Board, boardDecodeRecord } from '../utils/game/board_put';
import { Piece } from '../utils/game/GomokuMachine';
import { itos } from '../utils/misc/numberFormat';
import { remains } from '../utils/misc/time';
import { SocketEvents } from '../utils/socket/types';
import { mountHandlers, unmountHandlers } from '../utils/socket/utils';

const my = Array(15)
  .fill(0)
  .map((_, i) => i);

const mx = my.slice();

const chars = '⋅•◦';

@observer
export class BoardScene extends Component {
  // key map:
  // R: Ready
  // E: Exit
  // P: Ask Peace
  // A: Accept peace
  // D: Decline peace
  // G: Give up
  private keys = ignoreCase('REPADG');
  private labels = '0123456789ABCDE'.split('');
  private board = new Board(15, 15, Piece.Empty as Piece);
  @observable error = '';
  @observable loading = false;

  @action
  private set(error = this.error, loading = this.loading) {
    this.error = error;
    this.loading = loading;
  }

  private handlePress = (key: string) => {
    switch (key.toUpperCase()) {
      case 'R':
        this.handleReady();
        break;
      case 'E':
        this.handleExit();
        break;
      case 'P':
        this.handleAskPeace();
        break;
      case 'A':
        this.handleAccept();
        break;
      case 'D':
        this.handleDecline();
        break;
      case 'G':
        this.handleGiveUp();
        break;
    }
  };

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

  private updateTimer: any;

  constructor(props: {}) {
    super(props);
    if (Gomoku.room.game) {
      const initial = boardDecodeRecord(Gomoku.room.game.record);
      initial.forEach((value, index) => {
        this.board.set(value.x, value.y, index % 2 ? Piece.White : Piece.Black);
      });
    }
  }

  componentDidMount(): void {
    mountHandlers(this, Gomoku.socket);
    Gomoku.socket.on(SocketEvents.Reconnecting, this.handleReconnect);
    this.updateTimer = setInterval(() => this.forceUpdate(), T_SECOND);
  }

  componentWillUnmount(): void {
    unmountHandlers(this, Gomoku.socket);
    Gomoku.socket.off(SocketEvents.Reconnecting, this.handleReconnect);
    clearInterval(this.updateTimer);
  }

  @action.bound
  private handleReconnect() {
    if (this.me!.status !== RoomUserStatus.Playing) {
      Gomoku.push('RoomList');
    } else {
      this.me!.offline = true;
    }
  }

  @action.bound
  handleRoomEnter({ user }: { user: GomokuRoomUserDocument }) {
    if (user.seat === undefined || user.status === RoomUserStatus.View) {
      return;
    }
    Gomoku.room.players[user.seat] = user;
  }

  @action.bound
  handleRoomLeave({
    user,
  }: {
    user: GomokuRoomUserDocument;
    reason: RoomExitReason;
  }) {
    if (user.seat === undefined) {
      return;
    }
    if (user.id === User.userId) {
      Gomoku.push('RoomList');
      Gomoku.room = ANY;
    } else {
      Gomoku.room.players[user.seat] = null;
    }
  }

  @action.bound
  handleRoomAskReady({ user }: { user: GomokuRoomUserDocument }) {
    Gomoku.room.players[user.seat!] = user;
  }

  @action.bound
  handleRoomReady({ user }: { user: GomokuRoomUserDocument }) {
    Gomoku.room.players[user.seat!] = user;
  }

  @action.bound
  handleRoomUnready({ user }: { user: GomokuRoomUserDocument }) {
    Gomoku.room.players[user.seat!] = user;
  }

  @action.bound
  handleGomokuStart(event: GomokuStartEvent) {
    this.board.data.fill(0);
    Gomoku.room.game = event;
  }

  @action.bound
  handleGomokuPlay(event: GomokuUserPlayEvent) {
    this.board.set(
      event.hand.x,
      event.hand.y,
      event.index % 2 ? Piece.White : Piece.Black,
    );
    Gomoku.room.game.action = event.next!;
  }

  @action.bound
  handleGomokuAskPeace(event: GomokuTransmitAskPeaceEvent) {}

  @action.bound
  handleGomokuReplyPeace(event: GomokuTransmitReplyPeaceEvent) {}

  @action.bound
  handleGomokuOver(event: GomokuOverEvent) {
    this.set(
      `Game Over, ${
        event.winner === null
          ? 'TIE'
          : (event.winner === 'BLACK') ===
            (this.me!.seat === Gomoku.room.game!.players[0].userId)
          ? 'YOU WIN'
          : 'YOU LOSE'
      }!`,
    );
  }

  @action.bound
  handleSessionConnect({ user }: { user: GomokuRoomUserDocument }) {
    if (user.status === RoomUserStatus.View || user.seat === undefined) {
      return;
    }
    Gomoku.room.players[user.seat] = user;
  }

  @action.bound
  handleSessionDisconnect({ user }: { user: GomokuRoomUserDocument }) {
    if (user.status === RoomUserStatus.View || user.seat === undefined) {
      return;
    }
    Gomoku.room.players[user.seat] = user;
  }

  private handleExit = async () => {
    if (this.loading) {
      return;
    }
    if (this.me!.status === RoomUserStatus.Playing) {
      return;
    }
    this.set(void 0, true);
    try {
      await Gomoku.socket.request('room.exit', void 0);
      Gomoku.push('RoomList');
    } catch (e) {
      this.set(e + '', false);
    }
  };

  private handleReady = async () => {
    if (this.loading) {
      return;
    }
    if (this.me!.status !== RoomUserStatus.Unready) {
      return;
    }
    this.set(void 0, true);
    try {
      await Gomoku.socket.request('room.ready');
      runInAction(() => {
        this.me!.status = RoomUserStatus.Ready;
        this.set('', false);
      });
    } catch (e) {
      this.set(e + '', false);
    }
  };

  private handlePlay = memoize(
    (x: number, y: number) => async () => {
      if (this.loading) {
        return;
      }
      if (
        !Gomoku.room.game ||
        !Gomoku.room.game.action ||
        Gomoku.room.game.action.userId !== this.me!.id
      ) {
        return;
      }
      this.set(void 0, true);
      try {
        const data = await Gomoku.socket.request<
          GomokuPlayEvent,
          GomokuUserPlayEvent
        >('gomoku.play', {
          index: Gomoku.room.game.action.index,
          gameId: Gomoku.room.game.id,
          location: [x, y],
        });
        runInAction(() => {
          this.board.set(
            data.hand.x,
            data.hand.y,
            data.index % 2 ? Piece.White : Piece.Black,
          );
          Gomoku.room.game.action = data.next!;
          this.set('', false);
        });
      } catch (e) {
        this.set(e + '', false);
      }
    },
    (x, y) => x + '-' + y,
  );

  private handleAskPeace = async () => {};

  private handleAccept = async () => {};

  private handleDecline = async () => {};

  private handleGiveUp = async () => {
    if (this.loading) {
      return;
    }
    if (this.me!.status !== RoomUserStatus.Playing) {
      return;
    }
    this.set(void 0, true);
    try {
      await Gomoku.socket.request('gomoku.giveUp');
      this.set(void 0, false);
    } catch (e) {
      this.set(e + '', false);
    }
  };

  render() {
    return (
      <FocusableContainer>
        <Box width={71} flexDirection="row">
          <KeyboardReceiver keys={this.keys} onPress={this.handlePress} focus />
          <Box width={20} flexDirection="column" alignItems="center">
            Opponent
            {`(${this.it ? this.it.id : '--'})`}
            {Gomoku.room.game
              ? Gomoku.room.game.action &&
                Gomoku.room.game.action.userId === this.it!.id
                ? remains(
                    Gomoku.room.game.action.since,
                    Gomoku.room.game.action.timeout,
                    Gomoku.socket.clockOffset,
                  )
                : ''
              : this.it
              ? this.it.status
              : ''}
            {this.it && this.it.offline ? 'Offline' : null}
          </Box>
          <Box width={31} flexDirection="column">
            <Color blue={this.loading} red={!this.loading && !!this.error}>
              {this.loading ? 'Doing...' : this.error || ' '}
            </Color>
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
            <Box flexDirection="row" justifyContent="space-between">
              {Gomoku.room.game ? null : (
                <Focusable
                  y={16}
                  x={0}
                  margin={1}
                  underline
                  focusProps={btnFocusProps}
                >
                  <KeyboardReceiver onEnter={this.handleExit}>
                    Exit(E)
                  </KeyboardReceiver>
                </Focusable>
              )}
              {this.me!.status === RoomUserStatus.Unready ? (
                <Focusable
                  y={16}
                  x={1}
                  margin={1}
                  underline
                  focusProps={btnFocusProps}
                >
                  <KeyboardReceiver onEnter={this.handleReady}>
                    {`Ready(R:${remains(
                      this.me!.since,
                      Gomoku.meta.prefab.readyTimeout * T_SECOND,
                      Gomoku.socket.clockOffset,
                    )})`}
                  </KeyboardReceiver>
                </Focusable>
              ) : null}
              {Gomoku.room.game ? (
                <Focusable
                  y={16}
                  x={2}
                  margin={1}
                  underline
                  focusProps={btnFocusProps}
                >
                  <KeyboardReceiver onEnter={this.handleGiveUp}>
                    Give Up(Q)
                  </KeyboardReceiver>
                </Focusable>
              ) : null}
            </Box>
          </Box>
          <Box width={20} flexDirection="column-reverse" alignItems="center">
            {`Me(${User.userId})`}
            {Gomoku.room.game
              ? Gomoku.room.game.action &&
                Gomoku.room.game.action.userId === this.me!.id
                ? remains(
                    Gomoku.room.game.action.since,
                    Gomoku.room.game.action.timeout,
                    Gomoku.socket.clockOffset,
                  )
                : ''
              : this.me
              ? this.me.status
              : ''}
          </Box>
        </Box>
      </FocusableContainer>
    );
  }
}
