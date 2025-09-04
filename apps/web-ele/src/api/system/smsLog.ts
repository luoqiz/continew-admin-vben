import type * as T from './type';

import type { PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/sms/log';

/** @desc 查询短信日志列表 */
export function listSmsLog(query: T.SmsLogPageQuery) {
  return http.get<PageRes<T.SmsLogResp[]>>(`${BASE_URL}`, { params: query });
}

/** @desc 查询短信日志详情 */
export function getSmsLog(id: string) {
  return http.get<T.SmsLogResp>(`${BASE_URL}/${id}`);
}

/** @desc 删除短信日志 */
export function deleteSmsLog(id: string) {
  return http.delete(`${BASE_URL}`, { data: { ids: [id] } });
}

/** @desc 导出短信日志 */
export function exportSmsLog(query: T.SmsLogQuery) {
  return http.download(`${BASE_URL}/export`, { params: query });
}
