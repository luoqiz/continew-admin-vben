<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Page,
} from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { MsArrowBackIos } from '@vben/icons';

import { getUserNotice } from '#/api/system/user-message';
import { useResetReactive } from '#/hooks';
import { useMessageStore } from '#/store';

import AiEditor from './components/index.vue';

defineOptions({ name: 'UserNotice' });

const route = useRoute();
const router = useRouter();
const { closeCurrentTab } = useTabs();
const messageStore = useMessageStore();

const { id } = route.query;
const [form, resetForm] = useResetReactive({
  title: '',
  createUserString: '',
  publishTime: '',
  content: '',
});

// 回退
const onBack = () => {
  closeCurrentTab();
  router.push({ path: '/user/message', query: { tab: 'notice' } });
};

// 打开
const onOpen = async (id: string) => {
  resetForm();
  const data = await getUserNotice(id);
  Object.assign(form, data);
  // 查看即已读：刷新共享未读计数，铃铛与消息中心徽标保持一致
  messageStore.refreshUnreadCounts();
};

onMounted(() => {
  onOpen(id as string);
});
</script>

<template>
  <Page auto-content-height>
    <Card class="flex h-full flex-col overflow-hidden">
      <!-- 头部与公告新增/编辑页保持同一模式：返回图标 + 标题 -->
      <CardHeader class="shrink-0 border-b">
        <CardTitle class="flex flex-row items-center justify-between">
          <div class="flex flex-row items-center">
            <span
              class="flex cursor-pointer items-center rounded p-1 transition-colors hover:bg-accent"
              @click="onBack"
            >
              <MsArrowBackIos class="size-6" />
            </span>
            <span class="ml-1 text-base font-medium">通知公告 | 查看</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="detail-content min-h-0 flex-1 overflow-y-auto">
        <h1 class="title mb-4">{{ form?.title }}</h1>
        <div class="info mb-6">
          <el-space>
            <span>
              <el-icon><user-icon /></el-icon>
              <span class="label">发布人：</span>
              <span>{{ form?.createUserString }}</span>
            </span>
            <el-divider direction="vertical" />
            <span>
              <el-icon><history-icon /></el-icon>
              <span class="label">发布时间：</span>
              <span>{{ form?.publishTime }}</span>
            </span>
            <el-divider v-if="form?.updateTime" direction="vertical" />
            <span v-if="form?.updateTime">
              <el-icon><schedule-icon /></el-icon>
              <span>更新时间：</span>
              <span>{{ form?.updateTime }}</span>
            </span>
          </el-space>
        </div>
        <AiEditor v-model="form.content" />
      </CardContent>
    </Card>
  </Page>
</template>

<style scoped lang="scss">
.detail-content {
  .title {
    font-size: 32px;
    text-align: center;
  }

  .info {
    display: flex;
    justify-content: center;
  }
}
</style>
