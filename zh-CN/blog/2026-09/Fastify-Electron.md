---
lastUpdated: true
commentabled: true
recommended: true
title: Fastify 加 Electron
description: 把 Web 服务嵌进桌面应用
date: 2026-09-01 09:15:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

> 本文面向：想把 Web 服务嵌入 Electron 桌面应用的开发者。
>
> 最终效果：理解 `Function()` 构造器绕过 CJS 限制、端口检测、CSP 安全头、生命周期管理的完整方案。

## 同一个服务器，两种运行模式 ##

Fastify 服务器既可以独立运行（`npm start`），也可以嵌入 Electron 桌面应用。两种模式共享同一份服务器代码，区别只在启动方式和生命周期管理。

独立模式下，`server/src/index.ts` 底部的自启动逻辑直接调用 `createServer()`：

```ts
if (!process.env.ELECTRON && !process.env.CRYSTAL_CLI) {
  createServer()
    .then(({ shutdown }) => {
      const handle = () => shutdown().then(() => process.exit(0));
      process.on('SIGINT', handle);
      process.on('SIGTERM', handle);
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}
```

Electron 模式下，这段代码不会执行——主进程通过 `ELECTRON` 环境变量抑制自启动，改为手动调用 `createServer()` 并控制生命周期。

## `Function()` 构造器：绕过 CJS 的 ESM 导入 ##

Electron 的主进程默认运行在 CommonJS 模块系统下。但服务器是 ESM 模块（`type: "module"` + `import.meta`）。直接用 `import()` 在 CJS 上下文中会被 Electron 的打包器拦截或报错。

解决方案是用 `Function()` 构造器创建一个动态导入：

```ts
const serverEntry = pathToFileURL(
  path.join(app.getAppPath(), "server", "dist", "server", "src", "index.js"),
).href;

const serverModule = await Function(
  "specifier",
  "return import(specifier)",
)(serverEntry);
```

`Function()` 构造器创建的函数运行在全局作用域，不受当前模块的 CJS 上下文限制。`pathToFileURL()` 把文件路径转成 `file://` URL，这是 ESM `import()` 要求的格式。

代码中的注释明确标注了这是一个有意为之的 workaround：

> C-1: `Function()` constructor is used intentionally to bypass Electron's CJS bundler restrictions on dynamic `import()`. This is a known workaround for loading ESM server modules from a CJS main process.

如果未来 Electron 主进程迁移到 ESM，可以直接用 `import()` 替换。

## 端口检测：优雅降级 ##

桌面应用不能假设端口一定可用。用户可能同时运行开发服务器，或者端口被其他程序占用。

端口检测逻辑：

```ts
function findFreePort(preferred: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(preferred, "127.0.0.1", () => {
      srv.close(() => resolve(preferred));
    });
    srv.on("error", () => {
      const srv2 = net.createServer();
      srv2.listen(0, "127.0.0.1", () => {
        const port = (srv2.address() as net.AddressInfo).port;
        srv2.close(() => resolve(port));
      });
    });
  });
}
```

先尝试首选端口 3721。如果被占用，监听端口 0 让操作系统分配随机可用端口。主进程在启动服务器前调用这个函数：

```ts
serverPort = await findFreePort(3721);
if (serverPort !== 3721) {
  console.log(`[Electron] Port 3721 occupied, using port ${serverPort}`);
}
```

找到端口后，传递给 `createServer({ port, host: "127.0.0.1" })`。host 绑定到 `127.0.0.1` 而不是 `0.0.0.0`，确保桌面应用的服务器只监听本地回环地址，不暴露到网络。

## CSP 安全头：生产环境的 XSS 防护 ##

AI 对话内容会被渲染成 Markdown，其中可能包含恶意脚本。在 Electron 的生产模式下注入严格的 `Content-Security-Policy` 响应头：

```ts
if (!process.env.VITE_DEV_URL) {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self';" +
          " script-src 'self';" +
          " style-src 'self' 'unsafe-inline';" +
          " img-src 'self' data: blob:;" +
          " font-src 'self' data:;" +
          " connect-src 'self' http://localhost:* ws://localhost:*;" +
          " object-src 'none';" +
          " base-uri 'self'",
        ],
      },
    });
  });
}
```

