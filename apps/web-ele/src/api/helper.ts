import type { ResponseInterceptorConfig } from '@vben/request';

export const code2statusResponseInterceptor = (): ResponseInterceptorConfig => {
  return {
    rejected: (error) => {
      const { response } = error;
      const { data, status } = response;
      if (status !== 200) {
        throw error;
      }
      if (typeof data === 'object' && Reflect.has(data, 'code')) {
        response.status = Number.parseInt(data.code);
      }
      throw Object.assign({}, response, { response });
    },
  };
};
