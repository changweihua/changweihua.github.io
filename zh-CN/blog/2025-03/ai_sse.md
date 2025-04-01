---
lastUpdated: true
commentabled: true
recommended: true
title: Ai问答之微信小程序中的流请求实现
description: Ai问答之微信小程序中的流请求实现
date: 2025-03-31 11:00:00
pageClass: blog-page-class
---

# Ai问答之微信小程序中的流请求实现 #

## 前言 ##

目前会话Ai发展迅速，产品丰富，甚至还可以在一些平台上创建自己的智能体。

那么作为一个开发者，如果遇到项目中需要对接会话Ai的需求，还是需要一点学习成本的。本文总结和分享了一个基于微信小程序的会话Ai实现思路，给出了实现功能的核心代码，有需要的小伙伴直接复杂代码就可以直接运行。

另因笔者技术能力有限，不足之处欢迎评论区交流。

## 小程序编译第三方依赖包 ##

要实现流数据处理，必须要用到 `TextDecoder` 对象，但是这个对象只有Web端才有，微信小程序没有提供，所以这里需要我们自己在项目中安装编译，具体操作如下：

```bash
# 安装 text-encoding
npm install text-encoding
```

到这一步还不能使用，因为小程序框架是无法直接理解npm包的。我们需要在微信开发者工具中做一次编译后才可以使用。

### 引入依赖包 ###

```js
const { TextDecoder } = require('text-encoding');
```

然后在微信开发者工具中进行编译就可以了。

## 小程序流请求实现 ##

实现流请求的核心代码如下：

```js
data: {
    messages: [
        {
            id: Date.now() + 1,
            role: "assistant",
            content: "您好，请问有什么可以帮您？"
        }
    ],
    scrollTop: 0,
    bufferQueue: [], // 缓冲队列
    isRendering: false, // 渲染状态锁
    currentMsgId: null // 当前处理的消息ID
},

// 发起流请求
streamRequest(url, params) {
    let buffer = ""; // 当前数据缓冲区
    const decoder = new TextDecoder('utf-8');

    // 创建请求任务
    const requestTask = wx.request({
        url,
        method: "POST",
        timeout: 900000, // 设置请求事件，根据自己实际情况设置
        data: params,
        enableChunked: true,
        responseType: "arraybuffer",
        header: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        success: (res) => {
            if (res.statusCode !== 200) {
                this.handleError(new Error(`请求失败，状态码：${res.statusCode}`));
            }
        },
        fail: (err) => {
            console.error("请求失败:", err);
            wx.showToast({ title: "网络错误，请重试", icon: "none" });
        }
    });
	
    // 数据块接收处理
    requestTask.onChunkReceived((res) => {
        // 解码并处理数据块
        buffer += decoder.decode(res.data, { stream: true });
        // SSE协议解析
        const events = [];
        let pos = 0;
        while (pos < buffer.length) {
            // 查找事件边界
            const endPos = buffer.indexOf("\n\n", pos);
            if (endPos === -1) break;
            const rawEvent = buffer.slice(pos, endPos);
            pos = endPos + 2; // 跳过两个换行符
            // 解析事件内容
            const event = { data: "" };
            rawEvent.split("\n").forEach((line) => {
                const colonIdx = line.indexOf(":");
                if (colonIdx <= 0) return;
                const field = line.slice(0, colonIdx).trim();
                const value = line.slice(colonIdx + 1).trim();
                if (field === "data") event.data = value;
            });
            if (event.data) events.push(event);
        }

        buffer = buffer.slice(pos); // 保留未处理数据
        // 处理有效事件
        events.forEach((event) => {
            if (event.data === "[DONE]") {
                // ai回答完成后在这里处理相关的逻辑，然后return终止程序
                return;
            }

            try {
                const payload = JSON.parse(event.data);
                this.processContentChunk(
                    payload.id,
                    payload.choices[0].delta.content || '',
                    payload // 传递完整响应对象
                );
            } catch (e) {
                console.error("JSON解析失败:", e);
            }
        });
    });

    return requestTask;
},

/**
* 处理内容片段
*/
processContentChunk(messageId, contentChunk, payload) {
    // 初始化新消息
    if (!this.data.currentMsgId) {
        this.data.currentMsgId = messageId;
        // 从服务端响应中获取角色信息，若不存在则设置默认值
        const role = payload.choices[0].delta.role || 'assistant';
        // 使用setData保证视图同步更新
        this.setData({
            messages: [
                ...this.data.messages,
                {
                    id: messageId,
                    role: role, // 动态设置角色
                    content: '',
                    timestamp: Date.now()
                }
            ]
        });
    }

    // 将内容加入缓冲队列
    this.data.bufferQueue.push(...contentChunk.split(""));

    // 启动渲染流水线
    if (!this.data.isRendering) {
        this.startRenderingPipeline();
    }
},

/**
* 启动渲染流水线
*/
startRenderingPipeline() {
    if (this.data.isRendering || this.data.bufferQueue.length === 0) return;
        this.data.isRendering = true;
        const render = () => {
            if (this.data.bufferQueue.length === 0) {
                    this.data.isRendering = false;
                    return;
            }
            // 每次渲染5个字符（平衡流畅性和性能）
            const chunk = this.data.bufferQueue.splice(0, 5).join("");
            const msgIndex = this.data.messages.findIndex((msg) => msg.id === this.data.currentMsgId);
            if (msgIndex > -1) {
            this.setData(
                {
                    [`messages[${msgIndex}].content`]:
                    this.data.messages[msgIndex].content + chunk,
                },
                () => {
                    // 使用定时器保持约60fps的渲染速度
                    setTimeout(render, 16);
                    this.scrollToBottom(); // 自动滚动到界面最下面
                }
            );
        }
    };
    render();
},

/**
* 自动滚动到底部
*/
scrollToBottom() {
    this.setData({
        scrollTop: this.data.scrollTop + 10000, // 设置足够大的值确保滚动到底
    });
}
```

## 总结 ##

概括一下实现思路，其实很简单。第一步获取接口的流数据，第二步对数据进行处理，第三步实时更新到用户界面上。这里需要注意的是，Ai回答的打字效果是在流数据返回后实时更新到界面上的效果，不需要再自己实现。
