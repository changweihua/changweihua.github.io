import { MarkdownOptions } from "vitepress";
import timeline from "vitepress-markdown-timeline";
import footnote from "markdown-it-footnote";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import { npmCommandsMarkdownPlugin } from "vitepress-plugin-npm-commands";
import { wordless, chineseAndJapanese, Options } from "markdown-it-wordless";
import MarkdownItCollapsible from "markdown-it-collapsible";
import namedCode from "markdown-it-named-code-blocks";
import readerMarkdownPlugin from "../plugins/markdown/reader-markdown";
import circleMarkdownPlugin from "../plugins/markdown/circle-markdown";
import echartsMarkdownPlugin from "../plugins/markdown/echarts-markdown";
import { groupIconMdPlugin } from "vitepress-plugin-group-icons";
import MarkdownItMathJaX3PRO from "markdown-it-mathjax3-pro";
import { autoArticleTitlePlugin } from "../plugins/markdown/autoArticleTitle";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts";
import markdownItReplaceLink from "markdown-it-replace-link";
import markdownItTableExt from "markdown-it-multimd-table-ext";
import { vitepressMarkmapPreview } from "vitepress-markmap-preview";
import {
  containerPreview,
  componentPreview,
} from "@vitepress-demo-preview/plugin";
import { vitepressDemoPlugin } from 'vitepress-demo-plugin';
import { resolve } from "path";
import { demoPreviewPlugin } from '@vitepress-code-preview/plugin'
import { fileURLToPath, URL } from 'node:url'

const CONSTS = {
  __custom_variable__: "your value",
};

const demoAlias = {
  '@demo': resolve(__dirname, '../../src/demos'),
};

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  // 直接启用 GitHub 风格列表
  breaks: true,
  // 允许 HTML 渲染
  html: true,
  linkify: true,
  // 标记组件为行内
  component: {
    inlineTags: [],
  },
  image: {
    lazyLoading: true,
  },
  theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  preConfig: async (md) => {},
  config: (md) => {
    md.use(footnote);
    // md.use(circleMarkdownPlugin);
    // md.use(readerMarkdownPlugin);
    md.use(MarkdownItMathJaX3PRO, {
      user_side: true,
      mathjax_options: {
        enableMenu: true,
        // Other MathJax options
      },
    });
    /**
     * SSR Compatibility
     * @link https://vitepress.dev/guide/ssr-compat
     * If the components are not SSR-friendly, you can specify the clientOnly to disable SSR.
     */
    md.use(containerPreview, { clientOnly: true, alias: demoAlias });
    md.use(componentPreview, { clientOnly: true, alias: demoAlias });
    md.use(tabsMarkdownPlugin);
    md.use(npmCommandsMarkdownPlugin);
    md.use<Options>(wordless, { supportWordless: [chineseAndJapanese] });
    md.use(namedCode, { isEnableInlineCss: true });
    md.use(timeline);
    md.use(groupIconMdPlugin);
    md.use(echartsMarkdownPlugin);
    md.use(MarkdownItCollapsible);
    md.use(MarkdownItGitHubAlerts, {
      /* Options */
      markers: "*",
    });
    md.use(markdownItTableExt, {
      multiline: true,
      rowspan: false,
      headerless: false,
      multibody: false,
      autolabel: false,
    });
    const docRoot = fileURLToPath(new URL("../../", import.meta.url));
    console.log('docRoot', docRoot)
    md.use(demoPreviewPlugin, {
      docRoot,
    });

    // @ts-ignore
    vitepressMarkmapPreview(md, {
      showToolbar: false,
    });
    // vitepressPluginLegend(md, {
    //     markmap: {
    //       showToolbar: true,
    //       // Other markmap options
    //     },
    //     mermaid: false, // or false to disable
    //   });

    md.use(vitepressDemoPlugin, {
      demoDir: resolve(__dirname, "../../src/demos"),
      lightTheme: "catppuccin-latte",
      darkTheme: "catppuccin-frappe",
      tabs: {
        order: "html,vue,react",
        select: "vue",
      },
      stackblitz: {
        show: true,
      },
      codesandbox: {
        show: true,
      },
    });

    md.use(autoArticleTitlePlugin, {
      relativePaths: ["/blog/"],
    });

    md.use(markdownItReplaceLink, {
      processHTML: false, // defaults to false for backwards compatibility
      replaceLink: function (link, env, token, htmlToken) {
        return link + "?c=" + Date.now();
      },
    });

    // 修改表格的 HTML 结构
    md.renderer.rules.table_open = () =>
      `<div class="vp-table-container"><table class="vp-table striped ">`;
    md.renderer.rules.table_close = () => "</table></div>";

    // 修改表头单元格样式
    // md.renderer.rules.th_open = () =>
    //   '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">';
    // md.renderer.rules.td_open = () =>
    //   '<td style="border: 1px solid #ddd; padding: 8px;">';

    // 自定义加粗文本的渲染
    md.renderer.rules.strong_open = () => '<strong class="font-bold">';
    md.renderer.rules.strong_close = () => "</strong>";

    // 自定义斜体文本的渲染
    md.renderer.rules.em_open = () => '<em class="italic">';
    md.renderer.rules.em_close = () => "</em>";

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, render) => {
      let htmlResult = render.renderToken(tokens, idx, options);
      if (
        env["relativePath"] &&
        env["relativePath"].includes("/blog/") &&
        tokens[idx].tag === "h1"
      ) {
        console.log(env["relativePath"], env["frontmatter"]["layout"]);
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`;
      }
      // if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    };
  },
};

export { markdown };
