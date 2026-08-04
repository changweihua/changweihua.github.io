// image-converter.ts
// 用法：npx ts-node image-converter.ts
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createHash } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// ==================== 硬编码配置（按需修改） ====================
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images'); // 只处理 public/images
const CACHE_FILE = path.join(process.cwd(), '.image-cache.json');
const WIDTHS = [400, 800, 1200, 1600];
const CONCURRENCY = 4;

// 源文件扩展名
const SOURCE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'];

// 要忽略的目录名（完整匹配）
const IGNORED_DIRS = ['airports', 'node_modules'];

// 格式配置
const FORMATS = {
  webp: { enabled: true, quality: 80, effort: 6 },
  avif: { enabled: true, quality: 70, effort: 6 },
  jxl: {
    enabled: true,
    quality: 80,
    effort: 7,
    progressive: true,
    lossless: false,
    losslessJpeg: false, // 改为 true 可对 JPEG 源图使用无损重压缩
  },
  original: { enabled: true, quality: 85 },
};

const FORMAT_EXTS: Record<string, string> = {
  webp: '.webp',
  avif: '.avif',
  jxl: '.jxl',
  original: '',
};

// ==================== 工具函数 ====================
const existsCache = new Map<string, boolean>();
const fileExists = (p: string): boolean => {
  if (existsCache.has(p)) return existsCache.get(p)!;
  const ok = existsSync(p);
  existsCache.set(p, ok);
  return ok;
};

const fileHash = async (filePath: string): Promise<string> => {
  const buffer = await fs.readFile(filePath);
  return createHash('md5').update(buffer).digest('hex');
};

const findImages = async (dir: string): Promise<string[]> => {
  const images: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return images;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.includes(entry.name) || entry.name.startsWith('.')) continue;
      images.push(...(await findImages(fullPath)));
    } else if (entry.isFile() && SOURCE_EXTS.includes(path.extname(entry.name).toLowerCase())) {
      // ✅ 忽略已生成的宽度变体文件（例如 photo-400w.jpg 或 photo-800w.avif）
      const nameWithoutExt = path.basename(entry.name, path.extname(entry.name));
      if (/-\d+w$/.test(nameWithoutExt)) {
        continue;
      }
      images.push(fullPath);
    }
  }
  return images;
};

const getOutputPath = (base: string, width: number, format: string, origExt?: string): string => {
  const ext = format === 'original' ? (origExt ?? '.jpg') : FORMAT_EXTS[format];
  return `${base}-${width}w${ext}`;
};

// ==================== 格式生成函数 ====================
async function generateSharpFormat(
  input: string,
  output: string,
  width: number,
  format: 'webp' | 'avif' | 'jpeg' | 'png',
  quality: number,
  effort?: number
): Promise<boolean> {
  try {
    const pipeline = sharp(input).resize(width, null, { withoutEnlargement: true });
    switch (format) {
      case 'webp': await pipeline.webp({ quality, effort: effort ?? 4 }).toFile(output); break;
      case 'avif': await pipeline.avif({ quality, effort: effort ?? 4 }).toFile(output); break;
      case 'jpeg': await pipeline.jpeg({ quality }).toFile(output); break;
      case 'png': await pipeline.png({ quality }).toFile(output); break;
    }
    return true;
  } catch (e) {
    console.error(`[${format}] ${path.basename(output)}:`, (e as Error).message);
    return false;
  }
}

/**
 * 原有的 cjxl 编码逻辑（严格保留）
 * @param inputPath  临时文件路径（已缩放的 JPEG 或 PNG）
 * @param outputPath 最终 .jxl 路径
 * @param metadata   原图元数据（未使用，保留兼容）
 * @param originalFileSize 原图大小（未使用，保留兼容）
 * @param isJpeg     临时文件是否为 JPEG 格式
 */
