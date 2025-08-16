<!--
不兼容也不会兼容一些错误用法
比如: 菜单下放目录 菜单下放菜单
比如: 按钮下放目录 按钮下放菜单 按钮下放按钮
-->
<script setup lang="tsx">
import type { MenuPermissionOption } from './data';

import type {
  VxeGridDefines,
  VxeGridProps,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MenuResp } from '#/api';

import { nextTick, onMounted, ref, shallowRef, watch } from 'vue';

import { cloneDeep, findGroupParentIds } from '@vben/utils';

import { uniq } from 'es-toolkit';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { columns, nodeOptions } from './data';
import {
  menusWithPermissions,
  rowAndChildrenChecked,
  setPermissionsChecked,
  setTableChecked,
} from './helper';

defineOptions({
  name: 'MenuSelectTable',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    checkedKeys?: (number | string)[];
    defaultExpandAll?: boolean;
    menus: MenuResp[];
    onCheckChangeEvent?: (values: (number | string)[]) => void;
    onRefresh?: () => void;
  }>(),
  {
    /**
     * 是否默认展开全部
     */
    defaultExpandAll: true,
    /**
     * 注意这里不是双向绑定 需要调用getCheckedKeys实例方法来获取真正选中的节点
     */
    checkedKeys: () => [],
    onCheckChangeEvent: () => {},
    onRefresh: undefined,
  },
);

/**
 * 是否节点关联
 */
const association = defineModel<boolean>('association', {
  default: true,
});

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // checkbox显示的字段
    labelField: 'label',
    // 是否严格模式 即节点不关联
    checkStrictly: !association.value,
    // 保存状态
    reserve: true,
  },
  size: 'small',
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    enabled: false,
  },
  toolbarConfig: {
    refresh: false,
    custom: false,
  },
  rowConfig: {
    isHover: false,
    isCurrent: false,
    keyField: 'id',
  },
  /**
   * 开启虚拟滚动
   * 数据量小可以选择关闭
   * 如果遇到样式问题(空白、错位 滚动等)可以选择关闭虚拟滚动
   */
  scrollY: {
    enabled: true,
    gt: 0,
  },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'id',
    transform: false,
  },
  // 溢出换行显示
  showOverflow: false,
} as VxeTableGridOptions<MenuPermissionOption>;

/**
 * 用于界面显示选中的数量
 */
const checkedNum = ref(0);
/**
 * 更新选中的数量
 */
function updateCheckedNumber() {
  checkedNum.value = getCheckedKeys().length;
  if (props.onCheckChangeEvent) {
    props.onCheckChangeEvent(getCheckedKeys());
  }
}

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents: {
    // 勾选事件
    checkboxChange: (params: VxeGridDefines.CheckboxChangeEventParams) => {
      // 选中还是取消选中
      const checked = params.checked;
      // 行
      const record = params.row;
      if (association.value) {
        // 节点关联
        // 设置所有子节点选中状态
        rowAndChildrenChecked(record, checked);
      } else {
        // 节点独立
        // 点行会勾选/取消全部权限  点权限不会勾选行
        setPermissionsChecked(record, checked);
      }
      updateCheckedNumber();
    },
    // 全选事件
    checkboxAll: (params: VxeGridDefines.CheckboxAllEventParams) => {
      const records = params.$grid.getData();
      records.forEach((item) => {
        rowAndChildrenChecked(item, params.checked);
      });
      updateCheckedNumber();
    },
  },
});

/**
 * 设置表格选中
 * @param menus menu
 * @param keys 选中的key
 * @param triggerOnchange 节点独立情况 不需要触发onChange(false)
 */
function setCheckedByKeys(
  menus: MenuPermissionOption[],
  keys: (number | string)[],
  triggerOnchange: boolean,
) {
  menus.forEach((item) => {
    // 设置权限columns选中
    if (item.permissions && item.permissions.length > 0) {
      // 遍历 设置勾选
      item.permissions.forEach((permission) => {
        if (keys.includes(permission.id)) {
          permission.checked = true;
          // 手动触发onChange来选中 节点独立情况不需要处理
          triggerOnchange && handlePermissionChange(item);
        }
      });
    }

    // 设置children选中
    if (item.children && item.children.length > 0) {
      setCheckedByKeys(item.children as any, keys, triggerOnchange);
    } else if (keys.includes(item.id)) {
      // 设置行选中
      tableApi.grid.setCheckboxRow(item, true);
    }
  });
}

onMounted(() => {
  /**
   * 加载表格数据 转为指定结构
   */
  watch(
    () => props.menus,
    async (menus) => {
      const clonedMenus = cloneDeep(menus);
      menusWithPermissions(clonedMenus);
      await tableApi.grid.loadData(clonedMenus);

      // 展开全部 默认true
      if (props.defaultExpandAll) {
        await nextTick();
        setExpandOrCollapse(true);
      }
    },
  );

  /**
   * 节点关联变动 更新表格勾选效果
   */
  watch(association, (value) => {
    tableApi.setGridOptions({
      checkboxConfig: {
        checkStrictly: !value,
      },
    });
  });

  /**
   * checkedKeys依赖menus
   * 要注意加载顺序
   * !!!要在外部确保menus先加载!!!
   */
  watch(
    () => props.checkedKeys,
    async (value) => {
      // 获取表格data 如果checkedKeys在menus的watch之前触发 这里会拿到空 导致勾选异常
      const records = tableApi.grid.getData();

      // 清空全部permissions选中
      records.forEach((item) => {
        rowAndChildrenChecked(item, false);
      });
      // 需要清空全部勾选
      await tableApi.grid.clearCheckboxRow();

      const allCheckedKeys = uniq([...value]);

      setCheckedByKeys(records, allCheckedKeys, association.value);
      updateCheckedNumber();
    },
  );
});

