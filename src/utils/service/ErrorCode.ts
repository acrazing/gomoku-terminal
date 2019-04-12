/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-18 20:55:12
 */

import { code } from './ServiceError';

export const UnknownError = code(100001, 'Unknown Error');
export const NetworkError = code(100002, 'Network Error');
export const ParamError = code(100003, 'Parameter Error');
export const StatusError = code(100004, 'Status Error');
export const ResponseTimeout = code(100005, 'Timeout');
