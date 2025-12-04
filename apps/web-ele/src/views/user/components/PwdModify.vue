<script setup lang="ts">
import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { updateUserPassword } from '#/api';

const phoneFormSchema = () => {
  return [
    {
      label: $t('system.user.profile.currentPwd'),
      fieldName: 'oldPassword',
      component: 'VbenInputPassword',
      rules: 'required',
    },
    {
      label: $t('system.user.profile.newPassword'),
      fieldName: 'newPassword',
      component: 'VbenInputPassword',
      rules: 'required',
    },
    {
      label: $t('system.user.profile.rePassword'),
      fieldName: 'rePassword',
      component: 'VbenInputPassword',
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
  schema: phoneFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});
// 提交表单
const submitForm = async () => {
  const validate = await editFormApi.form.validate();
  if (validate) {
    const form = editFormApi.form.values;
    if (form.newPassword !== form.rePassword) {
      ElMessage.error('两次新密码不一致');
      return false;
    }
    if (form.newPassword === form.oldPassword) {
      ElMessage.error('新密码与旧密码不能相同');
      return false;
    }
    await updateUserPassword({
      oldPassword: encryptByRsa(form.oldPassword) || '',
      newPassword: encryptByRsa(form.newPassword) || '',
    });
    ElMessage.success('修改成功');
  }
};
defineExpose({
  submitForm,
});
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col">
    <EditForm />
  </div>
</template>
<style lang="scss" scoped></style>
