import type { FileItem } from '#/api/system';

import { h } from 'vue';

import { VbenModal } from '@vben/common-ui';

import ModalContent from './ModalContent.vue';

/** 打开 详情 弹窗 */
export function openFileDetailModal(fileItem: FileItem) {
  return VbenModal.open({
    title: '文件详情',
    titleAlign: 'start',
    modalAnimationName: 'el-fade',
    modalStyle: { maxWidth: '320px' },
    width: '90%',
    footer: false,
    content: () => h(ModalContent, { data: fileItem }),
  });
}
