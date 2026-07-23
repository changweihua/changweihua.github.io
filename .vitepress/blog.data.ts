import { createContentLoader, type SiteConfig } from 'vitepress'
import { createHash } from 'crypto'

export interface Post {
  title: string
  url: string
  hash: string
  date: {
    time: number        // 毫秒级 UTC 时间戳
    string: string      // 原始字符串，如 "2026-06-26 10:35:00"
  }
  excerpt: string | undefined
  cover: string
  coverAlt?: string
}

export type Data = Record<string, Post[]>
export declare const data: Data

// ------------------------------------------------------
// 从原始 md 内容中提取 date 字符串（避免 VitePress 自动解析）
// ------------------------------------------------------
function extractDateFromSrc(src: string | undefined): string {
  if (!src) return ''
  const match = src.match(/^date:\s*(.+)$/m)
  return match ? match[1].trim().replace(/['"]/g, '') : ''
}

// ------------------------------------------------------
// 解析东八区日期字符串 → UTC 时间戳
// 支持 "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DD HH:mm"
// ------------------------------------------------------
function parseEast8Date(dateStr: string): { time: number; string: string } {
  if (!dateStr) return { time: 0, string: '' }

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    console.warn(`[blog.data] 无法解析日期: "${dateStr}"，已忽略`)
    return { time: 0, string: '' }
  }

  const year = parseInt(match[1])
  const month = parseInt(match[2])
  const day = parseInt(match[3])
  const hour = parseInt(match[4])
  const minute = parseInt(match[5])
  const second = match[6] ? parseInt(match[6]) : 0

  // 东八区 → UTC 时间戳
  const time = Date.UTC(year, month - 1, day, hour, minute, second) - 8 * 60 * 60 * 1000

  // 保留原始字符串（不添加秒，如果原字符串没有秒则不带秒）
  return { time, string: dateStr }
}

function getCurrentYearMonth(): string {
  const now = Date.now()
  const dateObj = new Date(now + 8 * 60 * 60 * 1000)
  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function calculateHash(content: string): string {
  return createHash('md5').update(content).digest('hex').slice(0, 8)
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function isTargetFile(filePath: string): boolean {
  if (!filePath) return false
  const normalizedPath = ensureLeadingSlash(filePath).replace(/\\/g, '/')
  const currentMonth = getCurrentYearMonth()
  return normalizedPath.includes(`/blog/${currentMonth}/`)
}

// ------------------------------------------------------
const loader = createContentLoader(
  ['**/blog/**/!(index|README).md'],
  {
    includeSrc: true,   // 必须开启，以便获取原始内容
    render: true,
    excerpt: true,

    transform(raws) {
      const grouped: Data = {}
      const imagePattern = /!\[(.*?)\]\((.*?)\)/gm

      raws.forEach((item) => {
        const { url, frontmatter, excerpt, src } = item

        if (!isTargetFile(url)) return

        // ✅ 从原始内容中提取 date，而不是使用 frontmatter.date
        const rawDate = extractDateFromSrc(src)
        const { time, string: dateString } = parseEast8Date(rawDate)

        let cover = frontmatter['cover'] || ''
        if (!cover && src) {
          let match: RegExpExecArray | null
          while ((match = imagePattern.exec(src)) !== null) {
            cover = match[2]
            break
          }
        }

        let filePath = url
        if (filePath.endsWith('.html')) {
          filePath = filePath.substring(0, filePath.length - 5) + '.md'
        }

        let locale = url.split('/')[1] || 'root'
        const config = (globalThis as any).VITEPRESS_CONFIG as SiteConfig
        const locales = Object.keys(config.userConfig.locales ?? {})
        if (!locales.includes(locale)) locale = 'root'

        if (!grouped[locale]) grouped[locale] = []
        grouped[locale].push({
          title: frontmatter.title || 'Untitled',
          hash: calculateHash(filePath),
          url,
          excerpt,
          date: { time, string: dateString },   // 使用我们自己解析的值
          cover,
          coverAlt: frontmatter['coverAlt'],
        })
      })

      return grouped
    },
  }
)

export default loader as any
