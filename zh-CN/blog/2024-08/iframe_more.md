---
lastUpdated: true
commentabled: true
recommended: true
title: iframe 使用
description: iframe 使用
date: 2024-08-20 10:18:00
pageClass: blog-page-class
---

# iframe 使用 #

## 自适应高度 ##

使用iframe嵌入页面很方便，但必须在父页面指定iframe的高度。如果iframe页面内容的高度超过了指定高度，会出现滚动条，很难看。
如何让iframe自适应自身高度，让整个页面看起来像一个整体？

在HTML5之前，有很多使用JavaScript的Hack技巧，代码量大，而且很难通用。随着现代浏览器引入了新的ResizeObserver API，解决iframe高度问题就变得简单了。

我们假设父页面是index.html，要嵌入到iframe的子页面是target.html，在父页面中，先向页面添加一个iframe：

```js
const iframe1 = document.createElement('iframe');
iframe1.src = 'target.html';
iframe1.onload = autoResize;
document.getElementById('sameDomain').appendChild(iframe1);
```

当iframe载入完成后，触发onload事件，然后自动调用autoResize()函数：

```js
function autoResize(event) {
    // 获取iframe元素:
    const iframeEle = event.target;
    // 创建一个ResizeObserver:
    const resizeRo = new ResizeObserver((entries) => {
        let entry = entries[0];
        let height = entry.contentRect.height;
        iframeEle.style.height = height + 'px';
    });
    // 开始监控iframe的body元素:
    resizeRo.observe(iframeEle.contentWindow.document.body);
}
```

通过创建ResizeObserver，我们就可以在iframe的body元素大小更改时获得回调，在回调函数中对iframe设置一个新的高度，就完成了iframe的自适应高度。

### 跨域问题 ###

ResizeObserver很好地解决了iframe的监控，但是，当我们引入跨域的iframe时，上述代码就失效了，原因是浏览器阻止了跨域获取iframe的body元素。
要解决跨域的iframe自适应高度问题，我们需要使用postMessage机制，让iframe页面向父页面主动报告自身高度。
假定父页面仍然是index.html，要嵌入到iframe的子页面是http://xyz/cross.html，在父页面中，先向页面添加一个跨域的iframe：

```js
const iframe2 = document.createElement('iframe');
iframe2.src = 'http://xyz/cross.html';
iframe2.onload = autoResize;
document.getElementById('crossDomain').appendChild(iframe2);
```

在cross.html页面中，如何获取自身高度？

我们需要现代浏览器引入的一个新的MutationObserver API，它允许监控任意DOM树的修改。

在cross.html页面中，使用以下代码监控body元素的修改（包括子元素）：

```js
// 创建MutationObserver:
const domMo = new MutationObserver(() => {
    // 获取body的高度:
    let currentHeight = body.scrollHeight;
    // 向父页面发消息:
    parent.postMessage({
        type: 'resize',
        height: currentHeight
    }, '*');
});
// 开始监控body元素的修改:
domMo.observe(body, {
    attributes: true,
    childList: true,
    subtree: true
});
```

当iframe页面的body有变化时，回调函数通过postMessage向父页面发送消息，消息内容是自定义的。在父页面中，我们给window添加一个message事件监听器，即可收取来自iframe页面的消息，然后自动更新iframe高度：

```js
window.addEventListener('message', function (event) {
    let eventData = event.data;
    if (eventData && eventData.type === 'resize') {
        iframeEle.style.height = eventData.height + 'px';
    }
}, false);
```

使用现代浏览器提供的ResizeObserver和MutationObserver API，我们就能轻松实现iframe的自适应高度。

## 权限相关 ##

当我们在子窗口中需要获取浏览器权限时（比如全屏、访问摄像头/麦克风等等），可以添加 allow 属性。

`<iframe>` 元素的 allow 属性用于指定哪些功能和权限应该允许在嵌入的 iframe 中使用。这些属性可以用于增强安全性和控制嵌入内容的行为。以下是一些常见的 allow 属性及其描述：

- allowcamera：允许 iframe 使用设备的摄像头。（常用）
- allowmicrophone：允许 iframe 使用设备的麦克风。（常用）
- allowfullscreen：允许在 iframe 中启用全屏模式。如果未设置此属性，嵌入的内容可能无法进入全屏模式。（常用）
- allowpaymentrequest：允许 iframe 使用 Payment Request API，以便进行付款处理。（常用）
- allowautoplay：允许嵌入的音频或视频自动播放，即使自动播放被浏览器禁用。（常用）
- allowvr：允许 iframe 使用虚拟现实（VR）设备和功能，以便在 VR 环境中查看内容。
- allowgeolocation：允许 iframe 访问设备的地理位置信息。
- allowencryptedmedia：允许 iframe 使用加密媒体功能，如播放受 DRM 保护的内容。
- allowpointerlock：允许 iframe 请求鼠标指针锁定，以控制鼠标输入。
- allowscripts：允许 iframe 中执行脚本，通常与 sandbox 属性结合使用以提供更精细的脚本控制。
