import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { createHash } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'

// 工具函数：将execFile转换为Promise形式
const execFileAsync = promisify(execFile)

// 配置常量
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const CACHE_FILE = path.join(process.cwd(), '.vitepress/cache/image-cache.json')

// 缓存数据结构
interface ImageCacheEntry {
  hash: string
  formats: {
    webp?: boolean
    avif?: boolean
    jxl?: boolean // 新增JXL支持
  }
  timestamp: number
  size: number
  dimensions?: {
    width: number
    height: number
  }
}

interface ImageCache {
  [key: string]: ImageCacheEntry
}

// 图片格式配置（新增JXL配置，针对cjxl命令）
const FORMAT_CONFIG = {
  webp: {
    quality: 80,
    effort: 6,
  },
  avif: {
    quality: 70,
    effort: 6,
  },
  jxl: {
    // 针对cjxl命令的参数配置
    quality: 80, // 质量参数 (1-100，100为无损)
    effort: 7, // 编码努力度 (1-9，越高越慢但压缩越好)
    progressive: true, // 是否生成渐进式文件
    lossless: false, // 是否无损编码
  },
} as const

// 支持的输入格式
const SUPPORTED_INPUT_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'] as const

/**
 * 计算文件哈希值
 */
async function getFileHash(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath)
    return createHash('md5').update(buffer).digest('hex')
  } catch {
    return ''
  }
}

/**
 * 加载缓存数据
 */
