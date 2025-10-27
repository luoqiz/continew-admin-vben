<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { NoticeQuery, NoticeResp } from '#/api/system/notice';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteNotice, exportNotice, listNotice } from '#/api/system/notice';
import { useDict } from '#/hooks';
import { useDownload } from '#/hooks/app/useDownload';

import {
  useNoticeGridFieldColumns,
  useNoticeGridSearchFormSchema,
} from './NoticeData';

const router = useRouter();
const {
  notice_type,
  notice_scope_enum,
  notice_method_enum,
  notice_status_enum,
} = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum',
  'notice_status_enum',
);

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useNoticeGridSearchFormSchema(notice_type),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useNoticeGridFieldColumns(
      notice_type,
      notice_scope_enum,
      notice_method_enum,
      notice_status_enum,
    ),
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
          const res = await listNotice({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return res;
        },
        querySuccess: ({ $grid }) => {
          $grid?.setAllTreeExpand(true);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
      isCurrent: true,
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
  } as VxeTableGridOptions<NoticeResp>,
});

// 预览
const handlePreview = (record: NoticeResp) => {
  router.push({ path: '/system/notice/view', query: { id: record.id } });
};

// 编辑
const handleEdit = (record: NoticeResp) => {
  router.push({
    path: '/system/notice/add',
    query: { id: record.id },
  });
};

// 新增
const handleAdd = () => {
  router.push({ name: 'SystemNoticeAdd' });
};

const handleDelete = async (row: NoticeResp) => {
  try {
    await deleteNotice(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};

const handleExport = () => {
  useDownload(async () =>
    exportNotice(await tableGridApi.formApi.getValues<NoticeQuery>()),
  );
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('system.notice.listTitle')">
      <template #toolbar-tools>
        <ElSpace>
          <span v-access:code="['system:notice:create']">
            <ElButton type="primary" @click="handleAdd">
              {{ $t('pages.common.add') }}
            </ElButton>
          </span>
          <span v-access:code="['system:notice:export']">
            <ElButton type="danger" @click="handleExport">
              {{ $t('pages.common.export') }}
            </ElButton>
          </span>
        </ElSpace>
      </template>
      <template #action="{ row }">
        <ElSpace>
          <span v-access:code="['system:notice:view']">
            <ElButton type="primary" text link @click="handlePreview(row)">
              {{ $t('pages.common.preview') }}
            </ElButton>
          </span>
          <span v-access:code="['system:notice:update']">
            <ElButton type="primary" text link @click="handleEdit(row)">
              {{ $t('pages.common.edit') }}
            </ElButton>
          </span>
          <span v-access:code="['system:notice:delete']"></span>
          <ElPopconfirm
            :title="$t('ui.actionMessage.deleteConfirm', [row.title])"
            icon-color="red"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <ElButton type="danger" text link>
                {{ $t('pages.common.delete') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </TableGrid>
  </Page>
</template>
<style lang="scss" scoped></style>
