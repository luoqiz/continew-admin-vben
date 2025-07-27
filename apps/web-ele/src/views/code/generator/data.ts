import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
    },

    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'tableName',
      label: $t('system.code.tableName'),
    },
  ];
}

// Table 字段配置
export function useFiledColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 50, fixed: 'left' },
    { title: '名称', slots: { default: 'fieldName' } },
    { title: '类型', slots: { default: 'fieldType' } },
    { title: '描述', slots: { default: 'comment' }, width: 170 },
    {
      title: '列表',
      slots: { default: 'showInList' },
      width: 50,
      align: 'center',
    },
    {
      title: '表单',
      slots: { default: 'showInForm' },
      width: 50,
      align: 'center',
    },
    {
      title: '必填',
      slots: { default: 'isRequired' },
      width: 50,
      align: 'center',
    },
    {
      title: '查询',
      slots: { default: 'showInQuery' },
      width: 50,
      align: 'center',
    },
    { title: '表单类型', slots: { default: 'formType' } },
    { title: '查询方式', slots: { default: 'queryType' } },
    { title: '关联字典', slots: { default: 'dictCode' } },
  ];
}

export function useGenConfigColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'tableName',
      title: $t('system.code.tableName'),
      width: 120,
      fixed: 'left',
    },
    {
      field: 'comment',
      title: $t('system.code.comment'),
      width: 120,
    },
    {
      field: 'classNamePrefix',
      minWidth: 120,
      title: $t('system.code.classNamePrefix'),
    },
    {
      field: 'entityName',
      minWidth: 120,
      title: $t('system.code.entityName'),
    },
    {
      field: 'listType',
      minWidth: 120,
      title: $t('system.code.listType'),
    },
    {
      field: 'dialogType',
      minWidth: 120,
      title: $t('system.code.dialogType'),
    },
    {
      field: 'moduleName',
      minWidth: 120,
      title: $t('system.code.moduleName'),
    },
    {
      field: 'packageName',
      minWidth: 120,
      title: $t('system.code.packageName'),
    },
    {
      field: 'createTime',
      title: $t('system.code.createTime'),
      width: 120,
    },
    {
      field: 'updateTime',
      title: $t('system.code.updateTime'),
      width: 120,
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
