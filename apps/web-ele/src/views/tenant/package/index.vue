<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TenantPackageResp } from '#/api/tenant/package';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTenantPackage, listTenantPackage } from '#/api/tenant/package';

import {
  usePackageGridFieldColumns,
  usePackageGridSearchFormSchema,
} from './PackageData';
import PackageEditDrawer from './PackageEditDrawer.vue';

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: usePackageGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: usePackageGridFieldColumns(),
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
          const res = await listTenantPackage({
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
  } as VxeTableGridOptions<TenantPackageResp>,
});

const [EditorWindow, editorApi] = useVbenDrawer({
  connectedComponent: PackageEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: TenantPackageResp) => {
  editorApi.setData(record);
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({});
  editorApi.open();
};

const handleDelete = async (row: TenantPackageResp) => {
  try {
    await deleteTenantPackage(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('tenant.package.listTitle')">
      <template #toolbar-tools>
        <ElSpace>
          <span v-access:code="['tenant:package:create']">
            <ElButton type="primary" @click="handleAdd">
              {{ $t('pages.common.add') }}
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
          <span v-access:code="['tenant:package:update']">
            <ElButton type="primary" @click="handleEdit(row)" link text>
              {{ $t('pages.common.edit') }}
            </ElButton>
          </span>
          <span v-access:code="['tenant:package:delete']">
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
  </Page>
</template>
<style lang="scss" scoped></style>
