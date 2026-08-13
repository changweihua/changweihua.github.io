---
lastUpdated: true
commentabled: true
recommended: true
title: 别只拿 Playwright 写测试
description: 这三个野路子用法才是真香
date: 2026-06-24 11:35:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

你有没有碰到过这种情况：线上页面偶尔渲染崩了，全靠用户截图报 bug 才发现；想抓点数据，对方网站反爬严得像防贼；后台有个批量操作，要一条条手动点，点完手都麻了。

这些问题，一个 Playwright 全都能搞定。它被贴了"E2E 测试框架"的标签，但实际上能干的事远比测试多。

今天就聊聊 Playwright 的三种"非主流"打开方式，每个都有完整可跑的代码。后半段也会聊它的短板：什么场景不该用 Playwright，免得你选错工具白费功夫。

## 场景一：线上页面巡检机器人

线上页面出问题，很多时候不是后端挂了，是 CSS 炸了、字体没加载、某个第三方脚本把 DOM 搞乱了。这类问题接口监控根本发现不了，等用户投诉才知道。

Playwright 可以定时打开页面截图，跟基准图做像素级对比，差异超过阈值就发告警。

_先装依赖_：

```bash
npm i playwright pixelmatch pngjs
```

_核心逻辑_：

```typescript
import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'

const BASELINE_DIR = './screenshots/baseline'
const DIFF_DIR = './screenshots/diff'
const THRESHOLD = 0.03 // 3% 像素差异就告警

interface CheckResult {
  passed: boolean
  diffPercent: number
  diffImagePath: string
}

async function captureScreenshot(url: string, name: string): Promise<Buffer> {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // 等网络空闲，确保异步内容也加载完
  await page.goto(url, { waitUntil: 'networkidle' })
  // 额外等 2 秒，让动画跑完
  await page.waitForTimeout(2000)

  const screenshot = await page.screenshot({ fullPage: false })
  await browser.close()
  return screenshot
}

function compareScreenshots(current: Buffer, name: string): CheckResult {
  const currentPng = PNG.sync.read(current)
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`)
  const diffPath = path.join(DIFF_DIR, `${name}.png`)

  if (!fs.existsSync(baselinePath)) {
    // 首次运行，存为基准图
    fs.writeFileSync(baselinePath, current)
    console.log(`[${name}] 基准图已建立`)
    return { passed: true, diffPercent: 0, diffImagePath: '' }
  }

  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath))
  const { width, height } = currentPng
  const diff = new PNG({ width, height })

  const diffPixels = pixelmatch(baselinePng.data, currentPng.data, diff.data, width, height, { threshold: 0.1 })

  const diffPercent = diffPixels / (width * height)

  if (diffPercent > THRESHOLD) {
    fs.mkdirSync(DIFF_DIR, { recursive: true })
    fs.writeFileSync(diffPath, PNG.sync.write(diff))
    return { passed: false, diffPercent, diffImagePath: diffPath }
  }

  return { passed: true, diffPercent, diffImagePath: '' }
}

async function patrol(pages: Array<{ url: string; name: string }>) {
  for (const { url, name } of pages) {
    const screenshot = await captureScreenshot(url, name)
    const result = compareScreenshots(screenshot, name)

    if (!result.passed) {
      sendAlert({
        page: name,
        diffPercent: (result.diffPercent * 100).toFixed(2),
        diffImage: result.diffImagePath
      })
      // 出问题时自动保留现场截图
      fs.writeFileSync(path.join(DIFF_DIR, `${name}_current.png`), screenshot)
    }
  }
}

function sendAlert(data: Record<string, string>) {
  // 换成你自己的通知方式：飞书、钉钉、企微 webhook
  console.log(`⚠️ 页面异常告警:`, JSON.stringify(data, null, 2))
}
```

挂到 `cron` 或 `GitHub Actions` 上就能跑了。巡检页面列表放配置文件里，页面一多，收益就出来了：你会比用户先知道页面挂了。

## 场景二：绕过反爬的智能爬虫

很多网站的反爬检测的是 HTTP 请求特征（header、TLS 指纹、JS 执行环境）。但 Playwright 驱的是真浏览器，所有特征跟真人一模一样。

更关键的是，Playwright 可以拦截网络请求，直接在浏览器层面把 API 响应捞出来——不需要解析 HTML，数据就是结构化的 JSON。

```typescript
import { chromium } from 'playwright'
import fs from 'fs'

