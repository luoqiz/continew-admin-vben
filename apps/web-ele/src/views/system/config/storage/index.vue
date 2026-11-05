<script setup lang="ts">
import type { StorageQuery, StorageResp } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElButton,
  ElEmpty,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSpace,
  ElTabPane,
  ElTabs,
} from 'element-plus';

import {
  deleteStorage,
  listStorage,
  setDefaultStorage,
  updateStorageStatus,
} from '#/api';
import has from '#/utils/has';

import StorageEditDrawer from './AddModal.vue';
import StorageAddCard from './components/StorageAddCard.vue';
import StorageCard from './components/StorageCard.vue';
import { useStorageTypeMeta } from './StorageData';

const { typeLabel } = useStorageTypeMeta();
const canCreate = computed(() => has.hasPermOr(['system:storage:create']));

/** all / 1（本地存储）/ 2（对象存储），与旧版 UI 的 tab 行为一致 */
const activeTab = ref('all');
const keyword = ref('');
const loading = ref(false);
const list = ref<StorageResp[]>([]);

const groups = computed(() => {
  const types = activeTab.value === 'all' ? [1, 2] : [Number(activeTab.value)];
  return types.map((type) => ({
    type,
    title: typeLabel(type),
    items: list.value.filter((item) => Number(item.type) === type),
  }));
});

/** 请求序号：快速切换 tab 或连续搜索时，晚到的旧响应不能覆盖新结果 */
let listRequestId = 0;

async function loadData() {
  const requestId = ++listRequestId;
  loading.value = true;
  try {
    const query: StorageQuery = {};
    const description = keyword.value.trim();
    if (description) query.description = description;
    if (activeTab.value !== 'all') query.type = Number(activeTab.value);
    const res = await listStorage(query);
    if (requestId !== listRequestId) return;
    // 列表接口返回全量数据且无稳定顺序：优先按人工排序值升序，
    // 相同排序值时按创建时间倒序，让新配置排在同组靠前位置
    list.value = (res ?? []).toSorted(
      (a, b) =>
        (a.sort ?? 0) - (b.sort ?? 0) ||
        String(b.createTime ?? '').localeCompare(String(a.createTime ?? '')),
    );
  } catch {
    // 列表请求失败时由全局拦截器提示，保留已有数据且不让上层动作误判为失败
  } finally {
    if (requestId === listRequestId) loading.value = false;
  }
}

watch(activeTab, () => loadData());
onMounted(loadData);

const [EditorDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: StorageEditDrawer,
  destroyOnClose: true,
});

function handleAdd(type: number) {
  drawerApi.setData({ type });
  drawerApi.open();
}

function handleEdit(row: StorageResp) {
  drawerApi.setData({ id: row.id });
  drawerApi.open();
}

async function confirmAction(message: string, danger = false) {
  try {
    await ElMessageBox.confirm(message, $t('pages.common.tip'), {
      confirmButtonClass: danger ? 'el-button--danger' : undefined,
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    });
    return true;
  } catch {
    return false;
  }
}

async function handleSetDefault(row: StorageResp, status: number) {
  if (row.isDefault) {
    ElMessage.warning($t('system.storage.alreadyDefault'));
    return;
  }
  if (status === 2) {
    ElMessage.warning($t('system.storage.disabledToDefault'));
    return;
  }
  const confirmed = await confirmAction(
    $t('system.storage.defaultConfirm', { name: row.name, code: row.code }),
  );
  if (!confirmed) return;
  try {
    await setDefaultStorage(row.id);
  } catch {
    return;
  }
  ElMessage.success($t('pages.common.modifySuccess'));
  await loadData();
}

async function handleDelete(row: StorageResp) {
  if (row.isDefault) {
    ElMessage.warning($t('system.storage.defaultDisabledDelete'));
    return;
  }
  const confirmed = await confirmAction(
    $t('system.storage.deleteConfirm', { name: row.name, code: row.code }),
    true,
  );
  if (!confirmed) return;
  try {
    await deleteStorage(row.id);
  } catch {
    return;
  }
  ElMessage.success($t('pages.common.deleteSuccess'));
  await loadData();
}

