// markdown-it-picture.ts
import type MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { parseDocument } from 'htmlparser2';
import { findAll, isTag, getOuterHTML } from 'domutils';
import type { Element } from 'domhandler';
import Token from 'markdown-it/lib/token.mjs';

// --------------------- 配置类型 ---------------------
export interface PicturePluginOptions {
  /** public 目录的绝对路径 */
  publicDir?: string;
  /** 生成的现代格式列表（按优先级排序） */
  formats?: ('avif' | 'webp' | 'jxl')[];
  /** 生成的宽度列表（必须与转换脚本一致） */
  widths?: number[];
  /** 默认的 sizes 属性，图片占满容器时通常为 100vw */
  defaultSizes?: string;
  /** CSS 类名 */
  figureClass?: string;
  pictureClass?: string;
  imgClass?: string;
  figcaptionClass?: string;
  /** 图片加载行为 */
  lazyLoading?: boolean;
  decoding?: 'async' | 'sync' | 'auto';
  /** 调试日志 */
  debug?: boolean;
}

type ResolvedOptions = Required<PicturePluginOptions>;

// --------------------- 默认值 ---------------------
const DEFAULT_OPTS: ResolvedOptions = {
  publicDir: path.join(process.cwd(), 'public'),
  formats: ['avif', 'webp', 'jxl'],
  widths: [400, 800, 1200, 1600],
  defaultSizes: '100vw',
  figureClass: 'vp-image',
  pictureClass: 'vp-picture',
  imgClass: 'vp-img',
  figcaptionClass: 'vp-figcaption',
  lazyLoading: true,
  decoding: 'async',
  debug: false,
};

// --------------------- 工具函数 ---------------------
const fileExists = (() => {
  const cache = new Map<string, boolean>();
  return (p: string): boolean => {
    if (cache.has(p)) return cache.get(p)!;
    const ok = fs.existsSync(p);
    cache.set(p, ok);
    return ok;
  };
})();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toWebPath(fsPath: string, publicDir: string): string {
  const rel = path.relative(publicDir, fsPath).replace(/\\/g, '/');
  if (rel.startsWith('..') || path.isAbsolute(rel)) return fsPath;
  return '/' + rel;
}

function buildSrcset(
  fsBase: string,
  widths: number[],
  formatExt: string,
  publicDir: string
): string | null {
  const parts: string[] = [];
  for (const w of widths) {
    const filePath = `${fsBase}-${w}w.${formatExt}`;
    if (fileExists(filePath)) {
      const webPath = toWebPath(filePath, publicDir);
      parts.push(`${webPath} ${w}w`);
    }
  }
  return parts.length > 0 ? parts.join(', ') : null;
}

function getOriginalExt(fsPath: string): string {
  const ext = path.extname(fsPath).toLowerCase();
  return ext.replace('.', '');
}

