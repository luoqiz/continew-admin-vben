import type { RequestClientConfig } from '@vben/request';

import { RequestClient } from '@vben/request';

/**
 * 应用层对上游 RequestClient 的扩展。
 *
 * 上游没有 PATCH 快捷方法，业务 API 又需要它；放在这里补齐，避免每次同步
 * 上游都要重新往 packages/effects/request 里插方法。
 */
export class ContinewRequestClient extends RequestClient {
  public patch<T = any>(
    url: string,
    data?: any,
    config?: RequestClientConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'PATCH' });
  }
}
