import type * as T from './type';

import type { PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

export type * from './type';

const BASE_URL = '/schedule/log';

/** @desc 查询任务日志列表 */
export function listJobLog(query: T.JobLogPageQuery) {
  return http.get<PageRes<T.JobLogResp[]>>(`${BASE_URL}`, {
    params: query,
  });
}

/** @desc 查询任务日志详情 */
export function getJobLogDetail(id: number) {
  return http.get<boolean>(`${BASE_URL}/${id}`);
}

/** @desc 停止任务 */
export function stopJob(id: number) {
  return http.post(`${BASE_URL}/stop/${id}`);
}

/** @desc 重试任务 */
export function retryJob(id: number) {
  return http.post(`${BASE_URL}/retry/${id}`);
}
