---
lastUpdated: true
commentabled: true
recommended: true
title: 前端开发提效神器
description: concurrently 实战指南
date: 2026-01-20 10:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

在现代前端项目中，我们常常需要*同时运行多个开发服务*，比如：

- 启动 React/Vue 开发服务器
- 监听并编译 TypeScript 或 Sass
- 运行 Mock API 服务
- 实时构建文档或 Storybook

如果每次都要打开多个终端窗口手动执行命令，不仅繁琐，还容易出错。有没有一种方式，**一条命令启动整个开发环境**？

答案就是：`concurrently`。

## 🌟 什么是 concurrently？ ##

`concurrently` 是一个轻量级的 Node.js 工具，允许你在 *单个命令中并行运行多个子命令*，并统一管理它们的输出、颜色、日志和退出行为。

它特别适合用于：

- 前端开发环境一键启动
- 构建流程中并行执行多个任务
- 微前端或多服务项目集成

## 🔧 安装 `concurrently` ##

```sh
npm install --save-dev concurrently // [!=npm auto]
```

安装后，你就可以在 `package.json` 的 `scripts` 中使用它了。

## 🧩 基本用法：并行运行多个命令 ##

假设你的项目结构如下：

```json
{
  "scripts": {
    "start": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "nodemon server.js"
  }
}
```

执行：

```bash
npm start
```

你会看到两个进程*同时启动*，输出被 `concurrently` 染色区分，便于调试：

```txt
[dev:client] vite v4.0.0 dev server running at:
[dev:client] ➜ Local: http://localhost:3000/
[dev:server] [nodemon] starting `node server.js`
[dev:server] Server running on http://localhost:5000
```

> ✅ 两个服务同时运行，共享一个终端窗口，开发体验大幅提升！

## 🎨 高级配置：自定义输出样式 ##

`concurrently` 支持丰富的配置选项，可以通过命令行参数或配置文件进行设置。

### 自定义前缀和颜色 ###

```json
"scripts": {
  "dev": "concurrently --names \"CLIENT,SER\" -c \"blue.bold,cyan.bold\" \"vite\" \"nodemon server.js\""
}
```

- `--names`：为每个进程设置别名
- `-c`：设置输出颜色（支持 CSS 风格颜色名）

### 隐藏标题栏（简洁模式） ###

```bash
concurrently --hide kill-signals \"npm run build\" \"npm run lint\"
```

### 设置重启策略 ###

```bash
concurrently --restart-tries 3 \"npm run dev:client\" \"npm run dev:server\"
```

当某个进程崩溃时，自动重试 3 次。

## 🛠️ 实战场景：前端 + Mock API 一体化开发 ##

很多项目使用本地 Mock 数据进行开发。我们可以用 `concurrently` 一键启动前端和 Mock 服务。

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"json-server --watch mock/db.json --port 3001\"",
    "dev:quiet": "concurrently --silent \"vite\" \"json-server --watch mock/db.json\""
  }
}
```

现在只需运行：

```bash
npm run dev
```

- 前端运行在 `http://localhost:3000`
- Mock API 运行在 `http://localhost:3001`

前端代码中请求 `/api/users`，即可获取 Mock 数据，*完全无需后端介入*。

## 🧱 微前端/多项目集成 ##

在微前端架构中，主应用和子应用可能分布在不同目录。`concurrently` 可以统一启动：

```json
{
  "scripts": {
    "start:all": "concurrently \"npm run start:shell\" \"npm run start:user\" \"npm run start:order\""
  },
  "scripts:shell": "cd shell && vite",
  "scripts:user": "cd user-module && vite",
  "scripts:order": "cd order-module && vite"
}
```

一条命令，启动整个微前端体系！

## ⚠️ 注意事项与最佳实践 ##

|  问题  |  解决方案  |
| :-----------: | :----: |
|  子进程未正确退出  |  使用 `--kill-others-on-fail`，任一进程失败时终止其他进程  |
|  输出混乱  |  使用 `--names` 和颜色区分，提升可读性  |
|  Windows 路径问题  |  使用双引号 `\"` 包裹命令，避免解析错误  |
|  内存占用高  |  避免并行运行过多重型服务，合理拆分脚本  |

### 推荐组合配置 ###

```json
"dev": "concurrently --names \"VITE,API\" -c \"bgBlue.bold,bgGreen.bold\" --kill-others-on-fail \"vite\" \"npm run mock:api\""
```

## 📦 配置文件（可选） ##

除了命令行，你还可以创建 concurrently.config.cjs 进行更复杂配置：

```js:concurrently.config.cjs
module.exports = {
  commands: ['vite', 'json-server mock/db.json'],
  options: {
    restartTries: 3,
    killOthers: ['failure'],
    prefixes: ['blue', 'green'],
    names: ['Frontend', 'Mock API']
  }
};
```

然后运行：

```bash
npx concurrently --config concurrently.config.cjs
```

## 🔄 对比其他工具 ##

|  特性  |  特点  |   适用场景  |
| :-----------: | :----: | :----: |
| `concurrently` |  轻量、易用、支持染色  |  前端项目首选 |
|  `npm-run-all`  |  支持串行/并行  |  复杂脚本编排  |
|  `nx` / `turbo`  |  全功能 Monorepo 工具  |  大型项目  |
|  `docker-compose`  |  容器化并行  |  生产环境部署  |

> ✅ 对于大多数前端项目，`concurrently` 是最简单高效的解决方案。

## ✅ 总结 ##

`concurrently` 虽小，但极大提升了前端开发的自动化与集成度。通过它，你可以：

- ✅ 一键启动多个服务
- ✅ 统一管理开发环境
- ✅ 提升团队协作效率
- ✅ 简化 CI/CD 脚本

**💡 小贴士**：下次当你需要“开多个终端”的时候，先想想：能不能用 `concurrently` 一条命令解决？
