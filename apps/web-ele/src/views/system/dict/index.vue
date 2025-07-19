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
  splitHandle: false,
  splitLine: false,
});
</script>

<template>
  <ColPage auto-content-height v-bind="props">
    <template #left>
      <LeftDictList />
    </template>
    <RightDictItemList />
    <!-- <a-row align="stretch" :gutter="14" class="page_content h-full">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24" flex="1" class="h-full overflow-hidden">
        <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
          :scroll="{ x: '100%', y: '100%', minWidth: 600 }" :pagination="pagination" :disabled-tools="['size']"
          :disabled-column-keys="['label']" @refresh="search">
          <template #toolbar-left>
            <a-input-search v-model="queryForm.description" placeholder="搜索标签/描述" allow-clear @search="search" />
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </template>
          <template #toolbar-right>
            <a-button v-permission="['system:dict:item:create']" type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              <template #default>新增</template>
            </a-button>
            <a-button v-permission="['system:dict:item:clearCache']" type="outline" status="warning"
              @click="onClearCache">
              <template #icon><icon-delete /></template>
              <template #default>清除缓存</template>
            </a-button>
          </template>
          <template #label="{ record }">
            <a-tag v-if="record.color === 'primary'" color="arcoblue">
              {{ record.label }}
            </a-tag>
            <a-tag v-else-if="record.color === 'success'" color="green">
              {{ record.label }}
            </a-tag>
            <a-tag v-else-if="record.color === 'warning'" color="orangered">
              {{ record.label }}
            </a-tag>
            <a-tag v-else-if="record.color === 'error'" color="red">
              {{ record.label }}
            </a-tag>
            <a-tag v-else-if="record.color === 'default'" color="gray">
              {{ record.label }}
            </a-tag>
            <span v-else>{{ record.label }}</span>
          </template>
          <template #status="{ record }">
            <GiCellStatus :status="record.status" />
          </template>
          <template #action="{ record }">
            <a-space>
              <a-link v-permission="['system:dict:item:update']" title="修改" @click="onUpdate(record)">
                修改
              </a-link>
              <a-link v-permission="['system:dict:item:delete']" status="danger" title="删除" @click="onDelete(record)">
                删除
              </a-link>
            </a-space>
          </template>
        </GiTable>
      </a-col>
    </a-row> -->
  </ColPage>
</template>

<style scoped lang="scss"></style>
