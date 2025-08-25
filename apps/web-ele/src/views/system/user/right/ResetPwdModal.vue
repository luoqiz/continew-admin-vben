<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { UserResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { resetUserPwd } from '#/api/system/user';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

const emits = defineEmits(['success']);
const detailInfo = ref<UserResp>();

// 重置密码表单
function useRestTenantAdminUserPwdFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('tenant.management.newPassword'),
      fieldName: 'newPassword',
      component: 'VbenInputPassword',
      rules: 'required',
      dependencies: {
        triggerFields: ['id'],
        if: (values) => {
          return !values.id;
        },
      },
    },
  ];
}

const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useRestTenantAdminUserPwdFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(editFormApi),
    currentGetter: defaultFormValueGetter(editFormApi),
  },
);

async function handleClosed() {
  await editFormApi.resetForm();
  resetInitialized();
}

const [EditWindow, editWindowApi] = useVbenModal({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    if (!valid) return false;
    editWindowApi.lock();
    try {
      await resetUserPwd(
        {
          newPassword: encryptByRsa(editFormApi.form.values.newPassword) || '',
        },
        detailInfo.value!.id,
      );
      ElMessage.success($t('pages.common.modifySuccess'));

      resetInitialized();
      emits('success');
      editWindowApi.close();
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      editWindowApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        editWindowApi.lock(true);
        // 用户id
        const data = editWindowApi.getData<UserResp>();
        if (data && data.id) {
          detailInfo.value = data;
          editFormApi.form.setValues(data);
        }
      } finally {
        await markInitialized();
        editWindowApi.unlock();
      }
    }
  },
});

const getWindowTitle = computed(() => {
  return `${$t('pages.common.reset')} ${detailInfo.value?.nickname} ${$t('system.user.password')}`;
});
</script>

<template>
  <EditWindow :title="getWindowTitle" class="w-[50%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <EditForm />
    </div>
  </EditWindow>
</template>
<style lang="scss" scoped></style>
