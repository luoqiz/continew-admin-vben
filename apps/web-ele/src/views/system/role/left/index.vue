<script setup lang="ts">
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { RoleResp } from '#/api/system/role';

import { Card, CardContent, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, listRole } from '#/api/system/role';

import { emitter } from '../mitt';
import {
  useRoleGridFieldColumns,
  useRoleGridSearchFormSchema,
} from './RoleData';
import RoleEditModal from './RoleEditModal.vue';

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useRoleGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  },
  gridEvents: {
    cellClick: ({ row }) => {
      emitter.emit('rowClick', row.id);
    },
  } as VxeGridListeners<RoleResp>,
  gridOptions: {
    columns: useRoleGridFieldColumns(),
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
          const res = await listRole({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          if (res.length > 0) {
            emitter.emit('rowClick', res[0]!.id);
          }
          return { list: res, total: res.length };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
      isCurrent: true,
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
  } as VxeTableGridOptions<RoleResp>,
});

const [EditorWindow, editorApi] = useVbenModal({
  connectedComponent: RoleEditModal,
  destroyOnClose: true,
});

const handleEdit = (record: RoleResp) => {
  editorApi.setData({ id: record.id });
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({});
  editorApi.open();
};

const handleDelete = async (row: RoleResp) => {
  try {
    await deleteRole(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardContent class="flex-1 overflow-auto">
      <TableGrid :table-title="$t('system.role.listTitle')">
        <template #toolbar-tools>
          <ElSpace>
            <span v-access:code="['system:role:create']">
              <ElButton type="primary" @click="handleAdd">
                {{ $t('pages.common.add') }}
              </ElButton>
            </span>
          </ElSpace>
        </template>
        <template #action="{ row }">
          <ElSpace>
            <span v-access:code="['system:role:update']">
              <ElButton type="primary" @click="handleEdit(row)" text link>
                {{ $t('pages.common.edit') }}
              </ElButton>
            </span>
            <span v-access:code="['system:role:delete']">
              <ElPopconfirm
                :title="$t('ui.actionMessage.deleteConfirm', [row.name])"
                icon-color="red"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <ElButton type="danger" text link>
                    {{ $t('pages.common.delete') }}
                  </ElButton>
                </template>
              </ElPopconfirm>
            </span>
          </ElSpace>
        </template>
      </TableGrid>
    </CardContent>
    <EditorWindow @success="tableGridApi.query()" />
  </Card>
</template>
<style lang="scss" scoped></style>
