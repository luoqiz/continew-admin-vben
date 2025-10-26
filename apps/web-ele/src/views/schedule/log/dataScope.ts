import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { dateRangeShortcuts } from '#/utils/dateTools';

export function useGridSearchFormSchema(
  groupNameList: Ref<{ label: string; value: string }[]>,
  job_status_enum?: Ref<App.DictItem[]>,
): VbenFormSchema[] {
  return [
    {
      fieldName: 'groupName',
      label: $t('schedule.job.groupName'),
      component: 'Select',
      componentProps: {
        options: groupNameList,
      },
    },
    {
      fieldName: 'jobName',
      label: $t('schedule.job.jobName'),
      component: 'Input',
    },
    {
      label: $t('schedule.jobLog.taskBatchStatus'),
      fieldName: 'taskBatchStatus',
      component: 'Select',
      componentProps: {
        options: job_status_enum,
        clearable: true,
      },
      formItemClass: 'col-span-1 w-full',
    },
    {
      fieldName: 'datetimeRange',
      label: $t('schedule.jobLog.createDt'),
      component: 'DatePicker',
      formItemClass: 'col-span-2 w-full',
      componentProps: {
        placeholder: 'schedule.jobLog.createDt',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        type: 'daterange',
        shortcuts: dateRangeShortcuts,
      },
    },
  ];
}

// Table 字段配置
export function useGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'groupName',
      title: $t('schedule.jobLog.groupName'),
      align: 'center',
    },
    {
      field: 'jobName',
      title: $t('schedule.jobLog.jobName'),
      align: 'center',
    },
    {
      field: 'createDt',
      title: $t('schedule.jobLog.createDt'),
      align: 'center',
    },
    {
      field: 'taskBatchStatus',
      title: $t('schedule.jobLog.taskBatchStatus'),
      align: 'center',
      slots: { default: 'taskBatchStatus' },
    },
    {
      field: 'operationReason',
      title: $t('schedule.jobLog.operationReason'),
      align: 'center',
      slots: { default: 'operationReason' },
    },
    {
      field: 'executionAt',
      title: $t('schedule.jobLog.executionAt'),
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 200,
    },
  ];
}