async function generateJXLImage(
  inputPath: string,
  outputPath: string,
  metadata: sharp.Metadata,
  originalFileSize: number,
  isJpeg: boolean
): Promise<boolean> {
  try {
    console.log(`  编码JXL: ${path.basename(outputPath)}`);

    const baseArgs = [
      inputPath,
      outputPath,
      `--effort=${FORMATS.jxl.effort}`,
      '--num_threads=0',
    ];

    if (isJpeg) {
      // JPEG：使用无损重压缩
      baseArgs.push('--quality=100', '--lossless_jpeg=1');
      console.log(`  编码JXL (JPEG无损模式): ${path.basename(outputPath)}`);
    } else {
      // 非JPEG
      if (FORMATS.jxl.lossless) {
        baseArgs.push('--lossless');
      } else {
        baseArgs.push(`--quality=${FORMATS.jxl.quality}`);
      }
      console.log(`  编码JXL (标准模式): ${path.basename(outputPath)}`);
    }

    if (FORMATS.jxl.progressive) {
      baseArgs.push('--progressive');
    }

    baseArgs.push('-v');

    const { stderr } = await execFileAsync('cjxl', baseArgs);

    if (await fileExists(outputPath)) {
      const stats = await fs.stat(outputPath);
      const savings =
        originalFileSize > 0
          ? (((originalFileSize - stats.size) / originalFileSize) * 100).toFixed(1)
          : '0.0';
      console.log(`    ✅ JXL生成成功: ${(stats.size / 1024).toFixed(1)}KB (节省${savings}%)`);
      if (stderr && stderr.trim()) {
        const warnings = stderr
          .split('\n')
          .filter((line: string) => line.includes('WARNING:') || line.includes('Warning:'));
        if (warnings.length > 0) console.log(`    警告: ${warnings.join('; ')}`);
      }
      return true;
    } else {
      console.warn(`    ❌ JXL输出文件未创建`);
      return false;
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`    ❌ 错误: 未找到 'cjxl' 命令。请先安装 libjxl。`);
      console.error(`        安装方法:`);
      console.error(`        Ubuntu/Debian: sudo apt update && sudo apt install libjxl-tools`);
      console.error(`        macOS: brew install jxl`);
      console.error(`        Windows: 从 https://github.com/libjxl/libjxl/releases 下载`);
      console.error(`        源码编译: 参考 https://github.com/libjxl/libjxl`);
    } else if (error.stderr) {
      const errorMsg = error.stderr.toString().trim();
      console.warn(
        `    ❌ JXL编码失败: ${errorMsg.substring(0, 200)}${errorMsg.length > 200 ? '...' : ''}`
      );
    } else {
      console.warn(`    ❌ JXL编码失败: ${error.message}`);
    }
    return false;
  }
}

