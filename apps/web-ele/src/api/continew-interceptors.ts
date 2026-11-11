import type {
  MakeErrorMessageFn,
  RequestClient,
  ResponseInterceptorConfig,
} from '@vben/request';

import { $t } from '@vben/locales';

/**
 * ContiNew 认证会话与错误提示的定制拦截器。
 *
 * 这些逻辑原先直接改在 @vben/request 的 preset-interceptors.ts、types.ts 等
 * 上游文件里，每次同步上游都要手工解冲突。现整体抽到应用层：上游请求模块
 * 保持原样，本文件只依赖 @vben/request 公开的类型与 RequestClient 实例。
 */

/** 仅本应用使用的请求配置扩展，避免侵入上游 RequestClientConfig。 */
export type ContinewRequestConfig = {
  /** 请求发起时的认证代次，用于拒绝迟到的认证失败覆盖新会话。 */
  __authGeneration?: number;
  /** 当前请求是否已经因 Access Token 失效重试过。 */
  __isRetryRequest?: boolean;
};

const AUTH_ENDPOINT_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url: string) {
  return AUTH_ENDPOINT_PATHS.some((path) => url.endsWith(path));
}

/**
 * 认证响应拦截器。
 *
 * 与上游实现的差异（均为 ContiNew 后端会话语义所需）：
 * - 登录接口 401 只是凭证错误，不得注销仍有效的会话；
 * - refresh/logout 属于认证端点，不参与刷新队列，避免递归；
 * - 用认证代次拒绝迟到的 401 覆盖新建立的会话；
 * - 只有 Refresh Token 被明确判定无效（401）才重新认证，限流/网络故障保留登录态。
 */
export function continewAuthenticateResponseInterceptor({
  client,
  doReAuthenticate,
  doRefreshToken,
  enableRefreshToken,
  formatToken,
  getAuthGeneration,
}: {
  client: RequestClient;
  doReAuthenticate: (failedGeneration?: number) => Promise<void>;
  doRefreshToken: () => Promise<string>;
  enableRefreshToken: boolean;
  formatToken: (token: string) => null | string;
  getAuthGeneration?: () => number;
}): ResponseInterceptorConfig {
  return {
    rejected: async (error) => {
      const { config, response } = error ?? {};
      // 响应拦截器只会收到带 response/config 的请求错误，用结构判断代替
      // axios.isAxiosError，避免应用层额外声明 axios 依赖。
      if (response?.status !== 401 || !config?.url) {
        throw error;
      }
      const requestUrl: string = config.url;

      // 登录失败只表示本次凭证无效，不能注销当前可能仍有效的会话。
      if (requestUrl.endsWith('/auth/login')) {
        throw error;
      }
      if (
        !enableRefreshToken ||
        config.__isRetryRequest ||
        isAuthEndpoint(requestUrl)
      ) {
        await doReAuthenticate(config.__authGeneration);
        throw error;
      }

      // 队列元素签名与上游 RequestClient.refreshTokenQueue 保持一致：
      // (token, error) => void；刷新失败时上游以 (null, error) 回调。
      if (client.isRefreshing) {
        return new Promise((resolve, reject) => {
          client.refreshTokenQueue.push((newToken, refreshError) => {
            if (!newToken) {
              reject(refreshError ?? new Error('Token refresh failed'));
              return;
            }
            config.__isRetryRequest = true;
            config.__authGeneration = getAuthGeneration?.();
            config.headers = config.headers || {};
            config.headers.Authorization = formatToken(newToken);
            resolve(client.request(requestUrl, { ...config }));
          });
        });
      }

      client.isRefreshing = true;
      config.__isRetryRequest = true;
      try {
        const newToken = await doRefreshToken();
        config.__authGeneration = getAuthGeneration?.();
        client.refreshTokenQueue.forEach((callback) => callback(newToken));
        client.refreshTokenQueue = [];
        return client.request(requestUrl, { ...config });
      } catch (refreshError) {
        client.refreshTokenQueue.forEach((callback) =>
          callback(null, refreshError),
        );
        client.refreshTokenQueue = [];
        if (
          (refreshError as { response?: { status?: number } })?.response
            ?.status === 401
        ) {
          await doReAuthenticate(config.__authGeneration);
        }
        throw refreshError;
      } finally {
        client.isRefreshing = false;
      }
    },
  };
}

/**
 * 错误提示拦截器。
 *
 * 与上游实现的差异：优先采用 ContiNew 后端响应体里的 msg（400 时按
 * responseReturn 取），并保留服务端原文作为默认错误的提示内容。
 */
export function continewErrorMessageResponseInterceptor(
  makeErrorMessage?: MakeErrorMessageFn,
): ResponseInterceptorConfig {
  return {
    rejected: (error: any) => {
      const err: string = error?.toString?.() ?? '';
      let errMsg = '';
      if (err?.includes('Network Error')) {
        errMsg = $t('ui.fallback.http.networkError');
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = $t('ui.fallback.http.requestTimeout');
      }
      if (errMsg) {
        makeErrorMessage?.(errMsg, error);
        return Promise.reject(error);
      }

      let errorMessage: string =
        error?.response?.data?.msg || error?.message || '';
      const status = error?.response?.status;

      switch (status) {
        case 400: {
          try {
            const { responseReturn } = error.config;
            errorMessage = error?.response[responseReturn].msg;
          } catch {}
          if (!errorMessage) {
            errorMessage = $t('ui.fallback.http.badRequest');
          }
          break;
        }
        case 401: {
          errorMessage = $t('ui.fallback.http.unauthorized');
          break;
        }
        case 403: {
          errorMessage = $t('ui.fallback.http.forbidden');
          break;
        }
        case 404: {
          errorMessage = $t('ui.fallback.http.notFound');
          break;
        }
        case 408: {
          errorMessage = $t('ui.fallback.http.requestTimeout');
          break;
        }
        default: {
          if (!errorMessage) {
            errorMessage = $t('ui.fallback.http.internalServerError');
          }
        }
      }
      makeErrorMessage?.(errorMessage, error);
      return Promise.reject(error);
    },
  };
}
