<script setup lang="ts">
/**
 * 系统配置表单项统一封装：
 * - 统一 label + 配置项描述（tooltip 问号）展示；
 * - 转发 prop 以接入 el-form 校验/重置/滚动定位。
 */
defineOptions({ name: 'ConfigFormItem' });

withDefaults(
  defineProps<{
    help?: string;
    label?: string;
    prop?: string;
  }>(),
  {
    help: '',
    label: '',
    prop: '',
  },
);
</script>

<template>
  <el-form-item :label :prop>
    <template #label>
      <span>{{ label }}</span>
      <el-tooltip v-if="help" :content="help" placement="top">
        <span
          class="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full text-[10px] leading-none text-muted-foreground"
        >
          ?
        </span>
      </el-tooltip>
    </template>
    <slot></slot>
  </el-form-item>
</template>
