import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { useDict } from '#/hooks';
import { $t } from '#/locales';

export function usePackageEditFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('tenant.package.name'),
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('tenant.package.sort'),
      fieldName: 'sort',
      component: 'Input',
      rules: 'required',
    },
    {
      component: 'Radio',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      label: $t('tenant.package.menuCheckStrictly'),
      fieldName: 'menuCheckStrictly',
    },
    {
      label: $t('tenant.package.status'),
      fieldName: 'status',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: () =>
          useDict('dis_enable_status_enum').dis_enable_status_enum?.value,
        optionType: 'button',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: $t('tenant.package.description'),
      fieldName: 'description',
      component: 'Textarea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      component: 'menuIds',
      defaultValue: [],
      fieldName: 'menuIds',
      label: '关联菜单',
    },
  ];
}

export function usePackageGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'description',
      label: $t('tenant.package.name'),
      component: 'Input',
    },
  ];
}

// Table 字段配置
export function usePackageGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    // { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'name',
      title: $t('tenant.package.name'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'status',
      title: $t('tenant.package.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    {
      field: 'description',
      title: $t('tenant.package.description'),
      align: 'center',
    },
    {
      field: 'sort',
      title: $t('tenant.package.sort'),
      align: 'center',
    },
    {
      field: 'createUserString',
      title: $t('tenant.package.createUser'),
      align: 'center',
    },
    {
      field: 'createTime',
      title: $t('tenant.package.createTime'),
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
