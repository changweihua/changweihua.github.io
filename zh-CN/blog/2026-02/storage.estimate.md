---
lastUpdated: true
commentabled: true
recommended: true
title: 前端存储配额
description: 用 navigator.storage.estimate() 预判浏览器什么时候会删你的数据
date: 2026-02-27 09:20:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

你一定知道浏览器是个“无情的房东”。当磁盘空间不足时，浏览器会自动启动 *驱逐机制（Eviction）* ，而你的 *IndexedDB* 数据往往是第一批被清理的对象，且清理前*没有任何弹窗提示*。

为了不让用户的 AI Prompt 模板一夜之间消失，我们需要利用 `navigator.storage` API 进行“生存预判”。

## 核心数据：Quota vs. Usage ##

通过 `navigator.storage.estimate()`，我们可以获取到当前域名的存储状态：

- usage: 你已经占用了多少字节（Byte）。
- quota: 浏览器分配给你的最高额度。通常是磁盘剩余空间的 80% ，但这只是“软上限”。

### 实战代码封装 ###

```javascript
async function checkStorageHealth() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { status: 'unsupported' };
  }

  const { usage, quota } = await navigator.storage.estimate();
  
  // 转换为更直观的 GB/MB
  const usageMB = (usage / (1024 * 1024)).toFixed(2);
  const quotaMB = (quota / (1024 * 1024)).toFixed(2);
  const percentUsed = ((usage / quota) * 100).toFixed(2);

  return {
    usageMB: `${usageMB}MB`,
    quotaMB: `${quotaMB}MB`,
    percentUsed: `${percentUsed}%`,
    isRisk: percentUsed > 80 // 占用超过 80% 即为高风险
  };
}

// 在 AI Prompt Manager 初始化时调用
checkStorageHealth().then(console.table);
```

## 存储策略：最佳努力 (Best-effort) vs. 持久化 (Persistent) ##

默认情况下，所有的 Web 存储都是 *“最佳努力（Best-effort）”* 。这意味着当用户电脑没空间时，浏览器会根据 LRU（最近最少使用）原则删掉你的数据库。

作为资深开发，你应该在用户存储了重要数据后，申请 “持久化存储权限” ：

```js
async function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    // 检查是否已经持久化
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) return true;

    // 申请持久化
    const granted = await navigator.storage.persist();
    return granted; // 返回 true 表示浏览器承诺：除非用户手动清理，否则绝不删除
  }
  return false;
}
```

> 注意： 浏览器（尤其是 Chrome）会自动根据网站的“活跃度”决定是否授予持久化权限。如果你的应用被用户频繁访问，获批概率极大。

## 浏览器如何决定删谁？（驱逐逻辑） ##

不同的房东有不同的驱逐规矩：

| 浏览器  |  存储上限 (Quota)  |  驱逐触发条件  |
| :-------: | :---------: | :--------: |
| Chrome / Edge | 共享磁盘剩余空间的 80% | 全局磁盘空间不足 10% 或 2GB 时 |
| Firefox | 磁盘剩余空间的 80% | 超过总额度的 10% 时开始 LRU 清理 |
| Safari | 严格限制（通常 1GB 或更少） | 7 天不使用即可能被清理（移动端更严） |

## “预判避坑”指南 ##

- *静默失败的处理*：不要等到 `set()` 报错 `QuotaExceededError` 才行动。在那之前，通过 `estimate()` 监控，当 `percentUsed > 70%` 时，在 UI 上给用户一个“清理旧数据”的黄色警告。

- *垃圾回收的滞后*：当你删除了 100MB 的 IndexedDB 数据后，`usage` 不会立刻减少。浏览器需要时间进行内部清理（Compaction），所以不要在 `delete` 之后立刻测 `estimate`。

- *计算并不精准*：`estimate()` 返回的是字节数，但 IndexedDB 存储时会有额外的索引开销和数据库元数据。*实际占用通常比数据本身大 10% 到 20% 。*

- *金融数据备份建议*：既然涉及到金融级别的安全性，永远不要把浏览器存储作为唯一的真理来源。

  - 低频：将重要 `Prompt` 同步到后端云端。

  - 高频：提供本地导出 `.json` 的功能作为手动备份。
