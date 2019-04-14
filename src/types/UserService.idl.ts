/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-18 20:17:23
 *
 * XxxService.idl.ts
 *
 * 1. 声明 service 的入参和返回值类型列表, XxxActionInput, XxxActionOutput
 * 2. 声明所有的方法到 XxxServiceIdl 接口中, action(input: XxxActionInput): XxxActionOutput
 * 3. 声明模块名称: SERVICE_NAME_XXX: Xxx = Xxx
 *
 * 似乎与 grpc 中的 service 的 proto 文件类似.
 */

import { Omit } from 'monofile-utilities/lib/types';
import {
  BaseDocument,
  defineLabels,
  ListResponse,
  PaginationInput,
} from './messages';

export interface UserDocument extends BaseDocument {
  username: string;
  nickname: string | null;
  password: string;
  mobile: string | null; // 包含区号
  email: string | null;
  isAnonymous?: false;
}

export const UserLabels = defineLabels<UserDocument>({
  username: '用户名',
  nickname: '昵称',
  password: '密码',
  mobile: '手机号',
  email: '邮箱',
  isAnonymous: '匿名用户',
});

export type PublicUserDocument = Omit<UserDocument, 'password'>;

export interface SessionDocument extends BaseDocument {
  token: string;
  userId: number | null; // 为空表示由匿名用户创建
  ip: string;
  userAgent: string;
  previousSessionId: number | null;
  referer: string;
  userVisible: boolean;
  expiresAt: Date;
}

export const SessionLabels = defineLabels<SessionDocument>({
  token: 'token',
  userId: '用户 id',
  ip: 'IP',
  userAgent: '浏览器',
  previousSessionId: '上游会话 id',
  referer: '来源页面',
  userVisible: '用户可见',
  expiresAt: '过期时间',
  maxAge: '过期时间',
});

export interface AnonymousUser {
  id: number; // < 0, equals to session id is opposite number
  isAnonymous: true;
}

export type UserCreateInput = Pick<
  UserDocument,
  'username' | 'password' | 'nickname'
> &
  Pick<Partial<UserDocument>, 'email' | 'mobile'>;
export type UserCreateOutput = PublicUserDocument;

export type UserUpdateInput = Pick<
  Partial<UserDocument>,
  'username' | 'mobile' | 'email' | 'password' | 'nickname'
> &
  Pick<UserDocument, 'id'>;
export type UserUpdateOutput = PublicUserDocument;

export type UserGetInput = Pick<
  Partial<UserDocument>,
  'id' | 'username' | 'email' | 'mobile'
> & {
  password: string | null;
};
export type UserGetOutput = PublicUserDocument | AnonymousUser;

export type UserListInput = { ids?: number[] } & PaginationInput;
export type UserListOutput = ListResponse<PublicUserDocument>;

export type UserCreateSessionInput = {
  userId: number | null;
  userVisible: boolean;
  maxAge: number; // -> second
};
export type UserCreateSessionOutput = Pick<SessionDocument, 'id' | 'token'>;

export interface UserGetByTokenInput {
  token: string;
  renewToken: 'auto' | 'always' | 'never';
  maxAge: number;
}

export interface UserGetByTokenOutput {
  user: PublicUserDocument | AnonymousUser;
  id: number;
  tokenRenewed: boolean;
}

export interface UserExpireSessionInput {
  id: number;
  userId: number;
}

export interface UserListSessionInput extends PaginationInput {
  userId?: number | null;
  userVisible?: boolean;
  withUser?: boolean; // 返回用户表, 暂时不处理
  expiresAfter?: number; // second
  expireBefore?: number; // second
}

export type UserListSessionOutput = ListResponse<
  Omit<SessionDocument, 'token'>
>;

export interface AccessTokenDocument extends BaseDocument {
  token: string;
  userId: number;
  resource: string;
  expiresAt: Date | null;
}

export const AccessTokenLabels = defineLabels<AccessTokenDocument>({
  token: '凭证',
  userId: '用户ID',
  resource: '允许访问的资源',
  expiresAt: '过期时间',
  maxAge: '有效期',
});

export type UserCreateAccessTokenInput = Pick<
  AccessTokenDocument,
  'userId' | 'resource'
> & {
  maxAge: number;
};
export type UserCreateAccessTokenOutput = AccessTokenDocument;

export type UserGetAccessTokenInput = {
  token: string;
  resource: string;
  withExpired: boolean;
};
export type UserGetAccessTokenOutput = AccessTokenDocument;

export interface UserServiceIdl {
  /**
   * 创建用户, username, email, mobile 中至少有一项不为空
   * @param input
   */
  create(input: UserCreateInput): UserCreateOutput;

  /**
   * 更新用户信息, 可以修改的有 username, mobile, email, password
   * @param input
   */
  update(input: UserUpdateInput): UserUpdateOutput;

  /**
   * 查找用户, 可以通过 id, username, email, mobile 来查找
   * 如果 password 不为 null, 则会检查密码
   * @param input
   */
  get(input: UserGetInput): UserGetOutput;

  /**
   * 获取用户列表
   * @param input
   */
  list(input: UserListInput): UserListOutput;

  /**
   * 创建会话, 如果 userId 为空, 则创建匿名会话, 否则与 userId 绑定
   * @param input
   */
  createSession(input: UserCreateSessionInput): UserCreateSessionOutput;

  /**
   * 通过 session token 获取用户, 并自动延长过期时间
   * @param input
   */
  getByToken(input: UserGetByTokenInput): UserGetByTokenOutput;

  /**
   * 强制使会话失效(注销登录)
   * @param input
   */
  expireSession(input: UserExpireSessionInput): void;

  /**
   * 查询用户的未过期的 session 列表
   * @param input
   */
  listSession(input: UserListSessionInput): UserListSessionOutput;

  /**
   * 给一个用户创建一个 access token
   * @param input
   */
  createAccessToken(
    input: UserCreateAccessTokenInput,
  ): UserCreateAccessTokenOutput;

  /**
   * 获取 access token
   * @param input
   */
  getAccessToken(input: UserGetAccessTokenInput): UserGetAccessTokenOutput;
}
