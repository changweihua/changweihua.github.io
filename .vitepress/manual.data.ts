// VitePress 提供了数据加载的功能，它允许加载任意数据并从页面或组件中导入它。数据加载只在构建时执行：最终的数据将被序列化为 JavaScript 包中的 JSON。
// 数据加载可以被用于获取远程数据，也可以基于本地文件生成元数据。例如，可以使用数据加载来解析所有本地 API 页面并自动生成所有 API 入口的索引。

// 一个用于数据加载的文件必须以.data.js 或.data.ts 结尾。该文件应该提供一个默认导出的对象，该对象具有 load() 方法：

// Support i18n in contentLoader
import { createContentLoader, type ContentData, type SiteConfig } from 'vitepress'

export interface Manual {
  title: string;
  category: string;
  url: string;
  date: {
    time: number;
    string: string;
  };
  excerpt: string | undefined;
  cover: string;
  coverAlt?: string;
}

export type Data = Record<string, Manual[]>;
export declare const data: Data

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
const locales = Object.keys(config.userConfig.locales ?? {})

export default createContentLoader(["**/manual/**/!(index|README).md"], {
  includeSrc: true, // 包含原始 markdown 源?
  render: true, // 包含渲染的整页 HTML?
  excerpt: true, // 包含摘录?
  transform(raw) {
    const grouped: Data = {};
    const pattern = /!\[(.*?)\]\((.*?)\)/gm;

    raw.forEach((item) => {
      const { url, frontmatter, excerpt, src } = item;

      let cover = "";
      let matcher;

      if (src) {
        while ((matcher = pattern.exec(src)) !== null) {
          cover = matcher[2];
          break;
        }
      }

      let locale = url.split("/")[1];
      locale = locales.includes(locale) ? locale : "root";
      (grouped[locale] ??= []).push({
        title: frontmatter.title,
        category: frontmatter.category,
        url,
        excerpt,
        date: formatDate(frontmatter.date),
        cover,
      });
    });

    return grouped;
  },
});

function formatDate(raw: string): Manual['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
