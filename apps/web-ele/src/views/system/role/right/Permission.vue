<script setup lang="ts">
import type { RoleDetailResp } from '#/api/system/role';
import type { MenuSelectTable } from '#/components/tree';

import { nextTick, ref } from 'vue';

import { Card, CardContent, CardHeader, CardTitle } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { eachTree } from '@vben/utils';

import { ElButton, ElMessage, ElTabPane, ElTabs } from 'element-plus';

import {
  getRole,
  listRolePermissionTree,
  updateRolePermission,
} from '#/api/system/role';

import { emitter } from '../mitt';
import RoleUser from './RoleUser.vue';
// 角色id
const dataId = ref<string>();
// 角色详情
const roleDetail = ref<RoleDetailResp>();
// 菜单树
const menuTree = ref<any>([]);
// 菜单选中的key
const selectKeys = ref<any>([]);
// 菜单选择组件实例引用
const menuSelectRef = ref<InstanceType<typeof MenuSelectTable>>();
// 监听左侧角色管理行点击时，右侧的数据处理
emitter.on('rowClick', async (value) => {
  menuSelectRef.value?.setLoading(true);
  try {
    dataId.value = value;
    // 获取菜单列表
    const menus = await listRolePermissionTree();
    // i18n处理
    eachTree(menus, (node) => {
      node.label = ((node.title ?? node.name ?? '') as string).includes('.')
        ? $t(node.title ?? node.name ?? '')
        : (node.title ?? node.name ?? '');
    });
    menuTree.value = menus;
    await nextTick();
    // 查询角色详情
    roleDetail.value = await getRole(dataId.value);
    selectKeys.value = roleDetail.value.menuIds;
  } finally {
    menuSelectRef.value?.setLoading(false);
  }
});

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  roleDetail.value!.menuCheckStrictly = value;
}

// 保存权限
const handleSave = async () => {
  // 这个用于提交
  const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
  await updateRolePermission(dataId.value!, {
    menuIds,
    menuCheckStrictly: roleDetail.value!.menuCheckStrictly,
  });
  ElMessage.success('保存成功');
};
// 菜单id列表
const menuIds = ref<(number | string)[]>([]);
// 处理菜单选择变化
const handleCheckEvent = (values: (number | string)[]) => {
  menuIds.value = values;
};
// 刷新当前角色权限
const handleRefresh = () => {
  emitter.emit('rowClick', roleDetail.value!.id);
};
</script>
<template>
  <Card class="flex h-full w-full flex-col">
    <CardHeader>
      <CardTitle>{{ roleDetail?.name }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-1 overflow-auto">
      <ElTabs class="h-full" :stretch="true">
        <ElTabPane label="功能权限" class="h-full">
          <div class="h-full w-full">
            <!-- association为readonly 不能通过v-model绑定 -->
            <MenuSelectTable
              ref="menuSelectRef"
              :checked-keys="selectKeys"
              :association="roleDetail?.menuCheckStrictly"
              :menus="menuTree"
              @check-change-event="handleCheckEvent"
              @update:association="handleMenuCheckStrictlyChange"
              @refresh="handleRefresh"
            >
              <template #toolbar-tools-left>
                <ElButton type="primary" @click="handleSave">
                  保存权限
                </ElButton>
              </template>
            </MenuSelectTable>
          </div>
        </ElTabPane>
        <ElTabPane label="角色用户" class="h-full">
          <RoleUser :role-id="dataId!" :role-name="roleDetail?.name!" />
        </ElTabPane>
      </ElTabs>
    </CardContent>
  </Card>
</template>
<style lang="scss" scoped>
.elCard {
  height: 100%;
}

.elCard :deep(.el-tabs__content) {
  height: 100%;
  background-color: red;
}
</style>
