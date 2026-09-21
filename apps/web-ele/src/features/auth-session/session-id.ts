/**
 * 从 Access Token（JWT）解析登录会话 ID（sid 声明）。
 *
 * 仅用于前端展示判断（例如在线用户列表禁用“强退自己”），不作为任何鉴权依据，
 * 服务端仍然独立校验操作人。令牌不可信时返回 undefined。
 */
export function getSessionId(accessToken: null | string): string | undefined {
  if (!accessToken) return undefined;
  const payload = accessToken.split('.')[1];
  if (!payload) return undefined;
  try {
    const base64 = payload.replaceAll('-', '+').replaceAll('_', '/');
    // 只按 ASCII 模式匹配 sid，避免解码载荷中可能存在的非 UTF-8 字节。
    return atob(base64).match(/"sid"\s*:\s*"([^"]+)"/)?.[1];
  } catch {
    return undefined;
  }
}
