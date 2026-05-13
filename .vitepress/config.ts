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
import llmstxtPlugin from 'vitepress-plugin-llmstxt'

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
  // ... 保持你原来的 customElements 列表不变 ...
  'mjx-container', 'mjx-assistive-mml', 'math', /* ... 省略，保持原样 ... */
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
  router: {
    // 自定义路由类名等
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
      fontFamily: 'MapleMono, AlibabaPuHuiTi, \'阿里巴巴普惠体 3.0\'',
      altFontFamily: 'MapleMono, AlibabaPuHuiTi, \'阿里巴巴普惠体 3.0\'',
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
    // vite 中只保留 VitePress 专属插件
    vite: {
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
        llmstxtPlugin({
          hostname: 'https://changweihua.github.io',
          ignore: [
            '**/blog/2023-*/**/*.md',
            '**/blog/2024-*/**/*.md',
            '**/blog/2025-*/**/*.md',
          ],
          llmsFullFile: false,
          watch: true,
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
    },
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
