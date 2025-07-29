<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DeptQuery, DeptResp } from '#/api/system/dept';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, exportDept, listDept } from '#/api/system/dept';
import { useDownload } from '#/hooks/app/useDownload';

import { useDeptColumns, useDeptSearchFormFields } from './data';
import EditModal from './EditModal.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDeptSearchFormFields(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useDeptColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    columnConfig: {
      resizable: true,
    },
    treeConfig: {
      rowField: 'id',
      parentField: 'parentId',
      childrenField: 'children',
      transform: false,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listDept({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return { list: res, total: res.length };
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
    checkboxConfig: {
      highlight: true,
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
  } as VxeTableGridOptions<DeptResp>,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: EditModal,
  destroyOnClose: true,
});

const handleEdit = (record: DeptResp) => {
  formDrawerApi.setData({ id: record.id });
  formDrawerApi.open();
};

const handleAdd = () => {
  formDrawerApi.setData({});
  formDrawerApi.open();
};

const handleDelete = async (row: DeptResp) => {
  try {
    await deleteDept(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await gridApi.query();
    return true;
  } catch {
    return false;
  }
};

const handleExport = () => {
  useDownload(() => exportDept(gridApi.formApi.getValues as DeptQuery));
};
</script>
<template>
  <Page auto-content-height>
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
            v-access:code="['system:dept:export']"
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
            v-access:code="['system:dept:update']"
          >
            {{ $t('pages.common.edit') }}
          </ElButton>
          <ElPopconfirm
            title="确认删除?"
            icon-color="red"
            @confirm="handleDelete(row)"
            v-access:code="['system:dept:delete']"
          >
            <template #reference>
              <ElButton type="danger">
                {{ $t('pages.common.delete') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </Grid>
  </Page>
  <FormDrawer @success="gridApi.query()" />
</template>
<style lang="scss" scoped></style>
