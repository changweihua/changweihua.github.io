import { createContentLoader, SiteConfig } from 'vitepress'
import dayjs from './hooks/useDayjs'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
const locales = Object.keys(config.userConfig.locales ?? {})

export interface IPostData {
  title: string
  url: string
  excerpt?: string
  description?: string
  date: {
    time: number;
    string: string;
  }
  tags: string[]
}

export type Data = Record<string, IPostData[]>
export declare const data: Data

export default createContentLoader("**/blog/**/!(index|README).md", {
  includeSrc: true, // 包含原始 markdown 源?
  render: true,     // 包含渲染的整页 HTML?
  excerpt: true,    // 包含摘录
  transform(raws) {

    const postMap: Record<string, IPostData> = {};
    const yearMap: Record<number, Array<string>> = {};
    const tagMap: Record<string, string[]> = {};
    const localeMap: Record<string, Record<number, Array<string>>> = {}

    const blogs = raws
      .map(({ url, frontmatter, excerpt }) => {

        let tags = [url.split("/")[2]]
        if (frontmatter?.tags) {
          tags = [...tags, ...frontmatter.tags];
        }

        const blog: IPostData = {
          title: frontmatter.title,
          url,
          excerpt,
          description: frontmatter.description,
          date: formatDate(frontmatter.date),
          tags
        }
        postMap[blog.url] = blog

        return blog
      })
      .sort((a, b) => b.date.time - a.date.time)

    blogs.forEach((item) => {
      if (item.title !== 'Index') {

        let locale = item.url.split('/')[1];
        locale = locales.includes(locale) ? locale : 'root';

        const year = dayjs(item.date.string).year();
        if (year) {
          if (!yearMap[year]) {
            yearMap[year] = [];
          }
          yearMap[year].push(item.url);
          localeMap[locale] = yearMap
          // (localeMap[locale] ??= []).push(item)

          item.tags.forEach((tag) => {
            if (!tagMap[tag]) {
              tagMap[tag] = []
            }
            tagMap[tag].push(item.url)
          })
        }
      }
    });

    return {
      localeMap,
      yearMap,
      postMap,
      tagMap,
    }
  },
  globOptions: {
    ignore: ['index.md']
  }
})

function formatDate(raw: string) {
  return {
    time: dayjs.tz(`${raw}:00`, "Asia/Shanghai").valueOf(),
    string: dayjs
      .tz(`${raw}:00`, "Asia/Shanghai")
      .format("YYYY-MM-DD HH:mm"),
  };
}
