<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MenuResp } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElDialog,
  ElMessage,
  ElPopconfirm,
  ElSpace,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { clearMenuCache, deleteMenu, listMenu } from '#/api';

import { useMenuColumns, useMenuSearchFormFields } from './data';
import EditModal from './EditModal.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useMenuSearchFormFields(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useMenuColumns(),
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
          const res = await listMenu({
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
const clearCache = async () => {
  await clearMenuCache();
  ElMessage.success('清除成功');
  centerDialogVisible.value = false;
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
            清除缓存
          </ElButton>
        </ElSpace>
      </template>
      <template #type="{ row }">
        <ElTag v-if="row.type === 1" type="primary">目录</ElTag>
        <ElTag v-if="row.type === 2" type="success">菜单</ElTag>
        <ElTag v-if="row.type === 3">按钮</ElTag>
      </template>
      <template #status="{ row }">
        <ElTag v-if="row.status" type="success">
          {{ $t('common.enabled') }}
        </ElTag>
        <ElTag v-else type="success">
          {{ $t('common.disable') }}
        </ElTag>
      </template>
      <template #isExternal="{ row }">
        {{ row.isExternal ? $t('common.yes') : $t('common.no') }}
      </template>
      <template #isHidden="{ row }">
        {{ row.isHidden ? $t('common.yes') : $t('common.no') }}
      </template>
      <template #isCache="{ row }">
        {{ row.isCache ? $t('common.yes') : $t('common.no') }}
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
    <ElDialog
      v-model="centerDialogVisible"
      title="清空缓存"
      width="500"
      align-center
    >
      <span>是否确定清除菜单缓存？</span>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="centerDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="clearCache"> 确认 </ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
<style lang="scss" scoped></style>
