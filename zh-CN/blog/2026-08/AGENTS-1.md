---
lastUpdated: true
commentabled: true
recommended: true
title: ⚡AGENTS.md 详解
description: AI 代理的行为规范文档
date: 2026-08-03 09:15:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

> AGENTS.md 是专为大语言模型（LLM）代理设计的项目文档，补充 README.md 的人类导向视角，为 AI 提供项目架构、代码规范、工具链和操作上下文的机器可读指南。

## 什么是 AGENTS.md ##

AGENTS.md 起源于 Anthropic 的 Claude Agent 项目实践，是一种新兴的 AI 可读文档格式。它不是 README 的替代品，而是*补充层*——README 回答"这个项目是什么、怎么用"，AGENTS.md 回答"AI 代理应该如何理解、操作和维护这个项目"。

与 README 相比，AGENTS.md 包含：

- 项目架构和模块关系
- 代码组织结构和命名约定
- 可用的构建脚本和命令
- 依赖管理和版本约束
- 测试策略和运行方式
- CI/CD 流程和部署规范
- 敏感操作的安全边界

## 它解决了什么问题 ##

当前 AI 编码助手面临一个核心矛盾：*上下文窗口有限，而项目知识近乎无限*。

当你在一个 50 万行的代码库中使用 AI 代理时，即使提供完整的 README，代理仍然会：

- 误解代码结构 — 无法区分核心模块和辅助工具
- 误用工具链 — 不清楚某个脚本的副作用或前置条件
- 产生不安全操作 — 删除生产代码、执行危险命令
- 给出过时建议 — 不了解最近的架构变更或废弃约定

AGENTS.md 通过在项目根目录提供*结构化的 AI 上下文*，让代理在执行任何操作前先"读懂规则"。

### 对比示例 ###

没有 AGENTS.md 时，AI 可能这样理解项目：

> "看起来是个 Node.js 项目，有 src 文件夹和 tests 文件夹，应该可以直接运行 npm test。"

有了 AGENTS.md，AI 理解的是：

> "这是一个 monorepo，使用 pnpm workspaces 管理。`src/api` 是核心入口，`tests/` 目录使用 Vitest。不要直接运行 npm test——需要先运行 `pnpm generate` 生成类型定义，否则测试会因类型错误失败。"

## 实际使用场景 ##

### 场景一：新开发者/代理 onboarding ###

当新的 AI 代理被引入项目时，AGENTS.md 是它的"入职培训材料"：

```markdown
# Getting Started (for AI Agents)

## 项目结构
- `packages/core` — 核心业务逻辑，无外部依赖
- `packages/api` — REST API 层，依赖 core
- `packages/cli` — 命令行工具，依赖 core 和 api

## 启动顺序
开发模式必须按这个顺序启动：
1. `pnpm run dev:core` — 启动核心模块的 watch 模式
2. `pnpm run dev:api` — 启动 API（会等待 core 就绪）
3. `pnpm run dev:cli` — CLI 工具

## 禁止操作
- 不要修改 `packages/core/src/internal/` 目录
- 不要直接提交到 main 分支
- 不要在没有运行 `pnpm lint` 的情况下推送代码
```

### 场景二：自动化重构和迁移 ###

AI 代理在执行大规模代码重构时，AGENTS.md 提供安全边界：

```markdown
## 重构约束

### 可以安全修改
- 变量和函数命名
- 文件内部实现
- 测试文件

### 需要人工审批
- 修改 `src/config/` 下的配置
- 变更任何 API 接口签名
- 修改数据库迁移文件

### 危险操作（需要 --dry-run）
- 删除非 tests/ 目录的 .ts 文件
- 修改任何 .env 文件
- 运行 `pnpm db:reset`
```

### 场景三：多代理协作 ###

当多个 AI 代理协同工作时，AGENTS.md 作为"通信协议"：

```markdown
## 代理职责边界

- `architect-agent` — 只读，负责设计决策和架构图
- `coder-agent` — 修改 src/，禁止修改 docs/
- `review-agent` — 运行测试和 lint，发布 review 意见
- `deploy-agent` — 只读配置，执行 `pnpm deploy --dry-run`

## 共享状态
代理间通过 `docs/agent-state.md` 共享当前进度。
每次操作前必须读取最新状态。
```

## 如何在项目中创建 AGENTS.md ##

### 基础模板 ###

```markdown
# AGENTS.md — AI Agent Handbook

> 本文档供 AI 代理阅读。人类请查阅 README.md。

## 项目概述
[2-3 句话说明项目是什么]

## 快速命令
| 命令 | 作用 | 危险级别 |
|------|------|----------|
| pnpm dev | 开发服务器 | 安全 |
| pnpm build | 生产构建 | 安全 |
| pnpm test | 运行测试 | 安全 |
| pnpm db:reset | 重置数据库 | ⚠️ 危险 |

## 架构
[模块关系图或文字描述]

## 约定
- 代码风格：ESLint + Prettier（自动格式化）
- 分支策略：feature/* → develop → main
- 提交规范：conventional commits

## 约束
[AI 代理必须遵守的规则]

## 工具链
[每个工具的用途和重要提示]
```

### 最佳实践 ###

1. 与 README 保持一致

AGENTS.md 是 README 的补充，不是替代。如果两者冲突，README 优先（因为人类读者更多）。

2. 使用机器友好的格式

- 表格比段落更易于解析
- 明确标注危险操作
- 提供具体命令而非抽象描述

3. 定期更新

每次架构变更或工具链调整时，同步更新 AGENTS.md。建议在 PR 模板中加入 AGENTS.md 更新检查项。

4. 添加版本约束

```markdown
<!-- AGENTS.md v1.0 | 兼容 Claude 3.5+ | 更新于 2026-04-02 -->
```

## 局限性和权衡 ##

AGENTS.md 并非万能药：

| 局限性 | 说明 |
| :--- | :--- |
| 需要维护成本 | 文档可能与代码脱节 |
| 不适合小型项目 | 50 行代码的项目不需要 AGENTS.md |
| 代理不一定遵守 | 格式规范，不保证执行 |
| 没有强制力 | 只能引导，不能强制 AI 行为 |

*何时使用*：中大型代码库（> 10k 行）、多代理协作项目、需要严格安全边界的生产环境。

何时不用：简单脚本、个人项目、快速原型。

## 结论 ##

AGENTS.md 填补了 AI 代理与人类项目维护者之间的上下文鸿沟。它不追求替代人类的架构决策，而是让 AI 代理在执行操作前理解*项目的规则和边界*。

随着 AI 编码助手逐渐成为开发流程的核心，类似 AGENTS.md 的规范文档将成为团队与 AI 协作的基础设施。
