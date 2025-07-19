<script setup lang="ts">
import type { DictItemResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addDictItem, getDictItem, updateDictItem } from '#/api';

import { dictItemFormSchema } from '../data';

const emits = defineEmits(['success']);
const dataId = ref('');
const dictId = ref('');
const isUpdate = computed(() => !!dataId.value);

const [DictItemForm, dictItemFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: dictItemFormSchema(),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await dictItemFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateDictItem(dictItemFormApi.form.values, dataId.value);
        ElMessage.success('修改成功');
      } else {
        await addDictItem({
          ...dictItemFormApi.form.values,
          dictId: dictId.value,
        });
        ElMessage.success('新增成功');
      }
      emits('success');
      drawerApi.close();
      return true;
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<DictItemResp>();
      dictId.value = data.dictId;
      if (data && data.id) {
        dataId.value = data.id;
        const res = await getDictItem(data.id);
        dictItemFormApi.form.setValues(res);
      } else {
        dictItemFormApi.setFieldValue('dictId', dictId);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return $t('common.config');
});

/**
 * 标签样式选择器
 * default: 预设标签样式
 * custom: 自定义标签样式
 */
// const selectType = ref('default');

/**
 * 取消标签选中 必须设置为undefined才行
 */
// async function handleDeSelect() {
//   await dictItemFormApi.setFieldValue('color', undefined);
// }
</script>
<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <DictItemForm>
        <!-- <template #color="slotProps">
          <TagStylePicker v-bind="slotProps" v-model:select-type="selectType" @deselect="handleDeSelect" />
        </template> -->
      </DictItemForm>
    </div>
  </Drawer>
</template>
<style lang="scss" scoped></style>
