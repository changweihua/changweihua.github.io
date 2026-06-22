import { createContentLoader, type SiteConfig } from 'vitepress'

// ============ 类型定义 ============
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

// ============ 辅助函数（健壮处理多种日期输入） ============

/**
 * 格式化日期：输入可以是 Date、时间戳、字符串等多种格式
 * 输出：{ time: 时间戳（毫秒），string: "YYYY-MM-DD HH:mm"（Asia/Shanghai 时区）}
 * 若输入无效，返回 { time: 0, string: '' }
 */
function formatDate(raw: any): IPostData['date'] {
  if (raw === undefined || raw === null) {
    return { time: 0, string: '' }
  }

  let date: Date

  // 1. 如果是 Date 实例
  if (raw instanceof Date) {
    date = raw
  }
  // 2. 如果是数字（时间戳）
  else if (typeof raw === 'number') {
    date = new Date(raw)
  }
  // 3. 如果是字符串
  else if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return { time: 0, string: '' }

    // 尝试判断是否为 "YYYY-MM-DD" 或 "YYYY-MM-DD HH:mm" 格式
    const basicDatePattern = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/
    if (basicDatePattern.test(trimmed)) {
      // 补全秒和时区偏移，固定 Asia/Shanghai（UTC+8）
      let dateStr = trimmed
      if (!dateStr.includes(' ')) {
        dateStr += ' 00:00'
      }
      if (dateStr.length <= 16) {
        dateStr += ':00'
      }
      const isoStr = dateStr.replace(' ', 'T') + '+08:00'
      date = new Date(isoStr)
    } else {
      // 其他格式，由 JS 引擎解析
      date = new Date(trimmed)
    }
  }
  // 4. 其他类型，转为字符串再尝试
  else {
    const str = String(raw).trim()
    if (!str) return { time: 0, string: '' }
    const basicDatePattern = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/
    if (basicDatePattern.test(str)) {
      let dateStr = str
      if (!dateStr.includes(' ')) {
        dateStr += ' 00:00'
      }
      if (dateStr.length <= 16) {
        dateStr += ':00'
      }
      const isoStr = dateStr.replace(' ', 'T') + '+08:00'
      date = new Date(isoStr)
    } else {
      date = new Date(str)
    }
  }

  // 检查日期有效性
  if (isNaN(date.getTime())) {
    return { time: 0, string: '' }
  }

  const time = date.getTime()

  // 格式化输出 "YYYY-MM-DD HH:mm"（Asia/Shanghai 时区）
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  })
  const parts = formatter.formatToParts(date)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  const string = `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`

  return { time, string }
}

// ============ 数据加载器 ============

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
        .map(({ url, frontmatter, excerpt }) => {
          let tags = [url.split('/')[2]]
          if (frontmatter?.tags) {
            tags = [...tags, ...frontmatter.tags]
          }

          const blog: IPostData = {
            title: frontmatter.title,
            url,
            excerpt,
            description: frontmatter.description,
            date: formatDate(frontmatter.date),
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

          // 安全提取年份：如果日期字符串无效，则跳过该文章
          if (!item.date.string) return
          const year = new Date(item.date.string).getFullYear()
          if (isNaN(year) || !year) return

          if (!yearMap[year]) {
            yearMap[year] = []
          }
          yearMap[year].push(item.url)
          localeMap[locale] = yearMap

          item.tags.forEach((tag) => {
            if (!tagMap[tag]) {
              tagMap[tag] = []
            }
            tagMap[tag].push(item.url)
          })
        }
      })

      return {
        localeMap,
        yearMap,
        postMap,
        tagMap,
      } as TransformedData
    },
  }
)

// 用 as any 解决 TS4082 类型泄露
export default loader as any
