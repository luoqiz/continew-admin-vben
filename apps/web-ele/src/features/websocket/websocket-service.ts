import { ref, watch } from 'vue';

import { useAccessStore } from '@vben/stores';

type WebSocketState = 'closed' | 'connecting' | 'open';

type WsMessageHandler = (data: string) => void;

const RECONNECT_DELAY_BASE = 3000;
const RECONNECT_DELAY_MAX = 30_000;

/** 连接状态（供连接指示器等场景消费） */
const webSocketState = ref<WebSocketState>('closed');

/** 消息处理器集合：一条连接服务多个消费者 */
const handlers = new Set<WsMessageHandler>();

let socket: null | WebSocket = null;
let socketToken: null | string = null;
/** 主动关闭标记（登出）：区别于异常断开，抑制重连 */
let manualClose = false;
let reconnectTimer: null | ReturnType<typeof setTimeout> = null;
let reconnectDelay = RECONNECT_DELAY_BASE;
/** 鉴权联动是否已初始化（首个订阅者触发，幂等） */
let initialized = false;

function resolveWsBaseUrl(): string {
  // 优先使用 VITE_API_WS_URL；未配置时基于接口前缀推导：
  // dev 环境为同源 + /api（Vite 代理已开启 ws 转发），生产环境按部署地址推导。
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

function clearReconnectTimer() {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function closeSocket() {
  manualClose = true;
  clearReconnectTimer();
  const current = socket;
  socket = null;
  socketToken = null;
  current?.close();
  webSocketState.value = 'closed';
}

function connect(token: string) {
  if (
    socketToken === token &&
    socket &&
    (socket.readyState === WebSocket.CONNECTING ||
      socket.readyState === WebSocket.OPEN)
  ) {
    return;
  }
  manualClose = false;
  clearReconnectTimer();
  const previousSocket = socket;
  const nextSocket = new WebSocket(
    `${resolveWsBaseUrl()}/websocket?token=${encodeURIComponent(token)}`,
  );
  socket = nextSocket;
  socketToken = token;
  previousSocket?.close();
  webSocketState.value = 'connecting';

  nextSocket.addEventListener('open', () => {
    webSocketState.value = 'open';
    reconnectDelay = RECONNECT_DELAY_BASE;
  });
  nextSocket.addEventListener('message', (event: MessageEvent) => {
    // 逐个分发并隔离异常：单个消费者出错不影响其他消费者
    const data = event.data as string;
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error('[WebSocket] 消息处理异常', error);
      }
    }
  });
  nextSocket.addEventListener('error', () => {
    webSocketState.value = 'closed';
  });
  nextSocket.addEventListener('close', () => {
    webSocketState.value = 'closed';
    // 仅当关闭的是当前活跃连接时才调度重连：
    // 因 token 轮换/重连被主动替换掉的旧连接关闭，不应触发重连调度
    if (socket === nextSocket) {
      socket = null;
      socketToken = null;
      scheduleReconnect();
    }
  });
}

/** 异常断开后退避重连（3s 起步 ×2 至 30s 封顶）；仅登录态内发起，登出不重连 */
function scheduleReconnect() {
  if (manualClose) return;
  const accessStore = useAccessStore();
  if (!accessStore.accessToken) return;
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    if (accessStore.accessToken) {
      connect(accessStore.accessToken);
    }
  }, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX);
}

/**
 * 鉴权联动：token 出现/轮换 → （重）连接；token 清空（登出/会话死亡）→ 断开。
 * 以服务内部 watch 驱动，消费者只管订阅。
 */
function initAuthBinding() {
  const accessStore = useAccessStore();
  watch(
    () => accessStore.accessToken,
    (token) => {
      if (token) {
        connect(token);
      } else {
        closeSocket();
      }
    },
    { immediate: true },
  );
  // 标签页休眠唤醒后若连接已断开，立即重连（清掉挂起的退避等待）
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      accessStore.accessToken &&
      webSocketState.value !== 'open'
    ) {
      clearReconnectTimer();
      connect(accessStore.accessToken);
    }
  });
}

/**
 * 订阅 WebSocket 消息（全局单例连接，多消费者共享）。
 *
 * 与后端约定：握手以 Access Token 作为唯一凭证（/websocket?token=xxx），
 * 因此只有登录后（内存中存在 Access Token）才会建立连接：
 * - Access Token 轮换（刷新）后自动使用新 Token 重连；
 * - 登出或会话失效（Token 置空）后立即断开；
 * - 异常断开按退避自动重连（仅登录态内）。
 *
 * @returns 取消订阅函数
 */
export function subscribeWebSocketMessage(
  handler: WsMessageHandler,
): () => void {
  handlers.add(handler);
  if (!initialized) {
    initialized = true;
    initAuthBinding();
  }
  return () => {
    handlers.delete(handler);
  };
}

export { webSocketState };
