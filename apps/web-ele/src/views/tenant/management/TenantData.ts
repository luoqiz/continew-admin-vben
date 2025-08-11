import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { listTenantPackageDict } from '#/api/tenant';
import { useDict } from '#/hooks';
import { $t } from '#/locales';
import { datetimeFutrueShortcuts } from '#/utils/dateTools';

export function useTenantEditFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('tenant.management.name'),
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('tenant.management.code'),
      fieldName: 'code',
      component: 'Input',
      rules: 'required',
    },
    {
      label: $t('tenant.management.domain'),
      fieldName: 'domain',
      component: 'Input',
    },
    {
      label: $t('tenant.management.expireTime'),
      fieldName: 'expireTime',
      component: 'DatePicker',
      componentProps: {
        // placeholder: 'tenant.management.expireTimeTip',
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        shortcuts: datetimeFutrueShortcuts,
      },
    },
    {
      label: $t('tenant.management.description'),
      fieldName: 'description',
      component: 'Textarea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: $t('tenant.management.status'),
      fieldName: 'status',
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        isButton: true,
        options: () => {
          return useDict('dis_enable_status_enum').dis_enable_status_enum
            ?.value;
        },
      },
      rules: 'required',
    },
    // {
    //   label: $t('tenant.management.adminUser'),
    //   fieldName: 'adminUser',
    //   component: 'Input',
    //   dependencies: {
    //     triggerFields: ['id'],
    //     show: (values) => values.id,
    //   },
    // },
    {
      label: $t('tenant.management.adminUsername'),
      fieldName: 'adminUsername',
      component: 'Input',
      dependencies: {
        triggerFields: ['id'],
        disabled(values) {
          return !!values.id;
        },
      },
    },
    {
      label: $t('tenant.management.adminPassword'),
      fieldName: 'adminPassword',
      component: 'VbenInputPassword',
      rules: 'required',
      dependencies: {
        triggerFields: ['id'],
        if: (values) => {
          return !values.id;
        },
      },
    },
    {
      label: $t('tenant.management.packageId'),
      fieldName: 'packageId',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        filterable: true,
        // options: async () => {
        //   return await listTenantPackageDict();
        // },
        // 菜单接口转options格式
        // afterFetch: (data: { name: string; path: string }[]) => {
        //   return data.map((item: any) => ({
        //     label: item.name,
        //     value: item.path,
        //   }));
        // },
        // 菜单接口
        api: listTenantPackageDict,
      },
    },
  ];
}

export function useTenantGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'description',
      label: $t('tenant.management.name'),
      component: 'Input',
    },
    {
      fieldName: 'code',
      label: $t('tenant.management.code'),
      component: 'Input',
    },
    {
      fieldName: 'domain',
      label: $t('tenant.management.domain'),
      component: 'Input',
    },
    {
      fieldName: 'packageId',
      label: $t('tenant.management.packageId'),
      component: 'ApiSelect',
      componentProps: {
        filterable: true,
        // options: async () => {
        //   return await listTenantPackageDict();
        // },
        // 菜单接口转options格式
        // afterFetch: (data: { name: string; path: string }[]) => {
        //   return data.map((item: any) => ({
        //     label: item.name,
        //     value: item.path,
        //   }));
        // },
        // 菜单接口
        api: listTenantPackageDict,
      },
    },
  ];
}

// Table 字段配置
export function useTenantGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    // { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 70, fixed: 'left' },

    {
      field: 'name',
      title: $t('tenant.management.name'),
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'code',
      title: $t('tenant.management.code'),
      align: 'center',
    },
    {
      field: 'domain',
      title: $t('tenant.management.domain'),
      align: 'center',
    },
    {
      field: 'expireTime',
      title: $t('tenant.management.expireTime'),
      align: 'center',
    },
    {
      field: 'description',
      title: $t('tenant.management.description'),
      align: 'center',
    },
    {
      field: 'status',
      title: $t('tenant.management.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    // {
    //   field: 'adminUser',
    //   title: $t('tenant.management.adminUser'),
    //   align: 'center',
    // },
    {
      field: 'adminUsername',
      title: $t('tenant.management.adminUsername'),
      align: 'center',
    },
    {
      field: 'packageName',
      title: $t('tenant.management.packageId'),
      align: 'center',
    },
    {
      field: 'createUserString',
      title: $t('tenant.management.createUser'),
      align: 'center',
    },
    {
      field: 'createTime',
      title: $t('tenant.management.createTime'),
      slots: { default: 'createTime' },
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 280,
    },
  ];
}

// 重置密码表单
export function useRestTenantAdminUserPwdFormSchema(): VbenFormSchema[] {
  return [
    {
      label: $t('tenant.management.newPassword'),
      fieldName: 'password',
      component: 'VbenInputPassword',
      rules: 'required',
      dependencies: {
        triggerFields: ['id'],
        if: (values) => {
          return !values.id;
        },
      },
    },
  ];
}
