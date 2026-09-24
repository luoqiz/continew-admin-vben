import type { FileItem } from '#/api/system';

import { h } from 'vue';

import { $t } from '@vben/locales';

import { ElMessageBox } from 'element-plus';

import ModalContent from './ModalContent.vue';

export function previewFileVideoModal(data: FileItem) {
  return ElMessageBox({
    title: $t('system.file.modal.video'),
    customStyle: {
      'max-width': '45%',
      height: '50%',
    },
    showConfirmButton: false,
    message: h(ModalContent, { data }),
  });
}
