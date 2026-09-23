<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
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
const route = useRoute();

// 确保租户上下文就绪（幂等，可重复触发）：
// ① 状态探测无条件执行——结果决定租户能力开关，失败时保留上次已知状态；
// ② 域名查询仅在「开启租户且租户未由登录会话确定」时执行——
//    登录/刷新响应的租户是服务端裁决值，域名结果不得覆盖；
//    域名结果覆盖 domain 来源的旧值与空值，从而跟随域名的重绑定与解绑。
const ensureTenant = async () => {
  const enabled = await getTenantStatus().catch(() => null);
  if (enabled === null) return;
  tenantStore.setTenantEnable(enabled);

  if (!enabled) {
    // 租户功能关闭时清理持久化的旧租户 ID，避免后续重新开启租户功能时误带旧上下文。
    tenantStore.resetTenantId();
    return;
  }
  // 已登录会话（session 来源=服务端裁决值）：跳过域名探测，域名结果不得覆盖会话租户。
  // domain 来源/空值则每次重探测——跟随域名的重绑定与解绑。
  if (tenantStore.tenantIdSource === 'session') return;

  const domain = window.location.hostname;
  const tenantId = await getTenantIdByDomain(domain).catch(() => null);
  tenantStore.applyDomainTenant(tenantId);
};
onMounted(ensureTenant);
// 登出 / 会话死亡被踢回登录页时重新探测（此时租户上下文已被清理，域名结果需重新填入）
watch(
  () => route.path === LOGIN_PATH,
  (onLogin) => {
    if (onLogin) ensureTenant();
  },
);

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
