<script setup lang="ts">
import type { JobResp } from '#/api/schedule';
import type { LabelValueState } from '#/types/global';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { MsNestClockFarsightAnalogOutline } from '@vben/icons';
import { $t } from '@vben/locales';
import { encryptByRsa } from '@vben/utils';

import { ElButton, ElInput, ElInputNumber, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addJob, listGroup, updateJob } from '#/api/schedule';
import CronModal from '#/components/GenCron/CronModal/index.vue';
import { useDict } from '#/hooks';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useEditFormSchema } from './dataScope';

const emits = defineEmits(['success']);
const dataId = ref<number | string>('');
const isUpdate = computed(() => !!dataId.value);
const visible = ref(false);
const groupList = ref<LabelValueState[]>([]);
const args = ref<any[]>([]);
const {
  job_trigger_type_enum,
  job_task_type_enum,
  job_route_strategy_enum,
  job_block_strategy_enum,
} = useDict(
  'job_trigger_type_enum',
  'job_task_type_enum',
  'job_route_strategy_enum',
  'job_block_strategy_enum',
);

const [EditForm, deptFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useEditFormSchema(
    groupList,
    job_trigger_type_enum,
    job_task_type_enum,
    job_route_strategy_enum,
    job_block_strategy_enum,
  ),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
});

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

// 查询任务组列表
const getGroupList = async () => {
  const data = await listGroup();
  groupList.value = data?.map((item: string) => ({
    label: item,
    value: item,
  }));
};

const [Modal, drawerApi] = useVbenModal({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await deptFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      if (isUpdate.value) {
        await updateJob(deptFormApi.form.values, dataId.value);
        ElMessage.success($t('pages.common.modifySuccess'));
      } else {
        await addJob({
          ...deptFormApi.form.values,
          adminPassword: encryptByRsa(deptFormApi.form.values.adminPassword),
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
        const record = drawerApi.getData<JobResp>();
        dataId.value = record.id;
        if (groupList.value.length === 0) {
          await getGroupList();
        }
        if (record) {
          deptFormApi.form.setValues(record);
        }
        // 切片任务，解析 argsStr 并赋值给 args
        if (
          deptFormApi.form.values.taskType === 3 &&
          deptFormApi.form.values.argsStr
        ) {
          try {
            const parsedArgs = JSON.parse(deptFormApi.form.values.argsStr);
            args.value = parsedArgs.map((arg: any) => ({ value: arg }));
          } catch (error: any) {
            ElMessage.error(error);
          }
        }
        visible.value = true;
      } finally {
        await markInitialized();
        drawerApi.unlock();
      }
    }
  },
});

const getModalTitle = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const cronModal = ref();
// 打开生成表达式
const openGeneratorCron = (cron: string) => {
  cronModal.value.open(cron.toString());
};
</script>

<template>
  <Modal :title="getModalTitle" class="w-[60%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <EditForm>
        <template #triggerInterval>
          <ElInputNumber
            v-model="deptFormApi.form.values.triggerInterval"
            :clearable="true"
            v-if="deptFormApi.form.values.triggerType === 2"
            style="width: 100%"
            controls-position="right"
          >
            <template #suffix>{{ $t('pages.common.second') }}</template>
          </ElInputNumber>
          <ElInput
            v-model="deptFormApi.form.values.triggerInterval"
            :clearable="true"
            v-if="deptFormApi.form.values.triggerType === 3"
            style="width: 100%"
          >
            <template #append>
              <ElButton
                :icon="MsNestClockFarsightAnalogOutline"
                @click="
                  openGeneratorCron(deptFormApi.form.values.triggerInterval)
                "
              />
            </template>
          </ElInput>
        </template>
      </EditForm>
      <CronModal
        ref="cronModal"
        @ok="
          (e: string) => {
            deptFormApi.form.setValues({ triggerInterval: e });
          }
        "
      />
    </div>
  </Modal>
</template>
<style lang="scss" scoped></style>
