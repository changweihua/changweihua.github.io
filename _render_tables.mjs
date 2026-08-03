import { createMarkdownRenderer } from 'vitepress'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { glob } from 'glob'

globalThis.__dirname = fileURLToPath(new URL('.', import.meta.url))

const configSrc = join(process.cwd(), '.vitepress/src/markdown.ts')
const mdConfig = (await import(pathToFileURL(configSrc).href)).default

const md = await createMarkdownRenderer(
  process.cwd(),
  mdConfig,
  '/',
  { theme: {} }
)

// 找出所有含表格的 md 文件（表格定义行 | xxx |）
const allFiles = glob.sync('**/*.md', {
  ignore: ['node_modules/**', '.vitepress/**', 'public/**', 'fonts/**', '.github/**', 'dist/**', 'fonts-spider/**']
})

const tableFiles = allFiles.filter(f => {
  const src = readFileSync(f, 'utf-8')
  return /^\|.*\|.*\|/m.test(src)
})

console.log('含表格文件数:', tableFiles.length)

const failed = []
for (const f of tableFiles) {
  const src = readFileSync(f, 'utf-8')
  try {
    await md.render(src, { relativePath: f })
  } catch (e) {
    failed.push({ file: f, error: e.message })
  }
}

console.log('渲染失败:', failed.length)
failed.forEach(f => console.log('  ❌', f.file, '→', f.error))
