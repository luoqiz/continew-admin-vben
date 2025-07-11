<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import type { ImageCaptchaResp } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getImageCaptcha } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Super',
    value: 'vben',
  },
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'User',
    value: 'jack',
  },
];

const captchaInfo = ref<ImageCaptchaResp>({
  uuid: '',
  img: '',
  expireTime: 0,
  isEnabled: false,
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: MOCK_USER_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.selectAccount') })
        .optional()
        .default('admin'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount) {
            const findUser = MOCK_USER_OPTIONS.find(
              (item) => item.value === values.selectAccount,
            );
            if (findUser) {
              form.setValues({
                password: 'admin123',
                username: findUser.value,
              });
            }
          }
        },
        triggerFields: ['selectAccount'],
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInputCaptcha',
      componentProps: {
        captcha: captchaInfo.value.img,
        class: 'focus:border-primary',
        onCaptchaClick: getCaptcha,
        placeholder: $t('authentication.code'),
        expireTime: captchaInfo.value.expireTime,
      },
      dependencies: {
        if: () => captchaInfo.value.isEnabled,
        triggerFields: [''],
      },
      fieldName: 'captcha',
      label: $t('authentication.code'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.verifyRequiredTip') }),
    },
    {
      component: 'VbenInput',
      defaultValue: captchaInfo.value.uuid,
      componentProps: {},
      dependencies: {
        show: true,
        disabled: true,
        triggerFields: ['captcha'],
        trigger(values, form) {
          if (values.captcha) {
            form.setValues({
              uuid: captchaInfo.value.uuid,
            });
          }
        },
      },
      fieldName: 'uuid',
    },
  ];
});

// 获取验证码
const getCaptcha = async () => {
  const res = await getImageCaptcha();
  const { uuid, img, expireTime, isEnabled } = res;
  captchaInfo.value.isEnabled = isEnabled;
  captchaInfo.value.img = img;
  captchaInfo.value.uuid = uuid;
  captchaInfo.value.expireTime = expireTime;
};

onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authStore.authLogin"
  />
</template>
