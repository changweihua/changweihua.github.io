---
lastUpdated: true
commentabled: true
recommended: true
title: Vite 开发环境下实现 YAML 配置热更新方案
description: Vite 开发环境下实现 YAML 配置热更新方案
date: 2026-01-30 09:10:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

## 前言 ##

在现代前端开发中，配置管理是一个关键环节。传统上，我们使用 `.env` 文件来管理环境变量，但 YAML 文件由于其结构清晰、支持嵌套等优势，在一些大型项目中成为更好的选择。然而，Vite 默认只支持 `.env` 文件的热更新，当使用 YAML 配置文件时，如何实现修改后立即生效成为一个挑战。

本文将介绍一种在 Vite 开发环境下实现 YAML 配置热更新的完整解决方案，该方案通过创建自定义插件，结合全局变量和 HMR 机制，实现了配置的实时同步更新。

## 一、问题分析 ##

### 传统方案的不足 ###

通常，开发者在 Vite 项目中处理配置有几种方式：

- 使用 `.env` 文件： Vite 内置支持，但缺乏复杂结构支持
- 构建时注入： 配置在构建时确定，开发环境无法动态修改
- 运行时异步加载： 存在异步时序问题，可能导致页面初始化时配置未就绪

### 核心挑战 ###

要实现 YAML 配置的热更新，需要解决：

- 同步加载： 确保应用启动时配置立即可用
- 实时更新： 修改配置文件后能立即反映到应用中
- 开发友好： 不增加开发负担，无感知使用

## 二、技术方案设计 ##

### 整体架构 ###

```markdown
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   YAML文件修改  │───▶│ Vite插件监听变化│───▶│ 同步加载新配置  │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌────────▼────────┐
│  页面配置更新   │◀───│  触发HMR更新    │◀───│ 更新全局变量    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 关键组件 ###

- **同步配置插件**：负责加载 YAML 配置并注入到全局
- **全局配置存储**：提供同步访问的配置对象
- **HMR 事件系统**：实现配置更新的实时通知

### 具体实现 ###

同步配置插件：

```typescript:vite.plugin.yaml-sync.ts
export function viteYamlSync(): Plugin {
  const envDir = resolve(process.cwd(), 'scripts/env.config')
  
  // 同步加载配置函数
  const loadYamlConfigSync = (mode: string = '') => {
    const config = { ...baseConfig, ...overrideConfig }
    return config
  }

  return {
    name: 'vite-yaml-sync',
    
    config(config, env) {
      if (env?.command === 'serve') {
        const yamlConfig = loadYamlConfigSync(env.mode)
        
        // 注入到 Vite define
        return {
          define: {
            'import.meta.env.preferences': 'window.__DEV_CONFIG__',
          }
        }
      }
    },
    
    configureServer(server) {
      // 监听文件变化
      server.watcher.on('change', (file) => {
        if (file.endsWith('.yaml')) {
          const newConfig = loadYamlConfigSync(server.config.mode)
          
          // 更新全局变量
          if (globalThis._PRODUCTION_CONF_) {
            Object.assign(globalThis._PRODUCTION_CONF_, newConfig)
          }
          
          // 发送 HMR 事件
          server.ws.send({
            type: 'custom',
            event: 'yaml-config-changed',
            data: newConfig
          })
        }
      })
    },
  }
}
```

### 配置管理模块 ###

```typescript:config.ts
const initConfig = () => {
  const configManager = getGlobalConfigManager({
    mountToWindow: true,
    freezeConfig: false, // 开发环境不冻结
  })

  let config: Record<string, any> = {}
  
  if (import.meta.env.DEV) {
    // 开发环境从全局变量获取
    config = window.__DEV_CONFIG__ || {}
    
    // 监听配置更新事件
    if (import.meta.hot) {
      import.meta.hot.on('yaml-config-changed', (newConfig) => {
        Object.assign(config, newConfig)
        configManager.init(config)
        window._PRODUCTION_CONF_ = config
        
        // 触发自定义事件，通知应用其他部分
        window.dispatchEvent(new CustomEvent('config-updated', { 
          detail: config 
        }))
      })
    }
  }
  
  return config
}
```

### Vite 配置集成 ###

```typescript:vite.config.ts
export default defineConfig((env: ConfigEnv) => {
  const isBuild = env.command === 'build'
  
  return {
    plugins: [
      // ... 其他插件
      !isBuild && viteYamlSync(),
    ],
    server: {
      watch: {
        ignored: ['!**/scripts/env.config/**'] // 确保监听配置目录
      },
    },
  }
})
```

## 核心机制解析 ##

### 同步加载机制 ###

本方案的关键在于同步加载配置，避免异步时序问题。通过以下方式实现：

```typescript
// 同步读取 YAML 文件
const content = readFileSync(filePath, 'utf-8')
const config = yaml.load(content)

// 立即挂载到全局
window.__DEV_CONFIG__ = config
```

### 热更新流程 ###

当 YAML 文件被修改时：

- **文件监听**： Vite 插件检测到文件变化
- **配置重载**： 同步读取并解析新的 YAML 内容
- **全局更新**： 将新配置合并到全局变量
- **事件触发**： 通过 WebSocket 发送 HMR 事件
- **应用响应**：前端接收事件，更新配置状态

### 应用集成 ###

在应用中使用配置非常简单：

```typescript
// 同步获取配置
const config = window._PRODUCTION_CONF_

// 或者使用辅助函数
const apiUrl = getConfig().VITE_BASE_API

// 监听配置更新
onConfigUpdate((newConfig) => {
  console.log('配置已更新:', newConfig)
  // 更新应用状态...
})
```

## 优势与特点 ##

### 零延迟启动 ###

配置在应用初始化时同步加载，确保启动时配置立即可用。

### 实时热更新 ###

修改 YAML 文件后，配置立即更新，无需重启开发服务器。

### 开发友好 ###

- 无需特殊构建步骤
- 配置修改立即生效
- 支持复杂嵌套结构

### 生产安全 ###

生产环境仍使用构建时确定的配置，保证一致性。

### 向后兼容 ###

不破坏现有配置访问方式，可平滑迁移。

## 实际应用场景 ##

### 场景一：API 地址切换 ###

修改 VITE_BASE_API 配置，立即测试不同环境的接口。

### 场景二：功能开关 ###

通过修改 VITE_IS_ENCEYPT 等开关配置，实时测试不同功能状态。

### 场景三：样式配置 ###

配置主题色、布局参数等，实现实时预览。

## 扩展可能性 ##

### 配置验证 ###

可以集成 JSON Schema 验证配置格式。

### 多环境管理 ###

支持更复杂的环境配置覆盖逻辑。

### UI 配置界面 ###

开发配置管理界面，可视化修改配置。

### 历史记录 ###

记录配置变更历史，支持回滚。

## 总结 ##

本文提出的 Vite YAML 配置热更新方案，通过巧妙的同步加载和全局变量管理，实现了开发环境下的配置实时更新。相比传统方案，它具有以下优势：

- **即时生效**：配置修改无需重启

- **简单易用**：与现有代码无缝集成

- **开发高效**：提升开发调试效率

- **稳定可靠**：生产构建不受影响

该方案已在多个大型项目中验证，能够显著提升开发体验，是管理复杂项目配置的理想选择。
