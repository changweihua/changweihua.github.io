---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序 WebView 与 Vue H5 实时通讯实战指南
description: 微信小程序 WebView 与 Vue H5 实时通讯实战指南 
date: 2025-08-08 14:45:00 
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

最近实现一个功能需要在小程序嵌入其它系统内部的一个页面（用vue写的H5页面），但小程序是无法使用iframe的，所以最终选择小程序官方的webview实现。

## 参考文档 ##

[微信小程序如何主动与H5通信？](https://juejin.cn/post/7464998185485549631)

> 微信小程序里用 WebView 嵌入 Vue H5 页面，要实现双向实时通讯，确实容易踩坑，但完全可行！下面给你一个实战总结，帮你少走弯路。

## 背景 ##

- 小程序通过 `<web-view>` 组件嵌入外部 H5 页面（Vue 构建）。
- 需要实现：
  - H5 主动给小程序发送消息
  - 小程序给 H5 发送消息并接收响应

在 `app.json` 中配置 `WebView` 的合法域名。

```json:app.json
{
  "pages": [
    "pages/index/index",
    "pages/webview/webview"
  ],
  "webview": {
    "url": "https://example.com"
  },
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序的地理位置功能"
    }
  }
}
```

## 核心思路 ##

- 小程序 ↔ WebView 通讯依赖 `postMessage` 机制
- 小程序端监听 `<web-view>` 的 `bindmessage` 事件。
- H5 页面通过 `window.wx.miniProgram.postMessage()` 给小程序发送消息。
- 小程序通过 `webViewContext.postMessage()` 给 H5 页面发消息。

> 网页向小程序 `postMessage` 时，会在特定时机（小程序后退、组件销毁、分享）触发并收到消息。`e.detail = { data }`, `data` 是多次 `postMessage` 的参数组成的数组

> 注意：postMessage的data键名不能改，不然取不到数据。

> 微信小程序的webview中postMessage，会把信息（对象）提交到一个消息队列，而这个消息队列只会在特定的场景（组件销毁或分享）才会触发。不适合实时的数据传递，比较适合数据上报这种场景。使用时对这个消息队列（数组）遍历，最好对每一次postMessage的对象格式进行约定，以方便遍历时的批量处理。

## 环境准备 ##

- 需要 `企业主体App ID`，（个人的可以在开发工具详情中设置勾选 `不校验webView`，但仅在开发时）
- 经ICP备案，域名注册24小时以上
- https：域名的方式

### 配业务域名 ###

1. 首先要在开发管理-中配置业务域名
2. 配置业务域名的时候需要下载文件，把下载的文件放置在服务器中前端所在目录
3. 放完之后使用 `https：域名的方式/文件名.txt` 的方式尝试能否访问，如果页面能显示文件内容则成功

### 代码 ###

`web-view` 承载网页的容器。会自动铺满整个小程序页面，不能像 `iframe` 那样能设置某个区域。

```html
<web-view src="http://www.baidu.com/"></web-view>
```

### 调试 ###

在模拟器中可以正常访问网站，但是在手机预览中出现白屏，真机调试也是白屏。

### 预览解决 ###

- 在需要使用 `web-view` 的目录下的 `.json` 文件下添加 `"render":webView`, 或手机端小程序右上角三个点打开调试模式，切换至 `webView` 模式。
- 真机调试：切换至2.0调试模式。

## 详细步骤 ##

### 小程序端 ###

```html
<web-view src="{{webviewUrl}}" bindmessage="onMessage" />
```

```ts
Page({
  onLoad() {
    this.webViewContext = wx.createWebViewContext('webviewId', this);
  },
  onMessage(e) {
    const data = e.detail.data;
    console.log('收到来自H5的消息:', data);
    // 处理消息，必要时回复H5
    this.webViewContext.postMessage({ msg: '收到消息了，内容是：' + data.msg });
  },
  sendMessageToWebView(msg) {
    this.webViewContext.postMessage({ msg });
  }
});
```

注意：`wx.createWebViewContext` 需要在 `web-view` 上设置 `id="webviewId"`。

### H5 (Vue) 页面 ###

```html
<web-view src="{{webUrl}}" bindmessage="getMessage"/>
```

#### 页面接收小程序消息 ####

```ts
// 监听小程序发送消息
window.wx.miniProgram.getEnv((res) => {
  if(res.miniprogram){
    window.wx.miniProgram.onMessage((data) => {
      console.log('接收到小程序消息:', data);
      // 这里可调用 Vue 方法或触发事件
    });
  }
});
```

#### 父传子(本地系统传到被嵌入的H5页面) ####

小程序用url拼接过去，H5页面通过 `window.location.href.replace` 获取到内容。

```ts
//这是H5页面
created() { 
    // H5获取token const wxobj = {} 
    window.location.href.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (wxobj[k] = v)) 
    if ( wxobj.token) { 
        store.commit( 'user/setToken', wxobj.token) 
    } 
}
```

#### H5 向小程序发送消息 ####

注意： 在H5系统（被嵌入） 需要安装官方的 `weixin-js-sdk`包。

**安装**

```bash
npm add weixin-js-sdk
```

**引入**

```ts
import wx from "weixin-js-sdk";
```

**使用**

```ts
wx.miniProgram.postMessage({ 
    data: { token } 
});
```


```ts
function sendMsgToMiniProgram(msg){
  if(window.wx && window.wx.miniProgram){
    window.wx.miniProgram.postMessage({ msg });
  }
}
```

**本地系统接收（小程序）**

```html
<web-view src="{{webUrl}}" bindmessage="getMessage"/>
```

```ts
Page({
  //接收网页数据
  getMessage: function (res) {
    let token = res.detail.data;
    this.setData({ token });
  },
})
```

### H5 跳转回小程序 ###

需要用到上面引入的 `weixin-js-sdk` 包。

```ts
const name = '天天'
wx.miniProgram.navigateTo({
  url: `/pages/my/my?name=${name}` , // 小程序地址
  success () {
    console.log('question success')
  },
  fail (error) {
    console.log(error)
  }
})
```

**父系统能拿到？后面的传参数**

```ts
Page({
  onLoad(option) { 
      this.name = JSON.parse(option.name); 
  },
})
```

## 关键踩坑点总结 ##

| 踩坑点        |      解决方案      |  注意事项 |
| :-----------: | :-----------: | :----: |
| `wx.createWebViewContext` 需要 `web-view` 指定 `id` | 小程序 `web-view` 必须有 `id` 属性，且与 `createWebViewContext` 参数一致 |  |
| H5页面必须引用微信 `JS SDK` | 确保微信 `JS SDK`引入且页面运行在微信环境 |  |
| 监听消息需要确认环境 | 用 `getEnv` 判断是否在小程序环境，防止报错 |  |
| `postMessage` 发送消息格式统一 | 建议都用 `JSON` 对象结构，避免传输字符串导致解析错误 |  |
| H5需主动监听小程序消息 | 调用 `window.wx.miniProgram.onMessage` 实现实时响应 |  |
| 双向异步通信需考虑延时和队列 | 设计消息队列或事件机制保证消息不丢失 |  |

## 示例demo结构 ##

- 小程序代码
  - page.wxml: `<web-view id="webviewId" src="https://h5.url" bindmessage="onMessage"/>`
  - page.ts: 处理消息与发送消息
- Vue H5代码
  - main.ts: 初始化微信环境监听
  - 页面组件中调用 `wx.miniProgram.postMessage` 发送消息
  - 监听 `onMessage` 处理小程序消息

## 总结 ##

- 只要正确使用微信小程序官方 `postMessage` 机制，双向通信完全稳定。
- 要点是小程序 `web-view` 必须带 `id`，`Vue` 页面正确引用微信 `SDK` 且监听消息。
- 测试时记得在真机微信环境下，模拟器不支持 `web-view` 通信。

[微信官方文档 小程序开放能力 WebView](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)

## 注意事项 ##

- 微信并不鼓励在小程序中大范围嵌入 `H5`，为了避免开发者把小程序变成“浏览器”，微信对小程序与内嵌 `H5` 的通讯做了诸多限制。
- 尽量使用单一方式实现，比如纯小程序原生，将 `h5` 功能移至小程序原生。
- 原生页面与 `H5` 之间通过 `URL` 进行通信。
- 不要尝试越过 `wx` 限制。
- 不得不用混合开发时，尽量做好优化，引入骨架屏等优化方式提高用户体验感。
- 以上三种方式均未很好实现 `web-view` 与 `H5` 双向通信。
- 在实现小程序与H5的通信时，注意安全性。确保只允许来自可信来源的消息，避免潜在的安全隐患。

## 处理跨域 ##

由于H5页面可能会遇到跨域问题，确保在H5服务器上设置正确的CORS头部信息，以允许小程序的请求：

```txt
Access-Control-Allow-Origin: https://mp.weixin.qq.com
```

[探讨微信小程序与H5骨架屏的实现方式](https://juejin.cn/post/7406269938008244251?)

## 页面缓存 ##

"微信小程序内嵌H5页面缓存问题常常困扰着开发者。为了解决这个问题，可以采取以下几种方法：

- **禁用缓存**：在小程序的 `webview` 组件中，可以通过设置 `cache-mode` 属性为 `no-cache` 来禁用缓存。这样可以确保每次打开 `webview` 时都会重新加载页面，而不使用缓存。
- **动态添加时间戳**：在向H5页面发起请求时，可以在URL参数中添加一个随机的时间戳参数，以确保每次请求的URL都是唯一的。这样可以绕过浏览器的缓存机制，强制浏览器重新请求页面内容。
- **使用localStorage**：在H5页面中，可以利用 `localStorage` 来存储一些静态资源，以减少对服务器的请求。在小程序内嵌的H5页面中，可以通过 `localStorage` 来实现一定程度的缓存。
- **监听webview事件**：可以通过监听 `webview` 的事件，如 `load` 事件和 `error` 事件，来动态控制页面的缓存策略。例如，可以在load事件触发时清除缓存，以确保每次都是最新的页面内容。
- **与后端协作**：在H5页面的后端服务器上，可以设置响应头中的缓存控制字段，如 `Cache-Control` 和 `Expires`，来指示浏览器不缓存页面内容。这样可以在一定程度上解决缓存问题。

通过以上方法，可以有效地解决微信小程序 `webview` 内嵌H5页面的缓存问题，确保用户能够获得最新的页面内容，提升用户体验。"
