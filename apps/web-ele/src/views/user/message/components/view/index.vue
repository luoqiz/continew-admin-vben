<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { getUserNotice } from '#/api/system/user-message';
import { useResetReactive } from '#/hooks';

import AiEditor from './components/index.vue';

defineOptions({ name: 'UserNotice' });

const route = useRoute();
const router = useRouter();
const { closeCurrentTab } = useTabs();

const { id } = route.query;
const containerRef = ref<HTMLElement | null>();
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
};

onMounted(() => {
  onOpen(id as string);
});
</script>

<template>
  <div ref="containerRef" class="detail">
    <div class="detail_header">
      <el-affix :target="containerRef as HTMLElement">
        <el-page-header title="通知公告" content="查看" @back="onBack" />
      </el-affix>
    </div>
    <div class="detail-content">
      <h1 class="title">{{ form?.title }}</h1>
      <div class="info">
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
      <div style="flex: 1">
        <AiEditor v-model="form.content" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-content {
  .title {
    text-align: center;
  }

  .info {
    text-align: center;
  }

  .icon {
    margin-right: 3px;
  }
}
</style>
