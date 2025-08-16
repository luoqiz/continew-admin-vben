<script setup lang="ts">
import type { MenuResp } from '#/api';
import type { TenantPackageResp } from '#/api/tenant/package';
import type { MenuSelectTable } from '#/components/tree';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { eachTree } from '@vben/utils';

import { ElMessage } from 'element-plus';
import { cloneDeep } from 'es-toolkit';

import { useVbenForm } from '#/adapter/form';
import {
  addTenantPackage,
  getTenantPackage,
  listTenantPackageMenu,
  updateTenantPackage,
} from '#/api/tenant/package';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { usePackageEditFormSchema } from './PackageData';

const emits = defineEmits(['success']);
const dataId = ref('');
const isUpdate = computed(() => !!dataId.value);

const menuTree = ref<MenuResp[]>([]);
const menuSelectRef = ref<InstanceType<typeof MenuSelectTable>>();

async function setupMenuTree(menuIds: Array<any>) {
  // 0为新增使用  获取除了`租户管理`的所有菜单
  const menus = await listTenantPackageMenu();
  // i18n处理
  eachTree(menus, (node) => {
    node.label = (node.title as string).includes('.')
      ? $t(node.title)
      : node.title;
  });

  // 设置菜单信息
  menuTree.value = menus;
  // keys依赖于menu 需要先加载menu
  await nextTick();
  await editorFormApi.setFieldValue('menuIds', menuIds);
}

const [EditorForm, editorFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  resetButtonOptions: {
    show: false,
  },
  schema: usePackageEditFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

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
      // 这个用于提交
      const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
      // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
      const data = cloneDeep(await editorFormApi.getValues());
      data.menuIds = menuIds;
      if (isUpdate.value) {
        await updateTenantPackage(data, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addTenantPackage({
          ...data,
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
        const data = drawerApi.getData<TenantPackageResp>();

        dataId.value = data.id;

        let menuIds: Array<any> = [];
        if (data && data.id) {
          dataId.value = data.id;
          const res = await getTenantPackage(data.id);
          editorFormApi.setValues(res);
          menuIds = res.menuIds;
        } else {
          editorFormApi.setFieldValue('menuCheckStrictly', true);
        }
        // init菜单 注意顺序要放在赋值record之后 内部watch会依赖record
        await setupMenuTree(menuIds);
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

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  editorFormApi.setFieldValue('menuCheckStrictly', value);
}
</script>

<template>
  <div>
    <Drawer :title="getDrawerTitle" class="w-[70%]">
      <div class="mx-auto flex h-full w-full flex-col">
        <EditorForm>
          <template #menuIds="slotProps">
            <div class="h-[600px] w-full">
              <!-- association为readonly 不能通过v-model绑定 -->
              <MenuSelectTable
                ref="menuSelectRef"
                :checked-keys="slotProps.value"
                :association="editorFormApi.form.values.menuCheckStrictly"
                :menus="menuTree"
                @update:association="handleMenuCheckStrictlyChange"
              />
            </div>
          </template>
        </EditorForm>
      </div>
    </Drawer>
  </div>
</template>
<style lang="scss" scoped></style>
