<script lang="ts" setup>
import type { OpenAppApi } from '#/api/open/app';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElMessage,
  ElTag,
} from 'element-plus';

const appData = ref<OpenAppApi.AppResp>();

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<OpenAppApi.AppResp>();
      if (data) {
        appData.value = data;
      }
    }
  },
  showConfirmButton: false,
  cancelText: $t('common.cancel'),
});

const getDrawerTitle = computed(() => {
  return $t('open.app.expireTime');
});

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制成功');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败');
  }
};
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <div class="p-4">
      <ElDescriptions :column="2" size="large" class="general-description">
        <ElDescriptionsItem label="ID">{{ appData?.id }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.name')">
          {{ appData?.name }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.accessKey')" :span="2">
          <div class="inline-block">
            <span class="font-mono text-sm">{{ appData?.accessKey }}</span>
            <ElButton
              class="ml-2"
              v-if="appData?.accessKey"
              type="primary"
              size="small"
              @click="copyToClipboard(appData.accessKey)"
            >
              {{ $t('open.app.copy') }}
            </ElButton>
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.status')">
          <ElTag v-if="appData?.status === 1" type="success">启用</ElTag>
          <ElTag v-else type="danger">禁用</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.expireTime')">
          {{ appData?.expireTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.createUser')">
          {{ appData?.createUserString }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.createTime')">
          {{ appData?.createTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.updateUser')">
          {{ appData?.updateUserString }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.updateTime')">
          {{ appData?.updateTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('open.app.description')" :span="2">
          {{ appData?.description }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>
