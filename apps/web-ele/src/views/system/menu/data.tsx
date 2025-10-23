import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { VbenIcon, z } from '@vben/common-ui';

import { enabledDisabledOptions, yesNoOptions } from '#/constants';
import { $t } from '#/locales';

// 菜单类型（M目录 C菜单 F按钮）
export const menuTypeOptions = [
  { label: '目录', value: 1 },
  { label: '菜单', value: 2 },
  { label: '按钮', value: 3 },
];

// 字典类型表单
export function useMenuFormSchema(): VbenFormSchema[] {
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
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: menuTypeOptions,
        optionType: 'button',
      },
      defaultValue: 1,
      dependencies: {
        componentProps: (model, api) => {
          // 切换时清空校验
          // 直接抄的源码 没有清空校验的方法
          Object.keys(api.errors.value).forEach((key) => {
            api.setFieldError(key, undefined);
          });
          return {
            disabled: !!model.id,
          };
        },

        triggerFields: ['id'],
      },
      fieldName: 'type',
      label: '菜单类型',
    },
    {
      component: 'TreeSelect',
      defaultValue: 0,
      fieldName: 'parentId',
      label: '上级菜单',
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '菜单名称',
      help: '支持i18n写法, 如: menu.system.user',
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: {
        // 类型不为按钮时显示
        show: (values) => values.type !== 3,
        triggerFields: ['type'],
      },
      renderComponentContent: (model) => ({
        addonBefore: () => <VbenIcon icon={model.icon} />,
        addonAfter: () => (
          <a href="https://icon-sets.iconify.design/" target="_blank">
            搜索图标
          </a>
        ),
      }),
      fieldName: 'icon',
      help: '点击搜索图标跳转到iconify & 粘贴',
      label: '菜单图标',
    },
    {
      component: 'Input',
      componentProps: (model) => {
        const placeholder =
          model.isExternal === false
            ? '填写链接地址http(s)://  使用新页面打开'
            : '填写`路由地址`或者`链接地址`  链接默认使用内部iframe内嵌打开';
        return {
          placeholder,
        };
      },
      dependencies: {
        rules: (model) => {
          if (model.isExternal !== false) {
            return z
              .string({ message: '请输入路由地址' })
              .min(1, '请输入路由地址')
              .refine((val) => !val.startsWith('http'), {
                message: '路由地址不需要带http',
              });
          }
          if (model.isExternal) {
            // 为链接
            return z
              .string({ message: '请输入链接地址' })
              .regex(/^https?:\/\//, { message: '请输入正确的链接地址' });
          }
          return z.string({ message: '请输入链接地址' });
        },
        // 类型不为按钮时显示
        show: (values) => values?.type !== 3,
        triggerFields: ['isExternal', 'type'],
      },
      fieldName: 'path',
      help: `路由地址不带/, 如: menu, user\n 链接为http(s)://开头\n 链接默认使用内部iframe打开, 可通过{是否外链}控制打开方式`,
      label: '路由地址',
    },
    {
      component: 'Input',
      fieldName: 'redirect',
      label: '重定向',
      help: '支持i18n写法, 如: menu.system.user',
      // rules: 'required',
      dependencies: {
        // 类型不为按钮时显示
        show: (values) => values?.type !== 3,
        triggerFields: ['type'],
      },
    },
    {
      component: 'Input',
      componentProps: (model) => {
        return {
          // 为链接时组件disabled
          disabled: model.isExternal === false,
        };
      },
      defaultValue: '',
      dependencies: {
        rules: (model) => {
          // 非链接时为必填项
          if (model.path && !/^https?:\/\//.test(model.path)) {
            return z
              .string()
              .min(1, { message: '非链接时必填组件路径' })
              .refine((val) => !val.startsWith('/') && !val.endsWith('/'), {
                message: '组件路径开头/末尾不需要带/',
              });
          }
          // 为链接时非必填
          return z.string().optional();
        },
        // 类型为菜单时显示
        show: (values) => values.type === 2,
        triggerFields: ['type', 'path'],
      },
      fieldName: 'component',
      help: '填写./src/views下的组件路径, 如system/menu/index',
      label: '组件路径',
    },
    {
      component: 'Input',
      componentProps: (model) => {
        return {
          // 为链接时组件disabled
          disabled: model.isExternal === false,
        };
      },
      defaultValue: '',
      dependencies: {
        // 类型为菜单时显示
        show: (values) => values.type === 2,
        triggerFields: ['type', 'path'],
      },
      fieldName: 'name',
      help: '填写./src/views下的组件名称, 如MenuComponent',
      label: '组件名称',
    },
    {
      component: 'Input',
      dependencies: {
        // 类型为菜单/按钮时显示
        show: (values) => values.type !== 1,
        triggerFields: ['type'],
      },
      fieldName: 'permission',
      help: `控制器中定义的权限字符\n 如: @SaCheckPermission("system:user:import")`,
      label: '权限标识',
    },
    {
      component: 'Input',
      componentProps: (model) => ({
        // 为链接时组件disabled
        disabled: model.isExternal === false,
        placeholder: '必须为json字符串格式',
      }),
      dependencies: {
        // 类型为菜单时显示
        show: (values) => values.type === 2,
        triggerFields: ['type'],
      },
      fieldName: 'queryParam',
      help: 'vue-router中的query属性\n 如{"name": "xxx", "age": 16}',
      label: '路由参数',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      help: '排序, 数字越小越靠前',
      label: '显示排序',
      defaultValue: 0,
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: yesNoOptions,
        optionType: 'button',
      },
      // defaultValue: false,
      dependencies: {
        // 类型不为按钮时显示
        show: (values) => values.type === 2,
        triggerFields: ['type'],
      },
      fieldName: 'isExternal',
      help: '外链为http(s)://开头\n 选择否时, 使用iframe从内部打开页面, 否则新窗口打开',
      label: '是否外链',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: yesNoOptions,
        optionType: 'button',
      },
      defaultValue: false,
      dependencies: {
        // 类型不为按钮时显示
        show: (values) => values.type !== 3,
        triggerFields: ['type'],
      },
      fieldName: 'isHidden',
      help: '隐藏后不会出现在菜单栏, 但仍然可以访问',
      label: '是否隐藏',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: yesNoOptions,
        optionType: 'button',
      },
      defaultValue: false,
      dependencies: {
        // 类型为菜单时显示
        show: (values) => values.type === 2,
        triggerFields: ['type'],
      },
      fieldName: 'isCache',
      help: '路由的keepAlive属性',
      label: '是否缓存',
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
export function useMenuSearchFormFields(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.menu.name'),
    },
  ];
}

