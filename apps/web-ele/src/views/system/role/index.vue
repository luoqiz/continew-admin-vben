<script setup lang="ts">
import { reactive } from 'vue';

import { ColPage } from '@vben/common-ui';

import RoleList from './left/index.vue';
import Permission from './right/Permission.vue';

defineOptions({ name: 'SystemDict' });
const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 50,
  leftMinWidth: 20,
  leftWidth: 50,
  resizable: true,
  rightWidth: 50,
  splitHandle: false,
  splitLine: false,
});
</script>

<template>
  <ColPage auto-content-height v-bind="props">
    <template #left>
      <RoleList />
    </template>
    <Permission />
  </ColPage>
</template>

<style scoped lang="scss"></style>
