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
