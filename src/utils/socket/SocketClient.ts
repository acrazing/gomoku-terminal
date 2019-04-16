/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-09 21:55:09
 */

import { action, observable } from 'mobx';
import { T_SECOND } from 'monofile-utilities/lib/consts';
import { SMap } from 'monofile-utilities/lib/map';
import { TinyEmitter } from 'tiny-emitter';
import { F0, F1, F2 } from '../../types/misc';
import { uid } from '../misc/uid';
import { ResponseTimeout } from '../service/ErrorCode';
import { ServiceError } from '../service/ServiceError';
import {
  latency,
  Message,
  MessageKind,
  offset,
  parse,
  stringify,
} from './protocol';
import { ConnectEvent, ReadyEvent, SocketEvents } from './types';

export interface SocketClientOptions {
  url: string;
  maxReconnectCount?: number;
  connectTimeout?: number;
  reconnectDelay?: number;
  requestTimeout?: number;
}

const EVENT_LIST = Object.keys(SocketEvents).map(
  (k: any) => SocketEvents[k],
) as SocketEvents[];

export type Status =
  | 'disconnected'
  | 'connecting'
  | 'reconnecting'
  | 'connected';

export interface DisconnectEvent {
  error?: Error;
  code?: number;
  reason?: string;
  status?: Status;
}

export class SocketClient extends TinyEmitter {
  readonly url: string;
  readonly maxReconnectCount: number;
  readonly connectTimeout: number;
  readonly reconnectDelay: number;
  readonly requestTimeout: number;

  constructor({
    url,
    maxReconnectCount = 7,
    connectTimeout = T_SECOND,
    reconnectDelay = 3 * T_SECOND,
    requestTimeout = T_SECOND,
  }: SocketClientOptions) {
    super();
    this.url = url;
    this.maxReconnectCount = maxReconnectCount;
    this.connectTimeout = connectTimeout;
    this.reconnectDelay = reconnectDelay;
    this.requestTimeout = requestTimeout;
  }

  private ws: WebSocket | null = null;
  private readyTimer: number | null = null;
  private retryLimit = 0;
  private reconnectTimer: any = null;
  @observable status: Status = 'disconnected';
  @observable latency = 1024;
  @observable clockOffset = 0;

  private destroy() {
    this.readyTimer && clearTimeout(this.readyTimer);
    this.readyTimer = null;
    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    const ws = this.ws;
    this.ws = null;
    if (!ws) {
      return;
    }
    ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
    try {
      ws.close();
    } catch {}
  }

