<script setup lang="ts">
import type { NoticePreviewResp } from '#/api/system';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { getUnreadNoticeIds, getUserNotice } from '#/api/system/user-message';

import AiEditor from './view/components/index.vue';

defineOptions({ name: 'NoticePopup' });

const props = withDefaults(defineProps<Props>(), {
  method: 'POPUP',
});

const emit = defineEmits<{
  close: [];
}>();

interface Props {
  method?: string; // 通知方式，默认为 'POPUP'
}

const visible = ref(false);
const unreadNoticeIds = ref<number[]>([]);
const currentIndex = ref(0);
const loading = ref(false);
const contentLoading = ref(false);
const noticeCache = ref<Map<number, NoticePreviewResp>>(new Map());

const currentNotice = computed(() => {
  const noticeId = unreadNoticeIds.value[currentIndex.value];
  return noticeId ? noticeCache.value.get(noticeId) : null;
});

const currentNoticeContent = computed(() => {
  return currentNotice.value?.content || '';
});

// 获取未读公告ID列表
const fetchNoticeDetail = async (index: number) => {
  const noticeId = unreadNoticeIds.value[index];
  if (!noticeId) {
    return;
  }

  // 如果已经缓存了该公告，直接设置当前索引并返回
  if (noticeCache.value.has(noticeId)) {
    currentIndex.value = index;
    return;
  }

  try {
    contentLoading.value = true;
    const data = await getUserNotice(noticeId);
    noticeCache.value.set(noticeId, data as NoticePreviewResp);
    // 确保设置当前索引，触发计算属性更新
    currentIndex.value = index;
  } catch (error) {
    console.error(`获取公告详情失败:`, error);
    // 创建一个错误状态的公告对象
    noticeCache.value.set(noticeId, {
      id: noticeId,
      title: '获取公告失败',
      content: '获取公告内容失败，请稍后重试',
      createUserString: '',
      publishTime: '',
    } as NoticePreviewResp);
    // 即使出错也要设置当前索引
    currentIndex.value = index;
  } finally {
    contentLoading.value = false;
  }
};

// 获取指定公告的详情
const fetchUnreadNotices = async () => {
  try {
    loading.value = true;
    const noticeIds = await getUnreadNoticeIds(props.method);

    if (noticeIds && noticeIds.length > 0) {
      unreadNoticeIds.value = noticeIds;
      visible.value = true;
      // 获取第一篇公告的详情
      await fetchNoticeDetail(0);
      // 确保当前索引设置为0
      currentIndex.value = 0;
    }
  } catch (error) {
    console.error('获取未读公告失败:', error);
  } finally {
    loading.value = false;
  }
};

// 上一条公告
const previousNotice = async () => {
  if (currentIndex.value > 0) {
    // 计算新的索引
    const newIndex = currentIndex.value - 1;
    // 获取公告详情
    await fetchNoticeDetail(newIndex);
  }
};

// 下一条公告
const nextNotice = async () => {
  if (currentIndex.value < unreadNoticeIds.value.length - 1) {
    // 计算新的索引
    const newIndex = currentIndex.value + 1;
    // 获取公告详情
    await fetchNoticeDetail(newIndex);
  }
};

// 关闭弹窗
const onClose = () => {
  visible.value = false;
  currentIndex.value = 0;
  unreadNoticeIds.value = [];
  noticeCache.value.clear();
  emit('close');
};

// 打开弹窗
const open = () => {
  fetchUnreadNotices();
};

defineExpose({
  open,
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: false,
  showConfirmButton: false,
  onClosed() {
    onClose();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<string[]>();
      if (data) {
        currentIndex.value = 0;
      }
    }
  },
});

const getTitle = computed(() => {
  return currentNotice.value?.title || '系统公告';
});
</script>

<template>
  <Modal class="h-[90%] w-[90%]" :title="getTitle">
    <div class="preview-content">
      <div class="detail">
        <div class="detail-content">
          <h1 class="title">{{ currentNotice?.title }}</h1>
          <div class="info">
            <a-space>
              <span>
                <icon-user class="icon" />
                <span class="label">发布人：</span>
                <span>{{ currentNotice?.createUserString }}</span>
              </span>
              <a-divider direction="vertical" />
              <span>
                <icon-history class="icon" />
                <span class="label">发布时间：</span>
                <span>{{ currentNotice?.publishTime }}</span>
              </span>
              <a-divider
                v-if="currentNotice?.updateTime"
                direction="vertical"
              />
              <span v-if="currentNotice?.updateTime">
                <icon-schedule class="icon" />
                <span>更新时间：</span>
                <span>{{ currentNotice?.updateTime }}</span>
              </span>
            </a-space>
          </div>
          <div style="flex: 1">
            <div v-if="contentLoading" class="content-loading">
              <a-spin size="large" />
            </div>
            <AiEditor v-else v-model:model-value="currentNoticeContent" />
          </div>
        </div>

        <!-- 底部操作区域 -->
        <div class="notice-footer">
          <div class="notice-actions">
            <span class="pagination-info">
              {{ currentIndex + 1 }} / {{ unreadNoticeIds.length }}
            </span>

            <!-- 翻页按钮 -->
            <div class="pagination-controls">
              <a-button v-if="currentIndex > 0" @click="previousNotice">
                上一篇
              </a-button>
              <a-button
                v-if="currentIndex < unreadNoticeIds.length - 1"
                @click="nextNotice"
              >
                下一篇
              </a-button>
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

  .notice-footer {
    padding-top: 16px;
    margin-top: 24px;
    border-top: 1px solid var(--color-border-2);

    .notice-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .pagination-info {
        font-size: 14px;
        color: var(--color-text-2);
      }

      .pagination-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }
}

.content-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

// 兼容原有样式
.notice-content {
  .notice-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--color-border-2);

    .notice-meta {
      display: flex;
      gap: 12px;
      align-items: center;

      .notice-time {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }

  .notice-body {
    margin-bottom: 24px;

    .notice-title {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--color-text-1);
    }

    .notice-text {
      max-height: 300px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-2);

      :deep(img) {
        max-width: 100%;
        height: auto;
      }

      :deep(p) {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.notice-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
