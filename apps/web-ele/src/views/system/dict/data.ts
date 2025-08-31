import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '@vben/common-ui';

import { $t } from '#/locales';

// 字典类型表单
export function dictTypeFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'id',
      label: 'id',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '字典名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      help: '使用英文/下划线命名, 如:sys_normal_disable',
      label: '字典类型',
      dependencies: {
        triggerFields: ['id'],
        disabled(values) {
          return !!values.id;
        },
      },
      rules: z.string().regex(/^\w+$/, {
        message: '字典类型只能使用英文/数字/下划线命名',
      }),
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
    },
  ];
}

// 字典类型搜索表单
export function useDictSearchFormFields(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'searchKey',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.dict.search.key'),
      },
    },
    {
      component: 'Input',
      fieldName: 'code',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.dict.code'),
      },
    },
  ];
}

// 字典类型表格字段配置
export function useDictColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 50, fixed: 'left' },
    {
      title: $t('system.dict.name'),
      field: 'name',
    },
    { title: $t('system.dict.code'), field: 'code' },
    {
      title: $t('system.dict.isSystem'),
      field: 'isSystem',
      slots: { default: 'isSystem' },
    },
    {
      title: $t('system.dict.description'),
      field: 'description',
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

const DICT_ITEM_COLOR_OPTIONS: BasicOption[] = [
  {
    label: '成功（仙野绿）',
    value: 'primary',
  },
  {
    label: '主要（极致蓝）',
    value: 'arcoblue',
  },
  {
    label: '警告（活力橙）',
    value: 'warning',
  },
  {
    label: '默认（中性灰）',
    value: 'error',
  },
  {
    label: '错误（浪漫红）',
    value: 'default',
  },
];

// 字典条目表单
export function dictItemFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'id',
      label: 'id',
    },
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'dictId',
      label: 'dictId',
    },
    {
      component: 'Input',
      fieldName: 'label',
      label: $t('system.dictItem.label'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: $t('system.dictItem.value'),

      rules: 'required',
    },
    {
      component: 'VbenSelect',
      fieldName: 'color',
      label: $t('system.dictItem.color'),
      componentProps: {
        options: DICT_ITEM_COLOR_OPTIONS,
        // placeholder: $t('authentication.selectAccount'),
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('system.dictItem.sort'),
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('system.dictItem.description'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.dictItem.status'),
    },
  ];
}

// 字典条目搜索表单
export function useDictItemSearchFormFields(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictId',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      label: $t('system.dictItem.dictId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'description',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.dictItem.search.description'),
      },
    },
  ];
}

// 字典条目表格字段配置
export function useDictItemColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 50, fixed: 'left' },
    {
      title: $t('system.dictItem.label'),
      field: 'label',
    },
    {
      title: $t('system.dictItem.value'),
      field: 'value',
      slots: { default: 'value' },
    },
    {
      title: $t('system.dictItem.status'),
      field: 'status',
      slots: { default: 'status' },
    },
    { title: $t('system.dictItem.sort'), field: 'sort' },
    {
      title: $t('system.dictItem.description'),
      field: 'description',
    },
    {
      title: $t('system.dictItem.createTime'),
      field: 'createTime',
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
