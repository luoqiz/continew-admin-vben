<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { OptionResp } from '#/api/system';

import { onMounted, ref } from 'vue';

import {
  SvgEditIcon,
  SvgRefreshIcon,
  SvgSaveIcon,
  SvgUndoIcon,
} from '@vben/icons';

import { ElMessage, ElMessageBox } from 'element-plus';

import { listOption, resetOptionValue, updateOption } from '#/api/system';
import { useResetReactive } from '#/hooks';

import ConfigFormItem from '../components/ConfigFormItem.vue';

defineOptions({ name: 'SystemMailConfig' });

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  MAIL_HOST: '',
  MAIL_PASSWORD: '',
  MAIL_PORT: 0,
  MAIL_PROTOCOL: '',
  MAIL_SSL_ENABLED: 0,
  MAIL_SSL_PORT: 0,
  MAIL_USERNAME: '',
});

const rules: FormRules<typeof form> = {
  MAIL_HOST: [{ required: true, message: '请输入值' }],
  MAIL_PASSWORD: [{ required: true, message: '请输入值' }],
  MAIL_USERNAME: [{ required: true, message: '请输入值' }],
};

/** 数值型配置项 */
const NUMBER_CODES = new Set([
  'MAIL_PORT',
  'MAIL_SSL_ENABLED',
  'MAIL_SSL_PORT',
]);

const mailConfig = ref<Record<string, OptionResp>>({});

// 重置为服务端已保存的值
const reset = () => {
  formRef.value?.resetFields();
  const config = mailConfig.value as Record<string, OptionResp>;
  for (const key of Object.keys(form)) {
    form[key] = (config[key]?.value as never) ?? form[key];
  }
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
  try {
    const data = await listOption(queryForm);
    const config = mailConfig.value as Record<string, OptionResp>;
    for (const option of data) {
      if (NUMBER_CODES.has(option.code ?? '')) {
        option.value = Number.parseInt(option.value as string);
      }
      config[option.code ?? ''] = option;
      form[option.code ?? ''] = option.value as never;
    }
    handleCancel();
  } finally {
    loading.value = false;
  }
};

// 保存
const handleSave = async () => {
  const valid = await formRef.value
    ?.validate()
    .then(() => true)
    .catch(() => false);
  if (!valid) return;
  const config = mailConfig.value as Record<string, OptionResp>;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return {
        code: key,
        description: config[key]?.description,
        id: config[key]?.id,
        name: `${config[key]?.name}`,
        value,
      };
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
    confirmButtonText: '确定',
    cancelButtonText: '取消',
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
  <div v-loading="loading" class="mx-auto w-full max-w-[720px]">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      auto-label-width
      label-position="right"
      :disabled="!isUpdate"
      scroll-to-first-error
    >
      <ConfigFormItem
        prop="MAIL_PROTOCOL"
        :label="mailConfig.MAIL_PROTOCOL?.name"
        :help="mailConfig.MAIL_PROTOCOL?.description"
      >
        <el-select v-model="form.MAIL_PROTOCOL">
          <el-option label="SMTP" value="smtp" />
        </el-select>
      </ConfigFormItem>
      <ConfigFormItem
        prop="MAIL_HOST"
        :label="mailConfig.MAIL_HOST?.name"
        :help="mailConfig.MAIL_HOST?.description"
      >
        <el-input v-model="form.MAIL_HOST" />
      </ConfigFormItem>
      <ConfigFormItem
        prop="MAIL_PORT"
        :label="mailConfig.MAIL_PORT?.name"
        :help="mailConfig.MAIL_PORT?.description"
      >
        <el-input-number v-model="form.MAIL_PORT" :min="0" />
      </ConfigFormItem>
      <ConfigFormItem
        prop="MAIL_USERNAME"
        :label="mailConfig.MAIL_USERNAME?.name"
        :help="mailConfig.MAIL_USERNAME?.description"
      >
        <el-input v-model="form.MAIL_USERNAME" />
      </ConfigFormItem>
      <ConfigFormItem
        prop="MAIL_PASSWORD"
        :label="mailConfig.MAIL_PASSWORD?.name"
        :help="mailConfig.MAIL_PASSWORD?.description"
      >
        <el-input v-model="form.MAIL_PASSWORD" type="password" show-password />
      </ConfigFormItem>
      <ConfigFormItem
        prop="MAIL_SSL_ENABLED"
        :label="mailConfig.MAIL_SSL_ENABLED?.name"
        :help="mailConfig.MAIL_SSL_ENABLED?.description"
      >
        <el-switch
          v-model="form.MAIL_SSL_ENABLED"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
        />
      </ConfigFormItem>
      <ConfigFormItem
        v-if="form.MAIL_SSL_ENABLED === 1"
        prop="MAIL_SSL_PORT"
        :label="mailConfig.MAIL_SSL_PORT?.name"
        :help="mailConfig.MAIL_SSL_PORT?.description"
      >
        <el-input-number v-model="form.MAIL_SSL_PORT" :min="0" />
      </ConfigFormItem>
    </el-form>
    <div class="mt-4 flex flex-wrap gap-2">
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
    </div>
  </div>
</template>
