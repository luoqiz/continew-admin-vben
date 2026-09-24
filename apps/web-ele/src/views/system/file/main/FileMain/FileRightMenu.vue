<script setup lang="ts">
import { useSlots } from 'vue';

import { useAccess } from '@vben/access';
import { $t } from '@vben/locales';

import { VbenContextMenu } from '@vben-core/shadcn-ui';

const emit = defineEmits<{
  (e: 'click', mode: string): void;
}>();

const slots = useSlots();

const { hasAccessByCodes } = useAccess();
const onClickItem = (mode: string) => {
  emit('click', mode);
};

const menus = (data: any) => {
  return [
    {
      key: 'rename',
      text: $t('system.file.action.rename'),
      disabled: !hasAccessByCodes(['system:file:update']),
      handler: () => onClickItem('rename'),
    },
    {
      key: 'details',
      text: $t('common.detail'),
      disabled: !hasAccessByCodes(['system:file:get']),
      handler: () => onClickItem('detail'),
    },
    {
      key: 'download',
      text: $t('common.download'),
      disabled: !hasAccessByCodes(['system:file:download']),
      handler: () => onClickItem('download'),
      hidden: data?.type === 0,
    },
    {
      key: 'delete',
      text: $t('common.delete'),
      disabled: !hasAccessByCodes(['system:file:delete']),
      handler: () => onClickItem('delete'),
    },
  ];
};
</script>

<template>
  <VbenContextMenu :menus="menus" :modal="true" item-class="pr-6">
    <!-- 插槽透传 -->
    <template
      v-for="itemSlot in Object.keys(slots)"
      :key="itemSlot"
      #[itemSlot]="temp"
    >
      <slot :name="itemSlot" v-bind="temp"></slot>
    </template>
  </VbenContextMenu>
</template>

<style scoped lang="scss"></style>
