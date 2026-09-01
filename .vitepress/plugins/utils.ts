import fs from 'fs'
import path from 'path'

export interface ImageVariants {
  original: string
  avif?: string
  webp?: string
  [key: string]: string | undefined
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

/**
 * 获取图片的多种格式
 */
export function getImageVariants(imagePath: string): ImageVariants {
  const ext = path.extname(imagePath)
  const basename = imagePath.replace(new RegExp(`\\${ext}$`), '')

  const variants: ImageVariants = {
    original: imagePath,
  }

  const availableFormats = ['avif', 'webp']
  for (const format of availableFormats) {
    const formatPath = `${basename}.${format}`
    if (fileExists(formatPath)) {
      variants[format] = formatPath
    }
  }

  return variants
}

/**
 * 将绝对路径转换为相对路径
 */
export function toRelativePath(absolutePath: string, basePath: string = process.cwd()): string {
  return path.relative(basePath, absolutePath)
}

/**
 * 判断是否是外部URL
 */
export function isExternalUrl(url: string): boolean {
  return /^(https?:)?\/\//.test(url)
}

/**
 * 获取文件扩展名
 */
export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

/**
 * 检查是否是图片文件
 */
export function isImageFile(filename: string): boolean {
  const ext = getExtension(filename)
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(ext)
}
