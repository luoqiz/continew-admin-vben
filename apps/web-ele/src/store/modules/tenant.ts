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
    const setTenantId = (id?: null | number | string) => {
      // 后端返回的租户 ID 可能是数字、字符串或空值，统一转换后再持久化。
      tenantId.value = id == null ? undefined : String(id);
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

    /**
     * 重置租户状态。
     *
     * Pinia 对 setup 语法的 Store 不会自动生成 $reset 方法，而公共退出流程
     * 会统一调用所有 Store 的 $reset。因此这里必须手动实现，确保退出后不会
     * 把上一次登录会话的租户 ID和选项带到下一次登录。tenantEnabled 是应用级能力
     * 开关，不是登录会话数据，退出时不能重置，否则普通租户再次登录时不会显示
     * 租户编码输入框。
     */
    const $reset = () => {
      tenantId.value = undefined;
      tenantOptions.value = [];
    };

    return {
      $reset,
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
