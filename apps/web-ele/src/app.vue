<script lang="ts" setup>
import { onMounted } from 'vue';

import { useElementPlusDesignTokens } from '@vben/hooks';
import { updatePreferences } from '@vben/preferences';

import { ElConfigProvider } from 'element-plus';

import { elementLocale } from '#/locales';

import { listSiteOptionDict } from './api/system';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();

onMounted(async () => {
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
  });
});
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
  </ElConfigProvider>
</template>
