<script setup lang="ts">
import type { NoticeResp } from '#/api/system/notice';

import { computed, onMounted, ref } from 'vue';
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

import { ElSpace } from 'element-plus';

import { getNotice } from '#/api/system/notice';

import RichText from './components/index.vue';

const route = useRoute();
const router = useRouter();
const { closeCurrentTab } = useTabs();

const { id } = route.query;
const dataDetail = ref<NoticeResp>();
const content = computed(() => dataDetail.value?.content ?? '');

// 回退
const onBack = () => {
  closeCurrentTab();
  router.push('/system/notice');
};

// 打开
const onOpen = async (id: string) => {
  const data = await getNotice(id);
  dataDetail.value = data;
};

onMounted(() => {
  onOpen(id as string);
});
</script>
<template>
  <Page auto-content-height>
    <Card class="flex h-full flex-col">
      <CardHeader>
        <CardTitle class="flex flex-row items-center">
          <span @click="onBack" style="cursor: pointer">
            <MsArrowBackIos class="size-6" />
          </span>
          <span>
            {{ $t('system.notice.listTitle') }} | {{ $t('common.detail') }}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent class="h-full flex-1">
        <div class="detail-content flex h-full flex-col gap-4">
          <h1 class="title">{{ dataDetail?.title }}</h1>
          <div class="info">
            <ElSpace>
              <span>
                <icon-user class="icon" />
                <span class="label">
                  {{ $t('system.notice.createUser') }}：
                </span>
                <span>{{ dataDetail?.createUserString }}</span>
              </span>
              <a-divider direction="vertical" />
              <span>
                <icon-history class="icon" />
                <span class="label">
                  {{ $t('system.notice.publishTime') }}：
                </span>
                <span>{{ dataDetail?.publishTime }}</span>
              </span>
              <a-divider v-if="dataDetail?.updateTime" direction="vertical" />
              <span v-if="dataDetail?.updateTime">
                <icon-schedule class="icon" />
                <span>{{ $t('system.notice.updateTime') }}：</span>
                <span>{{ dataDetail?.updateTime }}</span>
              </span>
            </ElSpace>
          </div>
          <div style="flex: 1">
            <RichText v-model="content" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Page>
</template>
<style scoped lang="scss">
.detail-content {
  h1 {
    font-size: 32px;
    text-align: center;
  }

  .info {
    font-size: 14px;
    text-align: center;
  }

  .icon {
    margin-right: 3px;
  }
}
</style>
