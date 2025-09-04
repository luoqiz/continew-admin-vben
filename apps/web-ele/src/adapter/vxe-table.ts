import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentType } from './component/index';

import { h, isRef } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { get, isFunction, isString, isValidColor } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import { ElButton, ElImage, ElPopconfirm, ElSwitch, ElTag } from 'element-plus';
import { isArray } from 'xe-utils';

import { $t } from '#/locales';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'list',
            total: 'total',
            list: 'list',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    /**
     * 解决vxeTable在热更新时可能会出错的问题
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        return h(ElImage, { src: row[column.field] });
      },
    });

    // 单元格是否渲染： Tag
    vxeUI.renderer.add('CellYesNoTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ?? [
          { type: 'success', label: $t('common.yes'), value: true },
          { type: 'danger', label: $t('common.no'), value: false },
        ];
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          ElTag,
          {
            ...props,
            ...objectOmit(tagItem ?? {}, ['label']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    // 单元格是否渲染： Tag
    vxeUI.renderer.add('CellYesNoNumberTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ?? [
          { type: 'success', label: $t('common.yes'), value: 1 },
          { type: 'danger', label: $t('common.no'), value: 0 },
        ];
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          ElTag,
          {
            ...props,
            ...objectOmit(tagItem ?? {}, ['label']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    // 单元格渲染字典： Tag
    vxeUI.renderer.add('CellDictTag', {
      renderTableDefault({ attrs, props }, { column, row }) {
        let value = get(row, column.field);
        if (isRef(attrs?.options)) {
          // 如果是 ref 类型，直接取值
          attrs.options = attrs.options.value;
        }
        const tagOptions = (attrs?.options as App.DictItem[]) ?? [
          { type: 'success', label: $t('common.enabled'), value: 1 },
          { type: 'danger', label: $t('common.disabled'), value: 0 },
        ];
        if (!isArray(value)) {
          value = [value];
        }

        let type: 'danger' | 'info' | 'primary' | 'success' | 'warning' =
          'success';

        const res: any[] = [];
        value.forEach((item: any) => {
          let color;
          const tagItem = tagOptions.find((tag) => tag.value === item);
          if (tagItem) {
            color = tagItem.extra;
          }
          if (isValidColor(tagItem?.extra)) {
            color = tagItem?.extra;
          } else if (
            tagItem?.extra === 'primary' ||
            tagItem?.extra === 'success' ||
            tagItem?.extra === 'warning' ||
            tagItem?.extra === 'info' ||
            tagItem?.extra === 'danger'
          ) {
            type = tagItem.extra;
          }
          res.push(
            h(
              ElTag,
              {
                ...props,
                ...tagItem,
                type,
                color,
              },
              { default: () => tagItem?.label ?? value },
            ),
          );
        });
        const className =
          attrs?.class ?? 'flex flex-row gap-2 items-center justify-center';
        return h(
          'div',
          { class: className },
          {
            default: () => res,
          },
        );
      },
    });

    // 单元格渲染： Tag
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ??
          (props?.options as App.DictItem[]) ?? [
            { type: 'success', label: $t('common.enabled'), value: 1 },
            { type: 'danger', label: $t('common.disabled'), value: 0 },
          ];
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          ElTag,
          {
            ...props,
            ...objectOmit(tagItem ?? {}, ['label']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const loadingKey = `__loading_${column.field}`;
        const finallyProps = {
          activeText: $t('common.enabled'),
          activeValue: 1,
          inactiveText: $t('common.disabled'),
          inactiveValue: 0,
          ...props,
          modelValue: row[column.field],
          loading: row[loadingKey] ?? false,
          'onUpdate:modelValue': onChange,
        };
        async function onChange(newVal: any) {
          row[loadingKey] = true;
          try {
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
          } finally {
            row[loadingKey] = false;
          }
        }
        return h(ElSwitch, finallyProps);
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          ElButton,
          { size: 'small', link: true },
          { default: () => props?.text },
        );
      },
    });

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = {
          size: 'small',
          type: 'primary',
          link: true,
          ...props,
        };
        let align = 'end';
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: {
            type: 'danger',
            text: $t('common.delete'),
          },
          edit: {
            text: $t('common.edit'),
          },
        };
        const operations: Array<Recordable<any>> = (
          options || ['edit', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                    code: opt,
                    text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                    ...defaultProps,
                  };
            } else {
              return { ...defaultProps, ...presets[opt.code], ...opt };
            }
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            ElButton,
            {
              ...props,
              ...opt,
              icon: undefined,
              onClick: listen
                ? () =>
                    attrs?.onClick?.({
                      code: opt.code,
                      row,
                    })
                : undefined,
            },
            {
              default: () => {
                const content = [];
                if (opt.icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-5', icon: opt.icon }),
                  );
                }
                content.push(opt.text);
                return content;
              },
            },
          );
        }

        function renderConfirm(opt: Recordable<any>) {
          return h(
            ElPopconfirm,
            {
              title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
              confirmButtonText: $t('common.confirm'),
              cancelButtonText: $t('common.cancel'),
              ...props,
              ...opt,
              icon: undefined,
              onConfirm: () => {
                attrs?.onClick?.({
                  code: opt.code,
                  row,
                });
              },
            },
            {
              reference: () => renderBtn({ ...opt }, false),
            },
          );
        }

        const btns = operations.map((opt) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        );
        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType>>
) => useGrid<T, ComponentType>(...rest);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;
export type * from '@vben/plugins/vxe-table';
