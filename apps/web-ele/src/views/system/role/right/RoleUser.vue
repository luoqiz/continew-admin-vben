<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserResp } from '#/api/system/user';

import { watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElAvatar, ElButton, ElMessage, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listRoleUser, unassignFromUsers } from '#/api';

import RoleUserAssign from './RoleUserAssign.vue';

interface Props {
  roleId: number | string;
  roleName: string;
}
const props = withDefaults(defineProps<Props>(), {
  roleId: '',
  roleName: '',
});

// Table 字段配置
function useUserGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      slots: { default: 'nickname' },
      align: 'center',
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      align: 'center',
    },
    {
      field: 'status',
      title: $t('system.user.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    {
      field: 'gender',
      title: $t('system.user.gender'),
      slots: { default: 'gender' },
      align: 'center',
    },
    {
      field: 'deptName',
      title: $t('system.user.deptId'),
      align: 'center',
    },

    {
      field: 'description',
      title: $t('system.user.description'),
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 150,
    },
  ];
}
// 设置表格搜索
function useUserGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'description',
      component: 'Input',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.user.searchKey'),
      },
    },
  ];
}

// 设置表格
const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridSearchFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useUserGridFieldColumns(),
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
          if (props.roleId === '') {
            return {
              list: [],
              total: 0,
            };
          }
          const res = await listRoleUser(props.roleId as string, {
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
  } as VxeTableGridOptions<UserResp>,
});

const handleCancelAssignment = async (row: UserResp) => {
  try {
    await unassignFromUsers([row.id]);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};

const [RoleAssignModel, roleUserAssignApi] = useVbenModal({
  connectedComponent: RoleUserAssign,
  destroyOnClose: true,
});

const handleAssign = () => {
  roleUserAssignApi.open();
};

watch(
  () => props.roleId,
  async () => {
    await tableGridApi.query();
  },
  { immediate: true },
);
</script>
<template>
  <TableGrid :table-title="$t('system.user.listTitle')">
    <template #toolbar-tools>
      <ElSpace>
        <span v-access:code="['system:user:create']">
          <ElButton type="primary" @click="handleAssign">
            {{ $t('system.role.assignRole') }}
          </ElButton>
        </span>
      </ElSpace>
    </template>
    <template #nickname="{ row }">
      <div class="flex flex-row items-center gap-2">
        <ElAvatar :size="32" :src="row.avatar" />
        <span class="flex-1">{{ row.nickname }}</span>
      </div>
    </template>
    <template #status="{ row }">
      <ElTag v-if="row.status === 1" type="success">
        {{ $t('common.enabled') }}
      </ElTag>
      <ElTag v-else type="danger">
        {{ $t('common.disabled') }}
      </ElTag>
    </template>
    <template #gender="{ row }">
      <ElTag v-if="row.gender === 1" type="success"> 男 </ElTag>
      <ElTag v-else-if="row.gender === 2"> 女 </ElTag>
      <ElTag v-else> 未知 </ElTag>
    </template>
    <template #roleIds="{ row }">
      <ElTag type="success" v-for="item in row.roleNames" :key="item">
        {{ item }}
      </ElTag>
    </template>
    <template #action="{ row }">
      <ElSpace class="h-full" alignment="flex-end">
        <span v-access:code="['system:role:unassign']">
          <ElPopconfirm
            :title="
              $t('system.role.cancelRoleConfirm', [
                row.nickname,
                props.roleName,
              ])
            "
            icon-color="red"
            @confirm="handleCancelAssignment(row)"
            :disabled="row.isSystem"
          >
            <template #reference>
              <ElButton type="danger" text link :disabled="row.isSystem">
                {{ $t('system.role.cancelAssignment') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </span>
      </ElSpace>
    </template>
  </TableGrid>
  <RoleAssignModel
    :role-id="props.roleId"
    :role-name="props.roleName"
    @close="tableGridApi.query()"
    @success="tableGridApi.query()"
  />
</template>
<style lang="scss" scoped></style>
