/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-14 18:05:18
 */

import { Box, BoxProps, Color, ColorProps } from 'ink';
import * as React from 'react';
import { PureComponent } from 'react';

export interface FocusableProps extends ColorProps, BoxProps {
  focus: boolean;
}

export class Focusable extends PureComponent<FocusableProps> {
  render() {
    return (
      <Color {...this.props}>
        <Box {...this.props}>{this.props.children}</Box>
      </Color>
    );
  }
}

export class FocusableContainer extends PureComponent {}
