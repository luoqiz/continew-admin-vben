import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;

  /**
   * Access Token（Refresh Token 不进入前端用户信息或持久化存储）
   */
  accessToken: string;
}

export type { UserInfo };
