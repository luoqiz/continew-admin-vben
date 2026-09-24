<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import type { MessageResp } from '#/api/system/user-message';

import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import {
  deleteMessage,
  listMessage,
  readAllMessage,
  readMessage,
} from '#/api/system/user-message';
import { authExpiredReason } from '#/features/auth-session/expired-reason';
import { subscribeWebSocketMessage } from '#/features/websocket/websocket-service';
import { $t } from '#/locales';
import { useAuthStore, useMessageStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const messageStore = useMessageStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();

/** 通知弹层展示的未读消息条数上限。 */
const NOTIFICATION_PAGE_SIZE = 8;

const notifications = ref<NotificationItem[]>([]);

const showDot = computed(() => messageStore.unreadMessageCount > 0);

function toNotification(message: MessageResp): NotificationItem {
  return {
    avatar: preferences.app.defaultAvatar,
    date: message.createTime,
    id: message.id,
    isRead: message.isRead,
    link: message.path || undefined,
    message: message.content,
    title: message.title,
  };
}

async function loadNotifications() {
  try {
    const page = await listMessage({
      isRead: false,
      page: 1,
      size: NOTIFICATION_PAGE_SIZE,
      sort: ['createTime,desc'],
    });
    notifications.value = (page?.list ?? []).map((message) =>
      toNotification(message),
    );
  } catch {
    // 列表加载失败不阻塞布局，等待 WS 推送或下次操作刷新
  }
}

// 登录态变化时同步刷新通知数据：登录/刷新后重新拉取，登出后清空。
// WS 连接的生命周期由 websocket-service 依据 accessToken 自行管理。
watch(
  () => accessStore.accessToken,
  (token) => {
    if (token) {
      messageStore.refreshUnreadCounts();
      loadNotifications();
    } else {
      notifications.value = [];
    }
  },
  { immediate: true },
);

// WS 推送到达 → 同步弹层列表；未读计数由 message store 自己的订阅统一回查
subscribeWebSocketMessage(() => {
  loadNotifications();
});

const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => {
      router.push('/user/message');
    },
    icon: BookOpenText,
    text: $t('ui.widgets.msgCenter'),
  },
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  const ids = notifications.value.map((item) => String(item.id));
  if (ids.length <= 0) return;
  deleteMessage(ids)
    .then(() => {
      notifications.value = [];
      messageStore.refreshUnreadCounts();
    })
    .catch(() => {});
}

async function markRead(item: NotificationItem) {
  try {
    await readMessage([String(item.id)]);
    item.isRead = true;
    notifications.value = notifications.value.filter(
      (notice) => notice.id !== item.id,
    );
    messageStore.refreshUnreadCounts();
  } catch {
    // 标记失败保持原状，等待下次刷新
  }
}

function remove(item: NotificationItem) {
  deleteMessage([String(item.id)])
    .then(() => {
      notifications.value = notifications.value.filter(
        (notice) => notice.id !== item.id,
      );
      messageStore.refreshUnreadCounts();
    })
    .catch(() => {});
}

async function handleMakeAll() {
  try {
    await readAllMessage();
    notifications.value = [];
    messageStore.refreshUnreadCounts();
  } catch {
    // 全部已读失败保持原状
  }
}

const viewAll = () => {
  router.push('/user/message');
};

const handleClick = (item: NotificationItem) => {
  // 点击通知即视为已读：标记消息并刷新铃铛/徽标计数，再跳转目标页面
  markRead(item);
  if (item.link) {
    navigateTo(item.link);
    return;
  }
  router.push('/user/message');
};

function navigateTo(link: string) {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    // 外部链接，在新标签页打开
    window.open(link, '_blank');
    return;
  }
  // 消息模板链接自带查询串（/user/notice?id=xxx）。对象形式 push 会把内嵌
  // 查询串并入 path 导致查询参数丢失（页面拿到 undefined 的 id），因此统一
  // 用字符串形式跳转，由 vue-router 自行解析查询参数。
  router.push(link);
}

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';

      await updateWatermark({
        advancedStyle: {
          colorStops: [
            {
              color: watermarkColor,
              offset: 0,
            },
            {
              color: watermarkColor,
              offset: 1,
            },
          ],
          type: 'linear',
        },
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout
    :avatar
    :text="userStore.userInfo?.nickname"
    @clear-preferences-and-logout="handleLogout"
    @logout="handleLogout"
  >
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.nickname"
        :description="userStore.userInfo?.email"
        :tag-text="userStore.userInfo?.username"
        @clear-preferences-and-logout="handleLogout"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => markRead(item)"
        @remove="(item) => remove(item)"
        @make-all="handleMakeAll"
        @on-click="handleClick"
        @view-all="viewAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <div
          v-if="authExpiredReason"
          class="mb-3 text-center text-sm text-destructive"
        >
          {{ authExpiredReason }}
        </div>
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
