<script setup lang="ts">
import type { BehaviorCaptchaReq } from '#/api';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { getEmailCaptcha, updateUserEmail } from '#/api';

const emits = defineEmits(['onCaptcha']);

const phoneFormSchema = () => {
  return [
    {
      label: $t('system.user.email'),
      fieldName: 'email',
      component: 'Input',
      rules: 'required',
    },

    {
      label: $t('system.user.profile.verifyCode'),
      fieldName: 'captcha',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.user.profile.currentPwd'),
      fieldName: 'password',
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

const captchaTimer = ref();
const captchaTime = ref(60);
const captchaBtnName = ref<string>('获取验证码');
const captchaDisable = ref(false);
const captchaLoading = ref<boolean>(false);
const verifyType = ref<string>('phone');

// 弹出行为验证码
const onCaptcha = async () => {
  if (captchaLoading.value) return;
  emits('onCaptcha', verifyType.value);
};

// 行为验证码验证成功
const onCaptchaSuccess = async (captchaReq: BehaviorCaptchaReq) => {
  await getCaptcha(captchaReq);
};

// 获取验证码
const getCaptcha = async (captchaReq: BehaviorCaptchaReq) => {
  // 发送验证码
  try {
    captchaLoading.value = true;
    captchaBtnName.value = '发送中...';
    await getEmailCaptcha(editFormApi.form.values.email, captchaReq);

    captchaLoading.value = false;
    captchaDisable.value = true;
    captchaBtnName.value = `获取验证码(${(captchaTime.value -= 1)}s)`;
    ElMessage.success('发送成功');
    // Message.success('仅提供效果演示，实际使用请查看代码取消相关注释')
    captchaTimer.value = window.setInterval(() => {
      captchaTime.value -= 1;
      captchaBtnName.value = `获取验证码(${captchaTime.value}s)`;
      if (captchaTime.value <= 0) {
        resetCaptcha();
      }
    }, 1000);
  } catch {
    resetCaptcha();
  } finally {
    captchaLoading.value = false;
  }
};

// 重置验证码
const resetCaptcha = () => {
  window.clearInterval(captchaTimer.value);
  captchaTime.value = 60;
  captchaBtnName.value = '获取验证码';
  captchaDisable.value = false;
};
// 提交表单
const submitForm = async () => {
  const validate = await editFormApi.form.validate();
  if (validate) {
    await updateUserEmail({
      email: editFormApi.form.values.phone,
      captcha: editFormApi.form.values.captcha,
      oldPassword: encryptByRsa(editFormApi.form.values.oldPassword) as string,
    });
    ElMessage.success('修改成功');
  }
};
defineExpose({
  onCaptchaSuccess,
  submitForm,
});
</script>

<template>
  <div class="mx-auto flex h-full w-full flex-col">
    <EditForm>
      <template #captcha>
        <div class="flex w-full flex-row gap-2">
          <div class="flex-1">
            <ElInput v-model:value="editFormApi.form.values.captcha" />
          </div>
          <div class="flex-0">
            <ElButton @click="onCaptcha">获取验证码</ElButton>
          </div>
        </div>
      </template>
    </EditForm>
  </div>
</template>
<style lang="scss" scoped></style>
