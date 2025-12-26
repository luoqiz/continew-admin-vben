<script setup lang="ts">
import type { ElCol, ElRow } from 'element-plus';

import FileAside from './main/FileAside.vue';
import FileMain from './main/FileMain/index.vue';

defineOptions({ name: 'SystemFile' });
</script>

<template>
  <ElRow :gutter="14" class="file-manage">
    <ElCol
      :xs="0"
      :sm="8"
      :md="7"
      :lg="6"
      :xl="5"
      :xxl="4"
      flex="220px"
      class="h-full overflow-hidden"
    >
      <FileAside />
    </ElCol>
    <ElCol
      :xs="24"
      :sm="16"
      :md="17"
      :lg="18"
      :xl="19"
      :xxl="20"
      flex="1"
      class="h-full overflow-hidden"
    >
      <FileMain />
    </ElCol>
  </ElRow>
</template>

<style scoped lang="scss">
.file-manage {
  flex: 1;
  height: 100%;
  padding: var(--padding);
  overflow: hidden;
}
</style>
