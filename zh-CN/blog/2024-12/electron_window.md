---
lastUpdated: true
commentabled: true
recommended: true
title: Electron 窗口内存泄漏问题分析与解决
description: Electron 窗口内存泄漏问题分析与解决
date: 2024-12-25 10:18:00
pageClass: blog-page-class
---

# Electron 窗口内存泄漏问题分析与解决 #

## 前言 ##

最近在 Electron 项目中，需要跑一个队列任务，执行任务时，需要创建窗口`（const window = new BrowserWindow()）`，任务执行完成后再销毁窗口实例，即频繁地创建与销毁窗口，因为每次任务的执行都需要一个干净的窗口运行环境。
虽然逻辑简单清晰，但是调用 `window.close()` 或者 `window.destroy()` 后，应用占用的内存并没有销毁，直到执行 100+ 次任务后，发现内存已经接近 100% 使用率。

## 分析 ##

1、查找到 Electron 仓库一个 [issue](https://github.com/electron/electron/issues/21586) 也是频繁创建与销毁窗口实例导致内存泄漏，目前还没有结论。

2、根据自身项目的逻辑思考🤔，独立的窗口是通过 `session.fromPartition('uid')` 创建一个独立 session 会话实现的，而 `window.destroy()` 应该只是销毁了自身的一些东西，session 会话内的相关数据可能并没有销毁。
抱着尝试的态度，试了试 `session.clearData()`，结果让人满意。

> 为什么不是 clearCache、clearStorageData，因为 clearData 包含了它们两者以及更多的数据清除。

## 完整代码示例 ##

### 销毁时主动触发 ###

```ts
async close() {
    // 清除事件
    window.webContents.removeAllListeners()
    // 清除 Cookies、Storage、内存等数据
    await window.webContents.session.clearData()
    // 销毁窗口
    window.destroy()
}
```

## 最终 ##

经过尝试，从运行快占满整个内存，降到现在维持在正常水平 16% 左右，完美解决。
