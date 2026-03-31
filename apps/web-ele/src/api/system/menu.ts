import type * as T from './type';

import { requestClient as http } from '#/api/request';

const BASE_URL = '/system/menu';

/** @desc 查询菜单列表 */
export function listMenu(query?: T.MenuQuery) {
  return http.get<T.MenuResp[]>(`${BASE_URL}/tree`, { params: query });
}

/** @desc 查询菜单列表 */
export function listDictMenu(query?: T.MenuQuery) {
  return http.get<T.MenuResp[]>(`${BASE_URL}/dict/tree`, { params: query });
}

/** @desc 查询菜单详情 */
export function getMenu(id: string) {
  return http.get<T.MenuResp>(`${BASE_URL}/${id}`);
}

/** @desc 新增菜单 */
export function addMenu(data: any) {
  return http.post<boolean>(`${BASE_URL}`, data);
}

/** @desc 修改菜单 */
export function updateMenu(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除菜单 */
export function deleteMenu(id: string) {
  return http.delete(`${BASE_URL}`, { data: { ids: [id] } });
}

/** @desc 清除菜单缓存 */
export function clearMenuCache() {
  return http.delete(`${BASE_URL}/cache`);
}
