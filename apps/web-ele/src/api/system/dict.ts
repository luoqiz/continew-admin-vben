import type * as T from './type';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/dict';

/** @desc 查询字典列表 */
export function listDict(query?: T.DictQuery) {
  return http.get<T.DictResp[]>(`${BASE_URL}/list`, { params: query });
}

/** @desc 查询字典详情 */
export function getDict(id: number | string) {
  return http.get<T.DictResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增字典 */
export function addDict(data: any) {
  return http.post(`${BASE_URL}`, data);
}

/** @desc 修改字典 */
export function updateDict(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除字典 */
export function deleteDict(id: string) {
  return http.delete(`${BASE_URL}`, { data: { ids: [id] } });
}

/** @desc 清除字典缓存 */
export function clearDictCache(code: string) {
  return http.delete(`${BASE_URL}/cache/${code}`);
}

/** @desc 查询字典项列表 */
export function listDictItem(query: T.DictItemPageQuery) {
  return http.get<T.DictItemResp[]>(`${BASE_URL}/item`, {
    params: query,
  });
}

/** @desc 查询字典项详情 */
export function getDictItem(id: string) {
  return http.get<T.DictItemResp>(`${BASE_URL}/item/${id}`);
}

/** @desc 新增字典项 */
export function addDictItem(data: any) {
  return http.post(`${BASE_URL}/item`, data);
}

/** @desc 修改字典项 */
export function updateDictItem(data: any, id: string) {
  return http.put(`${BASE_URL}/item/${id}`, data);
}

/** @desc 删除字典项 */
export function deleteDictItem(id: string) {
  return http.delete(`${BASE_URL}/item`, { data: { ids: [id] } });
}
