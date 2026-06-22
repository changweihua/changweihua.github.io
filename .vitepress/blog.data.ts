// VitePress 数据加载器 - 按 locale 分组当月博客文章
import { createContentLoader, type SiteConfig } from 'vitepress'
import { createHash } from 'crypto'

// ============ 类型定义 ============
export interface Post {
  title: string
  url: string
  hash: string
  date: {
    time: number
    string: string
  }
  excerpt: string | undefined
  cover: string
  coverAlt?: string
}

export type Data = Record<string, Post[]>
export declare const data: Data

// ============ 辅助函数（原生实现，健壮处理多种日期输入） ============

/**
 * 格式化日期：输入可以是 Date、时间戳、字符串等多种格式
 * 输出：{ time: 时间戳（毫秒），string: "YYYY-MM-DD HH:mm"（Asia/Shanghai 时区）}
 * 若输入无效，返回 { time: 0, string: '' }
 */
function formatDate(raw: any): Post['date'] {
  if (raw === undefined || raw === null) {
    return { time: 0, string: '' }
  }

  let date: Date

  // 1. 如果是 Date 实例，直接使用
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
      // 其他格式（如 "Tue Jun 22 2026 10:14:57 GMT+0800"），直接由 JS 解析
      date = new Date(trimmed)
    }
  }
  // 4. 其他类型（如布尔、对象等），转字符串尝试解析
  else {
    const str = String(raw).trim()
    if (!str) return { time: 0, string: '' }
    // 同样尝试格式判断
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

/**
 * 获取当前月份的 "YYYY-MM" 字符串（Asia/Shanghai 时区）
 */
function getCurrentYearMonth(): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
  const parts = formatter.formatToParts(now)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${map.year}-${map.month}`
}

/**
 * MD5 哈希（截取前 8 位）
 */
function calculateHash(content: string): string {
  return createHash('md5').update(content).digest('hex').slice(0, 8)
}

/**
 * 确保路径以 / 开头
 */
function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * 判断是否属于目标文件夹（当前月份）
 */
function isTargetFile(filePath: string): boolean {
  if (!filePath) return false
  const normalizedPath = ensureLeadingSlash(filePath).replace(/\\/g, '/')
  const currentMonth = getCurrentYearMonth()
  return normalizedPath.includes(`/blog/${currentMonth}/`)
}

// ============ 数据加载器 ============

const loader = createContentLoader(
  ['**/blog/**/!(index|README).md'],
  {
    includeSrc: true,
    render: true,
    excerpt: true,

    transform(raws) {
      const grouped: Data = {}
      const imagePattern = /!\[(.*?)\]\((.*?)\)/gm

      raws.forEach((item) => {
        const { url, frontmatter, excerpt, src } = item

        // 仅处理目标月份的文章
        if (!isTargetFile(url)) return

        // 提取封面图
        let cover = frontmatter['cover'] || ''
        if (!cover && src) {
          let match: RegExpExecArray | null
          while ((match = imagePattern.exec(src)) !== null) {
            cover = match[2]
            break
          }
        }

        // 构造文件路径用于哈希
        let filePath = url
        if (filePath.endsWith('.html')) {
          filePath = filePath.substring(0, filePath.length - 5) + '.md'
        }

        // 确定 locale
        let locale = url.split('/')[1] || 'root'
        const config = (globalThis as any).VITEPRESS_CONFIG as SiteConfig
        const locales = Object.keys(config.userConfig.locales ?? {})
        if (!locales.includes(locale)) locale = 'root'

        // 分组
        if (!grouped[locale]) grouped[locale] = []
        grouped[locale].push({
          title: frontmatter.title || 'Untitled',
          hash: calculateHash(filePath),
          url,
          excerpt,
          date: formatDate(frontmatter.date),
          cover,
          coverAlt: frontmatter['coverAlt'],
        })
      })

      return grouped
    },
  }
)

// 导出时使用 as any 避免类型泄露（与第一段保持一致）
export default loader as any
