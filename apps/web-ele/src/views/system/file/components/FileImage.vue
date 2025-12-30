<script setup lang="ts">
import type { FileItem } from '#/api/system';

import { computed } from 'vue';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { FileIcon, ImageTypes } from '#/constant/file';

interface Props {
  data: FileItem;
}

const props = withDefaults(defineProps<Props>(), {});

// 是否是图片类型文件
const isImage = computed(() => {
  const extension = props.data.extension?.toLowerCase();
  return ImageTypes.includes(extension);
});

// 获取文件图标，如果是图片就显示图片
const getFileImg = computed<string>(() => {
  // 文件夹
  if (props.data.type === 0) {
    return FileIcon.dir;
  }
  const extension = props.data.extension?.toLowerCase();
  if (ImageTypes.includes(extension)) {
    return props.data.url || '';
  }
  if (!Object.keys(FileIcon).includes(extension)) {
    return FileIcon.other;
  }
  return FileIcon[extension];
});
</script>

<template>
  <div>
    <img
      v-if="isImage"
      class="file-image"
      :src="props.data.thumbnailUrl"
      alt=""
    />
    <VbenIcon :icon="`svg:${getFileImg}`" class="h-full w-full" />
  </div>
</template>

<style scoped lang="scss">
.file-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
