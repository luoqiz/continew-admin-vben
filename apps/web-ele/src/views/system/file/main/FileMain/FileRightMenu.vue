<script setup lang="ts">
import type { FileItem } from '#/api/system';

// import GiOption from '/components/GiOption/index.vue';
// import GiOptionItem from '@/components/GiOptionItem/index.vue';

interface Props {
  data?: FileItem;
  shadow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  shadow: true,
});

const emit = defineEmits<{
  (e: 'click', mode: string): void;
}>();

const onClickItem = (mode: string) => {
  emit('click', mode);
};
</script>

<template>
  <GiOption :class="{ shadow: props.shadow }">
    <GiOptionItem
      v-permission="['system:file:update']"
      label="重命名"
      @click="onClickItem('rename')"
    />
    <GiOptionItem
      v-permission="['system:file:get']"
      label="详情"
      @click="onClickItem('detail')"
    />
    <GiOptionItem
      v-if="data?.type !== 0"
      v-permission="['system:file:download']"
      label="下载"
      @click="onClickItem('download')"
    />
    <GiOptionItem
      v-permission="['system:file:delete']"
      label="删除"
      @click="onClickItem('delete')"
    />
  </GiOption>
</template>

<style scoped lang="scss">
.shadow {
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-bg-popup);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgb(0 0 0 / 12%),
    0 0 6px rgb(0 0 0 / 4%);
}
</style>
