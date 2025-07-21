<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MenuResp } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu } from '#/api';
import { listDept } from '#/api/system/dept';

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
  } as VxeTableGridOptions<MenuResp>,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: EditModal,
  destroyOnClose: true,
});

const handleEdit = (record: MenuResp) => {
  formDrawerApi.setData({ id: record.id });
  formDrawerApi.open();
};

const handleAdd = () => {
  formDrawerApi.setData({});
  formDrawerApi.open();
};

const handleDelete = async (row: MenuResp) => {
  try {
    await deleteMenu(row.id);
    ElMessage.success('删除成功');
    await gridApi.query();
    return true;
  } catch {
    return false;
  }
};

// 清除缓存
const centerDialogVisible = ref(false);
const handleClearCache = () => {
  centerDialogVisible.value = true;
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
            v-access:code="['system:dict:item:clearCache']"
            @click="handleClearCache"
          >
            导出
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
              <ElButton> 删除 </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </Grid>
    <FormDrawer @success="gridApi.query()" />
  </Page>
</template>
<style lang="scss" scoped></style>
