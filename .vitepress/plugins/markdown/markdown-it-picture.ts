import type MarkdownIt from 'markdown-it'
import fs from 'fs'
import path from 'path'
import { Token } from 'markdown-it/index.js'

// --- 配置接口 ---
export interface PicturePluginOptions {
  // 核心路径配置
  publicDir?: string // public目录的绝对路径，用于解析绝对路径图片 (/images/...)

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
  containerClasses: ['figure-list'], // 默认处理 figure-list 容器
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
}

// --- 核心工具函数（带缓存）---
const fileCache = new Map<string, boolean>()
const formatCache = new Map<string, string[]>() // 缓存图片格式检测结果

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
 * 处理：外部URL、绝对路径(/开头)、相对路径
 */
function resolveImagePaths(
  src: string,
  env: any,
  options: Required<PicturePluginOptions>
): { fsPath: string; webSrc: string; isExternal: boolean } {
  // 外部URL直接返回
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
 * 检测图片可用的现代格式 (WebP, AVIF, JXL)
 */
function detectAvailableFormats(fsPath: string, options: Required<PicturePluginOptions>): string[] {
  const cacheKey = `${fsPath}_${options.enableJXL}_${options.enableAVIF}_${options.enableWebP}`

  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!
  }

  const formats: string[] = []
  const basePath = fsPath.replace(/\.[^.]+$/, '')

  // 检查各格式文件是否存在
  if (options.enableWebP && fileExistsSync(`${basePath}.webp`)) {
    formats.push('webp')
  }
  if (options.enableAVIF && fileExistsSync(`${basePath}.avif`)) {
    formats.push('avif')
  }
  if (options.enableJXL && fileExistsSync(`${basePath}.jxl`)) {
    formats.push('jxl')
  }

  formatCache.set(cacheKey, formats)
  return formats
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

  // 外部图片或数据URL，直接生成简单img标签
  if (isExternal) {
    const imgAttrs = [
      `src="${webSrc}"`,
      `alt="${escapeHtml(imageInfo.alt)}"`,
      options.imgClass ? `class="${options.imgClass}"` : '',
      imageInfo.width ? `width="${imageInfo.width}"` : '',
      imageInfo.height ? `height="${imageInfo.height}"` : '',
      options.lazyLoading ? 'loading="lazy"' : '',
      `decoding="${options.decoding}"`,
      imageInfo.title ? `title="${escapeHtml(imageInfo.title)}"` : '',
      imageInfo.class ? `class="${imageInfo.class}"` : '',
    ]
      .filter(Boolean)
      .join(' ')

    return `<img ${imgAttrs}>`
  }

  // 本地图片：检测可用格式
  const availableFormats = detectAvailableFormats(fsPath, options)

  // 构建img标签属性
  const imgAttrs = [
    `src="${webSrc}"`,
    `alt="${escapeHtml(imageInfo.alt)}"`,
    options.imgClass ? `class="${options.imgClass}"` : '',
    imageInfo.width ? `width="${imageInfo.width}"` : '',
    imageInfo.height ? `height="${imageInfo.height}"` : '',
    options.lazyLoading ? 'loading="lazy"' : '',
    `decoding="${options.decoding}"`,
    imageInfo.title ? `title="${escapeHtml(imageInfo.title)}"` : '',
    imageInfo.class ? `class="${imageInfo.class}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const imgTag = `<img ${imgAttrs}>`

  // 生成source标签
  let sourcesHTML = ''
  if (availableFormats.length > 0) {
    const sources = availableFormats
      .map((format) => {
        const formatWebSrc = webSrc.replace(/\.[^.]+$/, `.${format}`)
        const mimeType = `image/${format}`
        return `<source srcset="${formatWebSrc}" type="${mimeType}">`
      })
      .join('\n    ')

    sourcesHTML = `<picture class="${options.pictureClass}">\n    ${sources}\n    ${imgTag}\n</picture>`
  }

  // 决定最终输出内容
  let contentHTML = availableFormats.length > 0 ? sourcesHTML : imgTag

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

    contentHTML = `<figure ${figureAttrs}>\n  ${contentHTML}${figcaptionHTML}\n</figure>`
  }

  return contentHTML
}

/**
 * HTML转义
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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

  // 为每个容器类名构建正则表达式
  for (const className of options.containerClasses) {
    // 匹配包含指定class的div开始标签
    const containerStartRegex = new RegExp(
      `<div\\s+[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
      'gi'
    )

    let match
    while ((match = containerStartRegex.exec(html)) !== null) {
      const startIndex = match.index
      const startTag = match[0]

      // 找到对应的闭合标签
      const afterStart = html.substring(startIndex + startTag.length)
      let depth = 1
      let pos = 0
      let endIndex = -1

      // 查找匹配的闭合</div>
      while (pos < afterStart.length) {
        const nextOpen = afterStart.indexOf('<div', pos)
        const nextClose = afterStart.indexOf('</div>', pos)

        // 如果先找到闭合标签
        if (nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen)) {
          depth--
          pos = nextClose + 6 // 6是 '</div>'.length
          if (depth === 0) {
            endIndex = startIndex + startTag.length + nextClose
            break
          }
        }
        // 如果先找到新的开始标签
        else if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
          depth++
          pos = nextOpen + 4 // 4是 '<div'.length
        } else {
          break // 没有更多标签
        }
      }

      if (endIndex === -1) {
        continue // 没有找到闭合标签，跳过这个容器
      }

      // 提取容器内容
      const beforeContainer = html.substring(0, startIndex)
      const containerContent = html.substring(startIndex + startTag.length, endIndex)
      const afterContainer = html.substring(endIndex + 6) // 6是 '</div>'.length

      // 转换容器内容中的图片
      const processedContent = processImgTagsInHTML(containerContent, env, options)

      // 重新组合HTML
      html = beforeContainer + startTag + processedContent + '</div>' + afterContainer

      // 更新正则表达式搜索位置
      containerStartRegex.lastIndex =
        beforeContainer.length + startTag.length + processedContent.length + 7
    }
  }

  return html
}

