import process from 'node:process';

import { defineConfig } from '@vben/vite-config';

import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { loadEnv } from 'vite';

export default defineConfig(async (config: any) => {
  const { mode } = config;
  const env = loadEnv(mode, process.cwd());
  return {
    application: {},
    vite: {
      plugins: [
        // ElementPlus({
        //   format: 'esm',
        // }),
        AutoImport({
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
      ],
      server: {
        host: '0.0.0.0',
        // 设置允许访问的域名
        allowedHosts: [
          'my.custom.domain', // 允许特定的自定义域名
          '.dev.local',       // 允许该域名下的所有子域名
        ],
        // 如果想要允许所有主机名访问（不安全,仅用于临时测试,否则可能遭受DNS重绑定攻击）
        // allowedHosts: true,
        proxy: {
          [env.VITE_API_PREFIX]: {
            changeOrigin: true,
            rewrite: (path) =>
              path.replace(new RegExp(`^${env.VITE_API_PREFIX}`), ''),
            // mock代理目标地址
            target: env.VITE_GLOB_API_URL,
            ws: true,
          },
        },
      },
    },
  };
});
