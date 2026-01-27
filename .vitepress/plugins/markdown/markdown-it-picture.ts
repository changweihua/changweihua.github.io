// .vitepress/plugins/markdown-it-picture.ts
import type MarkdownIt from 'markdown-it'
import { Token } from 'markdown-it/index.js'

/**
 * 图片格式转换配置
 */
interface PicturePluginOptions {
  /**
   * 支持的图片格式（会转换为 picture 元素）
   */
  supportedFormats: RegExp
  /**
   * 需要跳过的图片格式（不会转换）
   */
  skipFormats: RegExp
  /**
   * 是否添加 loading="lazy" 属性
   */
  lazyLoading: boolean
  /**
   * 图片的默认 alt 文本
   */
  defaultAlt: string
}

/**
 * 默认配置
 */
const defaultOptions: PicturePluginOptions = {
  supportedFormats: /\.(jpg|jpeg|png|gif|bmp|tiff)$/i,
  skipFormats: /\.(svg|webp)$/i,
  lazyLoading: true,
  defaultAlt: 'Image',
}

/**
 * 提取图片属性
 */
function extractImageAttributes(token: Token) {
  const attrs: Record<string, string> = {}

  for (const [key, value] of token.attrs || []) {
    if (key === 'src') {
      attrs.src = value
    } else if (key === 'alt') {
      attrs.alt = value
    } else if (key === 'title') {
      attrs.title = value
    } else if (key.startsWith('data-')) {
      attrs[key] = value
    }
  }

  return attrs
}

/**
 * 生成 WebP 图片路径
 */
function generateWebpPath(originalSrc: string): string {
  // 如果已经是 WebP 格式，直接返回
  if (originalSrc.toLowerCase().endsWith('.webp')) {
    return originalSrc
  }

  // 如果已经有查询参数，在参数中添加 format=webp
  if (originalSrc.includes('?')) {
    const url = new URL(originalSrc, 'https://example.com')
    url.searchParams.set('format', 'webp')
    return url.pathname + url.search
  }

  // 否则替换扩展名
  return originalSrc.replace(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i, '.webp')
}

/**
 * 获取图片 MIME 类型
 */
function getMimeType(src: string): string {
  const ext = src.split('.').pop()?.toLowerCase() || ''

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  }

  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * 构建 picture 元素 HTML
 */
function buildPictureElement(
  originalSrc: string,
  attrs: Record<string, string>,
  options: PicturePluginOptions
): string {
  const webpSrc = generateWebpPath(originalSrc)
  const alt = attrs.alt || options.defaultAlt
  const title = attrs.title ? ` title="${attrs.title}"` : ''
  const loadingAttr = options.lazyLoading ? ' loading="lazy"' : ''

  // 提取自定义 data 属性
  const dataAttrs = Object.entries(attrs)
    .filter(([key]) => key.startsWith('data-'))
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('')

  // 构建完整的 picture 元素
  return `
<picture>
  <!-- WebP 格式 -->
  <source
    srcset="${webpSrc}"
    type="image/webp"${title}>

  <!-- 原始格式 -->
  <source
    srcset="${originalSrc}"
    type="${getMimeType(originalSrc)}"${title}>

  <!-- 降级回退 -->
  <img
    src="${originalSrc}"
    alt="${alt}"${title}${loadingAttr}${dataAttrs}>
</picture>`
}

/**
 * markdown-it 图片转换插件
 */
export function picturePlugin(
  md: MarkdownIt,
  userOptions: Partial<PicturePluginOptions> = {}
): void {
  const pOptions: PicturePluginOptions = { ...defaultOptions, ...userOptions }

  // 保存默认的图片渲染函数
  const defaultImageRender =
    md.renderer.rules.image ||
    ((tokens: Token[], idx: number, _options, _env, self) => {
      return self.renderToken(tokens, idx, _options)
    })

  // 覆盖图片渲染规则
  md.renderer.rules.image = (tokens: Token[], idx: number, options, env, self) => {
    const token = tokens[idx]
    const attrs = extractImageAttributes(token)
    const originalSrc = attrs.src

    // 如果图片源为空，使用默认渲染
    if (!originalSrc) {
      return defaultImageRender(tokens, idx, options, env, self)
    }

    // 跳过不需要转换的格式
    if (pOptions.skipFormats.test(originalSrc)) {
      return defaultImageRender(tokens, idx, options, env, self)
    }

    // 只转换支持的格式
    if (!pOptions.supportedFormats.test(originalSrc)) {
      return defaultImageRender(tokens, idx, options, env, self)
    }

    // 构建 picture 元素
    return buildPictureElement(originalSrc, attrs, pOptions)
  }
}
