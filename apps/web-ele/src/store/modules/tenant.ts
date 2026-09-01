import type { BasicOption } from '@vben/types';
import type { TenantAuthMode } from '#/api/tenant/common';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

export const TENANT_AUTH_CODE_STORAGE_KEY = 'tenant-auth-code';

export const useTenantStore = defineStore(
  'tenant',
  () => {
    const tenantEnabled = ref<boolean>(false);
    const tenantId = ref<string>();
    const tenantCode = ref<string>();
    const tenantAuthMode = ref<TenantAuthMode>('LEGACY');
    const tenantOptions = ref<BasicOption[]>([]);

    const setTenantEnable = (status: boolean) => {
      tenantEnabled.value = status;
    };
    const setTenantId = (id?: string) => {
      tenantId.value = id;
    };

    const setTenantCode = (code?: string) => {
      tenantCode.value = code;
    };

    const setAuthContext = (mode: TenantAuthMode, enabled: boolean) => {
      // 每次应用启动都以当前 Host 的认证模式为准，清理上一个域名留下的租户状态。
      tenantAuthMode.value = mode;
      tenantEnabled.value = enabled;
      if (mode !== 'LEGACY') {
        // 平台/普通租户域名不需要前端输入或持久化旧模式租户信息。
        tenantId.value = undefined;
        tenantCode.value = undefined;
      }
    };

    // 登录成功后添加租户选项
    const addTenantOption = (option: BasicOption) => {
      tenantOptions.value.push(option);
    };

    // 清空租户选项
    const clearTenantOptions = () => {
      tenantOptions.value = [];
    };

    // 判断是否需要用户输入租户编码
    const needInputTenantCode = computed(() => {
      return tenantEnabled.value && tenantAuthMode.value === 'LEGACY' && !tenantId.value;
    });

    // 判断租户是否已正确配置
    const isTenantConfigured = computed(() => {
      return !tenantEnabled.value || tenantAuthMode.value !== 'LEGACY' || !!tenantId.value;
    });

    const shouldSendTenantHeader = computed(() => {
      // 只有兼容入口才附加 X-Tenant-Id；域名入口由后端覆盖客户端租户头。
      return tenantEnabled.value && tenantAuthMode.value === 'LEGACY' && !!tenantId.value;
    });

    // 清空租户ID
    const resetTenantId = () => {
      tenantId.value = undefined;
      tenantCode.value = undefined;
    };
    return {
      tenantEnabled,
      tenantId,
      tenantCode,
      tenantAuthMode,
      setTenantEnable,
      setTenantId,
      setTenantCode,
      setAuthContext,
      needInputTenantCode,
      isTenantConfigured,
      shouldSendTenantHeader,
      resetTenantId,
      tenantOptions,
      addTenantOption,
      clearTenantOptions,
    };
  },
  {
    persist: {
      pick: ['tenantEnabled', 'tenantId', 'tenantOptions'],
      storage: localStorage,
    },
  },
);
