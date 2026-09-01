<script lang="ts" setup>
import { onMounted } from 'vue';

import { useElementPlusDesignTokens } from '@vben/hooks';
import { updatePreferences } from '@vben/preferences';

import { ElConfigProvider } from 'element-plus';

import { ensureTenantAuthContext } from '#/api/tenant';
import { elementLocale } from '#/locales';

import { listSiteOptionDict } from './api/system';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();

onMounted(async () => {
  // 应用启动时先同步租户认证入口，再加载站点配置，保证登录页显示正确的租户模式。
  await ensureTenantAuthContext().catch(() => undefined);
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
