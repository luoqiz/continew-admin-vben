<script setup lang="ts">
import type {
  VxeGridDefines,
  VxeGridProps,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileItem } from '#/api/system';

import { watch } from 'vue';

import { SvgCopyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import { ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { calcDirSize } from '#/api/system';
import { formatFileSize } from '#/utils/file';

import FileImage from '../../components/FileImage.vue';
// import { $t } from '#/locales';
import FileRightMenu from './FileRightMenu.vue';

const props = withDefaults(defineProps<Props>(), {
  data: () => [], // 文件数据
  selectedFileIds: () => [],
  isBatchMode: false, // 是否是批量模式
});

const emit = defineEmits<{
  (e: 'click', record: FileItem): void;
  (e: 'dblclick', record: FileItem): void;
  (e: 'select', record: FileItem): void;
  (e: 'rightMenuClick', mode: string, item: FileItem): void;
}>();

interface Props {
  data?: FileItem[];
  selectedFileIds?: string[];
  isBatchMode?: boolean;
}

// 计算文件夹大小
const calculateDirSize = async (record: FileItem) => {
  if (record.type !== 0) return;
  try {
    const data = await calcDirSize(record.id);
    record.size = data.size;
  } catch {
    ElMessage.error('计算失败，请重试');
  }
};

// 多选
const select: any = (record: FileItem) => {
  emit('select', record);
};

// 单击事件
const handleClick = (record: FileItem) => {
  emit('click', record);
};

// 双击事件
const handleDblclickFile = (item: FileItem) => {
  emit('dblclick', item);
};

// 右键菜单点击事件
const handleRightMenuClick = (mode: string, item: FileItem) => {
  emit('rightMenuClick', mode, item);
};

const useFileColumns: VxeGridProps['columns'] = () => {
  return [
    { type: 'checkbox', width: 40, fixed: 'left', visible: props.isBatchMode },
    { type: 'seq', width: 50, fixed: 'left' },
    {
      field: 'originalName',
      title: '名称',
      minwidth: 280,
      slots: { default: 'originalName' },
      fixed: 'left',
    },
    {
      field: 'size',
      title: '大小',
      width: 160,
      slots: { default: 'size' },
    },
    {
      field: 'storageName',
      title: '存储名称',
      width: 200,
    },
    {
      field: 'updateTime',
      title: '修改时间',
      width: 200,
    },
  ];
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useFileColumns(),
    data: props.data,
    border: true,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    columnConfig: {
      resizable: true,
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
  } as VxeTableGridOptions<FileItem>,
  gridEvents: {
    // 勾选事件
    checkboxChange: (params: VxeGridDefines.CheckboxChangeEventParams) => {
      select(params.row);
    },
  },
});

watch(
  () => props.data,
  (data) => {
    gridApi.grid.loadData(data || []);
  },
);

watch(
  () => props.isBatchMode,
  () => {
    gridApi.grid.reloadColumn(useFileColumns());
  },
);

const { copy } = useClipboard();
// 复制
const onCopy = (data: string) => {
  if (data) {
    copy(data);
  }
};
</script>

<template>
  <div class="file-list">
    <Grid>
      <template #originalName="{ row }">
        <FileRightMenu :data="row" @click="handleRightMenuClick($event, row)">
          <section
            class="file-name"
            @click="handleClick(row)"
            @dblclick="handleDblclickFile(row)"
          >
            <div class="file-image">
              <FileImage :data="row" />
            </div>
            {{ row.originalName }}
            <ElLink
              v-if="row.type !== 0"
              title="复制链接"
              @click="onCopy(row.url)"
            >
              <SvgCopyIcon class="ml-2" />
            </ElLink>
          </section>
        </FileRightMenu>
      </template>
      <template #size="{ row }">
        <span v-if="row.type === 0" v-access:code="['system:file:calcDirSize']">
          <el-link v-if="row.size === null" @click="calculateDirSize(row)">
            计算
          </el-link>
          <span v-else>
            {{ formatFileSize(row.size) }}
          </span>
        </span>
        <span v-else>{{ formatFileSize(row.size) }}</span>
      </template>
    </Grid>
  </div>
</template>

<style scoped lang="scss">
.file-list {
  width: 100%;
  height: 100%;
  padding-top: 12px;
  overflow: hidden;

  .file-name {
    display: flex;
    align-items: center;
    height: 100%;
    padding-top: 6px;
    padding-bottom: 6px;
    cursor: pointer;
  }

  .file-image {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
}
</style>