interface ApiCache {
  [urlPattern: string]: any[]
}

async function smartCrawl(targetUrl: string, apiPatterns: string[], outputFile: string) {
  const browser = await chromium.launch({ headless: false }) // 有些网站会检测 headless
  const context = await browser.newContext({
    // 反反爬三板斧
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'zh-CN'
  })

  const page = await context.newPage()
  const captured: ApiCache = {}

  // 核心操作：拦截匹配的 API 响应，直接拿数据
  for (const pattern of apiPatterns) {
    await page.route(`**${pattern}**`, async (route) => {
      const response = await page.context().request.fetch(route.request())
      const body = await response.json()

      if (!captured[pattern]) captured[pattern] = []
      captured[pattern].push(body)

      await route.fulfill({ response })
    })
  }

  // 如果目标网站需要登录，加载已保存的 session
  if (fs.existsSync('./session.json')) {
    const session = JSON.parse(fs.readFileSync('./session.json', 'utf-8'))
    await context.addCookies(session.cookies)
  }

  await page.goto(targetUrl, { waitUntil: 'networkidle' })

  // 模拟真人滚动，触发懒加载 + 翻页
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 800))
    await page.waitForTimeout(1000 + Math.random() * 500)
  }

  // 保存 session 供下次复用，免重复登录
  const cookies = await context.cookies()
  fs.writeFileSync('./session.json', JSON.stringify({ cookies }, null, 2))

  fs.writeFileSync(outputFile, JSON.stringify(captured, null, 2))
  console.log(`抓到 ${Object.values(captured).flat().length} 条数据，已写入 ${outputFile}`)

  await browser.close()
}

// 用法示例
smartCrawl('https://example.com/data-list', ['/api/list', '/api/detail'], './data.json')
```

这套打法的核心思路：不做 HTML 解析，直接在浏览器里截胡 API 响应。拿到的是后端渲染用的结构化数据，比解析 DOM 稳定十倍。驱的是真浏览器，大部分反爬策略拿你没办法。

当然，这里得说句实话：遇到 Cloudflare Turnstile、DataDome 这种专业反爬服务，光靠改 UA 和 viewport 还不够。它们会检测 WebDriver 标记、`navigator.webdriver` 属性、甚至鼠标轨迹。这种级别需要配合 `playwright-extra` 和 `puppeteer-extra-plugin-stealth` 这类补丁插件，成功率会高很多，但也没法保证 100%。

## 场景三：批量自动化操作

有些后台系统，明明有几十条数据要导出、审核，就是不提供批量按钮。手动点一遍，点错一条还得重来。

Playwright 模拟完整用户流程，登录、导航、表单操作、确认弹窗，全自动跑完。

```typescript
import { chromium } from 'playwright'

interface Task {
  id: string
  field: string
  value: string
}

