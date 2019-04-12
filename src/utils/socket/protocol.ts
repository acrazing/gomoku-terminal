/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-10 23:33:37
 *
 * message:
 *  <kind><id>
 *  <key>
 *  <payload>
 *
 * <kind>: p(ping), q(request), s(response), n(notify)
 * <id>: [0x0000, 0xffff]
 * <key>: anything without \n
 * <payload>: JSON stringify data
 *
 * 如果要扩展, 则在 <key> 后, <payload> 前面添加
 *
 * 如果 kind 为 Response, 则 key 为 cts:sts
 *
 * 确定网络延迟办法:
 *
 * 只能由发送方确定, 接收方无法计算, 这是有理由的, 服务端永远不需要关心客户端的延迟.
 * 1. 客户端在发送 Request 时, 记下本次请求的本地时间戳 ct0
 * 2. 服务端在收到消息时, 记录收到消息时服务端时间戳 st1
 * 3. 服务端在返回消息时, 记录发送消息时服务端时间戳 st2
 * 4. Response 中包含 st1:st2
 * 5. 客户端记录收到消息时本地时间戳: ct3
 *
 * 延迟(HTT) = ((ct3 - ct0) - (st2 - st1)) / 2
 * 钟差(CO, CT + CO = ST) = ((st1 - ct0 - HTT) + (st2 - ct3 + HTT)) / 2
 *                 = (st1 - ct0 + st2 - ct3) / 2
 */

export function latency(ct0: number, st1: number, st2: number, ct3: number) {
  return ct3 - ct0 - (st2 - st1);
}

export function offset(ct0: number, st1: number, st2: number, ct3: number) {
  return (st1 - ct0 + st2 - ct3) / 2;
}

import { enumKeys, enumValues } from 'monofile-utilities/lib/enum';
import { itos, stoi } from '../misc/numberFormat';

export enum MessageKind {
  Request = 'q',
  Response = 's',
  Notify = 'n',
}

export const MessageKindValues = enumValues(MessageKind);
export const MessageKindKeys = enumKeys(MessageKind);
export const MessageKindLabels: {
  [P in MessageKind]: string
} = MessageKindValues.reduce(
  (prev, now, index) => {
    prev[now] = MessageKindKeys[index];
    return prev;
  },
  {} as any,
);

export interface Message<P = any> {
  kind: MessageKind;
  key: string;
  id: string;
  data: P;
  // 接收方收到时本地的时间戳
  st1?: number;
  // 接收方返回时本地的时间戳
  // 与 cts 一起, 仅 Response 类型的消息存在
  st2?: number;
}

export function stringify({ kind, key, id, data, st1, st2 }: Message) {
  if (kind === MessageKind.Response) {
    key = `${itos(st1!)}:${itos(st2!)}`;
  }
  if (data === void 0) {
    return `${kind}${id}\n${key}`;
  }
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  return `${kind}${id}\n${key}\n${data}`;
}

export function parse<T = any>(event: any): Message<T> | null {
  if (typeof event !== 'string') {
    parse.lastError = 'does not support binary message';
    return null;
  }
  const [head, key, payload] = event.split('\n', 3);
  const kind = head.charAt(0) as MessageKind;
  const id = head.substr(1);
  if (MessageKindValues.indexOf(kind) === -1) {
    parse.lastError = `message kind "${kind}" is invalid`;
    return null;
  }
  let data: any;
  if (payload) {
    try {
      data = JSON.parse(payload);
    } catch (e) {
      parse.lastError = `message payload is invalid JSON`;
      return null;
    }
  }
  const msg: Message = { kind, id, key, data };
  if (kind === MessageKind.Response) {
    const [t1, t2] = key.split(':', 2);
    msg.st1 = stoi(t1);
    msg.st2 = stoi(t2);
  }
  return msg;
}

parse.lastError = '';
