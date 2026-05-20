// .vitepress/posts.data.ts
import { createContentLoader } from 'vitepress'

export interface Post {
  url: string
  title: string
  tags: string[]
  cover: string | null   // 封面图，没有则为 null
  date?: string
}

interface RawPost {
  url: string
  frontmatter: {
    title?: string
    tags?: string[]
    cover?: string
  }
  date?: string
}

export declare const data: Post[]

export default createContentLoader<Post[]>('**/blog/**/!(index|README).md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(rawData: RawPost[]): Post[] {
    return rawData
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title || '无标题',
        tags: frontmatter.tags || [],
        cover: frontmatter.cover || null,
        date: frontmatter.date
      }))
      .filter(post => post.cover )   // 只保留有封面的文章
  },
})
