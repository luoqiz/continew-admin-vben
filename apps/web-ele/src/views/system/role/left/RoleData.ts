import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useRoleEditFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('system.role.name'),
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.role.code'),
      fieldName: 'code',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.role.description'),
      fieldName: 'description',
      component: 'Textarea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: $t('system.role.sort'),
      fieldName: 'sort',
      component: 'InputNumber',
      rules: 'required',
    },
    {
      label: $t('system.role.dataScope'),
      fieldName: 'dataScope',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',

        optionType: 'button',
      },
      defaultValue: true,
      rules: 'required',
    },
  ];
}

export function useRoleGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'description',
      component: 'Input',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.role.searchKey'),
      },
    },
  ];
}

// Table 字段配置
export function useRoleGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'name',
      title: $t('system.role.name'),
      align: 'center',
    },
    {
      field: 'code',
      title: $t('system.role.code'),
      align: 'center',
    },
    {
      field: 'dataScope',
      title: $t('system.role.dataScope'),
      align: 'center',
    },
    {
      field: 'description',
      title: $t('system.role.description'),
      align: 'center',
    },
    // {
    //   field: 'sort',
    //   title: $t('system.role.sort'),
    //   align: 'center',
    // },
    // {
    //   field: 'isSystem',
    //   title: $t('system.role.isSystem'),
    //   align: 'center',
    // },
    // {
    //   field: 'menuCheckStrictly',
    //   title: $t('system.role.menuCheckStrictly'),
    //   align: 'center',
    // },
    // {
    //   field: 'deptCheckStrictly',
    //   title: $t('system.role.deptCheckStrictly'),
    //   align: 'center',
    // },
    {
      field: 'tenantId',
      title: $t('system.role.tenantId'),
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 150,
    },
  ];
}
