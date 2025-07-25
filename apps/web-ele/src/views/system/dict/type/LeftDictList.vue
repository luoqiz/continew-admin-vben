<script setup lang="ts">
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DictResp } from '#/api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElDialog, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { clearDictCache, deleteDict, listDict } from '#/api';

import { useDictColumns, useDictSearchFormFields } from '../data';
import { emitter } from '../mitt';
import dictTypeModal from './dict-type-modal.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDictSearchFormFields(),
    submitOnChange: true,
  },
  gridEvents: {
    cellClick: ({ row }) => {
      emitter.emit('rowClick', row.id);
    },
  } as VxeGridListeners<DictResp>,
  gridOptions: {
    columns: useDictColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listDict({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          if (res.length > 0) {
            emitter.emit('rowClick', res[0]!.id);
          }
          return { list: res, total: res.length };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<DictResp>,
});

const [DictTypeModal, modalApi] = useVbenModal({
  connectedComponent: dictTypeModal,
});

const handleEdit = (record: DictResp) => {
  modalApi.setData({ id: record.id });
  modalApi.open();
};

const handleAdd = () => {
  modalApi.setData({});
  modalApi.open();
};

const handleDelete = async (row: DictResp) => {
  try {
    await deleteDict(row.id);
    ElMessage.success('删除成功');
    await gridApi.query();
    return true;
  } catch {
    return false;
  }
};

const clearDictNames = ref('');
const centerDialogVisible = ref(false);
// 清除缓存
const handleClearCache = () => {
  const selectData = gridApi.grid.getCheckboxRecords();
  if (selectData.length === 0) {
    return ElMessage.warning('请先选择字典');
  }
  clearDictNames.value = selectData.map((row: DictResp) => row.name).join(',');
  centerDialogVisible.value = true;
};

const clearCache = async () => {
  const selectData = gridApi.grid.getCheckboxRecords();
  for (const item of selectData) {
    await clearDictCache(item.code);
  }
  ElMessage.success('清除成功');
  centerDialogVisible.value = false;
};
</script>
<template>
  <Grid :table-title="$t('system.dict.list')">
    <template #toolbar-tools>
      <ElSpace>
        <ElButton
          type="primary"
          v-access:code="['system:dict:add']"
          @click="handleAdd"
        >
          {{ $t('pages.common.add') }}
        </ElButton>
        <ElButton
          type="danger"
          v-access:code="['system:dict:item:clearCache']"
          @click="handleClearCache"
        >
          清除缓存
        </ElButton>
      </ElSpace>
    </template>
    <template #isSystem="{ row }">
      {{ row.isSystem ? $t('common.yes') : $t('common.no') }}
    </template>
    <template #action="{ row }">
      <ElSpace>
        <ElButton
          @click="handleEdit(row)"
          v-access:code="['code:generator:config']"
        >
          编辑
        </ElButton>
        <ElPopconfirm
          title="确认删除?"
          icon-color="red"
          @confirm="handleDelete(row)"
          v-access:code="['code:generator:preview']"
        >
          <template #reference>
            <ElButton :disabled="row.isSystem"> 删除 </ElButton>
          </template>
        </ElPopconfirm>
      </ElSpace>
    </template>
  </Grid>
  <DictTypeModal @reload="gridApi.query()" />
  <ElDialog
    v-model="centerDialogVisible"
    title="清空缓存"
    width="500"
    align-center
  >
    <span>是否确定清除字典「{{ clearDictNames }}」缓存？</span>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="centerDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="clearCache"> 确认 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
<style lang="scss" scoped></style>
