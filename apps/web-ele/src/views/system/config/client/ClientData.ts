import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '@vben/common-ui';

import { useDict } from '#/hooks';
import { $t } from '#/locales';

export function useClientEditFormSchema(): VbenFormSchema[] {
  const { client_type, auth_type_enum, replaced_range_enum, logout_mode_enum } =
    useDict(
      'client_type',
      'auth_type_enum',
      'replaced_range_enum',
      'logout_mode_enum',
    );
  return [
    {
      label: $t('system.client.clientType'),
      fieldName: 'clientType',
      component: 'ApiSelect',
      componentProps: { options: client_type?.value },
      rules: 'required',
    },
    {
      label: $t('system.client.authType'),
      fieldName: 'authType',
      component: 'ApiSelect',
      componentProps: { options: auth_type_enum?.value, multiple: true },
      rules: 'required',
    },
    {
      label: $t('system.client.activeTimeout'),
      fieldName: 'activeTimeout',
      component: 'InputNumber',
      componentProps: { min: -1 },
      rules: 'required',
    },
    {
      label: $t('system.client.timeout'),
      fieldName: 'timeout',
      component: 'InputNumber',
      componentProps: { min: -1 },
      rules: 'required',
    },
    {
      label: $t('system.client.refreshTokenTimeout'),
      fieldName: 'refreshTokenTimeout',
      component: 'InputNumber',
      componentProps: { min: 60 },
      defaultValue: 2_592_000,
      rules: 'required',
    },
    {
      label: $t('system.client.refreshTokenIdleTimeout'),
      fieldName: 'refreshTokenIdleTimeout',
      component: 'InputNumber',
      componentProps: { min: 0, max: 315_360_000, precision: 0 },
      defaultValue: 0,
      help: $t('system.client.refreshTokenIdleTimeoutHelp'),
      // 与后端 ClientServiceImpl 保持一致：1~59 秒会把客户端锁死，提交前就拦下来
      rules: z.coerce
        .number()
        .nullish()
        .refine(
          (value) =>
            value === null || value === undefined || value === 0 || value >= 60,
          {
            message: '需为 0（不限制）或不小于 60 秒',
          },
        ),
    },
    {
      label: $t('system.client.refreshTokenMode'),
      fieldName: 'refreshTokenMode',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: $t('system.client.refreshTokenModeCookie'),
            value: 'COOKIE',
          },
          {
            label: $t('system.client.refreshTokenModeBody'),
            value: 'BODY',
          },
        ],
      },
      defaultValue: 'COOKIE',
      rules: 'required',
    },
    {
      label: $t('system.client.isConcurrent'),
      fieldName: 'isConcurrent',
      component: 'Switch',
    },
    {
      label: $t('system.client.replacedRange'),
      fieldName: 'replacedRange',
      component: 'ApiSelect',
      componentProps: { options: replaced_range_enum?.value },
    },
    {
      label: $t('system.client.maxLoginCount'),
      fieldName: 'maxLoginCount',
      component: 'InputNumber',
      componentProps: { min: -1 },
    },
    {
      label: $t('system.client.overflowLogoutMode'),
      fieldName: 'overflowLogoutMode',
      component: 'ApiSelect',
      componentProps: { options: logout_mode_enum?.value },
    },
    {
      label: $t('system.client.status'),
      fieldName: 'status',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
      },
    },
  ];
}

export function useClientGridSearchFormSchema(): VbenFormSchema[] {
  const { client_type } = useDict('client_type');
  return [
    {
      fieldName: 'clientType',
      label: $t('system.client.clientType'),
      component: 'ApiSelect',
      componentProps: { options: client_type?.value },
    },
  ];
}

export function useClientGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'clientId',
      title: $t('system.client.clientId'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'clientType',
      title: $t('system.client.clientType'),
      align: 'center',
    },
    { field: 'authType', title: $t('system.client.authType'), align: 'center' },
    {
      field: 'activeTimeout',
      title: $t('system.client.activeTimeout'),
      align: 'center',
    },
    { field: 'timeout', title: $t('system.client.timeout'), align: 'center' },
    {
      field: 'refreshTokenTimeout',
      title: $t('system.client.refreshTokenTimeout'),
      align: 'center',
    },
    {
      field: 'refreshTokenIdleTimeout',
      title: $t('system.client.refreshTokenIdleTimeout'),
      align: 'center',
      formatter: ({ cellValue }) => (cellValue ? `${cellValue} 秒` : '不限制'),
    },
    {
      field: 'refreshTokenMode',
      title: $t('system.client.refreshTokenMode'),
      align: 'center',
    },
    {
      field: 'isConcurrent',
      title: $t('system.client.isConcurrent'),
      align: 'center',
      slots: { default: 'isConcurrent' },
    },
    {
      field: 'status',
      title: $t('system.client.status'),
      align: 'center',
      slots: { default: 'status' },
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 240,
    },
  ];
}
