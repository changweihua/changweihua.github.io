import { MarkdownOptions } from 'vitepress'
import timeline from 'vitepress-markdown-timeline'
import footnote from 'markdown-it-footnote'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands'
import { wordless, chineseAndJapanese, Options } from 'markdown-it-wordless'
import MarkdownItCollapsible from 'markdown-it-collapsible'
import namedCode from 'markdown-it-named-code-blocks'
import echartsMarkdownPlugin from '../plugins/markdown/echarts-markdown'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import mathjax3 from 'markdown-it-mathjax3'
import MarkdownItGitHubAlerts from 'markdown-it-github-alerts'
import markdownItTableExt from 'markdown-it-multimd-table-ext'
import { vitepressMarkmapPreview } from 'vitepress-markmap-preview'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin'
import { resolve } from 'path'
import { demoPreviewPlugin } from '@vitepress-code-preview/plugin'
import { fileURLToPath, URL } from 'node:url'
import codeBarPlugin from '../plugins/markdown/codeBarPlugin'
import { linkToCardPlugin } from 'vitepress-linkcard'
import type { LinkToCardPluginOptions } from 'vitepress-linkcard'
import { markdownGlossaryPlugin } from 'vitepress-plugin-glossary'
import glossary from './glossary.json'
import vitepressEncrypt from 'markdown-it-vitepress-encrypt'
import picturePlugin from '../plugins/markdown/markdown-it-picture'
import { pathHashWrapperPlugin } from '../plugins/markdown/pathHashWrapper'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import MarkdownItGitHubMentionCard from 'markdown-it-github-mention-card'
import { tasklist } from '@mdit/plugin-tasklist';

const demoAlias = {
  '@demo': resolve(__dirname, '../../src/demos'),
  '@vp': resolve(__dirname, '../components'),
  '@assets': resolve(__dirname, '../../src/assets'),
}

const languageLabels: Record<string, string> = {
  aulua: 'AviUtl2 Lua',
}

