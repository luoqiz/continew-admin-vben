<script setup lang="tsx">
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { useDevice } from '#/hooks';
import has from '#/utils/has';

import ClientConfig from './client/index.vue';
import LoginConfig from './login/index.vue';
import MailConfig from './mail/index.vue';
import SecurityConfig from './security/index.vue';
import SiteConfig from './site/index.vue';
import SmsConfig from './sms/index.vue';
import StorageConfig from './storage/index.vue';

defineOptions({ name: 'SystemConfig' });

const { isDesktop } = useDevice();
const tabPosition = computed(() => (isDesktop.value ? 'left' : 'top'));

const data = [
  {
    name: '网站配置',
    key: 'site',
    icon: 'apps',
    permissions: ['system:siteConfig:get'],
    value: SiteConfig,
  },
  {
    name: '安全配置',
    key: 'security',
    icon: 'safe',
    permissions: ['system:securityConfig:get'],
    value: SecurityConfig,
  },
  {
    name: '登录配置',
    key: 'login',
    icon: 'lock',
    permissions: ['system:loginConfig:get'],
    value: LoginConfig,
  },
  {
    name: '邮件配置',
    key: 'mail',
    icon: 'email',
    permissions: ['system:mailConfig:get'],
    value: MailConfig,
  },
  {
    name: '短信配置',
    key: 'sms',
    icon: 'message',
    permissions: ['system:smsConfig:list'],
    value: SmsConfig,
  },
  {
    name: '存储配置',
    key: 'storage',
    icon: 'storage',
    permissions: ['system:storage:list'],
    value: StorageConfig,
  },
  {
    name: '客户端配置',
    key: 'client',
    icon: 'mobile',
    permissions: ['system:client:list'],
    value: ClientConfig,
  },
];

const menuList = computed(() => {
  return data.filter((item) => {
    return has.hasPermOr(item.permissions);
  });
});

const activeKey = ref(menuList.value[0]?.key || 'site');
</script>

<template>
  <Page auto-content-height>
    <el-tabs
      v-model="activeKey"
      :tab-position="tabPosition"
      stretch
      type="border-card"
    >
      <el-tab-pane v-for="item in menuList" :key="item.key" :name="item.key">
        <template #label>
          <div style="display: flex; align-items: center">
            <VbenIcon :icon="`svg:${item.icon}`" class="mr-4px size-6" />
            {{ item.name }}
          </div>
        </template>
        <component :is="item.value" />
      </el-tab-pane>
    </el-tabs>
  </Page>
</template>

<style scoped lang="scss"></style>
