<script setup lang="ts">
import type { ElCard } from 'element-plus';

import type { FileTypeListItem } from '#/constant/file';

import { watch } from 'node:fs';
import { ref } from 'node:process';

import { useRoute, useRouter } from 'vue-router';

import { FileTypeList } from '#/constant/file';

import FileAsideStatistics from './FileAsideStatistics.vue';

const route = useRoute();
const router = useRouter();

const selectedKey = ref('0');

// 监听路由变化
watch(
  () => route.query,
  () => {
    selectedKey.value = (route.query.type as string) || '0';
  },
  {
    immediate: true,
  },
);

// 点击事件
const onClickItem = (item: FileTypeListItem) => {
  router.replace({ name: 'SystemFile', query: { type: item.value } });
};
</script>

<template>
  <div>
    <ElCard title="" :bordered="false" :body-style="{ padding: 0 }">
      <a-menu :default-open-keys="['0']" :selected-keys="[selectedKey]">
        <a-sub-menu key="0">
          <template #icon>
            <icon-apps />
          </template>
          <template #title>文件类型</template>
          <a-menu-item
            v-for="item in FileTypeList"
            :key="item.value.toString()"
            @click="onClickItem(item)"
          >
            <template #icon>
              <GiSvgIcon :size="28" :name="item.icon" />
            </template>
            <span>{{ item.name }}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </ElCard>
    <FileAsideStatistics />
  </div>
</template>

<style scoped lang="scss">
:deep(.arco-card) {
  .arco-card-header {
    padding-right: 0;
    padding-left: 0;
    margin: 0 16px;
    border-bottom-style: dashed;

    .arco-card-header-title {
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
      color: var(--color-text-1);
    }
  }
}
</style>
