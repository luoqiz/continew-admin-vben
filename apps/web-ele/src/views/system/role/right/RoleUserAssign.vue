<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridDefines, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserResp } from '#/api/system/user';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElAvatar, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { assignToUsers } from '#/api';
import { listUser } from '#/api/system/user';

interface Props {
  roleId?: number | string;
  roleName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  roleId: '',
  roleName: '',
});

const emits = defineEmits(['success']);

const selectRows = ref<Array<number | string>>([]);

// Table 字段配置
function useUserGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      slots: { default: 'nickname' },
    },
    {
      field: 'username',
      title: $t('system.user.username'),
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
  ];
}

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

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
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
          const res = await listUser({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          for (let index = 0; index < res.list.length; index++) {
            const user = res.list[index];
            // 此处disabled表示该用户已分配该角色，复选框为选中状态
            user!.disabled = user!.roleIds?.includes(props.roleId);
          }
          return res;
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
      checkField: 'disabled',
      checkMethod: ({ row }) => {
        return !row.roleIds?.includes(props.roleId);
      },
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
  gridEvents: {
    // 勾选事件
    checkboxChange: (params: VxeGridDefines.CheckboxChangeEventParams) => {
      const { checked, row } = params;
      if (checked) {
        selectRows.value.push(row.id);
      } else {
        selectRows.value = selectRows.value.filter((id) => id !== row.id);
      }
    },
    checkboxAll: (params: VxeGridDefines.CheckboxAllEventParams) => {
      // 无论check 的值，records 是当前页的所有选中记录
      const { records } = params;
      const ids = records.map((item) => item.id);
      selectRows.value = [...ids];
    },
  },
});

const [EditWindow, editWindowApi] = useVbenModal({
  async onConfirm() {
    editWindowApi.lock();
    try {
      // 过滤掉当前页已分配该角色的用户
      selectRows.value = selectRows.value.filter(
        (id) =>
          !tableGridApi.grid
            .getData()
            .some(
              (row) => row.roleIds?.includes(props.roleId) && row.id === id,
            ),
      );
      const isInvalid = selectRows.value.length === 0;
      if (isInvalid) {
        ElMessage.warning('请选择用户');
        return false;
      }
      await assignToUsers(props.roleId as string, selectRows.value.map(String));
      emits('success');
      editWindowApi.close();
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      editWindowApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      await tableGridApi.query();
    }
  },
});

const getWindowTitle = computed(() => {
  return `${$t('system.role.assignRole', [props?.roleName])} `;
});

watch(
  () => props.roleId,
  async () => {
    await tableGridApi.query();
  },
  { immediate: true },
);
</script>
<template>
  <EditWindow :title="getWindowTitle" class="h-[80%] w-[70%]">
    <TableGrid :table-title="$t('system.user.listTitle')">
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
        <ElTag v-if="row.gender === 1" type="success">
          {{ $t('common.gender.male') }}
        </ElTag>
        <ElTag v-else-if="row.gender === 2">
          {{ $t('common.gender.female') }}
        </ElTag>
        <ElTag v-else> {{ $t('common.gender.confidential') }} </ElTag>
      </template>
      <template #roleIds="{ row }">
        <ElTag type="success" v-for="item in row.roleNames" :key="item">
          {{ item }}
        </ElTag>
      </template>
    </TableGrid>
  </EditWindow>
</template>
<style lang="scss" scoped></style>
