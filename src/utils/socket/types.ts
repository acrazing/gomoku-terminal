/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-03-26 11:18:57
 */

import { IncomingHttpHeaders } from 'http';

export enum SocketEvents {
  // 服务器发给客户端
  Ready = 'socket/ready',
  // 第一次连接, 包括重试
  Connecting = 'socket/connecting',
  // 连接断开后重连
  Reconnecting = 'socket/reconnecting',
  // 连接成功
  Connected = 'socket/connected',
  // 断开连接
  Disconnected = 'socket/disconnected',
  // 收到消息
  Message = 'socket/message',
  // 发送消息
  Send = 'socket/send',
}

export interface ConnectEvent {
  count: number;
  total: number;
  delay: number;
  reason: any;
}

export interface ReadyEvent {
  id: string;
  userId: number;
}

export interface SocketUserDocument {
  id: number;
  offline: boolean;
}

export interface ClientDocument {
  id: string;
  ip: string;
  url: string;
  headers: IncomingHttpHeaders;
  userId: number;
}
