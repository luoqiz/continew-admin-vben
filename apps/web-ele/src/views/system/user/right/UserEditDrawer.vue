<script setup lang="ts">
import type { TreeNodeData } from 'element-plus';

import type { UserResp } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { encryptByRsa, getPopupContainer } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { listDeptDictTree } from '#/api';
import { addUser, getUser, updateUser } from '#/api/system/user';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useUserEditFormSchema } from './UserData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [EditorForm, editorFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useUserEditFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

// 加载部门树
async function setupDeptSelect() {
  editorFormApi.updateSchema([
    {
      label: $t('system.user.deptId'),
      fieldName: 'deptId',
      component: 'ApiTreeSelect',
      // 对应组件的参数
      componentProps: {
        // 接口
        api: listDeptDictTree,
        childrenField: 'children',
        // 接口转options格式
        props: {
          label: 'title',
          value: 'key',
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
        nodeKey: 'key',
        onNodeClick: (data: TreeNodeData) => {
          editorFormApi.setFieldValue('deptId', data.key);
        },
        rules: 'selectRequired',
      },
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(editorFormApi),
    currentGetter: defaultFormValueGetter(editorFormApi),
  },
);

async function handleClosed() {
  await editorFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await editorFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateUser(editorFormApi.form.values, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        const password = encryptByRsa(editorFormApi.form.values.password) || '';
        await addUser({
          ...editorFormApi.form.values,
          password,
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
        const data = drawerApi.getData<UserResp>();
        dataId.value = data.id;

        if (data && data.id) {
          dataId.value = data.id;
          const res = await getUser(data.id);
          await editorFormApi.form.setValues(res);
        }
      } finally {
        await setupDeptSelect();
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
      <EditorForm />
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
