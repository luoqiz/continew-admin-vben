<script lang="ts" setup>
import type { RowPageProps } from './types';

import { computed, ref, useSlots } from 'vue';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@vben-core/shadcn-ui';

import Page from '../page/page.vue';

defineOptions({
  name: 'ColPage',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<RowPageProps>(), {
  topWidth: 30,
  bottomWidth: 70,
  resizable: true,
});

const delegatedProps = computed(() => {
  const { topWidth: _, ...delegated } = props;
  return delegated;
});

const slots = useSlots();

const delegatedSlots = computed(() => {
  const resultSlots: string[] = [];

  for (const key of Object.keys(slots)) {
    if (!['default', 'top'].includes(key)) {
      resultSlots.push(key);
    }
  }
  return resultSlots;
});

const topPanelRef = ref<InstanceType<typeof ResizablePanel>>();

function expandTop() {
  topPanelRef.value?.expand();
}

function collapseTop() {
  topPanelRef.value?.collapse();
}

defineExpose({
  expandTop,
  collapseTop,
  topPanelRef,
});
</script>
<template>
  <Page v-bind="delegatedProps">
    <!-- 继承默认的slot -->
    <template
      v-for="slotName in delegatedSlots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>

    <ResizablePanelGroup class="w-full" direction="vertical">
      <ResizablePanel
        ref="topPanelRef"
        :collapsed-size="topCollapsedWidth"
        :collapsible="topCollapsible"
        :default-size="topWidth"
        :max-size="topMaxWidth"
        :min-size="topMinWidth"
      >
        <template #default="slotProps">
          <slot
            name="top"
            v-bind="{
              ...slotProps,
              expand: expandTop,
              collapse: collapseTop,
            }"
          ></slot>
        </template>
      </ResizablePanel>
      <ResizableHandle
        v-if="resizable"
        :style="{ backgroundColor: splitLine ? undefined : 'transparent' }"
        :with-handle="splitHandle"
      />
      <ResizablePanel
        :collapsed-size="bottomCollapsedWidth"
        :collapsible="bottomCollapsible"
        :default-size="bottomWidth"
        :max-size="bottomMaxWidth"
        :min-size="bottomMinWidth"
      >
        <template #default>
          <slot></slot>
        </template>
      </ResizablePanel>
    </ResizablePanelGroup>
  </Page>
</template>
