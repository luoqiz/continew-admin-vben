<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { LoginConfig, OptionResp } from '#/api/system';

import { onMounted, reactive, ref } from 'vue';

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

defineOptions({ name: 'SystemLoginConfig' });
const { width } = useWindowSize();

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  LOGIN_CAPTCHA_ENABLED: 1,
});

const rules = reactive<FormRules<typeof form>>({
  LOGIN_CAPTCHA_ENABLED: [
    { required: true, message: '请选择', trigger: 'blur' },
  ],
});
const loginConfig = ref<LoginConfig>({});

// 重置
const reset = () => {
  formRef.value?.resetFields();
  form.LOGIN_CAPTCHA_ENABLED =
    loginConfig.value.LOGIN_CAPTCHA_ENABLED?.value || 0;
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
  try {
    loading.value = true;
    const data = await listOption(queryForm);
    // eslint-disable-next-line unicorn/no-array-reduce
    loginConfig.value = data.reduce((obj: LoginConfig, option: OptionResp) => {
      obj = { ...obj, [option.code]: option };
      return obj;
    }, {} as LoginConfig);
    handleCancel();
  } finally {
    loading.value = false;
  }
};

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return false;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: loginConfig.value[key].id, code: key, value };
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
  <div class="gi_page" v-loading="loading">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      auto-label-width
      label-align="left"
      :layout="width >= 500 ? 'horizontal' : 'vertical'"
      :disabled="!isUpdate"
      scroll-to-first-error
    >
      <el-form-item
        field="LOGIN_CAPTCHA_ENABLED"
        :label="loginConfig.LOGIN_CAPTCHA_ENABLED?.name"
      >
        <el-switch
          v-model="form.LOGIN_CAPTCHA_ENABLED"
          type="round"
          active-value="1"
          inactive-value="0"
          active-text="是"
          inactive-text="否"
          inline-prompt
        />
      </el-form-item>
    </el-form>
    <el-space style="margin-bottom: 16px">
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
    </el-space>
  </div>
</template>
<style scoped lang="scss"></style>
