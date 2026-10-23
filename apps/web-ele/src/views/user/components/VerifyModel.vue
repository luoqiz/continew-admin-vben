<script setup lang="ts">
import type { ModeItem } from '../profile/type';

import type { BehaviorCaptchaReq } from '#/api';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore } from '@vben/stores';

import { clearAuthExpiredReason } from '#/features/auth-session/expired-reason';
import { useAuthStore } from '#/store';

import EmailVerify from './EmailVerify.vue';
import PhoneVerify from './PhoneVerify.vue';
import PwdModify from './PwdModify.vue';

const captchaType = ref('blockPuzzle');
const captchaMode = ref('pop');
const modalInfo = ref<ModeItem>();
const VerifyRef = ref<InstanceType<any>>();
const formRef = ref<InstanceType<any>>();
const accessStore = useAccessStore();
const authStore = useAuthStore();
const router = useRouter();
const [VerifyModel, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: true,
  showConfirmButton: true,
  bordered: true,
  async onConfirm() {
    modalApi.setState({ confirmLoading: true });
    try {
      const success = await formRef.value?.submitForm();
      // 只有显式返回 true 才算成功：子组件校验不通过、ref 尚未就绪都不应关闭弹窗
      if (success !== true) {
        return;
      }
      modalApi.close();
      if (modalInfo.value?.type === 'password') {
        // 后端改密后会踢出全部会话，这里只做本地清理并回登录页：
        // 再调 /auth/logout 会带着已失效的令牌拿到 401，多触发一次重新认证
        accessStore.setAccessToken(null);
        clearAuthExpiredReason();
        resetAllStores();
        accessStore.setLoginExpired(false);
        await router.replace(LOGIN_PATH);
      } else {
        // 绑定/更换手机号、邮箱后必须刷新用户信息，否则个人中心仍显示旧值
        await authStore.fetchUserInfo();
      }
    } catch {
      // 子组件内部已提示具体错误，保持弹窗打开
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as ModeItem | undefined;
      if (data) {
        modalInfo.value = data;
      }
    }
  },
});

// 弹窗标题（原实现拼接了租户管理员的文案，在个人中心显示为「重置 安全手机 管理员用户密码」）
const getWindowTitle = computed(() => `修改${modalInfo.value?.title ?? ''}`);

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
