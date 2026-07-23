---
lastUpdated: true
commentabled: true
recommended: true
title: 现代浏览器Observer API 的使用实践
description: 现代浏览器Observer API 的使用实践
date: 2025-08-04 15:45:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 前言 ##

现代浏览器支持四种不同类型的观察者类api：

- `Intersection Observer` 交叉观察者：观察一个元素是否在视窗可见；可用于无限滚动、图片懒加载、埋点等
- `Mutation Observer` 变动观察者：观察 DOM 中的变化；可用于高性能的数据绑定及响应、实现视觉差滚动、图片预加载、实现富文本编辑器等
- `Resize Observer` 视图观察者：观察视口大小的变化；可用于智能的响应式布局（取代@media）、响应式组件实现等
- `Performance Observer` 性能观察者：监测性能度量事件；可用于更细颗粒的性能监控、分析性能对业务的影响（交互快/慢是否会影响销量）等

## IntersectionObserver ##

计算 Web 页面的元素的位置时依赖于 `DOM` 状态的显式查询。但这些查询是同步的，会导致昂贵的样式计算开销（重绘和回流），且不停轮询会导致大量的性能浪费。`Intersection Observer API` 通过为开发人员提供一种新方法来异步查询元素相对于其他元素或全局视口的位置，从而解决了上述问题：

1. 异步处理 消除了昂贵的 DOM 和样式查询，连续轮询以及使用自定义插件的需求。
2. 通过消除对上述方法的需求，可以使应用程序显着降低 CPU，GPU 和资源成本。

### IntersectionObserver 的使用 ###

使用 `IntersectionObserver API` 主要需要三个步骤：

#### 创建观察者 ####

```ts
const options = {
    root: document.querySelector('.app'), // root指定一个根元素
    rootMargin: '0px',                    // 使用类似于设置 CSS 边距的语法来指定根边距
    threshold: [0.3, 0.5, 0.8, 1]     //  阈值。 [0.3] 意味着，当目标元素在根元素指定的元素内可见 30% 时，调用处理函数。
}    
const observer = new IntersectionObserver(handler, options)
```

#### 定义回调事件 ####

```ts
// 当目标元素与根元素通过阈值相交时，就会触发回调函数。
function handler (entries, observer) { 
    entries.forEach(entry => { 
      console.log(entry)
    }); 
}
```

entry是一个IntersectionObserverEntry对象，有不同的属性值：

1. `entry.boundingClientRect`   目标元素的位置信息
2. `entry.intersectionRatio`   目标元素的可见比例
3. `entry.intersectionRect`   交叉部分的位置信息
4. `entry.isIntersecting`
5. `entry.rootBounds`   根元素的位置
6. `entry.target`   
7. `entry.time`  时间戳

#### 定义要观察的目标对象 ####

```ts
const target = document.querySelector(“.targetBox”); 
// 监听某个目标
observer.observe(target);
// 停止对某目标的监听
observer.unobserve(target)
// 终止对所有目标的监听
observer.disconnect()
```

### 图片懒加载实现 ###

```html
<!-- more images -->
...
<img src="" dataSrc="img01.jpg">
<img src="" dataSrc="img02.jpg">
<img src="" dataSrc="img03.jpg">
...
<!-- more images -->
<script>
let observer = new IntersectionObserver(
    (entries, observer) => { 
      entries.forEach(entry => {
        entry.target.src = entry.target.dataSrc;
        observer.unobserve(entry.target);  // 动态添加属性之后终止监听
      });
    }, 
   { 
       rootMargin: "0px 0px -200px 0px",
       threshold: [0] 
    },
);

document.querySelectorAll('img').forEach(img => { 
   observer.observe(img) 
});
</script>
```

### 无限滚动的实现 ###

```ts
let observer = new IntersectionObserver(
  function (entries) {
    // 如果不可见，就返回
    if (entries[0].intersectionRatio <= 0) return;
    loadItems(10);
    console.log('Loaded new items');
  });

// 开始观察
observer.observe(
  document.querySelector('.scrollerFooter')
);
```

### 埋点实现 ###

```ts
let observer = new IntersectionObserver((entries) =>{
  entries.forEach(item => {
    // intersectionRatio === 1说明该元素完全暴露出来，符合业务需求
    if (item.intersectionRatio === 1) {
      // 。。。 埋点曝光代码  。。。
      io.unobserve(item.target)
    }
  })
}, 
{
  root: null,
  threshold: 1, // 阀值设为1，当只有比例达到1时才触发回调函数
})

// observe遍历监听所有box节点
const boxList = [...document.querySelectorAll('.box')]
boxList.forEach(box => observer.observe(box))
```

### 控制视频的播放和暂停 ###

```html
<video src="xxxxxx.mp4" controls=""></video>

<script>
let video = document.querySelector('video');
let isPaused = false;  // 定义变量标记视频是否停止播放
let observer = new IntersectionObserver((entries, observer) => { 
  entries.forEach(entry => {
    if(entry.intersectionRatio != 1 && !video.paused){
      video.pause(); 
      isPaused = true;
    } else if(isPaused) {
      video.play(); 
      isPaused=false
    }
  });
}, 
{
  threshold: 1
});
observer.observe(video);
</script>
```

