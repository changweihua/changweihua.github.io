import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { fileURLToPath } from 'url'

// 获取当前文件的目录名（替代 __dirname）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootFolder = process.cwd()

interface FileObject {
  [key: string]: string
}

interface ResultObject {
  [key: string]: FileObject
}

let filesList: string[] = [] // 文件路径列表
let jsFilesList: string[] = [] // JS/TS 文件路径列表

async function readFile(dir: string, filesList: string[] = []): Promise<string[]> {
  // console.log(
  //   chalk.blue(`[${new Date().toLocaleTimeString()}] 读取目录 ${dir}`),
  // );

  const stat = await fs.stat(dir)
  if (!stat.isDirectory()) {
    if (dir.endsWith('.vue')) {
      filesList.push(dir)
    } else if (dir.endsWith('.md')) {
      filesList.push(dir)
    } else if (/(.ts|.js)$/g.test(dir)) {
      jsFilesList.push(dir)
    }
  }
  return filesList
}

async function readFileList(dir: string, filesList: string[] = []): Promise<string[]> {
  // console.log(
  //   chalk.blue(`[${new Date().toLocaleTimeString()}] 读取文件 ${dir}`),
  // );

  const files = await fs.readdir(dir)

  for (const item of files) {
    const fullPath = path.join(dir, item)
    const stat = await fs.stat(fullPath)

    if (stat.isDirectory()) {
      await readFileList(path.join(dir, item), filesList) // 递归读取文件
    } else if (fullPath.endsWith('.vue')) {
      filesList.push(fullPath)
    } else if (fullPath.endsWith('.md')) {
      filesList.push(fullPath)
    } else if (/(.ts|.js)$/g.test(fullPath)) {
      jsFilesList.push(fullPath)
    }
  }

  return filesList
}

async function processDirectories(): Promise<void> {
  // 读取各个目录
  await readFileList(path.resolve(rootFolder, 'zh-CN'), filesList)
  await readFileList(path.resolve(rootFolder, 'zh-CN/blog'), filesList)
  await readFileList(path.resolve(rootFolder, 'zh-CN/category'), filesList)
  await readFileList(path.resolve(rootFolder, 'zh-CN/gallery'), filesList)
  await readFileList(path.resolve(rootFolder, 'en-US'), filesList)
  await readFileList(path.resolve(rootFolder, 'en-US/blog'), filesList)
  await readFileList(path.resolve(rootFolder, 'en-US/category'), filesList)
  await readFileList(path.resolve(rootFolder, 'en-US/gallery'), filesList)
  await readFileList(path.resolve(rootFolder, '.vitepress/components'), filesList)
  await readFileList(path.resolve(rootFolder, '.vitepress/src'), filesList)
  await readFileList(path.resolve(rootFolder, '.vitepress/theme'), filesList)
  await readFileList(path.resolve(rootFolder, '.vitepress/components'), filesList)
  await readFileList(path.resolve(rootFolder, '.vitepress/utils'), filesList)
  await readFile(path.resolve(rootFolder, 'index.md'), filesList)
  await readFile(path.resolve(rootFolder, 'CODE_OF_CONDUCT.md'), filesList)
  await readFile(path.resolve(rootFolder, 'CONTRIBUTING.md'), filesList)
  await readFile(path.resolve(rootFolder, '.vitepress/config.ts'), filesList)

  // 检查目录并处理
  const localDir = path.resolve(rootFolder, 'fonts-spider/temp/local')

  try {
    await fs.access(localDir)
    // 目录存在，直接处理
    await writeFile(filesList, 'index')
    await writeFile(jsFilesList, 'jsIndex')
  } catch (err) {
    // 目录不存在，创建后处理
    await fs.mkdir(localDir, { recursive: true })
    await writeFile(filesList, 'index')
    await writeFile(jsFilesList, 'jsIndex')
  }
}

