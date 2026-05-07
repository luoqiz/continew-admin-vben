<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { BehaviorCaptchaReq } from '#/api/common';

import { computed, ref } from 'vue';

import { AuthenticationCodeLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { getSmsCaptcha } from '#/api/common';
import * as Regexp from '#/utils/regexp';

defineOptions({ name: 'CodeLogin' });

const loading = ref(false);
const phoneComRef = ref<InstanceType<typeof AuthenticationCodeLogin>>();
const CODE_LENGTH = 6;
const captchaReq = ref<BehaviorCaptchaReq>();
const userStore = useUserStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.mobile'),
      },
      fieldName: 'phoneNumber',
      label: $t('authentication.mobile'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.mobileTip') })
        .refine((v) => /^\d{11}$/.test(v), {
          message: $t('authentication.mobileErrortip'),
        }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          const text =
            countdown > 0
              ? $t('authentication.sendText', [countdown])
              : $t('authentication.sendCode');
          return text;
        },
        placeholder: $t('authentication.code'),
        handleSendCode: async () => {
          // console.warn('发送验证码前校验等逻辑');
          // throw new Error('手机号校验失败');
          // 调用暴露的方法，获取 formApi
          const formApi = phoneComRef.value?.getFormApi();
          const values = await formApi.getValues();
          const phone = values.phoneNumber;
          if (!phone) {
            throw new Error($t('authentication.mobileTip'));
          }
          if (!Regexp.validatePhoneNumber(phone)) {
            throw new Error($t('authentication.mobileErrortip'));
          }
          // 弹出验证码弹窗
          await onCaptcha();
        },
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});
/**
 * 异步处理登录操作
 * Asynchronously handle the login process
 * @param values 登录表单数据
 */
async function handleLogin(values: Recordable<any>) {
  // console.log('登录表单数据', values);
  try {
    await userStore.phoneLogin(values, tenantCode.value);
    // 登录成功后的逻辑，例如跳转到主页
    // console.log('登录成功', values);
  } catch (error) {
    // 处理登录失败的情况，例如显示错误消息
    console.error('登录失败', error);
  } finally {
    loading.value = false;
  }
}

// 行为验证码成功
const onCaptchaValidate = async (captchaReqParam: BehaviorCaptchaReq) => {
  captchaReq.value = captchaReqParam;
  const formApi = phoneComRef.value?.getFormApi();
  const values = await formApi.getValues();
  const phone = values.phoneNumber;
  await getSmsCaptcha(phone, captchaReq.value);
};

const captchaType = ref('blockPuzzle');
const captchaMode = ref('pop');
const VerifyRef = ref<InstanceType<any>>();

// 行为验证码弹窗
const onCaptcha = async () => {
  // 重置行为参数
  VerifyRef.value.instance.refresh();
  VerifyRef.value.show();
};
</script>

<template>
  <div>
    <AuthenticationCodeLogin
      :form-schema="formSchema"
      :loading="loading"
      ref="phoneComRef"
      @submit="handleLogin"
    />
    <Verify
      ref="VerifyRef"
      :captcha-type="captchaType"
      :mode="captchaMode"
      :img-size="{ width: '330px', height: '155px' }"
      @success="onCaptchaValidate"
    />
  </div>
</template>
