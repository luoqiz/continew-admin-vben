<script setup lang="ts">
import { ref } from 'vue';

import { ElButton, ElDialog, ElMessage } from 'element-plus';

import CronGeneratorInput from '../CronForm/index.vue';

const emits = defineEmits(['ok']);

const visible = ref<boolean>(false);

const cronInputRef = ref<InstanceType<typeof CronGeneratorInput>>();

const cronExpression = ref('');

// 打开新增
const open = (cron: string = '') => {
  cronExpression.value = cron;
  visible.value = true;
};

// 确定
const handlerOk = () => {
  if (cronInputRef.value?.checkCron()) {
    ElMessage.error('日和周只能有一个为 [不设置]');
    return;
  }
  visible.value = false;
  emits('ok', cronExpression.value);
};

// 关闭
const handlerClose = () => {
  visible.value = false;
};

defineExpose({ open });
</script>

<template>
  <ElDialog
    v-model="visible"
    custom-class="modal-form-small"
    title="Cron表达式生成"
    width="780px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <!-- cron 输入框 -->
    <div style="padding: 4px 16px 8px">
      <CronGeneratorInput ref="cronInputRef" v-model="cronExpression" />
    </div>

    <!-- 页脚 -->
    <template #footer>
      <ElButton size="small" @click="handlerClose">关闭</ElButton>
      <ElButton size="small" type="primary" @click="handlerOk">确定</ElButton>
    </template>
  </ElDialog>
</template>

<style lang="less" scoped></style>
