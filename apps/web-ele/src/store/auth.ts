import type { RequestClientConfig } from '@vben/request';
import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';
import { encryptByRsa } from '@vben/utils';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  AuthTypeConstants,
  getUserInfoApi,
  loginApi,
  logoutApi,
  socialLogin as socialLoginApi,
} from '#/api';
import { $t } from '#/locales';
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
      params.password = encryptByRsa(params.password) || '';
      params.clientId = import.meta.env.VITE_CLIENT_ID;
      params.authType = AuthTypeConstants.ACCOUNT;
      const { TenantCode, ...loginParams } = params;
      // 仅兼容入口需要把租户编码显式传给后端；域名入口由后端从 Host 解析租户。
      const config: RequestClientConfig = {
        headers: {
          'x-tenant-code': TenantCode || '', // 如果租户功能启用，携带租户信息
        },
      };
      const { token, tenantId } = await loginApi(loginParams, config);

      // 如果成功获取到 accessToken
      if (token) {
        tenantStore.setTenantCode(TenantCode);
        tenantStore.setTenantId(tenantId);
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(token);

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

  async function socialLogin(
    source: string,
    params: Recordable<any>,
    tenantCode?: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { token, tenantId } = await socialLoginApi(
        {
          ...params,
          source,
          clientId: import.meta.env.VITE_CLIENT_ID,
          authType: AuthTypeConstants.SOCIAL,
        },
        tenantCode,
      );
      if (token) {
        // 社交回调阶段的 tenantCode 只来自兼容入口；域名入口始终信任当前 Host。
        tenantStore.setTenantCode(tenantCode);
        tenantStore.setTenantId(tenantId);
        accessStore.setAccessToken(token);
        const fetchUserInfoResult = await fetchUserInfo();
        userInfo = fetchUserInfoResult;
        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(userInfo.permissions);
        await (onSuccess
          ? onSuccess()
          : router.push(
              userInfo.homePath || preferences.app.defaultHomePath,
            ));
      }
    } finally {
      loginLoading.value = false;
    }
    return { userInfo };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

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

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    socialLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
