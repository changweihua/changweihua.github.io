---
lastUpdated: true
commentabled: true
recommended: true
title: Rspack 实战，构建流程升级
description: 自动版本管理 + 命令行美化 + dist 压缩，一键输出生产包
date: 2026-01-19 11:00:00
pageClass: blog-page-class
cover: /covers/rspack.svg
---

在前端项目的生产构建中，我们常需要手动做三件事：更新版本号、查看构建耗时、压缩 dist 包 —— 这些重复操作不仅效率低，还容易出错（比如忘记更新版本导致线上版本混乱）。

本文就带你基于 Rspack 打造一套「自动化构建流程」：通过改造 build 脚本，实现 _版本号自动递增 + 命令行日志美化 + dist 自动压缩 + 构建报告生成_，最后只需一条 `npm run build`，就能输出带版本信息的压缩包，还能清晰看到每个环节的耗时。

## 一、核心功能拆解：这套脚本能解决什么问题？

先明确我们要实现的自动化目标，避免无意义的代码堆砌：

- **版本号自动管理**：按「主版本。日期。每日构建次数」格式递增（如 `1.20240520.3`），无需手动改 `package.json`；
- **命令行日志美化**：用颜色区分不同环节（清理→构建→压缩），显示精确时间和耗时，告别单调黑白色；
- **dist 自动压缩**：构建完成后自动打包 `dist` 目录为 `ZIP` 包，排除 `sourcemap` 等无用文件，还能显示压缩进度；
- **构建报告生成**：输出总耗时、各环节耗时、版本号等信息，方便定位构建瓶颈（如压缩耗时过长）。

## 二、实现步骤：从依赖安装到脚本改造

### 第一步：安装必备依赖

首先需要安装处理压缩和命令行颜色的依赖，这里用 `archiver`（ZIP 压缩工具）和 `chalk`（命令行颜色美化）：

```bash
# pnpm 安装（推荐）
pnpm add archiver chalk rimraf -D

# npm 安装
npm i archiver chalk rimraf --save-dev
```

- _archiver_：用于压缩 dist 目录为 ZIP 包，支持高压缩级别和进度跟踪；
- _chalk_：给命令行日志添加颜色，区分成功 / 失败 / 提示信息；
- _rimraf_：跨平台删除目录（替代 `fs.rmdirSync`，避免 Windows 下报错）。

### 第二步：改造 build 脚本（核心：自动化流程串联）

我们将原来的 `build.js` 改造成「多环节自动化」脚本，核心流程是：_版本号更新 → 清理旧目录 → Rspack 构建 → dist 压缩 → 生成构建报告_。

#### 完整 build 脚本代码（build/build.js）