async function loadCache(): Promise<ImageCache> {
  try {
    const cacheDir = path.dirname(CACHE_FILE)
    await fs.mkdir(cacheDir, { recursive: true })

    const data = await fs.readFile(CACHE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

/**
 * 保存缓存数据
 */
async function saveCache(cache: ImageCache): Promise<void> {
  try {
    const data = JSON.stringify(cache, null, 2)
    await fs.writeFile(CACHE_FILE, data, 'utf-8')
  } catch (err) {
    console.warn('保存缓存失败:', err)
  }
}

/**
 * 清理无效缓存条目
 */
async function cleanupCache(cache: ImageCache): Promise<ImageCache> {
  const cleanedCache: ImageCache = {}

  for (const [filePath, entry] of Object.entries(cache)) {
    try {
      await fs.access(filePath)
      cleanedCache[filePath] = entry
    } catch {
      console.log(`清理缓存: ${path.basename(filePath)} (文件已删除)`)
    }
  }

  return cleanedCache
}

/**
 * 使用cjxl命令行工具生成JXL图片
 */
async function generateJXLImage(
  inputPath: string,
  outputPath: string,
  metadata: sharp.Metadata,
  originalFileSize: number,
  isJpeg: boolean
): Promise<boolean> {
  try {
    console.log(`  编码JXL: ${path.basename(outputPath)}`)

    // 构建cjxl命令参数
    const baseArgs = [
      inputPath, // 输入文件
      outputPath, // 输出文件
      // `--quality=${FORMAT_CONFIG.jxl.quality}`,
      // '--quality=100', // 必须设为100才能与无损模式兼容
      `--effort=${FORMAT_CONFIG.jxl.effort}`,
      // '--strip', // 关键：移除可能导致问题的ICC配置文件
      '--num_threads=0', // 使用所有CPU核心
      // '--lossless_jpeg=0', // 关键：显式关闭JPEG无损重压缩模式
      // '--lossless_jpeg=1', // 关键：显式强制启用，而非依赖默认
      // '-v', // 输出详细信息，用于验证
    ]

    if (isJpeg) {
      // JPEG：使用无损重压缩
      baseArgs.push('--quality=100', '--lossless_jpeg=1')
      console.log(`  编码JXL (JPEG无损模式): ${path.basename(outputPath)}`)
    } else {
      // 非JPEG（如PNG）：使用你之前定义的质量进行有损压缩，或使用`--lossless`进行无损编码
      // 添加无损编码选项（如果启用）
      if (FORMAT_CONFIG.jxl.lossless) {
        baseArgs.push('--lossless')
      } else {
        baseArgs.push(`--quality=${FORMAT_CONFIG.jxl.quality}`)
      }
      // 如果希望PNG也无损，可以改为：baseArgs.push('--lossless');
      console.log(`  编码JXL (标准模式): ${path.basename(outputPath)}`)
    }

    // 添加渐进式选项（如果启用）
    if (FORMAT_CONFIG.jxl.progressive) {
      baseArgs.push('--progressive')
    }

    // 添加详细输出以便调试
    baseArgs.push('-v')

    // 执行cjxl命令
    const { stderr } = await execFileAsync('cjxl', baseArgs)

    // 检查输出文件是否成功创建
    if (await fileExists(outputPath)) {
      const stats = await fs.stat(outputPath)
      const originalSize = originalFileSize
      const savings =
        originalSize > 0 ? (((originalSize - stats.size) / originalSize) * 100).toFixed(1) : '0.0'

      console.log(`    ✅ JXL生成成功: ${(stats.size / 1024).toFixed(1)}KB (节省${savings}%)`)

      // 输出警告信息（如果有）
      if (stderr && stderr.trim()) {
        const warnings = stderr
          .split('\n')
          .filter((line) => line.includes('WARNING:') || line.includes('Warning:'))
        if (warnings.length > 0) {
          console.log(`    警告: ${warnings.join('; ')}`)
        }
      }

      return true
    } else {
      console.warn(`    ❌ JXL输出文件未创建`)
      return false
    }
  } catch (error: any) {
    // 细化错误处理
    if (error.code === 'ENOENT') {
      console.error(`    ❌ 错误: 未找到 'cjxl' 命令。请先安装 libjxl。`)
      console.error(`        安装方法:`)
      console.error(`        Ubuntu/Debian: sudo apt update && sudo apt install libjxl-tools`)
      console.error(`        macOS: brew install jxl`)
      console.error(`        Windows: 从 https://github.com/libjxl/libjxl/releases 下载`)
      console.error(`        源码编译: 参考 https://github.com/libjxl/libjxl`)
    } else if (error.stderr) {
      const errorMsg = error.stderr.toString().trim()
      console.warn(
        `    ❌ JXL编码失败: ${errorMsg.substring(0, 200)}${errorMsg.length > 200 ? '...' : ''}`
      )
    } else {
      console.warn(`    ❌ JXL编码失败: ${error.message}`)
    }
    return false
  }
}

/**
 * 检查文件是否存在
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 处理单张图片（集成JXL生成）
 */
async function processImage(filePath: string, cache: ImageCache): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase()

  // 跳过不受支持的格式和已生成的JXL文件
  if (!SUPPORTED_INPUT_FORMATS.includes(ext as any) || ext === '.jxl') {
    return false
  }
  // 定义我们只处理的原始格式
  const SOURCE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
  // 定义我们生成的目标格式（不作为输入）
  const TARGET_FORMATS = ['.jxl', '.avif', '.webp']

  // 如果文件不是源格式，或者已经是目标格式，则跳过
  if (!SOURCE_FORMATS.includes(ext) || TARGET_FORMATS.includes(ext)) {
    console.log(`⏭️ 跳过（非源文件或已是目标格式）: ${path.basename(filePath)}`)
    return false
  }

  const dir = path.dirname(filePath)
  const name = path.basename(filePath, ext)
  const baseName = path.join(dir, name)
  const isWebpInput = ext === '.webp'

  try {
    // 获取文件信息
    const stats = await fs.stat(filePath)
    const fileHash = await getFileHash(filePath)
    const fileSize = stats.size
    const modifiedTime = stats.mtime.getTime()

    // 获取图片元数据
    const image = sharp(filePath)
    const metadata = await image.metadata()

    // 检查是否需要处理
    const cacheEntry = cache[filePath]
    let needsProcessing = true

    if (cacheEntry) {
      // 检查文件是否已更改
      const isChanged = cacheEntry.hash !== fileHash

      if (!isChanged) {
        // 检查已生成的格式是否都存在
        let allFormatsExist = true

        if (!isWebpInput && cacheEntry.formats.webp) {
          const webpPath = `${baseName}.webp`
          allFormatsExist = allFormatsExist && (await fileExists(webpPath))
        }

        if (cacheEntry.formats.avif) {
          const avifPath = `${baseName}.avif`
          allFormatsExist = allFormatsExist && (await fileExists(avifPath))
        }

        if (cacheEntry.formats.jxl) {
          const jxlPath = `${baseName}.jxl`
          allFormatsExist = allFormatsExist && (await fileExists(jxlPath))
        }

        needsProcessing = !allFormatsExist
      }
    }

    if (!needsProcessing) {
      console.log(`⏭️ 跳过: ${path.basename(filePath)} (已是最新)`)
      return false
    }

    // 开始处理图片
    console.log(
      `🔄 处理: ${path.basename(filePath)} (${Math.round(fileSize / 1024)}KB, ${metadata.width}x${metadata.height})`
    )

    const formats: Record<string, boolean> = {}

    // 1. 处理WebP格式
    if (!isWebpInput) {
      const webpPath = `${baseName}.webp`
      try {
        await image.clone().webp(FORMAT_CONFIG.webp).toFile(webpPath)

        const webpStats = await fs.stat(webpPath)
        console.log(
          `  ✅ WebP: ${path.basename(webpPath)} (${Math.round(webpStats.size / 1024)}KB)`
        )
        formats.webp = true
      } catch (err: any) {
        console.warn(`  ❌ WebP失败: ${err.message}`)
      }
    }

    // 2. 处理AVIF格式
    const avifPath = `${baseName}.avif`
    try {
      await image.clone().avif(FORMAT_CONFIG.avif).toFile(avifPath)

      const avifStats = await fs.stat(avifPath)
      console.log(`  ✅ AVIF: ${path.basename(avifPath)} (${Math.round(avifStats.size / 1024)}KB)`)
      formats.avif = true
    } catch (err: any) {
      console.warn(`  ❌ AVIF失败: ${err.message}`)
    }

    // 3. 处理JXL格式（使用cjxl命令行工具）
    const jxlPath = `${baseName}.jxl`

    const isJpeg = ['.jpg', '.jpeg'].includes(ext.toLowerCase())

    const jxlGenerated = await generateJXLImage(filePath, jxlPath, metadata, fileSize, isJpeg)
    if (jxlGenerated) {
      formats.jxl = true
    }

    // 更新缓存
    cache[filePath] = {
      hash: fileHash,
      formats,
      timestamp: modifiedTime,
      size: fileSize,
      dimensions:
        metadata.width && metadata.height
          ? {
              width: metadata.width,
              height: metadata.height,
            }
          : undefined,
    }

    return Object.keys(formats).length > 0
  } catch (err: any) {
    console.warn(`处理失败 ${path.basename(filePath)}:`, err.message)
    return false
  }
}

/**
 * 查找所有图片文件
 */
async function findImages(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true })
  const images: string[] = []

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      // 递归搜索子目录
      if (!file.name.startsWith('.') && file.name !== 'node_modules') {
        images.push(...(await findImages(fullPath)))
      }
    } else if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase()
      const SOURCE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
      if (SOURCE_FORMATS.includes(ext)) {
        // 只添加源格式文件
        images.push(fullPath)
      }
    }
  }

  return images
}

