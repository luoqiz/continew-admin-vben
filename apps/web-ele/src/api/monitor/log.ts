import type { PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/log';

/** 系统日志类型 */
export interface LogResp {
  id: string;
  description: string;
  module: string;
  timeTaken: number;
  ip: string;
  address: string;
  browser: string;
  os: string;
  status: number;
  errorMsg: string;
  createUserString: string;
  createTime: string;
}
export interface LogDetailResp extends LogResp {
  traceId: string;
  requestUrl: string;
  requestMethod: string;
  requestHeaders: string;
  requestBody: string;
  statusCode: number;
  responseHeaders: string;
  responseBody: string;
}
export interface LogQuery {
  description?: string;
  module?: string;
  ip?: string;
  createUserString?: string;
  createTime: Array<string>;
  status?: number;
  sort: Array<string>;
}
export interface LogPageQuery extends LogQuery, PageQuery {}

/** @desc 查询日志列表 */
export function listLog(query: LogPageQuery) {
  return http.get<PageRes<LogResp[]>>(`${BASE_URL}`, { params: query });
}

/** @desc 查询日志详情 */
export function getLog(id: string) {
  return http.get<LogDetailResp>(`${BASE_URL}/${id}`);
}

/** @desc 导出登录日志 */
export function exportLoginLog(query: LogQuery) {
  return http.download<any>(`${BASE_URL}/export/login`, { params: query });
}

/** @desc 导出操作日志 */
export function exportOperationLog(query: LogQuery) {
  return http.download<any>(`${BASE_URL}/export/operation`, { params: query });
}