  @action
  private open(reason?: any, directly = false) {
    this.latency = 1024;
    if (this.retryLimit <= 0) {
      this.disconnect();
      return;
    }
    if (this.retryLimit !== this.maxReconnectCount && !directly) {
      this.reconnectTimer = setTimeout(
        () => this.open(reason, true),
        this.reconnectDelay,
      );
      return;
    }
    if (this.status !== 'connecting' && this.status !== 'reconnecting') {
      return;
    }
    const event: ConnectEvent = {
      count: this.maxReconnectCount - this.retryLimit + 1,
      total: this.maxReconnectCount,
      delay: this.reconnectDelay,
      reason: reason,
    };
    const key =
      this.status === 'reconnecting'
        ? SocketEvents.Reconnecting
        : SocketEvents.Connecting;
    this.emit(key, event);
    this.retryLimit -= 1;
    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      this.open(e + '');
      return;
    }
    if (this.connectTimeout) {
      this.readyTimer = setTimeout(() => {
        this.destroy();
        this.open('ready timeout');
      }, this.connectTimeout) as any;
    }
    this.ws.onerror = (ev) => this.reconnect({ type: ev.type });
    this.ws.onclose = (ev) => {
      if (ev.reason.substr(0, 4) === '[63]') {
        this.disconnect({ code: ev.code, reason: ev.reason.substr(4) });
      } else {
        this.reconnect({ code: ev.code, reason: ev.reason });
      }
    };
    this.ws.onmessage = (event) => {
      const message = parse(event.data);
      if (message && message.key === SocketEvents.Ready) {
        this.readyTimer && clearTimeout(this.readyTimer);
        this.readyTimer = null;
        this.status = 'connected';
        this.emit(SocketEvents.Connected, message.data);
        this.ws!.onmessage = ({ data }) => this.handleMessage(data);
      }
    };
  }

  private reconnect(ev: any) {
    this.destroy();
    if (this.status === 'connected') {
      this.status = 'reconnecting';
      this.retryLimit = this.maxReconnectCount;
      this.open(ev);
    } else {
      this.open(ev);
    }
  }

  connect() {
    if (this.status !== 'disconnected') {
      return;
    }
    this.status = 'connecting';
    this.retryLimit = this.maxReconnectCount;
    this.open('user ask connect');
  }

  @action
  disconnect(event: DisconnectEvent = {}) {
    event.status = this.status;
    this.status = 'disconnected';
    this.latency = 1024;
    this.destroy();
    this.retryLimit = 0;
    this.emit(SocketEvents.Disconnected, event);
  }

  is(status: Status) {
    return this.status === status;
  }

  readonly uid = uid();

  private reqs: SMap<(msg: Message) => void> = {};

  private handleMessage(data: any) {
    const message = parse(data);
    this.emit(SocketEvents.Message, message, data);
    if (!message) {
      return;
    }
    switch (message.kind) {
      case MessageKind.Notify:
        this.emit(message.key, message.data, data);
        break;
      case MessageKind.Request:
        const st1 = Date.now();
        this.emit(message.key, message.data, (r: any) =>
          this.ws!.send(
            stringify({
              kind: MessageKind.Response,
              key: message.key,
              id: message.id,
              data: r,
              st1,
              st2: Date.now(),
            }),
          ),
        );
        break;
      case MessageKind.Response:
        this.reqs[message.id] && this.reqs[message.id](message);
        break;
    }
  }

  request<Q, S = any>(key: string, data?: Q, id = this.uid()): Promise<S> {
    return new Promise<S>((resolve, reject) => {
      const ct0 = Date.now();
      const h: any = setTimeout(() => {
        delete this.reqs[id];
        reject(new ServiceError(ResponseTimeout));
      }, this.connectTimeout);
      this.reqs[id] = ({ data, st2, st1 }: Message) => {
        delete this.reqs[id];
        clearTimeout(h);
        const ct3 = Date.now();
        this.latency = latency(ct0, st1!, st2!, ct3);
        this.clockOffset = offset(ct0, st1!, st2!, ct3);
        if (data && data.code && data.message) {
          reject(new ServiceError(data.code, data.message));
        }
        resolve(data);
      };
      this.ws!.send(
        stringify({
          kind: MessageKind.Request,
          id: id,
          key: key,
          data: data,
        }),
      );
    });
  }

  notify<Q>(key: string, data: Q, id = this.uid()) {
    this.ws!.send(stringify({ kind: MessageKind.Notify, key, data, id }));
  }

  use<Q, S>(
    key: string,
    callback: (data: Q, response?: (data: S) => void) => void,
    once = false,
  ) {
    if (__DEV__) {
      if (key.indexOf('socket/') === 0) {
        throw new Error('Please do not use socket/ as key, it is private');
      }
    }
    if (once) {
      super.once(key, callback);
    } else {
      super.on(key, callback);
    }
  }

  emit(
    key: SocketEvents.Connecting | SocketEvents.Reconnecting,
    event: ConnectEvent,
  ): this;
  emit(key: SocketEvents.Connected, event: ReadyEvent): this;
  emit(key: SocketEvents.Disconnected, event: DisconnectEvent | void): this;
  emit(
    key: SocketEvents.Message,
    message: Message | void,
    raw: string | Uint8Array,
  ): this;
  emit(action: string, data: any, response: F1<any>): this;
  emit(key: string, ...args: any[]) {
    return super.emit(key, ...args);
  }

  on(
    key: SocketEvents.Connecting,
    callback: F1<ConnectEvent>,
    once?: boolean,
  ): this;
  on(
    key: SocketEvents.Reconnecting,
    callback: F1<ConnectEvent>,
    once?: boolean,
  ): this;
  on(
    key: SocketEvents.Connected,
    callback: F1<ReadyEvent>,
    once?: boolean,
  ): this;
  on(key: SocketEvents.Disconnected, callback: F0, once?: boolean): this;
  on(
    key: SocketEvents.Message,
    callback: F2<Message | void, string | Uint8Array>,
    once?: boolean,
  ): this;
  on(key: SocketEvents, callback: Function, once = false) {
    if (__DEV__) {
      if (EVENT_LIST.indexOf(key) === -1) {
        throw new Error('Please use use(...) to register message callback');
      }
    }
    if (once) {
      super.once(key, callback);
    } else {
      super.on(key, callback);
    }
    return this;
  }

  once(): never {
    throw new Error('Please use on(key, callback, once) to register');
  }
}