/**
 * 显示统计信息
 */
function showStats(processed: number, skipped: number, total: number, cache: ImageCache): void {
  console.log('\n📊 处理统计:')
  console.log(`  总数: ${total} 张图片`)
  console.log(`  已处理: ${processed} 张`)
  console.log(`  已跳过: ${skipped} 张`)

  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0
  console.log(`  处理率: ${percentage}%`)

  // 统计各格式生成情况
  let webpCount = 0
  let avifCount = 0
  let jxlCount = 0

  Object.values(cache).forEach((entry) => {
    if (entry.formats.webp) webpCount++
    if (entry.formats.avif) avifCount++
    if (entry.formats.jxl) jxlCount++
  })

  console.log('\n🎨 格式生成统计:')
  console.log(`  WebP: ${webpCount}`)
  console.log(`  AVIF: ${avifCount}`)
  console.log(`  JXL:  ${jxlCount}`)

  console.log(`\n💾 缓存文件: ${path.relative(process.cwd(), CACHE_FILE)}`)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 图片格式转换工具 (支持WebP/AVIF/JXL)')
  console.log('📁 工作目录:', path.relative(process.cwd(), PUBLIC_DIR))
  console.log('🔧 JXL编码工具: cjxl (libjxl命令行工具)')

  try {
    // 检查目录是否存在
    await fs.access(PUBLIC_DIR)

    // 加载并清理缓存
    let cache = await loadCache()
    cache = await cleanupCache(cache)
    console.log(`📦 已加载缓存: ${Object.keys(cache).length} 条记录`)

    // 查找所有图片
    const images = await findImages(PUBLIC_DIR)
    console.log(`🔍 找到 ${images.length} 张可处理的图片`)

    if (images.length === 0) {
      console.log('\n💡 提示:')
      console.log('  支持的输入格式:', SUPPORTED_INPUT_FORMATS.join(', '))
      console.log('  生成格式: WebP, AVIF, JPEG XL (JXL)')
      console.log('  请将图片放入:', path.relative(process.cwd(), PUBLIC_DIR))
      return
    }

    // 处理每张图片
    let processedCount = 0
    let skippedCount = 0

    console.log('\n🔄 开始处理...')

    for (const image of images) {
      const processed = await processImage(image, cache)

      if (processed) {
        processedCount++
      } else {
        skippedCount++
      }
    }

    // 保存缓存
    await saveCache(cache)

    // 显示统计信息
    showStats(processedCount, skippedCount, images.length, cache)

    console.log('\n✅ 处理完成!')
    console.log('\n📋 处理规则:')
    console.log('  • 基于文件哈希值的智能缓存')
    console.log('  • 支持生成 WebP, AVIF, JPEG XL 格式')
    console.log('  • WebP/AVIF: 使用Sharp库')
    console.log('  • JXL: 使用cjxl命令行工具 (libjxl)')
    console.log('  • 仅当文件内容变化时才重新处理')
    console.log('  • 原始文件保持不变')

    // 显示JXL相关提示
    console.log('\n⚠️  JXL注意事项:')
    console.log('  1. 浏览器支持:')
    console.log('     • Chrome: 需在 chrome://flags 中启用 #enable-jxl-image-format')
    console.log('     • Safari 17+: 已原生支持')
    console.log('     • Firefox: 需手动启用 about:config 中 image.jxl.enabled')
    console.log('  2. cjxl参数说明:')
    console.log(`     • 质量: ${FORMAT_CONFIG.jxl.quality} (1-100)`)
    console.log(`     • 编码努力度: ${FORMAT_CONFIG.jxl.effort} (1-9)`)
    console.log(`     • 渐进式: ${FORMAT_CONFIG.jxl.progressive ? '是' : '否'}`)
    console.log(`     • 无损编码: ${FORMAT_CONFIG.jxl.lossless ? '是' : '否'}`)
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error(`\n❌ 错误: 目录不存在 "${path.relative(process.cwd(), PUBLIC_DIR)}"`)
      console.log(`💡 请创建目录: mkdir -p ${path.relative(process.cwd(), PUBLIC_DIR)}`)
    } else {
      console.error('\n❌ 处理失败:', err.message)
    }
    process.exit(1)
  }
}