async function writeFile(fileArr: string[], fileName: string): Promise<void> {
  const reg_1 =
    /(?<!\/\/\s*.*|<!--\s.*)([\u2E80-\u9FFF]*\$?{{0,2}\w*\.*\w*}{0,2}[\u2E80-\u9FFF]+)*/g

  const obj: ResultObject = {}

  for (const cur of fileArr) {
    const fileSuffix = cur.match(/(.ts|.js|.vue|.md)$/g)?.[0] || ''
    let pathName = path.basename(cur, fileSuffix)

    // 如果文件名是 index，取父级文件名
    if (pathName === 'index') {
      const pathArr = cur.split(path.sep)
      pathName = pathArr[pathArr.length - 2]
    }

    obj[pathName] = {}
    const pkg = await fs.readFile(cur, 'utf-8')
    const strArr = pkg.match(reg_1)

    if (strArr?.length) {
      for (const item of strArr) {
        if (!item) continue

        let processedItem = item
        if (item.includes('{')) {
          let index = 0
          processedItem = item.replace(/\$?{{0,2}\w*\.*\w*}{0,2}/g, (val) => {
            if (val) {
              index++
              return `{${index - 1}}`
            }
            return ''
          })
        }

        // 如果匹配的字符串的字数大于10，处理 key 值
        if (processedItem.length) {
          const str =
            processedItem.length >= 10 ? `${processedItem.substring(0, 7)}...` : processedItem
          obj[pathName][str] = processedItem
        }
      }
    }
  }

  // 创建 JSON 文件
  const outputPath = path.resolve(rootFolder, `fonts-spider/temp/local/${fileName}.json`)
  await fs.writeFile(outputPath, JSON.stringify(obj), 'utf8')

  console.log(chalk.green.bold('✅ 成功提取系统全部文字'))
}

async function processTemplate(): Promise<void> {
  console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] 📦 填充字符到 index.html...`))

  try {
    const templatePath = path.join(rootFolder, 'fonts-spider/index.template.html')
    const templateContent = await fs.readFile(templatePath, 'utf8')

    const content1 = await fs.readFile(
      path.join(rootFolder, 'fonts-spider/temp/local/index.json'),
      'utf8'
    )

    let result = templateContent.replace(/__CONTENT1__/g, content1)

    const content2 = await fs.readFile(
      path.join(rootFolder, 'fonts-spider/temp/local/jsIndex.json'),
      'utf8'
    )

    result = result.replace(/__CONTENT2__/g, content2)

    const outputPath = path.join(rootFolder, 'fonts-spider/index.html')
    await fs.writeFile(outputPath, result, 'utf8')

    console.log('File has been saved!')
    console.log(chalk.green.bold('✅ 成功填充: '))
  } catch (err) {
    console.log(chalk.red.bold('❌ 填充失败:', err))
    throw err
  }
}

// 主执行函数
async function main(): Promise<void> {
  try {
    const spinner = ora('提取文字')
    spinner.start()

    // 记录整个构建过程的开始时间
    const totalStartTime = Date.now()
    console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] 🚀 开始文字提取流程...`))

    await processDirectories()
    await processTemplate()

    // 计算总耗时（秒）
    const totalEndTime = Date.now()
    const totalSeconds = (totalEndTime - totalStartTime) / 1000

    spinner.stop()

    console.log(chalk.green.bold(`✅  所有操作完成！ 耗时: ${totalSeconds.toFixed(2)} 秒`))

    // 格式化总耗时为易读格式
    let totalTimeText
    if (totalSeconds < 60) {
      // 小于1分钟，直接显示秒
      totalTimeText = `${totalSeconds.toFixed(2)} 秒`
    } else {
      // 大于等于1分钟，显示分和秒
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      totalTimeText = `${minutes} 分 ${seconds.toFixed(2)} 秒`
    }

    // 输出详细时间报告
    console.log(chalk.magenta.bold('\n==================== 构建报告 ===================='))
    // console.log(chalk.magenta(`🔧 版本号更新: ${versionLine}`));
    // console.log(chalk.magenta(`🧹 清理耗时: ${cleanDuration.toFixed(2)} 秒`));
    // console.log(chalk.magenta(`📦 Rspack 构建耗时: ${rspackDuration.toFixed(2)} 秒`));

    console.log(chalk.magenta.bold(`🏁 总耗时: ${totalTimeText}`))
    console.log(chalk.magenta(`⏰  开始时间: ${new Date(totalStartTime).toLocaleTimeString()}`))
    console.log(chalk.magenta(`⏱️ 结束时间: ${new Date(totalEndTime).toLocaleTimeString()}`))
    console.log(chalk.magenta.bold('================================================\n'))
  } catch (error) {
    console.error(chalk.red('❌ 提取失败:'), error)
    process.exit(1)
  }
}

// 执行主函数
main()
