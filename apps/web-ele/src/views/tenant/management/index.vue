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
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
          <span v-access:code="['tenant:management:create']">
            <ElButton type="primary" @click="handleAdd">
              {{ $t('pages.common.add') }}
            </ElButton>
          </span>
          <span v-access:code="['tenant:management:export']">
            <ElButton type="danger" @click="handleExport">
              {{ $t('pages.common.export') }}
            </ElButton>
          </span>
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
          <span v-access:code="['tenant:management:update']">
            <ElButton type="primary" @click="handleEdit(row)" link text>
              {{ $t('pages.common.edit') }}
            </ElButton>
          </span>
          <span v-access:code="['tenant:management:updateAdminUserPwd']">
            <ElButton
              type="warning"
              @click="handleUpdateAdminUserPwd(row)"
              link
              text
            >
              {{ $t('pages.common.resetAdminPwd') }}
            </ElButton>
          </span>
          <span v-access:code="['tenant:management:delete']">
            <ElPopconfirm
              :title="$t('ui.actionMessage.deleteConfirm', [row.name])"
              icon-color="red"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton type="danger" link text>
                  {{ $t('pages.common.delete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>
        </ElSpace>
      </template>
    </TableGrid>
    <EditorWindow @success="tableGridApi.query()" />
    <ResetPwdWindow />
  </Page>
</template>
<style lang="scss" scoped></style>
