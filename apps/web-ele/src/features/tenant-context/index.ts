import { useAccessStore } from '@vben/stores';

import { getTenantIdByDomain, getTenantStatus } from '#/api';
import { useTenantStore } from '#/store';

/**
 * 登录页所需的租户上下文探测。
 *
 * 触发点统一收敛在路由守卫（进入登录页 / 会话恢复成功），避免 App.vue 的
 * onMounted 与路由 watch 因启动时序重复请求。
 */
let inflight: null | Promise<void> = null;

async function probe() {
  const tenantStore = useTenantStore();
  // 只有明确的布尔值才更新开关：请求失败或响应体异常时保留上次已知状态，
  // 由下次进入登录页重试，避免把「探测不到」误判成「租户功能已关闭」。
  const enabled = await getTenantStatus().catch(() => null);
  if (typeof enabled !== 'boolean') return;
  tenantStore.setTenantEnable(enabled);
  if (!enabled) {
    // 租户功能关闭时清理持久化的旧租户 ID，避免重新开启时误带旧上下文。
    tenantStore.resetTenantId();
    return;
  }
  // 域名识别仅用于登录前预识别：已登录会话的租户以服务端裁决值为准，
  // 域名结果不得覆盖，也不得把默认租户会话切到域名绑定租户。
  if (
    useAccessStore().accessToken ||
    tenantStore.tenantIdSource === 'session'
  ) {
    return;
  }
  try {
    // 明确返回空值表示域名已解绑；请求失败不进入此分支，避免网络抖动误清租户。
    const tenantId = await getTenantIdByDomain(window.location.hostname);
    tenantStore.applyDomainTenant(tenantId);
  } catch {
    // 查询失败 ≠ 域名解绑：保留现有上下文，下次触发重试。
  }
}

/**
 * 确保租户上下文就绪。并发/重复导航合并为一次请求；完成后释放，保证每次
 * 真正进入登录页都会重新探测，以跟随域名的重绑定与解绑。
 * 探测属于旁路，异常一律吞掉，不得冒泡到守卫或产生未处理的 promise 拒绝。
 */
export function ensureTenantContext(): Promise<void> {
  if (inflight) return inflight;
  inflight = probe()
    .catch(() => {})
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
