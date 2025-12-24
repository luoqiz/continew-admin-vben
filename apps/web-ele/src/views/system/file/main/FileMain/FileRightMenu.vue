<script setup lang="ts">
// import type { FileItem } from '#/api/system';

// import GiOption from '/components/GiOption/index.vue';
// import GiOptionItem from '@/components/GiOptionItem/index.vue';
import { useAccess } from '@vben/access';

import { VbenContextMenu } from '@vben-core/shadcn-ui';

// const props = withDefaults(defineProps<Props>(), {
//   data: undefined,
//   shadow: true,
// });

const emit = defineEmits<{
  (e: 'click', mode: string): void;
}>();

const { hasAccessByCodes } = useAccess();

// interface Props {
//   data?: FileItem;
//   shadow?: boolean;
// }

const onClickItem = (mode: string) => {
  emit('click', mode);
};

const menus = (data: any) => {
  return [
    {
      key: 'rename',
      text: '重命名',
      disabled: hasAccessByCodes(['system:file:update']),
      handler: () => onClickItem('rename'),
    },
    {
      key: 'details',
      text: '详情',
      disabled: hasAccessByCodes(['system:file:get']),
      handler: () => onClickItem('detail'),
    },
    {
      key: 'download',
      text: '下载',

      disabled: hasAccessByCodes(['system:file:download']),
      handler: () => onClickItem('download'),
      hidden: data?.type === 0,
    },
    {
      key: 'delete',
      text: '删除',
      disabled: hasAccessByCodes(['system:file:delete']),
      handler: () => onClickItem('delete'),
    },
  ];
};

// import {
//   ContextMenu,
//   ContextMenuCheckboxItem,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuLabel,
//   ContextMenuRadioGroup,
//   ContextMenuRadioItem,
//   ContextMenuSeparator,
//   ContextMenuShortcut,
//   ContextMenuSub,
//   ContextMenuSubContent,
//   ContextMenuSubTrigger,
//   ContextMenuTrigger,
// } from '@vben/common-ui';
// } from '@vben-core/shadcn-ui/ui/context-menu';
</script>

<template>
  <VbenContextMenu :menus="menus" />
  <ContextMenu>
    <ContextMenuTrigger
      class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
    >
      Right click here
    </ContextMenuTrigger>
    <ContextMenuContent class="w-52">
      <ContextMenuTrigger>Right click</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Billing</ContextMenuItem>
        <ContextMenuItem>Team</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Subscription</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuContent>
  </ContextMenu>

  <!-- <GiOption :class="{ shadow: props.shadow }">
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
  </GiOption> -->
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
