import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { useDict } from '#/hooks';
import { $t } from '#/locales';

export function useStorageEditFormSchema(): VbenFormSchema[] {
  const { storage_type_enum } = useDict('storage_type_enum');
  return [
    {
      label: $t('system.storage.name') || '名称',
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.storage.code') || '编码',
      fieldName: 'code',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.storage.type') || '类型',
      fieldName: 'type',
      component: 'ApiSelect',
      componentProps: { options: storage_type_enum?.value },
      rules: 'required',
    },
    { label: 'Access Key', fieldName: 'accessKey', component: 'Input' },
    {
      label: 'Secret Key',
      fieldName: 'secretKey',
      component: 'VbenInputPassword',
    },
    { label: 'Endpoint', fieldName: 'endpoint', component: 'Input' },
    { label: 'Bucket', fieldName: 'bucketName', component: 'Input' },
    { label: '域名', fieldName: 'domain', component: 'Input' },
    {
      label: $t('system.storage.recycleBinEnabled') || '启用回收站',
      fieldName: 'recycleBinEnabled',
      component: 'Switch',
    },
    {
      label: $t('system.storage.recycleBinPath') || '回收站路径',
      fieldName: 'recycleBinPath',
      component: 'Input',
    },
    { label: '排序', fieldName: 'sort', component: 'InputNumber' },
    {
      label: '描述',
      fieldName: 'description',
      component: 'Textarea',
      componentProps: { autoSize: true },
    },
    {
      label: $t('system.storage.status') || '状态',
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

export function useStorageGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      label: $t('system.storage.name') || '名称',
      component: 'Input',
    },
    {
      fieldName: 'code',
      label: $t('system.storage.code') || '编码',
      component: 'Input',
    },
    {
      fieldName: 'type',
      label: $t('system.storage.type') || '类型',
      component: 'ApiSelect',
    },
  ];
}

export function useStorageGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'name',
      title: $t('system.storage.name'),
      align: 'center',
      fixed: 'left',
    },
    { field: 'code', title: $t('system.storage.code'), align: 'center' },
    { field: 'type', title: $t('system.storage.type'), align: 'center' },
    { field: 'domain', title: '域名', align: 'center' },
    {
      field: 'recycleBinEnabled',
      title: $t('system.storage.recycleBinEnabled'),
      align: 'center',
      slots: { default: 'recycleBinEnabled' },
    },
    {
      field: 'recycleBinPath',
      title: $t('system.storage.recycleBinPath'),
      align: 'center',
    },
    {
      field: 'status',
      title: $t('system.storage.status'),
      align: 'center',
      slots: { default: 'status' },
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 260,
    },
  ];
}
