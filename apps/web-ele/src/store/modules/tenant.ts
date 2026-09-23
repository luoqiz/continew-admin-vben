import { ref } from 'vue';

import { defineStore } from 'pinia';

/** 本机租户登录历史条目（纯客户端记录，不依赖后端接口） */
interface TenantHistoryItem {
  /** 租户编码（下拉显示与登录提交值） */
  code: string;
  /** 租户 ID（登录响应固化后补充） */
  id?: string;
  /** 活跃时间戳：登录或令牌刷新成功即续期，超过 TTL 未活跃则淘汰 */
  lastLoginTime: number;
}

/** 历史上限（LRU，超出淘汰最旧） */
const TENANT_HISTORY_LIMIT = 20;
/** 15 天未活跃则淘汰 */
const TENANT_HISTORY_TTL = 15 * 24 * 60 * 60 * 1000;

export const useTenantStore = defineStore(
  'tenant',
  () => {
    const tenantEnabled = ref<boolean>(false);
    const tenantId = ref<string>();
    /** 租户 ID 来源：domain=域名识别 / session=登录与刷新响应（服务端裁决值） */
    const tenantIdSource = ref<'domain' | 'session' | undefined>();
    /** 本机租户登录历史（最近使用优先，跨登出保留，由 TTL/上限淘汰） */
    const loginHistory = ref<TenantHistoryItem[]>([]);

    const setTenantEnable = (status: boolean) => {
      tenantEnabled.value = status;
    };
    const setTenantId = (id?: null | number | string) => {
      // 后端返回的租户 ID 可能是数字、字符串或空值，统一转换后再持久化。
      tenantId.value = id === null || id === undefined ? undefined : String(id);
    };

    /**
     * 域名识别结果写入：session 来源优先（保护并发恢复的会话值），
     * domain 来源的旧值与空值则跟随域名的重绑定/解绑更新。
     *
     * app.vue 的启动/登录页探测专用——域名查询结果仅用于登录前预识别，
     * 不得覆盖登录/刷新写入的租户上下文，也不得清空已有值
     * （域名未绑定租户的部署下探测结果为空，无条件覆盖会把编码登录的租户清掉）。
     */
    const applyDomainTenant = (id?: null | number | string) => {
      if (tenantIdSource.value === 'session') return;
      setTenantId(id);
      tenantIdSource.value =
        tenantId.value === undefined ? undefined : 'domain';
    };

    /** 登录/刷新响应写入：服务端裁决值，无条件覆盖。 */
    const setSessionTenant = (id?: null | number | string) => {
      setTenantId(id);
      tenantIdSource.value =
        tenantId.value === undefined ? undefined : 'session';
    };

    /**
     * 会话确认死亡（restore 收到 401 / 登录过期弹窗打开前）调用：
     * 仅清理 session 来源的租户 ID，让登录表单的租户编码字段重新出现；
     * domain 来源的租户与登录会话无关，保留以维持域名绑定部署的无感重登。
     */
    const handleSessionInvalidated = () => {
      if (tenantIdSource.value === 'session') {
        resetTenantId();
      }
    };

    /** 淘汰超过 TTL 未活跃的历史条目（无变化时不动数组引用，避免触发无关响应式更新） */
    const pruneExpired = () => {
      const minLastLoginTime = Date.now() - TENANT_HISTORY_TTL;
      const next = loginHistory.value.filter(
        (item) => item.lastLoginTime >= minLastLoginTime,
      );
      if (next.length !== loginHistory.value.length) {
        loginHistory.value = next;
      }
    };

    /**
     * 记录一次租户登录：去重（按编码）、活跃时间刷新、MRU 排序、上限截断。
     * 空编码（默认租户）不记录——无可展示的下拉项。
     */
    const recordTenantLogin = (code: string, id?: null | number | string) => {
      pruneExpired();
      const codeTrimmed = String(code ?? '').trim();
      if (!codeTrimmed) return;
      const hasId = id !== null && id !== undefined;
      const exist = loginHistory.value.find(
        (item) => item.code === codeTrimmed,
      );
      if (exist) {
        exist.lastLoginTime = Date.now();
        if (hasId) exist.id = String(id);
      } else {
        loginHistory.value.push({
          code: codeTrimmed,
          id: hasId ? String(id) : undefined,
          lastLoginTime: Date.now(),
        });
      }
      loginHistory.value.sort((a, b) => b.lastLoginTime - a.lastLoginTime);
      if (loginHistory.value.length > TENANT_HISTORY_LIMIT) {
        loginHistory.value.length = TENANT_HISTORY_LIMIT;
      }
    };

    /** 令牌刷新成功时按租户 ID 续期活跃时间（活跃即续期口径，无匹配条目则跳过） */
    const touchTenantActivity = (id?: null | number | string) => {
      if (id === null || id === undefined) return;
      const item = loginHistory.value.find((item) => item.id === String(id));
      if (item) item.lastLoginTime = Date.now();
    };

    // 清空租户ID
    const resetTenantId = () => {
      tenantId.value = undefined;
      tenantIdSource.value = undefined;
    };

    /**
     * 重置租户状态。
     *
     * Pinia 对 setup 语法的 Store 不会自动生成 $reset 方法，而公共退出流程
     * 会统一调用所有 Store 的 $reset。因此这里必须手动实现。
     * - 租户 ID/来源：随登出清空，避免把上一次登录会话的租户带到下一次登录；
     * - tenantEnabled 是应用级能力开关，退出时不能重置，否则普通租户再次
     *   登录时不会显示租户编码字段；
     * - 登录历史保留：这是登录页下拉的数据来源，由 TTL 与上限自行淘汰。
     */
    const $reset = () => {
      tenantId.value = undefined;
      tenantIdSource.value = undefined;
    };

    return {
      $reset,
      tenantEnabled,
      tenantId,
      tenantIdSource,
      loginHistory,
      applyDomainTenant,
      setSessionTenant,
      handleSessionInvalidated,
      recordTenantLogin,
      touchTenantActivity,
      pruneExpired,
      setTenantEnable,
      setTenantId,
      resetTenantId,
    };
  },
  {
    persist: {
      pick: ['tenantEnabled', 'tenantId', 'tenantIdSource', 'loginHistory'],
      storage: localStorage,
    },
  },
);
