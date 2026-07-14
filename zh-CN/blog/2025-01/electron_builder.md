---
lastUpdated: true
commentabled: true
recommended: true
title: Electron electron-builder.yml 环境变量
description: Electron electron-builder.yml 环境变量
date: 2025-01-15 11:18:00
pageClass: blog-page-class
---

# Electron electron-builder.yml 环境变量 #

确保项目里面有.env.production，.env.staging环境变量文件

## electron-builder.template.yml ##

拷贝一份 `electron-builder.yml` 命名为 `electron-builder.template.yml`

检测更新 url 这样写

```yml
publish:
  provider: generic
  url: ${VITE_APP_UPDATE_CHECK_URL}
```

## prebuild.mjs ##

新建一个脚本文件 prebuild.mjs

```js
import fs from 'fs'
import dotenv from 'dotenv'

// 根据环境变量决定加载哪个环境文件
let envPath
switch (process.env.NODE_ENV) {
  case 'staging':
    envPath = '.env.staging'
    break
  default:
    envPath = '.env.production'
    break
}

dotenv.config({ path: envPath })

// console.log('环境变量:', process.env)

const viteUpdateCheckUrl = process.env.VITE_APP_UPDATE_CHECK_URL

console.log('🚢 ~ 当前打印的内容 ~ viteUpdateCheckUrl:', viteUpdateCheckUrl)

if (!viteUpdateCheckUrl) {
  throw new Error('环境变量 VITE_APP_UPDATE_CHECK_URL 未定义')
}

const templatePath = 'electron-builder.template.yml'
console.log('正在读取模板文件:', templatePath)

const template = fs.readFileSync(templatePath, 'utf8')
// console.log('模板内容:', template)

const config = template.replace(/${VITE_APP_UPDATE_CHECK_URL}/g, viteUpdateCheckUrl)

// console.log('配置内容:', config)

fs.writeFileSync('electron-builder.yml', config)
console.log('已写入配置文件到 electron-builder.yml')
```

## 安装cross-env库 ##

```bash
npm install cross-env -D 
```

## package.json 的配置 ##

```json
"scripts": {
  "format": "prettier --write .",
  "lint": "eslint . --ext .js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts,.vue --fix",
  "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
  "typecheck:web": "vue-tsc --noEmit -p tsconfig.web.json --composite false",
  "typecheck": "npm run typecheck:node && npm run typecheck:web",
  "prebuild": "node prebuild.mjs",
  "start": "electron-vite preview",
  "dev": "electron-vite dev",
  "build": "electron-vite build",
  "postinstall": "electron-builder install-app-deps",
  "build:unpack": "npm run build && electron-builder --dir",
  "build:win": "cross-env NODE_ENV=production npm run prebuild && npm run build && electron-builder --win",
  "build:mac": "npm run build && electron-builder --mac",
  "build:linux": "npm run build && electron-builder --linux",
  "build:win:staging": "cross-env NODE_ENV=staging npm run prebuild && npm run staging && electron-builder --win",
  "staging": "electron-vite build --mode staging"
}
```
