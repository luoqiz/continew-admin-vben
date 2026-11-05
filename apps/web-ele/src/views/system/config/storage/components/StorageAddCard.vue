<script setup lang="ts">
import { $t } from '@vben/locales';

/**
 * 类型名称由父级传入（优先取字典标签），
 * 避免与分组标题使用不同来源导致文案不一致
 */
defineProps<{ label: string; type: number }>();

const emit = defineEmits<{
  (e: 'add', type: number): void;
}>();
</script>

<template>
  <button type="button" class="storage-add-card" @click="emit('add', type)">
    <span class="storage-add-card__icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
    <span class="storage-add-card__tip">
      {{ $t('system.storage.addCardTip', { type: label }) }}
    </span>
  </button>
</template>

<style scoped lang="scss">
.storage-add-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 216px;
  padding: 16px;
  cursor: pointer;
  background: transparent;
  border: 1px dashed hsl(var(--border));
  border-radius: 8px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &:hover {
    background: hsl(var(--accent) / 40%);
    border-color: hsl(var(--primary) / 60%);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 10%);
    border-radius: 50%;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  &__tip {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
