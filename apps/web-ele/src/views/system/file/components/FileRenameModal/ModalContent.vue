<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import type { FileItem } from '#/api/system';

import { reactive, ref } from 'vue';

interface Props {
  data: FileItem;
}
const props = withDefaults(defineProps<Props>(), {});

const formRef = ref<FormInstance>();
const form = reactive({
  originalName: props.data?.originalName || '',
});

defineExpose({ formRef });
</script>

<template>
  <el-row justify="center" align="center" style="padding: 0 5%">
    <el-form ref="formRef" :model="form" auto-label-width class="w-full">
      <el-form-item
        label="名称"
        field="originalName"
        :rules="[{ required: true, message: '请输入名称' }]"
        style="margin-bottom: 0"
      >
        <el-input
          v-model="form.originalName"
          placeholder="请输入名称"
          allow-clear
        />
      </el-form-item>
    </el-form>
  </el-row>
</template>

<style scoped lang="scss"></style>