// ==================== 单张处理 ====================
async function processImage(filePath: string, cache: any): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTS.includes(ext)) return false;

  const dir = path.dirname(filePath);
  const base = path.join(dir, path.basename(filePath, ext));
  const isWebp = ext === '.webp';
  const isJpeg = ['.jpg', '.jpeg'].includes(ext);

  try {
    const stat = await fs.stat(filePath);
    const { mtimeMs, size } = stat;
    const metadata = await sharp(filePath).metadata();

    // 缓存快速跳过
    const cached = cache[filePath];
    if (cached && cached.mtimeMs === mtimeMs && cached.size === size) {
      const ok = WIDTHS.every((w: number) => {
        const wc = cached.widths?.find((c: any) => c.width === w);
        if (!wc) return false;
        const needed = [];
        if (FORMATS.webp.enabled && !isWebp) needed.push('webp');
        if (FORMATS.avif.enabled) needed.push('avif');
        if (FORMATS.jxl.enabled) needed.push('jxl');
        if (FORMATS.original.enabled) needed.push('original');
        return needed.every((f: string) => wc.generated[f] && fileExists(getOutputPath(base, w, f, ext)));
      });
      if (ok) {
        console.log(`⏭️  跳过: ${path.basename(filePath)}`);
        return false;
      }
    }

    const hash = await fileHash(filePath);
    console.log(`🔄 处理: ${path.basename(filePath)} (${Math.round(size / 1024)}KB)`);

    const widthsData = [];
    let changed = false;

    for (const w of WIDTHS) {
      const gen: Record<string, boolean> = {};

      // WebP
      if (FORMATS.webp.enabled && !isWebp) {
        gen.webp = await generateSharpFormat(
          filePath, getOutputPath(base, w, 'webp'), w, 'webp',
          FORMATS.webp.quality, FORMATS.webp.effort
        );
      }

      // AVIF
      if (FORMATS.avif.enabled) {
        gen.avif = await generateSharpFormat(
          filePath, getOutputPath(base, w, 'avif'), w, 'avif',
          FORMATS.avif.quality, FORMATS.avif.effort
        );
      }

      // JXL（适配多宽度：先缩放为临时文件，再调用你的原始函数）
      if (FORMATS.jxl.enabled) {
        const tmpExt = isJpeg ? '.tmp.jpg' : '.tmp.png';
        const tmpFile = getOutputPath(base, w, 'jxl') + tmpExt;
        const jxlOut = getOutputPath(base, w, 'jxl');

        // 缩放并保存临时文件
        if (isJpeg) {
          await sharp(filePath)
            .resize(w, null, { withoutEnlargement: true })
            .jpeg({ quality: 100 })
            .toFile(tmpFile);
        } else {
          await sharp(filePath)
            .resize(w, null, { withoutEnlargement: true })
            .png()
            .toFile(tmpFile);
        }

        // 调用你原有的 generateJXLImage
        gen.jxl = await generateJXLImage(
          tmpFile,
          jxlOut,
          metadata,
          size,
          isJpeg, // 临时文件是 JPEG → true
        );

        // 清理临时文件
        try { await fs.unlink(tmpFile); } catch { /* ignore */ }
      }

      // 原始缩放版
      if (FORMATS.original.enabled) {
        const origFmt = isWebp ? 'png' : (isJpeg ? 'jpeg' : ext.slice(1));
        gen.original = await generateSharpFormat(
          filePath, getOutputPath(base, w, 'original', ext), w,
          origFmt as 'jpeg' | 'png', FORMATS.original.quality
        );
      }

      changed = changed || Object.values(gen).some(Boolean);
      widthsData.push({ width: w, generated: gen });
    }

    cache[filePath] = { hash, mtimeMs, size, widths: widthsData };
    return changed;
  } catch (e) {
    console.error(`❌ 处理失败 ${path.basename(filePath)}:`, (e as Error).message);
    return false;
  }
}

// ==================== 并发执行 ====================
async function runWithConcurrency(items: string[], handler: (item: string) => Promise<boolean>, limit: number) {
  const errors: string[] = [];
  let done = 0, skip = 0;
  const queue = [...items];
  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      try {
        (await handler(item)) ? done++ : skip++;
      } catch (e) { errors.push(`${e}`); }
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return { done, skip, errors };
}

// ==================== 缓存文件 ====================
async function loadCache() {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    return JSON.parse(await fs.readFile(CACHE_FILE, 'utf-8'));
  } catch { return {}; }
}
async function saveCache(cache: any) {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ==================== 主程序 ====================
(async () => {
  console.log('🖼️  图片格式转换工具');
  console.log(`📁 图片目录: ${PUBLIC_DIR}`);
  console.log(`📏 生成宽度: [${WIDTHS.join(', ')}]`);
  console.log(`⛔ 忽略目录: [${IGNORED_DIRS.join(', ')}]`);
  console.log(`⚡ 并发数:   ${CONCURRENCY}\n`);

  let cache = await loadCache();
  console.log(`📦 缓存条目: ${Object.keys(cache).length}`);

  const images = await findImages(PUBLIC_DIR);
  console.log(`🔍 找到图片: ${images.length}\n`);
  if (images.length === 0) return;

  const handler = (img: string) => processImage(img, cache);
  const { done, skip, errors } = await runWithConcurrency(images, handler, CONCURRENCY);

  await saveCache(cache);

  console.log('\n✅ 完成!');
  console.log(`   已处理: ${done}  跳过: ${skip}  错误: ${errors.length}`);
  if (errors.length > 0) console.log('   错误详情:', errors);
})();
