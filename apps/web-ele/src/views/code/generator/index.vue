<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { GenConfigResp } from '#/api';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { ElButton, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listGenConfig } from '#/api';
import { $t } from '#/locales';

import { useGenConfigColumns, useGridFormSchema } from './data';
import GenConfigDrawer from './modules/GenConfigDrawer.vue';
import GenPreviewModal from './modules/GenPreviewModal.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: GenConfigDrawer,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useGenConfigColumns(),
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
          const res = await listGenConfig({
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
  } as VxeTableGridOptions<GenConfigResp>,
});

function openConfig(row: GenConfigResp) {
  formDrawerApi.setData(row).open();
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: GenPreviewModal,
  destroyOnClose: true,
});
// 预览
const onPreview = (tableNames: Array<string>) => {
  formModalApi.setData(tableNames).open();
};

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="refreshGrid" />
    <FormModal />
    <Grid :table-title="$t('system.code.list')">
      <template #toolbar-tools> </template>
      <template #action="{ row }">
        <ElSpace>
          <ElButton
            @click="openConfig(row)"
            v-access:code="['code:generator:config']"
          >
            配置
          </ElButton>
          <ElButton
            :disabled="!row.author"
            @click="onPreview([row.tableName])"
            v-access:code="['code:generator:preview']"
          >
            生成
          </ElButton>
        </ElSpace>
      </template>
    </Grid>
  </Page>
</template>
