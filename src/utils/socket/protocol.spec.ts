/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-03-30 17:33:45
 */

import { Message, MessageKind, parse, stringify } from './protocol';

describe('socket protocol', () => {
  it('should parse/stringify as expected', () => {
    const cases: [string, Message | null][] = [
      [
        'q1\nsession.echo',
        {
          key: 'session.echo',
          data: void 0,
          id: '1',
          kind: MessageKind.Request,
        },
      ],
      [
        's1\n1:1\n123',
        {
          key: '1:1',
          data: 123,
          id: '1',
          kind: MessageKind.Response,
          st1: 1,
          st2: 1,
        },
      ],
      [
        'n1\nsession.echo',
        {
          key: 'session.echo',
          data: void 0,
          id: '1',
          kind: MessageKind.Notify,
        },
      ],
      ['n1\nsession.echo\nerror', null],
      ['m1\nsession.echo', null],
    ];
    for (const [str, msg] of cases) {
      expect(parse(str)).toEqual(msg);
      if (msg !== null) {
        expect(stringify(msg)).toBe(str);
      }
    }
  });
});
