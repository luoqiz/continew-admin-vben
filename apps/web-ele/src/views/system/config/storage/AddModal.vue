<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addStorage, getStorage, updateStorage } from '#/api';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { bytesToMb, mbToBytes, useStorageEditFormSchema } from './StorageData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [StorageForm, storageFormApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  // 抽屉宽度有限，横向布局会让「Bucket / 存储路径」这类长标签被硬折行，改为上下布局
  layout: 'vertical',
  resetButtonOptions: { show: false },
  schema: useStorageEditFormSchema(isUpdate),
  submitButtonOptions: { show: false },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(storageFormApi),
    currentGetter: defaultFormValueGetter(storageFormApi),
  },
);

async function handleClosed() {
  await storageFormApi.resetForm();
  resetInitialized();
}

/** 高级配置：对象存储分片下限与后端 StorageTypeEnum.OSS 校验（5MB）对齐 */
function validateAdvanced(values: Record<string, any>, type: number) {
  if (type !== 2) return true;
  const partSize = Number(values.multipartUploadPartSize);
  if (Number.isFinite(partSize) && partSize > 0 && partSize < 5) {
    ElMessage.error($t('system.storage.partSizeMin', { min: 5 }));
    return false;
  }
  return true;
}

/**
 * 组装提交参数：MB 转字节、Secret Key 加密、清理与当前类型无关的隐藏字段。
 * 修改时留空的 Secret Key 传 null，后端据此保留原密钥。
 */
function buildPayload(values: Record<string, any>, type: number) {
  const rawSecretKey = type === 2 ? String(values.secretKey ?? '').trim() : '';
  const tempDir = String(values.multipartTempDir ?? '').trim();
  const payload: Record<string, any> = {
    ...values,
    type,
    secretKey: rawSecretKey ? encryptByRsa(rawSecretKey) || '' : null,
    multipartUploadThreshold: mbToBytes(values.multipartUploadThreshold),
    multipartUploadPartSize: mbToBytes(values.multipartUploadPartSize),
    multipartTempDir: type === 1 && tempDir ? tempDir : null,
  };
  if (type === 1) {
    payload.accessKey = null;
    payload.endpoint = null;
  }
  return payload;
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await storageFormApi.validate();
    if (!valid) return false;

    const values = { ...storageFormApi.form.values } as Record<string, any>;
    const type = Number(values.type);
    const secretKey = type === 2 ? String(values.secretKey ?? '').trim() : '';
    if (!isUpdate.value && type === 2 && !secretKey) {
      ElMessage.warning(
        $t('ui.formRules.required', [$t('system.storage.secretKey')]),
      );
      return false;
    }
    if (!validateAdvanced(values, type)) return false;

    drawerApi.lock();
    try {
      const payload = buildPayload(values, type);
      if (isUpdate.value) {
        await updateStorage(payload, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addStorage(payload);
        ElMessage.success($t('pages.common.addSuccess'));
      }
      resetInitialized();
      emits('success');
      drawerApi.close();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    try {
      drawerApi.lock(true);
      const data = (drawerApi.getData() ?? {}) as {
        id?: string;
        type?: number;
      };
      dataId.value = data?.id ?? '';
      if (data?.id) {
        const res = await getStorage(data.id);
        // 使用表单 API 的 setValues：会等待表单挂载、并按 schema 过滤字段，
        // 避免把 id、createTime 等非提交字段带进请求体
        await storageFormApi.setValues({
          ...res,
          // 后端不回传密钥，留空表示不修改
          secretKey: '',
          multipartUploadThreshold: bytesToMb(res.multipartUploadThreshold),
          multipartUploadPartSize: bytesToMb(res.multipartUploadPartSize),
        });
      } else if (data?.type) {
        // 从对应类型分组的「新增卡片」进入时预置存储类型。
        // destroyOnClose 下表单会重新挂载，setValues 会等挂载完成再设值，
        // 否则会被 schema 的 defaultValue 覆盖。
        await storageFormApi.setValues({ type: data.type });
      }
    } catch (error) {
      // 详情请求失败、或用户在响应前关闭抽屉导致表单已销毁，
      // 这里兜住异常，避免出现未捕获的 Promise 报错
      console.error(error);
    } finally {
      await markInitialized();
      drawerApi.unlock();
    }
  },
});

const getDrawerTitle = computed(() =>
  isUpdate.value
    ? $t('system.storage.editTitle')
    : $t('system.storage.addTitle'),
);
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <StorageForm />
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>
