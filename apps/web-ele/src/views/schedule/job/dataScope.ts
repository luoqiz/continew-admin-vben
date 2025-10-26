import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';

import { $t } from '#/locales';

export function useEditFormSchema(
  groupNameList?: Ref<{ label: string; value: string }[]>,
  job_trigger_type_enum?: Ref<App.DictItem[]>,
  job_task_type_enum?: Ref<App.DictItem[]>,
  job_route_strategy_enum?: Ref<App.DictItem[]>,
  job_block_strategy_enum?: Ref<App.DictItem[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Divider',
      fieldName: '_divider1',
      formItemClass: 'col-span-full',
      hideLabel: true,
      componentProps: {
        'content-position': 'left',
      },
      renderComponentContent: () => {
        return {
          default: () => h('div', '基础配置'),
        };
      },
    },
    {
      fieldName: 'groupName',
      label: $t('schedule.job.groupName'),
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: groupNameList,
      },
    },
    {
      label: $t('schedule.job.jobName'),
      fieldName: 'jobName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('schedule.job.description'),
      fieldName: 'description',
      component: 'Input',
      componentProps: {
        type: 'textarea',
        rows: 3,
      },
      formItemClass: 'col-span-full w-full',
    },
    {
      component: 'Divider',
      fieldName: '_divider2',
      formItemClass: 'col-span-full',
      hideLabel: true,
      componentProps: {
        'content-position': 'left',
      },
      renderComponentContent: () => {
        return {
          default: () => h('div', '调度配置'),
        };
      },
    },
    {
      label: $t('schedule.job.triggerType'),
      fieldName: 'triggerType',
      component: 'Select',
      componentProps: {
        options: job_trigger_type_enum,
      },
      rules: 'required',
    },
    {
      label: $t('schedule.job.triggerInterval'),
      fieldName: 'triggerInterval',
      component: 'Input',
      rules: 'required',
      defaultValue: 60,
      dependencies: {
        triggerFields: ['triggerType'],
        if(values) {
          return values.triggerType === 1;
        },
      },
    },
    {
      label: $t('schedule.job.triggerInterval'),
      fieldName: 'triggerInterval',
      component: 'Input',
      rules: 'required',
      defaultValue: 60,
      dependencies: {
        triggerFields: ['triggerType'],
        if(values) {
          return values.triggerType === 2;
        },
      },
    },
    {
      label: $t('schedule.job.cronExpression'),
      fieldName: 'triggerInterval',
      component: 'Input',
      rules: 'required',
      defaultValue: 60,
      dependencies: {
        triggerFields: ['triggerType'],
        if(values) {
          return values.triggerType === 3;
        },
      },
      // componentProps: {
      //   placeholder: 'e.g. 0 0/5 * * * ?',
      // },
      // renderComponentContent: () => {
      //   return {
      //     append: () =>
      //       h(ElButton, {
      //         icon: MsNestClockFarsightAnalogOutline,
      //         onClick: () => {
      //           ElMessage.info('Cron Expression copied to clipboard!');
      //         },
      //       }),
      //   };
      // },
    },
    {
      component: 'Divider',
      fieldName: '_divider3',
      formItemClass: 'col-span-full',
      hideLabel: true,
      componentProps: {
        'content-position': 'left',
      },
      renderComponentContent: () => {
        return {
          default: () => h('div', '任务配置'),
        };
      },
    },
    {
      label: $t('schedule.job.taskType'),
      fieldName: 'taskType',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: job_task_type_enum,
      },
    },
    {
      label: $t('schedule.job.executorInfo'),
      component: 'Input',
      fieldName: 'executorInfo',
      rules: 'required',
    },
    {
      label: $t('schedule.job.argsStr'),
      fieldName: 'argsStr',
      component: 'Input',

      formItemClass: 'col-span-full',
      componentProps: {
        type: 'textarea',
        rows: 3,
      },
    },
    {
      component: 'Divider',
      fieldName: '_divider4',
      formItemClass: 'col-span-full',
      hideLabel: true,
      componentProps: {
        'content-position': 'left',
      },
      renderComponentContent: () => {
        return {
          default: () => h('div', '高级配置'),
        };
      },
    },
    {
      label: $t('schedule.job.routeKey'),
      fieldName: 'routeKey',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: job_route_strategy_enum,
      },
      defaultValue: job_route_strategy_enum?.value[0]?.value,
    },
    {
      label: $t('schedule.job.blockStrategy'),
      fieldName: 'blockStrategy',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: job_block_strategy_enum,
      },
      defaultValue: job_block_strategy_enum?.value[0]?.value,
    },
    {
      label: $t('schedule.job.executorTimeout'),
      fieldName: 'executorTimeout',
      component: 'InputNumber',
      rules: 'required',
      componentProps: {
        controlsPosition: 'right',
        style: 'width: 100%;',
      },
      defaultValue: 60,
      renderComponentContent: () => {
        return {
          suffix: () => h('span', { class: 'mr-2' }, $t('pages.common.second')),
        };
      },
    },
    {
      label: $t('schedule.job.maxRetryTimes'),
      fieldName: 'maxRetryTimes',
      component: 'InputNumber',
      rules: 'required',
      componentProps: {
        controlsPosition: 'right',
        style: 'width: 100%;',
      },
      defaultValue: 3,
      renderComponentContent: () => {
        return {
          suffix: () => h('span', { class: 'mr-2' }, $t('pages.common.second')),
        };
      },
    },
    {
      label: $t('schedule.job.retryInterval'),
      fieldName: 'retryInterval',
      component: 'InputNumber',
      formItemClass: 'col-span-1',
      rules: 'required',
      componentProps: {
        controlsPosition: 'right',
        style: 'width: 100%;',
        min: 1,
      },
      defaultValue: 1,
      renderComponentContent: () => {
        return {
          suffix: () => h('span', { class: 'mr-2' }, $t('pages.common.second')),
        };
      },
    },
    {
      label: $t('schedule.job.parallelNum'),
      fieldName: 'parallelNum',
      component: 'InputNumber',
      rules: 'required',
      componentProps: {
        controlsPosition: 'right',
        style: 'width: 100%;',
      },
      defaultValue: 1,
      renderComponentContent: () => {
        return {
          suffix: () => h('span', { class: 'mr-2' }, $t('pages.common.second')),
        };
      },
    },
  ];
}

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
      label: $t('schedule.job.jobStatus'),
      fieldName: 'jobStatus',
      component: 'Select',
      componentProps: {
        options: job_status_enum,
        clearable: true,
      },
      formItemClass: 'col-span-1 w-full',
    },
  ];
}
// Table 字段配置
export function useGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },

    {
      field: 'jobName',
      title: $t('schedule.job.jobName'),
      align: 'center',
    },
    {
      field: 'triggerType',
      title: $t('schedule.job.triggerType'),
      align: 'center',
      slots: { default: 'triggerType' },
    },
    {
      field: 'taskType',
      title: $t('schedule.job.taskType'),
      align: 'center',
      slots: { default: 'taskType' },
    },
    {
      field: 'jobStatus',
      title: $t('schedule.job.jobStatus'),
      align: 'center',
      slots: { default: 'jobStatus' },
    },
    {
      field: 'description',
      title: $t('schedule.job.description'),
      align: 'center',
    },
    {
      field: 'createDt',
      title: $t('schedule.job.createDt'),
      align: 'center',
    },
    {
      field: 'updateDt',
      title: $t('schedule.job.updateDt'),
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
