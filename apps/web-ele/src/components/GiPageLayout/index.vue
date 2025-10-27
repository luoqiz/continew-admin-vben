<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { computed, ref, useSlots, watch } from 'vue';

import { useBreakpoint, useDevice } from '#/hooks';

defineOptions({ name: 'GiPageLayout' });

const props = withDefaults(defineProps<Props>(), {
  margin: true,
  padding: true,
  gutter: false,
  defaultCollapsed: true,
  leftColProps: () => ({}),
  rightColProps: () => ({}),
  leftStyle: () => ({}),
  headerStyle: () => ({}),
  bodyStyle: () => ({}),
});

/** 组件插槽定义 */
defineSlots<{
  default: () => void;
  header: () => void;
  left: () => void;
}>();

const { isDesktop } = useDevice();
const getClass = computed(() => {
  return {
    'gi-page-layout--margin': props.margin,
    'gi-page-layout--padding': props.padding,
    'gi-page-layout--gutter': !!props.gutter,
  };
});

const rowGutter = computed(() => {
  if (typeof props.gutter === 'boolean') {
    return props.gutter ? 14 : undefined;
  }
  return props.gutter;
});

/** 组件属性定义 */
interface Props {
  margin?: boolean;
  padding?: boolean;
  gutter?: boolean | number;
  defaultCollapsed?: boolean;
  leftColProps?: any;
  rightColProps?: any;
  // leftColProps?: ColProps;
  // rightColProps?: ColProps;
  leftStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
}

const slots = useSlots();
const isCollapsed = ref(false);
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const { breakpoint } = useBreakpoint();
watch(
  () => breakpoint.value,
  (val) => {
    isCollapsed.value = ['xs'].includes(val ?? '');
  },
  { immediate: true },
);
</script>

<template>
  <el-row
    align="stretch"
    :gutter="rowGutter"
    class="gi-page-layout"
    :class="getClass"
  >
    <el-col
      v-if="slots.left"
      v-show="!isCollapsed"
      class="gi-page-col"
      v-bind="props.leftColProps"
      :sm="10"
      :md="7"
      :lg="6"
      :xl="5"
      :xxl="4"
    >
      <div class="gi-page-layout__left" :style="props.leftStyle">
        <slot name="left"></slot>
      </div>
    </el-col>
    <div
      v-if="slots.left"
      class="gi-page-layout__divider"
      :class="{ none: isCollapsed || !isDesktop }"
    >
      <div
        v-if="defaultCollapsed"
        class="gi-split-button"
        :class="{ none: isCollapsed || !isDesktop }"
        :style="isCollapsed ? 'left:0px' : 'left:-12px'"
        @click="toggleCollapsed"
      >
        <icon-right v-if="isCollapsed" />
        <icon-left v-else />
      </div>
    </div>
    <el-col
      class="gi-page-col"
      :sm="16"
      :md="17"
      :lg="18"
      :xl="19"
      :xxl="20"
      flex="1"
      v-bind="props.rightColProps"
    >
      <div
        v-if="slots.header"
        class="gi-page-layout__header"
        :style="{
          ...props.headerStyle,
          display: !isDesktop && !isCollapsed ? 'none' : '',
        }"
      >
        <slot name="header"></slot>
      </div>
      <div class="gi-page-layout__body" :style="props.bodyStyle">
        <div
          v-if="!isDesktop && !isCollapsed"
          class="gi-page-layout__mask"
        ></div>
        <slot></slot>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.gi-page-layout {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-1);

  &--margin {
    margin: 0;
  }

  &--padding {
    .gi-page-layout__left,
    .gi-page-layout__header,
    .gi-page-layout__body {
      padding: 0;
    }

    .gi-page-layout__header {
      padding-bottom: 0;
    }
  }

  &--gutter {
    .gi-page-layout__body-left {
      border-right: none;
    }
  }

  .gi-page-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

.gi-page-layout__left {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.gi-page-layout__header {
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-border);
}

.gi-page-layout__body {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.gi-page-layout__divider {
  position: relative;
  width: 1px;
  background-color: var(--color-border);
}

.gi-page-layout__divider.none {
  width: 0;
}

.gi-split-button {
  position: absolute;
  top: 50%;
  left: -12px;
  z-index: 999;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-2);
  border-radius: 50%;
  box-shadow: 0 2px 3px rgb(0 0 0 / 10%);
  transform: translateY(-50%);
}

.gi-page-layout__mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  content: '';
  backdrop-filter: blur(20px);
}

.gi-split-button.none {
  left: -12px;
}
</style>
