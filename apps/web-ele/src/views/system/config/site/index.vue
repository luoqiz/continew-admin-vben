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

import { ElMessage, ElMessageBox } from 'element-plus';

import { listOption, resetOptionValue, updateOption } from '#/api/system';
import { useResetReactive } from '#/hooks';
import { fileToBase64 } from '#/utils/file';

defineOptions({ name: 'SystemSiteConfig' });

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const [form] = useResetReactive({
  SITE_FAVICON: '',
  SITE_LOGO: '',
  SITE_TITLE: '',
  SITE_COPYRIGHT: '',
});

const rules = reactive<FormRules<typeof form>>({
  SITE_TITLE: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  SITE_DESCRIPTION: [
    { required: true, message: '请输入系统描述', trigger: 'blur' },
  ],
  SITE_COPYRIGHT: [
    { required: true, message: '请输入版权声明', trigger: 'blur' },
  ],
});

const siteConfig = ref<SiteConfig>({});
const faviconFile = ref<FileItem[]>([]);
const logoFile = ref<FileItem[]>([]);
// 重置
const reset = () => {
  formRef.value?.resetFields();
  form.SITE_FAVICON = siteConfig.value.SITE_FAVICON?.value || '';
  form.SITE_LOGO = siteConfig.value.SITE_LOGO?.value || '';
  form.SITE_TITLE = siteConfig.value.SITE_TITLE?.value || '';
  form.SITE_DESCRIPTION = siteConfig.value.SITE_DESCRIPTION?.value || '';
  form.SITE_COPYRIGHT = siteConfig.value.SITE_COPYRIGHT?.value || '';
  form.SITE_BEIAN = siteConfig.value.SITE_BEIAN?.value || '';
  faviconFile.value[0] = { url: siteConfig.value.SITE_FAVICON?.value || '' };
  logoFile.value[0] = { url: siteConfig.value.SITE_LOGO?.value || '' };
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
  const data = await listOption(queryForm);
  // eslint-disable-next-line unicorn/no-array-reduce
  siteConfig.value = data.reduce((obj: SiteConfig, option: OptionResp) => {
    obj = { ...obj, [option.code]: option };
    return obj;
  }, {} as SiteConfig);
  handleCancel();
  loading.value = false;
};

// const appStore = useAppStore();
// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return false;
  await updateOption(
    Object.entries(form).map(([key, value]) => {
      return { id: siteConfig.value[key].id, code: key, value };
    }),
  );
  // appStore.setSiteConfig(form);
  await getDataList();
  ElMessage.success('保存成功');
};

// 恢复默认
const handleResetValue = async () => {
  await resetOptionValue(queryForm);
  ElMessage.success('恢复成功');
  await getDataList();
  // appStore.setSiteConfig(form);
};
const onResetValue = () => {
  ElMessageBox.confirm('确认恢复基础配置为默认值吗？', '警告', {
    confirmButtonClass: 'el-button--danger',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(async () => {
    await handleResetValue();
  });
};

// 上传 favicon or 上传 Logo
const handleUploadFile = (options: UploadRequestOptions) => {
  const controller = new AbortController();
  (async function requestWrap() {
    const { file, onSuccess, onError } = options;
    if (!file) {
      return;
    }
    fileToBase64(file)
      .then()
      .then((res) => {
        onSuccess({ url: res });
        ElMessage.success('上传成功');
      })
      .catch((error) => {
        onError(error);
      });
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
  <div class="gi_page" v-loading="loading">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      size="large"
      layout="vertical"
      :disabled="!isUpdate"
      class="form"
      label-width="80px"
    >
      <el-form-item
        class="image-item"
        field="SITE_LOGO"
        :label="siteConfig.SITE_LOGO?.name"
        :help="siteConfig.SITE_LOGO?.description"
      >
        <template #error>
          {{ siteConfig.SITE_LOGO?.description }}
        </template>
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
            <div class="el-upload__tip">
              jpg/png files with a size less than 500kb
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item
        class="image-item"
        field="SITE_FAVICON"
        :label="siteConfig.SITE_FAVICON?.name"
        inline-message
        show-message
      >
        <template #error>
          {{ siteConfig.SITE_FAVICON?.description }}
        </template>
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
            <div class="el-upload__tip">
              jpg/png files with a size less than 1M
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item
        class="input-item"
        field="SITE_TITLE"
        :label="siteConfig.SITE_TITLE?.name"
        :help="siteConfig.SITE_TITLE?.description"
      >
        <el-input
          v-model="form.SITE_TITLE"
          placeholder="请输入系统名称"
          :max-length="18"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        class="input-item"
        field="SITE_DESCRIPTION"
        :label="siteConfig.SITE_DESCRIPTION?.name"
        :help="siteConfig.SITE_DESCRIPTION?.description"
      >
        <el-input
          v-model="form.SITE_DESCRIPTION"
          placeholder="请输入系统描述"
          :auto-size="{ minRows: 1, maxRows: 3 }"
          type="textarea"
        />
      </el-form-item>
      <el-form-item
        class="input-item"
        field="SITE_COPYRIGHT"
        :label="siteConfig.SITE_COPYRIGHT?.name"
        :help="siteConfig.SITE_COPYRIGHT?.description"
      >
        <el-input v-model="form.SITE_COPYRIGHT" placeholder="请输入版权声明" />
      </el-form-item>
      <el-form-item
        field="SITE_BEIAN"
        :label="siteConfig.SITE_BEIAN?.name"
        :help="siteConfig.SITE_BEIAN?.description"
      >
        <el-input
          v-model="form.SITE_BEIAN"
          placeholder="请输入备案号"
          :max-length="30"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <el-space style="margin-top: 16px">
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
    </el-space>
  </div>
</template>
<style scoped lang="scss"></style>
