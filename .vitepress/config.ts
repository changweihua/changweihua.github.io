import { themeConfig } from "./src/theme";
import { defaultConfig } from "./src/defaults";
import { head } from "./src/head";
//配置的中文文档设置
import { zhConfig } from "./src/configs/zh";
import { RssPlugin } from "vitepress-plugin-rss";
import { RSS } from "./src/rss";
import { markdown } from "./src/markdown";
import { withMermaid } from "vitepress-plugin-mermaid";
import { HeadConfig } from "vitepress";
import { genDescription } from "./utils/genDescription";
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
    //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  },
  vite: {
    // ↓↓↓↓↓
    plugins: [
      RssPlugin(RSS),
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
      },
    },
  },
  ...defaultConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  /* 语言配置 */
  locales: {
    root: { label: "简体中文", lang: "zh-CN", link: "/", ...zhConfig },
    // en: { label: "English", lang: "en-US", link: "/en/", ...enConfig },
  },
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
    // add <meta>s
    const description = genDescription(context.page)
    const title = context.pageData.title
    // const url = `https://jiongks.name/${getIdFromFilePath(context.page)}`
    const published = context.pageData.frontmatter.date
    const updated = context.pageData.frontmatter.updated
    const ogImage = context.pageData.frontmatter.manual_og_image
    const tags = context.pageData.frontmatter.tags || []
    const type = context.page.startsWith('blog/') ? 'article' : 'website'

    const head: HeadConfig[] = [
      // // Basic
      // description ? genMeta('description', description) : undefined,

      // // Open Graph
      // description ? genMeta('og:description', description) : undefined,
      // genMeta('og:title', title),
      // genMeta('og:url', url),
      // genMeta('og:type', type),
      // ogImage ? genMeta('og:image', `https://jiongks.name/${ogImage}`): undefined,

      // // Twitter
      // description ? genMeta('twitter:description', description) : undefined,
      // genMeta('twitter:title', title),
      // genMeta('twitter:url', url),
      // ogImage ? genMeta('twitter:image', `https://jiongks.name/${ogImage}`): undefined,
      // genMeta('twitter:card', ogImage ? 'summary_large_image' : 'summary'),

      // // Article
      // published ? genMeta('article:published_time', published) : undefined,
      // updated ? genMeta('article:modified_time', updated) : undefined,
      // ...tags.map((tag: string) => genMeta('article:tag', tag)),
    ].filter(Boolean)

    return head
  },
  // buildEnd: genFeed
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
});
