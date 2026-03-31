import type * as T from './type';

import type { PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/sms/config';

/** @desc 查询短信配置列表 */
export function listSmsConfig(query: T.SmsConfigPageQuery) {
  return http.get<PageRes<T.SmsConfigResp[]>>(`${BASE_URL}`, { params: query });
}

/** @desc 查询短信配置详情 */
export function getSmsConfig(id: string) {
  return http.get<T.SmsConfigResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增短信配置 */
export function addSmsConfig(data: any) {
  return http.post(`${BASE_URL}`, { data });
}

/** @desc 修改短信配置 */
export function updateSmsConfig(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, { data });
}

/** @desc 删除短信配置 */
export function deleteSmsConfig(id: string) {
  return http.delete(`${BASE_URL}`, { data: { ids: [id] } });
}

/** @desc 设置默认配置 */
export function setDefaultSmsConfig(id: string) {
  return http.put(`${BASE_URL}/${id}/default`);
}
