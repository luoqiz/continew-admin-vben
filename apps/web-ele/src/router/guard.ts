import type { Router } from 'vue-router';

import { START_LOCATION } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore, useTenantStore } from '#/store';

import { generateAccess } from './access';

let sessionRestoreAttempted = false;
let sessionRestorePromise: null | Promise<boolean> = null;
/** 会话恢复发生了非终态失败（网络/服务端暂时不可用），允许用户稍后重试。 */
let sessionRestoreRecoverableFailure = false;

function restoreSessionOnce(authStore: ReturnType<typeof useAuthStore>) {
  if (sessionRestorePromise) return sessionRestorePromise;
  if (useAccessStore().accessToken) {
    sessionRestoreRecoverableFailure = false;
    return Promise.resolve(true);
  }
  if (sessionRestoreAttempted) return Promise.resolve(false);
  sessionRestoreAttempted = true;
  sessionRestorePromise = authStore
    .restoreSession()
    .catch((error) => {
      const status = error?.response?.status;
      // 只有明确 401 才记住“本次页面已确认无会话”。限流、网络和服务端
      // 临时故障不删除 Cookie，并允许后续进入受保护页面时重新恢复。
      if (status === 401) {
        sessionRestoreRecoverableFailure = false;
        // 会话确认死亡：清理 session 来源的租户上下文，
        // 让登录页的租户编码字段重新出现（普通租户可输入编码重登录）。
        useTenantStore().handleSessionInvalidated();
      } else {
        sessionRestoreAttempted = false;
        sessionRestoreRecoverableFailure = true;
        ElMessage.warning('登录状态恢复失败，请稍后重试');
      }
      return false;
    })
    .finally(() => {
      sessionRestorePromise = null;
    });
  return sessionRestorePromise;
}

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // Access Token 不持久化。首次进入受保护页面时先用 HttpOnly Cookie 恢复登录态，
    // 防止浏览器刷新页面后在 Cookie 仍有效的情况下被直接跳转到登录页。
    if (
      !accessStore.accessToken &&
      !coreRouteNames.includes(to.name as string)
    ) {
      await restoreSessionOnce(authStore);
    }

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 会话恢复失败属于暂时性故障：首屏导航跳转登录页并保留目标地址，
      // 服务恢复后用户可重新登录回到原页面；应用内导航保留当前页面，稍后重试即可。
      if (sessionRestoreRecoverableFailure && from !== START_LOCATION) {
        return false;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
