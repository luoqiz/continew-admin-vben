import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const enabledDisabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
];

// 字典类型表单
export function useDeptFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'id',
    },
    {
      component: 'TreeSelect',
      defaultValue: 0,
      fieldName: 'parentId',
      label: $t('system.dept.parentId'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      help: '排序, 数字越小越靠前',
      label: $t('system.dept.sort'),
      defaultValue: 0,
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('system.dept.description'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: enabledDisabledOptions,
        optionType: 'button',
      },
      defaultValue: 1,
      dependencies: {
        triggerFields: ['type'],
      },
      fieldName: 'status',
      help: '停用后不会出现在菜单栏, 也无法访问',
      label: '菜单状态',
    },
  ];
}

// 字典类型搜索表单
export function useDeptSearchFormFields(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.name'),
    },
  ];
}

// 字典类型表格字段配置
export function useDeptColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      title: $t('system.dept.name'),
      field: 'name',
      treeNode: true,
      width: 300,
    },
    {
      title: $t('system.dept.status'),
      field: 'status',
      slots: { default: 'status' },
      width: 120,
    },
    {
      title: $t('system.dept.description'),
      field: 'description',
    },
    {
      title: $t('system.dept.createUserString'),
      field: 'createUserString',
      width: 150,
    },
    {
      title: $t('system.dept.createTime'),
      field: 'createTime',
      width: 150,
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 160,
    },
  ];
}
