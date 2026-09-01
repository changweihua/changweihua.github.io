---
outline: false
aside: false
layout: doc
date: 2025-03
title: fetch-event-source 实现SSE流式传输
description: vue项目中使用@microsoft/fetch-event-source库实现流式接口对接
category: 文档
pageClass: manual-page-class
---

# `@microsoft/fetch-event-source`库实现流式接口对接 #

## `@microsoft/fetch-event-source` ##

`@microsoft/fetch-event-source`，是微软开发的一个库，用于通过 Fetch API 实现 SSE 的流式数据传输。它封装了请求发送、消息接收和连接恢复的逻辑，非常适合流式数据的处理。

**主要参数**：

- method: HTTP 方法，通常为 POST。
- headers: 请求头信息，通常需要指定 Content-Type 为 application/json。
- body: 请求体内容，可以根据需求传递给后端。
- onmessage: 处理流式消息的回调函数，每当服务器发送一条消息时会调用。
- onclose: 服务器关闭连接时的回调。
- onerror: 出现错误时的回调。

**安装库**：

```bash
npm install @microsoft/fetch-event-source
```

### 客户端 ###

```javascript
import React, { FC, useEffect, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

cosnt App =()=>{
    const [data, serData] = useState([]);
   
   const fun = ()=>{
       fetchEventSource('/api/sse',{
           method:"POST",
           headers: { 'Content-Type': 'application/json', },
           body: JSON.stringify({ query: '参数传递' }),
           
           onmessage(event){
               // 这里可以根据接收到的流式数据更新到界面需要的地方
               setData(prevData => [...prevData, JSON.parse(res.data)]);
           },
           
           //  报错
           onerror(err) {
               // 报错信息
                console.error('Error:', err);
            },
           
           // 服务器关闭连接
           onclose() {
                console.log('服务器关闭连接');
           },
       });
   };
    
    return<>
            <div style={{width: '300px', height: '100px', overFlow: 'scroll'}}> 
            {data.map(item => ( <div>{item.name}</div> ))} </div>
    </>
};
```

### 服务端 ###

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { PassThrough } = require('stream')

//路径管理
const path = require('path');

const static = require('koa-static');
const main = static(path.join(__dirname) + '/www/');

const app = new Koa();
const router = new Router();

app.use(main)

// 发送消息
const sendMessage = async (stream) => {
  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  // 循环上面数组: 推送数据、休眠 2 秒
    for (const value of data) {
        stream.write('data: ' + JSON.stringify(value) + '\n\n');; // 写入数据(推送数据)
        await new Promise((resolve) => setTimeout(resolve, 2000));
    };
};


// SSE 路由处理
router.get('/api/sse', async (ctx, next) => {
     // 设置响应头
     ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
  });

 // 2. 创建流、并作为接口数据进行返回
 const stream = new PassThrough();
 ctx.body = stream;
 ctx.status = 200;

 // 3. 推送流数据
 sendMessage(stream, ctx);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3005, () => {
    console.log('Server is running on http://localhost:3005');
});
```

## vue项目中使用@microsoft/fetch-event-source ##

fetch-event-source提供了一个更好的 API，用于发出事件源请求（ Event Source requests 也称为服务器发送事件），并具有Fetch API中提供的所有功能。

基于 Fetch API 提供了一个用于使用服务器发送事件的备用接口，可以使用任何请求方法、头信息和请求体，以及 fetch() 提供的所有其他功能。

如果连接中断或发生错误，可以控制重试。

### 安装 ###

```bash
npm install @microsoft/fetch-event-source
```

### 用法 ###

```ts
import { fetchEventSource } from '@microsoft/fetch-event-source';

async function startStream() {
  await fetchEventSource('request url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN',
    },
    body: JSON.stringify({ query: "Hello" }),
    onopen(response) {
      // 连接成功时触发
      if (response.ok) return;
      throw new Error('连接失败');
    },
    onmessage(event) {
      // 接收服务器发送的每条事件
      console.log('收到数据:', event.data);
      // 请求完成
      console.log('请求结束标记', data.done)
    },
    onclose() {
      // 连接关闭时触发
      console.log('连接终止');
    },
    onerror(err) {
      // 错误处理（默认会抛出异常并自动重试）
      console.error('错误:', err);
      throw err; // 抛出错误会触发重试机制
    }
  });
}
```


```ts
import { fetchEventSource } from '@microsoft/fetch-event-source'

