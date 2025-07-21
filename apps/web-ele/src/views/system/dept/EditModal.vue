<script setup lang="ts">
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
  const defaultExpandedKeys = deptArray[0]?.id;
  deptFormApi.updateSchema([
    {
      componentProps: {
        props: {
          label: 'name',
          value: 'id',
        },
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        data: deptArray,
        // 默认展开的树节点
        defaultExpandedKeys: [defaultExpandedKeys],
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
        ElMessage.success('修改成功');
      } else {
        await addDept({
          ...deptFormApi.form.values,
        });
        ElMessage.success('新增成功');
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
