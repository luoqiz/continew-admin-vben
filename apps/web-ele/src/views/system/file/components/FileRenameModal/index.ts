import type { FileItem } from '#/api/system';

import { ElMessage, ElMessageBox } from 'element-plus';

import { updateFile } from '#/api/system';

export function openFileRenameModal(data: FileItem, callback?: () => void) {
  return ElMessageBox.prompt('请输入新的文件名', '重命名', {
    inputValue: data.originalName,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^(?!\s*$).+/,
    inputErrorMessage: '文件名不能为空',
  })
    .then(async ({ value }) => {
      await updateFile({ originalName: value }, data.id);
      ElMessage.success('重命名成功');
      if (callback) {
        callback();
      }
      return true;
    })
    .catch(() => {
      // 取消操作
    });
}
