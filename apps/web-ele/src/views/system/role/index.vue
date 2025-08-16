<script setup lang="ts">
import { reactive } from 'vue';

import { ColPage } from '@vben/common-ui';

import RoleList from './left/index.vue';
import Details from './right/Details.vue';

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
    <Details />
  </ColPage>
</template>

<style scoped lang="scss"></style>
