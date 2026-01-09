<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { StorageQuery, StorageResp } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElSpace, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteStorage, listStorage, setDefaultStorage } from '#/api';

import StorageEditDrawer from './AddModal.vue';
import {
  useStorageGridFieldColumns,
  useStorageGridSearchFormSchema,
} from './StorageData';

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useStorageGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
  },
  gridOptions: {
    columns: useStorageGridFieldColumns() as VxeTableGridOptions['columns'],
    border: true,
    height: 'auto',
    proxyConfig: {
      response: { list: 'list' },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listStorage({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          } as StorageQuery);
          return res;
        },
      },
    },
    toolbarConfig: { custom: true, export: false, refresh: true, search: true },
  } as VxeTableGridOptions<StorageResp>,
});

const [EditorDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: StorageEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: StorageResp) => {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
};

const handleAdd = () => {
  drawerApi.setData({});
  drawerApi.open();
};

const handleDelete = async (row: StorageResp) => {
  await deleteStorage(row.id);
  tableGridApi.query();
};

const handleSetDefault = async (row: StorageResp) => {
  await setDefaultStorage(row.id);
  tableGridApi.query();
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('system.storage.listTitle') || '存储配置'">
      <template #toolbar-tools>
        <ElSpace>
          <ElButton type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </ElButton>
        </ElSpace>
      </template>

      <template #recycleBinEnabled="{ row }">
        <ElTag v-if="row.recycleBinEnabled" type="success">
          {{ $t('common.yes') }}
        </ElTag>
        <ElTag v-else>{{ $t('common.no') }}</ElTag>
      </template>

      <template #status="{ row }">
        <ElTag v-if="row.status === 1" type="success">
          {{ $t('common.enabled') }}
        </ElTag>
        <ElTag v-else type="danger">{{ $t('common.disabled') }}</ElTag>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElButton type="text" @click="() => handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </ElButton>
          <ElButton type="text" @click="() => handleSetDefault(row)">
            {{ $t('system.storage.setDefault') }}
          </ElButton>
          <ElButton type="text" @click="() => handleDelete(row)">
            {{ $t('pages.common.delete') }}
          </ElButton>
        </ElSpace>
      </template>
    </TableGrid>

    <EditorDrawer @success="tableGridApi.query()" />
  </Page>
</template>

<style lang="scss" scoped></style>