// 缓存上次(切换节点关系前)选中的keys
const lastCheckedKeys = shallowRef<(number | string)[]>([]);
/**
 * 节点关联变动 事件
 */
async function handleAssociationChange(value: boolean) {
  // async function handleAssociationChange(e: RadioChangeEvent) {
  lastCheckedKeys.value = getCheckedKeys();
  // 清空全部permissions选中
  const records = tableApi.grid.getData();
  records.forEach((item) => {
    rowAndChildrenChecked(item, false);
  });
  // 需要清空全部勾选
  await tableApi.grid.clearCheckboxRow();
  // 滚动到顶部
  await tableApi.grid.scrollTo(0, 0);

  // 节点切换 不同的选中
  setTableChecked(lastCheckedKeys.value, records, tableApi, value);

  updateCheckedNumber();
}

/**
 * 全部展开/折叠
 * @param expand 是否展开
 */
function setExpandOrCollapse(expand: boolean) {
  tableApi.grid?.setAllTreeExpand(expand);
}

/**
 * 权限列表 checkbox勾选的事件
 * @param row 行
 */
function handlePermissionChange(row: any) {
  // 节点关联
  if (association.value) {
    const checkedPermissions = row.permissions.filter(
      (item: any) => item.checked === true,
    );
    // 有一条选中 则整个行选中
    if (checkedPermissions.length > 0) {
      tableApi.grid.setCheckboxRow(row, true);
    }
    // 无任何选中 则整个行不选中
    if (checkedPermissions.length === 0) {
      tableApi.grid.setCheckboxRow(row, false);
    }
  }
  // 节点独立 不处理
  updateCheckedNumber();
}

/**
 * 获取勾选的key
 * @param records 行记录列表
 * @param addCurrent 是否添加当前行的id
 */
function getKeys(records: MenuPermissionOption[], addCurrent: boolean) {
  const allKeys: (number | string)[] = [];
  records.forEach((item) => {
    // 处理children
    if (item.children && item.children.length > 0) {
      const keys = getKeys(item.children as MenuPermissionOption[], addCurrent);
      allKeys.push(...keys);
    }
    // 当前行的id
    addCurrent && allKeys.push(item.id);
    // 当前行权限id 获取已经选中的
    if (item.permissions && item.permissions.length > 0) {
      const ids = item.permissions
        .filter((m) => m.checked === true)
        .map((m) => m.id);
      allKeys.push(...ids);
    }
  });
  return uniq(allKeys);
}

/**
 * 获取选中的key
 */
function getCheckedKeys() {
  // 节点关联
  if (association.value) {
    const records = tableApi?.grid?.getCheckboxRecords?.(true) ?? [];
    // 子节点
    const nodeKeys = getKeys(records, true);
    // 所有父节点
    const parentIds = findGroupParentIds(props.menus, nodeKeys as number[]);
    // 拼接 去重
    const realKeys = uniq([...parentIds, ...nodeKeys]);
    return realKeys;
  }
  // 节点独立

  // 勾选的行
  const records = tableApi?.grid?.getCheckboxRecords?.(true) ?? [];
  // 全部数据 用于获取permissions
  const allRecords = tableApi?.grid?.getData?.() ?? [];
  // 表格已经选中的行ids
  const checkedIds = records.map((item) => item.id);
  // 所有已经勾选权限的ids
  const permissionIds = getKeys(allRecords, false);
  // 合并 去重
  const allIds = uniq([...checkedIds, ...permissionIds]);
  return allIds;
}

// 加载锁定
const setLoading = (loading: boolean) => {
  tableApi.setLoading(loading);
};
/**
 * 暴露给外部使用 获取已选中的key
 */
defineExpose({
  getCheckedKeys,
  setLoading,
});
</script>

<template>
  <div class="flex h-full flex-col" id="menu-select-table">
    <BasicTable>
      <template #toolbar-actions>
        <RadioGroup
          v-model="association"
          :options="nodeOptions"
          :is-button="true"
          button-style="solid"
          option-type="button"
          @change="handleAssociationChange"
        />
        <div class="mx-2">
          <Alert type="info">
            <div>
              已选中
              <span class="text-primary mx-1 font-semibold">
                {{ checkedNum }}
              </span>
              个节点
            </div>
          </Alert>
        </div>
      </template>
      <template #toolbar-tools>
        <Space>
          <slot name="toolbar-tools-left"></slot>
          <DefaultButton @click="setExpandOrCollapse(false)">
            {{ $t('pages.common.collapse') }}
          </DefaultButton>
          <DefaultButton @click="setExpandOrCollapse(true)">
            {{ $t('pages.common.expand') }}
          </DefaultButton>
          <DefaultButton @click="props.onRefresh" v-if="!!props.onRefresh">
            {{ $t('pages.common.refresh') }}
          </DefaultButton>
          <slot name="toolbar-tools-right"></slot>
        </Space>
      </template>
      <template #permissions="{ row }">
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <Checkbox
            v-for="permission in row.permissions"
            :key="permission.id"
            v-model="permission.checked"
            @change="() => handlePermissionChange(row)"
          >
            {{ permission.label }}
          </Checkbox>
        </div>
      </template>
    </BasicTable>
  </div>
</template>

<style scoped></style>
