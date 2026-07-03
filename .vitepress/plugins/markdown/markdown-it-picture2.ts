import type MarkdownIt from 'markdown-it'
import path from 'path'
import fs from 'fs'
import { Token } from 'markdown-it/index.js'

export interface PicturePluginOptions {
  lazy?: boolean
  figureClass?: string
  pictureClass?: string
  imgClass?: string
  figcaptionClass?: string
  basePath?: string
  dev?: boolean
}

export interface ImageInfo {
  original: string
  alt: string
  title: string
  ext: string
  isExternal: boolean
}

export interface ImageFormat {
  format: string
  src: string
}

const picturePlugin = (md: MarkdownIt, options: PicturePluginOptions = {}): void => {
  const defaultOptions: Required<PicturePluginOptions> = {
    lazy: true,
    figureClass: 'vp-image',
    pictureClass: 'vp-picture',
    imgClass: 'vp-img',
    figcaptionClass: 'vp-figcaption',
    basePath: process.cwd(),
    dev: process.env.NODE_ENV === 'development',
    ...options,
  }

  const defaultImageRender = md.renderer.rules.image

  md.renderer.rules.image = (
    tokens: Token[],
    idx: number,
    options: any,
    env: any,
    self: any
  ): string => {
    const token = tokens[idx]
    const srcIndex = token.attrIndex('src')
    const altIndex = token.attrIndex('alt')
    const titleIndex = token.attrIndex('title')

    if (srcIndex < 0) {
      return defaultImageRender!(tokens, idx, options, env, self)
    }

    const src = token.attrs![srcIndex][1]
    const alt = altIndex >= 0 ? token.attrs![altIndex][1] : ''
    const title = titleIndex >= 0 ? token.attrs![titleIndex][1] : ''

    const imageInfo: ImageInfo = {
      original: src,
      alt,
      title,
      ext: path.extname(src).toLowerCase(),
      isExternal: src.startsWith('http'),
    }

    let resolvedSrc = src
    if (src.startsWith('./') || src.startsWith('../')) {
      const fileDir = env.filePath ? path.dirname(env.filePath) : process.cwd()
      resolvedSrc = path.resolve(fileDir, src)
    } else if (!src.startsWith('/') && !src.startsWith('http')) {
      resolvedSrc = path.resolve(defaultOptions.basePath, src)
    }

    if (defaultOptions.dev || imageInfo.isExternal) {
      return buildSimpleFigure(imageInfo, defaultOptions)
    }

    return buildMultiFormatFigure(resolvedSrc, imageInfo, defaultOptions)
  }
}

function buildSimpleFigure(imageInfo: ImageInfo, options: Required<PicturePluginOptions>): string {
  const imgAttrs = [
    `src="${imageInfo.original}"`,
    `alt="${imageInfo.alt || ''}"`,
    options.lazy ? 'loading="lazy"' : '',
    options.imgClass ? `class="${options.imgClass}"` : '',
    imageInfo.title ? `title="${imageInfo.title}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const figureAttrs = [options.figureClass ? `class="${options.figureClass}"` : '']
    .filter(Boolean)
    .join(' ')

  const imgTag = `<img ${imgAttrs}>`

  if (imageInfo.title) {
    return `
<figure ${figureAttrs}>
  ${imgTag}
  <figcaption class="${options.figcaptionClass}">${imageInfo.title}</figcaption>
</figure>
    `.trim()
  }

  return imgTag
}

function buildMultiFormatFigure(
  resolvedSrc: string,
  imageInfo: ImageInfo,
  options: Required<PicturePluginOptions>
): string {
  const formats: string[] = ['avif', 'webp']
  const supportedFormats: ImageFormat[] = []

  for (const format of formats) {
    const formatPath = resolvedSrc.replace(new RegExp(`\\${imageInfo.ext}$`), `.${format}`)
    if (fs.existsSync(formatPath)) {
      supportedFormats.push({
        format,
        src: getRelativePath(resolvedSrc, formatPath, imageInfo.original),
      })
    }
  }

  const pictureClass = options.pictureClass ? `class="${options.pictureClass}"` : ''

  const sourceTags = supportedFormats
    .map((format) => `<source srcset="${format.src}" type="image/${format.format}">`)
    .join('\n    ')

  const originalSrc = getRelativePath(resolvedSrc, resolvedSrc, imageInfo.original)

  const imgAttrs = [
    `src="${originalSrc}"`,
    `alt="${imageInfo.alt || ''}"`,
    options.lazy ? 'loading="lazy"' : '',
    options.imgClass ? `class="${options.imgClass}"` : '',
    imageInfo.title ? `title="${imageInfo.title}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const figureAttrs = [options.figureClass ? `class="${options.figureClass}"` : '']
    .filter(Boolean)
    .join(' ')

  const pictureContent = sourceTags
    ? `
<picture ${pictureClass}>
  ${sourceTags}
  <img ${imgAttrs}>
</picture>`.trim()
    : `<img ${imgAttrs}>`

  if (imageInfo.title) {
    return `
<figure ${figureAttrs}>
  ${pictureContent}
  <figcaption class="${options.figcaptionClass}">${imageInfo.title}</figcaption>
</figure>
    `.trim()
  }

  return pictureContent
}

function getRelativePath(basePath: string, fullPath: string, originalPath: string): string {
  if (originalPath.startsWith('http')) {
    return originalPath
  }

  if (originalPath.startsWith('./') || originalPath.startsWith('../')) {
    return fullPath.replace(basePath, '').replace(/^[^.]/, './$&')
  }

  return path.relative(process.cwd(), fullPath)
}

export default picturePlugin
