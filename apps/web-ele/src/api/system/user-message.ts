import type * as T from './type';

import type { PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

export type * from './type';

const BASE_URL = '/user/message';

/** @desc 查询未读消息数量 */
export function getUnreadMessageCount() {
  return http.get(`${BASE_URL}/unread`);
}

/** @desc 查询消息列表 */
export function listMessage(query: T.MessagePageQuery) {
  return http.get<PageRes<T.MessageResp[]>>(`${BASE_URL}`, {
    params: query,
  });
}

/** @desc 获取用户消息详情 */
export function getUserMessage(id: number | string) {
  return http.get<T.MessageResp>(`${BASE_URL}/${id}`);
}

/** @desc 删除消息 */
export function deleteMessage(ids: Array<string>) {
  return http.delete(`${BASE_URL}`, { data: { ids } });
}

/** @desc 标记已读 */
export function readMessage(ids: Array<string>) {
  return http.patch(`${BASE_URL}/read`, { data: { ids } });
}

/** @desc 全部已读 */
export function readAllMessage() {
  return http.patch(`${BASE_URL}/readAll`);
}

/** @desc 查询未读公告数量 */
export function getUnreadNoticeCount() {
  return http.get(`${BASE_URL}/notice/unread`);
}

/** @desc 查询未读公告 ID 列表 */
export function getUnreadNoticeIds(method: string) {
  return http.get<number[]>(`${BASE_URL}/notice/unread/${method}`);
}

/** @desc 分页查询用户公告 */
export function listUserNotice(query: T.NoticePageQuery) {
  return http.get<PageRes<T.NoticeResp[]>>(`${BASE_URL}/notice`, {
    params: query,
  });
}

/** @desc 获取用户公告详情 */
export function getUserNotice(id: string) {
  return http.get<T.NoticeResp>(`${BASE_URL}/notice/${id}`);
}
