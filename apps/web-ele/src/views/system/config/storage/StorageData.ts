import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { useDict } from '#/hooks';
import { $t } from '#/locales';

/** 与后端 RegexConstants.GENERAL_CODE 保持一致 */
const GENERAL_CODE = /^[a-zA-Z][a-zA-Z0-9_]{1,29}$/;

const MB = 1024 * 1024;

/** 后端分片参数以字节存储，表单以 MB 展示 */
export function bytesToMb(bytes?: null | number): number | undefined {
  return typeof bytes === 'number' && bytes > 0
    ? Number((bytes / MB).toFixed(2))
    : undefined;
}

export function mbToBytes(mb?: null | number): null | number {
  const value = Number(mb);
  return Number.isFinite(value) && value > 0 ? Math.round(value * MB) : null;
}

/** 字典项 value 可能是字符串，统一转数字比较 */
const isOss = (model: Record<string, any>) => Number(model.type) === 2;
const isLocal = (model: Record<string, any>) => Number(model.type) === 1;

/**
 * 字典接口返回的 value 是字符串，而详情接口 type 与表单默认值都是数字，
 * 直接作为 options 会让下拉框无法回显（新增显示空白、编辑也显示空白）。
 * 字典为空时给静态兜底，避免字典接口异常导致新增流程完全不可用。
 */
function toTypeOptions(
  items?: Array<{ label: string; value: number | string }>,
) {
  const options = (items ?? []).map((item) => ({
    ...item,
    value: Number(item.value),
  }));
  return options.length > 0
    ? options
    : [
        { label: $t('system.storage.localType'), value: 1 },
        { label: $t('system.storage.ossType'), value: 2 },
      ];
}

/** 分组标题：优先使用字典标签，字典未加载完成时回退到语言包 */
export function useStorageTypeMeta() {
  const { storage_type_enum } = useDict('storage_type_enum');

  function typeLabel(type: number) {
    const label = storage_type_enum?.value?.find(
      (item) => Number(item.value) === Number(type),
    )?.label;
    if (label) return label;
    if (Number(type) === 1) return $t('system.storage.localType');
    if (Number(type) === 2) return $t('system.storage.ossType');
    return String(type ?? '-');
  }

  return { typeLabel };
}

/**
 * 编辑表单
 *
 * @param isUpdate 修改态：编码 / 类型 / 回收站配置不可变更
 */