async function batchOperation(loginUrl: string, taskListUrl: string, tasks: Task[]) {
  const browser = await chromium.launch({ headless: false }) // headless: false 方便调试
  const page = await browser.newPage()

  // 第一步：登录
  await page.goto(loginUrl)
  await page.fill('input[name="username"]', process.env.ADMIN_USER!)
  await page.fill('input[name="password"]', process.env.ADMIN_PASS!)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')

  // 第二步：逐个处理任务
  for (const task of tasks) {
    console.log(`处理中: ${task.id}`)

    await page.goto(taskListUrl)
    // 定位到目标行（假设每行有个 data-id 属性）
    const row = page.locator(`tr[data-id="${task.id}"]`)

    // 点编辑
    await row.locator('.btn-edit').click()
    await page.waitForSelector('.modal-edit')

    // 填表单
    await page.fill(`input[name="${task.field}"]`, task.value)
    await page.click('.btn-save')

    // 处理确认弹窗
    page.once('dialog', (dialog) => dialog.accept())

    // 等保存完成再进下一个
    await page.waitForSelector('.toast-success')
    console.log(`✅ ${task.id} 处理完成`)
  }

  await browser.close()
  console.log(`全部 ${tasks.length} 条处理完毕`)
}
```

这里有三个容易被忽视的细节：

- `headless: false` 调试阶段别开无头模式，你能看到浏览器实际在干嘛，出错了能及时发现。
- `page.once("dialog")` 要在弹窗弹出前注册。`page.on` 会一直监听，用 `page.once` 避免后续任务被上一个监听器干扰。
- 敏感信息走环境变量，别把账号密码写死在代码里。你永远不知道什么时候会把代码推到公仓。

## 什么时候不该用 Playwright

上面吹了这么多，但 Playwright 不是万能药。下面这些场景，硬上 Playwright 属于杀鸡用牛刀，费资源还不讨好。

### 纯 HTTP API 调用

如果你要爬的数据是后端直接返回的 JSON，页面本身没有 JS 渲染内容，那根本不需要浏览器。一个 fetch 或者 axios 搞定，几行代码，毫秒级响应。

```typescript
// 这样就够了，不需要 Playwright
const res = await fetch('https://api.example.com/list?page=1')
const data = await res.json()
```

Playwright 启动一次浏览器要 1-3 秒，吃 200-500MB 内存。用在这类场景上，相当于每次拿快递都开辆卡车去。

### 高并发大规模采集

Playwright 一个浏览器实例占的内存，够跑几百个 HTTP 请求的并发。如果你需要采集成千上万个页面，用 Playwright 一台机器根本扛不住。

_这种量级更适合_：

- 静态页面 → `cheerio` + `axios`，几十行代码，内存占用不到 50MB
- 需要 JS 渲染但量很大 → 先用 `fetch` 拿 HTML，只在必要时才起 Playwright 渲染
- 真需要大规模浏览器渲染 → 上 Playwright 的 `browserless` 集群方案，但运维成本和机器成本都不低

一句话：量小随便玩，量大先想清楚值不值得开浏览器。

### 移动端原生 App 自动化

Playwright 能测移动端 Web 页面（模拟 viewport、touch 事件），但它管不了原生 App。如果你的场景是 iOS / Android App 的自动化操作或测试，该用 Appium 或 Maestro 的地方，别拿 Playwright 硬套。

### 对速度有极致要求的场景

浏览器启动本身就慢。哪怕复用 context 和 page，首次 `launch` 的 1-3 秒是跑不掉的。如果你的脚本要求毫秒级响应，比如 HTTP 接口的冒烟测试、实时数据校验，直接用 `fetch` 或者 `supertest` 这类轻量方案。

一个简单的判断标准：

| 场景                        | 推荐工具                                             |
| --------------------------- | ---------------------------------------------------- |
| 纯 API 调用、静态 HTML 解析 | `fetch / axios + cheerio`                            |
| 需要 JS 渲染，但量不大      | `Playwright`                                         |
| 需要 JS 渲染，量很大        | `Playwright + browserless 集群，或者先试 fetch 兜底` |
| 移动端原生 App              | `Appium / Maestro`                                   |
| 接口冒烟测试                | `supertest / vitest`                                 |
| 页面交互自动化、E2E 测试    | `Playwright`                                         |

## 小结

Playwright 是个浏览器自动化工具，测试只是其中一个应用场景。换个思路，巡检、爬虫、批处理这些日常痛点都能用同一条技术栈解决。
但反过来，不是所有自动化都要上浏览器。先想清楚你要操作的到底是一个"页面"还是一个"接口"，再决定要不要启动那个几百兆内存的 Chromium 进程。选对工具，比用对工具更重要。

上面三个场景的完整代码在 GitHub 可以找到：[https://github.com/microsoft/playwright](https://github.com/microsoft/playwright)

你的项目里有没有那种"一直想自动化但不知道该不该用 Playwright"的场景？留言聊聊，一起判断到底该不该上浏览器。

_相关资源_：

- Playwright 官方文档：[ https://playwright.dev ](https://playwright.dev)
- pixelmatch 像素对比：[ https://github.com/mapbox/pixelmatch ](https://github.com/mapbox/pixelmatch)
- playwright-extra（反检测插件）：[ https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra ](https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra)
- cheerio（轻量 HTML 解析）：[ https://cheerio.js.org ](https://cheerio.js.org)
- Appium（移动端原生 App 自动化）：[ https://appium.io](https://appium.io)
