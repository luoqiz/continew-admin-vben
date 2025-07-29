<script setup lang="ts">
import type { CascaderNode, TreeNodeData } from 'element-plus';

import type { DeptResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getPopupContainer } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addDept, getDept, listDept, updateDept } from '#/api';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useDeptFormSchema } from './data';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [DeptForm, deptFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useDeptFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

// 加载所有菜单
async function setupDeptSelect() {
  const deptArray = await listDept({});
  // const defaultExpandedKeys = [deptArray[0]?.id];
  deptFormApi.updateSchema([
    {
      componentProps: {
        props: {
          label: 'name',
          value: 'id',
        },
        // 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
        expandOnClickNode: false,
        // 是否默认展开所有节点
        defaultExpandAll: true,
        // 是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
        checkOnClickNode: true,
        // checkOnClickLeaf: false,
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        data: deptArray,
        nodeKey: 'id',
        onNodeClick: (
          data: TreeNodeData,
          node: CascaderNode,
          // treeNode: TreeNode,
        ) => {
          // treeNode.expanded = false;
          node.checked = !node.checked;
          deptFormApi.form.setFieldValue('parentId', data.id);
        },
      },
      fieldName: 'parentId',
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(deptFormApi),
    currentGetter: defaultFormValueGetter(deptFormApi),
  },
);

async function handleClosed() {
  await deptFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await deptFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateDept(deptFormApi.form.values, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addDept({
          ...deptFormApi.form.values,
        });
        ElMessage.success($t('pages.common.addSuccess'));
      }
      resetInitialized();
      emits('success');
      drawerApi.close();
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        drawerApi.lock(true);
        const data = drawerApi.getData<DeptResp>();
        dataId.value = data.id;
        // 加载部门列表
        await setupDeptSelect();
        if (data && data.id) {
          dataId.value = data.id;
          const res = await getDept(data.id);
          deptFormApi.form.setValues(res);
        }
      } finally {
        await markInitialized();
        drawerApi.unlock();
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <DeptForm />
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
