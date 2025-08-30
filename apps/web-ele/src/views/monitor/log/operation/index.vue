<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LogResp } from '#/api/monitor/log';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listLog } from '#/api/monitor/log';
import { dateRangeShortcuts } from '#/utils/dateTools';

function usePackageGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'createUserString',
      label: $t('monitor.loginLog.createUserString'),
      component: 'Input',
    },
    {
      fieldName: 'ip',
      label: $t('monitor.loginLog.ip'),
      component: 'Input',
    },
    {
      fieldName: 'createTime',
      label: $t('monitor.loginLog.createTime'),
      component: 'DateRangePicker',
      componentProps: {
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        shortcuts: dateRangeShortcuts,
      },
    },
  ];
}

// Table 字段配置
function usePackageGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'createTime',
      title: $t('monitor.loginLog.createTime'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'createUserString',
      title: $t('monitor.loginLog.createUserString'),
      align: 'center',
    },
    {
      field: 'description',
      title: $t('monitor.loginLog.description'),
      align: 'center',
    },
    {
      field: 'status',
      title: $t('monitor.loginLog.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    {
      field: 'ip',
      title: $t('monitor.loginLog.ip'),
      align: 'center',
    },
    {
      field: 'address',
      title: $t('monitor.loginLog.address'),
      align: 'center',
    },
    {
      field: 'browser',
      title: $t('monitor.loginLog.browser'),
      align: 'center',
    },

    {
      field: 'os',
      title: $t('monitor.loginLog.os'),
      align: 'center',
    },
  ];
}

const [TableGrid] = useVbenVxeGrid({
  formOptions: {
    schema: usePackageGridSearchFormSchema(),
    submitOnChange: true,
    wrapperClass: 'grid-cols-4 md:grid-cols-4 lg:grid-cols-4',
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
          const res = await listLog({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
            sort: 'createTime,desc',
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
  } as VxeTableGridOptions<LogResp>,
});
</script>

<template>
  <Page auto-content-height>
    <TableGrid>
      <template #status="{ row }">
        <ElTag v-if="row.status === 1" type="success">
          {{ $t('common.success') }}
        </ElTag>
        <ElTag v-else type="danger">
          {{ $t('common.failed') }}
        </ElTag>
      </template>
    </TableGrid>
  </Page>
</template>
<style lang="scss" scoped></style>
