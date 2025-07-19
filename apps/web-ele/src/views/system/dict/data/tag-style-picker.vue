<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { ElOption, ElRadioGroup, ElSelect } from 'element-plus';

import { tagSelectOptions } from '#/components/dict';

/**
 * 需要禁止透传
 * 不禁止会有奇怪的bug 会绑定到selectType上
 * TODO: 未知原因 有待研究
 */
defineOptions({ inheritAttrs: false });

defineEmits<{ deselect: [] }>();

const radioGroupOptions = [
  { label: '默认颜色', value: 'default' },
  // { label: '自定义颜色', value: 'custom' },
] as const;

/**
 * 主要是加了const报错
 */
const computedOptions = computed(
  () => radioGroupOptions as unknown as { label: string; value: string }[],
);

type SelectType = (typeof radioGroupOptions)[number]['value'];

const selectType = defineModel<SelectType>('selectType', {
  default: 'default',
});

/**
 * color必须为hex颜色或者undefined
 */
const color = defineModel<string | undefined>('value', {
  default: undefined,
});

function handleSelectTypeChange(e) {
  // 必须给默认hex颜色 不能为空字符串
  color.value = e.target.value === 'custom' ? '#1677ff' : undefined;
}

// const { isDark } = usePreferences();
// const theme = computed(() => {
//   return isDark.value ? 'black' : 'white';
// });

const tagSelectOption = ref<[]>([]);
onMounted(() => {
  tagSelectOption.value = tagSelectOptions();
});
</script>

<template>
  <div class="flex flex-1 items-center gap-[6px]">
    <ElRadioGroup
      v-model:value="selectType"
      :options="computedOptions"
      button-style="solid"
      option-type="button"
      @change="handleSelectTypeChange"
    />
    <ElSelect
      v-if="selectType === 'default'"
      v-model:value="color"
      :allow-clear="true"
      class="flex-1"
      placeholder="请选择标签样式"
      @deselect="$emit('deselect')"
    >
      <ElOption
        v-for="item in tagSelectOption"
        :key="item.value"
        :value="item.value"
      >
        <!-- 使用 render-option 插槽渲染自定义内容 -->
        <template #render-option="{ option }">
          <!-- 直接渲染 label（VNode） -->
          <component :is="option.label" />
        </template>
      </ElOption>
    </ElSelect>
  </div>
</template>
