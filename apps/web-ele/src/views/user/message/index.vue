<script setup lang="tsx">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Card, ColPage, RowPage } from '@vben/common-ui';

import { useDevice } from '#/hooks';
import { useMessageStore } from '#/store';

import MyMessage from './components/MyMessage.vue';
import MyNotice from './components/MyNotice.vue';

defineOptions({ name: 'UserMessage' });

const { width, isDesktop } = useDevice();

const colPageRef = ref<InstanceType<typeof ColPage>>();

const rowPageRef = ref<InstanceType<typeof RowPage>>();

const messageStore = useMessageStore();

const rowProps = ref({
  topCollapsedWidth: 2,
  topCollapsible: true,
  topWidth: isDesktop ? 0 : 10,
  resizable: false,
  bottomWidth: isDesktop ? 100 : 90,
  splitHandle: false,
  splitLine: false,
});

const colProps = ref({
  leftCollapsedWidth: 2,
  leftCollapsible: true,
  leftWidth: isDesktop ? 20 : 0,
  resizable: false,
  rightWidth: isDesktop ? 80 : 100,
  splitHandle: false,
  splitLine: false,
});

const TabPaneTitle = defineComponent({
  props: {
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
    offset: { type: Array, default: () => [0, 0] },
  },
  setup(props) {
    return () => (
      <div class="tab-pane-item">
        <div>{props.title}</div>
        <el-badge
          max={99}
          offset={props.offset}
          show-zero={false}
          value={props.count}
        />
      </div>
    );
  },
});

const tabItems = computed(() => [
  { key: 'msg', title: '我的消息', count: messageStore.unreadMessageCount },
  { key: 'notice', title: '我的公告', count: messageStore.unreadNoticeCount },
]);

onMounted(() => {
  messageStore.refreshUnreadCounts();
});

const menuList = [
  { name: '我的消息', key: 'msg', value: MyMessage },
  { name: '我的公告', key: 'notice', value: MyNotice },
];

const route = useRoute();
const router = useRouter();
const activeKey = ref('msg');
// 设置激活的组件
const activeComponent = computed(() => {
  return menuList.find((item) => item.key === activeKey.value)?.value;
});

const changeWindowWidth = () => {
  nextTick(() => {
    if (isDesktop.value) {
      rowPageRef?.value?.collapseTop();
      colPageRef?.value?.expandLeft();
    } else {
      rowPageRef?.value?.topPanelRef?.resize(10);
      rowPageRef?.value?.expandTop();
      colPageRef?.value?.collapseLeft();
    }
  });
};
// 监听路由参数变化，更新 activeKey
watch(
  () => route.query,
  () => {
    if (route.query.tab) {
      activeKey.value = String(route.query.tab);
      changeWindowWidth();
    }
  },
  { immediate: true },
);
const change = (key: number | string) => {
  activeKey.value = key as string;
  router.replace({ path: route.path, query: { tab: key } });
};

watch(
  width,
  () => {
    changeWindowWidth();
  },
  { immediate: true },
);
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
              v-for="item in tabItems"
              :key="item.key"
              class="menu-title flex-1"
              :class="{
                'menu-title-active': activeKey === item.key,
              }"
              @click="change(item.key)"
            >
              <TabPaneTitle
                :title="item.title"
                :count="item.count"
                :offset="[0, 0]"
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
        <Card class="h-full overflow-hidden py-4">
          <el-scrollbar class="h-full">
            <div class="flex flex-col gap-1 px-2">
              <div
                v-for="item in tabItems"
                :key="item.key"
                class="menu-title"
                :class="{
                  'menu-title-active': activeKey === item.key,
                }"
                @click="change(item.key)"
              >
                <TabPaneTitle
                  :title="item.title"
                  :count="item.count"
                  :offset="[0, 10]"
                />
              </div>
            </div>
          </el-scrollbar>
        </Card>
      </template>
      <!-- 右侧直接渲染列表组件：组件内部的 Page 自管高度，
           不能再用无高度的 Card 包裹，否则表格 height:auto 计算不出高度 -->
      <component :is="activeComponent" />
    </ColPage>
  </RowPage>
</template>

<style scoped lang="scss">
.menu-title {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition:
    background-color 0.15s,
    color 0.15s;

  &:hover {
    background-color: hsl(var(--accent));
  }
}

.menu-title-active {
  font-weight: 500;
  color: hsl(var(--primary));
  background-color: hsl(var(--primary) / 15%);

  &:hover {
    background-color: hsl(var(--primary) / 15%);
  }
}

.tab-pane-item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}
</style>
