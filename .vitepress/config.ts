import { themeConfig } from "./src/theme";
import { defaultConfig } from "./src/defaults";
import { head } from "./src/head";
//配置的中文文档设置
import { zhConfig } from "./src/configs/zh";
import { RssPlugin } from "vitepress-plugin-rss";
import { RSS } from "./src/rss";
import { withMermaid } from "vitepress-plugin-mermaid";
import footnote from "markdown-it-footnote";
import mathjax3 from "markdown-it-mathjax3";
import timeline from "vitepress-markdown-timeline";
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
    build:{
      minify: "terser", // 使用 terser 进行代码压缩
    },
    // ↓↓↓↓↓
    plugins: [
      RssPlugin(RSS),
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
  markdown: {
    // ...
    config: (md) => {
      md.use(timeline);
      md.use(footnote);
      md.use(mathjax3);
    },
  },
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
