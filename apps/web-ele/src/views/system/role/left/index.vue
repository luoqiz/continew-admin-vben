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
        querySuccess: ({ $grid }) => {
          $grid.setAllTreeExpand(true);
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
            <ElButton
              type="primary"
              v-access:code="['system:role:create']"
              @click="handleAdd"
            >
              {{ $t('pages.common.add') }}
            </ElButton>
          </ElSpace>
        </template>
        <!-- <template #status="{ row }">
        <ElTag v-if="row.status === 1" type="success">
          {{ $t('common.enabled') }}
        </ElTag>
        <ElTag v-else type="danger">
          {{ $t('common.disabled') }}
        </ElTag>
      </template> -->
        <template #action="{ row }">
          <ElSpace>
            <ElButton
              size="small"
              type="primary"
              @click="handleEdit(row)"
              v-access:code="['system:role:update']"
            >
              {{ $t('pages.common.edit') }}
            </ElButton>
            <ElPopconfirm
              :title="$t('ui.actionMessage.deleteConfirm', [row.name])"
              icon-color="red"
              @confirm="handleDelete(row)"
              v-access:code="['system:role:delete']"
            >
              <template #reference>
                <ElButton size="small" type="danger">
                  {{ $t('pages.common.delete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </ElSpace>
        </template>
      </TableGrid>
    </CardContent>
    <EditorWindow @success="tableGridApi.query()" />
  </Card>
</template>
<style lang="scss" scoped></style>
