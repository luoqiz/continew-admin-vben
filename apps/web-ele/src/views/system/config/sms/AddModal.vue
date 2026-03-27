<script setup lang="ts">
import type { SmsConfigResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addSmsConfig, getSmsConfig, updateSmsConfig } from '#/api';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useSmsEditFormSchema } from './SmsData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [SmsForm, smsFormApi] = useVbenForm({
  schema: useSmsEditFormSchema(),
  submitButtonOptions: { show: false },
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(smsFormApi),
    currentGetter: defaultFormValueGetter(smsFormApi),
  },
);

async function handleClosed() {
  await smsFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await smsFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateSmsConfig(smsFormApi.form.values, dataId.value);
        ElMessage.success('修改成功');
      } else {
        await addSmsConfig(smsFormApi.form.values);
        ElMessage.success('新增成功');
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
        const data = drawerApi.getData<SmsConfigResp>();
        dataId.value = data?.id;
        if (data && data.id) {
          const res = await getSmsConfig(data.id);
          smsFormApi.form.setValues(res);
        }
      } finally {
        await markInitialized();
        drawerApi.unlock();
      }
    }
  },
});

const getDrawerTitle = computed(() =>
  isUpdate.value ? '修改短信配置' : '新增短信配置',
);
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <SmsForm />
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>
