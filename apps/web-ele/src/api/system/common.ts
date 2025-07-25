import type { TreeNodeData } from 'element-plus';

import type { LabelValueState } from '#/types/global';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/common';

/** @desc 查询部门树 */
export function listDeptTree(query: { description: string | unknown }) {
  return http.get<TreeNodeData[]>(`${BASE_URL}/tree/dept`, {
    params: query,
  });
}

/** @desc 查询菜单树 */
export function listMenuTree(query: { description: string }) {
  return http.get<TreeNodeData[]>(`${BASE_URL}/tree/menu`, {
    params: query,
  });
}

/** @desc 查询用户列表 */
export function listUserDict(query?: { status: number }) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict/user`, {
    params: query,
  });
}

/** @desc 查询角色列表 */
export function listRoleDict(query?: { name: string; status: number }) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict/role`, {
    params: query,
  });
}

/** @desc 查询字典列表 */
export function listCommonDict(code: string) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict/${code}`);
}

/** @desc 查询系统配置参数 */
export function listSiteOptionDict() {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict/option/site`);
}

/** @desc 上传文件 */
export function uploadFile(data: FormData) {
  return http.post(`${BASE_URL}/file`, data);
}
