import { ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { defineStore } from 'pinia';

import {
  getUnreadMessageCount,
  getUnreadNoticeCount,
} from '#/api/system/user-message';
import { subscribeWebSocketMessage } from '#/features/websocket/websocket-service';

/**
 * 未读计数共享 Store（单一事实源）。
 *
 * 顶部铃铛红点与消息中心左侧徽标都从这里读取，任何已读动作或
 * WS 推送都会驱动刷新，天然保持多方一致。
 */
export const useMessageStore = defineStore('message', () => {
  const accessStore = useAccessStore();

  const unreadMessageCount = ref(0);
  const unreadNoticeCount = ref(0);

  /**
   * 刷新两个未读数。
   *
   * 触发时机：进入消息中心/挂载、任意已读动作后、WS 推送到达时（回查，
   * 不信任推送负载——后端新消息推送的是标记"1"而非数量）。
   * 未登录或查询失败时保留/清零，不阻塞页面。
   */
  const refreshUnreadCounts = async () => {
    if (!accessStore.accessToken) {
      unreadMessageCount.value = 0;
      unreadNoticeCount.value = 0;
      return;
    }
    try {
      const [messageRes, noticeRes] = await Promise.all([
        getUnreadMessageCount(),
        getUnreadNoticeCount(),
      ]);
      unreadMessageCount.value = messageRes?.total ?? 0;
      unreadNoticeCount.value = noticeRes?.total ?? 0;
    } catch {
      // 查询失败保留上次计数，等待推送或下次查询
    }
  };

  // WS 推送到达（新消息 / 已读变化）→ 回查真实未读数（后端新消息推送的是
  // 标记"1"而非数量，统一回查而非信任负载）
  subscribeWebSocketMessage(() => {
    refreshUnreadCounts();
  });

  /**
   * 重置未读计数（登出时由 resetAllStores 调用）。
   *
   * Pinia 对 setup 语法的 Store 会生成抛异常的默认 $reset，不实现会导致
   * 登出流程中断。未读计数是会话态，随登出清零。
   */
  const $reset = () => {
    unreadMessageCount.value = 0;
    unreadNoticeCount.value = 0;
  };

  return {
    $reset,
    unreadMessageCount,
    unreadNoticeCount,
    refreshUnreadCounts,
  };
});
