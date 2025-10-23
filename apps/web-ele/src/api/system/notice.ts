import type { BaseEntity, PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/notice';

export interface NoticeResp extends BaseEntity {
  /** ID */
  id: string;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 分类 */
  type: string;
  /** 通知范围（1：所有人；2：指定用户） */
  noticeScope: string;
  /** 通知用户 */
  noticeUsers: string;
  /** 通知方式（1：系统消息；2：登录弹窗） */
  noticeMethods: string;
  /** 是否定时 */
  isTiming: string;
  /** 发布时间 */
  publishTime: string;
  /** 是否置顶 */
  isTop: string;
  /** 状态（1：草稿；2：待发布；3：已发布） */
  status: number;
  /** 创建人 */
  createUser: string;
  /** 创建时间 */
  createTime: string;
}

export interface NoticeDetailResp extends BaseEntity {
  id: string;
  title: string;
  content: string;
  type: string;
  noticeScope: string;
  noticeUsers: string;
  noticeMethods: string;
  isTiming: string;
  publishTime: string;
  isTop: string;
  status: number;
  createUser: string;
  createTime: string;
  updateUser: string;
  updateTime: string;
  tenantId: string;
  createUserString: string;
  updateUserString: string;
}

export interface NoticeQuery {
  title: string | undefined;
  type: string | undefined;
  publishTime: string | undefined;
  isTop: string | undefined;
  status: string | undefined;
  sort: Array<string> | string;
}

export interface NoticePageQuery extends NoticeQuery, PageQuery {}

/** @desc 查询公告列表 */
export function listNotice(query: NoticePageQuery) {
  return http.get<PageRes<NoticeResp[]>>(BASE_URL, {
    params: query,
  });
}

/** @desc 查询公告详情 */
export function getNotice(id: string) {
  return http.get<NoticeDetailResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增公告 */
export function addNotice(data: any) {
  return http.post(BASE_URL, data);
}

/** @desc 修改公告 */
export function updateNotice(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除公告 */
export function deleteNotice(id: string) {
  return http.delete(BASE_URL, { data: { ids: [id] } });
}

/** @desc 导出公告 */
export function exportNotice(query: NoticeQuery) {
  return http.download(`${BASE_URL}/export`, {
    params: query,
  });
}
