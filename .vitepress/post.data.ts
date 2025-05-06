import { createContentLoader, SiteConfig } from 'vitepress'
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
const locales = Object.keys(config.userConfig.locales ?? {})

export default createContentLoader("**/blog/**/!(index|README).md", {
  transform(raw) {

    const postMap = {};
    const yearMap = {};
    const tagMap = {};
    const localeMap = {}

    const blogs = raw
      .map(({ url, frontmatter, excerpt }) => {

      let tags = [url.split("/")[2]]
      if (frontmatter?.tags) {
        tags = [...tags, ...frontmatter.tags];
          }

          const blog = {
            title: frontmatter.title,
            url,
            excerpt,
            description: frontmatter.description,
            date: formatDate(frontmatter.date),
            tags
          }
          postMap[blog.url] = blog;

          return blog
        })
        .sort((a, b) => b.date.time - a.date.time)

    blogs.forEach((item) => {
      if (item.title !== 'Index') {

        let locale = item.url.split('/')[1];
        locale = locales.includes(locale) ? locale : 'root';

          const year = new Date(item.date.string).getFullYear();
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
    time: dayjs(raw).valueOf(),
    string: dayjs(raw).format('YYYY-MM-DD hh:mm')
  }
}
