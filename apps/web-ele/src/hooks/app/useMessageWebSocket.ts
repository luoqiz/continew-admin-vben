import { onBeforeUnmount, ref, watch } from 'vue';

import { useAccessStore } from '@vben/stores';

import { getUnreadMessageCount } from '#/api/system/user-message';

/**
 * 解析消息 WebSocket 服务地址。
 *
 * 优先使用 VITE_API_WS_URL；未配置时基于接口前缀推导：
 * dev 环境为同源 + /api（Vite 代理已开启 ws 转发），生产环境按部署地址同源推导。
 */
function resolveWsBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_WS_URL as string | undefined;
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  const apiPrefix = (
    (import.meta.env.VITE_GLOB_API_URL as string) || '/api'
  ).replace(/\/+$/, '');
  if (/^https?:\/\//i.test(apiPrefix)) {
    const url = new URL(apiPrefix);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${apiPrefix}`;
}

interface UseMessageWebSocketOptions {
  /** 收到服务端推送（未读数量变化）时的回调，可用于刷新消息列表。 */
  onMessage?: (data: string) => void;
}

/**
 * 消息通知 WebSocket。
 *
 * 与后端约定：握手以 Access Token 作为唯一凭证（/websocket?token=xxx），
 * 因此只有登录后（内存中存在 Access Token）才允许建立连接：
 * - Access Token 轮换（刷新）后自动使用新 Token 重连；
 * - 登出或会话失效（Token 置空）后立即断开；
 * - 连接异常/断开不自动重连，待 Token 下一次变更时自然重建（与旧管理端一致）。
 */
export function useMessageWebSocket(options?: UseMessageWebSocketOptions) {
  const accessStore = useAccessStore();

  /** 未读消息数量，由服务端推送或主动查询更新。 */
  const unreadCount = ref(0);
  const connected = ref(false);

  let socket: null | WebSocket = null;
  let socketToken: null | string = null;

  const closeSocket = () => {
    const current = socket;
    socket = null;
    socketToken = null;
    current?.close();
  };

  const connect = (token: string) => {
    if (
      socketToken === token &&
      socket &&
      (socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }
    const previousSocket = socket;
    const nextSocket = new WebSocket(
      `${resolveWsBaseUrl()}/websocket?token=${encodeURIComponent(token)}`,
    );
    socket = nextSocket;
    socketToken = token;
    previousSocket?.close();

    nextSocket.addEventListener('open', () => {
      connected.value = true;
    });
    nextSocket.addEventListener('message', (event: MessageEvent) => {
      // 服务端推送的是最新未读消息数量文本
      const data = event.data as string;
      const count = Number.parseInt(data, 10);
      if (!Number.isNaN(count)) {
        unreadCount.value = count;
        options?.onMessage?.(data);
      }
    });
    nextSocket.addEventListener('error', () => {
      connected.value = false;
    });
    nextSocket.addEventListener('close', () => {
      connected.value = false;
      if (socket === nextSocket) {
        socket = null;
        socketToken = null;
      }
    });
  };

  /** 主动查询未读消息数量；已登录时顺带兜底建立 WS 连接。 */
  const refreshUnreadCount = async () => {
    if (!accessStore.accessToken) {
      unreadCount.value = 0;
      return;
    }
    connect(accessStore.accessToken);
    try {
      const data = await getUnreadMessageCount();
      unreadCount.value = data?.total ?? 0;
    } catch {
      // 数量查询失败不阻塞页面，等待 WS 推送或下次查询
    }
  };

  watch(
    () => accessStore.accessToken,
    (token) => {
      if (token) {
        connect(token);
      } else {
        closeSocket();
        connected.value = false;
        unreadCount.value = 0;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    closeSocket();
  });

  return { connected, refreshUnreadCount, unreadCount };
}
