<script setup lang="ts">
import type { FileItem } from '#/api/system';

import { onMounted } from 'vue';

import Player from 'xgplayer';

interface Props {
  data: FileItem;
}
const props = withDefaults(defineProps<Props>(), {});

onMounted(() => {
  Player({
    id: 'videoId',
    url: props.data?.url ?? '',
    lang: 'zh-cn',
    autoplay: true,
    closeVideoClick: true,
    videoInit: true,
  });
});
</script>

<template>
  <div id="videoId"></div>
</template>

<style scoped lang="scss"></style>
