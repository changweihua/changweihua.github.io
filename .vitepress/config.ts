import { themeConfig } from './src/theme'
import { docsConfig } from './src/docs'
import { head } from './src/head'
import { markdown } from './src/markdown'
import { RSS } from './src/rss'
import { HeadConfig, type UserConfig } from 'vitepress'
import { handleHeadMeta } from './utils/handleHeadMeta'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'
import MdH1 from 'vitepress-plugin-md-h1'
import AutoFrontmatter, { FileInfo } from 'vitepress-plugin-auto-frontmatter'
import { RssPlugin } from 'vitepress-plugin-rss'
import { resolve } from 'path'
import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import { SponsorPlugin } from 'vitepress-plugin-sponsor'
import llmstxtPlugin from 'vitepress-plugin-llmstxt'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { lightMermaidConfig } from './theme/mermaid-theme'

import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env'
import vueStyledPlugin from '@vue-styled-components/plugin'
import colors from 'picocolors'
import UnoCSS from 'unocss/vite'
import Iconify from 'unplugin-iconify-generator/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import versionInjector from 'unplugin-version-injector/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, type Plugin } from 'vite'
import { envParse } from 'vite-plugin-env-parse'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import Inspect from 'vite-plugin-inspect'
import mkcert from 'vite-plugin-mkcert'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import { qrcode } from 'vite-plugin-qrcode'
import { contentHashPlugin } from './plugins/contentHash'
import frontmatterHashPlugin from './plugins/frontmatterHash'

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
    vitePluginFakeServer({
      include: 'fake', // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
      enableProd: false, // 是否在生产环境下设置mock
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

const customElements = [
  'mjx-container',
  'mjx-assistive-mml',
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml',
  'hover-tilt',
  'my-button',
  'm-hero-logo',
]

const vitePressOptions: UserConfig = {
  /* 文档配置 */
  ...docsConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  markdown,
  metaChunk: true,
  sitemap: {
    hostname: 'https://changweihua.github.io',
    lastmodDateOnly: false,
    // level: ErrorLevel.SLIENT,
    transformItems: (items) => {
      // add new items or modify/filter existing items
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8,
      })
      return items
    },
  },
  // 配置路由选项
  router: {
    // linkActiveClass: 'active-parent', // 自定义一级路由高亮类名
    // linkExactActiveClass: 'active-exact' // 精确匹配类名（可选）
  },
  rewrites: {
    '^/index.md': '/zh-CN/index.md',
  },
  ignoreDeadLinks: true,
  async transformHead(context): Promise<HeadConfig[]> {
    // const { assets }= context
    const head = handleHeadMeta(context)

    return head
  },
  transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData

    if (isNotFound) {
      pageData.title = 'Not Found'
    }

    if (relativePath.includes('blog')) {
      pageData.titleTemplate = ':title | Blog'
    }

    //inject for mathjax script
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

// 转义Markdown中的尖括号，但保留代码块内容
function escapeMarkdownBrackets(markdownContent: string) {
  // 正则表达式模式：匹配代码块
  const codeBlockPattern = /```[\s\S]*?```|`[\s\S]*?`/g

  // 临时替换代码块为占位符
  const codeBlocks: Array<any> = []
  const contentWithoutCodeBlocks = markdownContent.replace(codeBlockPattern, (match) => {
    codeBlocks.push(match)
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`
  })

  // 转义普通文本中的尖括号
  const escapedContent = contentWithoutCodeBlocks.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 恢复代码块内容
  return escapedContent.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    return codeBlocks[index]
  })
}

/**
 * 创建 permalink 永久链接
 */
const createPermalink = () => {
  return {
    permalink: `/pages/${(Math.random() + Math.random()).toString(16).slice(2, 8)}`,
  }
}

/**
 * 创建 categories 分类列表
 *
 * @param fileInfo 文件信息
 */
const createCategory = (fileInfo: FileInfo) => {
  // relativePath 为基于 vp srcDir 的相对路径，默认是基于项目根目录，如 guide/vue/getting.md
  const relativePathArr = fileInfo.relativePath.split('/')

  const categories: string[] = []
  relativePathArr.forEach((filename, index) => {
    // 忽略文件名
    if (index !== relativePathArr.length - 1) categories.push(filename)
  })

  // [""] 表示添加一个为空的 categories
  return { categories: categories.length ? categories : [''] }
}

export default withMermaid(
  defineConfig({
    mermaid: {
      look: 'handDrawn',
      handDrawnSeed: 2,
      startOnLoad: false,
      layout: 'elk',
      fontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
      altFontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
      // 使用 CSS 变量
      ...lightMermaidConfig,
      securityLevel: 'loose',
      flowchart: { curve: 'basis', defaultRenderer: 'elk' },
      class: {
        defaultRenderer: 'elk',
      },
      state: {
        defaultRenderer: 'elk',
      },
      logLevel: 'error',
      suppressErrorRendering: true,
      //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
    },
    // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
    mermaidPlugin: {
      class: 'mermaid styled-mermaid', // 为父容器设置额外的CSS类
    },
    vite: {
      css: {
        lightningcss: {
          // 不报告未知规则为错误
          // 忽略未知的 CSS 规则
          errorRecovery: true,
          // 将 browserslist 转换为 LightningCSS 的目标格式
          targets: browserslistToTargets(browserslist('>= 0.25%')),
          // 关键配置：标记 deep 为合法伪类
          pseudoClasses: {},
          drafts: {
            customMedia: true, // 启用媒体查询变量
          },
          // 解决 scoped 样式问题
          cssModules: {
            // 禁用对 scoped 样式的命名转换
            pattern: '[name]__[local]___[hash]',
            // 配置CSS模块化
            // pattern: "[name]__[local]__[hash:base64:5]",
          },
        },
        // 同时使用 PostCSS 处理 @apply
        // postcss: true,
        devSourcemap: true,
        /**
         * 如果启用了这个选项，那么 CSS 预处理器会尽可能在 worker 线程中运行；即通过多线程运行 CSS 预处理器，从而极大提高其处理速度
         * https://cn.vitejs.dev/config/shared-options#css-preprocessormaxworkers
         */
        preprocessorMaxWorkers: 3,
        /**
         * 建议只用来嵌入 SCSS 的变量声明文件，嵌入后全局可用
         * 该选项可以用来为每一段样式内容添加额外的代码。但是要注意，如果你添加的是实际的样式而不仅仅是变量，那这些样式在最终的产物中会重复
         * https://cn.vitejs.dev/config/shared-options.html#css-preprocessoroptions-extension-additionaldata
         */
        preprocessorOptions: {
          scss: {
            // sourceMap: true,
            // 使用 sass-embedded 作为编译器
            // implementation: sassEmbedded,
            //additionalData: `@use "${path.resolve(__dirname, 'src/assets/styles/variables.scss')}" as vars; @debug "SCSS config loaded";`, // 强制全局注入
            additionalData: `@use "@vp/theme/styles/variables.scss" as vars;`, // 强制全局注入
            // api: "modern-compiler",
          },
        },
      },
      build: {
        cssMinify: 'lightningcss',
        rolldownOptions: {
          output: {
            codeSplitting: true,
          },
        },
      },
      // // 强制预构建
      // // Vite 的预构建会将 CommonJS / UMD 依赖转换为 ESM，并将多个内部模块合并为单个模块，减少 HTTP 请求数量。
      // optimizeDeps: {
      //   include: [
      //     'vue',
      //     'pinia',
      //     'dayjs',
      //     'unocss',
      //     'vue-router',
      //     'vue-i18n',
      //     'lodash-es',
      //     '@vueuse/core',
      //     'markdown-it',
      //   ],
      //   exclude: [
      //     '@iconify/json',
      //     'vue3-next-qrcode',
      //     'vitepress-plugin-detype',
      //     'vitepress-plugin-tabs',
      //     'vitepress-plugin-npm-commands',
      //   ],
      // },
      ssr: {
        external: [
          'vue3-next-qrcode',
          'vitepress-plugin-tabs',
          'vitepress-plugin-detype',
          'vitepress-plugin-npm-commands',
          'hover-tilt',
        ], // Externalize Node.js modules
        noExternal: [
          'vitepress-plugin-nprogress',
          'vitepress-component-medium-zoom',
          'vitepress-plugin-bprogress',
          'naive-ui',
          'date-fns',
          'vueuc',
        ],
      },
      resolve: {
        alias: [
          { find: 'vite', replacement: 'rolldown-vite' },
          { find: 'mermaid', replacement: 'mermaid' },
          { find: '@demo', replacement: resolve(__dirname, '../src/demos') },
          {
            find: /^.*\/VPFooter\.vue$/,
            replacement: resolve(__dirname, './components/LiquidPageFooter.vue'),
          },
          // { find: 'dep', replacement: '@vitejs/test-resolve-linked' },
        ],
      },
      logLevel: 'warn',
      plugins: [
        vueJsx(),
        // frontmatterHashPlugin(),
        ...getDevPlugins(),
        viteDemoPreviewPlugin(),
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
        vueStyledPlugin(),
        Iconify({
          collections: {
            cmono: './src/assets/icons/mono',
          },
        }),
        versionInjector(),
        groupIconVitePlugin({
          customIcon: {
            ae: 'logos:adobe-after-effects',
            ai: 'logos:adobe-illustrator',
            ps: 'logos:adobe-photoshop',
            mts: 'vscode-icons:file-type-typescript',
            cts: 'vscode-icons:file-type-typescript',
            ts: 'vscode-icons:file-type-typescript',
            tsx: 'vscode-icons:file-type-typescript',
            mjs: 'vscode-icons:file-type-js',
            cjs: 'vscode-icons:file-type-js',
            json: 'vscode-icons:file-type-json',
            js: 'vscode-icons:file-type-js',
            jsx: 'vscode-icons:file-type-js',
            md: 'vscode-icons:file-type-markdown',
            py: 'vscode-icons:file-type-python',
            ico: 'vscode-icons:file-type-favicon',
            html: 'vscode-icons:file-type-html',
            css: 'vscode-icons:file-type-css',
            scss: 'vscode-icons:file-type-scss',
            yml: 'vscode-icons:file-type-light-yaml',
            yaml: 'vscode-icons:file-type-light-yaml',
            php: 'vscode-icons:file-type-php',
            less: 'vscode-icons:file-type-less',
            // rspack: localIconLoader(import.meta.url, '../assets/rspack.svg'),
            // farm: localIconLoader(import.meta.url, '../assets/farm.svg'),
          },
        }),
        MdH1({
          ignoreList: ['/gallery/'],
          beforeInject: (frontmatter, id, title) => {
            // 根据文档路径判断
            if (id.includes('/resume')) return false
            if (id.includes('/me.')) return false
          },
        }),
        AutoFrontmatter({
          pattern: '**/*.md',
          exclude: { tag: true }, // 排除 tag: true 的 MD 文件，支持多个配置
          include: { tag: true }, // 支持多个配置
          // ✨ 通过 transform 函数来添加一个唯一的永久链接
          transform: (frontmatter, fileInfo) => {
            let transformResult = {}

            // 如果文件本身存在了 permalink，则不生成
            if (!frontmatter.permalink) {
              transformResult = { ...frontmatter, ...createPermalink() }
            }

            // 如果文件本身存在了 categories，则不生成
            if (!frontmatter.categories) {
              transformResult = {
                ...frontmatter,
                ...createCategory(fileInfo),
              }
            }

            // 确保返回值存在，如果返回 {} 将会清空文件本身的 frontmatter，返回 undefined 则告诉插件不使用 transform 返回的数据
            return Object.keys(transformResult).length ? transformResult : undefined
          },
        }),
        RssPlugin(RSS),
        // 打赏插件
        SponsorPlugin({
          /**
           * 打赏模块样式
           */
          type: 'drink',
          aliPayQR: '/Alipay.svg',
          weChatQR: '/wechat-pay.svg',
        }),
        llmstxtPlugin(),
        pagefindPlugin({
          forceLanguage: 'zh-CN',
          locales: {
            root: {
              btnPlaceholder: '搜索',
              placeholder: '搜索文档',
              emptyText: '空空如也',
              heading: '共: {{searchResult}} 条结果',
              toSelect: '选择',
              toNavigate: '切换',
              toClose: '关闭',
              searchBy: '',
            },
            'en-us': {
              btnPlaceholder: 'Search',
              placeholder: 'Search Docs...',
              emptyText: 'No results',
              heading: 'Total: {{searchResult}} search results.',
              // 搜索结果不展示最后修改日期日期
              showDate: false,
            },
            'zh-CN': {
              btnPlaceholder: '搜索',
              placeholder: '搜索文档',
              emptyText: '空空如也',
              heading: '共: {{searchResult}} 条结果',
              toSelect: '选择',
              toNavigate: '切换',
              toClose: '关闭',
              searchBy: '',
            },
          },
          excludeSelector: ['img', 'a.header-anchor'],
          customSearchQuery: chineseSearchOptimize,
        }),
        {
          name: 'patch-sidebar',
          enforce: 'pre',
          transform: (code, id) => {
            if (id.includes('VPSidebarItem.vue')) {
              return code.replaceAll(`:is="textTag"`, `is="p"`)
            }
          },
        },
      ],
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('mjx-') || customElements.includes(tag),
          // whitespace: "preserve", // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
        },
      },
    },
    ...vitePressOptions,
  } satisfies UserConfig)
)
