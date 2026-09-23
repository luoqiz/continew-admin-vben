import { ref } from 'vue';

/**
 * 最近一次会话失效时服务端给出的原因文案（如“您已被迫下线”“您的账号已在别处登录”）。
 *
 * 由请求层的会话失效捕获逻辑写入，登录过期弹窗展示；重新登录成功或本地登出后清空。
 */
const authExpiredReason = ref('');

export { authExpiredReason };

export function setAuthExpiredReason(reason: string) {
  authExpiredReason.value = reason;
}

export function clearAuthExpiredReason() {
  authExpiredReason.value = '';
}
