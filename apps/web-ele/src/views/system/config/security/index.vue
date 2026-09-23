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

defineOptions({ name: 'SystemSecurityConfig' });

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  PASSWORD_ALLOW_CONTAIN_USERNAME: '0',
  PASSWORD_ERROR_LOCK_COUNT: 0,
  PASSWORD_ERROR_LOCK_MINUTES: 0,
  PASSWORD_EXPIRATION_DAYS: 0,
  PASSWORD_EXPIRATION_WARNING_DAYS: 0,
  PASSWORD_MIN_LENGTH: 0,
  PASSWORD_REPETITION_TIMES: 0,
  PASSWORD_REQUIRE_SYMBOLS: '0',
});

/** 数值型配置项（Switch 型保持 "0"/"1" 字符串） */
const NUMBER_CODES = new Set([
  'PASSWORD_ERROR_LOCK_COUNT',
  'PASSWORD_ERROR_LOCK_MINUTES',
  'PASSWORD_EXPIRATION_DAYS',
  'PASSWORD_EXPIRATION_WARNING_DAYS',
  'PASSWORD_MIN_LENGTH',
  'PASSWORD_REPETITION_TIMES',
]);

const rules: FormRules<typeof form> = {
  PASSWORD_ERROR_LOCK_COUNT: [{ required: true, message: '请输入值' }],
  PASSWORD_ERROR_LOCK_MINUTES: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_DAYS: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_WARNING_DAYS: [
    { required: true, message: '请输入值' },
    {
      validator: (_rule, value, callback) => {
        if (
          form.PASSWORD_EXPIRATION_DAYS > 0 &&
          value >= form.PASSWORD_EXPIRATION_DAYS
        ) {
          callback(new Error('密码到期提醒时间应小于密码有效期'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  PASSWORD_MIN_LENGTH: [{ required: true, message: '请输入值' }],
  PASSWORD_REPETITION_TIMES: [{ required: true, message: '请输入值' }],
};

const securityConfig = ref<Record<string, OptionResp>>({});

// 重置为服务端已保存的值
const reset = () => {
  formRef.value?.resetFields();
  const config = securityConfig.value as Record<string, OptionResp>;
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
  category: 'PASSWORD',
};
// 查询列表数据
const getDataList = async () => {
  loading.value = true;
  try {
    const data = await listOption(queryForm);
    const config = securityConfig.value as Record<string, OptionResp>;
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
  const config = securityConfig.value as Record<string, OptionResp>;
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
  ElMessageBox.confirm('确认恢复安全配置为默认值吗？', '警告', {
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
        prop="PASSWORD_ERROR_LOCK_COUNT"
        :label="securityConfig.PASSWORD_ERROR_LOCK_COUNT?.name"
        :help="securityConfig.PASSWORD_ERROR_LOCK_COUNT?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_ERROR_LOCK_COUNT"
          :precision="0"
          :min="0"
          :max="10"
        >
          <template #suffix>次</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_ERROR_LOCK_MINUTES"
        :label="securityConfig.PASSWORD_ERROR_LOCK_MINUTES?.name"
        :help="securityConfig.PASSWORD_ERROR_LOCK_MINUTES?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_ERROR_LOCK_MINUTES"
          :precision="0"
          :min="1"
          :max="1440"
        >
          <template #suffix>分钟</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_EXPIRATION_DAYS"
        :label="securityConfig.PASSWORD_EXPIRATION_DAYS?.name"
        :help="securityConfig.PASSWORD_EXPIRATION_DAYS?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_EXPIRATION_DAYS"
          :precision="0"
          :min="0"
          :max="999"
        >
          <template #suffix>天</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_EXPIRATION_WARNING_DAYS"
        :label="securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS?.name"
        :help="securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_EXPIRATION_WARNING_DAYS"
          :precision="0"
          :min="0"
          :max="998"
        >
          <template #suffix>天</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_REPETITION_TIMES"
        :label="securityConfig.PASSWORD_REPETITION_TIMES?.name"
        :help="securityConfig.PASSWORD_REPETITION_TIMES?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_REPETITION_TIMES"
          :precision="0"
          :min="3"
          :max="32"
        >
          <template #suffix>次</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_MIN_LENGTH"
        :label="securityConfig.PASSWORD_MIN_LENGTH?.name"
        :help="securityConfig.PASSWORD_MIN_LENGTH?.description"
      >
        <el-input-number
          v-model="form.PASSWORD_MIN_LENGTH"
          :precision="0"
          :min="8"
          :max="32"
        >
          <template #suffix>个字符</template>
        </el-input-number>
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_ALLOW_CONTAIN_USERNAME"
        :label="securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME?.name"
        :help="securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME?.description"
      >
        <el-switch
          v-model="form.PASSWORD_ALLOW_CONTAIN_USERNAME"
          active-value="1"
          inactive-value="0"
          active-text="是"
          inactive-text="否"
          inline-prompt
        />
      </ConfigFormItem>
      <ConfigFormItem
        prop="PASSWORD_REQUIRE_SYMBOLS"
        :label="securityConfig.PASSWORD_REQUIRE_SYMBOLS?.name"
        :help="securityConfig.PASSWORD_REQUIRE_SYMBOLS?.description"
      >
        <el-switch
          v-model="form.PASSWORD_REQUIRE_SYMBOLS"
          active-value="1"
          inactive-value="0"
          active-text="是"
          inactive-text="否"
          inline-prompt
        />
      </ConfigFormItem>
    </el-form>
    <div class="mt-4 flex flex-wrap gap-2">
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
    </div>
  </div>
</template>
