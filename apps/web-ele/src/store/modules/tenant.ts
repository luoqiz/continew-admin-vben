import type { BasicOption } from '@vben/types';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

export const useTenantStore = defineStore(
  'tenant',
  () => {
    const tenantEnabled = ref<boolean>(false);
    const tenantId = ref<string>();
    const tenantOptions = ref<BasicOption[]>([]);

    const setTenantEnable = (status: boolean) => {
      tenantEnabled.value = status;
    };
    const setTenantId = (id: string) => {
      tenantId.value = id;
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
      return tenantEnabled.value && !tenantId.value;
    });

    // 判断租户是否已正确配置
    const isTenantConfigured = computed(() => {
      return tenantEnabled.value && !!tenantId.value;
    });

    // 清空租户ID
    const resetTenantId = () => {
      tenantId.value = undefined;
    };
    return {
      tenantEnabled,
      tenantId,
      setTenantEnable,
      setTenantId,
      needInputTenantCode,
      isTenantConfigured,
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
