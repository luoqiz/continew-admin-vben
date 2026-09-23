<script setup lang="ts">
import type {
  FormInstance,
  FormRules,
  UploadRequestOptions,
} from 'element-plus';

import type { FileItem, OptionResp, SiteConfig } from '#/api/system';

import { onMounted, reactive, ref } from 'vue';

import {
  SvgEditIcon,
  SvgRefreshIcon,
  SvgSaveIcon,
  SvgUndoIcon,
} from '@vben/icons';
import { updatePreferences } from '@vben/preferences';

import { ElMessage, ElMessageBox } from 'element-plus';

import { listOption, resetOptionValue, updateOption } from '#/api/system';
import { useResetReactive } from '#/hooks';
import { fileToBase64 } from '#/utils/file';

import ConfigFormItem from '../components/ConfigFormItem.vue';

defineOptions({ name: 'SystemSiteConfig' });

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  SITE_BEIAN: '',
  SITE_COPYRIGHT: '',
  SITE_DESCRIPTION: '',
  SITE_FAVICON: '',
  SITE_LOGO: '',
  SITE_TITLE: '',
});

const rules = reactive<FormRules<typeof form>>({
  SITE_COPYRIGHT: [{ required: true, message: '请输入版权声明' }],
  SITE_DESCRIPTION: [{ required: true, message: '请输入系统描述' }],
  SITE_TITLE: [{ required: true, message: '请输入系统名称' }],
});

const siteConfig = ref<SiteConfig>({});
const faviconFile = ref<FileItem[]>([]);
const logoFile = ref<FileItem[]>([]);

const toFileItem = (url: string): FileItem => ({
  contentType: '',
  createTime: '',
  createUserString: '',
  extension: '',
  id: '',
  metadata: '',
  name: '',
  originalName: '',
  parentPath: '',
  path: '',
  sha256: '',
  size: 0,
  status: 'success',
  storageId: '',
  storageName: '',
  thumbnailMetadata: '',
  thumbnailName: '',
  thumbnailSize: 0,
  thumbnailUrl: '',
  type: 0,
  url,
});

// 重置为服务端已保存的值
const reset = () => {
  formRef.value?.resetFields();
  form.SITE_TITLE = siteConfig.value.SITE_TITLE?.value || '';
  form.SITE_DESCRIPTION = siteConfig.value.SITE_DESCRIPTION?.value || '';
  form.SITE_COPYRIGHT = siteConfig.value.SITE_COPYRIGHT?.value || '';
  form.SITE_BEIAN = siteConfig.value.SITE_BEIAN?.value || '';
  form.SITE_FAVICON = siteConfig.value.SITE_FAVICON?.value || '';
  form.SITE_LOGO = siteConfig.value.SITE_LOGO?.value || '';
  faviconFile.value = [toFileItem(`${siteConfig.value.SITE_FAVICON?.value}`)];
  logoFile.value = [toFileItem(`${siteConfig.value.SITE_LOGO?.value}`)];
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

const queryForm = reactive({
  category: 'SITE',
});
// 查询列表数据
const getDataList = async () => {
  loading.value = true;
  try {
    const data = await listOption(queryForm);
    const config = siteConfig.value as Record<string, OptionResp>;
    for (const option of data) {
      config[option.code] = option;
      form[option.code] = option.value;
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
  const config = siteConfig.value as Record<string, OptionResp>;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: config[key]?.id, code: key, value };
    }),
  );
  // 更改系统图标
  document
    .querySelector('link[rel="icon"]')
    ?.setAttribute('href', form.SITE_FAVICON || '/favicon.ico');
  // 更改系统logo
  updatePreferences({
    logo: {
      source: form.SITE_LOGO,
      sourceDark: form.SITE_LOGO,
    },
  });
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
  ElMessageBox.confirm('确认恢复基础配置为默认值吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await handleResetValue();
  });
};