/**
 * 缓存管理命令
 */
async function manageCache(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'clear':
      try {
        await fs.unlink(CACHE_FILE)
        console.log('✅ 缓存已清除')
      } catch {
        console.log('缓存文件不存在，无需清除')
      }
      break

    case 'stats':
      try {
        const cache = await loadCache()
        console.log('📊 缓存统计:')
        console.log(`  总记录数: ${Object.keys(cache).length}`)

        let webpCount = 0
        let avifCount = 0
        let jxlCount = 0

        Object.values(cache).forEach((entry) => {
          if (entry.formats.webp) webpCount++
          if (entry.formats.avif) avifCount++
          if (entry.formats.jxl) jxlCount++
        })

        console.log(`  已生成WebP: ${webpCount}`)
        console.log(`  已生成AVIF: ${avifCount}`)
        console.log(`  已生成JXL:  ${jxlCount}`)
        console.log(`  缓存文件: ${CACHE_FILE}`)
      } catch {
        console.log('缓存文件不存在或已损坏')
      }
      break

    case 'test-jxl':
      // 测试cjxl是否可用
      console.log('🧪 测试cjxl命令行工具...')
      try {
        await execFileAsync('cjxl', ['--version'])
        console.log('✅ cjxl工具可用')
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.error('❌ cjxl未安装或不在PATH中')
          console.error('请先安装libjxl:')
          console.error('  Ubuntu/Debian: sudo apt update && sudo apt install libjxl-tools')
          console.error('  macOS: brew install jxl')
          console.error('  Windows: 从 https://github.com/libjxl/libjxl/releases 下载')
        } else {
          console.error('❌ cjxl测试失败:', error.message)
        }
      }
      break

    default:
      await main()
  }
}

console.log('🔍 [路径诊断] 开始检查执行模式...')
console.log(`   当前平台: ${process.platform}`)
console.log(`   import.meta.url: "${import.meta.url}"`)
console.log(`   process.argv[1]: "${process.argv[1]}"`)

// 尝试标准化process.argv[1]为URL
const entryUrl = new URL(`file://${path.resolve(process.argv[1]).replace(/\\/g, '/')}`)
console.log(`   标准化后入口URL: "${entryUrl.href}"`)
console.log(`   两者是否相等: ${import.meta.url === entryUrl.href}`)

if (import.meta.url === entryUrl.href) {
  console.log('✅ 脚本被直接执行，启动主逻辑')
  manageCache()
} else {
  console.log('⚠️  脚本可能被作为模块导入，不执行主逻辑')
  console.log('💡 提示：如果这是直接执行，说明路径比较逻辑需要调整')
}
