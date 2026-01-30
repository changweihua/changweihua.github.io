import type MarkdownIt from 'markdown-it'
import fs from 'fs'
import path from 'path'
import { Token } from 'markdown-it/index.js'

// --- 配置接口 ---
export interface PicturePluginOptions {
  // 核心路径配置
  publicDir?: string // public目录的绝对路径

  // 格式控制
  enableJXL?: boolean
  enableAVIF?: boolean
  enableWebP?: boolean

  // HTML类名
  figureClass?: string
  pictureClass?: string
  imgClass?: string
  figcaptionClass?: string

  // 容器配置
  containerClasses?: string[] // 需要后处理的容器类名

  // 行为控制
  lazyLoading?: boolean
  decoding?: 'async' | 'sync' | 'auto'

  // 调试
  debug?: boolean
}

// --- 默认配置 ---
const DEFAULT_OPTIONS: Required<PicturePluginOptions> = {
  publicDir: path.join(process.cwd(), 'public'),
  enableJXL: true,
  enableAVIF: true,
  enableWebP: true,
  figureClass: 'vp-image',
  pictureClass: 'vp-picture',
  imgClass: 'vp-img',
  figcaptionClass: 'vp-figcaption',
  containerClasses: ['figure-list', 'grid'], // 默认处理这些容器
  lazyLoading: true,
  decoding: 'async',
  debug: false,
}

// --- 类型定义 ---
interface ImageInfo {
  src: string
  alt: string
  title?: string
  width?: string
  height?: string
  class?: string
  id?: string
  // 动态属性支持
  [key: `data-${string}`]: string | undefined
  // 其他未知属性
  [key: string]: string | undefined
}

interface ImageFormatInfo {
  src: string
  type: string
}

// --- 核心工具函数（带缓存）---
const fileCache = new Map<string, boolean>()
const formatCache = new Map<string, ImageFormatInfo[]>() // 缓存图片格式检测结果

/**
 * 同步检查文件是否存在（带缓存）
 */
function fileExistsSync(filePath: string): boolean {
  if (fileCache.has(filePath)) {
    return fileCache.get(filePath)!
  }
  try {
    const exists = fs.existsSync(filePath)
    fileCache.set(filePath, exists)
    return exists
  } catch {
    fileCache.set(filePath, false)
    return false
  }
}

/**
 * 解析图片路径
 */
function resolveImagePaths(
  src: string,
  env: any,
  options: Required<PicturePluginOptions>
): { fsPath: string; webSrc: string; isExternal: boolean } {
  // 外部URL或数据URL直接返回
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return { fsPath: src, webSrc: src, isExternal: true }
  }

  // 绝对路径 (/images/xxx.jpg)
  if (src.startsWith('/')) {
    const fsPath = path.join(options.publicDir, src.slice(1))
    return { fsPath, webSrc: src, isExternal: false }
  }

  // 相对路径
  let baseDir = process.cwd()
  if (env?.filePath) {
    baseDir = path.dirname(env.filePath)
  }

  const fsPath = path.resolve(baseDir, src)

  // 尝试将路径转换为相对于public目录的web路径
  let webSrc = src
  try {
    const relativeToPublic = path.relative(options.publicDir, fsPath)
    if (!relativeToPublic.startsWith('..') && !path.isAbsolute(relativeToPublic)) {
      webSrc = '/' + relativeToPublic.replace(/\\/g, '/')
    }
  } catch {
    // 保持原样
  }

  return { fsPath, webSrc, isExternal: false }
}

/**
 * 检测图片可用的现代格式
 */
function detectAvailableFormats(
  fsPath: string,
  options: Required<PicturePluginOptions>
): ImageFormatInfo[] {
  const cacheKey = `${fsPath}_${options.enableJXL}_${options.enableAVIF}_${options.enableWebP}`

  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!
  }

  const formats: ImageFormatInfo[] = []
  const ext = path.extname(fsPath)
  const basePath = fsPath.slice(0, -ext.length)
  // console.log(basePath)

  // 检查各格式文件是否存在
  if (options.enableWebP && fileExistsSync(`${basePath}.webp`)) {
    formats.push({ src: `${basePath}.webp`, type: 'image/webp' })
  }
  if (options.enableAVIF && fileExistsSync(`${basePath}.avif`)) {
    formats.push({ src: `${basePath}.avif`, type: 'image/avif' })
  }
  if (options.enableJXL && fileExistsSync(`${basePath}.jxl`)) {
    formats.push({ src: `${basePath}.jxl`, type: 'image/jxl' })
  }

  formatCache.set(cacheKey, formats)
  return formats
}

