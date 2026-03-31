<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ClientQuery, ClientResp } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElSpace, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteClient, listClient } from '#/api';

import ClientEditDrawer from './AddModal.vue';
import {
  useClientGridFieldColumns,
  useClientGridSearchFormSchema,
} from './ClientData';

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useClientGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
  },
  gridOptions: {
    columns: useClientGridFieldColumns() as VxeTableGridOptions['columns'],
    border: true,
    height: 'auto',
    proxyConfig: {
      response: { list: 'list' },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listClient({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          } as ClientQuery);
          return res;
        },
      },
    },
    toolbarConfig: { custom: true, export: false, refresh: true, search: true },
  } as VxeTableGridOptions<ClientResp>,
});

const [EditorDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: ClientEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: ClientResp) => {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
};

const handleAdd = () => {
  drawerApi.setData({});
  drawerApi.open();
};

const handleDelete = async (row: ClientResp) => {
  await deleteClient(row.id);
  tableGridApi.query();
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('system.client.listTitle') || '客户端配置'">
      <template #toolbar-tools>
        <ElSpace>
          <ElButton type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </ElButton>
        </ElSpace>
      </template>

      <template #isConcurrent="{ row }">
        <ElTag v-if="row.isConcurrent" type="success">
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
