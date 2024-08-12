import { themeConfig } from "./src/theme";
import { docsConfig } from "./src/docs";
import { head } from "./src/head";
import { RssPlugin } from "vitepress-plugin-rss";
import { RSS } from "./src/rss";
import { markdown } from "./src/markdown";
import { withMermaid } from "vitepress-plugin-mermaid";
import { HeadConfig } from "vitepress";
import { handleHeadMeta } from "./utils/handleHeadMeta";
import GitRevisionInfoPlugin from 'vite-plugin-git-revision-info';
import { getChangelogAndContributors } from 'vitepress-plugin-changelog'
import vitepressProtectPlugin from "vitepress-protect-plugin"
// import compression from "vitepress-plugin-compression";
// import AutoIndex from 'vite-plugin-vitepress-auto-index';
// import { createDetypePlugin } from 'vitepress-plugin-detype'
// const { detypeVitePlugin } = createDetypePlugin()

const links: any[] = [];
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

export default withMermaid({
  mermaid: {
    // 'theme': 'base',
    // 'themeVariables': {
    //   'primaryColor': '#506bee',
    //   // 'primaryTextColor': '#fff',
    //   // 'primaryBorderColor': '#7C0000',
    //   // 'lineColor': '#F8B229',
    //   // 'secondaryColor': '#006100',
    //   // 'tertiaryColor': '#fff'
    // },
    fontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",
    altFontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",

    //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  },
  // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  mermaidPlugin: {
    class: "mermaid rough-mermaid" // 为父容器设置额外的CSS类
  },
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
      GitRevisionInfoPlugin()
      // {
      //   ...AutoIndex({}),
      //   enforce: 'pre'
      // },
      // detypeVitePlugin(),
      // detypeMarkdownPlugin(),
      // require("./plugins/frontmatter")
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
  /* 语言配置 */
  // locales: {
  //   // 若果配置了root，则双击title的时候不会返回/路径下了，只会返回在link路径下
  //   // root: { label: "简体中文", lang: "zh-CN", link: "/zh-CN",  ...zhConfig },
  //   'zh-CN': { label: "简体中文", lang: "zh-CN", link: "/zh-CN", ...zhConfig },
  //   'en-US': { label: "English", lang: "en-US", link: "/en-US/", ...enConfig },
  // },
  lastUpdated: false,
  // titleTemplate: ':title - Custom Suffix',
  sitemap: {
    hostname: "https://changweihua.github.io",
    lastmodDateOnly: false,
    transformItems: (items) => {
      // add new items or modify/filter existing items
      items.push({
        url: "/extra-page",
        changefreq: "monthly",
        priority: 0.8,
      });
      return items;
    },
  },
  transformHtml: (_, id, { pageData }) => {
    if (!/[\\/]404\.html$/.test(id)) {
      links.push({
        url: pageData.relativePath
          .replace(/\/index\.md$/, "/")
          .replace(/\.md$/, ".html"),
        lastmod: pageData.lastUpdated,
      });
    }
  },
  ignoreDeadLinks: true,
  markdown,
  async buildEnd() {
    console.log('buildEnd')
    // compression();
  },
  async transformHead(context): Promise<HeadConfig[]> {
    // const { assets }= context
    const head = handleHeadMeta(context)

// 相应地调整正则表达式以匹配字体
    // const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
    // if (myFontFile) {
    //   return [
    //     [
    //       'link',
    //       {
    //         rel: 'preload',
    //         href: myFontFile,
    //         as: 'font',
    //         type: 'font/woff2',
    //         crossorigin: ''
    //       }
    //     ]
    //   ]
    // }

    return head
  },
  // markdown: {
  //   // ...
  //   config: (md) => {
  //     md.use(timeline);
  //     md.use(footnote);
  //     md.use(mathjax3);
  //   },
  // },
  // transformHtml: (_, id, { pageData }) => {
  //   if (!/[\\/]404\.html$/.test(id))
  //     links.push({
  //       // you might need to change this if not using clean urls mode
  //       url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, "$2"),
  //       lastmod: pageData.lastUpdated,
  //     });
  // },
  // buildEnd: async ({ outDir }) => {
  //   const sitemap = new SitemapStream({
  //     hostname: "https://changweihua.github.io/",
  //   });
  //   const writeStream = createWriteStream(resolve(outDir, "sitemap.xml"));
  //   sitemap.pipe(writeStream);
  //   links.forEach((link) => sitemap.write(link));
  //   sitemap.end();
  //   await new Promise((r) => writeStream.on("finish", r));
  // },
  // optionally, you can pass MermaidConfig
  // mermaid: {
  //   // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  // },
  // optionally set additional config for plugin itself with MermaidPluginConfig
  // mermaidPlugin: {
  //   class: "mermaid my-class", // set additional css classes for parent container
  // },
  // async transformPageData({ relativePath }) {
  //   const { contributors, changelog } = await getChangelogAndContributors(relativePath)
  //   return {
  //     CommitData: {
  //       contributors,
  //       changelog,
  //       commitURL: 'https://github.com/changweihua/changweihua.github.io/commit/',
  //       title: 'Changelog'
  //     }
  //   }
  // }
  async transformPageData({ relativePath }) {
    const { contributors, changelog } = await getChangelogAndContributors(relativePath)
    const CustomAvatars = {
      'changweihua': '2877201'
    }
    const CustomContributors = contributors.map(contributor => {
      contributor.avatar = `https://avatars.githubusercontent.com/u/${CustomAvatars[contributor.name]}?v=4`
      return contributor
    })
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
