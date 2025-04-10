import lightbox from "vitepress-plugin-lightbox";
import { MarkdownOptions } from "vitepress";
import timeline from "vitepress-markdown-timeline";
import footnote from "markdown-it-footnote";
import anchor from "markdown-it-anchor";
import markdownSup from "markdown-it-sup";
import markdownSub from "markdown-it-sub";
import markdownItMark from "markdown-it-mark";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import frontmatter from "markdown-it-front-matter";
import { wordless, chineseAndJapanese, Options } from "markdown-it-wordless";
import markdownLinks from "markdown-it-external-links";
import MarkdownItCollapsible from "markdown-it-collapsible";
import lazy_loading from "markdown-it-image-lazy-loading";
import MarkdownItVariable from "markdown-it-variable";
import namedCode from "markdown-it-named-code-blocks";
import strikethrough from "markdown-it-strikethrough-alt";
import hashmention from "markdown-it-hashmention";
import { ImagePlugin } from "../plugins/markdown/image";
import readerMarkdownPlugin from "../plugins/markdown/reader-markdown";
import circleMarkdownPlugin from "../plugins/markdown/circle-markdown";
import echartsMarkdownPlugin from "../plugins/markdown/echarts-markdown";
import markdownItContainer from "markdown-it-container";
import markupPlugin from "../plugins/markdown/markup";
import useDefinePlugin from "vitepress-plugin-markdown-define";
import { groupIconMdPlugin } from "vitepress-plugin-group-icons";
import { demoPreviewPlugin } from "@vitepress-code-preview/plugin";
import { fileURLToPath, URL } from "node:url";
import path from "path";
import Expl3 from "../assets/latexs/LaTeX-Expl3.tmLanguage.json";
import { vitepressDemoPlugin } from "vitepress-demo-plugin";
import markdownItTaskCheckbox from "markdown-it-task-checkbox";

const CONSTS = {
  __custom_variable__: "your value",
};

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  // 直接启用 GitHub 风格列表
  breaks: true,
  // 允许 HTML 渲染
  html: true,
  linkify: true,
  math: true,
  anchor: {
    permalink: anchor.permalink.ariaHidden({
      // you can use other variants too, refer - https://github.com/valeriangalliat/markdown-it-anchor#permalinks
      symbol: `🔗`,
    }),
  },
  // @ts-ignore
  languages: [Expl3],
  // 默认禁用图片懒加载
  //@ts-ignore
  lazyLoading: true,
  theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  frontmatter: {
    grayMatterOptions: {
      excerpt: true,
      excerpt_separator: "<!-- 更多 -->",
    },
    renderExcerpt: false,
  },
  preConfig: async (md) => {},
  config: (md) => {
    useDefinePlugin(md, CONSTS);
    md.use(markdownItTaskCheckbox) //todo
    // md.core.ruler.after("inline", "task-lists", (state) => {
    //   state.tokens.forEach((token) => {
    //     if (
    //       token.content.startsWith("[ ] ") ||
    //       token.content.startsWith("[x] ")
    //     ) {
    //       token.type = "task";
    //       // @ts-ignore
    //       token.checked = token.content.startsWith("[x] ");
    //     }
    //   });
    // });

    // // 强制启用任务列表解析
    // md.set({
    //   breaks: true,
    //   html: true,
    //   linkify: true,
    // });

    md.use(markdownItContainer, "tasklist", {
      validate: (params) => {
        // 匹配 "::: tasklist" 或带参数的 "::: tasklist 标题"
        return params.trim().match(/^tasklist(\s+.*)?$/);
      },
      render: function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const info = token.info
          .trim()
          .replace(/^tasklist/, "")
          .trim();

        if (tokens[idx].nesting === 1) {
          // 提取容器标题（如 "::: tasklist 待办事项" 中的 "待办事项"）
          const title = info || "默认标题";
          let content = tokens[idx].content || "";
          // 收集子 Token 的原始 Markdown 内容
          for (let i = idx + 1; tokens[i].nesting !== -1; i++) {
            if (tokens[i].type === "inline") {
              content += tokens[i].content + "\n"; // 保留换行符
            }
          }

          // 渲染为 HTML
          return `<ClientOnly><TaskList title="${title}" content="${encodeURIComponent(content)}">`;
        }
        return "</TaskList></ClientOnly>";
      },
    });

    // // 手动添加任务列表解析规则
    // md.core.ruler.before("inline", "task-lists", (state) => {
    //   state.tokens.forEach((token) => {
    //     if (token.type === "list_item_open") {
    //       const regex = /^\[( |x)\]\s/;
    //       const match = regex.exec(token.content);
    //       if (match) {
    //         token.attrSet("class", "task-list-item");
    //         token.attrSet("data-checked", match[1] === "x" ? "true" : "false");
    //       }
    //     }
    //   });
    // });

    md.use(vitepressDemoPlugin, {
      demoDir: path.resolve(__dirname, "../../src/demos"),
      lightTheme: "catppuccin-latte",
      darkTheme: "catppuccin-mocha",
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
    md.use(footnote);
    md.use(frontmatter);
    md.use(markdownSup);
    md.use(markdownSub);
    md.use(hashmention);
    md.use(circleMarkdownPlugin);
    md.use(readerMarkdownPlugin);
    md.use(tabsMarkdownPlugin);
    md.use(MarkdownItVariable);
    md.use<Options>(wordless, { supportWordless: [chineseAndJapanese] });
    markdownItMark(md);
    markdownLinks(md, {
      externalClassName: "custom-external-link",
      internalClassName: "custom-internal-link",
      internalDomains: ["https://changweihua.github.io"],
    });
    strikethrough(md);
    md.use(lightbox, {});
    md.use(namedCode, { isEnableInlineCss: true });
    md.use(lazy_loading);
    md.use(timeline);
    md.use(groupIconMdPlugin);
    md.use(echartsMarkdownPlugin);
    md.use(markupPlugin);
    md.use(MarkdownItCollapsible);

    const docRoot = fileURLToPath(new URL("../../", import.meta.url));
    md.use(demoPreviewPlugin, {
      docRoot,
    });

    md.use(ImagePlugin);

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === "h1") {
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`;
      }
      // if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    };
  },
};

export { markdown };