## Mutation Observer ##

该接口提供了监视对 DOM 树所做更改的能力。这个api 被设计为旧的 `MutationEvents`1 功能的替代品,而它的优势在于：

1. MutationEvents 事件是同步触发，也就是说，DOM 的变动立刻会触发相应的事件；
2. Mutation Observer 则是异步触发，DOM 的变动并不会马上触发，而是要等到当前所有 DOM 操作都结束才触发。
3. 可以通过配置项，监听目标 DOM 下子元素的变更记录

### MutationObserver 的使用 ###

使用 `MutationObserver API` 主要需要三个步骤：

#### 创建观察者 ####

```ts
let observer = new MutationObserver(callback);
```

#### 定义回调函数 ####

```ts
function callback (mutations, observer) {
  mutations.forEach(function(mutation) {
    // 每个 `mutation` 都对应一个 `MutationRecord` 对象，记录着 `DOM` 每次发生变化的变动记录
    console.log(mutation);
  });
});
```

#### 定义要观察的目标对象 ####

```ts
const target = document.querySelector(“.targetBox”); 

// 观察某个目标 observer.observe(dom, options)
observer.observe(content, {
    attributes: true, // Boolean - 观察目标属性的改变
    characterData: true, // Boolean - 观察目标数据的改变(改变前的数据/值)
    childList: true, // Boolean - 观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化
    subtree: true, // Boolean - 目标以及目标的后代改变都会观察
    attributeOldValue: true, // Boolean - 表示需要记录改变前的目标属性值
    characterDataOldValue: true, // Boolean - 设置了characterDataOldValue可以省略characterData设置
    attributeFilter: ['src', 'class'] // Array - 观察指定属性
});


// 停止观察。调用后不再触发观察器，解除订阅
observer.disconnect()

// 清除变动记录。即不再处理未处理的变动。
observer.takeRecords()
```

### 实现聊天对话框的自动滚动 ###

会话聊天界面中，当会话逐渐增多后，底部每次增加一次聊天对话，都必须向上滚动一次。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MutationObserver 聊天示例</title>
  <style>
    #chatContainer {
      height: 300px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
    }

    .message {
      margin-bottom: 10px;
    }
  </style>
</head>

<body>
  <div id="chatContainer">
    <div class="message">你好吗？</div>
    <!-- 新的消息会动态添加到这里 -->
  </div>
  <button id="btn">发送消息</button>
</body>
<script>
  // 创建一个观察者实例并传入回调函数  
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        // 找到最后一个消息元素，并滚动到它  
        const lastMessage = document.querySelector('#chatContainer .message:last-child');
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth' }); // scrollIntoView 滚动到视图范围内
        }
      }
    }
  });

  // 选择要观察的DOM节点并且开始观察目标节点  
  const targetNode = document.getElementById('chatContainer');
  observer.observe(targetNode, { childList: true, subtree: true });

  // 模拟发送消息的函数  
  function sendMessage() {
    const chatContainer = document.getElementById('chatContainer');
    const newMessage = document.createElement('div');
    newMessage.className = 'message';
    newMessage.textContent = `我很好`; // 这里可以动态获取消息内容  
    chatContainer.appendChild(newMessage);
  }

  // 绑定按钮点击事件  
  document.getElementById('btn').addEventListener('click', sendMessage);  
</script>
</html>
```

## ResizeObserver ##

开发过程当中经常遇到的一个问题就是如何监听一个 `div` 的尺寸变化。但众所周知，为了监听 div 的尺寸变化，都将侦听器附加到 window 中的 `resize` 事件。但这很容易导致性能问题，因为大量的触发事件。而且 `resize` 事件会在一秒内触发将近 60 次，很容易在改变窗口大小时导致性能问题。

**ResizeObserver API** 主要优势有两点：

- 细颗粒度的 DOM 元素观察，而不是 window
- 没有额外的性能开销，只会在绘制前或布局后触发调用

### ResizeObserver 的使用 ###

使用 ResizeObserver API 有三个步骤：

#### 创建观察者 ####

```ts
let observer = new ResizeObserver(callback);
```

#### 定义回调函数 ####

```ts
const callback = entries => {
    entries.forEach(entry => {     
      // 每一个 `entry` 都是一个对象，包含两个属性 `contentRect` 和 `target`
      console.log(entry)
    })
}
```

#### 定义要观察的目标对象 ####

```ts
observer.observe(document.body)

// `unobserve` 方法：取消单节点观察
observer.unobserve(document.body)

