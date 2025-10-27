<script setup lang="ts">
import type { AiEditorOptions } from 'aieditor';

import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { preferences } from '@vben/preferences';

import { AiEditor } from 'aieditor';

import 'aieditor/dist/style.css';

defineOptions({ name: 'AiEditor' });
const props = defineProps<{
  modelValue: string;
  options?: AiEditorOptions;
}>();
const aieditor = ref<AiEditor | null>(null);
const divRef = ref<any>();

const editorConfig = reactive<AiEditorOptions>({
  element: '',
  theme: preferences.theme.mode === 'light' ? 'light' : 'dark',
  placeholder: '请输入内容',
  content: '',
  editable: false,
});
const init = () => {
  aieditor.value?.destroy();
  aieditor.value = new AiEditor(editorConfig);
};
watch(
  () => props.modelValue,
  (value) => {
    if (value !== aieditor.value?.getHtml()) {
      editorConfig.content = value;
      init();
    }
  },
  { deep: true },
);
watch(
  () => preferences.theme,
  (value) => {
    editorConfig.theme = value.mode === 'light' ? 'light' : 'dark';
    init();
  },
);

// 挂载阶段
onMounted(() => {
  editorConfig.element = divRef.value;
  editorConfig.content = props.modelValue;
  init();
});
// 销毁阶段
onUnmounted(() => {
  aieditor.value?.destroy();
});
</script>
<!-- 未完善 -->
<template>
  <div ref="divRef" class="container">
    <div class="aie-container">
      <div class="aie-header-panel" style="display: none">
        <div class="aie-container-header"></div>
      </div>
      <div class="aie-main">
        <div class="aie-container-panel">
          <div class="aie-container-main"></div>
        </div>
      </div>
      <div class="aie-container-footer" style="display: none"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.aie-header-panel {
  position: sticky;
  // top: 51px;
  z-index: 1;
}

.aie-header-panel aie-header > div {
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.aie-container {
  border: none !important;
}

.aie-container-panel {
  z-index: 99;
  box-sizing: border-box;
  width: calc(100% - 2rem - 2px);
  max-width: 826.77px;
  height: 100%;
  padding: 1rem;
  margin: 0 auto;
  overflow: auto;
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-1);
}

.aie-main {
  position: relative;
  box-sizing: border-box;
  flex: 1;
  padding: 1rem 0;
  overflow: hidden;
  background-color: var(--color-bg-1);
}

.aie-directory {
  position: absolute;
  top: 30px;
  left: 10px;
  z-index: 0;
  width: 260px;
}

.aie-title1 {
  font-size: 14px;
  font-weight: 500;
}
</style>
