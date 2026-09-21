import type { ResponseInterceptorConfig } from '@vben/request';

export const code2statusResponseInterceptor = (): ResponseInterceptorConfig => {
  return {
    rejected: (error) => {
      // 网络异常没有 response，不能在状态码转换阶段再次抛出 TypeError，
      // 否则通用错误拦截器无法识别真实的网络错误。
      const response = error?.response;
      if (!response) {
        throw error;
      }
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
