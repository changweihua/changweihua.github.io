import type { Plugin } from 'vite'
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env'
import vueStyledPlugin from '@vue-styled-components/plugin'
import colors from 'picocolors'
import UnoCSS from 'unocss/vite'
import Iconify from 'unplugin-iconify-generator/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import versionInjector from 'unplugin-version-injector/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { checker } from 'vite-plugin-checker'
import { envParse } from 'vite-plugin-env-parse'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import Inspect from 'vite-plugin-inspect'
import mkcert from 'vite-plugin-mkcert'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import { qrcode } from 'vite-plugin-qrcode'
import prefetchDnsPlugin from './plugins/vite-plugin-dns-prefetch'
import vitePluginTryCatchConsole from './plugins/vite-plugin-try-catch-console'
import spyPlugin from './plugins/vite-plugin-spy'
import publicImagesPlugin from './plugins/vite-plugin-public-images'

function getEnvValue(mode: string, target: string) {
  const value = loadEnv(mode, process.cwd())[target]
  return value
}

// ♻️ 重构
const yourPlugin: () => Plugin = () => ({
  name: 'test-plugin',
  config(config) {
    // get version in vitePlugin if you open `ifGlobal`
    console.log(config.define)
  },
  configResolved(config) {
    console.log('options', config.optimizeDeps, config.oxc)
  },
  resolveId() {
    console.log(
      colors.red(`viteVersion: ${colors.italic(this.meta.viteVersion)} `),
      colors.green(` rollupVersionersion: ${colors.italic(this.meta.rollupVersion)} `),
      colors.blue(` rolldownVersion: ${colors.italic(this.meta.rolldownVersion)} `)
    )
  },
})

