<script setup lang="ts">
import type { ModeItem } from '../profile/type';

import type { BehaviorCaptchaReq } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import EmailVerify from './EmailVerify.vue';
import PhoneVerify from './PhoneVerify.vue';
import PwdModify from './PwdModify.vue';

const captchaType = ref('blockPuzzle');
const captchaMode = ref('pop');
const modalInfo = ref<ModeItem>();
const [VerifyModel, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: true,
  showConfirmButton: true,
  bordered: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<ModeItem>();
      if (data) {
        modalInfo.value = data;
      }
    }
  },
});

// 弹窗标题
const getWindowTitle = computed(() => {
  return `${$t('pages.common.reset')} ${modalInfo.value?.title} ${$t('tenant.management.adminPassword')}`;
});

const VerifyRef = ref<InstanceType<any>>();
const formRef = ref<InstanceType<any>>();

// 行为验证码弹窗
const onCaptcha = async () => {
  // 重置行为参数
  VerifyRef.value.instance.refresh();
  VerifyRef.value.show();
};

// 行为验证码成功
const onCaptchaValidate = async (captchaReq: BehaviorCaptchaReq) => {
  formRef.value.onCaptchaSuccess(captchaReq);
};
</script>

<template>
  <!-- <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 500 ? 500 : '100%'" draggable @before-ok="save" @ok="saveAfter" @close="reset">

    <Verify ref="VerifyRef" :captcha-type="captchaType" :mode="captchaMode"
      :img-size="{ width: '330px', height: '155px' }" @success="getCaptcha" />
  </a-modal> -->
  <VerifyModel :title="getWindowTitle" class="h-50% w-50%" draggable>
    <template v-if="modalInfo?.type === 'phone'">
      <PhoneVerify ref="formRef" @on-captcha="onCaptcha" />
    </template>
    <template v-if="modalInfo?.type === 'email'">
      <EmailVerify ref="formRef" @on-captcha="onCaptcha" />
    </template>
    <template v-if="modalInfo?.type === 'password'">
      <PwdModify ref="formRef" />
    </template>
    <Verify
      ref="VerifyRef"
      :captcha-type="captchaType"
      :mode="captchaMode"
      :img-size="{ width: '330px', height: '155px' }"
      @success="onCaptchaValidate"
    />
  </VerifyModel>
</template>

<style scoped lang="scss">
.captcha-btn {
  min-width: 98px;
  margin-left: 12px;
  border-radius: 4px;
}
</style>
