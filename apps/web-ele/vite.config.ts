import process from 'node:process';

import { defineConfig, viteCssLayerPlugin } from '@vben/vite-config';

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
        // element-plus 的 css 包进 @layer el，使 Tailwind 工具类可覆盖组件样式
        viteCssLayerPlugin({ layerName: 'el', packageName: 'element-plus' }),
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
          '.dev.local', // 允许该域名下的所有子域名
        ],
        // 如果想要允许所有主机名访问（不安全,仅用于临时测试,否则可能遭受DNS重绑定攻击）
        // allowedHosts: true,
        proxy: {
          [env.VITE_API_PREFIX as string]: {
            changeOrigin: true,
            rewrite: (path: string) =>
              path.replace(new RegExp(`^${env.VITE_API_PREFIX}`), ''),
            // 浏览器访问 /api，代理转发到后端实际地址，保证 Refresh Token Cookie 同源可携带。
            target: env.VITE_API_BASE_URL || env.VITE_GLOB_API_URL,
            ws: true,
          },
        },
      },
    },
  };
});
