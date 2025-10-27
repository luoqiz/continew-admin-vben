import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { OpenAppApi } from '#/api/open/app';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';

/**
 * 获取编辑表单的字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('open.app.name'),
      rules: z
        .string()
        .min(2, '应用名称至少2个字符')
        .max(100, '应用名称最多100个字符'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择失效时间',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'expireTime',
      label: $t('open.app.expireTime'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 200,
        rows: 3,
        showCount: true,
        placeholder: '请输入应用描述',
      },
      fieldName: 'description',
      label: $t('open.app.description'),
      rules: z.string().max(200, '应用描述最多200个字符').optional(),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('open.app.status'),
    },
  ];
}
/**
 * 获取搜索表单的字段配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'description',
      label: $t('open.app.name'),
    },
  ];
}
/**
 * 获取表格列配置
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns<T = OpenAppApi.AppResp>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'name',
      title: $t('open.app.name'),
      fixed: 'left',
      showOverflow: 'tooltip',
    },
    {
      field: 'accessKey',
      title: $t('open.app.accessKey'),
      showOverflow: 'tooltip',
      cellRender: {
        name: 'CellCopy',
      },
    },
    {
      field: 'secretKey',
      title: $t('open.app.secretKey'),
      width: 450,
      align: 'center',
      slots: { default: 'secretKey' },
    },
    {
      field: 'expireTime',
      title: $t('open.app.expireTime'),
    },
    {
      field: 'status',
      title: $t('open.app.status'),
      align: 'center',
      cellRender: {
        name: 'CellTag',
        attrs: {
          options: [
            { label: '启用', value: 1, color: 'success' },
            { label: '禁用', value: 2, color: 'error' },
          ],
        },
      },
    },
    {
      field: 'description',
      title: $t('open.app.description'),
      showOverflow: 'tooltip',
    },
    {
      field: 'createUserString',
      title: $t('open.app.createUser'),
      width: 120,
      showOverflow: 'tooltip',
      visible: false,
    },
    {
      field: 'createTime',
      title: $t('open.app.createTime'),
      width: 180,
    },
    {
      field: 'updateUserString',
      title: $t('open.app.updateUser'),
      width: 120,
      showOverflow: 'tooltip',
      visible: false,
    },
    {
      field: 'updateTime',
      title: $t('open.app.updateTime'),
      width: 180,
      visible: false,
    },
    {
      align: 'right',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: '应用',
          onClick: onActionClick,
        },
        options: [
          {
            code: 'detail',
            text: $t('open.app.detail'),
          },
          'edit',
          {
            code: 'delete',
            text: $t('open.app.delete'),
            status: 'danger',
            disabled: (row: OpenAppApi.AppResp) => row.disabled,
          },
          {
            code: 'resetSecret',
            text: $t('open.app.resetSecret'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('common.operation'),
      width: 260,
    },
  ];
}
