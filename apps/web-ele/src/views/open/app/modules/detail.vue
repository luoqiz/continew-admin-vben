<script lang="ts" setup>
import type { OpenAppApi } from '#/api/open/app';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElMessage } from 'element-plus';

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
  cancelText: '关闭',
});

const getDrawerTitle = computed(() => {
  return '应用详情';
});

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制成功');
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage.error('复制失败');
  }
};
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <div class="p-4">
      <ElDescriptions :column="2" size="large" class="general-description">
        <ElDescriptionsItem label="ID：">{{ appData?.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="名称：">{{ appData?.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Access Key" :span="2">
          <div class="inline-block">
            <span class="font-mono text-sm">{{ appData?.accessKey }}</span>
            <ElButton class="ml-2" v-if="appData?.accessKey" type="primary" size="small"
              @click="copyToClipboard(appData.accessKey)">
              复制
            </ElButton>
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag v-if="appData?.status === 1" type="success">启用</ElTag>
          <ElTag v-else type="danger">禁用</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="失效时间">{{ appData?.expireTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建人">{{ appData?.createUserString }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ appData?.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="修改人">{{ appData?.updateUserString }}</ElDescriptionsItem>
        <ElDescriptionsItem label="修改时间">{{ appData?.updateTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="描述" :span="2">{{ appData?.description }}</ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>
