// .vitepress/utils/image-utils.ts
/**
 * 检查图片是否需要 WebP 转换
 */
export function shouldConvertToWebp(src: string): boolean {
  const lowerSrc = src.toLowerCase()

  // 已经是 WebP 格式
  if (lowerSrc.endsWith('.webp')) {
    return false
  }

  // 是 SVG 格式（矢量图，不需要转换）
  if (lowerSrc.endsWith('.svg')) {
    return false
  }

  // 包含 data: 协议的 base64 图片
  if (src.startsWith('data:')) {
    return false
  }

  // 外部图片（跳过，可能无法控制）
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return false
  }

  // 支持转换的格式
  return /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(src)
}

/**
 * 生成图片的 srcset 属性
 */
export function generateSrcset(
  baseSrc: string,
  sizes: number[] = [480, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map((size) => {
      const url = new URL(baseSrc, 'https://example.com')
      url.searchParams.set('w', size.toString())
      return `${url.pathname + url.search} ${size}w`
    })
    .join(', ')
}

/**
 * 获取图片的尺寸信息
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = src
  })
}

/**
 * 优化图片 URL
 */
export function optimizeImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'original'
  } = {}
): string {
  const { width, height, quality = 80, format = 'original' } = options

  const url = new URL(src, 'https://example.com')

  if (width) {
    url.searchParams.set('w', width.toString())
  }

  if (height) {
    url.searchParams.set('h', height.toString())
  }

  if (quality && quality !== 100) {
    url.searchParams.set('q', quality.toString())
  }

  if (format === 'webp') {
    url.searchParams.set('format', 'webp')
  }

  return url.pathname + url.search
}
