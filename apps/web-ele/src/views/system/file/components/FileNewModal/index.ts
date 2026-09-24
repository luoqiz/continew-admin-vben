import { $t } from '@vben/locales';

import { ElMessageBox } from 'element-plus';

export function openNewDirModal(okCallback?: (newDirName: string) => void) {
  return ElMessageBox.prompt(
    $t('system.file.form.newFolderName'),
    $t('system.file.modal.newFolder'),
    {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      inputPattern: /^(?!\s*$).+/,
      inputErrorMessage: $t('system.file.form.nameRequired'),
    },
  )
    .then(async ({ value }) => {
      // 新建文件夹弹窗窗口确认事件
      if (okCallback) {
        okCallback(value);
      }
      return true;
    })
    .catch(() => {
      // 取消操作
    });
}
