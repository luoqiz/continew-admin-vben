import type { FileItem } from '#/api/system';

import { $t } from '@vben/locales';

import { ElMessage, ElMessageBox } from 'element-plus';

import { updateFile } from '#/api/system';

export function openFileRenameModal(data: FileItem, callback?: () => void) {
  return ElMessageBox.prompt(
    $t('system.file.form.newFileName'),
    $t('system.file.modal.rename'),
    {
      inputValue: data.originalName,
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      inputPattern: /^(?!\s*$).+/,
      inputErrorMessage: $t('system.file.form.nameRequired'),
    },
  )
    .then(async ({ value }) => {
      await updateFile({ originalName: value }, data.id);
      ElMessage.success($t('system.file.message.renameSuccess'));
      if (callback) {
        callback();
      }
      return true;
    })
    .catch(() => {
      // 取消操作
    });
}