export function useStorageEditFormSchema(
  isUpdate: Ref<boolean>,
): VbenFormSchema[] {
  const { storage_type_enum } = useDict('storage_type_enum');

  return [
    {
      label: $t('system.storage.name'),
      fieldName: 'name',
      component: 'Input',
      componentProps: { maxlength: 100, showWordLimit: true },
      rules: 'required',
    },
    {
      label: $t('system.storage.code'),
      fieldName: 'code',
      component: 'Input',
      componentProps: () => ({
        disabled: isUpdate.value,
        maxlength: 30,
        placeholder: $t('system.storage.codePlaceholder'),
      }),
      rules: z
        .string({ error: $t('system.storage.codeEmpty') })
        .regex(GENERAL_CODE, $t('system.storage.codeRuleTip')),
    },
    {
      label: $t('system.storage.type'),
      fieldName: 'type',
      component: 'ApiSelect',
      componentProps: () => ({
        disabled: isUpdate.value,
        options: toTypeOptions(storage_type_enum?.value),
      }),
      defaultValue: 2,
      rules: 'selectRequired',
    },
    {
      label: $t('system.storage.accessKey'),
      fieldName: 'accessKey',
      component: 'Input',
      componentProps: { maxlength: 255 },
      rules: 'required',
      dependencies: { show: isOss, triggerFields: ['type'] },
    },
    {
      label: $t('system.storage.secretKey'),
      fieldName: 'secretKey',
      component: 'VbenInputPassword',
      componentProps: () => ({
        maxlength: 255,
        placeholder: isUpdate.value
          ? $t('system.storage.secretKeyEmptyTip')
          : '',
      }),
      dependencies: { show: isOss, triggerFields: ['type'] },
    },
    {
      label: $t('system.storage.endpoint'),
      fieldName: 'endpoint',
      component: 'Input',
      componentProps: { maxlength: 255 },
      rules: 'required',
      dependencies: { show: isOss, triggerFields: ['type'] },
    },
    {
      label: $t('system.storage.bucketName'),
      fieldName: 'bucketName',
      component: 'Input',
      componentProps: { maxlength: 255 },
      rules: 'required',
      dependencies: {
        triggerFields: ['type'],
        componentProps: (values) => ({
          placeholder:
            Number(values.type) === 1
              ? $t('system.storage.storagePath')
              : $t('system.storage.bucketName'),
        }),
      },
    },
    {
      label: $t('system.storage.domain'),
      fieldName: 'domain',
      component: 'Input',
      componentProps: { maxlength: 255 },
      dependencies: {
        triggerFields: ['type'],
        // 本地存储的访问路径必填，对象存储的自定义域名可留空
        rules: (values) => (Number(values.type) === 1 ? 'required' : null),
        componentProps: (values) => ({
          placeholder:
            Number(values.type) === 1
              ? $t('system.storage.accessPath')
              : $t('system.storage.domain'),
        }),
      },
    },
    {
      label: $t('system.storage.recycleBinEnabled'),
      fieldName: 'recycleBinEnabled',
      component: 'Switch',
      defaultValue: true,
      componentProps: () => ({
        disabled: isUpdate.value,
        activeValue: true,
        inactiveValue: false,
      }),
    },
    {
      label: $t('system.storage.recycleBinPath'),
      fieldName: 'recycleBinPath',
      component: 'Input',
      defaultValue: '.RECYCLE.BIN/',
      componentProps: () => ({ disabled: isUpdate.value }),
      rules: 'required',
      dependencies: {
        show: (model) => !!model.recycleBinEnabled,
        triggerFields: ['recycleBinEnabled'],
      },
    },
    {
      label: $t('system.storage.sort'),
      fieldName: 'sort',
      component: 'InputNumber',
      defaultValue: 999,
      componentProps: { min: 1 },
    },
    {
      label: $t('system.storage.description'),
      fieldName: 'description',
      component: 'Textarea',
      componentProps: { maxlength: 200, rows: 2, showWordLimit: true },
    },
    {
      label: $t('system.storage.status'),
      fieldName: 'status',
      component: 'RadioGroup',
      defaultValue: 2,
      componentProps: {
        options: [
          { label: $t('pages.common.enable'), value: 1 },
          { label: $t('pages.common.disable'), value: 2 },
        ],
      },
    },
    {
      // 高级配置默认折叠；组内字段校验失败时框架会自动展开
      name: 'advanced',
      type: 'group' as const,
      title: $t('system.storage.advanced'),
      collapsible: true,
      defaultCollapsed: true,
      children: [
        {
          label: $t('system.storage.multipartThreshold'),
          fieldName: 'multipartUploadThreshold',
          component: 'InputNumber',
          componentProps: {
            min: 1,
            precision: 2,
            placeholder: $t('system.storage.emptyDefault'),
          },
        },
        {
          label: $t('system.storage.multipartPartSize'),
          fieldName: 'multipartUploadPartSize',
          component: 'InputNumber',
          componentProps: {
            precision: 2,
            placeholder: $t('system.storage.emptyDefault'),
          },
          // 对象存储分片不得小于 5MB，与后端 StorageTypeEnum.OSS 校验保持一致。
          // 只能放在 dependencies 里：直接写在 componentProps 上的函数只会收到 { fieldName }，
          // 拿不到 type，min 会永远停在 1
          dependencies: {
            triggerFields: ['type'],
            componentProps: (values) => ({
              min: Number(values?.type) === 2 ? 5 : 1,
            }),
          },
        },
        {
          label: $t('system.storage.multipartTempDir'),
          fieldName: 'multipartTempDir',
          component: 'Input',
          componentProps: {
            maxlength: 255,
            placeholder: $t('system.storage.emptyDefault'),
          },
          dependencies: { show: isLocal, triggerFields: ['type'] },
        },
      ],
    },
  ];
}
