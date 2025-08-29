import type { PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/monitor/online';
/** 在线用户类型 */
export interface OnlineUserResp {
  id: string;
  ip: string;
  address: string;
  browser: string;
  os: string;
  clientType: string;
  createTime: string;
  nickname?: string;
  token?: string;
}
export interface OnlineUserQuery {
  nickname?: string;
  loginTime?: string;
  sort: Array<string>;
}
export interface OnlineUserPageQuery extends OnlineUserQuery, PageQuery {}

/** @desc 查询在线用户列表 */
export function listOnlineUser(query: OnlineUserPageQuery) {
  return http.get<PageRes<OnlineUserResp[]>>(`${BASE_URL}`, {
    params: query,
  });
}

/** @desc 强退在线用户 */
export function kickout(token: string) {
  return http.delete(`${BASE_URL}/${token}`);
}
