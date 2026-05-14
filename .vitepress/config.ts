// .vitepress/config.ts
import type { HeadConfig, UserConfig } from 'vitepress'
import type { FileInfo } from 'vitepress-plugin-auto-frontmatter'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoFrontmatter from 'vitepress-plugin-auto-frontmatter'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import MdH1 from 'vitepress-plugin-md-h1'
import { RssPlugin } from 'vitepress-plugin-rss'
import { withMermaid } from "vitepress-plugin-mermaid"
// import llmstxtPlugin from 'vitepress-plugin-llmstxt'

// 你的站点子配置
import { docsConfig } from './src/docs'
import { head } from './src/head'
import { markdown } from './src/markdown'
import { RSS } from './src/rss'
import { themeConfig } from './src/theme'
import { lightMermaidConfig } from './theme/mermaid-theme'
import { handleHeadMeta } from './utils/handleHeadMeta'

// 解决 __dirname 问题（兼容 ESM 环境）
const __dirname = new URL('.', import.meta.url).pathname

const customElements = [
  'mjx-container', 'mjx-assistive-mml', 'math',
  'hover-tilt', 'my-button', 'm-hero-logo',
]

/**
 * 创建 permalink 永久链接
 */
function createPermalink() {
  return {
    permalink: `/pages/${(Math.random() + Math.random()).toString(16).slice(2, 8)}`,
  }
}

/**
 * 创建 categories 分类列表
 */
function createCategory(fileInfo: FileInfo) {
  const relativePathArr = fileInfo.relativePath.split('/')
  const categories: string[] = []
  relativePathArr.forEach((filename, index) => {
    if (index !== relativePathArr.length - 1) categories.push(filename)
  })
  return { categories: categories.length ? categories : [''] }
}

const vitePressOptions: UserConfig = {
  ...docsConfig,
  head,
  themeConfig,
  markdown,
  metaChunk: true,
  sitemap: {
    hostname: 'https://changweihua.github.io',
    lastmodDateOnly: false,
    transformItems: (items) => {
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8,
      })
      return items
    },
  },
  rewrites: {
    '^/index.md': '/zh-CN/index.md',
  },
  ignoreDeadLinks: true,
  async transformHead(context): Promise<HeadConfig[]> {
    return handleHeadMeta(context)
  },
  transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData
    if (isNotFound) {
      pageData.title = 'Not Found'
    }
    if (relativePath.includes('blog')) {
      pageData.titleTemplate = ':title | Blog'
    }
    const head = (pageData.frontmatter.head ??= [])
    const inject_content = pageData.frontmatter.inject_content
    if (inject_content && Array.isArray(inject_content)) {
      inject_content.forEach((item) => {
        const { type, contribution, content } = item
        const headEntry = [type, contribution || {}, content || ''].filter(Boolean)
        head.push(headEntry as HeadConfig)
      })
      delete pageData.frontmatter.inject_content
    }
  },
}

