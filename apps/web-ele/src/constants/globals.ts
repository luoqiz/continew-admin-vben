import { computed } from 'vue';

import { $t } from '@vben/locales';

export const yesNoOptions = computed(() => [
  { label: $t('common.yes'), value: true },
  { label: $t('common.no'), value: false },
]);

export const enabledDisabledOptions = computed(() => [
  { label: $t('common.enabled'), value: 1 },
  { label: $t('common.disabled'), value: 2 },
]);
