/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-01-24 22:00:51
 */

import { Enum } from 'monofile-utilities/lib/enum';
import { Omit } from 'monofile-utilities/lib/types';

export interface BaseDocument {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type Labels<T> = { readonly [P in keyof T]-?: string };

export type CommonInput = BaseDocument & PaginationInput & IdsInput;

export const CommonLabels: Labels<CommonInput> = {
  id: 'ID',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  ids: 'ID 列表',
  page: '页数',
  pageSize: '每页数量',
  orderBy: '排序方式',
};

/**
 * a row status machine
 * draft -> approving -> accepted -> disabled -> accepted
 *                  \                        \-> draft
 *                   \-> rejected -> draft
 */
export const EnableStatus = Enum({
  DRAFT: '草稿',
  APPROVING: '审核中',
  ACCEPTED: '已上线',
  REJECTED: '驳回',
  DISABLED: '禁用',
});

export type EnableStatus = Enum<typeof EnableStatus>;

export function defineLabels<T extends BaseDocument>(
  input: { [P in keyof Omit<T, keyof BaseDocument>]: string } &
    { [P in keyof BaseDocument]?: string } & {
      [P: string]: string;
    },
): Labels<T> {
  return {
    ...CommonLabels,
    ...input,
  } as any;
}

export interface Empty {}

export interface IdInput {
  id: number;
}

export interface IdsInput {
  ids?: number[];
}

export interface PaginationOutput {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface PaginationInput {
  pageSize?: number;
  page?: number;
  orderBy?: string;
}

export interface ListResponse<T> {
  pagination: PaginationOutput;
  data: T[];
}
