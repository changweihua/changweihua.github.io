---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 Node.js + Playwright 构建 24 小时全自动测试
description: 告别机械重复
date: 2026-08-12 09:45:00
pageClass: blog-page-class
cover: /covers/nodejs.svg
---

## 技术选型：为何前端是自动化的最佳入口？ ##

相比于传统的 Python（Selenium/Pyppeteer），前端社区的自动化生态在处理现代 Web 交互时展现出降维打击的优势：

- Playwright：目前最前沿的自动化测试框架，天然支持 TypeScript/ESM，拥有极强的网络拦截能力，并能完美处理 Shadow DOM，模拟真人操作如丝般顺滑。
- 持久化上下文（Persistent Context） ：这是自动化脚本的“灵魂”，能够保存 Session 与 Cookie，让我们得以绕过人机验证的重灾区。

## 核心实现：两步调通自动化脚本 ##

为了规避自动化行为触发 Google 的高强度人机检测，我采取了 “先手动登录存凭证，后全自动运行” 的策略。

### 第一步：创建专用浏览器配置文件 (`login.js`) ###

该脚本负责创建一个带有本地持久化存储的浏览器环境。你只需手动操作一次登录，后续脚本便能“记住”你的登录状态。只需执行一次

```js
import { chromium } from 'playwright';
import path from 'path';

const userDataDir = path.resolve('./browser_profile');

async function startLoginWindow() {
    console.log('正在为你打开专用的【登录配置浏览器】...');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 800 },
        args: ['--disable-blink-features=AutomationControlled']
    });

    const page = await context.newPage();

    // 依次打开两个网站的标签页
    await page.goto('https://google.com');
    const page2 = await context.newPage();
    await page2.goto('https://zan.top');

    console.log('\n==================================================');
    console.log('👉 请在弹出的浏览器中完成以下操作：');
    console.log('1. 在第一个标签页登录你的 Google 账号，并完成一次领水');
    console.log('2. 在第二个标签页登录你的 ZAN 账号，并完成一次领水');
    console.log('⚠️ 注意：完成登录和领水后，直接把这个命令行的【终端关闭】或【按 Ctrl+C】即可！');
    console.log('==================================================\n');
}

startLoginWindow();
```

### 第二步：核心定时自动化脚本 (`faucet-agent.js`) ###

利用 `node-schedule` 设定每天固定时间（例如早上 9:00）自动触发。脚本会自动识别动态变化的 Angular Material 标签组件，完成精准输入与点击。

