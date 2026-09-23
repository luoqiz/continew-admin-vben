<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import type { ImageCaptchaResp } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getImageCaptcha } from '#/api';
import { useAuthStore, useTenantStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const tenantStore = useTenantStore();

const captchaInfo = ref<ImageCaptchaResp>({
  uuid: '',
  img: '',
  expireTime: 0,
  isEnabled: false,
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'TenantSelect',
      componentProps: {
        allowCreate: true,
        clearable: true,
        defaultFirstOption: true,
        filterable: true,
        options: tenantStore.loginHistory.map((item) => ({
          label: item.code,
          value: item.code,
        })),
        placeholder: $t('authentication.tenantPlaceholder'),
      },
      dependencies: {
        if: () =>
          tenantStore.tenantEnabled && tenantStore.tenantIdSource !== 'domain',
        triggerFields: [''],
      },
      fieldName: 'TenantCode',
      label: $t('authentication.selectTenant'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      // dependencies: {
      //   trigger(values, form) {
      //     if (values.selectAccount) {
      //       const findUser = MOCK_USER_OPTIONS.find(
      //         (item) => item.value === values.selectAccount,
      //       );
      //       if (findUser) {
      //         form.setValues({
      //           password: 'admin123',
      //           username: findUser.value,
      //         });
      //       }
      //     }
      //   },
      //   triggerFields: ['selectAccount'],
      // },
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
        show: false,
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
  // 修剪超过 15 天未活跃的租户历史（持久化水合后执行）
  tenantStore.pruneExpired();
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
