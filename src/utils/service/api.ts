/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-04-14 17:22:40
 */

import Axios from 'axios';
import { PublicUserDocument, UserGetOutput } from '../../types/UserService.idl';
import { ServiceError } from './ServiceError';

const config = {
  host: '',
  token: '',
};

export function API<O>(api: string): () => Promise<O>;
export function API<I, O>(api: string): (input: I) => Promise<O>;
export function API(api: string) {
  return (data: any) =>
    Axios.post(`${config.host}/api${api}`, data, {
      validateStatus: () => true,
      headers: {
        Authorization: config.token,
      },
    }).then(
      (r) => {
        if (r.status > 299) {
          throw new ServiceError(r.data.code, r.data.message);
        }
        return r.data;
      },
      () => {
        throw new ServiceError(504, '网络繁忙, 请稍候再试');
      },
    );
}

API.config = (options: Partial<typeof config>) => {
  Object.assign(config, options);
};

export interface UserLoginRequest {
  kind: 'username' | 'email' | 'mobile';
  username: string;
  email: string;
  mobile: string;
  password: string;
  withToken?: boolean;
  anonymous: boolean;
}

export type UserLoginResponse = {
  user: UserGetOutput;
  token: string;
};

export const userLogin = API<UserLoginRequest, UserLoginResponse>(
  '/user.login',
);

export interface UserGetRequest {
  id?: string;
}

export type UserGetResponse = UserGetOutput;

export const userGet = API<UserGetRequest, UserGetResponse>('/user.get');

export interface UserRegisterRequest {
  username: string;
  mobile: string;
  email: string;
  password: string;
  nickname: string;
}

export type UserRegisterResponse = PublicUserDocument;

export const userRegister = API<UserRegisterRequest, UserRegisterResponse>(
  '/user.register',
);
