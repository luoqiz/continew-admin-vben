import type { FileItem } from '#/api/system';

import { h } from 'vue';

import { ElMessageBox } from 'element-plus';

import ModalContent from './ModalContent.vue';

/** 打开 详情 弹窗 */
export function openFileDetailModal(fileItem: FileItem) {
  return ElMessageBox.alert('', '文件详情', {
    showClose: true,
    message: h(ModalContent, { data: fileItem }),
  });
}