```javascript
"use strict";
require("./check-versions")();
process.env.NODE_ENV = "production";
const ora = require("ora");
const rm = require("rimraf");
const path = require("path");
const chalk = require("chalk");
const rspack = require("@rspack/core");
const config = require("../config");
const rspackConfig = require("./rspack.prod.conf");
const fs = require("fs");
const spinner = ora("building for production...");
// 记录整个构建过程的开始时间
const totalStartTime = Date.now();
console.log(
  chalk.blue(`[${new Date().toLocaleTimeString()}] 🚀 开始构建流程...`),
);

// 添加全局 navigator 修复
if (typeof global.navigator === "undefined") {
  global.navigator = {
    userAgent: "Node.js/" + process.version,
    platform: process.platform,
    language: "en-US",
  };
}

spinner.start();

// 声明变量以避免作用域问题
let versionLine = "未知版本"; // 默认值
let cleanDuration = 0;
let rspackDuration = 0;
let zipDuration = 0; // 在这里声明 zipDuration

try {
  function AddZero(time) {
    if (time < 10) {
      return "0" + time;
    } else {
      return time;
    }
  }

  let packageTxt = fs.readFileSync("./package.json", "utf8");
  let versionData = packageTxt.split("\n");
  let packageJson = JSON.parse(packageTxt);
  let VersionArr = packageJson.version.split(".");
  let date = new Date();
  let today =
    date.getFullYear() +
    "" +
    AddZero(date.getMonth() + 1) +
    "" +
    AddZero(date.getDate());
  if (today == VersionArr[1]) {
    VersionArr[2] = parseInt(VersionArr[2]) + 1;
  } else {
    VersionArr[1] =
      date.getFullYear() +
      "" +
      AddZero(date.getMonth() + 1) +
      "" +
      AddZero(date.getDate());
    VersionArr[2] = 1;
  }
  versionLine = VersionArr.join("."); // 赋值给外部声明的变量
  for (let i = 0; i < versionData.length; i++) {
    if (versionData[i].indexOf('"version":') != -1) {
      versionData.splice(i, 1, '  "version": "' + versionLine + '",');
      break;
    }
  }
  fs.writeFileSync("./package.json", versionData.join("\n"), "utf8");
  console.log(chalk.green.bold("✅ 更新版本号成功！当前版本: " + versionLine));
} catch (e) {
  console.log(chalk.red.bold("❌ 读取文件修改版本号出错:", e.toString()));
}

// 记录清理开始时间
const cleanStartTime = Date.now();
console.log(
  chalk.blue(`[${new Date().toLocaleTimeString()}] 🧹 开始清理输出目录...`),
);

rm(
  path.join(config.build.assetsRoot, config.build.assetsSubDirectory),
  (err) => {
    if (err) throw err;

    // 计算清理耗时
    const cleanEndTime = Date.now();
    cleanDuration = (cleanEndTime - cleanStartTime) / 1000; // 赋值给外部变量
    console.log(
      chalk.green.bold(`✅ 清理完成! 耗时: ${cleanDuration.toFixed(2)} 秒`),
    );

    // 确保 navigator 可写
    const originalNavigator = global.navigator;
    try {
      Object.defineProperty(global, "navigator", {
        value: { ...global.navigator },
        writable: true,
        configurable: true,
      });
    } catch (e) {
      console.warn("⚠️ 无法设置可写的 navigator:", e.message);
    }

    // 记录 Rspack构建开始时间    const rspackStartTime = Date.now();
    console.log(
      chalk.blue(`[${new Date().toLocaleTimeString()}] 📦 开始 Rspack 构建...`),
    );
    rspack(rspackConfig, (err, stats) => {
      if (originalNavigator) {
        global.navigator = originalNavigator;
      }

      spinner.stop();
      if (err) throw err;

      // 计算 Rspack 构建耗时        const rspackEndTime = Date.now();
      rspackDuration = (rspackEndTime - rspackStartTime) / 1000; // 赋值给外部变量

      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        }) + "\n\n",
      );

      if (stats.hasErrors()) {
        console.log(chalk.red("  ❌ 构建失败，发现错误!\n"));
        process.exit(1);
      }

      console.log(
        chalk.cyan.bold(
          `  ✅ Rspack 构建完成! 耗时: ${rspackDuration.toFixed(2)} 秒\n`,
        ),
      );
      console.log(
        chalk.yellow(
          "  💡 提示: 构建文件需要通过 HTTP 服务器提供服务\n" +
            "  直接打开 index.html 可能无法正常工作\n",
        ),
      );

      try {
        console.log(
          chalk.blue(
            `[${new Date().toLocaleTimeString()}] 🗜️ 开始打包 dist.zip...`,
          ),
        );
        const zipStartTime = Date.now();

        require("./zip-dist");

        const zipEndTime = Date.now();
        zipDuration = (zipEndTime - zipStartTime) / 1000; // 赋值给已声明的变量
        console.log(
          chalk.green.bold(
            `✅  dist.zip 打包完成! 耗时: ${zipDuration.toFixed(2)} 秒`,
          ),
        );
      } catch (zipErr) {
        console.error(chalk.red("❌ dist.zip 打包失败:"), zipErr);
        // 设置默认值以避免未定义错误
        zipDuration = -1; // 使用负数表示失败
      }

      // 计算总耗时（秒）
      const totalEndTime = Date.now();
      const totalSeconds = (totalEndTime - totalStartTime) / 1000;

      // 格式化总耗时为易读格式
      let totalTimeText;
      if (totalSeconds < 60) {
        // 小于1分钟，直接显示秒
        totalTimeText = `${totalSeconds.toFixed(2)} 秒`;
      } else {
        // 大于等于1分钟，显示分和秒
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        totalTimeText = `${minutes} 分 ${seconds.toFixed(2)} 秒`;
      }

      // 输出详细时间报告
      console.log(
        chalk.magenta.bold(
          "\n==================== 构建报告 ====================",
        ),
      );
      console.log(chalk.magenta(`🔧 版本号更新: ${versionLine}`));
      console.log(chalk.magenta(`🧹 清理耗时: ${cleanDuration.toFixed(2)} 秒`));
      console.log(
        chalk.magenta(`📦 Rspack 构建耗时: ${rspackDuration.toFixed(2)} 秒`),
      );
      // 安全地显示 ZIP 压缩时间
      if (zipDuration >= 0) {
        console.log(
          chalk.magenta(`🗜️ ZIP 压缩耗时: ${zipDuration.toFixed(2)} 秒`),
        );
      } else {
        console.log(chalk.magenta(`🗜️ ZIP 压缩: 失败`));
      }

      console.log(chalk.magenta.bold(`🏁 总耗时: ${totalTimeText}`));
      console.log(
        chalk.magenta(
          `⏰  开始时间: ${new Date(totalStartTime).toLocaleTimeString()}`,
        ),
      );
      console.log(
        chalk.magenta(
          `⏱️ 结束时间: ${new Date(totalEndTime).toLocaleTimeString()}`,
        ),
      );
      console.log(
        chalk.magenta.bold(
          "================================================\n",
        ),
      );

      // 如果有压缩错误，在此处退出
      if (zipDuration < 0) {
        process.exit(1);
      }
    });
  },
);
```

