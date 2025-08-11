<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TenantQuery, TenantResp } from '#/api';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTenant, exportTenant, listTenant } from '#/api';
import { useDownload } from '#/hooks/app/useDownload';

import {
  useTenantGridFieldColumns,
  useTenantGridSearchFormSchema,
} from './TenantData';
import TenantEditDrawer from './TenantEditDrawer.vue';
import TenantResetAdminPwdModal from './TenantResetAdminPwdModal.vue';

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useTenantGridSearchFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useTenantGridFieldColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listTenant({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return res;
        },
        querySuccess: ({ $grid }) => {
          $grid.setAllTreeExpand(true);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    // checkboxConfig: {
    //   highlight: true,
    // },
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
  } as VxeTableGridOptions<TenantResp>,
});

const [EditorWindow, editorApi] = useVbenDrawer({
  connectedComponent: TenantEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: TenantResp) => {
  editorApi.setData({ id: record.id });
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({});
  editorApi.open();
};

const handleDelete = async (row: TenantResp) => {
  try {
    await deleteTenant(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};

const handleExport = () => {
  useDownload(
    async () =>
      exportTenant(await tableGridApi.formApi.getValues<TenantQuery>()),
    `${$t('tenant.management.listTitle')}-${Date.now()}.xlsx`,
  );
};

const [ResetPwdWindow, resetPwdApi] = useVbenModal({
  connectedComponent: TenantResetAdminPwdModal,
  destroyOnClose: true,
});

const handleUpdateAdminUserPwd = (row: TenantResp) => {
  resetPwdApi.setData(row).open();
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('tenant.management.listTitle')">
      <template #toolbar-tools>
        <ElSpace>
          <ElButton
            type="primary"
            v-access:code="['tenant:management:create']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </ElButton>
          <ElButton
            type="danger"
            v-access:code="['tenant:management:export']"
            @click="handleExport"
          >
            {{ $t('pages.common.export') }}
          </ElButton>
        </ElSpace>
      </template>
      <template #status="{ row }">
        <ElTag v-if="row.status === 1" type="success">
          {{ $t('common.enabled') }}
        </ElTag>
        <ElTag v-else type="danger">
          {{ $t('common.disabled') }}
        </ElTag>
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElButton
            type="primary"
            @click="handleEdit(row)"
            v-access:code="['tenant:management:update']"
          >
            {{ $t('pages.common.edit') }}
          </ElButton>
          <ElButton
            type="warning"
            @click="handleUpdateAdminUserPwd(row)"
            v-access:code="['tenant:management:updateAdminUserPwd']"
          >
            {{ $t('pages.common.resetAdminPwd') }}
          </ElButton>
          <ElPopconfirm
            :title="$t('ui.actionMessage.deleteConfirm', [row.name])"
            icon-color="red"
            @confirm="handleDelete(row)"
            v-access:code="['tenant:management:delete']"
          >
            <template #reference>
              <ElButton type="danger">
                {{ $t('pages.common.delete') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </TableGrid>
    <EditorWindow @success="tableGridApi.query()" />
    <ResetPwdWindow />
  </Page>
</template>
<style lang="scss" scoped></style>
