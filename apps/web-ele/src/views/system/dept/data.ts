import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const enabledDisabledOptions = [
  { label: $t('pages.common.enable'), value: 1 },
  { label: $t('pages.common.disable'), value: 2 },
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
      fieldName: 'parentId',
      label: $t('system.dept.parentId'),
      dependencies: {
        show: (model) => model.parentId !== 0,
        triggerFields: ['parentId'],
      },
      componentProps: {
        props: {
          label: 'name',
          value: 'id',
        },
        // 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
        expandOnClickNode: false,
        // 是否默认展开所有节点
        defaultExpandAll: true,
        // 是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
        checkOnClickNode: true,
        // checkOnClickLeaf: false,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        data: [],
        nodeKey: 'id',
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.name'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('system.dept.sort'),
      defaultValue: 1,
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
      label: $t('system.dept.status'),
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