function getDevPlugins() {
  if (process.env.NODE_ENV === 'production') {
    return []
  }
  return [
    spyPlugin(),
    checker({
      eslint: {
        useFlatConfig: true, // 很重要，使用eslint9必须配置，不然会报错
        lintCommand: 'eslint "./src/**/*.{ts,mts,tsx,vue,js,jsx}"',
      },
      overlay: {
        initialIsOpen: false,
      },
      typescript: false,
      vueTsc: false,
    }),
    qrcode(),
    ValidateEnv({
      validator: 'builtin',
      schema: {
        VITE_APP_PRIMARY_COLOR: Schema.string(),
      },
    }),
    mockDevServerPlugin(),
    Inspect(),
    envParse(),
    yourPlugin(),
    vitePluginTryCatchConsole(),
    vitePluginFakeServer({
      include: 'fake', // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
      enableProd: true, // 是否在生产环境下设置mock
    }),
    // 开发环境错误提示优化
    {
      name: 'dev-error-handler',
      configureServer(server: any) {
        server.middlewares.use('/api', (req: any, _res: any, next: any) => {
          // ✅ 开发环境API错误处理
          console.log(`🔍 API Request: ${req.method} ${req.url}`)
          next()
        })
      },
    },
    mkcert({
      savePath: './certs', // save the generated certificate into certs directory
      autoUpgrade: false,
      force: false, // force generation of certs even without setting https property in the vite config
    }),
  ]
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
        return Promise.all(environments.map((environment) => builder.build(environment)))
      },
    },
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
      // vite-plugin-mock-dev-server
      // plugin will read `server.proxy`
      // proxy: {
      //   "^/api": { target: "http://example.com" },
      // },
    },
    clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    dev: {
      bundler: 'rolldown',
    },
    build: {
      bundler: 'rolldown', // 显式声明使用 Rolldown
      sourcemap: false, // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 20 * 1000 * 1000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
      reportCompressedSize: false,
      rolldownOptions: {
        output: {
          // advancedChunks: {
          //   groups: [
          //     // 将 Vue 相关库分组
          //     {
          //       name: "vue-vendor",
          //       test: /[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/,
          //     },
          //     // // 1. 基础库分组
          //     // {
          //     //   name: "vendor-vitepress",
          //     //   test: /[\\/]node_modules[\\/](@?vitepress)[\\/]/,
          //     // },
          //     {
          //       name: "vendor-markdown-it",
          //       test: /[\\/]node_modules[\\/](markdown-it)(?![\\/]src)[\\/]/,
          //     },
          //     // // 2. 插件分组
          //     // {
          //     //   name: "plugin-vitepress",
          //     //   test: /[\\/]node_modules[\\/](vitepress-(plugin|theme)-[^\\/]+)[\\/]/,
          //     // },
          //     {
          //       name: "plugin-markdown-it",
          //       test: /[\\/]node_modules[\\/](markdown-it-[^\\/]+)[\\/]/,
          //     },
          //     // 将 UI 库分组（如 Element Plus、Ant Design）
          //     {
          //       name: "ui-vendor",
          //       test: /[\\/]node_modules[\\/](element-plus|ant-design-vue)[\\/]/,
          //     },
          //     // 将工具库分组（如 lodash、axios）
          //     {
          //       name: "utils-vendor",
          //       test: /[\\/]node_modules[\\/](lodash|axios)[\\/]/,
          //     },
          //     // 将大型可视化库单独分组（如 echarts、monaco-editor）
          //     {
          //       name: "charts",
          //       test: /[\\/]node_modules[\\/](echarts|monaco-editor)[\\/]/,
          //     },
          //     // 业务代码分割：将公共组件分组
          //     { name: "components", test: /[\\/]src[\\/]components[\\/]/ },
          //     // 业务代码分割：将工具函数分组
          //     { name: "utils", test: /[\\/]src[\\/]utils[\\/]/ },
          //     // 3. 兜底分组：其他 node_modules 依赖
          //     {
          //       name: "vendor",
          //       test: /[\\/]node_modules[\\/]/,
          //     },
          //     // {
          //     //   name: "vitepress-vender",
          //     //   test: /[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?vitepress-plugin-[^\\/]+[\\/]/,
          //     // },
          //     // {
          //     //   name: "markdownit-vender",
          //     //   test: /[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?markdown-it-[^\\/]+[\\/]/,
          //     // },
          //   ],
          // },
        },
      },
    },
    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
      webComponents: true,
      enableNativePlugin: true,
      fullBundleMode: true,
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
    plugins: [
      /*AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
        ],
      }),*/
      Components({
        dirs: ['./src/components', '.vitepress/components'], // 配置需要自动导入的组件目录
        dts: 'typings/components.d.ts',
        // 关键：让插件处理 .md 文件
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          NaiveUiResolver(),
          IconsResolver({
            // 自动引入的Icon组件统一前缀，默认为icon，设置false为不需要前缀
            prefix: 'icon',
            strict: true,
            // 当图标集名字过长时，可使用集合别名
            // alias: {
            //   system: 'system-uicons'
            // },
            // this is optional, default enabling all the collections supported by Iconify
            // enabledCollections: ['logos']
          }),
        ],
      }),
      Icons({
        compiler: 'vue3',
        autoInstall: true,
        scale: 1.2, // Scale of icons against 1em
        defaultStyle: '', // Style apply to icons
        defaultClass: '', // Class names apply to icons
      }),
      UnoCSS(),
      ...getDevPlugins(),
      vueStyledPlugin(),
      Iconify({
        collections: {
          cmono: './src/assets/icons/mono',
        },
      }),
      prefetchDnsPlugin(),
      versionInjector(),
      publicImagesPlugin(),
    ],
    resolve: {
      alias: {
        // Redirect 'fs' to an empty module or a browser-safe shim
        // fs: path.resolve("./src/empty-module.js"),
        '*': fileURLToPath(new URL('.', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // "@vp": fileURLToPath(new URL("./.vitepress", import.meta.url)),
        public: fileURLToPath(new URL('./public', import.meta.url)),
        // "~": path.resolve(__dirname, "./"),
        // '*': path.resolve(__dirname),
        // "@": path.resolve(__dirname, "src"),
        '@vp': path.resolve(__dirname, '.vitepress'),
        // public: fileURLToPath(new URL("./public", import.meta.url)),
        // // 注意一定不要随意命名，a b c这样的，项目的目录也不能为关键字保留字！！
        // "comp": resolve(__dirname, "src/components"),
        // // 配置图片要这样引用
        // "/img": "./src/assets",
      },
    },
    // vite: {
    //   css: {
    //     transformer: "lightningcss",
    //   },
    //   build: {
    //     cssMinify: "lightningcss",
    //   },
    // },
  }
})
