---
outline: false
aside: false
layout: doc
date: 2025-04
title: yalc 使用
description: yalc 使用
category: 工具
pageClass: manual-page-class
---

### **为何选择 Yalc 替代 npm link？**

`npm link` 在本地开发中常用于调试 npm 包或组件库，但其通过符号链接（symlink）的方式存在以下问题：

1. **路径解析错误**：Webpack 等工具可能因符号链接无法正确识别依赖路径，导致构建失败或运行时错误。
2. **依赖冲突**：若本地包与项目依赖的版本不同，`node_modules` 中可能出现多实例冲突。
3. **无热更新支持**：修改本地包后需手动重新构建并重新链接，效率低。

**Yalc 的优势**：

• **模拟真实发包流程**：将本地包发布到全局 `.yalc` 仓库，通过 `file:.yalc/...` 引用，避免符号链接问题。
• **依赖一致性**：自动生成 `yalc.lock` 锁定版本，确保环境稳定。
• **支持热更新**：配合 `nodemon` 可实现代码修改后自动重建并推送更新。


### **Yalc 核心使用步骤**

以下为完整工作流，涵盖本地包开发、发布、更新与清理：

#### **1. 安装 Yalc**

全局安装工具链：

```bash
npm install yalc -g  # 或 yarn global add yalc
```

#### **2. 本地包开发与发布**

在 **本地包目录**（如组件库）中执行：

```bash
npm run build && yalc publish  # 构建后发布到本地仓库
```

**可选参数**：

• `--no-scripts`：跳过 npm 生命周期脚本（如 `prepublish`）。
• `--push` 或 `yalc push`：发布后立即推送更新到所有关联项目。

#### **3. 项目中引用本地包**

在 **业务项目目录** 中添加依赖：

```bash
yalc add your-package  # 自动修改 package.json 和 yalc.lock
npm install  # 安装本地包的子依赖
```

**参数说明**：  
• `--link`：创建软链接模式，适合频繁调试（类似 `npm link` 但更稳定）。  
• `--dev`：将依赖添加到 `devDependencies`。  

#### **4. 更新本地包并同步**

修改本地包代码后，重新发布并推送：

```bash
# 本地包目录
npm run build && yalc publish --push

# 或手动推送
yalc push  # 快速更新所有关联项目
```

在业务项目中可通过 `yalc update` 单独更新指定包。

#### **5. 清理本地包**

调试完成后，移除依赖：

```bash
yalc remove your-package  # 移除单个包
yalc remove --all  # 清理所有 yalc 依赖
```

同时删除项目中的 `.yalc` 目录和 `yalc.lock` 文件。

### **高级技巧：热更新集成**

结合 `nodemon` 实现代码修改自动重建并推送：

1. **安装 `nodemon`**：

   ```bash
   npm install nodemon -g
   ```
2. **配置监听脚本**（本地包的 `package.json`）：
   
   ```json
   "scripts": {
     "watch": "nodemon --ignore dist/ --watch src/ -e ts,js,less --exec \"npm run build && yalc push\""
   }
   ```

3. 运行 `npm run watch`，修改代码后将自动触发构建并推送更新。

### **注意事项**

1. **版本号管理**：每次发布建议递增版本号，避免 Webpack 缓存旧版本（可通过 `yalc add your-package@1.0.1` 锁定版本）。
2. **Git 忽略**：将 `.yalc` 和 `yalc.lock` 加入 `.gitignore`，避免误提交本地调试配置。
3. **依赖完整性**：`yalc add` 后需执行 `npm install` 安装本地包的子依赖。


### **对比 npm link 与 Yalc**  

| **特性**               | **npm link** | **Yalc**          |  
|------------------------|--------------|-------------------|  
| **路径解析**           | 符号链接易出错 | 真实文件复制      |  
| **依赖冲突**           | 常见         | 自动隔离          |  
| **热更新支持**         | 需手动操作   | 结合 `nodemon` 自动化 |  
| **版本控制**           | 无           | 支持锁定 (`yalc.lock`) |  
| **清理复杂度**         | 简单         | 需手动移除多文件  |  

---

通过 Yalc 的本地仓库机制，开发者能更稳定地调试依赖，尤其适用于复杂组件库或多包协作场景。其流程虽稍繁琐，但显著提升了开发体验与构建可靠性。
