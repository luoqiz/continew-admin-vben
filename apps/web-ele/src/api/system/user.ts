import type { BaseEntity, PageQuery, PageRes } from '#/types/api';
import type { Gender, LabelValueState } from '#/types/global';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/user';

export interface UserResp extends BaseEntity {
  /** ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 密码 */
  password: string;
  /** 性别（0：未知；1：男；2：女） */
  gender: Gender;
  /** 邮箱 */
  email: string;
  /** 手机号码 */
  phone: string;
  /** 头像 */
  avatar: string;
  /** 描述 */
  description: string;
  /** 状态（1：启用；2：禁用） */
  status: 1 | 2;
  /** 是否为系统内置数据 */
  isSystem: boolean;
  /** 最后一次修改密码时间 */
  pwdResetTime: string;
  /** 部门ID */
  deptId: string;
  /** 创建人 */
  createUser: string;
  /** 创建时间 */
  createTime: string;
  /** 修改人 */
  updateUser: string;
  /** 修改时间 */
  updateTime: string;
  /** 租户ID */
  tenantId: string;
  deptName: string;
  roleIds: Array<number | string>;
  roleNames: Array<string>;
  disabled: boolean;
}

export interface UserDetailResp extends UserResp {
  /** 最后一次修改密码时间 */
  pwdResetTime: string;
}

export interface UserQuery {
  description?: string;
  username: string | undefined;
  nickname: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  status: string | undefined;
  deptId: string | undefined;
  sort: Array<string> | string;
  userIds?: Array<string>;
  roleId?: string;
  createTime?: Array<string>;
}

export interface UserPageQuery extends PageQuery, UserQuery {}

/** @desc 查询用户列表 */
export function listUser(query: UserPageQuery) {
  return http.get<PageRes<UserResp[]>>(BASE_URL, {
    params: query,
  });
}

/** @desc 查询所有用户列表 */
export function listAllUser(query: Partial<UserPageQuery>) {
  return http.get<UserResp[]>(`${BASE_URL}/list`, {
    params: query,
  });
}

/** @desc 查询用户详情 */
export function getUser(id: string) {
  return http.get<UserDetailResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增用户 */
export function addUser(data: any) {
  return http.post(BASE_URL, data);
}

/** @desc 修改用户 */
export function updateUser(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除用户 */
export function deleteUser(id: string) {
  return http.delete(BASE_URL, { data: { ids: [id] } });
}

/** @desc 导出用户 */
export function exportUser(query: UserQuery) {
  return http.download(`${BASE_URL}/export`, {
    params: query,
  });
}

/** @desc 下载用户导入模板 */
export function downloadUserImportTemplate() {
  return http.download(`${BASE_URL}/import/template`);
}

/** @desc 解析用户导入数据 */
export function parseImportUser(data: FormData) {
  return http.post(`${BASE_URL}/import/parse`, data);
}

/** @desc 导入用户 */
export function importUser(data: any) {
  return http.post(`${BASE_URL}/import`, data);
}

/** @desc 重置密码 */
export function resetUserPwd(data: any, id: string) {
  return http.patch(`${BASE_URL}/${id}/password`, data);
}

/** @desc 分配角色 */
export function updateUserRole(
  data: { roleIds: Array<number | string> },
  id: string,
) {
  return http.patch(`${BASE_URL}/${id}/role`, data);
}

/** @desc 查询用户字典 */
export function listUserDict(query?: { status: number }) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, {
    params: query,
  });
}
