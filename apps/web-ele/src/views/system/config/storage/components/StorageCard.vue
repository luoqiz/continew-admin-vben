<script setup lang="ts">
import type { StorageResp } from '#/api';

import { computed, ref, watch } from 'vue';

import { SvgCopyIcon, SvgMoreVerticalIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { useClipboard } from '@vueuse/core';
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElSwitch,
  ElTag,
  ElTooltip,
} from 'element-plus';

import has from '#/utils/has';

interface Props {
  data: StorageResp;
  beforeStatusChange: (next: number) => Promise<boolean>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [row: StorageResp];
  edit: [row: StorageResp];
  /**
   * 状态由卡片自持，父级列表里的 status 可能是切换前的旧值，
   * 因此把当前状态一并传出，避免父级按旧值误判。
   */
  setDefault: [row: StorageResp, status: number];
}>();

/** 状态由卡片自持：切换成功后立即更新，列表刷新时再与服务端对齐 */
const localStatus = ref(props.data.status);
watch(
  () => props.data.status,
  (value) => {
    localStatus.value = value;
  },
);

interface CardField {
  label: string;
  value: string;
  copyable?: boolean;
}

const isLocal = computed(() => Number(props.data.type) === 1);
const nextStatus = computed(() => (localStatus.value === 1 ? 2 : 1));
const canManage = computed(() =>
  has.hasPermOr([
    'system:storage:setDefault',
    'system:storage:update',
    'system:storage:delete',
  ]),
);
const canSetDefault = computed(() =>
  has.hasPermOr(['system:storage:setDefault']),
);
const canUpdate = computed(() => has.hasPermOr(['system:storage:update']));
const canDelete = computed(() => has.hasPermOr(['system:storage:delete']));
const canUpdateStatus = computed(() =>
  has.hasPermOr(['system:storage:updateStatus']),
);

/** 卡片字段按存储类型展示，与旧版 UI 的 StorageLocal / StorageOss 对齐 */
const fields = computed<CardField[]>(() => {
  const data = props.data;
  const typeFields: CardField[] = isLocal.value
    ? [
        { label: $t('system.storage.storagePath'), value: data.bucketName },
        { label: $t('system.storage.accessPath'), value: data.domain },
      ]
    : [
        {
          label: $t('system.storage.accessKey'),
          value: data.accessKey,
          copyable: true,
        },
        { label: $t('system.storage.endpoint'), value: data.endpoint },
        { label: $t('system.storage.bucket'), value: data.bucketName },
        { label: $t('system.storage.customDomain'), value: data.domain },
      ];
  return [
    ...typeFields,
    {
      label: $t('system.storage.recycleBinEnabled'),
      value: data.recycleBinEnabled ? $t('common.yes') : $t('common.no'),
    },
    { label: $t('system.storage.recycleBinPath'), value: data.recycleBinPath },
  ];
});

const { copy, isSupported } = useClipboard();
async function onCopy(value: string) {
  if (!value) return;
  // 非安全上下文（如 http 内网）下剪贴板不可用，需按真实结果提示
  if (!isSupported.value) {
    ElMessage.error($t('system.storage.copyFailed'));
    return;
  }
  try {
    await copy(value);
    ElMessage.success($t('system.storage.copySuccess'));
  } catch {
    // 剪贴板被浏览器或权限策略拒绝时不能提示成功
    ElMessage.error($t('system.storage.copyFailed'));
  }
}

async function onBeforeStatusChange() {
  // 先固定目标值再等待：父级成功后会同步 data.status，watch 会把 localStatus 改掉，
  // 此时再读 nextStatus 已经反转，会把刚切好的状态又改回去（切换成功但界面不生效）
  const target = nextStatus.value;
  const changed = await props.beforeStatusChange(target);
  if (changed) localStatus.value = target;
  return changed;
}
</script>