/**
 * HTML转义
 */
function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 将文件系统路径转换为web路径
 */
function fsPathToWebPath(fsPath: string, options: Required<PicturePluginOptions>): string {
  try {
    const relativeToPublic = path.relative(options.publicDir, fsPath)
    if (!relativeToPublic.startsWith('..') && !path.isAbsolute(relativeToPublic)) {
      return '/' + relativeToPublic.replace(/\\/g, '/')
    }
  } catch {
    // 转换失败，返回原路径
  }
  return fsPath
}

/**
 * 生成最终的 picture/figure HTML
 */
function generatePictureHTML(
  imageInfo: ImageInfo,
  env: any,
  options: Required<PicturePluginOptions>
): string {
  const { fsPath, webSrc, isExternal } = resolveImagePaths(imageInfo.src, env, options)

  if (options.debug) {
    console.log('[DEBUG] generatePictureHTML:', { imageInfo, fsPath, webSrc, isExternal })
  }

  // 外部图片或数据URL，直接生成简单img标签
  if (isExternal) {
    const imgAttrs = buildImgAttributes(imageInfo, webSrc, options, true)
    return `<img ${imgAttrs}>`
  }

  // 本地图片：检测可用格式
  const availableFormats = detectAvailableFormats(fsPath, options)

  // 构建图片标签
  const imgAttrs = buildImgAttributes(imageInfo, webSrc, options, false)
  const imgTag = `<img ${imgAttrs}>`

  // 生成source标签（如果有可用格式）
  let contentHTML = imgTag
  if (availableFormats.length > 0) {
    const sources = availableFormats
      .map((format) => {
        const formatWebSrc = fsPathToWebPath(format.src, options)
        return `<source srcset="${formatWebSrc}" type="${format.type}">`
      })
      .join('\n    ')

    contentHTML = `<picture class="${options.pictureClass}">\n    ${sources}\n    ${imgTag}\n</picture>`
  }

  // 如果有标题或总是需要figure包装，则添加figure
  const hasTitle = !!imageInfo.title
  const needsFigure = hasTitle || options.figureClass

  if (needsFigure) {
    const figureAttrs = [
      options.figureClass ? `class="${options.figureClass}"` : '',
      hasTitle ? `aria-label="${escapeHtml(imageInfo.title!)}"` : '',
      'role="figure"',
    ]
      .filter(Boolean)
      .join(' ')

    const figcaptionHTML = hasTitle
      ? `\n  <figcaption class="${options.figcaptionClass}">${escapeHtml(imageInfo.title!)}</figcaption>`
      : ''

    // 关键：返回时前后加换行，确保被识别为块级元素
    return `\n<figure ${figureAttrs}>\n  ${contentHTML}${figcaptionHTML}\n</figure>\n`
  }

  return contentHTML
}

/**
 * 构建img标签属性（解决属性重复问题）
 */