class RetriableError extends Error { }
class FatalError extends Error { }
const ctrl = new AbortController();
//AbortController 是一个用于控制和取消异步操作的接口。它通常与 AbortSignal 一起使用，后者是由 AbortController 生成的信号对象。AbortController 和 AbortSignal 主要用于取消 fetch 请求或其他需要取消的异步任务。

fetchEventSource('/api/sse', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        foo: 'bar'
    }),
    signal: ctrl.signal,//用于控制和取消 fetch 请求
    async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            return; // 一切正常
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // 客户端错误通常是不可重试的：
            throw new FatalError();
        } else {
            throw new RetriableError();
        }
    },
    onmessage(msg) {
        // 如果服务器发出错误消息，抛出异常
        // 以便它由下面的 onerror 回调处理：
        if (msg.event === 'FatalError') {
            throw new FatalError(msg.data);
        }
    },
    onclose() {
        // 如果服务器意外关闭连接，重试：
        throw new RetriableError();
    },
    onerror(err) {
        if (err instanceof FatalError) {
            throw err; 
        } else {
            // 什么都不做以自动重试。您也可以
            // 在这里返回一个特定的重试间隔。
        }
    }
});
```

### 兼容性 ###

- ES2017

### vue项目示例 ###

- 获取流式数据，拼接流式显示
- 自定义规则拼接并截取句子，调用语音接口播放

```ts
import { fetchEventSource } from '@microsoft/fetch-event-source'

const ctrl=new AbortController()
const textBuffer = ref(''); //文字缓冲区 
const reportHtml = ref('')
const eventSource =()=>{
  reportHtml.value=''
  fetchEventSource(`/xxx/openai/dataStream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearerToken`
        },
        body: JSON.stringify({}),//参数
        mode:'cors',
        signal:ctrl.signal,
        onmessage: (event) => {
          let res = event.data
          let content = res
          reportHtml.value = reportHtml.value+(res===null?'':res)
          if(content){
            textBuffer.value += content;
          }
          // 如果缓冲区中的文本达到一定长度 并有句号时，进行语音转换和播放 ,最大长度100时转换
          const textLen = 5
          const maxLen = 10
           if (textBuffer.value.length >= textLen
                && textBuffer.value.length <= maxLen 
                && (textBuffer.value.slice(textLen).indexOf('。') != -1 || textBuffer.value.slice(textLen).indexOf('！') != -1)  
                || (
                    textBuffer.value.length > maxLen 
                    && (textBuffer.value.slice(maxLen).indexOf('，') != -1 ||textBuffer.value.slice(maxLen).indexOf(',') != -1 || textBuffer.value.slice(maxLen).indexOf('.') != -1)
                )
            ) {
            // 分隔符
            let  delimiter = ''
            let baseText = ''
            let extraText = ''
            // 超出xxx
            if(textBuffer.value.length > maxLen){
              // 前 xx 个字符都要播报 
              baseText = textBuffer.value.slice(0,maxLen)
              extraText = textBuffer.value.slice(maxLen)
            }else if(textBuffer.value.length > textLen && textBuffer.value.length <= maxLen){ 
              baseText = textBuffer.value.slice(0,textLen)
              extraText = textBuffer.value.slice(textLen)
            }
            if(extraText.indexOf('。')>-1){
              delimiter = '。'
            }else if(extraText.indexOf('！')>-1){
              delimiter = '！'
            }else if(extraText.indexOf(',')>-1){
              delimiter = ','
            }else if(extraText.indexOf('，')>-1){
              delimiter = '，'
            }
            else if(extraText.indexOf('.')>-1){
              delimiter = '.'
            }
            let splitText  = ''

            let leftText = ''
            if(delimiter){
              splitText = extraText.split(delimiter)[0]
              leftText = extraText.split(delimiter)[1]
            }
            let wholeText = baseText + splitText + delimiter
            const currentTime = new Date().toLocaleTimeString();
            emit('playAudio', { //调用播报
              text:wholeText,
              type:0
            })
            console.log(currentTime,wholeText,wholeText.length,'playAudio方法调用-----')
            textBuffer.value = leftText
          }
        },
        onerror: (error:any) => {
          props.itemData.isLoading=false
          throw error
        },
        onclose: () => {
          props.itemData.isLoading=false
          emit('loadingEnd')
          if (textBuffer.value) {
            console.log(textBuffer.value,'textBuffer.value - playing')
            emit('playAudio', {
              text:textBuffer.value,
              type:1 // 播放完了 需要缓存队列
            })
            textBuffer.value = '';
          }
        }
    })
}
```

## fetch 接受流式数据（SSE） ##

最近需要对接一个AI大模型，后端使用SSE流式传输，要求前端正确接受这些数据，记录一下解决方法
tips：流式传输的数据是可以在浏览器开发者工具中的网络中看到的（会有一个EventSource选项卡）

1. 首先的想法是使用浏览器原生的SSE接口，可以自动解析流式数据的事件名，数据等，但是EventSource构造函数不能接受header配置，如果token是放在header中的，就不能使用这个方式

2. 查询资料发现fetch支持流式接收数据，示例：

```javascript
const res=fetch("/api/chat");//直接使用
const reader = res.body.getReader();//获取ReadableStream
const decoder = new TextDecoder(); //将Uint8Array解码