// --------------------- HTML 片段生成 ---------------------
function buildPicture(
  webSrc: string,
  alt: string,
  title: string | undefined,
  sizes: string,
  opts: ResolvedOptions
): string {
  const fsPath = path.join(opts.publicDir, webSrc.replace(/^\//, ''));
  const baseName = fsPath.replace(/\.[^.]+$/, '');

  // 现代格式 <source> 列表
  const sources: string[] = [];
  const formatMap: { fmt: string; type: string }[] = [];
  if (opts.formats.includes('avif')) formatMap.push({ fmt: 'avif', type: 'image/avif' });
  if (opts.formats.includes('webp')) formatMap.push({ fmt: 'webp', type: 'image/webp' });
  if (opts.formats.includes('jxl')) formatMap.push({ fmt: 'jxl', type: 'image/jxl' });

  for (const { fmt, type } of formatMap) {
    const srcset = buildSrcset(baseName, opts.widths, fmt, opts.publicDir);
    if (srcset) {
      sources.push(`<source srcset="${srcset}" sizes="${escapeHtml(sizes)}" type="${type}">`);
    }
  }

  // <img> 标签
  const imgAttrs: string[] = [
    `src="${escapeHtml(webSrc)}"`,
    `alt="${escapeHtml(alt)}"`,
  ];

  const originalSrcset = buildSrcset(baseName, opts.widths, getOriginalExt(fsPath), opts.publicDir);
  if (originalSrcset) {
    imgAttrs.push(`srcset="${originalSrcset}"`);
    imgAttrs.push(`sizes="${escapeHtml(sizes)}"`);
  }

  if (opts.imgClass) imgAttrs.push(`class="${escapeHtml(opts.imgClass)}"`);
  if (opts.lazyLoading) imgAttrs.push(`loading="lazy"`);
  if (opts.decoding !== 'auto') imgAttrs.push(`decoding="${opts.decoding}"`);

  const imgTag = `<img ${imgAttrs.join(' ')}>`;

  let content: string;
  if (sources.length > 0) {
    content = `<picture class="${opts.pictureClass}">\n  ${sources.join('\n  ')}\n  ${imgTag}\n</picture>`;
  } else {
    content = imgTag;
  }

  if (title) {
    content =
      `<figure class="${opts.figureClass}" role="figure" aria-label="${escapeHtml(title)}">\n  ` +
      content +
      `\n  <figcaption class="${opts.figcaptionClass}">${escapeHtml(title)}</figcaption>\n</figure>`;
  }

  return content;
}

// --------------------- htmlparser2 后处理 ---------------------
function transformHtml(imgHtml: string, opts: ResolvedOptions, env: any): string {
  // 解析整个 HTML 文档
  const doc = parseDocument(imgHtml, { decodeEntities: false, lowerCaseAttributeNames: false });

  // 查找所有 <img> 元素
  const images = findAll(
    (n): n is Element => isTag(n) && n.tagName === 'img',
    doc
  );

  for (const imgNode of images) {
    const src = imgNode.attribs.src;
    if (!src || /^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;

    const alt = imgNode.attribs.alt || '';
    const title = imgNode.attribs.title || undefined;
    const sizes = imgNode.attribs.sizes || opts.defaultSizes;

    let webSrc = src;
    if (!webSrc.startsWith('/')) {
      const mdDir = env.filePath ? path.dirname(env.filePath) : process.cwd();
      webSrc = toWebPath(path.resolve(mdDir, src), opts.publicDir);
    }

    // 生成替换的 HTML
    const replacementHtml = buildPicture(webSrc, alt, title, sizes, opts);
    const replacementNodes = parseDocument(replacementHtml, { decodeEntities: false }).children;

    // 在 DOM 中替换
    const parent = imgNode.parent;
    if (parent) {
      const idx = parent.children.indexOf(imgNode);
      if (idx !== -1) parent.children.splice(idx, 1, ...replacementNodes);
    }
  }

  // 序列化为 HTML 字符串
  let result = getOuterHTML(doc, { decodeEntities: false });

  // 清理 Markdown 可能产生的无效嵌套 <p><picture>...</picture></p>
  result = result
    .replace(/<p>\s*(<(?:figure|picture)\b)/gi, '$1')
    .replace(/(<\/(?:figure|picture)>)\s*<\/p>/gi, '$1')
    .replace(/<p[^>]*>\s*<\/p>/g, '');

  return result;
}

// --------------------- Markdown-it 插件 ---------------------
export default function picturePlugin(
  md: MarkdownIt,
  userOpts?: Partial<PicturePluginOptions>
) {
  const opts: ResolvedOptions = { ...DEFAULT_OPTS, ...userOpts };

  // 1. 覆盖 Markdown 图片渲染（来自 ![alt](src)）
  const defaultImageRender = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens: Token[], idx: number, _options, env, self) => {
    const token = tokens[idx];
    const attrs: Record<string, string> = {};
    if (token.attrs) {
      for (const [k, v] of token.attrs) attrs[k] = v;
    }

    const src = attrs.src;
    if (!src || /^(https?:)?\/\//.test(src) || src.startsWith('data:')) {
      return defaultImageRender(tokens, idx, _options, env, self);
    }

    const alt = attrs.alt || token.content || '';
    const title = attrs.title || undefined;
    const sizes = attrs.sizes || opts.defaultSizes;

    let webSrc = src;
    if (!webSrc.startsWith('/')) {
      const mdDir = env.filePath ? path.dirname(env.filePath) : process.cwd();
      webSrc = toWebPath(path.resolve(mdDir, src), opts.publicDir);
    }

    return buildPicture(webSrc, alt, title, sizes, opts);
  };

  // 2. 后处理 HTML 块中的 <img>（例如容器内）
  const originalRender = md.render.bind(md);
  md.render = function (src: string, env: any = {}) {
    const rawHtml = originalRender(src, env);
    return transformHtml(rawHtml, opts, env);
  };
}
