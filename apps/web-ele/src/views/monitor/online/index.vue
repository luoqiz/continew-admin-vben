<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { OnlineUserResp } from '#/api/monitor/online';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { kickout, listOnlineUser } from '#/api/monitor/online';
import { getSessionId } from '#/features/auth-session/session-id';
import { dateRangeShortcuts } from '#/utils/dateTools';

function usePackageGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'nickname',
      label: $t('monitor.onlineUser.nickname'),
      component: 'Input',
    },
    {
      fieldName: 'loginTime',
      label: $t('monitor.onlineUser.loginTime'),
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
      field: 'nickname',
      title: $t('monitor.onlineUser.nickname'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'ip',
      title: $t('monitor.onlineUser.ip'),
      align: 'center',
    },
    {
      field: 'address',
      title: $t('monitor.onlineUser.address'),
      align: 'center',
    },
    {
      field: 'clientType',
      title: $t('monitor.onlineUser.clientType'),
      align: 'center',
    },
    {
      field: 'browser',
      title: $t('monitor.onlineUser.browser'),
      align: 'center',
    },
    {
      field: 'os',
      title: $t('monitor.onlineUser.os'),
      align: 'center',
    },
    {
      field: 'loginTime',
      title: $t('monitor.onlineUser.loginTime'),
      align: 'center',
    },
    {
      field: 'lastRefreshTime',
      title: $t('monitor.onlineUser.lastRefreshTime'),
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 120,
    },
  ];
}

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
          const res = await listOnlineUser({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return res;
        },
      },
    },
    rowConfig: {
      keyField: 'sessionId',
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
  } as VxeTableGridOptions<OnlineUserResp>,
});

const accessStore = useAccessStore();

// 服务端同样禁止强退自己；这里提前禁用按钮，避免用户点击后才收到错误提示。
const isCurrentSession = (sessionId: string) => {
  const currentSessionId = getSessionId(accessStore.accessToken);
  return !!currentSessionId && currentSessionId === sessionId;
};

// 强退
const handleKickout = (sessionId: string) => {
  kickout(sessionId).then(() => {
    tableGridApi.reload();
    ElMessage.success('强退成功');
  });
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid>
      <template #action="{ row }">
        <ElSpace v-access:code="['monitor:online:kickout']">
          <ElPopconfirm
            :title="$t('monitor.onlineUser.kickout', [row.nickname])"
            icon-color="red"
            :disabled="isCurrentSession(row.sessionId)"
            @confirm="handleKickout(row.sessionId)"
          >
            <template #reference>
              <ElButton
                type="danger"
                text
                link
                :disabled="isCurrentSession(row.sessionId)"
              >
                {{ $t('monitor.onlineUser.kickout') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </TableGrid>
  </Page>
</template>
<style lang="scss" scoped></style>
