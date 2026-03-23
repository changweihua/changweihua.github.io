import { loadEnv, defineConfig, UserConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DevTools } from '@vitejs/devtools'
import oxlintPlugin from 'vite-plugin-oxlint'
import versionPlugin from './plugins/vite-plugin-version';

function getEnvValue(mode: string, target: string) {
  const value = loadEnv(mode, process.cwd())[target]
  return value
}

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(() => {
  const timestamp = new Date().getTime()

  return {
    builder: {
      buildApp: async (builder) => {
        const environments = Object.values(builder.environments)
        console.log('environments', environments)
        // return Promise.all(environments.map((environment) => builder.build(environment)))
      },
    },
    plugins: [
      DevTools(),
      oxlintPlugin({
        configFile: 'eslintrc.json'
      }),
      versionPlugin({
        versionKey: 'my_app_version',
        timeKey: 'my_build_time',
        generateVersionJson: true,
        gitCommand: 'git describe --tags --always', // 使用 tag 作为版本
        onBuildComplete: (info) => {
          // 可以在这里上报版本信息到监控系统
          console.log('构建完成，版本:', info.version);
        }
      })
    ],
    server: {
      // ✅ 服务器基础配置
      host: '0.0.0.0', // 允许外部访问
      port: 4200,
      open: true, // 自动打开浏览器
      // HMR配置
      hmr: {
        overlay: true, // 显示错误覆盖层
      },
      fs: {
        allow: [resolve(__dirname, '..')],
      },
    },
    clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    build: {
      sourcemap: false, // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 20 * 1000 * 1000, // 设置 chunk 大小警告的限制为 2000 KiBs
      emptyOutDir: true,
      reportCompressedSize: true,
      rolldownOptions: {
        devtools: {
        }, // enable devtools mode
      },
    },
    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
    },
    // The fields defined here can also be used in mock.
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      // __version__: JSON.stringify(GeneratVersion()),
      'process.env': {},
      // 注意要用 JSON.stringify
      'process.env.RSS_BASE': JSON.stringify(
        `${getEnvValue(process.env.NODE_ENV || 'github', 'VITE_APP_RSS_BASE_URL')}`
      ),
    },
    devtools: {
      enabled: true
    },
    resolve: {
      tsconfigPaths: true,
      alias: {
        '*': fileURLToPath(new URL('.', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        public: fileURLToPath(new URL('./public', import.meta.url)),
        '@vp': fileURLToPath(new URL('.vitepress', import.meta.url))
      },
    },
  } satisfies UserConfig
})
