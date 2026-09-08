import type { RequestClientConfig } from '@vben/request';
import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';
import { encryptByRsa } from '@vben/utils';

import { ElMessage, ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  AuthTypeConstants,
  getUserInfoApi,
  loginApi,
  logoutApi,
  refreshTokenApi,
} from '#/api';
import { $t } from '#/locales';
import { withAuthLifecycleLock } from '#/utils/auth-lifecycle';

import { useTenantStore } from './modules/tenant';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const tenantStore = useTenantStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      // 使用副本组装请求，避免登录失败后表单密码被加密，下一次提交发生二次加密。
      const loginParams = { ...params };
      // Nitro Mock 接口使用明文密码；真实 ContiNew 后端才需要 RSA 密文和认证客户端参数。
      if (import.meta.env.VITE_NITRO_MOCK !== 'true') {
        loginParams.password = encryptByRsa(params.password) || '';
        loginParams.clientId = import.meta.env.VITE_CLIENT_ID;
        loginParams.authType = AuthTypeConstants.ACCOUNT;
      }
      const config: RequestClientConfig = {
        headers: {
          'x-tenant-code': params.TenantCode || '', // 如果租户功能启用，携带租户信息
        },
      };
      const loginResult = await withAuthLifecycleLock(async () => {
        const result = await loginApi(loginParams, config);
        if (result.accessToken) {
          accessStore.setAccessToken(result.accessToken);
          // 租户请求头使用后端返回的最终租户 ID，避免普通租户仅提交编码登录后后续请求
          // 没有 X-Tenant-Id。
          tenantStore.setTenantId(result.tenantId);
        }
        return result;
      });
      const { accessToken } = loginResult;

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 获取用户信息并存储到 accessStore 中
        // const [fetchUserInfoResult, accessCodes] = await Promise.all([
        //   fetchUserInfo(),
        //   getAccessCodesApi(),
        // ]);
        const fetchUserInfoResult = await fetchUserInfo();
        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(userInfo.permissions);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    const accessToken = accessStore.accessToken;
    try {
      await withAuthLifecycleLock(async () => {
        await logoutApi(accessToken);
        resetAllStores();
        accessStore.setLoginExpired(false);
      });
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : '退出登录失败，请稍后重试',
      );
      throw error;
    }

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /** 页面重载后通过 HttpOnly Refresh Token Cookie 恢复仅存于内存的 Access Token。 */
  async function restoreSession() {
    if (accessStore.accessToken) return true;
    await withAuthLifecycleLock(async () => {
      if (accessStore.accessToken) return;
      const loginResult = await refreshTokenApi();
      accessStore.setAccessToken(loginResult.accessToken);
      tenantStore.setTenantId(loginResult.tenantId);
    });
    return true;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    restoreSession,
  };
});
