import type { LabelValueState } from '#/types/global';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/common';

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

/** @desc 查询租户开启状态 */
export function getTenantStatus() {
  return http.get<boolean>(`${BASE_URL}/dict/option/tenant`);
}
