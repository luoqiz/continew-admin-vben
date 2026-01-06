<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FileItem } from '#/api/system/file';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  calcDirSize,
  cleanRecycleBin,
  deleteRecycleFile,
  listRecycleFiles,
  restoreRecycleFile,
} from '#/api/system/file';
import { FileTypeList } from '#/constant/file';
import { isMobile } from '#/utils';
import { formatFileSize } from '#/utils/file';
import has from '#/utils/has';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'click', record: FileItem): void;
  (e: 'dblclick', record: FileItem): void;
}>();

function useGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 50, fixed: 'left' },
    {
      title: '名称',
      field: 'originalName',
      minWidth: 100,
      slots: { default: 'originalName' },
      showOverflow: true,
    },
    {
      title: '类型',
      field: 'type',
      slots: { default: 'type' },
      width: 100,
    },
    {
      title: '大小',
      field: 'size',
      slots: { default: 'size' },
    },
    {
      title: '删除时间',
      field: 'updateTime',
      width: 180,
    },
    {
      title: $t('common.operation'),
      field: 'action',
      slots: { default: 'action' },
      width: 130,
      align: 'center',
      fixed: isMobile() ? undefined : 'right',
      visible: has.hasPermOr([
        'system:fileRecycle:restore',
        'system:fileRecycle:delete',
      ]),
    },
  ];
}

// 获取文件类型
const getFileType = (type: number) => {
  if (type === 0) return '文件夹';
  return FileTypeList.find((item) => item.value === type)?.name;
};

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

// 还原
const onRestore = (record: FileItem) => {
  ElMessageBox.confirm(
    `是否确定还原${record.type === 0 ? '文件夹' : '文件'}「${record.originalName}」？`,
    '提示',
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  )
    .then(async () => {
      await restoreRecycleFile(record.id);
      ElMessage.success('还原成功');
      await tableGridApi.query();
      return true;
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      });
    });
};

// 删除
const onDelete = (record: FileItem) => {
  ElMessageBox.confirm(
    `是否确定删除${record.type === 0 ? '文件夹' : '文件'}「${record.originalName}」？`,
    '提示',
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  )
    .then(async () => {
      await deleteRecycleFile(record.id);
      ElMessage.success('删除成功');
      await tableGridApi.query();
      return true;
    })
    .catch(() => {});
};

// 清空回收站
const onClean = () => {
  ElMessageBox.confirm('是否确定清空回收站？', '提示', {
    confirmButtonClass: 'el-button--danger',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      await cleanRecycleBin();
      ElMessage.success('清空成功');
      await tableGridApi.query();
      return true;
    })
    .catch(() => {});
};

const [Modal] = useVbenModal({
  centered: true,
  showCancelButton: false,
  showConfirmButton: false,
  onClosed() {
    // 关闭弹窗时触发
    emit('close');
  },
});

function useGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'originalName',
      label: '搜索名称',
      component: 'Input',
    },
  ];
}

// 单击事件
const handleClick = (record: FileItem) => {
  emit('click', record);
};

// 双击事件
const handleDblclickFile = (item: FileItem) => {
  emit('dblclick', item);
};

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useGridFieldColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      autoLoad: true,
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listRecycleFiles({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
            sort: ['updateTime,desc'],
          });
          return res;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
      search: true,
      zoom: true,
      zoomOptions: {},
    },
  } as VxeTableGridOptions<FileItem>,
});
</script>

<template>
  <Modal class="h-[90%] w-[90%]" title="文件回收站">
    <TableGrid>
      <template #toolbar-tools>
        <el-button
          v-access:code="['system:fileRecycle:clean']"
          type="danger"
          @click="onClean"
        >
          <SvgDelete />
          清空回收站
        </el-button>
      </template>
      <template #originalName="{ row }">
        <section
          class="file-name"
          @click="handleClick(row)"
          @dblclick="handleDblclickFile(row)"
        >
          <!-- <div class="file-image">
            <FileImage :data="row" />
          </div> -->
          {{ row.originalName }}
        </section>
      </template>
      <template #type="{ row }">{{ getFileType(row.type) }}</template>
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
      <template #action="{ row }">
        <el-space>
          <span v-access:code="['system:fileRecycle:restore']">
            <ElButton type="warning" text link @click="onRestore(row)">
              还原
            </ElButton>
          </span>
          <span v-access:code="['system:fileRecycle:delete']">
            <ElButton type="danger" text link @click="onDelete(row)">
              {{ $t('pages.common.delete') }}
            </ElButton>
          </span>
        </el-space>
      </template>
    </TableGrid>
  </Modal>
</template>

<style scoped lang="scss">
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
</style>
