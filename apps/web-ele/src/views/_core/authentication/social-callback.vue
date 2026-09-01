<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccessStore } from '@vben/stores';

import { ElLoading, ElMessage } from 'element-plus';

import {
  bindSocialAccount,
  resolveSocialTarget,
} from '#/api';
import {
  TENANT_AUTH_CODE_STORAGE_KEY,
  useAuthStore,
  useTenantStore,
} from '#/store';

defineOptions({ name: 'SocialCallback' });

const route = useRoute();
const router = useRouter();
const accessStore = useAccessStore();
const authStore = useAuthStore();
const tenantStore = useTenantStore();

const redirectToTenantHost = async () => {
  const state = String(route.query.state || '');
  if (!state) return false;
  try {
    // 后端只会返回 HMAC 校验通过的目标 Host，前端据此回到发起授权的租户入口。
    const { targetHost } = await resolveSocialTarget(state);
    if (!targetHost || targetHost.toLowerCase() === window.location.hostname.toLowerCase()) {
      return false;
    }
    const targetUrl = new URL(window.location.href);
    targetUrl.host = targetHost;
    window.location.replace(targetUrl.toString());
    return true;
  } catch {
    // 兼容未升级的旧 state，继续按当前入口尝试处理。
    return false;
  }
};

const handleCallback = async () => {
  const source = String(route.query.source || '');
  const code = String(route.query.code || '');
  const state = String(route.query.state || '');
  if (!source || !code || !state) {
    throw new Error('社交登录回调参数不完整');
  }
  if (await redirectToTenantHost()) return;

  const callback = { code, state };
  if (accessStore.accessToken) {
    await bindSocialAccount(source, callback);
    await router.replace('/user/profile');
    ElMessage.success('绑定成功');
    return;
  }

  const tenantCode =
    // 跨域回调后从 sessionStorage 恢复兼容入口的租户编码；域名入口不携带租户编码。
    tenantStore.tenantAuthMode === 'LEGACY'
      ? tenantStore.tenantCode ||
        sessionStorage.getItem(TENANT_AUTH_CODE_STORAGE_KEY) ||
        undefined
      : undefined;
  await authStore.socialLogin(source, callback, tenantCode);
  sessionStorage.removeItem(TENANT_AUTH_CODE_STORAGE_KEY);
};

onMounted(async () => {
  const loading = ElLoading.service({ fullscreen: true, text: '处理中...' });
  try {
    await handleCallback();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '社交登录失败');
    await router.replace('/auth/login');
  } finally {
    loading.close();
  }
});
</script>

<template>
  <div />
</template>
