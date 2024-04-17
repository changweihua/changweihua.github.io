import { createContentLoader } from 'vitepress'

export default createContentLoader('blog/**/*.md', {
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
