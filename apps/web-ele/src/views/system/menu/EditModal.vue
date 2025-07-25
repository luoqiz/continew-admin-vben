<script setup lang="ts">
import type { MenuResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, filter, getPopupContainer } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addMenu, getMenu, listMenu, updateMenu } from '#/api';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useMenuFormSchema } from './data';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [MenuForm, menuFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useMenuFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

// 加载所有菜单
async function setupMenuSelect() {
  // menu
  const menuArray = await listMenu();
  // support i18n
  menuArray.forEach((item) => {
    item.title = $t(item.title);
  });
  /**
   * 这里需要过滤掉按钮类型
   * 不允许在按钮下添加数据
   */
  const filteredList = filter(menuArray, (item) => item.type !== 3);
  const fullMenuTree = [
    {
      id: 0,
      title: $t('system.menu.root'),
      children: filteredList,
    },
  ];

  addFullName(fullMenuTree, 'title', ' / ');
  menuFormApi.updateSchema([
    {
      componentProps: {
        props: {
          label: 'title',
          value: 'id',
        },
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        data: fullMenuTree,
        // 默认展开的树节点
        defaultExpandedKeys: [0],
      },
      fieldName: 'parentId',
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(menuFormApi),
    currentGetter: defaultFormValueGetter(menuFormApi),
  },
);

async function handleClosed() {
  await menuFormApi.resetForm();
  resetInitialized();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await menuFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateMenu(menuFormApi.form.values, dataId.value);
        ElMessage.success('修改成功');
      } else {
        await addMenu({
          ...menuFormApi.form.values,
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
        const data = drawerApi.getData<MenuResp>();
        dataId.value = data.id;
        // 加载菜单树选择
        await setupMenuSelect();
        if (data && data.id) {
          dataId.value = data.id;
          const res = await getMenu(data.id);
          menuFormApi.form.setValues(res);
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
      <MenuForm />
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
