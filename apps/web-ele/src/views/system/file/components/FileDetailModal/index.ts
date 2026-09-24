import type { FileItem } from '#/api/system';

import { h } from 'vue';

import { $t } from '@vben/locales';

import { ElMessageBox } from 'element-plus';

import ModalContent from './ModalContent.vue';

/** 打开 详情 弹窗 */
export function openFileDetailModal(fileItem: FileItem) {
  return ElMessageBox.alert('', $t('system.file.modal.detail'), {
    showClose: true,
    message: h(ModalContent, { data: fileItem }),
  });
}
