<script setup lang="ts">
import type { FileItem } from '#/api/system';

import { defineAsyncComponent, ref } from 'vue';

import { SvgCopyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import { ElMessage } from 'element-plus';

import { calcDirSize } from '#/api/system';
import { formatFileSize } from '#/utils/file';

const props = withDefaults(defineProps<Props>(), {});

const FileImage = defineAsyncComponent(() => import('../FileImage.vue'));

interface Props {
  data: FileItem;
}

const isCalculating = ref(false);
const calculatedSize = ref<null | number>(null);
// 计算文件夹大小
const calculateDirSize = async () => {
  if (isCalculating.value || props.data.type !== 0) return;
  isCalculating.value = true;
  try {
    const data = await calcDirSize(props.data.id);
    calculatedSize.value = data.size;
  } catch {
    ElMessage.error('计算失败，请重试');
  } finally {
    isCalculating.value = false;
  }
};

const { copy } = useClipboard();
// 复制
const onCopy = (data: string) => {
  if (data) {
    copy(data);
  }
};
</script>

<template>
  <el-row justify="center">
    <div style="height: 100px">
      <FileImage :data="data" style="border-radius: 5px" />
    </div>
  </el-row>
  <div style="width: 90%; margin-top: 16px">
    <el-descriptions :column="1" :border="true" label-width="80">
      <el-descriptions-item label="名称" label-align="right">
        {{ data.originalName }}
        <ElLink
          v-if="data.type !== 0"
          title="复制链接"
          @click="onCopy(data.url)"
        >
          <SvgCopyIcon />
        </ElLink>
      </el-descriptions-item>
      <el-descriptions-item label-align="right" label="大小">
        <span
          v-if="data.type === 0"
          v-access:code="['system:file:calcDirSize']"
        >
          <el-link
            v-if="isCalculating || calculatedSize === null"
            :disabled="isCalculating"
            @click="calculateDirSize"
          >
            {{ isCalculating ? '计算中...' : '计算' }}
          </el-link>
          <span v-else>
            {{ formatFileSize(calculatedSize) }}
          </span>
        </span>
        <span v-else>{{ formatFileSize(data.size) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label-align="right" label="路径">
        {{ `${data.parentPath === '/' ? '' : data.parentPath}/${data.name}` }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="data.sha256"
        label-align="right"
        label="SHA256"
      >
        <span style="word-break: break-all">{{ data.sha256 }}</span>
        <ElLink
          v-if="data.type !== 0"
          title="复制"
          @click="onCopy(data.sha256)"
        >
          <SvgCopyIcon />
        </ElLink>
      </el-descriptions-item>
      <el-descriptions-item label-align="right" label="上传时间">
        {{ data.createTime }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="data?.updateTime"
        label-align="right"
        label="修改时间"
      >
        {{ data?.updateTime }}
      </el-descriptions-item>
      <el-descriptions-item label-align="right" label="存储名称">
        {{ data.storageName }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="less" scoped></style>
