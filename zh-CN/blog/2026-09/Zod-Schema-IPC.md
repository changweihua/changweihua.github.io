---
lastUpdated: true
commentabled: true
recommended: true
title: Zod Schema 驱动的 IPC 契约
description: 从入参校验到状态机一致性的三层防御
date: 2026-09-21 09:30:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

> 在 Electron 应用里，"渲染进程发请求—主进程执行"是最常见的模式。但当你写下第一行 `ipcMain.handle('foo', () => ...)` 时，一个幽灵就开始潜伏：*没有任何东西约束两端的数据形状*。一旦渲染进程发来一个畸形对象，主进程要么静默崩溃，要么写入脏数据到磁盘。本文拆解一种工程化方案——用 Zod 在 IPC 边界构筑三层校验，让"契约"不再是注释里的承诺，而是运行时的法律。

## 为什么 IPC 需要 Schema ##

Electron 的 `ipcRenderer.invoke` / `ipcMain.handle` 是一个无类型边界：

```ts
// 渲染进程
const result = await window.api.project.open({ path: 123 })  // path 应该是 string

// 主进程
ipcMain.handle('project:open', async (event, payload) => {
  await fs.readFile(payload.path)  // 💥 payload.path 是 number，readFile 当场报错
})
```

TypeScript 的类型注解只是编译期幻觉，`any` 一旦穿过 IPC 边界就消失。常见痛点：

- 静默写脏数据：渲染进程传了 `{ volume: '80%' }`（字符串），主进程不校验直接写盘，下次加载时整份 document 失效。
- 错误吞没：主进程 `throw` 出去的 Error 经过 IPC 序列化后只剩 message，调用方拿不到结构化错误码。
- 状态机漂移：轨道顺序、外键引用、ID 唯一性这类跨字段约束，单字段类型校验根本管不到。
- 协议演进：v1 渲染进程发给 v0 主进程（用户没升级），新增字段主进程直接 crash。

解决方案不是"加更多 if"，而是引入契约层：用 Schema 描述所有合法数据形状，运行时双向校验，编译期类型同步。

## Zod：声明式 Schema 的正确打开方式 ##

Zod 是 TypeScript 优先的运行时校验库。它的杀手锏是 *Schema 即类型*——一份 schema 定义同时产出运行时校验器和编译期类型，永远不漂移。

```ts
import { z } from 'zod'

// 基础类型
const volumeSchema = z.number().min(0).max(1)
type Volume = z.infer<typeof volumeSchema>  // number，但带 0~1 的运行时约束

// 复合类型
const clipSchema = z.object({
  id: z.string(),
  start: z.number().nonnegative(),
  duration: z.number().positive(),
  volume: volumeSchema.default(1),
  speed: z.number().min(0.25).max(4).default(1),
  transform: z.object({
    x: z.number(),
    y: z.number(),
    scale: z.number().positive().default(1),
    rotation: z.number().default(0),
  }).default({ x: 0, y: 0 }),
})
```

几个被低估的特性：

1. `.default()` 与 `.optional()` 的语义差

`optional()` 表示字段可以*不存在*，解析后类型是 `T | undefined；default()` 表示字段不存在时自动填默认值，解析后类型仍是 `T`。后者对向后兼容至关重要——新加字段一律用 `default()`，老 `document` 加载时自动补齐，无需手写 `migration`。

2. `.strict()` vs 默认 `.strip()`

Zod 对象默认是 `strip` 模式：解析时静默丢弃未知字段。这对 IPC 协议演进是双刃剑——好处是渲染进程多发字段不会让主进程崩溃；坏处是 bug 导致的字段拼写错误会被静默吞掉，调试地狱。生产建议对核心 `document` 用 `.strict()`，对扩展字段用 `.passthrough()`。

3. `.catch()` 兜底

```ts
const thumbnailSchema = z.string().url().catch('about:blank')
```

脏数据自动降级为兜底值，不让单字段错误导致整份校验失败。适合用在 UI 装饰性字段。

## 三层校验：从入参到状态机 ##

把校验塞进一个地方是不够的。一个真实的 Electron 文档编辑器，数据流经至少三个阶段，每个阶段都有不同的校验目标：

```txt
渲染进程 IPC 调用
        ↓
┌─────────────────────────────────────┐
│ Layer 1: IPC 入参校验              │  ← 单条调用是否合法
│   zod.parse(request)                │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Layer 2: 单步操作 apply 校验       │  ← 这一步 op 应用后是否合法
│   zod.parse(singleOpOutput)         │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Layer 3: 完整 document superRefine │  ← 跨字段、跨实体一致性
│   外键、ID 唯一性、时间不重叠      │
└─────────────────────────────────────┘
        ↓
   持久化到磁盘
```

