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
import packOrchestrator from 'unplugin-pack-orchestrator/vite'
import buildTimePlugin from '@zppo/vite-plugin-build-time';
import { fileURLToPath } from 'node:url'

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
    buildTimePlugin({
      // 使用 ISO 格式时间
      format: 'ISO',
      // 自定义 meta 标签的 name
      metaName: 'app-release-time',
      // 仅在生产环境构建时启用
      enabled: process.env.NODE_ENV === 'production'
    }),
    Components({
      dirs: ['./src/components', '.vitepress/components'],
      dts: 'typings/components.d.ts',
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({
          prefix: 'icon',
          strict: true,
          customCollections: ['cmono'] // 需要注册你的集合名
        })
      ]
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      scale: 1.2,
      defaultStyle: '',
      defaultClass: '',
      customCollections: {
        cmono: FileSystemIconLoader('./src/assets/icons/mono')
      }
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
    })
  ]

  // 仅开发环境启用的插件
  const devPlugins = isProduction
    ? []
    : [
      ValidateEnv({
        validator: 'builtin',
        schema: {
          VITE_APP_PRIMARY_COLOR: Schema.string()
        }
      }),
      envParse(),
      {
        name: 'dev-error-handler',
        configureServer(server: any) {
          server.middlewares.use('/api', (req: any, _res: any, next: any) => {
            console.log(`🔍 API Request: ${req.method} ${req.url}`)
            next()
          })
        }
      },
      mkcert({
        savePath: './certs',
        autoUpgrade: false,
        force: false
      })
    ]

  const prodPlugins = isProduction
    ? [
      packOrchestrator({
        pack: {
          outDir: 'dist',
          fileName: 'release-[name]-v[version]',
          format: 'zip',
          archiveOutDir: './releases',
          exclude: ['**/*.map', '**/*.d.ts', 'node_modules/**']
        },
        hooks: {
          // 归档后自动追加 SHA1 哈希
          onAfterBuild: (path, format, checksums) =>
            path.replace(/(.(?:zip|tar.gz|tar|7z))$/, `-${checksums.sha1.slice(0, 8)}$1`),
          onError: (err) => console.error('打包失败:', err.message)
        }
      })
    ]
    : []

  return {
    plugins: [...sharedPlugins, ...devPlugins, ...prodPlugins],

    experimental: {
      // bundledDev: true,
      importGlobRestoreExtension: true,
      hmrPartialAccept: true
    },

    html: {
      additionalAssetSources: {
        "html-import": {
          srcAttributes: ["src"]
        },
        img: {
          srcAttributes: [
            "data-src-dark",
            "data-src-light"
          ]
        }
      }
    },

    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: 'public', replacement: fileURLToPath(new URL('./public', import.meta.url)) },
        { find: '@vp', replacement: fileURLToPath(new URL('./.vitepress', import.meta.url)) },
        { find: '@demo', replacement: fileURLToPath(new URL('./src/demos', import.meta.url)) }
      ]
    },

    server: {
      host: '0.0.0.0',
      port: 4200,
      open: true,
      hmr: {
        overlay: true
      }
    },



    build: {
      rolldownOptions: {
        output: {
          codeSplitting: true
          // chunkFileNames: 'assets/js/[name]-[hash:8].js',
          //   entryFileNames: 'assets/js/entry-[name]-[hash:8].js',
          //assetFileNames: 'assets/[ext]/[name]-[hash:8].[ext]',

          //minifyInternalExports: true, // 启用内部导出重命名，可增强压缩效果

          //legalComments: 'none', // 去除许可证注释，减小体积
        }
      },
      cssMinify: 'lightningcss'
    },

    clearScreen: false,

    // 注意：以下构建配置已全部移至 .vitepress/config.ts，此处不再保留
    // 但为了开发服务器正常运行，可保留空的 build 或完全省略
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      'process.env': {},
      'process.env.RSS_BASE': JSON.stringify(`${getEnvValue(mode, 'VITE_APP_RSS_BASE_URL')}`)
    },

    optimizeDeps: {
      entries: ['zh-CN/**/*.md', 'zh-CN/**/*.vue', '.vitepress/**/*.ts', '.vitepress/**/*.vue'],
      include: [
        'mermaid',
        'dayjs',
        'debug',
        '@braintree/sanitize-url',
        'cytoscape',
        'cytoscape-cose-bilkent',
        // 第一次已构建的（可省略，但列出能加快扫描）
        'echarts',
        'naive-ui',
        'lodash-es',
        'three',
        'animejs',
        'medium-zoom',
        '@vueuse/components',
        'deepmerge-ts',
        'random',
        'vitepress-component-medium-zoom',
        'vitepress-plugin-llmstxt/client',
        // 第二次才发现的，强制提前构建
        '@tombcato/smart-ticker/vue',
        'dompurify',
        'marked'
      ],
      exclude: ['vitepress', 'echarts', 'three', 'naive-ui']
    },


    devtools: {
      enabled: true
    }
  }
})
