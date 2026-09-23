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

defineOptions({ name: 'SystemLoginConfig' });

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  LOGIN_CAPTCHA_ENABLED: '1',
});

const rules: FormRules<typeof form> = {
  LOGIN_CAPTCHA_ENABLED: [{ required: true, message: '请选择' }],
};
const loginConfig = ref<Record<string, OptionResp>>({});

// 重置为服务端已保存的值
const reset = () => {
  formRef.value?.resetFields();
  const config = loginConfig.value as Record<string, OptionResp>;
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
  category: 'LOGIN',
};
// 查询列表数据
const getDataList = async () => {
  loading.value = true;
  try {
    const data = await listOption(queryForm);
    const config = loginConfig.value as Record<string, OptionResp>;
    for (const option of data) {
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
  const config = loginConfig.value as Record<string, OptionResp>;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: config[key]?.id, code: key, value };
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
  ElMessageBox.confirm('确认恢复登录配置为默认值吗？', '警告', {
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
        prop="LOGIN_CAPTCHA_ENABLED"
        :label="loginConfig.LOGIN_CAPTCHA_ENABLED?.name"
        :help="loginConfig.LOGIN_CAPTCHA_ENABLED?.description"
      >
        <el-switch
          v-model="form.LOGIN_CAPTCHA_ENABLED"
          active-value="1"
          inactive-value="0"
          active-text="开启"
          inactive-text="关闭"
          inline-prompt
        />
      </ConfigFormItem>
    </el-form>
    <div class="mt-4 flex flex-wrap gap-2">
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:loginConfig:update']"
        type="primary"
        @click="onUpdate"
      >
        <template #icon>
          <SvgEditIcon />
        </template>
        修改
      </el-button>
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:loginConfig:update']"
        @click="onResetValue"
      >
        <template #icon>
          <SvgUndoIcon />
        </template>
        恢复默认
      </el-button>
      <el-button v-if="isUpdate" type="primary" @click="handleSave">
        <template #icon>
          <SvgSaveIcon />
        </template>
        保存
      </el-button>
      <el-button v-if="isUpdate" @click="reset">
        <template #icon>
          <SvgRefreshIcon />
        </template>
        重置
      </el-button>
      <el-button v-if="isUpdate" @click="handleCancel">
        <template #icon>
          <SvgUndoIcon />
        </template>
        取消
      </el-button>
    </div>
  </div>
</template>
