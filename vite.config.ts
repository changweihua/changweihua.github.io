// vite.config.ts
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin'
import vueStyledPlugin from '@vue-styled-components/plugin'
import UnoCSS from 'unocss/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import versionPlugin from './plugins/vite-plugin-version'
import versionInjector from 'unplugin-version-injector/vite'
import mkcert from 'vite-plugin-mkcert'
import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env'
import { envParse } from 'vite-plugin-env-parse'
import { loadEnv } from 'vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

function getEnvValue(mode: string, target: string) {
  const value = loadEnv(mode, process.cwd())[target]
  return value
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const timestamp = new Date().getTime()

  // 公共插件（始终启用）
  const sharedPlugins = [
    vueJsx(),
    // 代码预览插件保留，但根据原配置始终启用（如有需要可自行条件禁用）
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
          customCollections: ['cmono'], // 需要注册你的集合名
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      scale: 1.2,
      defaultStyle: '',
      defaultClass: '',
      customCollections: {
        cmono: FileSystemIconLoader('./src/assets/icons/mono'),
      },
    }),
    UnoCSS(),
    vueStyledPlugin(),
    versionInjector(),
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
    },

    build: {
      rolldownOptions: {
        output: {
          codeSplitting: true,
         // chunkFileNames: 'assets/js/[name]-[hash:8].js',
       //   entryFileNames: 'assets/js/entry-[name]-[hash:8].js',
          //assetFileNames: 'assets/[ext]/[name]-[hash:8].[ext]',

          //minifyInternalExports: true, // 启用内部导出重命名，可增强压缩效果

          //legalComments: 'none', // 去除许可证注释，减小体积
        },
      },
      cssMinify: 'lightningcss',
    },

    clearScreen: false,

    // 注意：以下构建配置已全部移至 .vitepress/config.ts，此处不再保留
    // 但为了开发服务器正常运行，可保留空的 build 或完全省略
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      'process.env': {},
      'process.env.RSS_BASE': JSON.stringify(
        `${getEnvValue(mode, 'VITE_APP_RSS_BASE_URL')}`
      ),
    },

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

    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
    },

    devtools: {
      enabled: true
    },
  }
})
