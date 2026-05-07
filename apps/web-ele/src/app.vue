<script lang="ts" setup>
import { onMounted } from 'vue';

import { useElementPlusDesignTokens } from '@vben/hooks';
import { updatePreferences } from '@vben/preferences';

import { ElConfigProvider } from 'element-plus';

import { elementLocale } from '#/locales';

import { listSiteOptionDict } from './api/system';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();

onMounted(() => {
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
