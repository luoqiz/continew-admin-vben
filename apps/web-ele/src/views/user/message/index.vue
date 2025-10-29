<script setup lang="tsx">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ColPage, RowPage } from '@vben/common-ui';

import {
  getUnreadMessageCount,
  getUnreadNoticeCount,
} from '#/api/system/user-message';
import { useDevice } from '#/hooks';
import mittBus from '#/utils/mitt';

import MyMessage from './components/MyMessage.vue';
import MyNotice from './components/MyNotice.vue';

defineOptions({ name: 'UserMessage' });

const { isDesktop } = useDevice();

const colPageRef = ref<InstanceType<typeof ColPage>>();

const rowPageRef = ref<InstanceType<typeof RowPage>>();

const unreadMessageCount = ref(0);
const unreadNoticeCount = ref(0);

const rowProps = ref({
  topCollapsedWidth: 2,
  topCollapsible: true,
  topWidth: isDesktop ? 0 : 10,
  resizable: true,
  bottomWidth: isDesktop ? 100 : 90,
  splitHandle: false,
  splitLine: false,
});

const colProps = ref({
  leftCollapsedWidth: 2,
  leftCollapsible: true,
  leftWidth: isDesktop ? 20 : 0,
  resizable: true,
  rightWidth: isDesktop ? 80 : 100,
  splitHandle: true,
  splitLine: true,
});

watch(
  isDesktop,
  (val) => {
    if (val) {
      rowPageRef?.value?.collapseTop();
      colPageRef?.value?.expandLeft();
    } else {
      rowPageRef?.value?.expandTop();
      colPageRef?.value?.collapseLeft();
    }
  },
  { immediate: true },
);

const TabPaneTitle = defineComponent({
  props: {
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  setup(props) {
    return () => (
      <div class="tab-pane-item">
        <div>{props.title}</div>
        <el-badge max={99} value={props.count} />
      </div>
    );
  },
});

const tabItems = computed(() => [
  { key: 'msg', title: '我的消息', count: unreadMessageCount.value },
  { key: 'notice', title: '我的公告', count: unreadNoticeCount.value },
]);

const getMessageData = async () => {
  const data = await getUnreadMessageCount();
  unreadMessageCount.value = data.total;
};

const getNoticeData = async () => {
  const data = await getUnreadNoticeCount();
  unreadNoticeCount.value = data.total;
};

onMounted(() => {
  getMessageData();
  getNoticeData();
  mittBus.on('count-refresh', () => {
    getMessageData();
    getNoticeData();
  });
});

const menuList = [
  { name: '我的消息', key: 'msg', value: MyMessage },
  { name: '我的公告', key: 'notice', value: MyNotice },
];

const route = useRoute();
const router = useRouter();
const activeKey = ref('msg');
watch(
  () => route.query,
  () => {
    if (route.query.tab) {
      activeKey.value = String(route.query.tab);
    }
  },
  { immediate: true },
);
const change = (key: number | string) => {
  activeKey.value = key as string;
  router.replace({ path: route.path, query: { tab: key } });
};
</script>

<template>
  <RowPage auto-content-height v-bind="rowProps" ref="rowPageRef">
    <template #top v-if="!isDesktop">
      <div
        class="bg-card border-border relative h-full w-full items-end border-b px-6 py-2"
      >
        <el-scrollbar class="h-24">
          <div class="flex h-12 flex-row items-end justify-items-end gap-2">
            <span
              class="menu-title"
              v-for="item in tabItems"
              :key="item.key"
              :label="item.title"
            >
              <el-badge :value="item.count" class="item">
                <el-button @click="change(item.key)">{{
                  item.title
                }}</el-button>
              </el-badge>
            </span>
          </div>
        </el-scrollbar>
      </div>
    </template>
    <ColPage auto-content-height v-bind="colProps" ref="colPageRef">
      <template #left v-if="isDesktop">
        <div class="h-full w-full bg-yellow-100">
          <el-scrollbar>
            <div class="flex flex-col gap-2">
              <div
                class="menu-title"
                v-for="item in tabItems"
                :key="item.key"
                :label="item.title"
              >
                <el-badge :value="item.count" class="item">
                  <el-button @click="change(item.key)">
                    {{ item.title }}
                  </el-button>
                </el-badge>
                <TabPaneTitle
                  :title="item.title"
                  :count="item.count"
                  @click="change(item.key)"
                />
              </div>
            </div>
          </el-scrollbar>
        </div>
      </template>
      <component :is="menuList.find((item) => item.key === activeKey)?.value" />
    </ColPage>
  </RowPage>
</template>

<style scoped lang="scss">
.tab-pane-item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;

  &:hover {
    cursor: pointer;
    background: var(--color-fill-1);
  }
}
</style>
