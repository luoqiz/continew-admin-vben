import type { FileItem } from '#/api/system';

import { h, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { updateFile } from '#/api/system';

import ModalContent from './ModalContent.vue';

export function openFileRenameModal(data: FileItem, callback?: () => void) {
  const ModalContentRef = ref<InstanceType<typeof ModalContent>>();
  return Modal.open({
    title: '重命名',
    modalAnimationName: 'el-fade',
    modalStyle: { maxWidth: '450px' },
    width: '90%',
    content: () =>
      h(ModalContent, {
        data,
        ref: (e) => {
          ModalContentRef.value = e as any;
        },
      }),
    onBeforeOk: async () => {
      const isInvalid = await ModalContentRef.value?.formRef?.validate();
      const modelParams = ModalContentRef.value?.formRef?.model;
      if (isInvalid) return false;
      await updateFile({ originalName: modelParams?.originalName }, data.id);
      ElMessage.success('重命名成功');
      if (callback) {
        callback();
      }
      return true;
    },
  });
}