/**
 * 处理HTML片段中的普通<img>标签（修正版）
 */
function processImgTagsInHTML(
  htmlSegment: string,
  env: any,
  options: Required<PicturePluginOptions>
): string {
  // 匹配普通的img标签，避免匹配已经在picture/figure内的img
  const imgTagRegex = /<img\s+([^>]*?)>/gi

  // 使用一个变量来记录当前搜索的起始位置，以辅助判断“前面的字符”
  let lastIndex = 0

  return htmlSegment.replace(imgTagRegex, (match, attributesStr, offset) => {
    // `offset` 参数是当前匹配项在原始字符串中的索引
    // 使用它来获取匹配前的文本，以判断是否已被处理
    const precedingText = htmlSegment.substring(Math.max(0, offset - 100), offset)

    // 跳过已经处理过的图片（在picture或figure内）
    if (precedingText.includes('<picture') || precedingText.includes('<figure')) {
      return match
    }

    // 解析属性
    const attrs: Record<string, string> = {}
    const attrRegex = /(\w+)=["']([^"']+)["']/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }

    // 如果没有src属性，保留原样
    if (!attrs.src) {
      if (options.debug) {
        console.log(`[DEBUG] 跳过无src属性的img标签`)
      }
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

    try {
      const newHTML = generatePictureHTML(imageInfo, env, options)

      if (options.debug) {
        console.log(`[DEBUG] 转换容器内图片: ${attrs.src}`)
        console.log(`[DEBUG] 原标签: ${match}`)
        console.log(`[DEBUG] 新HTML: ${newHTML.substring(0, 100)}...`)
      }

      return newHTML
    } catch (error) {
      if (options.debug) {
        console.warn(`[DEBUG] 转换容器内图片失败 (${attrs.src}):`, error)
      }
      return match // 转换失败，保留原img标签
    }
  })
}

// --- Markdown-it 插件主体 ---
export default function picturePlugin(md: MarkdownIt, userOptions?: PicturePluginOptions) {
  const options: Required<PicturePluginOptions> = { ...DEFAULT_OPTIONS, ...userOptions }

  if (options.debug) {
    console.log('[DEBUG] Picture插件初始化，配置:', options)
  }

  // 1. 保存原始图片渲染函数
  const defaultImageRender = md.renderer.rules.image

  // 2. 覆盖默认的图片渲染规则（处理标准的Markdown图片语法）
  md.renderer.rules.image = (tokens: Token[], idx: number, opts: any, env: any, self: any) => {
    const token = tokens[idx]

    // 这通过修改token的`type`和`tag`属性实现
    token.type = 'figure_block' // 自定义一个类型，使其不再是'image'或'inline'
    token.tag = 'figure' // 暗示这是一个块级标签
    token.block = true // 明确标记为块级

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
      }
    }

    // 从token内容获取alt文本（如果属性中没有）
    if (!imageInfo.alt && token.content) {
      imageInfo.alt = token.content
    }

    if (options.debug) {
      console.log(`[DEBUG] 处理Markdown图片: src=${imageInfo.src}, alt=${imageInfo.alt}`)
    }

    // 使用我们的函数生成HTML
    return generatePictureHTML(imageInfo, env, options)
  }

  // 3. 保存原始的render函数用于后处理
  const originalRender = md.render.bind(md)

  // 4. 覆盖render函数，注入后处理逻辑
  md.render = function (src: string, env: any = {}) {
    // 调用原始render得到HTML
    const originalHtml = originalRender(src, env)

    // 应用后处理：转换容器内的图片
    const processedHtml = convertImagesInContainer(originalHtml, env, options)

    // === 【新增清理步骤】===
    // 清理无效的嵌套：将 <p><figure>...</figure></p> 替换为 <figure>...</figure>
    let finalHtml = processedHtml.replace(
      /<p[^>]*>\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/gi,
      '$1' // 用捕获的figure标签替换整个p标签
    )
    // 同样清理 <p><picture>...</picture></p>
    finalHtml = finalHtml.replace(/<p[^>]*>\s*(<picture[\s\S]*?<\/picture>)\s*<\/p>/gi, '$1')
    // 清理可能产生的空段落标签
    finalHtml = finalHtml.replace(/<p[^>]*>\s*<\/p>/gi, '')
    // === 【清理步骤结束】===

    if (options.debug && originalHtml !== finalHtml) {
      console.log('[DEBUG] 后处理已修改HTML内容，并清理了无效的<p>包裹。')
    }

    return processedHtml
  }

  // 5. 确保链式调用正常工作
  md.renderer.rules.image_link = md.renderer.rules.image
}
