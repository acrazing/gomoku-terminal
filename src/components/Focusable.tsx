/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-14 18:05:18
 */

import { Box, BoxProps, Color, ColorProps, StdinContext } from 'ink';
import { action, computed, observable, ObservableMap, runInAction } from 'mobx';
import { ANY } from 'monofile-utilities/lib/consts';
import * as React from 'react';
import { PureComponent } from 'react';
import { F1 } from '../types/misc';
import { seek } from '../utils/misc/array';
import ReadStream = NodeJS.ReadStream;

class FocusableStore {
  @observable container: FocusableContainer | undefined = undefined;
  @observable current: Focusable | undefined = undefined;
  private items = observable.map<number, ObservableMap<number, Focusable>>();

  get(x: number, y: number) {
    const row = this.items.get(y);
    return row ? row.get(x) : undefined;
  }

  row(y: number) {
    return this.items.get(y);
  }

  @action
  put(item: Focusable) {
    if (!this.items.has(item.props.y)) {
      this.items.set(item.props.y, observable.map({}, { deep: false }));
    }
    this.items.get(item.props.y)!.set(item.props.x, item);
  }

  @action
  drop(item: Focusable) {
    if (this.current === item) {
      this.current = undefined;
    }
    if (!this.items.has(item.props.y)) {
      return;
    }
    const row = this.items.get(item.props.y)!;
    if (row.get(item.props.x) === item) {
      row.delete(item.props.x);
    }
  }

  @computed
  get ys() {
    return Array.from(this.items.keys())
      .filter((y) => this.items.get(y)!.size > 0)
      .sort((a, b) => a - b);
  }

  xs(y: number) {
    return this.items.has(y)
      ? Array.from(this.items.get(y)!.keys()).sort((a, b) => a - b)
      : [];
  }

  @computed
  get minY() {
    return Math.min(
      ...Array.from(this.items.keys()).filter(
        (y) => this.items.get(y)!.size > 0,
      ),
    );
  }

  @computed
  get maxY() {
    return Math.max(
      ...Array.from(this.items.keys()).filter(
        (y) => this.items.get(y)!.size > 0,
      ),
    );
  }

  @computed
  get keys() {
    return Array.from(this.items.keys()).map((y) => ({
      row: y,
      cols: Array.from(this.items.get(y)!.keys()),
    }));
  }
}

const state = new FocusableStore();

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';

export interface FocusablePosition {
  y: number;
  x: number;
}

export interface FocusableProps
  extends ColorProps,
    BoxProps,
    FocusablePosition {
  focusProps?: Partial<ColorProps & BoxProps>;
}

export interface FocusableState {
  focused: boolean;
}

export const inputFocusProps: Partial<ColorProps & BoxProps> = {
  bgMagenta: true,
};
export const btnFocusProps: Partial<ColorProps & BoxProps> = { bgBlue: true };

export class Focusable extends PureComponent<FocusableProps, FocusableState> {
  state: FocusableState = { focused: false };

  componentWillReceiveProps(
    nextProps: Readonly<FocusableProps>,
    nextContext: any,
  ): void {
    if (__DEV__) {
      if (nextProps.x !== this.props.x || nextProps.y !== this.props.y) {
        throw new Error("You should not change focusable item's location");
      }
    }
  }

  componentDidMount(): void {
    state.put(this);
  }

  componentWillUnmount(): void {
    state.drop(this);
  }

  render() {
    const focusProps = this.state.focused ? this.props.focusProps : void 0;
    return (
      <Color {...this.props} {...focusProps}>
        <Box {...this.props} {...focusProps}>
          {React.Children.map(this.props.children, (child) => {
            return React.isValidElement(child)
              ? React.cloneElement<any>(child, {
                  ...child.props,
                  focus: this.state.focused,
                })
              : child;
          })}
        </Box>
      </Color>
    );
  }
}

export class FocusableContainer extends PureComponent {
  private stdin: ReadStream = ANY;
  private setRawMode: F1<boolean> | undefined = void 0;

