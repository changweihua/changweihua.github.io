import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function processImage(filePath: string): Promise<void> {
  const ext = path.extname(filePath).toLowerCase()
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']

  // 1. 跳过已转换的格式和目标格式文件
  if (['.avif'].includes(ext) || !supportedFormats.includes(ext)) {
    return
  }

  // 2. 对于.webp文件，只生成.avif格式（如果需要）
  const isWebpInput = ext === '.webp'
  const dir = path.dirname(filePath)
  const name = path.basename(filePath, ext)
  const baseName = path.join(dir, name)

  try {
    const stats = await fs.stat(filePath)
    const image = sharp(filePath)
    const metadata = await image.metadata()

    console.log(`检查: ${path.relative(process.cwd(), filePath)}`)

    // 3. 生成 WebP（原图不是webp时才生成）
    if (!isWebpInput) {
      const webpPath = `${baseName}.webp`
      try {
        const webpExists = await fileExists(webpPath)
        let shouldGenerateWebp = true

        if (webpExists) {
          const webpStats = await fs.stat(webpPath)
          // 如果webp文件比原图新，则跳过
          shouldGenerateWebp = webpStats.mtime < stats.mtime
          if (!shouldGenerateWebp) {
            console.log(`  ⏭️ 跳过: ${path.basename(webpPath)} (已是最新)`)
          }
        }

        if (shouldGenerateWebp) {
          await image.clone().webp({ quality: 80, effort: 6 }).toFile(webpPath)
          console.log(`  ✅ 生成: ${path.basename(webpPath)}`)
        }
      } catch (err: any) {
        console.warn(`  WebP处理失败: ${err.message}`)
      }
    }

    // 4. 生成 AVIF
    const avifPath = `${baseName}.avif`
    try {
      const avifExists = await fileExists(avifPath)
      let shouldGenerateAvif = true

      if (avifExists) {
        const avifStats = await fs.stat(avifPath)
        // 如果avif文件比原图新，则跳过
        shouldGenerateAvif = avifStats.mtime < stats.mtime
        if (!shouldGenerateAvif) {
          console.log(`  ⏭️ 跳过: ${path.basename(avifPath)} (已是最新)`)
        }
      }

      if (shouldGenerateAvif) {
        await image.clone().avif({ quality: 70, effort: 6 }).toFile(avifPath)
        console.log(`  ✅ 生成: ${path.basename(avifPath)}`)
      }
    } catch (err: any) {
      console.warn(`  AVIF处理失败: ${err.message}`)
    }
  } catch (err: any) {
    console.warn(`处理失败 ${path.basename(filePath)}:`, err.message)
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function findImages(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true })
  const images: string[] = []

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      // 递归搜索子目录（跳过 node_modules 等特殊目录）
      if (!file.name.startsWith('.') && file.name !== 'node_modules') {
        images.push(...(await findImages(fullPath)))
      }
    } else if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase()
      const supported = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
      if (supported.includes(ext)) {
        images.push(fullPath)
      }
    }
  }

  return images
}

async function main() {
  console.log('🔄 开始检查并转换图片格式...')
  console.log('📁 扫描目录:', PUBLIC_DIR)

  try {
    // 确保目录存在
    await fs.access(PUBLIC_DIR)

    const images = await findImages(PUBLIC_DIR)
    console.log(`找到 ${images.length} 张可处理的图片`)

    if (images.length === 0) {
      console.log('提示: 请将图片放入 docs/public/ 目录或其子目录中')
      console.log('支持的格式: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP')
      return
    }

    // 处理每张图片
    for (const image of images) {
      await processImage(image)
    }

    console.log('✅ 图片处理完成！')
    console.log('📋 处理规则:')
    console.log('  • JPG/PNG等 → 生成 .webp 和 .avif')
    console.log('  • WebP文件 → 只生成 .avif')
    console.log('  • 已存在且比原图新的文件会被跳过')
    console.log('  • 原始文件保持不变')
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error('❌ 错误: public目录不存在', PUBLIC_DIR)
      console.log('💡 请创建目录: mkdir -p docs/public')
    } else {
      console.error('❌ 处理失败:', err.message)
    }
    process.exit(1)
  }
}

// 执行主函数
main().catch(console.error)
