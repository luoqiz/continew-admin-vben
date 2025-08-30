<script setup lang="ts">
import { Card, CardContent, Page } from '@vben/common-ui';

import { ElTabPane, ElTabs } from 'element-plus';

import LoginLogList from './login/index.vue';
import OperationLogList from './operation/index.vue';
</script>
<template>
  <Page auto-content-height>
    <Card class="flex h-full w-full flex-col">
      <CardContent class="flex-1 overflow-auto">
        <ElTabs class="h-full">
          <ElTabPane :label="$t('monitor.loginLog.title')" class="h-full">
            <LoginLogList />
          </ElTabPane>
          <ElTabPane :label="$t('monitor.operationLog.title')" class="h-full">
            <OperationLogList />
          </ElTabPane>
        </ElTabs>
      </CardContent>
    </Card>
  </Page>
</template>
<style lang="scss" scoped></style>
