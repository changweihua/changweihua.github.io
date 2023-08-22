---
commentabled: true
recommended: false
title: 快速搭建微信小程序原生开发框架
description: 快速搭建微信小程序原生开发框架
poster: /images/cmono-20230704135551.png
---

# 快速搭建微信小程序原生开发框架 #

## 项目创建 ##

使用微信开发者工具，创建项目，选择 typescript + less 模板。

![项目创建](/images/cmono-20230704135551.png){data-zoomable}

## 引入全局 NPM 包 ##

```json
{
  "name": "air_ground",
  "version": "0.2.0",
  "description": "",
  "scripts": {
    "commit": "git add . && git-cz",
    "release": "release-it",
    "upload": "node upload.js",
    "unocss": "unocss pages/**/*.wxml -c unocss.config.js --watch -o miniprogram/unocss.less",
    "unocss:build": "unocss pages/**/*.wxml -c unocss.config.js -o miniprogram/unocss.less"
  },
  "type": "module",
  "keywords": [
  ],
  "author": "常伟华 (https://github.com/changweihua)",
  "license": "",
  "dependencies": {
    "@types/crypto-js": "^4.1.1",
    "axios-miniprogram": "^2.5.0",
    "blue-perform-storage": "^1.0.3",
    "console-emojis": "^2.0.1",
    "crypto-js": "^4.1.1",
    "dayjs": "^1.11.9",
    "error-stack-parser": "^2.1.4",
    "event-emitter-for-miniprogram": "^3.0.107",
    "execa": "^7.1.1",
    "miniprogram-i18n-plus": "^0.3.0",
    "miniprogram-pageoptions": "^0.2.1",
    "miniprogram-ripple": "^1.0.3",
    "miniprogram-turbo-setdata": "^1.0.5",
    "miniprogram-validator": "^1.0.0",
    "mp-html": "^2.4.2",
    "qrcode-base64-size": "^1.0.2",
    "tdesign-miniprogram": "^1.1.10",
    "underscore": "^1.13.6",
    "weapp-svg-icon": "^1.0.0",
    "wl-pinyin": "^1.0.1",
    "wx-datetime-picker": "^1.1.0",
    "wx-lifecycle-interceptor": "^0.0.5",
    "wx-pin-prompt": "^1.3.6"
  },
  "devDependencies": {
    "@release-it/conventional-changelog": "^5.1.1",
    "@types/underscore": "^1.11.5",
    "git-cz": "^4.9.0",
    "miniprogram-api-typings": "^3.10.0",
    "miniprogram-ci": "^1.9.8",
    "release-it": "^15.11.0",
    "unocss": "^0.53.4",
    "unocss-preset-weapp": "^0.53.5"
  }
}
```

## 模块简介 ##