function buildImgAttributes(
  imageInfo: ImageInfo,
  src: string,
  options: Required<PicturePluginOptions>,
  isExternal: boolean
): string {
  // 使用对象收集属性，避免重复
  const attrs: Record<string, string> = {}

  // 1. 设置核心属性
  attrs['src'] = src
  attrs['alt'] = escapeHtml(imageInfo.alt || '')

  // 2. 设置插件默认行为
  if (options.lazyLoading && !isExternal) {
    attrs['loading'] = 'lazy'
  }
  attrs['decoding'] = options.decoding

  // 3. 合并来自Markdown的属性（解决 {data-zoomable} 等问题）
  for (const [key, value] of Object.entries(imageInfo)) {
    if (value === undefined || value === null || key === 'src' || key === 'alt') {
      continue
    }

    const stringValue = String(value).trim()
    if (!stringValue) continue

    // 特殊处理某些属性
    if (key === 'title') {
      attrs[key] = escapeHtml(stringValue)
    } else if (key === 'class') {
      // 合并类名
      const existingClass = attrs['class'] || ''
      attrs['class'] = (existingClass + ' ' + stringValue).trim()
    } else if (key === 'width' || key === 'height') {
      // 直接使用数值属性
      attrs[key] = stringValue
    } else if (key.startsWith('data-')) {
      // 处理 data-* 属性（包括 data-zoomable）
      attrs[key] = escapeHtml(stringValue)
    }
    // 其他未知属性可以忽略或根据需要添加
  }

  // 4. 确保插件默认的imgClass被添加
  if (options.imgClass) {
    const existingClass = attrs['class'] || ''
    attrs['class'] = (existingClass + ' ' + options.imgClass).trim()
  }

  // 5. 转换为属性字符串
  return Object.entries(attrs)
    .filter(([_, value]) => value.length > 0)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

// --- 后处理HTML的核心功能 ---

/**
 * 转换容器内的普通 <img> 标签
 */
function convertImagesInContainer(
  html: string,
  env: any,
  options: Required<PicturePluginOptions>
): string {
  if (!html || !options.containerClasses || options.containerClasses.length === 0) {
    return html
  }

  // 为每个容器类名构建处理逻辑
  let result = html
  const containerRegex = /<div\s+[^>]*class="[^"]*?(?:\b(?:figure-list|grid)\b)[^"]*?"[^>]*>/gi

  let match
  const containerMatches: Array<{ start: number; end: number }> = []

  // 第一阶段：找出所有匹配的容器
  while ((match = containerRegex.exec(result)) !== null) {
    const startIndex = match.index
    const tag = match[0]

    // 查找对应的闭合标签
    const afterStart = result.substring(startIndex + tag.length)
    let depth = 1
    let pos = 0
    let endIndex = -1

    while (pos < afterStart.length) {
      const nextOpen = afterStart.indexOf('<div', pos)
      const nextClose = afterStart.indexOf('</div>', pos)

      if (nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen)) {
        depth--
        pos = nextClose + 6
        if (depth === 0) {
          endIndex = startIndex + tag.length + nextClose
          break
        }
      } else if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
        depth++
        pos = nextOpen + 4
      } else {
        break
      }
    }

    if (endIndex !== -1) {
      containerMatches.push({ start: startIndex, end: endIndex + 6 }) // +6 for </div>
    }
  }

  // 第二阶段：从后往前处理容器（避免位置偏移）
  for (let i = containerMatches.length - 1; i >= 0; i--) {
    const { start, end } = containerMatches[i]
    const before = result.substring(0, start)
    const containerContent = result.substring(start, end)
    const after = result.substring(end)

    // 处理容器内容
    const processedContent = processImgTagsInHTML(containerContent, env, options)

    // 重新组合
    result = before + processedContent + after
  }

  return result
}

/**
 * 处理HTML片段中的普通<img>标签
 */
function processImgTagsInHTML(
  htmlSegment: string,
  env: any,
  options: Required<PicturePluginOptions>
): string {
  // 匹配普通的img标签
  const imgTagRegex = /<img\s+([^>]*?)>/gi

  return htmlSegment.replace(imgTagRegex, (match, attributesStr, offset) => {
    // 检查是否已经被处理过
    const precedingText = htmlSegment.substring(Math.max(0, offset - 200), offset)
    if (precedingText.includes('<picture') || precedingText.includes('<figure')) {
      return match
    }

    // 解析属性
    const attrs: Record<string, string> = {}
    const attrRegex = /(\w[\w-]*)=["']([^"']*)["']/g
    let attrMatch

    while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }

    // 处理无值的布尔属性（如 data-zoomable）
    const boolAttrRegex = /(\w[\w-]*)(?=\s|>)/g
    let boolMatch
    while ((boolMatch = boolAttrRegex.exec(attributesStr)) !== null) {
      const attrName = boolMatch[1]
      if (!(attrName in attrs) && attrName.startsWith('data-')) {
        attrs[attrName] = 'true' // 给布尔属性一个默认值
      }
    }

    if (!attrs.src) {
      return match
    }

    // 构建ImageInfo对象
    const imageInfo: ImageInfo = {
      src: attrs.src,
      alt: attrs.alt || '',
      title: attrs.title,
      width: attrs.width,
      height: attrs.height,
      class: attrs.class,
      id: attrs.id,
    }

    // 添加所有data-*属性
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('data-')) {
        imageInfo[key as `data-${string}`] = value
      }
    }

    try {
      const newHTML = generatePictureHTML(imageInfo, env, options)

      if (options.debug) {
        console.log(`[DEBUG] 转换容器内图片: ${attrs.src}`)
      }

      return newHTML
    } catch (error) {
      if (options.debug) {
        console.warn(`[DEBUG] 转换容器内图片失败 (${attrs.src}):`, error)
      }
      return match
    }
  })
}

