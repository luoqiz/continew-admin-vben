import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { useDict } from '#/hooks';
import { $t } from '#/locales';

export function useSmsEditFormSchema(): VbenFormSchema[] {
  const { sms_supplier } = useDict('sms_supplier');
  return [
    {
      label: $t('system.sms.name') || '名称',
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.sms.supplier') || '厂商',
      fieldName: 'supplier',
      component: 'ApiSelect',
      componentProps: {
        options: sms_supplier?.value,
      },
      rules: 'required',
    },
    {
      label: 'Access Key',
      fieldName: 'accessKey',
      component: 'Input',
    },
    {
      label: 'Secret Key',
      fieldName: 'secretKey',
      component: 'VbenInputPassword',
    },
    {
      label: '短信签名',
      fieldName: 'signature',
      component: 'Input',
    },
    {
      label: '模板 ID',
      fieldName: 'templateId',
      component: 'Input',
    },
    {
      label: $t('system.sms.status') || '状态',
      fieldName: 'status',
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
      },
    },
    {
      label: '厂商配置',
      fieldName: 'supplierConfig',
      component: 'Textarea',
      componentProps: { autoSize: true },
    },
  ];
}

export function useSmsGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      label: $t('system.sms.name') || '名称',
      component: 'Input',
    },
    { fieldName: 'accessKey', label: 'Access Key', component: 'Input' },
    {
      fieldName: 'supplier',
      label: $t('system.sms.supplier') || '厂商',
      component: 'ApiSelect',
      componentProps: {
        // will be resolved by ApiSelect options in runtime
      },
    },
  ];
}

export function useSmsGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'name',
      title: $t('system.sms.name'),
      align: 'center',
      fixed: 'left',
    },
    { field: 'supplier', title: $t('system.sms.supplier'), align: 'center' },
    {
      field: 'isDefault',
      title: '是否默认',
      align: 'center',
      slots: { default: 'isDefault' },
    },
    { field: 'accessKey', title: 'Access Key', align: 'center' },
    { field: 'signature', title: '短信签名', align: 'center' },
    { field: 'templateId', title: '模板 ID', align: 'center' },
    {
      field: 'status',
      title: $t('common.status') || '状态',
      align: 'center',
      slots: { default: 'status' },
    },
    { field: 'weight', title: '权重', align: 'center' },
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
