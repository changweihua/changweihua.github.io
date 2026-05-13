// vite.config.ts
import { loadEnv, defineConfig, UserConfig } from 'vite-plus'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import versionPlugin from './plugins/vite-plugin-version'

// 通用 Vite 插件
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin'
import vueStyledPlugin from '@vue-styled-components/plugin'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import UnoCSS from 'unocss/vite'
import Iconify from 'unplugin-iconify-generator/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import versionInjector from 'unplugin-version-injector/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { envParse } from 'vite-plugin-env-parse'
import mkcert from 'vite-plugin-mkcert'
import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env'

// 获取 __dirname（兼容 ESM）
const __dirname = dirname(fileURLToPath(import.meta.url))

function getEnvValue(mode: string, target: string) {
  const value = loadEnv(mode, process.cwd())[target]
  return value
}

export default defineConfig(() => {
  const timestamp = new Date().getTime()

  // 是否生产环境
  const isProduction = process.env.NODE_ENV === 'production'

  // 公共插件（始终启用）
  const sharedPlugins = [
    vueJsx(),
    viteDemoPreviewPlugin(),
    Components({
      dirs: ['./src/components', '.vitepress/components'],
      dts: 'typings/components.d.ts',
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({
          prefix: 'icon',
          strict: true,
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      scale: 1.2,
      defaultStyle: '',
      defaultClass: '',
    }),
    UnoCSS(),
    vueStyledPlugin(),
    Iconify({
      collections: {
        cmono: './src/assets/icons/mono',
      },
    }),
    versionInjector(),
    // versionPlugin 来自本地文件，处理版本信息
    versionPlugin({
      versionKey: 'my_app_version',
      timeKey: 'my_build_time',
      generateVersionJson: true,
      gitCommand: 'git describe --tags --always',
      onBuildComplete: (info) => {
        console.log('构建完成，版本:', info.version)
      }
    }),
  ]

  // 仅开发环境启用的插件
  const devPlugins = isProduction ? [] : [
    ValidateEnv({
      validator: 'builtin',
      schema: {
        VITE_APP_PRIMARY_COLOR: Schema.string(),
      },
    }),
    envParse(),
    // 开发环境 API 错误处理
    {
      name: 'dev-error-handler',
      configureServer(server: any) {
        server.middlewares.use('/api', (req: any, _res: any, next: any) => {
          console.log(`🔍 API Request: ${req.method} ${req.url}`)
          next()
        })
      },
    },
    mkcert({
      savePath: './certs',
      autoUpgrade: false,
      force: false,
    }),
  ]

  return {

    // 所有 Vite 插件
    plugins: [
      ...sharedPlugins,
      ...devPlugins,
    ],

    server: {
      host: '0.0.0.0',
      port: 4200,
      open: true,
      hmr: {
        overlay: true,
      },
      fs: {
        allow: [resolve(__dirname, '..')],
      },
    },

    clearScreen: false,

    // 构建配置（合并自旧 config.ts 的 vite.build）
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 20 * 1000,
      emptyOutDir: true,
      reportCompressedSize: true,
      cssMinify: 'lightningcss',               // 新增：使用 LightningCSS 压缩 CSS
      rolldownOptions: {
        devtools: {},
        output: {
          codeSplitting: true,
          minify: {
            compress: {
              dropConsole: true,
            },
          },
        },
      },
    },

    // CSS 配置（迁移自旧 config.ts 的 vite.css）
    css: {
      lightningcss: {
        errorRecovery: true,
        targets: browserslistToTargets(browserslist('>= 0.25%')),
        pseudoClasses: {},
        drafts: {
          customMedia: true,
        },
        cssModules: {
          pattern: '[name]__[local]___[hash]',
        },
      },
      devSourcemap: true,
      preprocessorMaxWorkers: 3,
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@vp/theme/styles/variables.scss" as vars;`,
        },
      },
    },

    // 依赖预构建（迁移自旧 config.ts 的 vite.optimizeDeps）
    optimizeDeps: {
      include: [
        "mermaid",
        "dayjs",
        "debug",
        "@braintree/sanitize-url",
        "cytoscape",
        "cytoscape-cose-bilkent",
      ],
      exclude: ["vitepress"],
    },

    // SSR 配置（迁移自旧 config.ts 的 vite.ssr）
    ssr: {
      external: [
        'vue3-next-qrcode',
        'vitepress-plugin-tabs',
        'vitepress-plugin-detype',
        'vitepress-plugin-npm-commands',
        'hover-tilt',
      ],
      noExternal: [
        'vitepress-plugin-nprogress',
        'vitepress-component-medium-zoom',
        'vitepress-plugin-bprogress',
        'naive-ui',
        'date-fns',
        'vueuc',
        '@vue/runtime-dom',
      ],
    },

    // 路径别名（合并并保留数组形式）
    resolve: {
      tsconfigPaths: true,
      alias: [
        { find: 'vite', replacement: 'rolldown-vite' },
        { find: 'mermaid', replacement: 'mermaid' },
        { find: '@demo', replacement: resolve(__dirname, './src/demos') },
        {
          find: /^.*\/VPFooter\.vue$/,
          replacement: resolve(__dirname, '.vitepress/components/LiquidPageFooter.vue'),
        },
        // 你原有的别名（转换为数组形式）
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: 'public', replacement: fileURLToPath(new URL('./public', import.meta.url)) },
        { find: '@vp', replacement: fileURLToPath(new URL('.vitepress', import.meta.url)) },
      ],
    },

    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
    },

    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      'process.env': {},
      'process.env.RSS_BASE': JSON.stringify(
        `${getEnvValue(process.env.NODE_ENV || 'github', 'VITE_APP_RSS_BASE_URL')}`
      ),
    },

    devtools: {
      enabled: true
    },
  } as UserConfig
})
