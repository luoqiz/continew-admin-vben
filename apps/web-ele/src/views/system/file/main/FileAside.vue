<script setup lang="ts">
import type { ElCard } from 'element-plus';

import type { FileTypeListItem } from '#/constant/file';

import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { SvgAppsIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { FileTypeList } from '#/constant/file';

import FileAsideStatistics from './FileAsideStatistics.vue';

const route = useRoute();
const router = useRouter();

const selectedKey = ref('0');

// 监听路由变化
watch(
  () => route.query,
  () => {
    selectedKey.value = (route.query.type as string) ?? '0';
  },
  {
    immediate: true,
  },
);

// 点击事件
const onClickItem = (item: FileTypeListItem) => {
  router.replace({
    path: route.path,
    query: { pageKey: route.path, type: item.value.toString() },
  });
};
</script>

<template>
  <div>
    <ElCard :body-style="{ padding: 0 }">
      <el-menu
        :default-openeds="['0']"
        :default-active="selectedKey"
        :router="false"
      >
        <el-sub-menu index="0">
          <template #title>
            <SvgAppsIcon />
            <span class="m-4">{{ $t('system.file.aside.fileType') }}</span>
          </template>
          <el-menu-item
            v-for="item in FileTypeList"
            :key="item.value.toString()"
            :index="item.value.toString()"
            @click="onClickItem(item)"
          >
            <VbenIcon :icon="`svg:${item.icon}`" class="size-6" />
            <span class="m-4">{{ $t(item.nameKey) }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </ElCard>
    <FileAsideStatistics />
  </div>
</template>

<style scoped lang="scss"></style>
