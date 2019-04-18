/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-02-09 19:43:53
 */

export type F0<R = void> = () => R;
export type F1<A1, R = void> = (arg1: A1) => R;
export type F2<A1, A2, R = void> = (arg1: A1, arg2: A2) => R;
export type F3<A1, A2, A3, R = void> = (arg1: A1, arg2: A2, arg3: A3) => R;
export type F4<A1, A2, A3, A4, R = void> = (
  arg1: A1,
  arg2: A2,
  arg3: A3,
  arg4: A4,
) => R;

export type Descriptors<T extends object> = {
  [P in keyof T]: TypedPropertyDescriptor<T[P]>
};

export type StateMachineNode<N extends string> = { [Next in N]?: 1 };

export type StateMachine<N extends string> = {
  [Node in N]: StateMachineNode<N>
};

export type FP<P> = P extends Promise<infer U> ? U : P;

export type PickKeys<T, V> = Exclude<
  { [P in keyof T]: T[P] extends V ? P : never }[keyof T],
  never
>;
