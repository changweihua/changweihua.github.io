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

export default createContentLoader('blog/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        url,
        excerpt,
        date: formatDate(frontmatter.date)
      }))
      .sort((a, b) => b.date.time - a.date.time)
  }
  // includeSrc: true, // 包含原始 markdown 源?
  // render: true,     // 包含渲染的整页 HTML?
  // excerpt: true,    // 包含摘录?
  // transform(rawData) {
  //   // 根据需要对原始数据进行 map、sort 或 filter
  //   // 最终的结果是将发送给客户端的内容
  //   return rawData.sort((a, b) => {
  //     return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
  //   }).map((page) => {
  //     page.src     // 原始 markdown 源
  //     page.html    // 渲染的整页 HTML
  //     page.excerpt // 渲染的摘录 HTML（第一个 `---` 上面的内容）
  //     return {/* ... */ }
  //   })
  // }
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
