<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import type { OptionResp, SecurityConfig } from '#/api/system';

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

defineOptions({ name: 'SystemSecurityConfig' });
const { width } = useWindowSize();

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  PASSWORD_ERROR_LOCK_COUNT: 0,
  PASSWORD_ERROR_LOCK_MINUTES: 0,
  PASSWORD_EXPIRATION_DAYS: 0,
  PASSWORD_EXPIRATION_WARNING_DAYS: 0,
  PASSWORD_REPETITION_TIMES: 0,
  PASSWORD_MIN_LENGTH: 0,
  PASSWORD_ALLOW_CONTAIN_USERNAME: 0,
  PASSWORD_REQUIRE_SYMBOLS: 0,
});
const rules: FormInstance['rules'] = {
  PASSWORD_ERROR_LOCK_COUNT: [{ required: true, message: '请输入值' }],
  PASSWORD_ERROR_LOCK_MINUTES: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_DAYS: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_WARNING_DAYS: [
    { required: true, message: '请输入值' },
    {
      validator: (value, callback) => {
        if (
          form.PASSWORD_EXPIRATION_DAYS > 0 &&
          value >= form.PASSWORD_EXPIRATION_DAYS
        ) {
          callback('密码到期提醒时间应小于密码有效期');
        } else {
          callback();
        }
      },
    },
  ],
  PASSWORD_REPETITION_TIMES: [{ required: true, message: '请输入值' }],
  PASSWORD_MIN_LENGTH: [{ required: true, message: '请输入值' }],
};