```js
import { chromium } from 'playwright';
import schedule from 'node-schedule';
import path from 'path';

// 配置你的钱包地址
const WALLET_ADDRESS = '0xYourActualWalletAddressHere';

// 关键：指定一个本地文件夹用来存放浏览器的登录状态（Cookies、LocalStorage等）
// 这样你手动登录一次 Google 和 ZAN 之后，脚本以后运行时就是登录状态
const userDataDir = path.resolve('./browser_profile');

async function claimTokens() {
    console.log(`[${new Date().toLocaleString()}] 启动 Faucet 自动化 Agent...`);

    // 启动带“记忆”的浏览器（为了调试，headless 设为 false 展现界面）
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 800 },
        args: ['--disable-blink-features=AutomationControlled'] // 移除自动化特征，防爬
    });

    const page = await context.newPage();

    try {
        // ==========================================
        // 任务一：Google Cloud Faucet
        // ==========================================
        console.log('正在访问 Google Cloud Faucet...');
        await page.goto('https://cloud.google.com/application/web3/faucet/ethereum/sepolia', { waitUntil: 'networkidle', timeout: 60000 });

        // 检查是否需要登录（如果没登录，脚本暂停并提示你）
        if (await page.getByText('Sign in', { exact: false }).isVisible()) {
            console.log('⚠️ 检查到 Google 账号未登录，请在弹出的浏览器中手动登录！');
            await page.waitForTimeout(30000); // 留出30秒给你手动操作
        }

        // 输入钱包地址（Google Cloud 使用标准的 input 框或带有特定 placeholder 的元素）
        // 提示：大模型 Agent 此时可以通过文本匹配精准定位
        // const googleInput = page.locator('input[type="text"], input[placeholder*="address"]');
         const googleInput = page.locator('input[id*="mat-input-"]').first();
        await googleInput.waitFor({ state: 'visible', timeout: 10000 });
        await googleInput.fill(WALLET_ADDRESS);

        // 点击领取按钮（通常带有 "Get" 或 "Receive" 文本）
        const googleSubmitBtn = page.locator('button:has-text(" Get 0.05 Sepolia ETH "), button:has-text("Receive")').first();
        await googleSubmitBtn.click();
        console.log('✅ Google Cloud 领水请求已提交，等待5秒...');
        await page.waitForTimeout(5000);

        // ==========================================
        // 任务二：ZAN Faucet
        // ==========================================
        console.log('正在访问 ZAN Faucet...');
        await page.goto('https://zan.top/faucet', { waitUntil: 'networkidle', timeout: 60000 });

        if (await page.getByText('Login', { exact: false }).isVisible()) {
            console.log('⚠️ 检查到 ZAN 账号未登录，请在弹出的浏览器中手动登录！');
            await page.waitForTimeout(30000);
        }

        // ZAN 页面可能需要先选中 Sepolia 网络
        const sepoliaTab = page.locator('text=Sepolia').first();
        if (await sepoliaTab.isVisible()) {
            await sepoliaTab.click();
        }

        // 输入钱包地址并点击
        const zanInput = page.locator('input[id*="address"]').first();
        await zanInput.waitFor({ state: 'visible', timeout: 10000 });
        await zanInput.fill(WALLET_ADDRESS);

        // ZAN 的提交按钮通常叫 "Claim" 或 "Submit"
        const zanSubmitBtn = page.locator('button:has-text("Claim"), button:has-text("Submit")').first();
        await zanSubmitBtn.click();
        console.log('✅ ZAN Faucet 领水请求已提交。');

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ 自动化执行中发生错误:', error);
    } finally {
        await context.close();
        console.log('浏览器上下文已关闭，本次任务结束。');
    }
}

// ==========================================
// 自动化定时触发逻辑
// ==========================================
// 设定每天早上 9:00:00 自动执行（因为水龙头通常每24小时只能领一次）
const cronRule = '0 0 9 * * *';
schedule.scheduleJob(cronRule, () => {
    claimTokens();
});

console.log('🚀 Faucet 定时脚本已启动，将在每日 09:00 自动运行...');

// 首次部署本地调试时，可以直接取消注释下一行立即跑一次：
// claimTokens();
```

## 避坑指南：给开发者的进阶技巧 ##

在构建自动化 Agent 时，我总结了几项关键的抗检测与稳定性技巧：

- Stealth 防爬对抗：许多网站会检测 `navigator.webdriver`。通过添加参数 `--disable-blink-features=AutomationControlled`，可以抹去自动化工具的“指纹”。
- 动态组件选择策略：现代 Web 框架（Angular/React）生成的 ID 往往包含随机数（如 `mat-input-1234`）。永远不要使用死板的 ID 选择器，应优先使用 CSS 正则匹配（如 `input[id*="mat-input-"]`）或 语义化选择器（如 `button:has-text("Claim")`）。
- 从“自动化”到“智能体” ：目前的逻辑是基于预设选择器的，若网页结构变动，脚本会失效。进阶方案是接入大模型的 Vision（视觉能力） ：当 catch 到元素找不到的错误时，将屏幕截图发给 AI，由 AI 分析并吐出新的 CSS 选择器，真正实现“自我修复”。

## 结语 ##

通过这个轻量级脚本，我将原本每天 5 分钟的重复劳动，转化为了电脑后台的自动化生产力。这不仅是一个节省时间的工具，更是我们作为前端开发者，在 Web3 生态中利用技术掌控效率的缩影。
