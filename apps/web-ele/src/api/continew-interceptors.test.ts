import { RequestClient } from '@vben/request';

import { describe, expect, it, vi } from 'vitest';

import { continewAuthenticateResponseInterceptor } from './continew-interceptors';

/**
 * ContiNew 认证拦截器定制行为。
 *
 * 这些用例原先写在 @vben/request 的 request-client.test.ts 里，随着定制逻辑
 * 抽到应用层一并迁出，让上游测试文件保持原样。
 * 不依赖 axios-mock-adapter：直接用 RequestClient 的自定义 adapter 构造响应。
 */

function unauthorizedError(config: any) {
  return {
    config,
    isAxiosError: true,
    message: 'Request failed with status code 401',
    response: {
      config,
      data: { code: '401', msg: 'Unauthorized' },
      headers: {},
      status: 401,
      statusText: 'Unauthorized',
    },
  };
}

function okResponse(config: any, data: any) {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  };
}

describe('continewAuthenticateResponseInterceptor', () => {
  it('should not invalidate an existing session after a failed login', async () => {
    const doReAuthenticate = vi.fn();
    const client = new RequestClient({
      adapter: async (config) => {
        throw unauthorizedError(config);
      },
    });
    client.addResponseInterceptor(
      continewAuthenticateResponseInterceptor({
        client,
        doReAuthenticate,
        doRefreshToken: vi.fn(),
        enableRefreshToken: true,
        formatToken: (token) => `Bearer ${token}`,
      }),
    );

    await expect(client.post('/auth/login')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(doReAuthenticate).not.toHaveBeenCalled();
  });

  it('should retry protected requests with the refreshed auth generation', async () => {
    let authGeneration = 1;
    let callCount = 0;
    const doRefreshToken = vi.fn(async () => {
      authGeneration = 2;
      return 'new-access-token';
    });
    const client = new RequestClient({
      adapter: async (config) => {
        callCount += 1;
        if (callCount === 1) {
          throw unauthorizedError(config);
        }
        return okResponse(config, {
          authGeneration: (config as any).__authGeneration,
        });
      },
    });
    client.addResponseInterceptor(
      continewAuthenticateResponseInterceptor({
        client,
        doReAuthenticate: vi.fn(),
        doRefreshToken,
        enableRefreshToken: true,
        formatToken: (token) => `Bearer ${token}`,
        getAuthGeneration: () => authGeneration,
      }),
    );

    const response = await client.get('/protected');
    expect(doRefreshToken).toHaveBeenCalledOnce();
    expect(response.data).toEqual({ authGeneration: 2 });
  });
});
