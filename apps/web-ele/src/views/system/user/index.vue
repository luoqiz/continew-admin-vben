<script setup lang="ts">
import { reactive } from 'vue';

import { ColPage } from '@vben/common-ui';

import DeptTree from './left/index.vue';
import UserListPage from './right/index.vue';

defineOptions({ name: 'SystemDict' });
const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 50,
  leftMinWidth: 20,
  leftWidth: 20,
  resizable: true,
  rightWidth: 80,
  splitHandle: false,
  splitLine: false,
});
</script>

<template>
  <ColPage auto-content-height v-bind="props">
    <template #left>
      <DeptTree />
    </template>
    <UserListPage />
  </ColPage>
</template>

<style scoped lang="scss"></style>