### Layer 1：IPC 入参契约 ###

每个 IPC channel 对应一个 request schema：

```ts
const addClipRequestSchema = z.object({
  channelId: z.string(),
  clip: clipSchema,
  beforeClipId: z.string().optional(),
})

ipcMain.handle('timeline:addClip', async (event, raw) => {
  const parsed = addClipRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: { code: 'IPC_REQUEST_INVALID', issues: parsed.error.issues } }
  }
  // 进入 Layer 2
})
```

关键：永远用 `safeParse` 而不是 `parse`。`parse` 抛异常会被 IPC 序列化丢失堆栈，`safeParse` 返回结构化结果。

### Layer 2：单步 `op` 校验 ###

每次状态变更（增删改 clip、调字幕、改 exportSettings）都要走一个纯函数：

```ts
function applyTimelinePatch(doc: ProjectDocument, op: TimelineOp): ProjectDocument {
  const next = produce(doc, draft => {
    // immutable update...
  })
  // 单步输出再过一次 schema，确保这一步没引入非法形状
  const parsed = projectDocumentSchema.safeParse(next)
  if (!parsed.success) {
    throw new PatchError('POST_PATCH_INVALID', parsed.error.issues)
  }
  return parsed.data
}
```

为什么需要 Layer 2？因为 Layer 3 的 `superRefine` 很重（`O(n²)` 外键扫描），不合适每次微小变更都跑。Layer 2 用快速 `schema` 跑一次，挡掉"形状错误"，让 Layer 3 只在持久化前跑。

### Layer 3：superRefine 跨字段一致性 ###

```ts
const projectDocumentSchema = z.object({
  canvas: canvasSchema,
  assets: z.array(assetSchema),
  tracks: z.array(trackSchema),
  clips: z.array(clipSchema),
  subtitles: z.array(subtitleSchema),
}).superRefine((doc, ctx) => {
  // ① assetId 外键
  const assetIds = new Set(doc.assets.map(a => a.id))
  for (const clip of doc.clips) {
    if (!assetIds.has(clip.assetId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clips', clip.id, 'assetId'],
        message: `dangling assetId: ${clip.assetId}`,
      })
    }
  }

  // ② clip ID 唯一
  const clipIds = new Set<string>()
  for (const clip of doc.clips) {
    if (clipIds.has(clip.id)) {
      ctx.addIssue({ /* duplicate id */ })
    }
    clipIds.add(clip.id)
  }

  // ③ 同轨 clip 时间不重叠
  const byTrack = groupBy(doc.clips, c => c.trackId)
  for (const [trackId, clips] of byTrack) {
    const sorted = [...clips].sort((a, b) => a.start - b.start)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      if (prev.start + prev.duration > cur.start) {
        ctx.addIssue({ /* overlap */ })
      }
    }
  }

  // ④ 轨道 order 单调
  // ⑤ exportSettings 引用的 assetId 都在 assets 里
  // ...
})
```

superRefine 是 Zod 的杀手锏——它能在 `schema` 内部表达任意跨字段约束，并把所有违规一次性收集成 `issue` 数组。比手写 `if/throw` 强的地方：

- 多个错误一次性返回，前端可批量提示。
- issue 带 `path`，能精确定位到 `clips[3].assetId`，前端高亮具体字段。
- schema 本身就是文档，新人看一眼就知道约束全集。

## Result：错误也是契约的一部分 ##

校验失败不能只是"throw"，要把错误*建模成数据*：

```ts
type Success<T> = { ok: true; data: T }
type Failure = { ok: false; error: AppError }
type Result<T> = Success<T> | Failure

type AppError =
  | { code: 'IPC_REQUEST_INVALID'; issues: z.ZodIssue[] }
  | { code: 'POST_PATCH_INVALID'; issues: z.ZodIssue[] }
  | { code: 'DOC_INVARIANT_INVALID'; issues: z.ZodIssue[] }
  | { code: 'FILE_NOT_FOUND'; path: string }
  | { code: 'PERMISSION_DENIED'; path: string }
  | { code: 'UNKNOWN'; message: string }
```

这是判别联合（Discriminated Union），`ok` 是判别字段。前端 switch 一下 `result.error.code` 就能精确分流错误处理。比 `throw` 优势：

- IPC 序列化不丢信息（Error 对象过 IPC 只剩 message）。
- TS 编译器强制你处理所有 error code（exhaustive switch）。
- 单元测试直接断言 `expect(result).toEqual({ ok: false, error: { code: '...' } })`，不需要 `try/catch`。

*主进程封装*：

