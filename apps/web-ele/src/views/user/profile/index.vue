<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { ElCol, ElRow } from 'element-plus';

import LeftBox from './BasicInfo.vue';
import PasswordPolicy from './Security.vue';
import RightBox from './Social.vue';

defineOptions({ name: 'UserProfile' });
</script>

<template>
  <Page style="height: 100%" class="gi-page">
    <div class="h-full w-full">
      <ElRow :gutter="24">
        <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="6" :xxl="6">
          <LeftBox />
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="16" :lg="16" :xl="18" :xxl="18">
          <div>
            <PasswordPolicy />
          </div>
          <div style="margin-top: 16px">
            <RightBox />
          </div>
        </ElCol>
      </ElRow>
    </div>
  </Page>
</template>
<style scoped>
.gi-page {
  background-color: hsl(var(--background));
}
</style>