const securityConfig = ref<SecurityConfig>({
  PASSWORD_ERROR_LOCK_COUNT: {},
  PASSWORD_ERROR_LOCK_MINUTES: {},
  PASSWORD_EXPIRATION_DAYS: {},
  PASSWORD_EXPIRATION_WARNING_DAYS: {},
  PASSWORD_REPETITION_TIMES: {},
  PASSWORD_MIN_LENGTH: {},
  PASSWORD_ALLOW_CONTAIN_USERNAME: {},
  PASSWORD_REQUIRE_SYMBOLS: {},
});
// 重置
const reset = () => {
  formRef.value?.resetFields();
  form.PASSWORD_ERROR_LOCK_COUNT =
    securityConfig.value.PASSWORD_ERROR_LOCK_COUNT.value || 0;
  form.PASSWORD_ERROR_LOCK_MINUTES =
    securityConfig.value.PASSWORD_ERROR_LOCK_MINUTES.value || 0;
  form.PASSWORD_EXPIRATION_DAYS =
    securityConfig.value.PASSWORD_EXPIRATION_DAYS.value || 0;
  form.PASSWORD_EXPIRATION_WARNING_DAYS =
    securityConfig.value.PASSWORD_EXPIRATION_WARNING_DAYS.value || 0;
  form.PASSWORD_REPETITION_TIMES =
    securityConfig.value.PASSWORD_REPETITION_TIMES.value || 0;
  form.PASSWORD_MIN_LENGTH =
    securityConfig.value.PASSWORD_MIN_LENGTH.value || 0;
  form.PASSWORD_ALLOW_CONTAIN_USERNAME =
    securityConfig.value.PASSWORD_ALLOW_CONTAIN_USERNAME.value || 0;
  form.PASSWORD_REQUIRE_SYMBOLS =
    securityConfig.value.PASSWORD_REQUIRE_SYMBOLS.value || 0;
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
  category: 'PASSWORD',
};
// 查询列表数据
const getDataList = async () => {
  loading.value = true;
  const data = await listOption(queryForm);
  // eslint-disable-next-line unicorn/no-array-reduce
  securityConfig.value = data.reduce(
    (obj: SecurityConfig, option: OptionResp) => {
      option.value = Number.parseInt(option.value);
      obj = { ...obj, [option.code]: option };
      return obj;
    },
    {} as SecurityConfig,
  );
  handleCancel();
  loading.value = false;
};

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return false;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: securityConfig.value[key].id, code: key, value };
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
  ElMessageBox.confirm('确认恢复安全配置为默认值吗？', '警告', {
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
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      auto-label-width
      label-align="left"
      label-width="180px"
      :layout="width >= 500 ? 'horizontal' : 'vertical'"
      :disabled="!isUpdate"
      scroll-to-first-error
      class="form"
    >
      <el-form-item
        field="PASSWORD_ERROR_LOCK_COUNT"
        :label="securityConfig.PASSWORD_ERROR_LOCK_COUNT?.name"
        :help="securityConfig.PASSWORD_ERROR_LOCK_COUNT?.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_ERROR_LOCK_COUNT"
          :default-value="0"
          :precision="0"
          :min="0"
          :max="10"
        >
          <template #suffix>次</template>
        </el-input-number>
      </el-form-item>
      <el-form-item
        field="PASSWORD_ERROR_LOCK_MINUTES"
        :label="securityConfig.PASSWORD_ERROR_LOCK_MINUTES.name"
        :help="securityConfig.PASSWORD_ERROR_LOCK_MINUTES.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_ERROR_LOCK_MINUTES"
          :precision="0"
          :min="1"
          :max="1440"
        >
          <template #suffix>分钟</template>
        </el-input-number>
      </el-form-item>
      <el-form-item
        field="PASSWORD_EXPIRATION_DAYS"
        :label="securityConfig.PASSWORD_EXPIRATION_DAYS.name"
        :help="securityConfig.PASSWORD_EXPIRATION_DAYS.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_EXPIRATION_DAYS"
          :precision="0"
          :min="0"
          :max="999"
        >
          <template #suffix>天</template>
        </el-input-number>
      </el-form-item>
      <el-form-item
        :label="securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS.name"
        field="PASSWORD_EXPIRATION_WARNING_DAYS"
        :help="securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_EXPIRATION_WARNING_DAYS"
          :precision="0"
          :min="0"
          :max="998"
        >
          <template #suffix>天</template>
        </el-input-number>
      </el-form-item>
      <el-form-item
        field="PASSWORD_REPETITION_TIMES"
        :label="securityConfig.PASSWORD_REPETITION_TIMES.name"
        :help="securityConfig.PASSWORD_REPETITION_TIMES.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_REPETITION_TIMES"
          :precision="0"
          :min="3"
          :max="32"
        >
          <template #suffix>次</template>
        </el-input-number>
      </el-form-item>
      <el-form-item
        field="PASSWORD_MIN_LENGTH"
        :label="securityConfig.PASSWORD_MIN_LENGTH.name"
        :help="securityConfig.PASSWORD_MIN_LENGTH.description"
        hide-asterisk
      >
        <el-input-number
          v-model="form.PASSWORD_MIN_LENGTH"
          :precision="0"
          :min="8"
          :max="32"
        />
      </el-form-item>
      <el-form-item
        field="PASSWORD_ALLOW_CONTAIN_USERNAME"
        :label="securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME.name"
        :help="securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME.description"
      >
        <el-switch
          v-model="form.PASSWORD_ALLOW_CONTAIN_USERNAME"
          type="round"
          active-value="1"
          inactive-value="0"
          active-text="是"
          inactive-text="否"
          inline-prompt
        />
      </el-form-item>
      <el-form-item
        field="PASSWORD_REQUIRE_SYMBOLS"
        :label="securityConfig.PASSWORD_REQUIRE_SYMBOLS.name"
        :help="securityConfig.PASSWORD_REQUIRE_SYMBOLS.description"
      >
        <!-- <el-switch v-model="form.PASSWORD_REQUIRE_SYMBOLS" type="round" :checked-value="1" :unchecked-value="0">
          <template #checked>是</template>
          <template #unchecked>否</template>
        </el-switch> -->
        <el-switch
          v-model="form.PASSWORD_REQUIRE_SYMBOLS"
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
        v-access:code="['system:securityConfig:update']"
        type="primary"
        @click="onUpdate"
      >
        <template #icon> <SvgEditIcon /> </template>修改
      </el-button>
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:securityConfig:update']"
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
