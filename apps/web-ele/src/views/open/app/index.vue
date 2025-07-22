<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { OpenAppApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteApp,
  exportApp,
  getAppList,
  getSecretKey,
  resetSecretKey,
} from '#/api';

import { useColumns, useGridFormSchema } from './data';
import AppDetail from './modules/detail.vue';
import AppForm from './modules/form.vue';

defineOptions({ name: 'OpenApp' });
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: AppForm,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: AppDetail,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getAppList({
            current: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<OpenAppApi.AppResp>,
});

function onActionClick(e: OnActionClickParams<OpenAppApi.AppResp>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'detail': {
      onDetail(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'resetSecret': {
      onResetSecret(e.row);
      break;
    }
  }
}

/**
 * 将Element Plus的ElMessageBox.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
}

function onEdit(row: OpenAppApi.AppResp) {
  formDrawerApi.setData(row).open();
}

function onDetail(row: OpenAppApi.AppResp) {
  detailDrawerApi.setData(row).open();
}

function onDelete(row: OpenAppApi.AppResp) {
  const loading = ElMessage.loading(`正在删除应用 "${row.name}"...`);
  deleteApp(row.id)
    .then(() => {
      loading.close();
      ElMessage.success(`删除应用 "${row.name}" 成功`);
      onRefresh();
    })
    .catch(() => {
      loading.close();
    });
}

async function onShowSecret(row: OpenAppApi.AppResp) {
  try {
    const { secretKey } = await getSecretKey(row.id);
    row.secretKey = secretKey;
  } catch {
    ElMessage.error('获取密钥失败');
  }
}

function onHideSecret(row: OpenAppApi.AppResp) {
  row.secretKey = undefined;
}

async function onResetSecret(row: OpenAppApi.AppResp) {
  try {
    await confirm(
      `确定要重置应用 "${row.name}" 的密钥吗？重置后原密钥将失效。`,
      '确认重置密钥',
    );
    await resetSecretKey(row.id);
    ElMessage.success('密钥重置成功');
    gridApi.query();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('密钥重置失败');
    }
  }
}

/**
 * 复制密钥到剪贴板
 * @param secretKey 要复制的密钥
 */
async function onCopySecret(secretKey: string) {
  try {
    await navigator.clipboard.writeText(secretKey);
    ElMessage.success('密钥已复制到剪贴板');
  } catch {
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = secretKey;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.append(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      ElMessage.success('密钥已复制到剪贴板');
    } catch {
      ElMessage.error('复制失败，请手动复制');
    } finally {
      textArea.remove();
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

// 导出
async function onExport() {
  try {
    const blob = await exportApp(gridApi.formApi.form.values);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '应用列表.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid table-title="应用管理">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增应用
        </ElButton>
        <ElButton @click="onExport"> 导出 </ElButton>
      </template>
      <template #secretKey="{ row }">
        <div class="flex items-center justify-center gap-2">
          <span v-if="row.secretKey" class="font-mono">{{
            row.secretKey
          }}</span>
          <span v-else class="text-gray-400">***********</span>

          <div class="flex gap-1">
            <!-- 复制按钮 -->
            <ElButton
              v-if="row.secretKey"
              link
              type="primary"
              size="small"
              @click="onCopySecret(row.secretKey)"
            >
              复制
            </ElButton>

            <!-- 显示/隐藏按钮 -->
            <ElButton
              v-if="row.secretKey"
              link
              type="warning"
              size="small"
              @click="onHideSecret(row)"
            >
              隐藏
            </ElButton>
            <ElButton
              v-else
              link
              type="primary"
              size="small"
              @click="onShowSecret(row)"
            >
              显示
            </ElButton>
          </div>
        </div>
      </template>
    </Grid>
  </Page>
</template>
