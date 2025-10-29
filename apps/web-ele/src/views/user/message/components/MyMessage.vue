<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { NoticeResp } from '#/api/system';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElLink, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listUserNotice } from '#/api/system/user-message';
import { DictTag } from '#/components/dict';
import { useDict } from '#/hooks';

defineOptions({ name: 'UserMyNotice' });

const { notice_type } = useDict('notice_type');

function useTenantGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'title',
      label: $t('system.msg.search.title'),
      component: 'Input',
    },
    {
      fieldName: 'type',
      label: $t('system.msg.search.type'),
      component: 'Input',
    },
    {
      fieldName: 'isRead',
      label: $t('system.msg.search.isRead'),
      component: 'Select',
      componentProps: {
        options: [
          { label: '已读', value: true },
          { label: '未读', value: false },
        ],
      },
    },
  ];
}

function useTenantGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'title',
      title: $t('system.msg.title'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'type',
      title: $t('system.msg.type'),
      align: 'center',
    },
    {
      field: 'isRead',
      title: $t('system.msg.isRead'),
      align: 'center',
    },
    {
      field: 'createTime',
      title: $t('system.msg.createTime'),
      align: 'center',
      width: 180,
    },
  ];
}

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useTenantGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useTenantGridFieldColumns(),
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
          const res = await listUserNotice({
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

const router = useRouter();
// 查看
const onView = (record: NoticeResp) => {
  router.push({ path: '/user/notice', query: { id: record.id } });
};

// 删除
const onDelete = () => {
  // if (!selectedKeys.value.length) {
  //   return Message.warning('请选择数据')
  // }
  // return handleDelete(() => deleteMessage(selectedKeys.value), { showModal: true, content: `是否确定删除所选的${selectedKeys.value.length}条消息？`, multiple: true })
  tableGridApi.reload();
};

// 标记为已读
const onRead = async () => {
  // if (!selectedKeys.value.length) {
  //   return Message.warning('请选择数据')
  // }
  // await readMessage(selectedKeys.value)
  // Message.success('操作成功')
  // search()
  tableGridApi.reload();
};

// 全部已读
const onReadAll = async () => {
  // Modal.warning({
  //   title: '全部已读',
  //   content: '确定要标记全部消息为已读吗？',
  //   hideCancel: false,
  //   maskClosable: false,
  //   onOk: async () => {
  //     await readAllMessage()
  //     Message.success('操作成功')
  //     search()
  //   },
  // })
  tableGridApi.reload();
};
</script>

<template>
  <Page auto-content-height>
    <TableGrid>
      <template #toolbar-tools>
        <ElSpace>
          <span>
            <ElButton type="danger" @click="onDelete">
              {{ $t('pages.common.delete') }}
            </ElButton>
          </span>
          <span>
            <ElButton type="primary" @click="onRead">
              {{ $t('system.msg.markRead') }}
            </ElButton>
          </span>
          <span>
            <ElButton type="primary" @click="onReadAll">
              {{ $t('system.msg.markAllRead') }}
            </ElButton>
          </span>
        </ElSpace>
      </template>

      <template #title="{ row }">
        <ElLink @click="onView(row)" text link>
          {{ row.title }}
        </ElLink>
      </template>

      <template #type="{ row }">
        <DictTag :value="row.type" :dict-list="notice_type as []" />
      </template>

      <template #isRead="{ row }">
        <ElTag :color="row.isRead ? '' : 'arcoblue'">
          {{ row.isRead ? '已读' : '未读' }}
        </ElTag>
      </template>
    </TableGrid>
  </Page>
</template>

<style scoped lang="scss">
.link-text {
  margin-bottom: 0;
  font-weight: 500;

  :deep(.arco-typography) {
    margin-bottom: 0;
  }
}

:deep(.message-detail-modal) {
  .arco-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--color-border-2);

    .arco-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }

  .arco-modal-body {
    padding: 24px;
  }
}

.message-detail-content {
  .message-content {
    min-height: 80px;
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-1);
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .message-footer {
    .time-info {
      display: flex;
      gap: 6px;
      align-items: center;

      .time-icon {
        font-size: 14px;
        color: var(--color-text-3);
      }

      .time-label {
        font-size: 13px;
        color: var(--color-text-3);
      }

      .time-value {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-2);
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  background-color: var(--color-bg-1);
  border-top: 1px solid var(--color-border-2);

  .arco-btn {
    display: flex;
    gap: 4px;
    align-items: center;

    .btn-icon {
      font-size: 14px;
    }
  }
}
</style>
