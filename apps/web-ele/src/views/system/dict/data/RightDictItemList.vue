<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictItemResp } from '#/api';

import { ref } from 'vue';

import { Card, CardContent, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElMessage,
  ElPopconfirm,
  ElSpace,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDictItem, listDictItem } from '#/api';

import { useDictItemColumns, useDictItemSearchFormFields } from '../data';
import { emitter } from '../mitt';
import dictItem from './dictItem.vue';

// 字典id
const dictId = ref('');

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDictItemSearchFormFields(),
    submitOnChange: true,
    resetButtonOptions: {
      show: false,
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  },
  gridOptions: {
    columns: useDictItemColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      autoLoad: false,
      ajax: {
        query: async ({ page }, formValues) => {
          return await listDictItem({
            page: page.currentPage,
            size: page.pageSize,
            sort: 'createTime,desc',
            ...formValues,
          });
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
  } as VxeTableGridOptions<DictItemResp>,
});
emitter.on('rowClick', async (value) => {
  await gridApi.formApi.setFieldValue('dictId', value);
  dictId.value = value;
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: dictItem,
  destroyOnClose: true,
});

const handleEdit = (record: DictItemResp) => {
  formDrawerApi.setData({ id: record.id });
  formDrawerApi.open();
};

const handleAdd = () => {
  formDrawerApi.setData({ dictId: dictId.value });
  formDrawerApi.open();
};

const handleDelete = async (row: DictItemResp) => {
  try {
    await deleteDictItem(row.id);
    ElMessage.success('删除成功');
    await gridApi.query();
    return true;
  } catch {
    return false;
  }
};
const onSuccess = () => {
  gridApi.query();
};
</script>
<template>
  <Card class="h-full">
    <CardContent class="h-full overflow-auto">
      <Grid :table-title="$t('system.dictItem.list')">
        <template #toolbar-tools>
          <ElSpace>
            <span v-access:code="['system:dict:add']">
              <ElButton type="primary" @click="handleAdd">
                {{ $t('pages.common.add') }}
              </ElButton>
            </span>
          </ElSpace>
        </template>
        <template #value="{ row }">
          <ElTag :type="row.color">{{ row.value }}</ElTag>
        </template>
        <template #status="{ row }">
          {{ row.status ? $t('common.enabled') : $t('common.disable') }}
        </template>
        <template #action="{ row }">
          <ElSpace>
            <span v-access:code="['system:dictItem:create']">
              <ElButton @click="handleEdit(row)" type="primary" text link>
                {{ $t('common.edit') }}
              </ElButton>
            </span>
            <span v-access:code="['system:dictItem:delete']">
              <ElPopconfirm
                title="确认删除?"
                icon-color="red"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <ElButton type="danger" text link> 删除 </ElButton>
                </template>
              </ElPopconfirm>
            </span>
          </ElSpace>
        </template>
      </Grid>
    </CardContent>
    <FormDrawer @success="onSuccess" />
  </Card>
</template>
<style lang="scss" scoped></style>
