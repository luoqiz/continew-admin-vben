<script setup lang="ts">
import type { MessageResp } from '#/api/system';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { getUserMessage } from '#/api/system/user-message';

import AiEditor from './view/components/index.vue';

defineOptions({ name: 'NoticePopup' });

const emit = defineEmits<{
  close: [];
}>();

const contentLoading = ref(false);

const currentMessage = ref<MessageResp>();

const currentNoticeContent = computed(() => {
  return currentMessage.value?.content || '';
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: false,
  showConfirmButton: false,
  onClosed() {
    emit('close');
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      contentLoading.value = true;
      const record = modalApi.getData<MessageResp>();
      const data = await getUserMessage(record.id);
      currentMessage.value = data;
      contentLoading.value = false;
    }
  },
});

const getTitle = computed(() => {
  return currentMessage.value?.title || '系统公告';
});
</script>

<template>
  <Modal class="h-[50%] w-[50%]">
    <template #title>
      <div class="text-center">
        {{ getTitle }}
      </div>
    </template>
    <div class="preview-content">
      <div class="detail">
        <div class="detail-content">
          <div class="info">
            <span>
              <icon-history class="icon" />
              <span class="label">发布时间：</span>
              <span>{{ currentMessage?.createTime }}</span>
            </span>
          </div>
          <div style="flex: 1">
            <div class="content-loading" v-loading="contentLoading">
              <AiEditor v-model:model-value="currentNoticeContent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.detail {
  .detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0; // 减小内边距
    margin: 0;

    .title {
      margin-bottom: 12px; // 减小标题下边距
      line-height: 1.4;
      color: var(--color-text-1);
      text-align: center;
    }

    .info {
      margin-bottom: 12px; // 减小信息区域下边距
      font-size: 14px;
      line-height: 1.5715;
      color: var(--color-text-2);
      text-align: center;

      .icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
