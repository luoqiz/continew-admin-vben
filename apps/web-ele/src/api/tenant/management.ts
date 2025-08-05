import type { PageQuery, PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/tenant/management';

/** 租户 */
export interface TenantResp {
  id: string;
  name: string;
  code: string;
  domain: string;
  expireTime: string;
  description: number;
  status: number;
  packageId: string;
  createUser: string;
  createTime: string;
  updateUser: string;
  updateTime: string;
  createUserString: string;
  updateUserString: string;
  adminUsername: string;
  packageName: string;
}
export interface TenantQuery {
  description?: string;
  packageId?: string;
  status?: string;
  sort: Array<string>;
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
