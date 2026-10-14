---
lastUpdated: true
commentabled: true
recommended: true
title: 纯 JS 本地向量搜索引擎
description: Vectra 实战
date: 2026-10-14 09:15:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

想在 Node.js 项目里加语义搜索，但不想装 Python、不想跑 Docker、不想申请云服务 API Key？vectra 就是为这个场景设计的——一个纯 JavaScript 实现的本地向量搜索引擎，零原生依赖，数据全部存在本地文件里。

## vectra 是什么 ##

`vectra` 是 Steve Bilig 开发的轻量级向量数据库，核心特点：

- 纯 JS。没有任何 C++ 原生模块，`npm install` 即可，不需要编译
- 文件存储。索引数据存在本地文件系统，不依赖 SQLite 或外部服务
- TypeScript 原生。类型定义完整，IDE 补全友好
- HNSW 算法。基于 Hierarchical Navigable Small World 算法做近似最近邻搜索，查询速度快

vectra 不是为大规模生产环境设计的（百万级以上向量应该用 Qdrant 或 Pinecone），但它非常适合本地工具、CLI 应用、Electron 桌面软件这类场景。ChatCrystal 用它存储所有笔记的 embedding 向量，支撑语义搜索功能。

## 为什么选 vectra ##

选型时考虑过几个方案：

| 方案 | 问题 |
| :--- | :--- |
| chroma | 需要 Python 运行时，Node.js 项目集成成本高 |
| hnswlib-node | 有 C++ 原生依赖，跨平台编译容易出问题 |
| 自己实现 | HNSW 算法复杂度高，不适合项目初期 |
| vectra | 纯 JS、零配置、文件存储、API 简洁 |


vectra 的优势在于*零摩擦*：`npm install vectra` 装完就能用，不需要配置数据库连接、不需要启动额外进程、不需要处理原生模块编译失败的问题。对于 Electron 桌面应用这种需要跨平台分发的场景，这一点尤其重要。

## 安装和初始化 ##

```bash
npm install vectra
```

创建索引实例：

```javascript
import { LocalIndex } from 'vectra';
import { resolve } from 'node:path';

const INDEX_PATH = resolve('./data', 'vectra-index');
const index = new LocalIndex(INDEX_PATH);
```

`LocalIndex` 构造函数只接收一个路径参数，不创建任何文件。需要显式调用 `createIndex()` 初始化：

```ts
if (!(await index.isIndexCreated())) {
  await index.createIndex();
}
```

`isIndexCreated()` 检查路径下是否已有索引文件。这个模式适合应用启动时调用——首次运行创建索引，后续运行直接复用。

ChatCrystal 用单例模式管理索引实例，避免重复创建：

```javascript
// server/src/services/vector-index.ts
const INDEX_PATH = resolve(appConfig.dataDir, 'vectra-index');
let _index: LocalIndex | null = null;

export async function getIndex(): Promise<LocalIndex> {
  if (_index) return _index;
  _index = new LocalIndex(INDEX_PATH);
  if (!(await _index.isIndexCreated())) {
    await _index.createIndex();
  }
  return _index;
}
```

## 插入向量 ##

向 vectra 插入数据需要两样东西：向量（浮点数组）和元数据（任意 JSON 对象）。

先拿到一个向量。实际项目中会调用 Embedding 模型，这里用随机向量演示：

```ts
// 模拟一个 768 维的 embedding 向量
const vector = Array.from({ length: 768 }, () => Math.random() * 2 - 1);

const item = await index.insertItem({
  vector,
  metadata: {
    noteId: 42,
    chunkIndex: 0,
    title: 'SQLite WAL 模式并发写入问题',
    projectName: 'my-project',
  },
});

console.log(item.id); // vectra 自动生成的唯一 ID
```

`insertItem` 返回的对象包含 `id` 字段，这是 vectra 分配的内部标识符。后续删除、查询都会用到它。ChatCrystal 把这个 id 存到 SQLite 的 `embeddings` 表中，建立 vectra 向量和业务数据之间的关联。

在 ChatCrystal 的实际代码中，一条笔记会被切分成多个 chunk，每个 chunk 独立生成向量并插入：

