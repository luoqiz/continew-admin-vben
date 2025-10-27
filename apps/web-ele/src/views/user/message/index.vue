<script setup lang="tsx">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  getUnreadMessageCount,
  getUnreadNoticeCount,
} from '#/api/system/user-message';
import GiPageLayout from '#/components/GiPageLayout/index.vue';
import { useDevice } from '#/hooks';
import mittBus from '#/utils/mitt';

import MyMessage from './components/MyMessage.vue';
import MyNotice from './components/MyNotice.vue';

defineOptions({ name: 'UserMessage' });

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

const { isDesktop } = useDevice();

const unreadMessageCount = ref(0);
const unreadNoticeCount = ref(0);

const tabItems = computed(() => [
  { key: 'msg', title: '我的消息', count: unreadMessageCount.value },
  { key: 'notice', title: '我的公告', count: unreadNoticeCount.value },
]);

const getMessageData = async () => {
  const { data } = await getUnreadMessageCount();
  unreadMessageCount.value = data.total;
};

const getNoticeData = async () => {
  const { data } = await getUnreadNoticeCount();
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
  <GiPageLayout
    :margin="true"
    :default-collapsed="false"
    :header-style="
      isDesktop ? { borderBottomWidth: 0 } : { borderBottomWidth: '1px' }
    "
  >
    <template v-if="isDesktop" #left>
      <el-scrollbar height="400px">
        <div class="flex flex-col gap-2">
          <span
            class="menu-title"
            v-for="item in tabItems"
            :key="item.key"
            :label="item.title"
          >
            <el-badge :value="item.count" class="item">
              <el-button @click="change">{{ item.title }}</el-button>
            </el-badge>
          </span>
        </div>
      </el-scrollbar>
    </template>
    <template v-else #header>
      <el-tabs
        v-if="!isDesktop"
        v-model="activeKey"
        type="card"
        @tab-click="change"
      >
        <el-tab-pane
          v-for="item in tabItems"
          :key="item.key"
          :label="item.title"
        >
          <TabPaneTitle :title="item.title" :count="item.count" />
        </el-tab-pane>
      </el-tabs>
      <el-scrollbar height="100px">
        <div class="flex flex-col gap-2">
          <span
            class="menu-title"
            v-for="item in tabItems"
            :key="item.key"
            :label="item.title"
          >
            <el-badge :value="item.count" class="item">
              <el-button @click="change">{{ item.title }}</el-button>
            </el-badge>
          </span>
        </div>
      </el-scrollbar>
    </template>
    <component :is="menuList.find((item) => item.key === activeKey)?.value" />
  </GiPageLayout>
</template>

<style scoped lang="scss">
.item {
  width: 100%;
  margin-top: 10px;
  margin-right: 30px;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
  color: #6b778c;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>
