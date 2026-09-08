import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authenticateResponseInterceptor } from './preset-interceptors';
import { RequestClient } from './request-client';

describe('requestClient', () => {
  let mock: MockAdapter;
  let requestClient: RequestClient;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    requestClient = new RequestClient();
  });

  afterEach(() => {
    mock.reset();
  });

  it('should successfully make a GET request', async () => {
    mock.onGet('test/url').reply(200, { data: 'response' });

    const response = await requestClient.get('test/url');

    expect(response.data).toEqual({ data: 'response' });
  });

  it('should successfully make a POST request', async () => {
    const postData = { key: 'value' };
    const mockData = { data: 'response' };
    mock.onPost('/test/post', postData).reply(200, mockData);
    const response = await requestClient.post('/test/post', postData);
    expect(response.data).toEqual(mockData);
  });

  it('should successfully make a PUT request', async () => {
    const putData = { key: 'updatedValue' };
    const mockData = { data: 'updated response' };
    mock.onPut('/test/put', putData).reply(200, mockData);
    const response = await requestClient.put('/test/put', putData);
    expect(response.data).toEqual(mockData);
  });

  it('should successfully make a DELETE request', async () => {
    const mockData = { data: 'delete response' };
    mock.onDelete('/test/delete').reply(200, mockData);
    const response = await requestClient.delete('/test/delete');
    expect(response.data).toEqual(mockData);
  });

  it('should handle network errors', async () => {
    mock.onGet('/test/error').networkError();
    await expect(requestClient.get('/test/error')).rejects.toMatchObject({
      isAxiosError: true,
      message: 'Network Error',
    });
  });

  it('should handle timeout', async () => {
    mock.onGet('/test/timeout').timeout();
    await expect(requestClient.get('/test/timeout')).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ECONNABORTED',
    });
  });

  it('should preserve axios response error context', async () => {
    mock.onGet('/test/unauthorized').reply(401, {
      code: '401',
      msg: 'Unauthorized',
    });

    await expect(requestClient.get('/test/unauthorized')).rejects.toMatchObject({
      isAxiosError: true,
      config: { url: '/test/unauthorized' },
      response: {
        data: { code: '401', msg: 'Unauthorized' },
        status: 401,
      },
    });
  });

  it('should not invalidate an existing session after a failed login', async () => {
    const doReAuthenticate = vi.fn();
    requestClient.addResponseInterceptor(
      authenticateResponseInterceptor({
        client: requestClient,
        doReAuthenticate,
        doRefreshToken: vi.fn(),
        enableRefreshToken: true,
        formatToken: (token) => `Bearer ${token}`,
      }),
    );
    mock.onPost('/auth/login').reply(401, { code: '401' });

    await expect(requestClient.post('/auth/login')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(doReAuthenticate).not.toHaveBeenCalled();
  });

  it('should retry protected requests with the refreshed auth generation', async () => {
    let authGeneration = 1;
    const doRefreshToken = vi.fn(async () => {
      authGeneration = 2;
      return 'new-access-token';
    });
    requestClient.addResponseInterceptor(
      authenticateResponseInterceptor({
        client: requestClient,
        doReAuthenticate: vi.fn(),
        doRefreshToken,
        enableRefreshToken: true,
        formatToken: (token) => `Bearer ${token}`,
        getAuthGeneration: () => authGeneration,
      }),
    );
    mock.onGet('/protected').replyOnce(401, { code: '401' });
    mock.onGet('/protected').reply((config) => [200, {
      authGeneration: config.__authGeneration,
    }]);

    const response = await requestClient.get('/protected', {
      __authGeneration: 1,
    });

    expect(doRefreshToken).toHaveBeenCalledOnce();
    expect(response.data).toEqual({
      authGeneration: 2,
    });
  });

  it('should successfully upload a file', async () => {
    const fileData = new Blob(['file contents'], { type: 'text/plain' });

    mock.onPost('/test/upload').reply((config) => {
      return config.data instanceof FormData && config.data.has('file')
        ? [200, { data: 'file uploaded' }]
        : [400, { error: 'Bad Request' }];
    });

    const response = await requestClient.upload('/test/upload', {
      file: fileData,
    });
    expect(response.data).toEqual({ data: 'file uploaded' });
  });

  it('should successfully download a file as a blob', async () => {
    const mockFileContent = new Blob(['mock file content'], {
      type: 'text/plain',
    });

    mock.onGet('/test/download').reply(200, mockFileContent);

    const res = await requestClient.download<any>('/test/download');

    expect(res.data).toBeInstanceOf(Blob);
  });
});