// 字典类型表格字段配置
export function useMenuColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 80, fixed: 'left' },
    {
      title: $t('system.menu.name'),
      field: 'title',
      treeNode: true,
      width: 200,
      fixed: 'left',
    },
    {
      title: $t('system.menu.type'),
      field: 'type',
      slots: { default: 'type' },
      width: 80,
    },
    {
      title: $t('system.menu.status'),
      field: 'status',
      slots: { default: 'status' },
      width: 80,
    },
    {
      title: $t('system.menu.sort'),
      field: 'sort',
      width: 60,
    },
    {
      title: $t('system.menu.path'),
      field: 'path',
      width: 150,
    },
    {
      title: $t('system.menu.name'),
      field: 'name',
      width: 150,
    },
    {
      title: $t('system.menu.component'),
      field: 'component',
      width: 150,
    },
    {
      title: $t('system.menu.permission'),
      field: 'permission',
      width: 150,
    },
    {
      title: $t('system.menu.isExternal'),
      field: 'isExternal',
      slots: { default: 'isExternal' },
      width: 60,
    },
    {
      title: $t('system.menu.isHidden'),
      field: 'isHidden',
      slots: { default: 'isHidden' },
      width: 60,
    },

    {
      title: $t('system.menu.isCache'),
      field: 'isCache',
      slots: { default: 'isCache' },
      width: 60,
    },
    {
      title: $t('system.menu.createUserString'),
      field: 'createUserString',
      width: 150,
    },
    {
      title: $t('system.menu.createTime'),
      field: 'createTime',
      width: 150,
    },
    {
      title: $t('system.menu.updateUserString'),
      field: 'updateUserString',
      width: 150,
    },
    {
      title: $t('system.menu.updateTime'),
      field: 'updateTime',
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
