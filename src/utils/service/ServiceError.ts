/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-18 20:46:41
 */

export interface ErrorCode {
  value: number;
  message: string;
}

let used: string[];

export function code(value: number, message: string): ErrorCode {
  if (__DEV__) {
    used = used || [];
    const prefix = (value + '').substr(0, 3);
    if (used.indexOf(prefix) === -1) {
      used.push(prefix);
    } else if (used[used.length - 1] !== prefix) {
      throw new Error(`error prefix ${prefix} is intermittent`);
    }
    if (used.indexOf(value + '') !== -1) {
      throw new Error(`error code ${value} is used already`);
    }
    used.unshift(value + '');
  }
  return { value, message };
}

export function from(e: any, code: number | ErrorCode) {
  if (e instanceof ServiceError) {
    return e;
  }
  return new ServiceError(
    code as any,
    e instanceof Error ? e.message : e ? e + '' : 'Server Internal Error',
  );
}

export class ServiceError extends Error {
  readonly name = 'ServiceError';
  readonly source!: string; // module name
  readonly uuid!: string;
  readonly code: number;
  readonly message: string;
  readonly data: any;

  constructor(code: number, message: string, data?: any);
  constructor(code: ErrorCode, message?: any, data?: any);
  constructor(code: number | ErrorCode, message?: string, data?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    if (typeof code === 'number') {
      this.code = code;
      this.message = message || 'Unknown';
      this.data = data;
    } else {
      this.code = code.value;
      this.message = typeof message === 'string' ? message : code.message;
      this.data = typeof message === 'string' ? data : message;
    }
  }

  set<K extends keyof this>(key: K, value: this[K]) {
    this[key] = value;
    return this;
  }

  toJSON() {
    return {
      source: this.source,
      uuid: this.uuid,
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }

  is(code: ErrorCode | number) {
    if (typeof code === 'number') {
      return code === this.code;
    }
    return code.value === this.code;
  }

  toString() {
    return `[${this.source || 'Unknown'}:${this.code}]: ${this.message}`;
  }
}
