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

import { refreshTokenApi } from './core';
import { code2statusResponseInterceptor } from './helper';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理：域名入口不发送前端租户头，兼容入口才发送租户 ID。
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const tenantStore = useTenantStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      // 显式配置的 X-Tenant-Code 由兼容登录接口使用；否则根据当前入口补充租户 ID。
      const hasTenantCode = Object.keys(config.headers).some((name) => {
        return name.toLowerCase() === 'x-tenant-code' && !!config.headers[name];
      });
      if (tenantStore.shouldSendTenantHeader && tenantStore.tenantId && !hasTenantCode) {
        config.headers['X-Tenant-Id'] = tenantStore.tenantId;
      } else {
        // 清除旧的租户 ID，防止切换到域名入口后继续携带本地持久化值。
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

function addTenantRequestInterceptor(client: RequestClient) {
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const tenantStore = useTenantStore();

      config.headers.Authorization = accessStore.accessToken
        ? `Bearer ${accessStore.accessToken}`
        : null;
      // baseRequestClient 也必须遵循同一规则，覆盖刷新 Token、登出等基础请求。
      const hasTenantCode = Object.keys(config.headers).some((name) => {
        return name.toLowerCase() === 'x-tenant-code' && !!config.headers[name];
      });
      if (tenantStore.shouldSendTenantHeader && tenantStore.tenantId && !hasTenantCode) {
        config.headers['X-Tenant-Id'] = tenantStore.tenantId;
      } else {
        delete config.headers['X-Tenant-Id'];
      }
      return config;
    },
  });
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
addTenantRequestInterceptor(baseRequestClient);