/** ElSwitch 的 before-change 钩子：确认后调用接口，返回 false 时不切换 */
async function handleStatusChange(row: StorageResp, nextStatus: number) {
  if (!has.hasPermOr(['system:storage:updateStatus']) || row.isDefault) {
    return false;
  }
  const action =
    nextStatus === 1
      ? $t('system.storage.enableAction')
      : $t('system.storage.disableAction');
  const confirmed = await confirmAction(
    $t('system.storage.statusConfirm', {
      action,
      name: row.name,
      code: row.code,
    }),
  );
  if (!confirmed) return false;
  try {
    await updateStorageStatus({ status: nextStatus }, row.id);
    // 同步父级列表状态，避免卡片与列表数据不一致；
    // 状态只影响开关本身，无需整表重新拉取
    row.status = nextStatus;
    ElMessage.success(
      nextStatus === 1
        ? $t('common.enabledSuccess')
        : $t('common.disabledSuccess'),
    );
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <div v-loading="loading" class="storage-config">
    <div class="storage-config__toolbar">
      <span class="storage-config__title">
        {{ $t('system.storage.listTitle') }}
      </span>
      <ElSpace :size="8">
        <ElInput
          v-model="keyword"
          clearable
          class="storage-config__search"
          :placeholder="$t('system.storage.keyword')"
          @keyup.enter="loadData"
          @clear="loadData"
        />
        <ElButton @click="loadData">{{ $t('common.search') }}</ElButton>
        <ElButton @click="loadData">{{ $t('common.refresh') }}</ElButton>
      </ElSpace>
    </div>

    <ElTabs v-model="activeTab" class="storage-config__tabs">
      <ElTabPane name="all" :label="$t('system.storage.tabAll')" />
      <ElTabPane name="1" :label="$t('system.storage.localType')" />
      <ElTabPane name="2" :label="$t('system.storage.ossType')" />
    </ElTabs>

    <div
      v-for="group in groups"
      :key="group.type"
      class="storage-config__group"
    >
      <div class="storage-config__group-title">
        <span class="storage-config__group-bar"></span>
        {{ group.title }}
        <span class="storage-config__group-count">
          ({{ group.items.length }})
        </span>
      </div>

      <div class="storage-config__grid">
        <StorageAddCard
          v-if="canCreate"
          :label="group.title"
          :type="group.type"
          @add="handleAdd"
        />
        <StorageCard
          v-for="item in group.items"
          :key="item.id"
          :data="item"
          :before-status-change="(next) => handleStatusChange(item, next)"
          @edit="handleEdit"
          @set-default="handleSetDefault"
          @delete="handleDelete"
        />
        <ElEmpty
          v-if="!canCreate && group.items.length === 0"
          class="storage-config__empty"
          :description="$t('system.storage.emptyTip')"
          :image-size="72"
        />
      </div>
    </div>

    <EditorDrawer @success="loadData" />
  </div>
</template>

<style scoped lang="scss">
.storage-config {
  padding-bottom: 8px;

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__search {
    width: 220px;
  }

  &__tabs {
    margin-top: 4px;

    :deep(.el-tabs__content) {
      display: none;
    }
  }

  &__group {
    margin-top: 20px;
  }

  &__group-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__group-bar {
    width: 3px;
    height: 14px;
    background: hsl(var(--primary));
    border-radius: 2px;
  }

  &__group-count {
    font-size: 12px;
    font-weight: 400;
    color: hsl(var(--muted-foreground));
  }

  &__grid {
    display: grid;

    /* 窄屏下卡片自适应，避免 320px 固定最小宽度撑破容器 */
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
    gap: 16px;
  }

  &__empty {
    grid-column: 1 / -1;
  }
}
</style>
