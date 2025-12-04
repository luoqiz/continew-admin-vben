import type { Component } from 'vue';

export interface ModeItem {
  title: string;
  icon: Component | string;
  subtitle: string;
  value?: string;
  type: 'email' | 'gitee' | 'github' | 'password' | 'phone' | 'wechat_open';
  jumpMode?: 'link' | 'modal';
  status: boolean;
  statusString?: string;
}
