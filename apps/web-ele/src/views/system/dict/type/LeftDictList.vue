<script setup lang="ts">
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DictResp } from '#/api';

import { ref } from 'vue';

import { Card, CardContent, useVbenModal } from '@vben/common-ui';

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
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
      refreshOptions: { code: 'query' },
      refresh: true,
      search: true,
      zoom: true,
      zoomOptions: {},
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
  <Card class="h-full">
    <CardContent class="h-full overflow-auto">
      <Grid :table-title="$t('system.dict.list')">
        <template #toolbar-tools>
          <ElSpace>
            <span v-access:code="['system:dict:add']">
              <ElButton type="primary" @click="handleAdd">
                {{ $t('pages.common.add') }}
              </ElButton>
            </span>
            <span v-access:code="['system:dict:item:clearCache']">
              <ElButton type="danger" @click="handleClearCache">
                {{ $t('pages.common.clearCache') }}
              </ElButton>
            </span>
          </ElSpace>
        </template>
        <template #isSystem="{ row }">
          {{ row.isSystem ? $t('common.yes') : $t('common.no') }}
        </template>
        <template #action="{ row }">
          <ElSpace>
            <span v-access:code="['system:dict:update']">
              <ElButton @click="handleEdit(row)" type="primary" text link>
                编辑
              </ElButton>
            </span>
            <span v-access:code="['system:dict:delete']">
              <ElPopconfirm
                title="确认删除?"
                icon-color="red"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <ElButton :disabled="row.isSystem" type="danger" text link>
                    删除
                  </ElButton>
                </template>
              </ElPopconfirm>
            </span>
          </ElSpace>
        </template>
      </Grid>
    </CardContent>
    <DictTypeModal @reload="gridApi.query()" />
    <div v-access:code="['system:dict:item:clearCache']">
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
    </div>
  </Card>
</template>
<style lang="scss" scoped></style>
