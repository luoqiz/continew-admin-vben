<script setup lang="ts">
import { onMounted } from 'vue';

import { getTenantStatus } from '#/api';
import { getTenantIdByDomain } from '#/api/tenant';
import { useTenantStore } from '#/store';

import login from './login.vue';

const tenantStore = useTenantStore();

// 查询租户状态和租户编码
const onGetTenant = async () => {
  const data = await getTenantStatus();
  tenantStore.setTenantEnable(data);
  // 开启租户 根据地址(域名)查询租户code
  if (data) {
    const domain = window.location.hostname;
    const tenantId = await getTenantIdByDomain(domain);
    tenantStore.setTenantId(tenantId);
  }
};
onMounted(async () => {
  await onGetTenant();
});
</script>
<template>
  <div class="">
    <login />
  </div>
</template>
<style lang="scss" scoped></style>
