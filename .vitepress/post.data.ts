import { createContentLoader, type SiteConfig } from 'vitepress'

export interface IPostData {
  title: string
  url: string
  excerpt?: string
  description?: string
  date: {
    time: number
    string: string
  }
  tags: string[]
}

export interface TransformedData {
  localeMap: Record<string, Record<number, Array<string>>>
  yearMap: Record<number, Array<string>>
  postMap: Record<string, IPostData>
  tagMap: Record<string, Array<string>>
}

export type Data = TransformedData
export declare const data: Data

// ------------------------------------------------------
// 从原始 md 内容中提取 date 字符串
// ------------------------------------------------------
function extractDateFromSrc(src: string | undefined): string {
  if (!src) return ''
  const match = src.match(/^date:\s*(.+)$/m)
  return match ? match[1].trim().replace(/['"]/g, '') : ''
}

// ------------------------------------------------------
// 解析东八区日期字符串 → UTC 时间戳
// ------------------------------------------------------
function parseEast8Date(dateStr: string): { time: number; string: string } {
  if (!dateStr) return { time: 0, string: '' }

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    console.warn(`[post.data] 无法解析日期: "${dateStr}"，已忽略`)
    return { time: 0, string: '' }
  }

  const year = parseInt(match[1])
  const month = parseInt(match[2])
  const day = parseInt(match[3])
  const hour = parseInt(match[4])
  const minute = parseInt(match[5])
  const second = match[6] ? parseInt(match[6]) : 0

  const time = Date.UTC(year, month - 1, day, hour, minute, second) - 8 * 60 * 60 * 1000
  return { time, string: dateStr }
}

// ------------------------------------------------------
const loader = createContentLoader(
  ['**/blog/**/!(index|README).md', '!**/index.md'],
  {
    includeSrc: true,
    render: true,
    excerpt: true,
    transform(raws) {
      const postMap: Record<string, IPostData> = {}
      const yearMap: Record<number, Array<string>> = {}
      const tagMap: Record<string, string[]> = {}
      const localeMap: Record<string, Record<number, Array<string>>> = {}

      const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
      const locales = Object.keys(config.userConfig.locales ?? {})

      const blogs = raws
        .map(({ url, frontmatter, excerpt, src }) => {
          // ✅ 从原始内容中提取 date
          const rawDate = extractDateFromSrc(src)
          const { time, string: dateString } = parseEast8Date(rawDate)

          let tags = [url.split('/')[2]]
          if (frontmatter?.tags) {
            tags = [...tags, ...frontmatter.tags]
          }

          const blog: IPostData = {
            title: frontmatter.title,
            url,
            excerpt,
            description: frontmatter.description,
            date: { time, string: dateString },
            tags,
          }
          postMap[blog.url] = blog
          return blog
        })
        .sort((a, b) => b.date.time - a.date.time)

      blogs.forEach((item) => {
        if (item.title !== 'Index') {
          let locale = item.url.split('/')[1]
          locale = locales.includes(locale) ? locale : 'root'

          const yearMatch = item.date.string.match(/^(\d{4})-\d{2}-\d{2}/)
          const year = yearMatch ? parseInt(yearMatch[1]) : 0
          if (year) {
            if (!yearMap[year]) yearMap[year] = []
            yearMap[year].push(item.url)

            if (!localeMap[locale]) localeMap[locale] = {}
            if (!localeMap[locale][year]) localeMap[locale][year] = []
            localeMap[locale][year].push(item.url)

            item.tags.forEach((tag) => {
              if (!tagMap[tag]) tagMap[tag] = []
              tagMap[tag].push(item.url)
            })
          }
        }
      })

      return { localeMap, yearMap, postMap, tagMap } as TransformedData
    },
  }
)

export default loader as any