/**
 * 清理无效的HTML嵌套
 */
function cleanupInvalidNesting(html: string): string {
  let result = html

  // 1. 清理 <p><figure>...</figure></p>
  const figureInPRegex = /<p(\s[^>]*)?>\s*<figure/g
  const closeFigureInPRegex = /<\/figure>\s*<\/p>/g

  result = result.replace(figureInPRegex, '<figure')
  result = result.replace(closeFigureInPRegex, '</figure>')

  // 2. 清理 <p><picture>...</picture></p>
  const pictureInPRegex = /<p(\s[^>]*)?>\s*<picture/g
  const closePictureInPRegex = /<\/picture>\s*<\/p>/g

  result = result.replace(pictureInPRegex, '<picture')
  result = result.replace(closePictureInPRegex, '</picture>')

  // 3. 清理空的段落标签
  result = result.replace(/<p[^>]*>\s*<\/p>/g, '')

  return result
}

// --- Markdown-it 插件主体 ---
export default function picturePlugin(md: MarkdownIt, userOptions?: PicturePluginOptions) {
  const options: Required<PicturePluginOptions> = { ...DEFAULT_OPTIONS, ...userOptions }

  if (options.debug) {
    console.log('[DEBUG] Picture插件初始化，配置:', options)
  }

  // 1. 保存原始图片渲染函数
  const defaultImageRender = md.renderer.rules.image

  // 2. 覆盖默认的图片渲染规则
  md.renderer.rules.image = (tokens: Token[], idx: number, opts: any, env: any, self: any) => {
    const token = tokens[idx]

    // 关键：标记为块级元素，避免被<p>包裹
    token.type = 'figure_block'
    token.tag = 'figure'
    token.block = true

    const imageInfo: ImageInfo = { src: '', alt: '' }

    // 解析token属性
    if (token.attrs) {
      for (const [key, value] of token.attrs) {
        if (key === 'src') imageInfo.src = value
        else if (key === 'alt') imageInfo.alt = value
        else if (key === 'title') imageInfo.title = value
        else if (key === 'width') imageInfo.width = value
        else if (key === 'height') imageInfo.height = value
        else if (key === 'class') imageInfo.class = value
        else if (key === 'id') imageInfo.id = value
        else if (key.startsWith('data-')) {
          // 处理data-*属性
          imageInfo[key as `data-${string}`] = value
        }
      }
    }

    // 从token内容获取alt文本
    if (!imageInfo.alt && token.content) {
      imageInfo.alt = token.content
    }

    if (options.debug) {
      console.log(`[DEBUG] 处理Markdown图片:`, imageInfo)
    }

    // 使用我们的函数生成HTML
    return generatePictureHTML(imageInfo, env, options)
  }

  // 3. 保存原始的render函数用于后处理
  const originalRender = md.render.bind(md)

  // 4. 覆盖render函数，注入完整的处理逻辑
  md.render = function (src: string, env: any = {}) {
    // 调用原始render得到HTML
    const originalHtml = originalRender(src, env)

    if (options.debug) {
      console.log('[DEBUG] 原始渲染HTML:', originalHtml.substring(0, 500))
    }

    // 第一步：转换容器内的图片
    const withContainersProcessed = convertImagesInContainer(originalHtml, env, options)

    // 第二步：清理无效的HTML嵌套
    const cleanedHtml = cleanupInvalidNesting(withContainersProcessed)

    // 第三步：最后清理可能产生的多余空白
    const finalHtml = cleanedHtml.replace(/\n\s*\n\s*\n/g, '\n\n')

    if (options.debug && originalHtml !== finalHtml) {
      console.log('[DEBUG] HTML已被修改')
      console.log('[DEBUG] 最终HTML预览:', finalHtml.substring(0, 500))
    }

    return finalHtml
  }

  // 5. 确保链式调用正常工作
  md.renderer.rules.image_link = md.renderer.rules.image
}
