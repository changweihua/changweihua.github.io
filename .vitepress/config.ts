// .vitepress/config.ts
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
        emptyOutDir: true,
        reportCompressedSize: true,
        cssMinify: 'lightningcss',
        rollupOptions: {
          output: {
            // 原 vite.config.ts 中的 rolldownOptions 实际应为 rollupOptions
            codeSplitting: true,
            minifyInternalExports: true,
            compact: true,
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
          { find: '@', replacement: fileURLToPath(new URL('../src', import.meta.url)) },
          { find: 'public', replacement: fileURLToPath(new URL('../public', import.meta.url)) },
          { find: '@vp', replacement: fileURLToPath(new URL('../.vitepress', import.meta.url)) },
          // 注意：之前 vite.config.ts 中还有 'vite' -> 'rolldown-vite' 的别名，如果 VitePress 需要可保留，
          // 但通常 VitePress 不会直接引用 vite，移除也无妨。为保证原样，可添加：
          // { find: 'vite', replacement: 'rolldown-vite' },
          { find: 'vite', replacement: 'rolldown-vite' },
          { find: 'mermaid', replacement: 'mermaid' },
          { find: '@demo', replacement: resolve(__dirname, '../src/demos') },
          {
            find: /^.*\/VPFooter\.vue$/,
            replacement: resolve(__dirname, './components/LiquidPageFooter.vue'),
          },
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