```ts
// server/src/services/embedding.ts
const item = await index.insertItem({
  vector: chunk.vector,
  metadata: {
    noteId: id,
    chunkIndex: chunk.chunkIndex,
    conversationId,
    title,
    projectName,
  } as NoteChunkMeta,
});

// 保存 vectra ID 到 SQLite，建立关联
newItems.push({
  chunkIndex: chunk.chunkIndex,
  chunkText: chunk.chunkText,
  vectraId: item.id,
});
```

metadata 里的字段完全自定义。vectra 不关心你放什么进去，它只负责存储和返回。但 metadata 在查询时可以用来做过滤，所以合理设计 metadata 结构很重要。

## 查询向量 ##

查询是 vectra 最核心的功能。给一个查询向量，它返回余弦相似度最高的 top-K 结果：

```ts
const queryVector = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
const results = await index.queryItems(queryVector, '查询文本', 10);

for (const result of results) {
  console.log(`笔记: ${result.item.metadata.title}`);
  console.log(`相似度: ${result.score}`);
  console.log(`chunk: ${result.item.metadata.chunkIndex}`);
}
```

`queryItems` 的三个参数：

- `queryVector` — 查询向量（浮点数组）
- `queryText` — 查询文本（vectra 内部用于辅助，传空字符串也行）
- `topK` — 返回结果数量

返回的每个 `result` 包含 `item`（含 `metadata`）和 `score`（相似度分数，0-1 之间，越大越相似）。

ChatCrystal 在实际搜索中加入了候选集升级机制——因为一个笔记可能有多个 chunk，直接取 top-10 可能返回的 10 个 chunk 全来自同一条笔记。所以先取小批量，不够就翻倍：

```ts
let candidateK = requestedTopK;
let directResults: DirectSearchHit[] = [];

while (candidateK > 0) {
  const results = await index.queryItems<NoteChunkMeta>(embedding, query, candidateK);
  directResults = await materializeDirectSearchHits(db, results);

  if (directResults.length >= requestedTopK || results.length < candidateK) break;

  // 翻倍候选集，但不超过索引总条数
  const nextCandidateK = candidateLimit === undefined
    ? candidateK * 2
    : Math.min(candidateK * 2, candidateLimit);
  if (nextCandidateK <= candidateK) break;
  candidateK = nextCandidateK;
}
```

`materializeDirectSearchHits` 从 SQLite 读取 chunk 原文，按 `noteId` 去重保留最高分。这样即使 vectra 返回了同一笔记的 5 个 chunk，最终结果里也只出现一条。

## 按 metadata 过滤 ##

vectra 支持按 metadata 字段过滤查询结果。比如只搜索某个项目的笔记：

```ts
// 获取指定笔记的所有 chunk
const items = await index.listItemsByMetadata({ noteId: 42 });
```

`listItemsByMetadata` 接收一个 metadata 对象，返回所有字段完全匹配的条目。ChatCrystal 用它来做两件事：

*删除前查找*：先找到某条笔记在 vectra 中的所有 chunk ID，然后逐个删除：

```typescript
// server/src/services/vector-index.ts
export async function committedVectraIdsForNote(index: LocalIndex, noteId: number): Promise<string[]> {
  const items = await index.listItemsByMetadata({ noteId });
  return items.map((item) => item.id);
}
```

*存在性检查*：确认 vectra 中的向量是否和 SQLite 记录一致：

```typescript
export async function currentVectraIdsCommitted(index: LocalIndex, vectraIds: string[]): Promise<boolean> {
  if (vectraIds.length === 0) return false;

  for (const vectraId of vectraIds) {
    if (!(await index.getItem(vectraId))) {
      return false;
    }
  }
  return true;
}
```

`getItem(vectraId)` 按 ID 获取单个条目，如果不存在返回 `undefined`。

需要注意的是，vectra 的 `listItemsByMetadata` 是精确匹配，不支持范围查询或模糊匹配。如果你需要复杂的过滤逻辑，应该在 vectra 查询之后用业务代码二次过滤。

## 删除向量 ##

*删除单个向量*：

```ts
await index.deleteItem(vectraId);
```

ChatCrystal 在更新笔记的 `embedding` 时，会先删除旧向量再插入新向量：

```ts
// 找到旧向量
const oldVectraIds = await committedVectraIdsForNote(index, noteId);

// 插入新向量后，删除旧的
for (const vectraId of oldVectraIds) {
  await index.deleteItem(vectraId);
}
```

如果要清空整个索引重建，可以直接删除索引目录：

