import type { BaseEntity, PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/tenant/management';

export interface TenantResp extends BaseEntity {
  /** ID */
  id: string;
  /** 名称 */
  name: string;
  /** 编码 */
  code: string;
  /** 域名 */
  domain: string;
  /** 过期时间 */
  expireTime: string;
  /** 描述 */
  description: string;
  /** 状态（1：启用；2：禁用） */
  status: number;
  /** 管理员用户 */
  adminUser: string;
  /** 管理员用户名 */
  adminUsername: string;
  /** 管理员密码 */
  adminPassword: string;
  /** 套餐ID */
  packageId: string;
}

export interface TenantDetailResp extends BaseEntity {
  id: string;
  name: string;
  code: string;
  domain: string;
  expireTime: string;
  description: string;
  status: string;
  adminUser: string;
  adminUsername: string;
  adminPassword: string;
  packageId: string;
}

export interface TenantQuery {
  name: string | undefined;
  code: string | undefined;
  domain: string | undefined;
  packageId: string | undefined;
  sort: Array<string> | string;
}

export interface TenantPageQuery extends PageQuery, TenantQuery {}

/** @desc 查询租户列表 */
export function listTenant(query: TenantPageQuery) {
  return http.get<PageRes<TenantResp[]>>(`${BASE_URL}`, { params: query });
}

/** @desc 查询租户详情 */
export function getTenant(id: string) {
  return http.get<TenantResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增租户 */
export function addTenant(data: any) {
  return http.post(`${BASE_URL}`, data);
}

/** @desc 修改租户 */
export function updateTenant(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除租户 */
export function deleteTenant(id: string) {
  return http.delete(`${BASE_URL}/${id}`);
}

/** @desc 修改租户管理员密码 */
export const updateTenantAdminUserPwd = (data: any, id: string) => {
  return http.put(`${BASE_URL}/${id}/admin/pwd`, data);
};

/** @desc 导出租户 */
export function exportTenant(query: TenantQuery) {
  return http.download(`${BASE_URL}/export`, {
    params: query,
  });
}
