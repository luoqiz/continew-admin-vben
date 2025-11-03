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

import { Card, CardContent, ColPage, RowPage } from '@vben/common-ui';

import {
  getUnreadMessageCount,
  getUnreadNoticeCount,
} from '#/api/system/user-message';
import { useDevice } from '#/hooks';
import mittBus from '#/utils/mitt';

import MyMessage from './components/MyMessage.vue';
import MyNotice from './components/MyNotice.vue';

defineOptions({ name: 'UserMessage' });

const { width, isDesktop } = useDevice();

const colPageRef = ref<InstanceType<typeof ColPage>>();

const rowPageRef = ref<InstanceType<typeof RowPage>>();

const unreadMessageCount = ref(0);
const unreadNoticeCount = ref(0);

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
      <Card>
        <el-scrollbar class="h-full">
          <div class="flex flex-row gap-2 px-2 py-4">
            <div
              :class="`menu-title ${activeKey === item.key ? 'bg-blue-100' : ''}`"
              v-for="item in tabItems"
              :key="item.key"
              :label="item.title"
            >
              <TabPaneTitle
                :title="item.title"
                :count="item.count"
                :offset="[0, 0]"
                @click="change(item.key)"
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
        <Card class="h-full">
          <el-scrollbar class="h-full">
            <div class="flex flex-col gap-2 px-2 py-4">
              <div
                :class="`menu-title ${activeKey === item.key ? 'bg-blue-100' : ''}`"
                v-for="item in tabItems"
                :key="item.key"
                :label="item.title"
              >
                <TabPaneTitle
                  :title="item.title"
                  :count="item.count"
                  :offset="[0, 10]"
                  @click="change(item.key)"
                />
              </div>
            </div>
          </el-scrollbar>
        </Card>
      </template>
      <Card>
        <CardContent>
          <component :is="activeComponent" />
        </CardContent>
      </Card>
    </ColPage>
  </RowPage>
</template>

<style scoped lang="scss">
.menu-title {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    opacity: 0.7; /* 透明度 */
    filter: gray; /* filter为滤镜 gray为颜色 */
    filter: grayscale(100); /* 将图像转换为灰度图像 */
    transition: all 0.1s;
  }
}

.tab-pane-item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}
</style>
