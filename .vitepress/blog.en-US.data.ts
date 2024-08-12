import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: {
    time: number
    string: string
  }
  excerpt: string | undefined
}

declare const data: Post[]

export {
  data
}

export default createContentLoader([
    "/en-US/blog/**/!(index|README).md",
  ], {
    excerpt: true,
  transform(raw): Post[] {
    return raw
      .filter(r => r.src !== 'index.md')
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        url,
        excerpt,
        date: formatDate(frontmatter.date)
      }))
      .sort((a, b) => b.date.time - a.date.time)
      .slice(0, 12)
  },
  includeSrc: true// 包含原始 markdown 源?
})

function formatDate(raw: string): Post['date'] {
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