export default withMermaid(
  {
    mermaid: {
      look: 'handDrawn',
      handDrawnSeed: 2,
      startOnLoad: false,
      layout: 'elk',
      fontFamily: 'MapleMono, AlibabaPuHuiTi',
      altFontFamily: 'MapleMono, AlibabaPuHuiTi',
      ...lightMermaidConfig,
      securityLevel: 'loose',
      flowchart: { curve: 'basis', defaultRenderer: 'elk' },
      class: { defaultRenderer: 'elk' },
      state: { defaultRenderer: 'elk' },
      logLevel: 'error',
      suppressErrorRendering: true,
    },
    mermaidPlugin: {
      class: 'mermaid styled-mermaid',
    },
    // ============== 原 vite.config.ts 中的构建配置移回此处 ==============
    vite: {
      // 原有 VitePress 专属插件（保持不变）
      plugins: [
        groupIconVitePlugin({
          customIcon: {
            ae: 'logos:adobe-after-effects',
            // ... 保持你的图标映射不变 ...
          },
        }),
        MdH1({
          ignoreList: ['/gallery/'],
          beforeInject: (_frontmatter, id, _title) => {
            if (id.includes('/resume')) return false
            if (id.includes('/me.')) return false
          },
        }),
        AutoFrontmatter({
          pattern: '**/*.md',
          exclude: { tag: true },
          include: { tag: true },
          transform: (frontmatter, fileInfo) => {
            let transformResult = {}
            if (!frontmatter.permalink) {
              transformResult = { ...frontmatter, ...createPermalink() }
            }
            if (!frontmatter.categories) {
              transformResult = {
                ...frontmatter,
                ...createCategory(fileInfo),
              }
            }
            return Object.keys(transformResult).length ? transformResult : undefined
          },
        }),
        RssPlugin(RSS),
      ],

      // 以下是从 vite.config.ts 迁移回来的构建配置
      build: {
        sourcemap: false,
        chunkSizeWarningLimit: 20 * 1000,
        cssMinify: 'lightningcss',
        rolldownOptions: {
          output: {
            // 代码分割产生的 chunk 文件命名
            chunkFileNames: 'assets/js/[name]-[hash:8].js',
            // 入口文件命名
            entryFileNames: 'assets/js/entry-[name]-[hash:8].js',
            // 静态资源文件命名
            assetFileNames: 'assets/[ext]/[name]-[hash:8].[ext]',
            // codeSplitting: {
            //   groups: [
            //     {
            //       name: 'vendor-common',
            //       test: /node_modules\/(vitepress|vue)/,
            //       priority: 30,
            //       // 单个 chunk 最大不超过 200KB
            //       maxSize: 200 * 1024,
            //     },
            //     {
            //       name: 'vendor-utils',
            //       test: (moduleId) => {
            //         // 自定义函数逻辑：匹配 node_modules 下除了 vue 和 vitepress 之外的库
            //         if (moduleId.includes('node_modules') &&
            //           !moduleId.includes('vue')) {
            //           return true;
            //         }
            //         return false;
            //       },
            //       // 最小共享次数，模块被引用至少2次才被分割
            //       minShareCount: 2,
            //       priority: 10,
            //     },
            //     {
            //       name: 'vendor-precise',
            //       test: /node_modules/,
            //       // 按入口感知，自动为不同的页面入口生成独立的 vendor chunk
            //       entriesAware: true,
            //       priority: 20,
            //     },
            //     // ✅ 第二层：处理 VueUse 等已内联的按需函数
            //     // 此时不需要 entriesAware，改用 minShareCount
            //     {
            //       name: 'vueuse-shared',
            //       test: (moduleId) => {
            //         // 匹配已经被内联进项目的 VueUse 函数
            //         return moduleId.includes('@vueuse/') ||
            //           moduleId.includes('.vueuse.') ||
            //           // 如果你的 autoImport 有自定义前缀，也加入
            //           moduleId.includes('useStorage') ||
            //           moduleId.includes('useDark')
            //       },
            //       // 核心：函数至少被 3 个页面引用，才提取为公共 chunk
            //       minShareCount: 3,
            //       // 控制 chunk 数量，避免太多请求
            //       priority: 10
            //     }
            //   ],
            // },
            codeSplitting: true,
            // 控制 chunk 的哈希字符集
            hashCharacters: 'base64',
            // 严格保证模块的执行顺序，可能对代码分割有轻微影响
            strictExecutionOrder: true,
            minifyInternalExports: true,
            manualChunks: undefined, // 如无特殊设置可忽略
          },
        },
      },
      css: {
        lightningcss: {
          errorRecovery: true,
          targets: (await import('lightningcss')).browserslistToTargets(
            (await import('browserslist')).default('>= 0.25%')
          ),
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
      resolve: {
        alias: [
          {
            find: /^.*\/VPFooter\.vue$/,
            replacement: fileURLToPath(new URL('./components/LiquidPageFooter.vue', import.meta.url)),
          },
          { find: '@', replacement: fileURLToPath(new URL('../src', import.meta.url)) },
          { find: 'public', replacement: fileURLToPath(new URL('../public', import.meta.url)) },
          { find: '@vp', replacement: fileURLToPath(new URL('../.vitepress', import.meta.url)) },
          // 通常 VitePress 不会直接引用 vite，移除也无妨。为保证原样，可添加：
          // { find: 'vite', replacement: 'rolldown-vite' },
          { find: 'mermaid', replacement: 'mermaid' },
          { find: '@demo', replacement: resolve(__dirname, '../src/demos') },
        ],
      },
    },
    // ============== 结束迁移 ==============
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes('mjx-') || customElements.includes(tag),
        },
      },
    },
    ...vitePressOptions,
  } satisfies UserConfig
)
