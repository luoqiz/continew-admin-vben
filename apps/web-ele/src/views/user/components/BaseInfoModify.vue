<script setup lang="ts">
import type { BasicUserInfo } from '@vben/types';

import { computed } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { updateUserBaseInfo } from '#/api';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();

const formSchema = () => {
  return [
    {
      label: $t('system.user.nickname'),
      fieldName: 'nickname',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.user.gender'),
      fieldName: 'gender',
      component: 'RadioGroup',
      componentProps: {
        placeholder: '请输入',
        isButton: false,
        options: [
          { value: 1, label: $t('common.gender.male') },
          { value: 2, label: $t('common.gender.female') },
          { value: 0, label: $t('common.gender.confidential') },
        ],
      },
      rules: 'required',
    },
  ];
};

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
  schema: formSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

// 提交表单
const submitForm = async () => {
  const validate = await editFormApi.form.validate();
  if (validate) {
    await updateUserBaseInfo({
      gender: editFormApi.form.values.gender,
      nickname: editFormApi.form.values.nickname,
    });
    ElMessage.success('修改成功');
    // 修改成功后，重新获取用户信息
    await authStore.fetchUserInfo();
    modalApi.close();
    return true;
  }
};

const [VerifyModel, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: true,
  showConfirmButton: true,
  bordered: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<BasicUserInfo>();
      if (data) {
        editFormApi.setValues(data);
      }
    }
  },
  onConfirm: async () => {
    const res = await submitForm();
    return res;
  },
});

// 弹窗标题
const getWindowTitle = computed(() => {
  return `${$t('pages.common.edit')}${$t('system.user.profile.basicInfo')}`;
});

defineExpose({
  submitForm,
});
</script>

<template>
  <VerifyModel :title="getWindowTitle">
    <EditForm />
  </VerifyModel>
</template>
<style lang="scss" scoped></style>