let done = false;
let data = '';
while (!done) {
  const { value, done: doneReading } = await reader.read();
  done = doneReading;
  if (value) {
    data += decoder.decode(value, { stream: true });
  }
}
```

注意，`decode`时需要加上`{ stream: true }`参数，因为流式传输时，一个汉字/emoji符号会被拆成多个码点，可能正好不在同一块数据中，`stream: true`可以在下次解码时自动将缓存字节与新数据块开头拼接，保证正确解码


如果想使用axios，需要在`axios.create`时使用`adapter:"fetch"`，因为默认的xhr适配器不支持stream，然后在`axios.post`时配置`responseType: 'stream'`即可

## 基于TypedJs实现ChatGPT的流式输出的打印机效果 ##

### ChatGPT流式输出的原理、SSE技术和typed.js的使用 ###

SSE技术是一种基于HTTP协议的服务器推送技术，它允许服务器主动向客户端发送数据和信息，实现了服务器到客户端的单向通信，ChatGPT就是采用SSE技术实现流式输出（这里需要和websocket区别开来，websocket是双工通信，SSE属于服务端向客户端单向发送消息）：

1. 建立连接 —— 当用户与ChatGPT进行对话时，客户端与服务器之间会建立一个基于HTTP的长连接。这个连接通过SSE机制保持打开状态，允许服务器随时向客户端发送数据。
2. 分步生成与实时推送 —— ChatGPT根据用户的输入和当前的上下文信息，逐步生成回答的一部分。每当有新的内容生成时，服务器就会通过SSE连接将这些内容作为事件推送给客户端。
3. 客户端接收与展示 —— 客户端通过JavaScript的EventSource 对象监听SSE连接上的事件。一旦接收到服务器推送的数据，客户端会立即将其展示给用户，实现流式输出的效果。

**typed.js** 是一个前端工具库，效果是用打字机的方式显示一段话，可以自定义任何字符串、显示速度等，易用、可配置、无依赖并且支持主流的浏览器，包括最新的版本。

### typed.js的使用 ###

可以通过npm包管理安装并使用：

```bash
npm install typed.js
```
或者使用cdn链接：

```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.11"></script>
```

我们通过实现一个简单的demo看一下，`typed.js` 是怎么使用的。我们直接通过一个原生js来实现，因此通过cdn地址或者本地的方式引入typed.js 源码，其html代码如下,其中建一个 span 标签来展示输入文本内容（文字放在span标签里面，输入的光标才会正常显示）：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <script src="./typed.js"></script>
  <body>
    <span id="typed" style="white-space: pre-wrap; line-height: 30px"></span>
  </body>
</html>
```

js代码中实现核心功能，相关的配置说明也可以看见。其中 options里面定义了打印效果相关的一些基础参数，实际的参数配置可以参考官方文档：mattboldt.github.io/typed.js/do… ，下面代码中是通过实现前端的ajax请求获取一个段demo诗句（v2.jinrishici.com/one.json 可以获取随机诗句），然后将获取的demo数据进行打印效果的展示。

