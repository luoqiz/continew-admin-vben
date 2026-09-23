<script setup lang="tsx">
import type { Component } from 'vue';

import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Card, ColPage, RowPage, VbenIcon } from '@vben/common-ui';

import { useDevice } from '#/hooks';
import has from '#/utils/has';

import ClientConfig from './client/index.vue';
import LoginConfig from './login/index.vue';
import MailConfig from './mail/index.vue';
import SecurityConfig from './security/index.vue';
import SiteConfig from './site/index.vue';
import SmsConfig from './sms/index.vue';
import StorageConfig from './storage/index.vue';

// 注册本目录下载的本地 svg 图标（svg:globe 等），须在渲染菜单前执行
import '#/assets/icons/loader';

defineOptions({ name: 'SystemConfig' });

const { width, isDesktop } = useDevice();

const colPageRef = ref<InstanceType<typeof ColPage>>();
const rowPageRef = ref<InstanceType<typeof RowPage>>();

const rowProps = ref({
  topCollapsedWidth: 2,
  topCollapsible: true,
  topWidth: isDesktop ? 0 : 12,
  resizable: false,
  bottomWidth: isDesktop ? 100 : 88,
  splitHandle: false,
  splitLine: false,
});

const colProps = ref({
  leftCollapsedWidth: 2,
  leftCollapsible: true,
  leftWidth: isDesktop ? 18 : 0,
  resizable: false,
  rightWidth: isDesktop ? 82 : 100,
  splitHandle: false,
  splitLine: false,
});

interface ConfigMenu {
  icon: string;
  key: string;
  name: string;
  permissions: string[];
  value: Component;
}

const data: ConfigMenu[] = [
  {
    icon: 'svg:globe',
    key: 'site',
    name: '网站配置',
    permissions: ['system:siteConfig:get'],
    value: SiteConfig,
  },
  {
    icon: 'svg:shield-check',
    key: 'security',
    name: '安全配置',
    permissions: ['system:securityConfig:get'],
    value: SecurityConfig,
  },
  {
    icon: 'svg:lock-keyhole',
    key: 'login',
    name: '登录配置',
    permissions: ['system:loginConfig:get'],
    value: LoginConfig,
  },
  {
    icon: 'svg:mail',
    key: 'mail',
    name: '邮件配置',
    permissions: ['system:mailConfig:get'],
    value: MailConfig,
  },
  {
    icon: 'svg:message-square-text',
    key: 'sms',
    name: '短信配置',
    permissions: ['system:smsConfig:list'],
    value: SmsConfig,
  },
  {
    icon: 'svg:hard-drive',
    key: 'storage',
    name: '存储配置',
    permissions: ['system:storage:list'],
    value: StorageConfig,
  },
  {
    icon: 'svg:smartphone',
    key: 'client',
    name: '客户端配置',
    permissions: ['system:client:list'],
    value: ClientConfig,
  },
];

const menuList = computed(() => {
  return data.filter((item) => {
    return has.hasPermOr(item.permissions);
  });
});

const route = useRoute();
const router = useRouter();
const activeKey = ref(menuList.value[0]?.key || 'site');
const activeComponent = computed(() => {
  return menuList.value.find((item) => item.key === activeKey.value)?.value;
});

// 按图标 + 名称渲染菜单项（桌面左侧纵向 / 移动端顶部横向）
const MenuItem = defineComponent({
  props: {
    active: { type: Boolean, default: false },
    icon: { type: String, required: true },
    name: { type: String, required: true },
  },
  setup(props) {
    return () => (
      <div
        class={[
          'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors',
          props.active
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-accent text-foreground',
        ]}
      >
        <VbenIcon class="size-5 shrink-0" icon={props.icon} />
        <span class="truncate">{props.name}</span>
      </div>
    );
  },
});

const change = (key: string) => {
  activeKey.value = key;
  router.replace({ path: route.path, query: { tab: key } });
};

// 监听路由参数变化，更新 activeKey（支持菜单深链 /system/config?tab=xxx）
watch(
  () => route.query.tab,
  (tab) => {
    if (tab && menuList.value.some((item) => item.key === String(tab))) {
      activeKey.value = String(tab);
    }
  },
  { immediate: true },
);

const changeWindowWidth = () => {
  nextTick(() => {
    if (isDesktop.value) {
      rowPageRef?.value?.collapseTop();
      colPageRef?.value?.expandLeft();
    } else {
      rowPageRef?.value?.topPanelRef?.resize(12);
      rowPageRef?.value?.expandTop();
      colPageRef?.value?.collapseLeft();
    }
  });
};
watch(width, changeWindowWidth, { immediate: true });
</script>

<template>
  <RowPage
    auto-content-height
    v-bind="rowProps"
    ref="rowPageRef"
    content-class="py-0"
  >
    <template #top v-if="!isDesktop">
      <Card class="h-full overflow-hidden py-4">
        <el-scrollbar class="h-full">
          <div class="flex flex-row gap-2 px-2">
            <div
              v-for="item in menuList"
              :key="item.key"
              class="min-w-25 flex-1"
              @click="change(item.key)"
            >
              <MenuItem
                :active="activeKey === item.key"
                :icon="item.icon"
                :name="item.name"
              />
            </div>
          </div>
        </el-scrollbar>
      </Card>
    </template>
    <ColPage
      auto-content-height
      v-bind="colProps"
      ref="colPageRef"
      content-class="p-0"
    >
      <template #left v-if="isDesktop">
        <Card class="h-full overflow-hidden py-3">
          <el-scrollbar class="h-full">
            <div class="flex flex-col gap-1 px-2">
              <div
                v-for="item in menuList"
                :key="item.key"
                @click="change(item.key)"
              >
                <MenuItem
                  :active="activeKey === item.key"
                  :icon="item.icon"
                  :name="item.name"
                />
              </div>
            </div>
          </el-scrollbar>
        </Card>
      </template>
      <!-- 右侧配置表单：滚动由该容器管理，表单自身限宽居中 -->
      <div class="h-full overflow-y-auto p-4">
        <component :is="activeComponent" />
      </div>
    </ColPage>
  </RowPage>
</template>