// `disconnect` 方法：取消所有节点观察
observer.disconnect(document.body)
```

### 实现窗口缩放时的背景渐变 ###

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResizeObserver</title>
</head>
<style>
  body {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2vw;
    box-sizing: border-box;
  }

  .box {
    text-align: center;
    height: 20vh;
    border-radius: 8px;
    box-shadow: 0 0 4px rgba(0, 0, 0, .25);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1vw
  }

  .box h3 {
    color: #fff;
    margin: 0;
    font-size: 5vmin;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  }
</style>
<body>
  <div class="box">
    <h3 class="info"></h3>
  </div>
</body>
<script>
  const boxes = document.querySelectorAll('.box');
  let callbackNum = 0;
  const myObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      callbackNum++
      const infoEl = entry.target.querySelector('.info');
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      const angle = Math.floor(width / 360 * 100);
      const gradient = `linear-gradient(${angle}deg, rgba(0,143,104,1) 50%, rgba(250,224,66,1) 50%)`;
      entry.target.style.background = gradient;
      infoEl.innerText = `
        I'm ${width}px and ${height}px tall
        callbackNum ====> : ${callbackNum}
        `;
    }
  });
  boxes.forEach(box => {
    myObserver.observe(box);
  });

</script>

</html>
```

## PerformanceObserver ##

这是一个 `浏览器` 和 `Node.js` 里都存在的 API，采用相同 W3C 的 `Performance Timeline` 规范, 在浏览器中可以使用 window 对象取得 `window.performance` 和 `window.PerformanceObserver` 。在 `Node.js` 程序中需要 `perf_hooks` 取得性能对象:

```ts
const { PerformanceObserver, performance } = require('perf_hooks');
```

**Performance接口** 可以获取到当前页面中与性能相关的信息。它是 `High Resolution Time API` 的一部分，同时也融合了 `Performance Timeline API`、`Navigation Timing API`、`User Timing API` 和 `Resource Timing API`; 他记录着几种性能指数的庞大对象集合

1. 要获得页面加载性能，可调用 `performance.getEntries` 或 `performance.getEntriesByName` 。
2. 而获得执行效率，也只能通过 `performance.now` 来计算。

在最新的 `Performance Timeline Level 2` 标准中，取代了第一版 `Performance Timeline` 标准，它包括了以下三点：

1. 扩展了 `Performance` 接口的基本定义
2. 在 Web Workers 中暴露了 `PerformanceEntry`
3. 增加了 `PerformanceObserver` 的支持

### PerformanceObserver 的优势 ###

`PerformanceObserver` 是浏览器内部对 `Performance` 实现的观察者模式。它解决了以下 3 点问题：

- 避免不知道性能事件啥时候会发生，需要重复轮询 `timeline` 获取记录。
- 避免产生重复的逻辑去获取不同的性能数据指标
- 避免其他资源需要操作浏览器性能缓冲区时产生竞态关系。

> W3C官网文档鼓励开发人员尽可能使用 `PerformanceObserver`，而不是通过 `Performance` 获取性能参数及指标。

使用 PerformanceObserver API 主要需要三个步骤：

#### 创建观察者 ####

```ts
let observer = new PerformanceObserver(callback); 
```

#### 定义回调函数事件 ####

```ts
// 其中每一个 `list` 都是一个完整的 `PerformanceObserverEntryList` 对象,
// `PerformanceObserverEntryList` 对象包含三个方法 `getEntries`、`getEntriesByType`、`getEntriesByName`

const callback = (list, observer) => {
   const entries = list.getEntries();
   entries.forEach((entry) => {
    console.log(entry); 
   });
}
```

#### 定义要观察的目标对象 ####

`observer.observe(...)` 方法接受可以观察到的有效的入口类型。这些输入类型可能属于各种性能 API，比如 `Navigation Timing API` 等。有效的 entryType 值有例如：`frame`,  `navigation`,  `resource`, `mark`, `measure` , `paint` 等

```ts
observer.observe({entryTypes: ["xxxxx"]});
```

### 静态资源监控的实现 ###

```ts
// 计算不同节点时间的差值
function filterTime(a, b) {
  return (a > 0 && b > 0 && (a - b) >= 0) ? (a - b) : undefined;
}

let resolvePerformanceTiming = (timing) => {
  return {
    initiatorType: timing.initiatorType,
    name: timing.name,
    duration: parseInt(timing.duration),
    redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 重定向
    dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS解析
    connect: filterTime(timing.connectEnd, timing.connectStart), // TCP建连
    network: filterTime(timing.connectEnd, timing.startTime), // 网络总耗时

    send: filterTime(timing.responseStart, timing.requestStart), // 发送开始到接受第一个返回
    receive: filterTime(timing.responseEnd, timing.responseStart), // 接收总时间
    request: filterTime(timing.responseEnd, timing.requestStart), // 总时间

    ttfb: filterTime(timing.responseStart, timing.requestStart), // 首字节时间
  };
};

let resolveEntries = (entries) => entries.map(item => resolvePerformanceTiming(item));

let resources = {
  init: (cb) => {
    let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance;
    if (!performance || !performance.getEntries) {
      return void 0;
    }

    if (window.PerformanceObserver) {
      let observer = new window.PerformanceObserver((list) => {
        try {
          let entries = list.getEntries();
          cb(resolveEntries(entries));
        } catch (e) {
          console.error(e);
        }
      });
      observer.observe({
        entryTypes: ['resource']
      })
    } else {
        window.addEventListener('load', () => {
        let entries = performance.getEntriesByType('resource');
        cb(resolveEntries(entries));
      });
    }
  },
};
```
