import type { BaseEntity, PageQuery, PageRes } from '#/types/api';
import type { LabelValueState } from '#/types/global';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/tenant/package';

/** 租户套餐 */
export interface TenantPackageResp extends BaseEntity {
  id: string;
  name: string;
  sort: number;
  menuCheckStrictly: string;
  description: string;
  status: number;
  menuIds: [];
  disabled: boolean;
}

export interface TenantPackageQuery {
  name?: string | undefined;
  status?: string;
  description?: string;
  sort: Array<string> | string;
}

export interface TenantPackagePageQuery extends PageQuery, TenantPackageQuery {}

/** @desc 查询租户套餐列表 */
export function listTenantPackage(query: TenantPackagePageQuery) {
  return http.get<PageRes<TenantPackageResp[]>>(BASE_URL, {
    params: query,
  });
}

/** @desc 查询租户套餐详情 */
export function getTenantPackage(id: string) {
  return http.get<TenantPackageResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增租户套餐 */
export function addTenantPackage(data: any) {
  return http.post(BASE_URL, data);
}

/** @desc 修改租户套餐 */
export function updateTenantPackage(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除租户套餐 */
export function deleteTenantPackage(id: string) {
  return http.delete(`${BASE_URL}/${id}`);
}

/** @desc 导出租户套餐 */
export function exportPackage(query: TenantPackagePageQuery) {
  return http.download(`${BASE_URL}/export`, {
    params: query,
  });
}

/** @desc 查询所有套餐 */
export function listAllTenantPackage() {
  return http.get<TenantPackageResp[]>(`${BASE_URL}/list`);
}

/** @desc 查询套餐菜单 */
export function listTenantPackageMenu() {
  return http.get<any>(`${BASE_URL}/menu/tree`, {
    params: { isSample: false },
  });
}

/** @desc 查询租户套餐字典 */
export function listTenantPackageDict(query?: {
  description: string;
  status: number;
}) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, {
    params: query,
  });
}
