<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MessageResp } from '#/api/system/user-message';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElLink, ElMessage, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMessage,
  listMessage,
  readAllMessage,
  readMessage,
} from '#/api/system/user-message';
import { DictTag } from '#/components/dict';
import { useDict } from '#/hooks';
import mittBus from '#/utils/mitt';

import MyMessageDetailModal from './MyMessageDetailModal.vue';

defineOptions({ name: 'UserMyMessage' });

const { message_type_enum } = useDict('message_type_enum');

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
      component: 'Select',
      componentProps: {
        options: message_type_enum,
      },
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
    { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'title',
      title: $t('system.msg.title'),
      align: 'center',
      fixed: 'left',
      slots: { default: 'title' },
    },
    {
      field: 'type',
      title: $t('system.msg.type'),
      slots: { default: 'type' },
      align: 'center',
    },
    {
      field: 'isRead',
      title: $t('system.msg.isRead'),
      slots: { default: 'isRead' },
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
          const res = await listMessage({
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
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
      search: true,
      zoom: true,
      zoomOptions: {},
    },
  } as VxeTableGridOptions<MessageResp>,
});

// const router = useRouter();
// 查看
const onView = (record: MessageResp) => {
  // router.push({ path: '/user/notice', query: { id: record.id } });
  formModalApi.setData(record).open();
};

// 获取选中的记录
const getCheckBoxRecordIds = () => {
  const checkBoxRecords = tableGridApi.grid.getCheckboxRecords(false);
  if (checkBoxRecords.length > 0) {
    return checkBoxRecords.map((item) => item.id);
  }
  return [];
};

// 删除
const onDelete = () => {
  const selectedKeys = getCheckBoxRecordIds();
  if (selectedKeys.length === 0) {
    return ElMessage.warning('请选择数据');
  }
  deleteMessage(selectedKeys);
  tableGridApi.reload();
};

// 标记为已读
const onRead = async () => {
  const selectedKeys = getCheckBoxRecordIds();
  if (selectedKeys.length === 0) {
    return ElMessage.warning('请选择数据');
  }
  await readMessage(selectedKeys);
  ElMessage.success('操作成功');
  tableGridApi.reload();
};

// 全部已读事件
const onReadAll = async () => {
  dialogVisible.value = true;
};

// 全部已读
const readAll = async () => {
  await readAllMessage();
  dialogVisible.value = false;
  ElMessage.success('操作成功');
  tableGridApi.reload();
};

// 确认全部已读弹窗
const dialogVisible = ref<boolean>(false);

const handleClose = () => {
  dialogVisible.value = false;
  onDetailModalClose();
};

const [DetailModal, formModalApi] = useVbenModal({
  connectedComponent: MyMessageDetailModal,
  destroyOnClose: true,
});

// 表格更新回调
const onDetailModalClose = () => {
  mittBus.emit('count-refresh');
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
        <ElLink type="primary" @click="onView(row)">{{ row.title }}</ElLink>
      </template>

      <template #type="{ row }">
        <DictTag :value="row.type" :dict-list="message_type_enum as []" />
      </template>

      <template #isRead="{ row }">
        <ElTag :color="row.isRead ? '' : 'arcoblue'">
          {{ row.isRead ? '已读' : '未读' }}
        </ElTag>
      </template>
    </TableGrid>
    <DetailModal @close="onDetailModalClose" />
    <el-dialog
      v-model="dialogVisible"
      :title="$t('common.tips')"
      width="500"
      :before-close="handleClose"
    >
      <span>{{ $t('system.msg.tips.markAllReadTips') }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="readAll">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </Page>
</template>

<style scoped lang="scss"></style>
