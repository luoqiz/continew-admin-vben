import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { OpenAppApi } from '#/api/open/app';

import { z } from '#/adapter/form';

/**
 * 获取编辑表单的字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '应用名称',
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
      label: '失效时间',
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
      label: '应用描述',
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
      label: '状态',
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
      label: '应用名称',
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
    {
      type: 'seq',
      title: '序号',
      width: 66,
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'name',
      title: '应用名称',
      fixed: 'left',
      showOverflow: 'tooltip',
    },
    {
      field: 'accessKey',
      title: 'Access Key',
      showOverflow: 'tooltip',
      cellRender: {
        name: 'CellCopy',
      },
    },
    {
      field: 'secretKey',
      title: 'Secret Key',
      width: 450,
      align: 'center',
      slots: { default: 'secretKey' },
    },
    {
      field: 'expireTime',
      title: '失效时间',
    },
    {
      field: 'status',
      title: '状态',
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
      title: '描述',
      showOverflow: 'tooltip',
    },
    {
      field: 'createUserString',
      title: '创建人',
      width: 120,
      showOverflow: 'tooltip',
      visible: false,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      field: 'updateUserString',
      title: '修改人',
      width: 120,
      showOverflow: 'tooltip',
      visible: false,
    },
    {
      field: 'updateTime',
      title: '修改时间',
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
            text: '详情',
          },
          'edit',
          {
            code: 'delete',
            text: '删除',
            status: 'danger',
            disabled: (row: OpenAppApi.AppResp) => row.disabled,
          },
          {
            code: 'resetSecret',
            text: '重置密钥',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 200,
    },
  ];
}
