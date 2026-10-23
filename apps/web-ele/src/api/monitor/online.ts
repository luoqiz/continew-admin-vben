import type { PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/monitor/online';
/** 在线用户类型 */
export interface OnlineUserResp {
  id: string;
  sessionId: string;
  username: string;
  nickname: string;
  clientType: string;
  clientId: string;
  ip: string;
  address: string;
  browser: string;
  os: string;
  loginTime: string;
  lastRefreshTime: string;
  /** 最后活跃时间（只统计业务请求，不含 WebSocket 消息与令牌刷新） */
  lastActiveTime: string;
  /** 会话到期时间（绝对有效期） */
  sessionExpireTime: string;
  /** 预计因闲置失效的时间，未配置闲置失效时为 null */
  idleExpireTime: null | string;
  /** 是否已闲置超时（服务端判定，不要用本地时钟比较） */
  idleExpired: boolean;
  /** 是否在线 */
  online: boolean;
  /** 最后活跃时间是否精确，false 表示按最近刷新时间推算 */
  activeTimeExact: boolean;
}
export interface OnlineUserQuery {
  nickname?: string;
  loginTime?: string;
  /** 是否在线，不传表示不过滤 */
  online?: boolean;
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
export function kickout(sessionId: string) {
  return http.delete(`${BASE_URL}/${sessionId}`);
}
