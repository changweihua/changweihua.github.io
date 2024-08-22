import { themeConfig } from "./src/theme";
import { docsConfig } from "./src/docs";
import { head } from "./src/head";
import { markdown } from "./src/markdown";
import { RssPlugin } from "vitepress-plugin-rss";
import { RSS } from "./src/rss";
// import { withMermaid } from "vitepress-plugin-mermaid";
import { defineConfig, HeadConfig } from "vitepress";
import { handleHeadMeta } from "./utils/handleHeadMeta";
import GitRevisionInfoPlugin from 'vite-plugin-git-revision-info';
import { getChangelogAndContributors } from 'vitepress-plugin-changelog'
import vitepressProtectPlugin from "vitepress-protect-plugin"
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
// import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin'

const customElements = [
  "mjx-container",
  "mjx-assistive-mml",
  "math",
  "maction",
  "maligngroup",
  "malignmark",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mi",
  "mlongdiv",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mscarries",
  "mscarry",
  "mscarries",
  "msgroup",
  "mstack",
  "mlongdiv",
  "msline",
  "mstack",
  "mspace",
  "msqrt",
  "msrow",
  "mstack",
  "mstack",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
  "math",
  "mi",
  "mn",
  "mo",
  "ms",
  "mspace",
  "mtext",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "msqrt",
  "mstyle",
  "mmultiscripts",
  "mover",
  "mprescripts",
  "msub",
  "msubsup",
  "msup",
  "munder",
  "munderover",
  "none",
  "maligngroup",
  "malignmark",
  "mtable",
  "mtd",
  "mtr",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "msrow",
  "mstack",
  "maction",
  "semantics",
  "annotation",
  "annotation-xml",
];

export default defineConfig({
  // mermaid: {
  //   // 'theme': 'base',
  //   // 'themeVariables': {
  //   //   'primaryColor': '#506bee',
  //   //   // 'primaryTextColor': '#fff',
  //   //   // 'primaryBorderColor': '#7C0000',
  //   //   // 'lineColor': '#F8B229',
  //   //   // 'secondaryColor': '#006100',
  //   //   // 'tertiaryColor': '#fff'
  //   // },
  //   fontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",
  //   altFontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",
  //   startOnLoad: false
  //   //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  // },
  // // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  // mermaidPlugin: {
  //   class: "mermaid rough-mermaid" // 为父容器设置额外的CSS类
  // },
  vite: {
    logLevel: 'info',
    // ↓↓↓↓↓
    plugins: [
      RssPlugin(RSS),
      vitepressProtectPlugin({
        disableF12: true,
        disableCopy: true,
        disableSelect: true,
      }),
      // viteDemoPreviewPlugin(),
      GitRevisionInfoPlugin(),
      groupIconVitePlugin({
        customIcon: {
          ae: 'logos:adobe-after-effects',
          ai: 'logos:adobe-illustrator',
          ps: 'logos:adobe-photoshop',
          // rspack: localIconLoader(import.meta.url, '../assets/rspack.svg'),
          // farm: localIconLoader(import.meta.url, '../assets/farm.svg'),
        },
      })
    ],
    // ↑↑↑↑↑
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
        whitespace: 'preserve'      // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
      },
    },
  },
  /* 文档配置 */
  ...docsConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  markdown,
  lastUpdated: false,
  // sitemap: {
  //   hostname: "https://changweihua.github.io",
  //   lastmodDateOnly: false,
  //   transformItems: (items) => {
  //     // add new items or modify/filter existing items
  //     items.push({
  //       url: "/extra-page",
  //       changefreq: "monthly",
  //       priority: 0.8,
  //     });
  //     return items;
  //   },
  // },
  rewrites: {
    '/index.md': '/zh-CN/index.md',
  },
  ignoreDeadLinks: true,
  // transformHead是一个构建钩子，用于在生成每个页面之前转换头。
  // 它将允许您添加无法静态添加到VitePress配置中的头条目。
  // 您只需要返回额外的条目，它们将自动与现有条目合并。
  // Don't mutate anything inside the ctx
  async transformHead(context): Promise<HeadConfig[]> {
    // const { assets }= context
    const head = handleHeadMeta(context)

    return head
  },
  async transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData
    const { contributors, changelog } = await getChangelogAndContributors(relativePath)
    const CustomAvatars = {
      'changweihua': '2877201'
    }
    const CustomContributors = contributors.map(contributor => {
      contributor.avatar = `https://avatars.githubusercontent.com/u/${CustomAvatars[contributor.name]}?v=4`
      return contributor
    })

    if (isNotFound) {
      pageData.title = 'Not Found'
    }

    return {
      CommitData: {
        contributors: CustomContributors,
        changelog,
        commitURL: 'https://github.com/changweihua/changweihua.github.io/commit/',
        title: 'Changelog'
      }
    }
  }
});
