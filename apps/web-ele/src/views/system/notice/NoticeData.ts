import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LabelValueState } from '#/types/global';

import RichText from '#/components/richText/index.vue';
import { yesNoOptions } from '#/constants';
import { $t } from '#/locales';
import { dateRangeShortcuts } from '#/utils/dateTools';

export function useNoticeEditFormSchema(
  notice_type?: Ref<App.DictItem[]>,
  notice_scope_enum?: Ref<App.DictItem[]>,
  notice_method_enum?: Ref<App.DictItem[]>,
  userList?: Ref<LabelValueState[]>,
): VbenFormSchema[] {
  return [
    {
      label: $t('system.notice.title'),
      fieldName: 'title',
      component: 'Input',
      rules: 'required',
      formItemClass: 'col-span-full',
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.type'),
      fieldName: 'type',
      rules: 'required',
      component: 'Select',
      componentProps: {
        placeholder: $t('system.notice.type'),
        options: notice_type,
      },
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.noticeScope'),
      fieldName: 'noticeScope',
      rules: 'required',
      component: 'RadioGroup',
      componentProps: {
        placeholder: $t('system.notice.noticeScope'),
        options: notice_scope_enum,
      },
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.noticeUsers'),
      fieldName: 'noticeUsers',
      component: 'Select',
      componentProps: {
        placeholder: $t('system.notice.noticeUsers'),
        options: userList,
        multiple: true,
        filterable: true,
      },
      dependencies: {
        triggerFields: ['noticeScope', 'status'],
        if: (values) => values.noticeScope === 2,
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.noticeMethods'),
      fieldName: 'noticeMethods',
      component: 'CheckboxGroup',
      componentProps: {
        placeholder: $t('system.notice.noticeMethods'),
        options: notice_method_enum,
      },
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.isTiming'),
      fieldName: 'isTiming',
      rules: 'required',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: yesNoOptions,
      },
      defaultValue: true,
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.publishTime'),
      fieldName: 'publishTime',
      component: 'DatePicker',
      componentProps: {
        placeholder: $t('system.notice.publishTime'),
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      formItemClass: 'w-full',
      dependencies: {
        triggerFields: ['isTiming', 'status'],
        if: (values) => values.isTiming === true,
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.isTop'),
      fieldName: 'isTop',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: yesNoOptions,
      },
      defaultValue: true,
      rules: 'required',
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
    },
    {
      label: $t('system.notice.content'),
      hideLabel: true,
      fieldName: 'content',
      component: RichText,
      rules: 'required',
      formItemClass: 'col-span-full w-full',
      componentProps: {
        style: 'height:500px',
      },
      dependencies: {
        triggerFields: ['status'],
        disabled: (values) => values.status === 3,
      },
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
