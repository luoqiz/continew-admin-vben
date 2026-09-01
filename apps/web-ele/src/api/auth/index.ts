import type { RequestClientConfig } from '@vben/request';
import type * as T from './type';

import { requestClient as http } from '#/api/request';

export type * from './type';

const BASE_URL = '/auth';

function tenantRequestConfig(tenantCode?: string): RequestClientConfig | undefined {
  if (!tenantCode) {
    return undefined;
  }
  return {
    headers: {
      // 无域名租户沿用旧模式；域名租户不传该头，后端使用当前 Host 解析。
      'X-Tenant-Code': tenantCode,
    },
  };
}

/** @desc 账号登录 */
export function accountLogin(req: T.AccountLoginReq, tenantCode?: string) {
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req, tenantRequestConfig(tenantCode));
}

/** @desc 手机号登录 */
export function phoneLogin(req: T.PhoneLoginReq, tenantCode?: string) {
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req, tenantRequestConfig(tenantCode));
}

/** @desc 邮箱登录 */
export function emailLogin(req: T.EmailLoginReq, tenantCode?: string) {
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req, tenantRequestConfig(tenantCode));
}

/** @desc 三方账号登录 */
export function socialLogin(req: any, tenantCode?: string) {
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req, tenantRequestConfig(tenantCode));
}

/** @desc 三方账号登录授权 */
export function socialAuth(source: string, tenantCode?: string) {
  return http.get<T.SocialAuthAuthorizeResp>(
    `${BASE_URL}/${source}`,
    tenantRequestConfig(tenantCode),
  );
}

/** @desc 查询社交登录回调目标 */
export function resolveSocialTarget(state: string) {
  // state 由后端 HMAC 签名，回调页据此安全回到原租户域名。
  return http.get<T.SocialAuthTargetResp>(`${BASE_URL}/social/target`, {
    params: { state },
  });
}

/** @desc 退出登录 */
export function logout() {
  return http.post(`${BASE_URL}/logout`);
}

/** @desc 获取用户信息 */
export const getUserInfo = () => {
  return http.get<T.UserInfo>(`${BASE_URL}/user/info`);
};

/** @desc 获取路由信息 */
export const getUserRoute = () => {
  return http.get<T.RouteItem[]>(`${BASE_URL}/user/route`);
};
