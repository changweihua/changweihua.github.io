import lightbox from "vitepress-plugin-lightbox"
import { MarkdownOptions } from "vitepress";
import timeline from "vitepress-markdown-timeline";
import footnote from 'markdown-it-footnote';
import markdownSup from 'markdown-it-sup'
import markdownSub from 'markdown-it-sub'
import frontmatter from 'markdown-it-front-matter'
import lazy_loading from 'markdown-it-image-lazy-loading';
import { tasklist } from "@mdit/plugin-tasklist";
import { ruby } from "@mdit/plugin-ruby";
import { ImagePlugin } from '../plugins/markdown/image'
import mermaidPlugin from '../plugins/markdown/rough-mermaid'
import markupPlugin from '../plugins/markdown/markup'
import useDefinePlugin from 'vitepress-plugin-markdown-define'
import tabsPlugin from '@red-asuka/vitepress-plugin-tabs'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { demoPreviewPlugin } from '@vitepress-code-preview/plugin'
import { fileURLToPath, URL } from 'node:url'


const CONSTS = {
  __custom_variable__: 'your value'
}

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  linkify: true,
  math: true,
  theme: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
  config: (md) => {
    useDefinePlugin(md, CONSTS)

    md.use(footnote);
    md.use(tasklist);
    md.use(ruby);
    md.use(frontmatter);
    md.use(markdownSup);
    md.use(markdownSub);
    md.use(lightbox, {});
    md.use(lazy_loading);
    md.use(timeline);
    tabsPlugin(md)
    md.use(groupIconMdPlugin)
    md.use(mermaidPlugin)
    md.use(markupPlugin)

    const docRoot = fileURLToPath(new URL('../../', import.meta.url))
    md.use(demoPreviewPlugin, {
      docRoot
    })

    md.use(ImagePlugin)

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === 'h1') {
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`
      }
      // if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    }
  },
}

export {
  markdown
}