// 上传 favicon 或 Logo
const handleUploadFile = (options: UploadRequestOptions) => {
  const controller = new AbortController();
  (async function requestWrap() {
    const { file, onSuccess, onError } = options;
    if (!file) {
      ElMessage.error('请选择文件');
      return false;
    }
    if (file.size > 1024 * 1024) {
      ElMessage.error('文件大小不能超过 1MB');
      return false;
    }
    try {
      const res = await fileToBase64(file);
      onSuccess({ url: res });
      ElMessage.success('上传成功');
    } catch (error) {
      onError(error as never);
    }
  })();
  return {
    abort() {
      controller.abort();
    },
  };
};

// 上传 Favicon 成功回调
const onSuccessUploadFavicon = (response: any) => {
  form.SITE_FAVICON = response.url;
};

// 上传 Logo 成功回调
const onSuccessUploadLogo = (response: any) => {
  form.SITE_LOGO = response.url;
};

onMounted(async () => {
  await getDataList();
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
        prop="SITE_LOGO"
        :label="siteConfig.SITE_LOGO?.name"
        :help="siteConfig.SITE_LOGO?.description"
      >
        <el-upload
          v-model:file-list="logoFile"
          list-type="picture-card"
          accept="image/*"
          action="#"
          :http-request="handleUploadFile"
          :on-success="onSuccessUploadLogo"
          :limit="1"
        >
          <template #tip>
            <div class="el-upload__tip">支持 jpg/png，大小不超过 1MB</div>
          </template>
        </el-upload>
      </ConfigFormItem>

      <ConfigFormItem
        prop="SITE_FAVICON"
        :label="siteConfig.SITE_FAVICON?.name"
        :help="siteConfig.SITE_FAVICON?.description"
      >
        <el-upload
          v-model:file-list="faviconFile"
          list-type="picture-card"
          accept="image/*"
          action="#"
          :http-request="handleUploadFile"
          :limit="1"
          :on-success="onSuccessUploadFavicon"
        >
          <template #tip>
            <div class="el-upload__tip">支持 jpg/png，大小不超过 1MB</div>
          </template>
        </el-upload>
      </ConfigFormItem>

      <ConfigFormItem
        prop="SITE_TITLE"
        :label="siteConfig.SITE_TITLE?.name"
        :help="siteConfig.SITE_TITLE?.description"
      >
        <el-input
          v-model="form.SITE_TITLE"
          placeholder="请输入系统名称"
          :maxlength="18"
          show-word-limit
        />
      </ConfigFormItem>

      <ConfigFormItem
        prop="SITE_DESCRIPTION"
        :label="siteConfig.SITE_DESCRIPTION?.name"
        :help="siteConfig.SITE_DESCRIPTION?.description"
      >
        <el-input
          v-model="form.SITE_DESCRIPTION"
          placeholder="请输入系统描述"
          :autosize="{ minRows: 1, maxRows: 3 }"
          type="textarea"
        />
      </ConfigFormItem>

      <ConfigFormItem
        prop="SITE_COPYRIGHT"
        :label="siteConfig.SITE_COPYRIGHT?.name"
        :help="siteConfig.SITE_COPYRIGHT?.description"
      >
        <el-input v-model="form.SITE_COPYRIGHT" placeholder="请输入版权声明" />
      </ConfigFormItem>

      <ConfigFormItem
        prop="SITE_BEIAN"
        :label="siteConfig.SITE_BEIAN?.name"
        :help="siteConfig.SITE_BEIAN?.description"
      >
        <el-input
          v-model="form.SITE_BEIAN"
          placeholder="请输入备案号"
          :maxlength="30"
          show-word-limit
        />
      </ConfigFormItem>
    </el-form>
    <div class="mt-4 flex flex-wrap gap-2">
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:siteConfig:update']"
        type="primary"
        @click="onUpdate"
      >
        <template #icon> <SvgEditIcon /> </template>修改
      </el-button>
      <el-button
        v-if="!isUpdate"
        v-access:code="['system:siteConfig:update']"
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
