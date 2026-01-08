<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import type { MailConfig, OptionResp } from '#/api/system';

import { onMounted, ref } from 'vue';

import {
  SvgEditIcon,
  SvgRefreshIcon,
  SvgSaveIcon,
  SvgUndoIcon,
} from '@vben/icons';

import { useWindowSize } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';

import { listOption, resetOptionValue, updateOption } from '#/api/system';
import { useResetReactive } from '#/hooks';

defineOptions({ name: 'SystemMailConfig' });
const { width } = useWindowSize();
const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  MAIL_PROTOCOL: '',
  MAIL_HOST: '',
  MAIL_PORT: 0,
  MAIL_USERNAME: '',
  MAIL_PASSWORD: '',
  MAIL_SSL_ENABLED: 0,
  MAIL_SSL_PORT: 0,
});
const rules: FormInstance['rules'] = {
  MAIL_HOST: [{ required: true, message: '请输入值' }],
  // MAIL_PORT: [{ required: true, message: '请输入值' }],
  MAIL_USERNAME: [{ required: true, message: '请输入值' }],
  MAIL_PASSWORD: [{ required: true, message: '请输入值' }],
  MAIL_SSL_PORT: [{ required: true, message: '请输入值' }],
};

const mailConfig = ref<MailConfig>({
  MAIL_PROTOCOL: {},
  MAIL_HOST: {},
  MAIL_PORT: {},
  MAIL_USERNAME: {},
  MAIL_PASSWORD: {},
  MAIL_SSL_ENABLED: {},
  MAIL_SSL_PORT: {},
});

// 重置
const reset = () => {
  formRef.value?.resetFields();
  form.MAIL_PROTOCOL = mailConfig.value.MAIL_PROTOCOL.value || '';
  form.MAIL_HOST = mailConfig.value.MAIL_HOST.value || '';
  form.MAIL_PORT = mailConfig.value.MAIL_PORT.value || 0;
  form.MAIL_USERNAME = mailConfig.value.MAIL_USERNAME.value || '';
  form.MAIL_PASSWORD = mailConfig.value.MAIL_PASSWORD?.value || '';
  form.MAIL_SSL_ENABLED = mailConfig.value.MAIL_SSL_ENABLED.value || 0;
  form.MAIL_SSL_PORT = mailConfig.value.MAIL_SSL_PORT.value || 0;
};

const isUpdate = ref(false);
// 修改
const onUpdate = () => {
  isUpdate.value = true;
};

// 取消
const handleCancel = () => {
  reset();
  isUpdate.value = false;
};

const queryForm = {
  category: 'MAIL',
};
// 查询列表数据
const getDataList = async () => {
  loading.value = true;
  const data = await listOption(queryForm);
  // eslint-disable-next-line unicorn/no-array-reduce
  mailConfig.value = data.reduce((obj: MailConfig, option: OptionResp) => {
    option.value = ['MAIL_PORT', 'MAIL_SSL_ENABLED', 'MAIL_SSL_PORT'].includes(
      option.code!,
    )
      ? Number.parseInt(option.value)
      : option.value;
    obj = { ...obj, [option.code]: option };
    return obj;
  }, {} as MailConfig);
  handleCancel();
  loading.value = false;
};

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return false;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: mailConfig.value[key].id, code: key, value };
    }),
  );
  await getDataList();
  ElMessage.success('保存成功');
};

// 恢复默认
const handleResetValue = async () => {
  await resetOptionValue(queryForm);
  ElMessage.success('恢复成功');
  await getDataList();
};
const onResetValue = () => {
  ElMessageBox.confirm('确认恢复邮件配置为默认值吗？', '警告', {
    confirmButtonClass: 'el-button--danger',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(async () => {
    await handleResetValue();
  });
};

onMounted(() => {
  getDataList();
});
</script>
<template>
  <div v-loading="loading">
    {{ typeof form.MAIL_PORT }}
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="left"
      label-width="180px"
      :layout="width >= 500 ? 'horizontal' : 'vertical'"
      :disabled="!isUpdate"
      scroll-to-first-error
      class="form"
    >
      <el-form-item
        field="MAIL_PROTOCOL"
        :label="mailConfig.MAIL_PROTOCOL.name"
        :help="mailConfig.MAIL_PROTOCOL.description"
        hide-asterisk
      >
        <el-select v-model="form.MAIL_PROTOCOL">
          <el-option label="SMTP" value="smtp" />
        </el-select>
      </el-form-item>
      <el-form-item
        field="MAIL_HOST"
        :label="mailConfig.MAIL_HOST.name"
        :help="mailConfig.MAIL_HOST.description"
        hide-asterisk
      >
        <el-input v-model="form.MAIL_HOST" />
      </el-form-item>
      <el-form-item
        field="MAIL_PORT"
        :label="mailConfig.MAIL_PORT.name"
        :help="mailConfig.MAIL_PORT.description"
        hide-asterisk
      >
        <el-input-number v-model="form.MAIL_PORT" :min="0" />
      </el-form-item>
      <el-form-item
        field="MAIL_USERNAME"
        :label="mailConfig.MAIL_USERNAME.name"
        :help="mailConfig.MAIL_USERNAME.description"
        hide-asterisk
      >
        <el-input v-model="form.MAIL_USERNAME" />
      </el-form-item>
      <el-form-item
        field="MAIL_PASSWORD"
        :label="mailConfig.MAIL_PASSWORD?.name"
        :help="mailConfig.MAIL_PASSWORD.description"
        hide-asterisk
      >
        <el-input v-model="form.MAIL_PASSWORD" type="password" show-password />
      </el-form-item>
      <el-form-item
        field="MAIL_SSL_ENABLED"
        :label="mailConfig.MAIL_SSL_ENABLED?.name"
        :help="mailConfig.MAIL_SSL_ENABLED.description"
        hide-asterisk
      >
        <el-switch
          v-model="form.MAIL_SSL_ENABLED"
          type="round"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
        />
      </el-form-item>
      <el-form-item
        v-if="form.MAIL_SSL_ENABLED === 1"
        field="MAIL_SSL_PORT"
        :label="mailConfig.MAIL_SSL_PORT.name"
        :help="mailConfig.MAIL_SSL_PORT.description"
        hide-asterisk
      >
        <el-input-number v-model="form.MAIL_SSL_PORT" :min="0" />
      </el-form-item>
    </el-form>
    <el-space style="margin-bottom: 16px">
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:mailConfig:update']"
        type="primary"
        @click="onUpdate"
      >
        <template #icon> <SvgEditIcon /> </template>修改
      </el-button>
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:mailConfig:update']"
        @click="onResetValue"
      >
        <template #icon> <SvgUndoIcon /> </template>恢复默认
      </el-button>
      <el-button v-if="isUpdate" type="primary" @click="handleSave">
        <template #icon> <SvgSaveIcon /> </template>保存
      </el-button>
      <el-button v-if="isUpdate" @click="reset">
        <template #icon> <SvgRefreshIcon /> </template>重置
      </el-button>
      <el-button v-if="isUpdate" @click="handleCancel">
        <template #icon> <SvgUndoIcon /> </template>取消
      </el-button>
    </el-space>
  </div>
</template>
<style scoped lang="scss"></style>
