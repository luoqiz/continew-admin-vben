<script setup lang="ts">
import { reactive } from 'vue';

import { ColPage } from '@vben/common-ui';

import RightDictItemList from './data/RightDictItemList.vue';
import LeftDictList from './type/LeftDictList.vue';

defineOptions({ name: 'SystemDict' });
const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 50,
  leftMinWidth: 20,
  leftWidth: 50,
  resizable: true,
  rightWidth: 50,
  splitHandle: true,
  splitLine: true,
});
</script>

<template>
  <ColPage auto-content-height v-bind="props">
    <template #left>
      <LeftDictList />
    </template>
    <RightDictItemList />
  </ColPage>
</template>

<style scoped lang="scss"></style>
