<script setup lang="ts">
import type { RoleResp } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addRole, getRole, updateRole } from '#/api/system/role';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useRoleEditFormSchema } from './RoleData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [EditorForm, editorFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useRoleEditFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(editorFormApi),
    currentGetter: defaultFormValueGetter(editorFormApi),
  },
);

async function handleClosed() {
  await editorFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await editorFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateRole(editorFormApi.form.values, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addRole({
          ...editorFormApi.form.values,
        });
        ElMessage.success($t('pages.common.addSuccess'));
      }
      resetInitialized();
      emits('success');
      drawerApi.close();
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        drawerApi.lock(true);
        const data = drawerApi.getData<RoleResp>();
        dataId.value = data.id;

        if (data && data.id) {
          dataId.value = data.id;
          const res = await getRole(data.id);
          editorFormApi.form.setValues(res);
        }
      } finally {
        await markInitialized();
        drawerApi.unlock();
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <EditorForm />
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
