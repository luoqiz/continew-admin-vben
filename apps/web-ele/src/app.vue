<script lang="ts" setup>
import { onMounted } from 'vue';

import { useElementPlusDesignTokens } from '@vben/hooks';
import { updatePreferences } from '@vben/preferences';

import { ElConfigProvider } from 'element-plus';

import { getTenantStatus } from '#/api';
import { getTenantIdByDomain } from '#/api/tenant';
import { elementLocale } from '#/locales';
import { useTenantStore } from '#/store';

import { listSiteOptionDict } from './api/system';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();

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
  listSiteOptionDict().then((res) => {
    const resMap = new Map();
    res.forEach((item) => {
      resMap.set(item.label, item.value);
    });
    updatePreferences({
      app: {
        name: resMap.get('SITE_TITLE') || 'Vben Admin',
      },
      logo: {
        source: resMap.get('SITE_LOGO'),
        sourceDark: resMap.get('SITE_LOGO'),
      },
      copyright: {
        icp: resMap.get('SITE_COPYRIGHT') || '',
        settingShow: !!resMap.get('SITE_COPYRIGHT'),
      },
    });
    document
      .querySelector('link[rel="icon"]')
      ?.setAttribute('href', resMap.get('SITE_FAVICON') || '/favicon.ico');
    // siteConfig.SITE_FAVICON = resMap.get('SITE_FAVICON')
    // siteConfig.SITE_TITLE = resMap.get('SITE_TITLE')
    // siteConfig.SITE_BEIAN = resMap.get('SITE_BEIAN')
  });
});
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
  </ElConfigProvider>
</template>