```ts
async function withContract<T>(
  req: unknown,
  reqSchema: z.ZodType<T>,
  fn: (parsed: T) => Promise<Result<unknown>>
): Promise<Result<unknown>> {
  try {
    const parsed = reqSchema.safeParse(req)
    if (!parsed.success) {
      return { ok: false, error: { code: 'IPC_REQUEST_INVALID', issues: parsed.error.issues } }
    }
    return await fn(parsed.data)
  } catch (e) {
    if (e instanceof PatchError) {
      return { ok: false, error: { code: 'POST_PATCH_INVALID', issues: e.issues } }
    }
    if (e instanceof DocInvariantError) {
      return { ok: false, error: { code: 'DOC_INVARIANT_INVALID', issues: e.issues } }
    }
    return { ok: false, error: { code: 'UNKNOWN', message: String(e) } }
  }
}
```

## 双 try/catch：永不 reject 的 IPC ##

Electron IPC 有个坑：如果 `ipcMain.handle` 的回调 throw 出去，调用方 `await ipcRenderer.invoke` 拿到的是 rejected promise，错误信息只剩 `Error invoking remote method 'foo': Error: <message>`，堆栈和自定义字段全丢。更糟的是渲染进程如果没 catch，会触发 `unhandledrejection`。

工程实践：*主进程永远不 reject，永远返回 Result*：

```ts
ipcMain.handle('timeline:addClip', async (event, raw) => {
  try {
    return await withContract(raw, addClipRequestSchema, async ({ channelId, clip }) => {
      try {
        const next = applyTimelinePatch(currentDoc, { type: 'addClip', channelId, clip })
        await persistDocument(next)
        currentDoc = next
        return { ok: true, data: next }
      } catch (e) {
        // Layer 2/3 失败
        if (e instanceof PatchError) throw e
        return { ok: false, error: { code: 'UNKNOWN', message: String(e) } }
      }
    })
  } catch (e) {
    // 最后一道防线：理论上不会到这
    return { ok: false, error: { code: 'UNKNOWN', message: String(e) } }
  }
})
```

外层 try 兜底，内层 try 分流业务错误。即便 withContract 内部意外 throw，外层也不会让 promise reject。前端永远拿到一个 Result 对象，错误处理路径单一。

## 契约即文档 ##

当 schema 成为单一真相源，所有衍生品都可以自动生成：

- TypeScript 类型：`z.infer<typeof projectDocumentSchema>` 一行搞定。
- JSON Schema：`zod-to-json-schema` 转出来，给非 TS 端（如插件作者）使用。
- OpenAPI：如果未来暴露 HTTP API，schema 直接当 OpenAPI definitions。
- 前端表单：`react-hook-form` + `zodResolver` 复用同一份 schema，前端校验和后端校验逻辑永远一致。
- 测试 fixture：`schema.parse({})` 配合 `.default()` 一键生成合法最小 document。

这是契约层最大的杠杆——*改一处 schema，所有层自动跟进*，再也不会出现"前端校验过了、后端崩了"的尴尬。

## 性能考量 ##

`superRefine` 是 O(n²) 级别的（外键扫描 + 重叠检测），大 document（1000+ clip）跑一次可能要几十毫秒。优化策略：

- 分层校验频率：Layer 1 每次 IPC 都跑；Layer 2 仅在持久化前跑；Layer 3 仅在用户主动保存或导出前跑。
- 增量校验：用 immer 的 recipe 拿到 patches，只校验受影响的 clip，而非整份 document。
- 缓存索引：把 `Set<assetId>`、`Map<clipId, clip>` 缓存在闭包里，每次校验增量维护。
- Web Worker：把校验搬到 worker 线程，主线程不卡。

但记住：正确性优先于性能。O(n²) 在 n=1000 时也就几毫秒，远低于 IPC 序列化开销，过早优化是万恶之源。

## 小结 ##

把 Zod 当"运行时类型系统"用，而不是"表单校验库"，它能彻底改变 Electron 应用的工程质量：

- 三层防御：IPC 入参 → 单步 op → 完整 document，每层职责清晰。
- superRefine：把跨字段约束从散落的 if 提炼成 schema 的一部分，带 path 的 issue 让调试和生产报错都精准定位。
- Result：错误建模成数据，IPC 边界永不 reject，前端错误处理单一。
- 契约即文档：一份 schema 同时驱动类型、校验、表单、JSON Schema，单一真相源。

代价是学习曲线和少量运行时开销。但对一个要读写本地文件、要支持多版本 document 演进的桌面应用来说，这点投入换来的稳定性是值得的——毕竟用户最痛的不是"功能少"，而是"我保存了为什么打不开"。
