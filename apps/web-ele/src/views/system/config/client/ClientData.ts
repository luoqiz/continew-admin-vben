import type { VbenFormSchema } from '#/adapter/form'
import type { VxeTableGridOptions } from '#/adapter/vxe-table'

import { $t } from '#/locales'
import { useDict } from '#/hooks'

export function useClientEditFormSchema(): VbenFormSchema[] {
  const { client_type, auth_type_enum, replaced_range_enum, logout_mode_enum } = useDict('client_type', 'auth_type_enum', 'replaced_range_enum', 'logout_mode_enum')
  return [
    { label: $t('system.client.clientType') || '客户端类型', fieldName: 'clientType', component: 'ApiSelect', componentProps: { options: client_type?.value }, rules: 'required' },
    { label: $t('system.client.authType') || '认证类型', fieldName: 'authType', component: 'ApiSelect', componentProps: { options: auth_type_enum?.value, multiple: true }, rules: 'required' },
    { label: $t('system.client.activeTimeout') || 'Token最低活跃频率', fieldName: 'activeTimeout', component: 'InputNumber', componentProps: { min: -1 }, rules: 'required' },
    { label: $t('system.client.timeout') || 'Token有效期', fieldName: 'timeout', component: 'InputNumber', componentProps: { min: -1 }, rules: 'required' },
    { label: $t('system.client.isConcurrent') || '多地登录', fieldName: 'isConcurrent', component: 'Switch' },
    { label: $t('system.client.replacedRange') || '下线范围', fieldName: 'replacedRange', component: 'ApiSelect', componentProps: { options: replaced_range_enum?.value } },
    { label: $t('system.client.maxLoginCount') || '登录数量', fieldName: 'maxLoginCount', component: 'InputNumber', componentProps: { min: -1 } },
    { label: $t('system.client.overflowLogoutMode') || '溢出处理', fieldName: 'overflowLogoutMode', component: 'ApiSelect', componentProps: { options: logout_mode_enum?.value } },
    { label: $t('system.client.status') || '状态', fieldName: 'status', component: 'RadioGroup', componentProps: { options: [{ label: $t('common.enabled'), value: 1 }, { label: $t('common.disabled'), value: 2 }] } },
  ]
}

export function useClientGridSearchFormSchema(): VbenFormSchema[] {
  const { client_type } = useDict('client_type')
  return [
    { fieldName: 'clientType', label: $t('system.client.clientType') || '客户端类型', component: 'ApiSelect', componentProps: { options: client_type?.value } },
  ]
}

export function useClientGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    { field: 'clientId', title: $t('system.client.clientId'), align: 'center', fixed: 'left' },
    { field: 'clientType', title: $t('system.client.clientType'), align: 'center' },
    { field: 'authType', title: $t('system.client.authType'), align: 'center' },
    { field: 'activeTimeout', title: $t('system.client.activeTimeout'), align: 'center' },
    { field: 'timeout', title: $t('system.client.timeout'), align: 'center' },
    { field: 'isConcurrent', title: $t('system.client.isConcurrent'), align: 'center', slots: { default: 'isConcurrent' } },
    { field: 'status', title: $t('system.client.status'), align: 'center', slots: { default: 'status' } },
    { align: 'center', field: 'action', fixed: 'right', slots: { default: 'action' }, title: $t('common.operation'), width: 240 },
  ]
}
