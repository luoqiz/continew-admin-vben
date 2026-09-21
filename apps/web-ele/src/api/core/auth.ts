import type { RequestClientConfig } from '@vben/request';

import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    tokenType?: string;
    expiresIn?: number;
    refreshExpiresIn: number;
    /** BODY 模式下返回给 App / 小程序的 Refresh Token，浏览器 Cookie 模式为空。 */
    refreshToken?: string;
    /** 登录/刷新会话确定的租户 ID，避免后续请求缺少租户上下文。 */
    tenantId?: null | number | string;
  }

  export interface RefreshTokenResponse {
    code: number | string;
    success: boolean;
    data?: LoginResult | null;
    msg: string;
  }
}

/**
 * 登录
 */
export async function loginApi(
  data: AuthApi.LoginParams,
  config?: RequestClientConfig,
) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data, config);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(): Promise<AuthApi.LoginResult> {
  const response = await baseRequestClient.post<AuthApi.RefreshTokenResponse>(
    '/auth/refresh',
    undefined,
    { withCredentials: true },
  );
  const body = (response as unknown as { data: AuthApi.RefreshTokenResponse })
    .data;
  const accessToken = body?.data?.accessToken;
  if (!body?.success || !accessToken) {
    throw new Error(body?.msg || '刷新登录状态失败，请稍后重试');
  }
  return body.data as AuthApi.LoginResult;
}

/**
 * 退出登录
 */
export async function logoutApi(accessToken?: null | string) {
  const response = await baseRequestClient.post('/auth/logout', undefined, {
    withCredentials: true,
    // baseRequestClient 不带通用认证拦截器，显式传入当前 Access Token，
    // 这样正常退出时后端可以同时撤销当前登录会话和 Refresh Session。
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  });
  const body = (
    response as unknown as {
      data?: { code?: number | string; msg?: string; success?: boolean };
    }
  ).data;
  // ContiNew 业务失败默认仍使用 HTTP 200 返回，不能只依赖 Axios 的 HTTP 状态判断。
  // 否则 Redis 撤销失败时前端会误以为退出成功，服务端 Refresh Session 仍可能存活。
  if (
    body?.success === false ||
    ((body?.success === null || body?.success === undefined) &&
      body?.code !== null &&
      body?.code !== undefined &&
      String(body.code) !== '0')
  ) {
    throw new Error(body.msg || '退出登录失败，请稍后重试');
  }
  return response;
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
