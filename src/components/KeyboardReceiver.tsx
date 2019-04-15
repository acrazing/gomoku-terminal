/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-15 16:41:18
 */

import { StdinContext } from 'ink';
import * as React from 'react';
import { PureComponent } from 'react';
import ReadStream = NodeJS.ReadStream;

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';
const ENTER = '\r';
const CTRL_C = '\x03';
const BACKSPACE = '\x08';
const DELETE = '\x7F';

export interface KeyboardReceiverProps {
  keys?: string[];
  focus?: boolean;
  onEnter?(): void;
  onDelete?(): void;
  onInterrupt?(): void;
  onArrowDown?(): void;
  onArrowUp?(): void;
  onArrowLeft?(): void;
  onArrowRight?(): void;
  onPress?(key: string): void;
}

export class KeyboardReceiver extends PureComponent<KeyboardReceiverProps> {
  private stdin: ReadStream | undefined = undefined;

  constructor(props: KeyboardReceiverProps) {
    super(props);
  }

  private handleInput = (data: Buffer) => {
    if (!this.props.focus) {
      return;
    }
    const value = data.toString();
    if (value === ENTER && this.props.onEnter) {
      this.props.onEnter();
      return;
    }
    if ((value === DELETE || value === BACKSPACE) && this.props.onDelete) {
      this.props.onDelete();
      return;
    }
    if (value === CTRL_C && this.props.onInterrupt) {
      this.props.onInterrupt();
      return;
    }
    if (value === ARROW_UP && this.props.onArrowUp) {
      this.props.onArrowUp();
      return;
    }
    if (value === ARROW_RIGHT && this.props.onArrowRight) {
      this.props.onArrowRight();
      return;
    }
    if (value === ARROW_DOWN && this.props.onArrowDown) {
      this.props.onArrowDown();
      return;
    }
    if (value === ARROW_LEFT && this.props.onArrowLeft) {
      this.props.onArrowLeft();
      return;
    }
    if (!this.props.keys || this.props.keys.indexOf(value) > -1) {
      this.props.onPress && this.props.onPress(value);
      return;
    }
  };

  componentDidMount(): void {
    this.stdin!.on('data', this.handleInput);
  }

  componentWillUnmount(): void {
    this.stdin!.removeListener('data', this.handleInput);
    this.stdin = undefined;
  }

  render() {
    return (
      <StdinContext.Consumer>
        {({ stdin }) => {
          this.stdin = stdin;
          return this.props.children;
        }}
      </StdinContext.Consumer>
    );
  }
}
