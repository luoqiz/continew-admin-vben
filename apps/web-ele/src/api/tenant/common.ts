import { requestClient as http } from '#/api/request';
import { useTenantStore } from '#/store/modules/tenant';

const BASE_URL = '/tenant/common';

export type TenantAuthMode = 'PLATFORM' | 'DOMAIN' | 'LEGACY';

export interface TenantAuthContextResp {
  mode: TenantAuthMode;
  tenantEnabled: boolean;
}

/** @desc 查询当前租户认证入口 */
export function getTenantAuthContext() {
  // 入口类型由后端依据 Host 判定，前端不从 URL 或本地缓存自行推断租户。
  return http.get<TenantAuthContextResp>(`${BASE_URL}/context`);
}

let tenantAuthContextPromise: Promise<void> | null = null;

/** @desc 初始化当前租户认证入口（应用生命周期内只请求一次） */
export function ensureTenantAuthContext() {
  if (!tenantAuthContextPromise) {
    // 缓存初始化 Promise，避免多个路由守卫并发请求导致租户状态来回覆盖。
    tenantAuthContextPromise = getTenantAuthContext()
      .then((data) => {
        useTenantStore().setAuthContext(data.mode, data.tenantEnabled);
      })
      .catch((error) => {
        tenantAuthContextPromise = null;
        throw error;
      });
  }
  return tenantAuthContextPromise;
}

/** @desc 根据域名查询租户 ID */
export function getTenantIdByDomain(domain: string) {
  // 该接口主要服务于租户管理等业务查询；真正的请求租户上下文仍由后端解析。
  return http.get<string>(`${BASE_URL}/id`, { params: { domain } });
}