关键限制：`script-src 'self'` 只允许加载同源脚本，阻止内联脚本和 eval()。`style-src 'unsafe-inline'` 是为了兼容 Tailwind CSS 的运行时样式注入。`connect-src` 限制为 `localhost`，因为服务器只在本地运行。

开发模式下跳过 CSP，因为 Vite 的 HMR（热模块替换）依赖内联脚本注入。

## 生命周期管理：启动、运行、关闭 ##

### 启动流程 ###

`app.whenReady()` 回调中按顺序执行 9 个步骤：

- 确定数据目录（`DATA_DIR` 环境变量或 `~/.project_dir/data`）
- 确保数据目录存在（`mkdirSync`）
- 设置环境变量（`ELECTRON=true`, `DATA_DIR`, `ELECTRON_PACKAGED`）
- 注入 CSP 安全头（生产模式）
- 检测可用端口
- 启动 Fastify 服务器（开发模式跳过——服务器由 `tsx` 独立运行）
- 创建 BrowserWindow
- 加载应用 URL（开发模式加载 `VITE_DEV_URL`，生产模式加载 `http://localhost:{port}`）

### 创建系统托盘 ###

步骤 6 的条件判断实现了开发/生产模式的无缝切换。开发时 Electron 窗口连 Vite 开发服务器（带 HMR），生产时连嵌入的 Fastify 服务器。

### 运行时行为 ###

窗口关闭不退出应用——而是隐藏到系统托盘：

```ts
win.on("close", (e) => {
  saveWindowState(win);
  if (!isQuitting) {
    e.preventDefault();
    win.hide();
  }
});
```

系统托盘提供右键菜单：打开窗口、搜索知识、浏览器打开、退出。双击托盘图标也能打开窗口。

### 优雅关闭 ###

退出时的关闭顺序是：watcher 停止 → 数据库保存 → Fastify 关闭 → 托盘销毁：

```ts
async function gracefulShutdown(): Promise<void> {
  if (serverShutdown) {
    await serverShutdown();
    serverShutdown = null;
  }
  destroyTray();
}
```

`serverShutdown` 是 `createServer()` 返回的 `shutdown` 函数，内部依次执行 `watcher.close()` → `closeDatabase()` → `app.close()`。

`before-quit` 事件处理器还有一个 10 秒超时机制——如果关闭过程卡住，强制退出：

```ts
const timeout = setTimeout(() => {
  console.error("[Electron] Shutdown timed out, forcing exit");
  app.exit(1);
}, 10000);
```

## 窗口状态持久化 ##

窗口位置和大小保存到 `%APPDATA%/project_dir/window-state.json`。每次 `resize`/`move` 事件都更新内存中的状态，close 事件时写入文件。

恢复时会验证保存的位置是否在当前显示器范围内——如果用户之前接了外接显示器，现在拔掉了，窗口不会跑到屏幕外面：

```ts
const displays = screen.getAllDisplays();
const visible = displays.some((d) => {
  const b = d.bounds;
  return state.x! >= b.x - 50 && state.x! < b.x + b.width &&
         state.y! >= b.y - 50 && state.y! < b.y + b.height;
});
if (!visible) {
  state.x = undefined;
  state.y = undefined;
}
```

50 像素的容差允许窗口边缘稍微超出屏幕（用户可能故意把窗口部分隐藏在屏幕边缘）。

## 单实例锁 ##

`app.requestSingleInstanceLock()` 确保只有一个实例运行。如果用户尝试启动第二个实例，主实例会收到 `second-instance `事件，把窗口恢复并聚焦：

```ts
app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});
```

第二个实例直接退出。

## 总结 ##

Electron 集成围绕一个核心思想：同一个服务器，不同的启动器。Fastify 服务器通过 `createServer()` 导出，独立模式和 Electron 模式共享完全相同的代码。`Function()` 构造器解决了 CJS/ESM 模块系统的兼容问题，端口检测保证了桌面环境的健壮性，CSP 安全头防止了 AI 对话内容中的 XSS 攻击。整个生命周期从启动到关闭都有完善的错误处理和超时机制。