  private left(): FocusablePosition | undefined {
    if (!state.current) {
      return {
        y: state.minY,
        x: state.xs(state.minY).pop()!,
      };
    }
    const xs = state.xs(state.current.props.y);
    return xs[0] === state.current.props.x
      ? void 0
      : {
          x: xs[xs.indexOf(state.current.props.x) - 1],
          y: state.current.props.y,
        };
  }

  private right(): FocusablePosition | undefined {
    if (!state.current) {
      return {
        y: state.minY,
        x: state.xs(state.minY)[0],
      };
    }
    const xs = state.xs(state.current.props.y);
    return xs[xs.length - 1] === state.current.props.x
      ? void 0
      : {
          x: xs[xs.indexOf(state.current.props.x) + 1],
          y: state.current.props.y,
        };
  }

  private up(): FocusablePosition | undefined {
    if (!state.current) {
      return {
        y: state.maxY,
        x: state.xs(state.maxY)[0],
      };
    }
    const y = seek(state.ys, state.ys.indexOf(state.current.props.y) - 1);
    const xs = state.xs(y);
    if (xs[0] >= state.current.props.x) {
      return { y, x: xs[0] };
    }
    if (xs[xs.length - 1] <= state.current.props.x) {
      return { y, x: xs[xs.length - 1] };
    }
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] === state.current.props.x) {
        return { y, x: xs[i] };
      }
      if (xs[i] > state.current.props.x) {
        return {
          y,
          x:
            xs[i] - state.current.props.x > state.current.props.x - xs[i - 1]
              ? xs[i - 1]
              : xs[i],
        };
      }
    }
    return;
  }

  private down(): FocusablePosition | undefined {
    if (!state.current) {
      return {
        y: state.minY,
        x: state.xs(state.minY)[0],
      };
    }
    const y = seek(state.ys, state.ys.indexOf(state.current.props.y) + 1);
    const xs = state.xs(y);
    if (xs[0] >= state.current.props.x) {
      return { y, x: xs[0] };
    }
    if (xs[xs.length - 1] <= state.current.props.x) {
      return { y, x: xs[xs.length - 1] };
    }
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] === state.current.props.x) {
        return { y, x: xs[i] };
      }
      if (xs[i] > state.current.props.x) {
        return {
          y,
          x:
            xs[i] - state.current.props.x > state.current.props.x - xs[i - 1]
              ? xs[i - 1]
              : xs[i],
        };
      }
    }
    return;
  }

  @action.bound
  private handleInput(data: Buffer) {
    if (state.ys.length === 0) {
      return;
    }
    let pos: FocusablePosition | undefined = undefined;
    switch (data.toString()) {
      case ARROW_UP:
        pos = this.up();
        break;
      case ARROW_DOWN:
        pos = this.down();
        break;
      case ARROW_LEFT:
        pos = this.left();
        break;
      case ARROW_RIGHT:
        pos = this.right();
        break;
      default:
        return;
    }
    if (!pos) {
      return;
    }
    const item = state.get(pos.x, pos.y);
    if (state.current === item) {
      return;
    }
    if (state.current) {
      state.current.setState({ focused: false });
    }
    if (item) {
      item.setState({ focused: true });
    }
    state.current = item;
  }

  componentDidMount(): void {
    runInAction(() => {
      state.container = this;
      this.setRawMode && this.setRawMode(true);
      this.stdin.setMaxListeners(1000);
      this.stdin.on('data', this.handleInput);
    });
  }

  componentWillUnmount(): void {
    runInAction(() => {
      if (state.container === this) {
        state.container = ANY;
      }
      this.setRawMode && this.setRawMode(false);
      this.stdin.removeListener('data', this.handleInput);
    });
  }

  render() {
    return (
      <StdinContext.Consumer>
        {({ stdin, setRawMode }) => {
          this.stdin = this.stdin || stdin;
          this.setRawMode = setRawMode;
          return this.props.children;
        }}
      </StdinContext.Consumer>
    );
  }
}
