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
// import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin';
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
import { tasklist } from "@mdit/plugin-tasklist";
import markdownItAnchor from 'markdown-it-anchor'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'

const demoAlias = {
  '@demo': resolve(__dirname, '../../src/demos'),
  '@vp': resolve(__dirname, '../components'),
  '@assets': resolve(__dirname, '../../src/assets'),
}

const languageLabels: Record<string, string> = {
  aulua: 'AviUtl2 Lua',
};

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
  // // markdown-it-anchor 的选项
  // // https://github.com/valeriangalliat/markdown-it-anchor#usage
  // anchor: {
  //   permalink: markdownItAnchor.permalink.headerLink()
  // },
  // @mdit-vue/plugin-toc 的选项
  // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
  toc: { level: [1, 2] },
  preConfig: async (md) => {
  },
  // 当指定语言无法高亮时，回退到 'plaintext' 或 'txt'
  defaultHighlightLang: 'plaintext',
  async shikiSetup(highlighter) {
    // 示例1：加载特定语言，如 'jinja-html'
    // 注意：它通常依赖 'html'，所以先加载 'html'
    await highlighter.loadLanguage('html')
    // 然后再加载 'jinja-html' 本身
    // await highlighter.loadLanguage('jinja-html')

    // 示例2：加载一个冷门的独立语言，比如 'brainfuck'
    // await highlighter.loadLanguage('brainfuck')
  },
  codeTransformers: [
    transformerTwoslash({
      typesCache: createFileSystemTypesCache()
    })
  ],
  // Explicitly load these languages for types highlighting
  languages: ['js', 'jsx', 'ts', 'tsx'],
  config: (md) => {
    // ---------- 打印所有块级规则（调试用）----------
    const blockRules = md.block.ruler.getRules('').map(rule => rule.name);
    console.log('All block rules:', blockRules);

    md.block.ruler.getRules('').forEach(rule => {
      if (rule.name.includes('task')) {
        try { md.block.ruler.disable(rule.name); } catch (e) { }
      }
    });

    const fence = md.renderer.rules.fence!.bind(md.renderer.rules);
    md.renderer.rules.fence = (...args) => {
      return fence(...args).replace(
        /(?<=class="lang">)([^<]*)/,
        (_, p1) => languageLabels[p1] ?? p1
      );
    };

    md.use(tasklist, {
      // your options, optional
    });

    md.use(pathHashWrapperPlugin)

    md.use(picturePlugin, {
      // 容器配置：处理哪些容器内的图片
      containerClasses: ['figure-list', 'image-gallery', 'custom-container'],

      // 格式控制（根据您的转换脚本支持情况调整）
      enableJXL: true,
      enableAVIF: true,
      enableWebP: true,

      // 类名配置
      figureClass: 'custom-figure',
      pictureClass: 'custom-picture',
      imgClass: 'custom-img',
      figcaptionClass: 'custom-figcaption',

      // 调试模式（开发时启用，生产时关闭）
      debug: false,
    })

    md.use(footnote)

    md.use(mathjax3)

    md.use<LinkToCardPluginOptions>(linkToCardPlugin, {
      // target: "_self" // if needed
    })
    /**
     * SSR Compatibility
     * @link https://vitepress.dev/guide/ssr-compat
     * If the components are not SSR-friendly, you can specify the clientOnly to disable SSR.
     */
    md.use(containerPreview, { clientOnly: true, alias: demoAlias })
    md.use(componentPreview, { clientOnly: true, alias: demoAlias })
    md.use(tabsMarkdownPlugin)
    md.use(npmCommandsMarkdownPlugin)
    md.use<Options>(wordless, { supportWordless: [chineseAndJapanese] })
    md.use(namedCode, { isEnableInlineCss: true })
    md.use(timeline)
    md.use(groupIconMdPlugin)
    md.use(echartsMarkdownPlugin)
    md.use(MarkdownItCollapsible)
    md.use(MarkdownItGitHubAlerts, {
      /* Options */
      markers: '*',
    })
    md.use(markdownItTableExt, {
      multiline: true,
      rowspan: false,
      headerless: false,
      multibody: false,
      autolabel: false,
    })
    const docRoot = fileURLToPath(new URL('../../', import.meta.url))
    md.use(demoPreviewPlugin, {
      docRoot,
    })

    md.use(markdownGlossaryPlugin, {
      glossary: glossary,
      firstOccurrenceOnly: true,
    })

    md.use(vitepressEncrypt, [
      { pageType: 'default', password: 'p1' },
      { pageType: 'vip', password: 'p2' },
    ])

    // @ts-ignore
    codeBarPlugin(md)

    // @ts-ignore
    vitepressMarkmapPreview(md, {
      showToolbar: false,
    })

    md.use(vitepressDemoPlugin, {
      demoDir: resolve(__dirname, '../../src/demos'),
      lightTheme: 'catppuccin-latte',
      darkTheme: 'catppuccin-frappe',
      tabs: {
        order: 'html,vue,react',
        select: 'vue',
      },
      stackblitz: {
        show: true,
      },
      codesandbox: {
        show: true,
      },
    })

    // 修改表格的 HTML 结构
    md.renderer.rules.table_open = () =>
      `<div class="vp-table-container"><table class="vp-table striped ">`
    md.renderer.rules.table_close = () => '</table></div>'

    // 修改表头单元格样式
    // md.renderer.rules.th_open = () =>
    //   '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">';
    // md.renderer.rules.td_open = () =>
    //   '<td style="border: 1px solid #ddd; padding: 8px;">';

    // 自定义加粗文本的渲染
    md.renderer.rules.strong_open = () => '<strong class="font-bold">'
    md.renderer.rules.strong_close = () => '</strong>'

    // 自定义斜体文本的渲染
    md.renderer.rules.em_open = () => '<em class="italic">'
    md.renderer.rules.em_close = () => '</em>'

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, render) => {
      let htmlResult = render.renderToken(tokens, idx, options)

      // 只在第一个h1标签后添加
      if (
        tokens[idx].tag === 'h1' &&
        env['relativePath'] &&
        env['relativePath'].includes('/blog/')
      ) {
        // 检查是否已经添加过
        const hasAddedMetadata = env._hasAddedMetadata || false
        if (!hasAddedMetadata) {
          env._hasAddedMetadata = true
          htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`
        }
      }

      return htmlResult
    }

  },
}

export { markdown }



