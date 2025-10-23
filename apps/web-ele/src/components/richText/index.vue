<!-- 未完善 -->
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
  style?: string;
}>();
const emit = defineEmits<(e: 'update:modelValue', value: string) => void>();

const divRef = ref<any>();
const aieditor = ref<AiEditor | null>(null);
const updateOutLine = (editor: AiEditor) => {
  const outlineContainer = document.querySelector('#outline');
  while (outlineContainer?.firstChild) {
    outlineContainer.firstChild.remove();
  }
  const outlines = editor.getOutline();
  for (const outline of outlines) {
    const child = document.createElement('div');
    child.classList.add(`aie-title${outline.level}`);
    child.style.marginLeft = `${14 * (outline.level - 1)}px`;
    child.style.padding = `4px 0`;
    child.innerHTML = `<a href="#${outline.id}">${outline.text}</a>`;
    child.addEventListener('click', (e) => {
      e.preventDefault();
      const el = editor.innerEditor.view.dom.querySelector(
        `#${outline.id}`,
      ) as HTMLElement;
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      setTimeout(() => {
        editor.focusPos(outline.pos + outline.size - 1);
      }, 1000);
    });
    outlineContainer?.append(child);
  }
};

const editorConfig = reactive<AiEditorOptions>({
  element: '',
  theme: preferences.theme.mode === 'light' ? 'light' : 'dark',
  placeholder: '请输入内容',
  content: '',
  draggable: false,
  onChange: (editor: AiEditor) => {
    emit('update:modelValue', editor.getHtml());
    updateOutLine(editor);
  },
  onCreated: (editor: AiEditor) => {
    updateOutLine(editor);
  },
});
watch(
  () => props.modelValue,
  (value) => {
    if (value !== aieditor.value?.getHtml()) {
      aieditor.value?.destroy();
      editorConfig.content = value;
      aieditor.value = new AiEditor(editorConfig);
    }
  },
);

const init = () => {
  editorConfig.element = divRef.value;
  aieditor.value = new AiEditor(editorConfig);
};
// 挂载阶段
onMounted(() => {
  init();
});
// 销毁阶段
onUnmounted(() => {
  aieditor.value?.destroy();
});
</script>

<template>
  <div ref="divRef" class="container" :style="props.style ?? ''">
    <div class="aie-container">
      <div class="aie-header-panel">
        <div class="aie-container-header"></div>
      </div>
      <div class="aie-main">
        <div class="aie-directory-content">
          <div class="aie-directory">
            <h5>目录</h5>
            <div id="outline"></div>
          </div>
        </div>
        <div class="aie-container-panel">
          <div class="aie-container-main"></div>
        </div>
      </div>
      <div class="aie-container-footer"></div>
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
  color: black;
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-1);
}

.aie-main {
  position: relative;
  box-sizing: border-box;
  flex: 1;
  padding: 1rem 0;
  overflow: hidden;
  background-color: var(--color-bg-2);
}

.aie-directory {
  position: absolute;
  top: 30px;
  left: 10px;
  z-index: 0;
  width: 260px;
}

.aie-directory h5 {
  // color: #000000c4;
  font-size: 16px;
  line-height: 32px;
  text-indent: 4px;
}

.aie-directory a {
  display: inline-block;
  width: 100%;
  height: 30px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  line-height: 30px;
  // color: #000000a3;
  text-indent: 4px;
  white-space: nowrap;
  text-decoration: none;
}

.aie-directory a:hover {
  cursor: pointer;
  // background-color: #334d660f;
  border-radius: 4px;
}

.aie-title1 {
  font-size: 14px;
  font-weight: 500;
}

#outline {
  text-indent: 2rem;
}

.aie-directory-content {
  position: sticky;
  top: 0;
}

@media screen and (max-width: 1280px) {
  .aie-directory {
    display: none;
  }
}

@media screen and (max-width: 1400px) {
  .aie-directory {
    width: 200px;
  }
}
</style>
