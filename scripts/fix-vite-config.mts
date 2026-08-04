import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

// ===== 只包含警告中明确列出的替换 =====
const rules: { file: string; from: string; to: string }[] = [
  {
    file: '.vitepress/src/configs/index.ts',
    from: 'import "./zh-CN.config"',
    to: 'import "./zh-CN.config.ts"'
  },
  {
    file: '.vitepress/src/configs/index.ts',
    from: 'import "./en-US.config"',
    to: 'import "./en-US.config.ts"'
  },
  {
    file: '.vitepress/src/sidebars/index.ts',
    from: 'import "./zh-CN.sidebar"',
    to: 'import "./zh-CN.sidebar.ts"'
  },
  {
    file: '.vitepress/src/sidebars/index.ts',
    from: 'import "./en-US.sidebar"',
    to: 'import "./en-US.sidebar.ts"'
  },
  {
    file: '.vitepress/src/navs/index.ts',
    from: 'import "./zh-CN.nav"',
    to: 'import "./zh-CN.nav.ts"'
  },
  {
    file: '.vitepress/src/navs/index.ts',
    from: 'import "./en-US.nav"',
    to: 'import "./en-US.nav.ts"'
  },
  {
    file: '.vitepress/src/footers/index.ts',
    from: 'import "./zh-CN.footer"',
    to: 'import "./zh-CN.footer.ts"'
  },
  {
    file: '.vitepress/src/footers/index.ts',
    from: 'import "./en-US.footer"',
    to: 'import "./en-US.footer.ts"'
  },
  {
    file: '.vitepress/src/markdown.ts',
    from: `import glossary from './glossary.json'`,
    to: `import glossary from './glossary.json' with { type: 'json' }`
  },
  {
    file: '.vitepress/src/navs/zh-CN.nav.ts',
    from: `import pkg from '../../../package.json'`,
    to: `import pkg from '../../../package.json' with { type: 'json' }`
  }
]

// ===== 执行 =====
let count = 0
for (const { file, from, to } of rules) {
  const fullPath = resolve(rootDir, file)
  if (!existsSync(fullPath)) {
    console.warn(`⚠️  文件不存在: ${file}`)
    continue
  }
  const content = readFileSync(fullPath, 'utf-8')
  if (content.includes(from)) {
    const newContent = content.replace(from, to)
    writeFileSync(fullPath, newContent, 'utf-8')
    console.log(`✅ 修改: ${file}`)
    count++
  } else {
    console.log(`⏭️  跳过 (已修复): ${file}`)
  }
}

console.log(`\n🎉 完成，共修改 ${count} 个文件。`)
console.log('💡 清除缓存并重启: rm -rf .vitepress/cache node_modules/.vite && npm run dev')
