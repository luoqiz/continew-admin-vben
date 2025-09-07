import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';
import { dateRangeShortcuts } from '#/utils/dateTools';

export function useNoticeEditFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('system.notice.title'),
      fieldName: 'title',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.content'),
      fieldName: 'content',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.type'),
      fieldName: 'type',
      component: 'select',
      rules: 'required',
    },
    {
      label: $t('system.notice.noticeScope'),
      fieldName: 'noticeScope',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.noticeUsers'),
      fieldName: 'noticeUsers',
      component: 'Input',
    },
    {
      label: $t('system.notice.noticeMethods'),
      fieldName: 'noticeMethods',
      component: 'Input',
    },
    {
      label: $t('system.notice.isTiming'),
      fieldName: 'isTiming',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.publishTime'),
      fieldName: 'publishTime',
      component: 'DatePicker',
      componentProps: {
        placeholder: 'system.notice.publishTimeTip',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      label: $t('system.notice.isTop'),
      fieldName: 'isTop',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: $t('system.notice.status'),
      fieldName: 'status',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.createUser'),
      fieldName: 'createUser',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('system.notice.createTime'),
      fieldName: 'createTime',
      component: 'Input',
      rules: 'required',
    },
  ];
}

export function useNoticeGridSearchFormSchema(
  notice_type?: Ref<App.DictItem[]>,
): VbenFormSchema[] {
  return [
    {
      fieldName: 'title',
      label: $t('system.notice.title'),
      component: 'Input',
    },
    {
      fieldName: 'type',
      label: $t('system.notice.type'),
      component: 'Select',
      componentProps: {
        placeholder: $t('system.notice.type'),
        options: notice_type,
      },
    },
    {
      fieldName: 'publishTime',
      label: $t('system.notice.publishTime'),
      component: 'DatePicker',
      componentProps: {
        placeholder: 'system.notice.publishTimeTip',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        type: 'daterange',
        shortcuts: dateRangeShortcuts,
      },
    },
    {
      fieldName: 'status',
      label: $t('system.notice.status'),
      component: 'Input',
    },
  ];
}

// Table 字段配置
export function useNoticeGridFieldColumns(
  notice_type?: Ref<App.DictItem[]>,
  notice_scope_enum?: Ref<App.DictItem[]>,
  notice_method_enum?: Ref<App.DictItem[]>,
  notice_status_enum?: Ref<App.DictItem[]>,
): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'title',
      title: $t('system.notice.title'),
      align: 'center',
    },
    {
      field: 'createUserString',
      title: $t('system.notice.createUser'),
      align: 'center',
    },
    {
      field: 'type',
      title: $t('system.notice.type'),
      align: 'center',
      width: 100,
      cellRender: {
        name: 'CellDictTag',
        attrs: {
          options: notice_type,
        },
      },
    },
    {
      field: 'noticeScope',
      title: $t('system.notice.noticeScope'),
      align: 'center',
      cellRender: {
        name: 'CellDictTag',
        attrs: {
          options: notice_scope_enum,
        },
      },
      width: 150,
    },
    {
      field: 'noticeMethods',
      title: $t('system.notice.noticeMethods'),
      align: 'center',
      cellRender: {
        name: 'CellDictTag',
        attrs: {
          options: notice_method_enum,
          class: 'flex flex-row gap-1 items-center justify-start',
        },
      },
      width: 150,
    },
    {
      field: 'isTiming',
      title: $t('system.notice.isTiming'),
      align: 'center',
      cellRender: {
        name: 'CellYesNoTag',
      },
    },

    {
      field: 'isTop',
      title: $t('system.notice.isTop'),
      align: 'center',
      cellRender: {
        name: 'CellYesNoTag',
      },
    },
    {
      field: 'status',
      title: $t('system.notice.status'),
      align: 'center',
      cellRender: {
        name: 'CellDictTag',
        attrs: {
          options: notice_status_enum,
        },
      },
      width: 100,
    },
    {
      field: 'publishTime',
      title: $t('system.notice.publishTime'),
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
