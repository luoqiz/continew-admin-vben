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
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
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

// 树列表折叠状态
const expanded = ref<boolean>(false);
/**
 * 全部展开/折叠
 * @param expand 是否展开
 */
const handleExpand = () => {
  expanded.value = !expanded.value;
  gridApi.grid.setAllTreeExpand(expanded.value);
};
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.menu.listTitle')">
      <template #toolbar-tools>
        <ElSpace>
          <span v-access:code="['system:menu:create']">
            <ElButton type="primary" @click="handleAdd">
              {{ $t('pages.common.add') }}
            </ElButton>
          </span>
          <span v-access:code="['system:menu:clearCache']">
            <ElButton type="danger" @click="handleClearCache">
              {{ $t('pages.common.clearCache') }}
            </ElButton>
          </span>
          <span>
            <ElButton v-if="!expanded" @click="handleExpand">
              {{ $t('pages.common.expand') }}
            </ElButton>
          </span>
          <span>
            <ElButton v-if="expanded" @click="handleExpand">
              {{ $t('pages.common.collapse') }}
            </ElButton>
          </span>
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
        <ElTag v-else type="danger">
          {{ $t('common.disabled') }}
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
          <span v-access:code="['system:menu:update']">
            <ElButton @click="handleEdit(row)" type="primary" text link>
              {{ $t('common.edit') }}
            </ElButton>
          </span>
          <span v-access:code="['system:menu:delete']">
            <ElPopconfirm
              title="确认删除?"
              icon-color="red"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton type="danger" text link>
                  {{ $t('common.delete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>
        </ElSpace>
      </template>
    </Grid>
    <FormDrawer @success="gridApi.query()" />
    <div v-access:code="['system:menu:clearCache']">
      <ElDialog
        v-model="centerDialogVisible"
        title="清空缓存"
        width="500"
        align-center
      >
        <span>是否确定清除菜单缓存？</span>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="centerDialogVisible = false">
              {{ $t('common.cancel') }}
            </ElButton>
            <ElButton type="primary" @click="clearCache">
              {{ $t('common.confirm') }}
            </ElButton>
          </div>
        </template>
      </ElDialog>
    </div>
  </Page>
</template>
<style lang="scss" scoped></style>
