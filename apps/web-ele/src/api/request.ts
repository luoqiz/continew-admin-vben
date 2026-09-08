/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useAuthStore, useTenantStore } from '#/store';
import { withAuthLifecycleLock } from '#/utils/auth-lifecycle';

import { logoutApi, refreshTokenApi } from './core';
import { code2statusResponseInterceptor } from './helper';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
    // 浏览器 Refresh Token 由 HttpOnly Cookie 承载，请求必须携带凭证。
    withCredentials: true,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('登录状态已失效，请重新登录。');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    const accessToken = accessStore.accessToken;
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      // 弹窗重新认证期间清除旧令牌并关闭刷新重试，避免并发 401 不断触发刷新接口。
      // 用户重新登录成功后会重新建立完整会话。
      try {
        await withAuthLifecycleLock(() => logoutApi(accessToken));
      } catch {
        // 服务端不可用时仍继续本地重新认证，避免用户被阻塞在过期状态。
      }
      accessStore.setAccessToken(null);
      accessStore.setLoginExpired(true);
    } else {
      // logout 需要在清理 Access Token 前带上它，否则后端无法清除当前登录会话。
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    return withAuthLifecycleLock(async () => {
      const accessStore = useAccessStore();
      const tenantStore = useTenantStore();
      const loginResult = await refreshTokenApi();
      accessStore.setAccessToken(loginResult.accessToken);
      // Refresh 响应携带 Session 固化的租户，确保刷新后前端状态与后端保持一致。
      tenantStore.setTenantId(loginResult.tenantId);
      return loginResult.accessToken;
    });
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const tenantStore = useTenantStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      const isLoginEndpoint = config.url?.endsWith('/auth/login');
      const loginData = config.data;
      const isSocialLogin =
        isLoginEndpoint &&
        typeof loginData === 'object' &&
        loginData !== null &&
        'authType' in loginData &&
        loginData.authType === 'SOCIAL';
      // 账号类登录使用显式租户编码；社交登录回调必须保留授权前选中的租户 ID。
      // 刷新和退出始终以 Refresh Session 固化的租户为准。
      const isTenantIndependentAuthEndpoint =
        (isLoginEndpoint && !isSocialLogin) ||
        config.url?.endsWith('/auth/refresh') ||
        config.url?.endsWith('/auth/logout');
      if (
        !isTenantIndependentAuthEndpoint &&
        tenantStore.tenantEnabled &&
        tenantStore.tenantId
      ) {
        config.headers['X-Tenant-Id'] = tenantStore.tenantId;
      } else {
        // 重试请求复用原 headers；认证接口、租户状态关闭或租户 ID 为空时必须清除
        // 旧值，防止刷新/退出把上一次会话的租户上下文带到服务端。
        delete config.headers['X-Tenant-Id'];
      }
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      // ContiNew 后端统一响应中的成功码为字符串 "0"，必须保持类型一致，否则
      // 图片验证码等公开接口会被误判为失败响应，前端拿不到 data 数据。
      successCode: '0',
    }),
  );

  // 处理code转为status的处理
  client.addResponseInterceptor(code2statusResponseInterceptor());

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({
  baseURL: apiURL,
  withCredentials: true,
});
