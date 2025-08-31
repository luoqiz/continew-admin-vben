<script setup lang="ts">
import type { ElTreeV2, TreeNodeData } from 'element-plus';

import { nextTick, onMounted, ref } from 'vue';

import { ElInput } from 'element-plus';

import { useDept } from '#/hooks/app/useDept';

import { emitter } from '../mitt';

// 树引用
const treeRef = ref<InstanceType<typeof ElTreeV2>>();

const nodeClick = (data: TreeNodeData) => {
  emitter.emit('nodeClick', data);
};

// 查询树列表
const { deptList, getDeptList } = useDept({
  onSuccess: () => {
    nextTick(() => {
      treeRef.value?.setCurrentKey(deptList.value[0]?.key);
      nodeClick(treeRef.value?.getCurrentNode()!);
      treeRef.value?.setExpandedKeys([deptList.value[0]?.key]);
    });
  },
});

// 过滤树
const searchKey = ref('');

const onQueryChanged = (query: string) => {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  treeRef.value!.filter(query);
};

const filterMethod = (query: string, node: TreeNodeData) =>
  node.title!.includes(query);

const props = {
  value: 'key',
  label: 'title',
  children: 'children',
};

onMounted(() => {
  getDeptList();
});
</script>
<template>
  <ElCard class="elCard h-full w-full">
    <template #header>
      <div class="card-header">
        <span>{{ $t('system.user.deptTree') }} </span>
      </div>
    </template>
    <div class="flex h-full w-full flex-col">
      <ElInput
        v-model="searchKey"
        class="w-full"
        placeholder="Please enter keyword"
        @input="onQueryChanged"
      />
      <el-tree-v2
        ref="treeRef"
        class="w-full flex-1"
        :data="deptList"
        :props="props"
        :height="600"
        :check-on-click-node="true"
        @node-click="nodeClick"
        :filter-method="filterMethod"
      />
    </div>
  </ElCard>
</template>

<style lang="scss" scoped></style>
