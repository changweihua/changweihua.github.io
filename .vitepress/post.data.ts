import { createContentLoader } from 'vitepress'
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault("Asia/Shanghai")
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export default createContentLoader('zh-CN/blog/**/*.md', {
  transform(raw) {

    const postMap = {};
    const yearMap = {};
    const tagMap = {};

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
        const year = new Date(item.date.string).getFullYear();
        if (year) {
          if (!yearMap[year]) {
            yearMap[year] = [];
          }
          yearMap[year].push(item.url);

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
    time: dayjs.tz(raw).valueOf(),
    string: dayjs.tz(raw).format('YYYY-MM-DD hh:mm')
  }
}