### 第三步：编写 dist 自动压缩脚本（build/zip-dist.js）

单独拆分 `zip-dist.js` 脚本，负责将 `dist` 目录压缩为 ZIP 包，支持*进度跟踪、旧包删除、大文件过滤*等功能：

```ts
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const chalk = require("chalk");

// 获取项目根目录
const rootPath = path.resolve(__dirname, "..");
const distPath = path.join(rootPath, "dist");
const packageJson = require(path.join(rootPath, "package.json"));
// 确定压缩包名称
const version = packageJson.version;
const date = new Date();
const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
const timeStr = `${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
const buildEnv = process.env.BUILD_ENV || "prod";
const zipName = process.env.ZIP_NAME || `dist.zip`;
// 这里修改了压缩包的路径，直接放到 dist 目录
const zipPath = path.join(distPath, zipName); // 原代码是 path.join(rootPath, zipName)

// 删除旧压缩包
if (fs.existsSync(zipPath)) {
  try {
    fs.unlinkSync(zipPath);
    console.log(chalk.green(`✅ 已删除旧压缩包: ${zipName}`));
  } catch (err) {
    console.error(chalk.red(`❌ 删除旧压缩包失败: ${err.message}`));
  }
}

// 确保 dist 目录存在
if (!fs.existsSync(distPath)) {
  console.error(chalk.red(`❌ dist 目录不存在，请先运行构建命令`));
  process.exit(1);
}

// 创建输出流
const output = fs.createWriteStream(zipPath);
const archive = archiver("zip", {
  zlib: { level: 9 }, // 最高压缩级别
});

console.log(chalk.blue(`📦 开始创建压缩包: ${chalk.bold(zipName)}`));
console.log(chalk.blue(`🔍 源目录: ${distPath}`));

// 进度跟踪
let totalFiles = 0;
let processedFiles = 0;
let startTime = Date.now();

// 计算文件总数
function countFiles(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += countFiles(filePath);
    } else {
      count++;
    }
  });

  return count;
}

// 更新进度显示
function updateProgress() {
  if (totalFiles === 0) return;

  const percent = Math.round((processedFiles / totalFiles) * 100);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  process.stdout.write(
    `\r📦 压缩进度: ${percent}% (${processedFiles}/${totalFiles} 文件) [${elapsed}s]`,
  );
}

// 监听事件
output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(chalk.green.bold(`✅  压缩包创建成功`));
  console.log(chalk.gray(`   ├─ 大小: ${chalk.cyan(`${sizeMB} MB`)}`));
  console.log(chalk.gray(`   └─ 路径: ${chalk.white(zipPath)}\n`));
});

archive.on("error", (err) => {
  console.error(chalk.red(`\n❌ 压缩失败: ${err.message}`));
  process.exit(1);
});

archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(chalk.yellow(`⚠️ 文件警告: ${err.message}`));
  } else {
    console.error(chalk.red(`\n❌ 压缩警告: ${err.message}`));
    process.exit(1);
  }
});

archive.on("entry", (entry) => {
  if (entry.name) {
    processedFiles++;

    // 每处理50个文件或完成时更新进度
    if (processedFiles % 50 === 0 || processedFiles === totalFiles) {
      updateProgress();
    }
  }
});

// 管道连接
archive.pipe(output);

// 递归添加目录中的所有文件
function addDirectory(dir, parentDir = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const relativePath = parentDir ? path.join(parentDir, file) : file;
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addDirectory(filePath, relativePath);
    } else {
      // 排除 sourcemap 文件
      if (filePath.endsWith(".map")) return;

      // 排除大文件（可选）
      if (stat.size > 30 * 1024 * 1024) {
        console.warn(
          chalk.yellow(
            `⚠️ 跳过大文件: ${relativePath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`,
          ),
        );
        return;
      }

      archive.file(filePath, { name: relativePath });
    }
  });
}

// 添加 dist 目录中的所有文件
try {
  // 计算文件总数
  totalFiles = countFiles(distPath);
  console.log(chalk.blue(`📂 发现 ${totalFiles} 个文件待压缩`));
  // 添加 dist 目录
  addDirectory(distPath);
  // 完成压缩
  archive.finalize();
} catch (err) {
  console.error(chalk.red(`❌ 压缩准备失败: ${err.message}`));
  process.exit(1);
}
```
