<script setup lang="ts">
import type { TenantResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addTenant, getTenant, updateTenant } from '#/api';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useTenantEditFormSchema } from './TenantData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [DeptForm, deptFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useTenantEditFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(deptFormApi),
    currentGetter: defaultFormValueGetter(deptFormApi),
  },
);

async function handleClosed() {
  await deptFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await deptFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateTenant(deptFormApi.form.values, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addTenant({
          ...deptFormApi.form.values,
          adminPassword: encryptByRsa(deptFormApi.form.values.adminPassword),
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
        const data = drawerApi.getData<TenantResp>();
        dataId.value = data.id;
        if (data && data.id) {
          dataId.value = data.id;
          const res = await getTenant(data.id);
          deptFormApi.form.setValues(res);
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
      <DeptForm />
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