```html
<script>
    // 封装打印效果的方法
    function printFn(data) {
      const options = {
        strings: [data],
        typeSpeed: 50, // 打印速度
        startDelay: 300, // 开始之前的延迟300毫秒
        loop: true, // 是否循环
        loopCount: 1, // 循环次数，Infinity 为无限循环。
        showCursor: false, // 是否显示光标
        contentType: "html", // 明文的'html'或'null'
        onComplete: (data) => {
          // 所有打字都已完成调用的回调函数
          console.log("onComplete", data);
        },
        onStringTyped: (index, data) => {
          // 输入每个字符串后调用的回调函数
          console.log("onStringTyped", index, data);
        },
      };
      const typed = new Typed("#typed", options);
    }

    var xhr = new XMLHttpRequest();
    xhr.open("get", "https://v2.jinrishici.com/one.json"); // 生成随机诗句
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let data = JSON.parse(xhr.responseText);
        let content = `<h4>${data.data.content}</h4>`;
        printFn(content)
      }
    };
    xhr.send();
</script>
```

### 流式输出和打印效果的结合实现 ###

前端用原生js实现一个简单的文本打印区域，后端使用nodejs结合 SSE 技术实现一个简单的流式传输的服务。如下代码是服务端的实现，通过他引入 http 模块实现一个服务，并且监听 8080 端口，模拟ChatGPT的流式输出是通过每隔5秒钟写入一个文本内容实现（模拟后台接口主动向前端推送消息）。(注意服务端跨域的设置应该放开)

```js
//  package.json 中增加了 "type": "module"， 可以通过es模式导入模块
import http from 'http'

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 设置跨域允许
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // 模拟ChatGPT的流式输出
    let counter = 0;
    res.write(`ChatGPT says: Hello World, this is message ${++counter}\n\n`);
    const interval = setInterval(() => {
      const data = `ChatGPT says: Hello World, this is message ${++counter}\n\n`;
      res.write(data);
    }, 5000); // 每秒发送一次数据

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});
```

如下代码是前端的实现，前端通过 `new EventSource("http://localhost:8080/stream")` 的方式连到服务端 SSE 服务，在通过这个实例子来 onopen 监听连接状态，通过 onmessage 接收服务端消息。每接收到一次服务端消息就将消息在文本区域打印出来。当前前端代码通过本地服务跑起来（可以通过live-server插件实现），在服务端放开跨域限制的条件下，可以看到正常的打印机效果。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSE Output</title>
  </head>
  <script src="./typed.js"></script>
  <body>
    <div id="main" style="width: 400px;">
    </div>
  </body>
  <script>
    function printFn(domId, data) {
      const options = {
        strings: [data],
        typeSpeed: 50, // 打印速度
        startDelay: 300, // 开始之前的延迟300毫秒
        loop: true, // 是否循环
        loopCount: 1, // 循环次数，Infinity 为无限循环。
        showCursor: false, // 是否显示光标
        contentType: "html", // 明文的'html'或'null'
        onComplete: (data) => {
          // 所有打字都已完成调用的回调函数
          console.log("onComplete", data);
        },
        onStringTyped: (index, data) => {
          // 输入每个字符串后调用的回调函数
          console.log("onStringTyped", index, data);
        },
      };
      const typed = new Typed(`#${domId}`, options);
    }

    const eventSource = new EventSource("http://localhost:8080/stream"); // 连接到SSE服务器

    // 连接建立时的操作
    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data === "[done]") {
        eventSource.close();
        return;
      }
      // 每次接受到新的消息，就新建一个dom标签展示新接受的消息
      const div = document.getElementById('main');
      const span = document.createElement("span");
      const domId = 'type'+Date.now();
      span.id = domId;
      span.style= "white-space: pre-wrap; line-height: 30px; display: block; color: #338af6; font-size: 16px";
      div.appendChild(span);
      printFn(domId, data) // 展示接收到的数据
    };

    // 连接建立时的操作
    eventSource.onopen = (event) => {
      console.log("EventSource onopen:", event);
    };

    // 错误处理
    eventSource.onerror = (event) => {
      console.error("EventSource failed:", event);
    };
  </script>
</html>
```

