<script setup lang="ts">
import { computed } from 'vue';
import CodeMirror from 'vue-codemirror6';

import { usePreferences } from '@vben-core/preferences';

import { javascript } from '@codemirror/lang-javascript';
import { vue } from '@codemirror/lang-vue';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@ddietr/codemirror-themes/theme/github-light';

const props = withDefaults(defineProps<Props>(), {
  type: 'javascript',
  codeJson: '',
});
const { isDark } = usePreferences();

interface Props {
  codeJson?: string;
  type?: 'javascript' | 'vue';
}
const defaultConfig = {
  tabSize: 2,
  basic: true,
  dark: true,
  readonly: true,
};
const config = defaultConfig;

const codeValue = computed(() => props.codeJson);

const extensions = computed(() => {
  const arr = [isDark.value ? oneDark : githubLight];
  if (props.type === 'javascript') {
    arr.push(javascript());
  }
  if (props.type === 'vue') {
    arr.push(vue());
  }
  return arr;
});
</script>

<template>
  <CodeMirror
    :model-value="codeValue"
    :tab-size="config.tabSize"
    :basic="config.basic"
    :dark="config.dark"
    :readonly="config.readonly"
    :extensions="extensions"
  />
</template>

<style scoped lang="scss">
:deep(.cm-scroller) {
  font-family:
    source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
</style>
