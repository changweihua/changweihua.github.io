import fs from 'fs-extra'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')
const source = join(projectRoot, 'node_modules/mathjax/es5')
const destination = join(projectRoot, 'public/mathjax/es5')

// 确保目录存在
await fs.ensureDir(destination)

// 复制文件
await fs.copy(source, destination)

console.log('MathJax copied to public directory')