const markdown: MarkdownOptions | undefined = {
  cache: false,
  lineNumbers: true,
  breaks: true,
  linkify: true,
  html: true,
  image: {
    lazyLoading: true,
  },
  math: true,
  theme: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
  languageLabel: {
    'vue': 'Vue SFC'
  },
  codeCopyButtonTitle: '复制',
  container: {
    tipLabel: '提示',
    warningLabel: '警告',
    dangerLabel: '危险',
    infoLabel: '信息',
    detailsLabel: '详细信息'
  },
  toc: { level: [1, 6] },
  preConfig: async (md) => {
  },
  defaultHighlightLang: 'plaintext',
  async shikiSetup(highlighter) {
    await highlighter.loadLanguage('html')
  },
  codeTransformers: [
    transformerTwoslash({
      typesCache: createFileSystemTypesCache()
    })
  ],
  languages: ['js', 'jsx', 'ts', 'tsx'],
  config: (md) => {
    md.use(tasklist);

    // ========== 1. 基础插件（无冲突） ==========
    md.use(MarkdownItGitHubMentionCard)

    // 自定义 fence 保留 language label，但后续会被包装，需放到最后再重新覆盖
    // 先保存原始 fence 渲染器
    const originalFence = md.renderer.rules.fence!.bind(md.renderer.rules)
    md.use(pathHashWrapperPlugin)
    md.use(picturePlugin, {
      containerClasses: ['figure-list', 'image-gallery', 'custom-container'],
      enableJXL: true,
      enableAVIF: true,
      enableWebP: true,
      figureClass: 'custom-figure',
      pictureClass: 'custom-picture',
      imgClass: 'custom-img',
      figcaptionClass: 'custom-figcaption',
      debug: false,
    })
    md.use(footnote)
    md.use(mathjax3)
    md.use<LinkToCardPluginOptions>(linkToCardPlugin, {})
    md.use(tabsMarkdownPlugin)
    md.use(npmCommandsMarkdownPlugin)
    md.use<Options>(wordless, { supportWordless: [chineseAndJapanese] })
    md.use(namedCode, { isEnableInlineCss: true })
    md.use(timeline)
    md.use(groupIconMdPlugin)
    md.use(echartsMarkdownPlugin)
    md.use(MarkdownItCollapsible)
    md.use(MarkdownItGitHubAlerts, { markers: '*' })
    md.use(markdownItTableExt, {
      multiline: true,
      rowspan: false,
      headerless: false,
      multibody: false,
      autolabel: false,
    })
    const docRoot = fileURLToPath(new URL('../../', import.meta.url))
    md.use(demoPreviewPlugin, { docRoot })
    md.use(markdownGlossaryPlugin, {
      glossary: glossary,
      firstOccurrenceOnly: true,
    })
    md.use(vitepressEncrypt, [
      { pageType: 'default', password: 'p1' },
      { pageType: 'vip', password: 'p11' },
    ])

    // ========== 2. Demo 插件共存方案 ==========
    // 由于三个 Demo 插件默认都使用 '::: demo' 容器，会导致冲突。
    // 解决方案：让其中两个插件使用不同的容器名称。
    // 这里假设插件的配置项支持自定义容器名（若实际不支持，需手动修改插件源码或使用包装器）。
    // 以下配置仅为示例，请根据实际插件版本调整。

    // 2.1 @vitepress-demo-preview/plugin：保留默认 'demo' 和 'component' 容器
    md.use(containerPreview, { clientOnly: true, alias: demoAlias })
    md.use(componentPreview, { clientOnly: true, alias: demoAlias })

    // 2.2 vitepress-better-demo-plugin：修改为使用 'better-demo' 容器（假设插件支持 demoBlockReg 选项）
    // 查阅其文档：https://github.com/FriendlyUser/vitepress-better-demo-plugin
    // 如果支持，可传递 demoBlockReg: /^better-demo\s*(.*)$/
    // 若不支持，请自行修改插件源码或使用 markdown-it-container 包装。
    md.use(vitepressDemoPlugin, {
      demoDir: resolve(__dirname, '../../src/demos'),
      lightTheme: 'catppuccin-latte',
      darkTheme: 'catppuccin-frappe',
      tabs: { order: 'html,vue,react', select: 'vue' },
      stackblitz: { show: true },
      codesandbox: { show: true },
      // 自定义容器名（需要插件支持）
      demoBlockReg: /^better-demo\s*(.*)$/,   // 使用时语法：::: better-demo
      demoBlockConfig: {
        // 其他配置...
      }
    })

    // 2.3 @vitepress-code-preview/plugin：修改为使用 'code-demo' 容器（同样需插件支持）
    // 该插件默认 demoBlockReg 为 /^demo\s*(.*)$/，可通过 options 覆盖
    md.use(demoPreviewPlugin, {
      docRoot,
      demoBlockReg: /^code-demo\s*(.*)$/,   // 使用时语法：::: code-demo
    })

    // ========== 3. 其他插件（无冲突或已调整） ==========
    // @ts-ignore
    codeBarPlugin(md)
    // @ts-ignore
    vitepressMarkmapPreview(md, { showToolbar: false })

    // ========== 4. 最后重新包装 fence 渲染器，确保 language label 生效 ==========
    // 注意：上述插件可能已经修改了 fence 规则，这里用包装模式保留所有增强功能
    const finalFence = md.renderer.rules.fence
    md.renderer.rules.fence = (...args) => {
      let result = finalFence ? finalFence(...args) : originalFence(...args)
      // 应用自定义语言标签
      result = result.replace(
        /(?<=class="lang">)([^<]*)/,
        (_, p1) => languageLabels[p1] ?? p1
      )
      return result
    }

    // ========== 5. 表格和文字样式增强（无冲突） ==========
    // ---------- 5. 表格与文本样式 ----------
    md.renderer.rules.table_open = () => '<div class="vp-table-container"><table class="vp-table striped">'
    md.renderer.rules.table_close = () => '</table></div>'
    md.renderer.rules.strong_open = () => '<strong class="font-bold">'
    md.renderer.rules.strong_close = () => '</strong>'
    md.renderer.rules.em_open = () => '<em class="italic">'
    md.renderer.rules.em_close = () => '</em>'

    // ========== 6. 文章元数据组件注入 ==========
    md.renderer.rules.heading_close = (tokens, idx, options, env, render) => {
      let htmlResult = render.renderToken(tokens, idx, options)
      if (
        tokens[idx].tag === 'h1' &&
        env['relativePath'] &&
        env['relativePath'].includes('/blog/') &&
        !env._hasAddedMetadata
      ) {
        env._hasAddedMetadata = true
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`
      }
      return htmlResult
    }
  },
}

export { markdown }