```ts
import { existsSync, rmSync } from 'node:fs';

export function clearEmbeddingIndex(): void {
  _index = null;  // 清空内存缓存
  if (existsSync(INDEX_PATH)) {
    rmSync(INDEX_PATH, { recursive: true, force: true });
  }
  // 下次 getIndex() 调用会自动重建空索引
}
```

## 事务模式：beginUpdate / endUpdate ##

这是 vectra 最重要的设计模式。单个 `insertItem` 或 `deleteItem` 调用会立即写入磁盘，但如果你要批量操作，每次都写盘会很慢。vectra 提供了事务式的批量写入：

```ts
await index.beginUpdate();

// 批量插入/删除，不会立即写盘
await index.insertItem({ vector: v1, metadata: { ... } });
await index.insertItem({ vector: v2, metadata: { ... } });
await index.deleteItem(oldId);

await index.endUpdate(); // 这时候才一次性写入磁盘
```

如果中途出错，可以用 `cancelUpdate()` 回滚：

```ts
let updateOpen = false;
try {
  await index.beginUpdate();
  updateOpen = true;
  // ... 写入操作 ...
  await index.endUpdate();
  updateOpen = false;
} catch (error) {
  if (updateOpen) {
    try {
      index.cancelUpdate(); // 丢弃未提交的变更
    } catch {
      // 忽略取消失败，优先抛出原始错误
    }
  }
  throw error;
}
```

ChatCrystal 在所有批量写入的地方都用了这个模式。`updateOpen` 标志位确保 `cancelUpdate` 只在事务确实开启的情况下才调用，避免二次异常。

实际代码（删除某笔记的所有向量）：

```typescript
// server/src/services/vector-index.ts
export async function deleteVectraItemsForNote(index: LocalIndex, noteId: number): Promise<number> {
  const vectraIds = await committedVectraIdsForNote(index, noteId);
  if (vectraIds.length === 0) return 0;

  let updateOpen = false;
  try {
    await index.beginUpdate();
    updateOpen = true;

    for (const vectraId of vectraIds) {
      await index.deleteItem(vectraId);
    }

    await index.endUpdate();
    updateOpen = false;
    return vectraIds.length;
  } catch (error) {
    if (updateOpen) {
      try {
        index.cancelUpdate();
      } catch {
        // Ignore cancel failures
      }
    }
    throw error;
  }
}
```

## 索引统计 ##

获取索引中的向量总数：

```javascript
const stats = await index.getIndexStats();
console.log(`索引中有 ${stats.items} 个向量`);
```

ChatCrystal 用这个数字来决定查询时的候选集大小——如果索引里只有 5 个向量，就没必要请求 top-100。

## 文件存储结构 ##

vectra 的索引存储在你指定的目录下。ChatCrystal 的路径是 `{dataDir}/vectra-index/`：

```txt
~/.chatcrystal/data/vectra-index/
├── items/          # 向量数据文件
├── index.json      # 索引元信息
└── ...
```

因为是纯文件存储，备份只需要复制整个目录，迁移也只需要把目录搬到新位置。不需要 `pg_dump`、不需要 `mysqldump`，`cp -r` 搞定。

这个特性对 Electron 桌面应用特别友好：用户卸载重装后，只要数据目录还在，索引就还在。

## vectra vs chroma vs hnswlib ##

| 维度 | vectra | chroma | hnswlib-node |
| :--- | :--- | :--- | :--- |
| 语言 | 纯 JS/TS | Python | C++ binding |
| 原生依赖 | 无 | 有 | 有 |
| 安装难度 | `npm install` | `pip install + server` | 需要编译环境 |
| 运行方式 | 进程内嵌入 | 独立服务 | 进程内嵌入 |
| 存储方式 | 文件系统 | SQLite / 文件 | 文件 |
| 适合场景 | Node.js 本地工具 | Python 应用、服务端 | 需要极致性能 |
| 元数据过滤 | 精确匹配 | 丰富过滤表达式 | 无内置支持 |
| 最大规模 | 万级 | 十万级 | 百万级 |

vectra 的定位很清晰：*Node.js 生态里的轻量级本地向量存储*。如果你的项目是 Python 技术栈，chroma 更合适。如果你需要处理百万级向量，应该上 Qdrant 或 Pinecone。但如果你是 Node.js 开发者，想要一个零配置的本地语义搜索能力，vectra 是目前最好的选择。
