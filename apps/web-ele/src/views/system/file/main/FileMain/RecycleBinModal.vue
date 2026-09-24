<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FileItem } from '#/api/system';

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
  (e: 'click' | 'dblclick', record: FileItem): void;
}>();

function useGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 50, fixed: 'left' },
    {
      title: $t('system.file.column.name'),
      field: 'originalName',
      minWidth: 100,
      slots: { default: 'originalName' },
      showOverflow: true,
    },
    {
      title: $t('system.file.column.type'),
      field: 'type',
      slots: { default: 'type' },
      width: 100,
    },
    {
      title: $t('system.file.column.size'),
      field: 'size',
      slots: { default: 'size' },
    },
    {
      title: $t('system.file.column.deleteTime'),
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
  if (type === 0) return $t('system.file.type.folder');
  const matched = FileTypeList.find((item) => item.value === type);
  return matched ? $t(matched.nameKey) : '';
};

// 计算文件夹大小
const calculateDirSize = async (record: FileItem) => {
  if (record.type !== 0) return;
  try {
    const data = await calcDirSize(record.id);
    record.size = data.size;
  } catch {
    ElMessage.error($t('system.file.message.calculateFailed'));
  }
};

// 还原
const onRestore = (record: FileItem) => {
  ElMessageBox.confirm(
    $t(
      record.type === 0
        ? 'system.file.message.restoreFolderConfirm'
        : 'system.file.message.restoreFileConfirm',
      {
        name: record.originalName,
      },
    ),
    $t('pages.common.tip'),
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      await restoreRecycleFile(record.id);
      ElMessage.success($t('system.file.message.restoreSuccess'));
      await tableGridApi.query();
      return true;
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: $t('system.file.message.deleteCanceled'),
      });
    });
};

// 删除
const onDelete = (record: FileItem) => {
  ElMessageBox.confirm(
    $t(
      record.type === 0
        ? 'system.file.message.deleteFolderConfirm'
        : 'system.file.message.deleteFileConfirm',
      {
        name: record.originalName,
      },
    ),
    $t('pages.common.tip'),
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      await deleteRecycleFile(record.id);
      ElMessage.success($t('pages.common.deleteSuccess'));
      await tableGridApi.query();
      return true;
    })
    .catch(() => {});
};

// 清空回收站
const onClean = () => {
  ElMessageBox.confirm(
    $t('system.file.message.cleanConfirm'),
    $t('pages.common.tip'),
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      await cleanRecycleBin();
      ElMessage.success($t('system.file.message.cleanSuccess'));
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
      label: $t('system.file.search.recycle'),
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
  <Modal class="h-[90%] w-[90%]" :title="$t('system.file.modal.recycleBin')">
    <TableGrid>
      <template #toolbar-tools>
        <el-button
          v-access:code="['system:fileRecycle:clean']"
          type="danger"
          @click="onClean"
        >
          <SvgDelete />
          {{ $t('system.file.action.clean') }}
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
            {{ $t('system.file.action.calculate') }}
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
              {{ $t('system.file.action.restore') }}
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
