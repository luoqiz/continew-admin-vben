import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { listDeptDictTree, listRoleDict } from '#/api';
import { $t } from '#/locales';

export function useUserEditFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('system.user.nickname'),
      fieldName: 'nickname',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.user.username'),
      fieldName: 'username',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.user.password'),
      fieldName: 'password',
      component: 'VbenInputPassword',
      dependencies: {
        triggerFields: ['id'],
        if: (values) => !values.id,
      },
    },
    {
      label: $t('system.user.phone'),
      fieldName: 'phone',
      component: 'Input',
    },
    {
      label: $t('system.user.email'),
      fieldName: 'email',
      component: 'Input',
    },
    {
      label: $t('system.user.gender'),
      fieldName: 'gender',
      component: 'RadioGroup',
      componentProps: {
        placeholder: '请输入',
        isButton: true,
        size: 'small',
        options: [
          { value: 1, label: '男' },
          { value: 2, label: '女' },
          { value: 0, label: '未知' },
        ],
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: $t('system.user.deptId'),
      fieldName: 'deptId',
      component: 'ApiTreeSelect',
      // 对应组件的参数
      componentProps: {
        // 部门接口
        api: listDeptDictTree,
        childrenField: 'children',
        // 部门接口转options格式
        props: {
          label: 'title',
          value: 'key',
        },
        // 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
        expandOnClickNode: false,
        // 是否默认展开所有节点
        defaultExpandAll: true,
        // 是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
        checkOnClickNode: true,
        // checkOnClickLeaf: false,
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        nodeKey: 'key',
        rules: 'selectRequired',
      },
    },
    {
      label: $t('system.user.roleIds'),
      fieldName: 'roleIds',
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        api: listRoleDict,
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        multiple: true,
        filterable: true,
        clearable: true,
        valueKey: 'key',
        rules: 'selectRequired',
      },
    },
    {
      label: $t('system.user.description'),
      fieldName: 'description',
      component: 'Textarea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: $t('system.user.status'),
      fieldName: 'status',
      component: 'RadioGroup',
      componentProps: {
        optionType: 'button',
        placeholder: '请输入',
        isButton: true,
        buttonStyle: 'solid',
        size: 'small',
        options: [
          { value: 1, label: '已启用' },
          { value: 2, label: '已禁用' },
        ],
      },
      defaultValue: true,
      rules: 'required',
    },
  ];
}

export function useUserGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'username',
      label: $t('system.user.username'),
      component: 'Input',
    },
    {
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
      component: 'Input',
    },
    {
      fieldName: 'email',
      label: $t('system.user.email'),
      component: 'Input',
    },
    {
      fieldName: 'phone',
      label: $t('system.user.phone'),
      component: 'Input',
    },
    {
      fieldName: 'status',
      label: $t('system.user.status'),
      component: 'RadioGroup',
      componentProps: {
        placeholder: '请输入',
        isButton: true,
        buttonStyle: 'solid',
        size: 'small',
        options: [
          { value: undefined, label: '全部' },
          { value: 1, label: '已启用' },
          { value: 2, label: '已禁用' },
        ],
      },
    },
  ];
}

// Table 字段配置
export function useUserGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      slots: { default: 'nickname' },
      align: 'center',
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      // slots: { default: 'username' },
      align: 'center',
    },
    {
      field: 'status',
      title: $t('system.user.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    {
      field: 'gender',
      title: $t('system.user.gender'),
      slots: { default: 'gender' },
      align: 'center',
    },
    {
      field: 'deptName',
      title: $t('system.user.deptId'),
      align: 'center',
    },
    {
      field: 'roleIds',
      title: $t('system.user.roleIds'),
      slots: { default: 'roleIds' },
      align: 'center',
    },
    {
      field: 'phone',
      title: $t('system.user.phone'),
      align: 'center',
    },
    {
      field: 'email',
      title: $t('system.user.email'),
      // slots: { default: 'email' },
      align: 'center',
    },

    {
      field: 'description',
      title: $t('system.user.description'),
      // slots: { default: 'description' },
      align: 'center',
    },
    {
      field: 'createTime',
      title: $t('system.user.createTime'),
      // slots: { default: 'createTime' },
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
