import type * as T from './type';

import type { PageRes } from '#/types/api';

import { requestClient as http } from '#/api/request';

export type * from './type';

const BASE_URL = '/system/file';
const RECYCLE_URL = `${BASE_URL}/recycle`;

/** @desc 上传文件 */
export function uploadFile(data: FormData) {
  return http.post(`${BASE_URL}/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/** @desc 查询文件列表 */
export function listFile(query: T.FilePageQuery) {
  return http.get<PageRes<T.FileItem[]>>(`${BASE_URL}`, { params: query });
}

/** @desc 修改文件 */
export function updateFile(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data);
}

/** @desc 删除文件 */
export function deleteFile(ids: string[]) {
  return http.delete(`${BASE_URL}`, { data: { ids } });
}

/** @desc 查询文件资源统计统计 */
export function getFileStatistics() {
  return http.get<T.FileStatisticsResp>(`${BASE_URL}/statistics`);
}

/** @desc 根据sha256检测文件是否已经在服务器存在 */
export function checkFile(sha256: string) {
  return http.get<T.FileItem>(`${BASE_URL}/check`, {
    params: { fileHash: sha256 },
  });
}

/** @desc 创建文件夹 */
export function createDir(parentPath: string, name: string) {
  return http.post<T.FileItem>(`${BASE_URL}/dir`, {
    parentPath,
    originalName: name,
  });
}

/** @desc 查询文件夹大小 */
export function calcDirSize(id: string) {
  return http.get<T.FileDirCalcSizeResp>(`${BASE_URL}/dir/${id}/size`);
}

/** @desc 查询回收站文件列表 */
export function listRecycleFiles(query: T.FilePageQuery) {
  return http.get<PageRes<T.FileItem[]>>(`${RECYCLE_URL}`, { params: query });
}

/** @desc 还原回收站文件 */
export function restoreRecycleFile(id: string) {
  return http.put(`${RECYCLE_URL}/restore/${id}`);
}

/** @desc 删除回收站文件 */
export function deleteRecycleFile(id: string) {
  return http.delete(`${RECYCLE_URL}/${id}`);
}

/** @desc 清空回收站 */
export function cleanRecycleBin() {
  return http.delete(`${RECYCLE_URL}/clean`);
}
