import type MarkdownIt from 'markdown-it'
import fs from 'fs'
import path from 'path'

interface ImageInfo {
  src: string
  alt: string
  title?: string
  width?: string
  height?: string
}

const ROOT_DIR = process.cwd()
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')
const formatCache = new Map<string, boolean>()

function fileExistsSync(filePath: string): boolean {
  if (formatCache.has(filePath)) {
    return formatCache.get(filePath)!
  }

  try {
    const exists = fs.existsSync(filePath)
    formatCache.set(filePath, exists)
    return exists
  } catch {
    formatCache.set(filePath, false)
    return false
  }
}

function resolveImagePath(src: string, env: any): { fsPath: string; webPath: string } {
  if (src.startsWith('http')) {
    return { fsPath: src, webPath: src }
  }

  if (src.startsWith('/')) {
    const relativePath = src.slice(1)
    const fsPath = path.join(PUBLIC_DIR, relativePath)
    return { fsPath, webPath: src }
  }

  if (env.filePath) {
    const markdownDir = path.dirname(env.filePath)
    const resolvedPath = path.resolve(markdownDir, src)

    if (resolvedPath.startsWith(PUBLIC_DIR)) {
      const webPath = '/' + path.relative(PUBLIC_DIR, resolvedPath).replace(/\\/g, '/')
      return { fsPath: resolvedPath, webPath }
    }

    return { fsPath: resolvedPath, webPath: src }
  }

  const fsPath = path.join(PUBLIC_DIR, src)
  const webPath = '/' + src
  return { fsPath, webPath }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function generatePictureHTML(info: ImageInfo, env: any): string {
  const { fsPath, webPath } = resolveImagePath(info.src, env)
  const isExternal = info.src.startsWith('http')

  if (isExternal) {
    return `<figure class="vp-image">
  <img src="${info.src}" alt="${escapeHtml(info.alt)}" class="vp-img"
    ${info.width ? `width="${info.width}"` : ''}
    ${info.height ? `height="${info.height}"` : ''}
    loading="lazy">
  ${info.title ? `<figcaption>${escapeHtml(info.title)}</figcaption>` : ''}
</figure>`
  }

  const ext = path.extname(fsPath)
  const baseName = fsPath.slice(0, -ext.length)

  const formats: string[] = []
  if (fileExistsSync(`${baseName}.jxl`)) formats.push('jxl')
  if (fileExistsSync(`${baseName}.avif`)) formats.push('avif')
  if (fileExistsSync(`${baseName}.webp`)) formats.push('webp')

  const webBasePath = webPath.slice(0, -path.extname(webPath).length)

  const sources = formats
    .map((format) => `<source srcset="${webBasePath}.${format}" type="image/${format}">`)
    .join('\n    ')

  const imgAttrs = [
    `src="${webPath}"`,
    `alt="${escapeHtml(info.alt)}"`,
    'class="vp-img"',
    info.width ? `width="${info.width}"` : '',
    info.height ? `height="${info.height}"` : '',
    'loading="lazy"',
    'decoding="async"',
    info.title ? `title="${escapeHtml(info.title)}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const imgTag = `<img ${imgAttrs}>`

  // 关键：对于块级元素，返回时前面加两个换行，使其被识别为块级
  if (formats.length > 0 || info.title) {
    let content = imgTag

    if (formats.length > 0) {
      content = `<picture class="vp-picture">
    ${sources}
    ${imgTag}
  </picture>`
    }

    if (info.title) {
      return `\n\n<figure class="vp-image">
  ${content}
  <figcaption class="vp-figcaption">${escapeHtml(info.title)}</figcaption>
</figure>\n\n`
    }

    return `\n\n<figure class="vp-image">
  ${content}
</figure>\n\n`
  }

  return imgTag
}

export default function picturePlugin(md: MarkdownIt) {
  // 保存原始渲染函数
  const defaultRender = md.renderer.rules.image!

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info: ImageInfo = { src: '', alt: '' }

    // 解析属性
    if (token.attrs) {
      for (const [key, value] of token.attrs) {
        if (key === 'src') info.src = value
        else if (key === 'alt') info.alt = value
        else if (key === 'title') info.title = value
        else if (key === 'width') info.width = value
        else if (key === 'height') info.height = value
      }
    }

    // 获取图片描述
    if (!info.alt && token.content) {
      info.alt = token.content
    }

    // 关键：标记此token为块级，避免被<p>包裹
    token.type = 'figure_block'
    token.tag = 'figure'

    return generatePictureHTML(info, env)
  }

  // 添加后处理：移除多余的<p>标签
  const originalRender = md.render
  md.render = function (...args) {
    const result = originalRender.apply(this, args)

    // 1. 移除包裹figure的p标签
    const withoutP = result
      .replace(/<p>\s*<figure/g, '<figure')
      .replace(/<\/figure>\s*<\/p>/g, '</figure>')

    // 2. 移除空的p标签（可能由上述替换产生）
    const cleaned = withoutP.replace(/<p>\s*<\/p>/g, '')

    return cleaned
  }
}