<template>
  <div class="storage-card">
    <div class="storage-card__head">
      <div class="storage-card__title">
        <span class="storage-card__name">{{ data.name }}</span>
        <span class="storage-card__code">({{ data.code }})</span>
        <ElTag v-if="data.isDefault" type="success" size="small" effect="light">
          {{ $t('system.storage.defaultTag') }}
        </ElTag>
      </div>

      <ElDropdown v-if="canManage" trigger="click" placement="bottom-end">
        <ElButton link class="storage-card__more" :title="$t('common.more')">
          <SvgMoreVerticalIcon class="storage-card__more-icon" />
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-if="canSetDefault"
              :disabled="data.isDefault || localStatus === 2"
              :title="
                data.isDefault
                  ? $t('system.storage.alreadyDefault')
                  : localStatus === 2
                    ? $t('system.storage.disabledToDefault')
                    : ''
              "
              @click="emit('setDefault', data, localStatus)"
            >
              {{ $t('system.storage.setDefault') }}
            </ElDropdownItem>
            <ElDropdownItem v-if="canUpdate" @click="emit('edit', data)">
              {{ $t('pages.common.edit') }}
            </ElDropdownItem>
            <ElDropdownItem
              v-if="canDelete"
              divided
              :disabled="data.isDefault"
              :title="
                data.isDefault ? $t('system.storage.defaultDisabledDelete') : ''
              "
              @click="emit('delete', data)"
            >
              {{ $t('pages.common.delete') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>

    <div class="storage-card__time">{{ data.createTime }}</div>

    <div class="storage-card__body">
      <div v-for="field in fields" :key="field.label" class="storage-card__row">
        <span class="storage-card__label">{{ field.label }}</span>
        <ElTooltip
          :content="field.value || '-'"
          :disabled="!field.value"
          placement="top"
          :show-after="400"
        >
          <span class="storage-card__value">{{ field.value || '-' }}</span>
        </ElTooltip>
        <ElButton
          v-if="field.copyable && field.value"
          link
          class="storage-card__copy"
          :title="$t('system.storage.copy')"
          @click="onCopy(field.value)"
        >
          <SvgCopyIcon class="storage-card__copy-icon" />
        </ElButton>
      </div>
    </div>

    <div class="storage-card__foot">
      <span
        class="storage-card__status-text"
        :class="{ 'is-enabled': localStatus === 1 }"
      >
        {{ localStatus === 1 ? $t('common.enabled') : $t('common.disabled') }}
      </span>
      <ElSwitch
        :model-value="localStatus"
        :active-value="1"
        :inactive-value="2"
        :disabled="!canUpdateStatus || data.isDefault"
        :title="
          data.isDefault ? $t('system.storage.defaultDisabledStatus') : ''
        "
        :before-change="onBeforeStatusChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.storage-card {
  display: flex;
  flex-direction: column;
  min-height: 216px;
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: hsl(var(--primary) / 45%);
    box-shadow: 0 4px 14px hsl(var(--foreground) / 8%);
  }

  &__head {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__title {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: hsl(var(--foreground));
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__code {
    font-size: 12px;
    font-weight: 400;
    color: hsl(var(--muted-foreground));
  }

  &__more {
    flex-shrink: 0;
    padding: 0;
    color: hsl(var(--muted-foreground));

    :deep(.storage-card__more-icon) {
      width: 16px;
      height: 16px;
    }
  }

  &__time {
    margin-top: 2px;
    font-size: 12px;
    line-height: 18px;
    color: hsl(var(--muted-foreground));
  }

  &__body {
    flex: 1;
    margin-top: 12px;
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    min-width: 0;
    font-size: 12px;
    line-height: 21px;
  }

  &__label {
    flex-shrink: 0;
    width: 86px;
    color: hsl(var(--muted-foreground));
  }

  &__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: hsl(var(--foreground));
    white-space: nowrap;
  }

  &__copy {
    flex-shrink: 0;
    padding: 0;
    color: hsl(var(--muted-foreground));

    :deep(.storage-card__copy-icon) {
      width: 14px;
      height: 14px;
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    margin-top: 8px;
    border-top: 1px solid hsl(var(--border) / 70%);
  }

  &__status-text {
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    &.is-enabled {
      color: var(--el-color-success);
    }
  }
}
</style>
