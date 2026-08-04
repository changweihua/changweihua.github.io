---
lastUpdated: true
commentabled: true
recommended: true
tags: ["wechat", "npm"]
title: 严格模式下获取方法调用信息
description: 严格模式下获取方法调用信息
poster: /images/cmono-Siesta.png
date: 2023-08
---

## 背景 ##

原创小程序默认使用严格模式，导致无法使用caller,callee,arguments相关属性和方法。

如何获取调用者信息，成为了头疼大事。

## 示例代码 ##

```typescript
//use strict disabled;
import _ from "underscore"
import { getEmoji } from "./console-emojis"
import { appConfig } from "~/utils/app.config";
import WechatLogger from "./wechat-logger";

console.log = appConfig.mode !== 'production' ? console.log : () => { };

const getCall = () => {
  let callArr = new Error().stack?.split("\n");
  if (callArr) {
    callArr.splice(0, 3);
    const pattern = /at (\w+)/;
    const result = callArr.map(it => {
      const res = it.match(pattern)
      // console.log(res)
      if (res) {
        const fileSource = res['input']
        const leftSource = fileSource?.slice(fileSource.indexOf('/appservice/') + 11)
        const source = leftSource?.slice(0, leftSource.indexOf(':'))
        return `Invoked from ${source} at ${res[1]}`
      }
      return ''
    }).join()
    return result
  }
  return '';
}

const labelStyle = `border: 1px solid ${appConfig.brand.color};background: ${appConfig.brand.color};color: #fff;padding: 5px 10px;border-radius: 5px 0 0 5px;`
const valueStyle = `border: 1px solid ${appConfig.brand.color};color: ${appConfig.brand.color};padding: 5px 10px;border-radius: 0 5px 5px 0;`

export {
  labelStyle,
  valueStyle
}

export default class Logger {
  private wechatLogger = new WechatLogger()

  // 只允许在内部实例化
  private constructor() {

  }
  // 是否实例的标志
  private static instance: Logger | null = null

  public platform = 'devtools'

  public showRealtime = false

  private makeContent(...args: any[]) {
    const contents = []
    contents.push(args[0].map((arg: any) => {
      if (_.isObject(arg)) {
        return JSON.stringify(arg)
      }
      return arg
    }))
    return contents.join(' ')
  }

  public debug(...args: any[]) {
    console.log(getCall())
    // if (arguments.callee) {
    //   console.log(arguments.callee)
    // }
    if (this.platform === "devtools") {
      console.log(`%c${getEmoji(appConfig.log.debug.emoji)}%c%s`, `border: 1px solid ${appConfig.log.debug.color};background: ${appConfig.log.debug.color};color: #fff;padding: 5px 10px;border-radius: 5px 0 0 5px;`, `border: 1px solid ${appConfig.log.debug.color};color: ${appConfig.log.debug.color};padding: 5px 10px;border-radius: 0 5px 5px 0;`, this.makeContent(args))
    } else {
      console.log(`%c${getEmoji(appConfig.log.debug.emoji)} %s`, `color: ${appConfig.log.debug.color}; font-size: 12px`, this.makeContent(args))
    }
  }

  public info(...args: any[]) {
    console.log(getCall())
    if (this.platform === "devtools") {
      console.log(`%c${getEmoji(appConfig.log.info.emoji)}%c%s`, `border: 1px solid ${appConfig.log.info.color};background: ${appConfig.log.info.color};color: #fff;padding: 5px 10px;border-radius: 5px 0 0 5px;`, `border: 1px solid ${appConfig.log.info.color};color: ${appConfig.log.info.color};padding: 5px 10px;border-radius: 0 5px 5px 0;`, this.makeContent(args))
    } else {
      console.log(`%c${getEmoji(appConfig.log.info.emoji)} %s`, `color: ${appConfig.log.info.color}; font-size: 12px`, this.makeContent(args))
    }
  }

  public warn(...args: any[]) {
    console.log(getCall())
    if (this.platform === "devtools") {
      console.log(`%c${getEmoji(appConfig.log.warn.emoji)}%c%s`, `border: 1px solid ${appConfig.log.warn.color};background: ${appConfig.log.warn.color};color: #fff;padding: 5px 10px;border-radius: 5px 0 0 5px;`, `border: 1px solid ${appConfig.log.warn.color};color: ${appConfig.log.warn.color};padding: 5px 10px;border-radius: 0 5px 5px 0;`, this.makeContent(args))
    } else {
      console.log(`%c${getEmoji(appConfig.log.warn.emoji)} %s`, `color: ${appConfig.log.warn.color}; font-size: 12px`, this.makeContent(args))
    }
    if (this.showRealtime) {
      this.wechatLogger.warn({ info: this.makeContent(args), date: new Date() })
    }
  }

  public error(...args: any[]) {
    console.log(getCall())
    if (this.platform === "devtools") {
      console.log(`%c${getEmoji(appConfig.log.error.emoji)}%c%s`, `border: 1px solid ${appConfig.log.error.color};background: ${appConfig.log.error.color};color: #fff;padding: 5px 10px;border-radius: 5px 0 0 5px;`, `border: 1px solid ${appConfig.log.error.color};color: ${appConfig.log.error.color};padding: 5px 10px;border-radius: 0 5px 5px 0;`, this.makeContent(args))
    } else {
      console.log(`%c${getEmoji(appConfig.log.error.emoji)} %s`, `color: ${appConfig.log.error.color}; font-size: 12px`, this.makeContent(args))
    }
    if (this.showRealtime) {
      this.wechatLogger.error({ info: this.makeContent(args), date: new Date() })
    }
  }

  // 单例模式
  static getInstance() {
    // 判断系统是否已经有单例了
    if (Logger.instance === null) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }
}
```
