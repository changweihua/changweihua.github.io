---
lastUpdated: true
commentabled: true
recommended: true
title: 不同 AI Agent 共用同一套 Skills
description: 不同 AI Agent 共用同一套 Skills
date: 2026-09-01 09:15:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

不同 AI Agent 支持的 Skills 目录并不完全相同。下面以几款 Agent 为例：

| Agent | 项目级目录 | 用户级目录 |
| :--- | :--- | :--- |
| Claude Code | `.claude/skills` | `~/.claude/skills` |
| Codex | `.agents/skills, .codex/skills` | `~/.agents/skills, ~/.codex/skills` |
| Cursor | `.agents/skills, .cursor/skills` | `~/.agents/skills, ~/.cursor/skills` |
| Gemini CLI | `.agents/skills, .gemini/skills` | `~/.agents/skills, ~/.gemini/skills` |

项目级和用户级 Skill 的共用思路相同，区别在生效范围：用户级 Skill 可以在本机的所有项目中使用；项目级 Skill 只对当前项目生效，也可以随项目提交到仓库。

> 下文以用户级目录为主。 项目级 Skill 使用表格中的项目级目录。

如果分别安装到每款 Agent 的目录中，同一个 Skill 会留下多份。刚安装时看不出区别，之后修改或从原仓库更新时，很容易漏掉其中一份，导致各个 Agent 使用不同版本。

把共用 Skill 放在 `~/.agents/skills`。上表中，Codex、Cursor 和 Gemini CLI 可以直接读取，Claude Code 通过符号链接接入。这样只保留一份，修改和更新也只处理这一处。

使用其他 Agent 时，先确认它支持的 Skills 目录。能够读取 `~/.agents/skills` 就直接使用；不能读取，再把共用 Skill 链接到它支持的目录。

## 共用 Skill 放在 `~/.agents/skills` ##

Agent Skills 规范规定 Skill 本身如何组织，不规定它必须存放在哪个目录。本文列举的 Codex、Cursor 和 Gemini CLI 都能从 `~/.agents/skills` 读取用户级 Skill，所以这里把它作为共用目录。


假设当前有三个共用 Skill：

```txt
~/.agents/skills/
├── frontend-design/
├── humanizer/
└── pdf/
```

## 以 Claude Code 为例创建符号链接 ##

> 下面的命令适用于 macOS 和 Linux。Windows 也支持符号链接，但需要使用 `PowerShell` 或 `mklink` 创建。

Claude Code 默认从 `~/.claude/skills` 读取用户级 Skill。先确保这个目录存在：

```bash
mkdir -p ~/.claude/skills
```

再为需要共用的 Skill 创建符号链接：

```bash
ln -s ~/.agents/skills/frontend-design ~/.claude/skills/frontend-design
ln -s ~/.agents/skills/humanizer ~/.claude/skills/humanizer
ln -s ~/.agents/skills/pdf ~/.claude/skills/pdf
```

上面的 `~` 会被 Shell 展开为用户目录，因此创建的是绝对路径链接，适合用户级 Skill。项目级 Skill 建议使用相对路径，避免项目换目录或被其他人克隆后链接失效。

例如，在项目根目录执行下面的命令，先创建 Claude Code 的项目级 Skills 目录，再为 pdf Skill 创建符号链接：

```bash
mkdir -p .claude/skills
ln -s ../../.agents/skills/pdf .claude/skills/pdf
```

目标路径 `../../.agents/skills/pdf` 是相对于符号链接所在的 `.claude/skills` 目录计算的。

用户级目录最终如下：

```txt
~/.agents/skills/
├── frontend-design/
├── humanizer/
└── pdf/

~/.claude/skills/
├── frontend-design -> ~/.agents/skills/frontend-design
├── humanizer       -> ~/.agents/skills/humanizer
└── pdf             -> ~/.agents/skills/pdf
```

按单个 Skill 创建链接后，`~/.claude/skills` 仍然可以存放 Claude Code 专属 Skill。

如果 `~/.claude/skills` 中已经有同名 Skill，需要先合并或移走原目录，否则 `ln -s` 会失败。

> 使用 `skills.sh` 网站提供的命令安装第三方 Skill 时，可以选择多个 Agent 和 Symlink 模式。安装工具会保留一份 Skill，并为所选 Agent 创建符号链接，不用手动执行上面的命令。

## 修改和更新只处理共用目录 ##

无论修改自己编写的 Skill，还是更新第三方 Skill，都只处理 `~/.agents/skills/<skill-name>` 中的版本。只要目录名和位置不变，符号链接不需要重建。

不要再把 Skill 复制到各个 Agent 的目录，否则又会出现多个版本，后续仍要分别维护。

## 怎么确认 Skill 已经生效 ##

新开一个会话，明确要求 Agent 使用刚接入的 Skill 完成一个简单任务。如果输出符合 SKILL.md 中的要求，就说明已经生效。
通过符号链接接入的 Agent 如果找不到 Skill，检查链接是否指向 `~/.agents/skills/<skill-name>`。

## 共用 Skill 有哪些限制 ##

共用同一份 Skill，不代表每款 Agent 的处理方式完全相同。标准字段和 Markdown 指令通常可以复用，扩展字段未必通用。例如，Claude Code 的 `user-invocable: false` 会禁止用户通过 `/skill-name` 手动调用，但 Claude 仍然可以自动调用。这个字段不属于 Agent Skills 规范，其他 Agent 不一定识别。

准备跨 Agent 共用的 Skill 时，核心流程不要依赖某款 Agent 的扩展字段。共用目录和 Agent 专属目录也应避免出现同名 Skill，因为不同 Agent 对重名 Skill 的处理方式并不一致。

Skill 中的脚本仍然依赖运行环境。同一个脚本能否执行，取决于 Agent 所在环境是否具备所需的 Python、Node.js、命令行工具和权限。
有些 Agent 会在远程服务器中执行任务，无法读取你电脑上的 `~/.agents/skills`。这时需要在远程环境中重新安装 Skill，或者使用项目级 Skill 并提交到仓库。
