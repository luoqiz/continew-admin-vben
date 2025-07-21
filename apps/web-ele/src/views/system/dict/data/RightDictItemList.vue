<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictItemResp } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

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
      refresh: { code: 'query' },
      search: true,
      zoom: true,
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
  <Grid :table-title="$t('system.dictItem.list')">
    <template #toolbar-tools>
      <ElSpace>
        <ElButton
          type="primary"
          v-access:code="['system:dict:add']"
          @click="handleAdd"
        >
          {{ $t('pages.common.add') }}
        </ElButton>
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
  <FormDrawer @success="onSuccess" />
</template>
<style lang="scss" scoped></style>
