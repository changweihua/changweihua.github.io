---
lastUpdated: true
commentabled: true
recommended: true
title: 从界面到API对接：实现AI回复效果的完整实践
description: 从界面到API对接：实现AI回复效果的完整实践
date: 2025-06-12 15:35:00 
pageClass: blog-page-class
---

# 从界面到API对接：实现AI回复效果的完整实践 #

本文完整记录一个AI智能回复页面的实现过程，虽然不是一步到位，但是包含前期的思考以及后期的完善，也供未来考究~

## 一、基础打字实现 ##

最初我想到的是利用vue中的自定义指令，具体代码如下：

*v-typing为自定义指令*

```html
<div class="chat-messages">
    <div v-for="(message, index) in chatMessages" :key="index" >
         <div class="message-content" v-typing="message.text"></div>
    </div>
</div>            
```

```ts
 directives: {
        //通过vue指令实现打字机效果
        typing: {
            inserted: function (el, binding) {
                let i = 0
                const timer = setInterval(function () {
                    let text = binding.value.charAt(i++)
                    if (!!text) {
                        el.innerHTML += text
                    } else {
                        clearInterval(timer)
                    }
                }, 100)
            }
        }
	}
```

当然还需要进一步优化

## 二、打字机效果优化 ##

### 使用 requestAnimationFrame 替代 setInterval 更流畅 ###

**requestAnimationFrame**的优势在于会根据系统的刷新率来执行回调，能保证回调函数在屏幕每次刷新的时候被执行，显示更加流畅。

之前我们在使用时可以通过setInterval的入参来控制打字频率，更换后我们该如何控制呢？

存储当前打字时间，判断时间差是否大于打字速度，大于则进行打字操作。

> 💡 `requestAnimationFrame`（RAF）的设计特性导致它在页面不可见时（如切换到后台标签页、最小化窗口）会暂停执行，这是为了优化性能和节省电池续航。目前我这边使用时考虑一直在前台，如果需要持续输出可以换回`setInterval`。

### 修改内容动态显示 ###

现在仅是对于新增有动态打字效果，加入`update`进行监听处理，使得修改时也能合适渲染。

这里有一注意点，如下示例：

```html
<p id='text'></p>
<p id='text1' v-typing="text1"></p>
<p id='text2' v-typing="text2"></p>
```

当 `text/text1` 变化时：

1. Vue 会触发组件更新
2. 两个`v-typing`指令的`update`钩子都会被调用
3. 每个指令需要自行判断是否需要重新执行逻辑

Vue 指令的 `update` 钩子与宿主组件的更新周期绑定，会在宿主组件的 `updated` 生命周期前执行。

因此我们在update钩子中需要加入内容变化判断，防止内容过度渲染。

### 防止内存泄漏 ###

每次调用 `requestAnimationFrame(animate)` 时，浏览器都会返回一个全新的、唯一的 ID。将ID绑定在dom节点上，节点更新或销毁时需将历史ID清除（通过 `cancelAnimationFrame`）。

第一条打字速度为默认100毫秒 vs 第二条300毫秒

```jsx
import _ from "lodash"
import { nanoid } from 'nanoid';

export function createMessage(type,context, speed = 100) {
    return {
        id: nanoid(10),
        type,
        text: context,
        speed
    }
}

export const typingDirective = {
    //通过vue指令实现打字机效果
    typing: {
        inserted: function (el, { value }) {
            //存放定时器id
            initTyping(el, value)
            startTyping(el, value)
        },
        update: function (el, payload) {
            resetTyping(el, payload)
        },
        unbind: function (el) {
            if (el._typing?.rafId) {
                cancelAnimationFrame(el._typing.rafId)
                el._typing = null
            }
        }
    }
}

function initTyping(el, { speed = 100 }) {
    if (!el._typing) {
        el._typing = {
            rafId: undefined,
            speed
        }
    } else {
        el._typing.speed = speed
    }
}

function startTyping(el, value) {
    const { text } = value;
    const speed = el._typing.speed
    let i = 0
    let lastTime;

    el.textContent = ''
    function typeWriter(timestamp) {
        if (!lastTime || timestamp - lastTime >= speed) {
            lastTime = timestamp
            //需要执行打字输入操作
            if (i < text.length){
                el.innerHTML += text.charAt(i++)
            }else{
                cancelAnimationFrame(el._typing.rafId)
                el._typing.rafId = null
                return;
            }
        }
        el._typing.rafId = requestAnimationFrame(typeWriter)
    }

    el._typing.rafId = requestAnimationFrame(typeWriter)
}

function resetTyping(el, { value, oldValue }) {
    if (!_.isEqual(value, oldValue)) {
        //清除动画循环
        initTyping(el, value)
        startTyping(el, value)
    }
}
```

```jsx 
import { typingDirective, createMessage } from '@/utils/typingUtils'

export defaut {
		 directives: typingDirective,
		 methods: {
		        add() {
		            this.chatMessages.push(createMessage('ai','这里是AI小助手，请问有什么可以帮您？', 300))
		        },
		        edit(value = '', index = 0) {
		            this.$set(this.chatMessages, index, {
		                ...this.chatMessages[index],
		                text: '插入一条内容~'
		            })
		        }
			}
 }
```

### 添加css打字效果 ###

```scss
.message-content {
    position: relative;
    background-color: #fff;
    padding: 10px 15px;
    border-radius: 8px;
    max-width: 70%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    word-break: break-word;

    display: inline-block;

    &.show-cursor::after {
        content: "";
    }

    &::after {
        display: inline-block;
        content: none; 
        font-size: 20px;
        width: .8125rem;
        height: .8125rem;
        border-radius: 50%;
        background-color: rgb(59, 55, 55);
        animation: blink 1s infinite;
        position: relative;
        // 这里暂时有光标对不齐问题，待解决 临时手动用bottom:1px调整
        bottom: 1px;
        vertical-align: middle;
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 1
        }

        50% {
            opacity: 0
        }
    }
}
```

可以采用采用伪元素选择器 `::after `来设置自定义光标动画，现在遇到了一个关于动态更新的小问题。

我通过指令的形式来生成打字机效果，在指令中仅能获取到当前元素的 `el`（DOM 元素）以及传入的参数 `payload`，那如何动态更新当前会话条的状态并在页面显示呢？

这里采用自定义事件 `CustomEvent` 将事件绑定在DOM元素上。

```jsx
//状态 ready,pending,done
function setStatus(el,status){
    el.dispatchEvent(new CustomEvent('typing-status', { detail: { status} }))
}
```

`@typing-status` 接收状态

```html
<div v-if="message.type === 'ai'" class="message-content" 
  :class="{'show-cursor':message.status==='pending'}" v-typing="message"
   @typing-status="handleTypingStatus(index, $event)"></div>
```

```jsx
  //更新状态
	 handleTypingStatus(index, event) {
		   this.$set(this.chatMessages[index], 'status', _.get(event, 'detail.status'))
   }
```

## 三、连接AI接口 ##

实际对接接口的时候与我预想的不一致，如果统一等待接口全部内容返回再执行，等待时间过长，并且匀速输出字符会失去了人类的"思考感"，最终修改采用*流式输出进行逐字回复*。

### 采用fetch对接AI接口 ###

> 💡 为什么不使用 axios：axios 的 response.data 是缓冲后的完整数据，若要模拟流式输出，需通过 `onDownloadProgress` 监听字节流，但无法直接解析结构化数据（如 JSON 块）

```js
// axios 模拟流处理（仅适用于简单文本流）
axios.get('https://api.ai.com/stream', {
  responseType: 'stream',
  onDownloadProgress: (event) => {
    const chunk = event.currentTarget.responseText; // 仅能获取累积文本
  },
});
```

**fetch调用代码**

```jsx
export function callAI(userInput) {
    //流式输出需要采用fetch
    return fetch('访问URL', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json','
            Authorization: 'Bearer 这里是你的密钥'
        },
        body: JSON.stringify({
            inputs: {},
            query: userInput,
            response_mode: "streaming",
            conversation_id: "",
            user: "angelina",
            files: []
        })
    }).catch(error => {
        console.error('AI接口请求失败:', error);
        throw error;
    });
}
```

接口获取内容进行解析，因为我这里没有后端进行处理，直接前端对接AI接口的这里可能需要对内容重新格式化一下。（目前仅支持当前页面只有一条会话在进行回复）

> PS: 有用到了lodash库，如果直接拷贝的话需要注意。

```jsx 
callAI(userInput)
  .then(res => res.body)
  .then(body => {
    // 创建可读流并通过TextDecoderStream解码为文本
    const reader = body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = ''; // 用于累积AI返回的文本片段

    // 异步读取循环 - 持续从流中获取数据
    const readLoop = async () => {
      while (true) {
        const { done, value } = await reader.read();
        
        // 流读取完成时的处理
        if (done) {
	        // 当前流已经结束
          this.setMessageStatus(aiMessageIndex, 'done');
          break;
        }
        
        // 处理接收到的数据块
        // 这里因为我是前端直接对接接口，部分数据需要重新处理，实际使用时这部分可能是后端实现
        const chunk = `{${value.replace(/\n/g, '')}}`.replace('{data:', '{"data":');
        
        try {
          // 解析JSON并提取回复内容
          const chunkObj = JSON.parse(chunk);
          const answer = _.get(chunkObj, 'data.answer');
          
          if (answer) {
            buffer += answer; // 累积回复内容
            this.changeMessage(aiMessageIndex, buffer); // 更新UI显示
            this.setMessageStatus(aiMessageIndex, 'pending'); // 设置消息状态
          }
        } catch (e) {
          // 忽略解析错误（可能是不完整的JSON片段）
        }
      }
    };

    // 启动读取循环
    readLoop();
  });
```

### 加载中动画 ###

通过css样式实现  动画加载库css-loaders.com/dots/

```css
/* 加载中动画  */
    .loader {
        display: inline-block;
        position: relative;
        margin-left: $dot-size;
        width: $dot-size;
        aspect-ratio: 1;
        border-radius: 50%;
        animation: l5 1s infinite linear alternate;
        margin-right: $dot-size;
    }

    @keyframes l5 {
        0% {
            box-shadow: $dot-space 0 #000, -($dot-space) 0 #0002;
            background: #000
        }

        33% {
            box-shadow: $dot-space 0 #000, -($dot-space) 0 #0002;
            background: #0002
        }

        66% {
            box-shadow: $dot-space 0 #0002, -($dot-space) 0 #000;
            background: #0002
        }

        100% {
            box-shadow: $dot-space 0 #0002, -($dot-space) 0 #000;
            background: #000
        }
```

### 如何保证滚动条实时的滚动到底部 ###

可以通过操作 DOM 的 `scrollTop` 属性实现。

`容器.scrollTop = 容器.scrollHeight - 容器.clientHeight;`

额外在增加一个阈值，在接近底部适当的距离时再开始进行自动吸底；为了防止首次渲染内容超出监控滚动阈值，当用户滚动到距离底部 `容器高度 * 0.2` 时，启用自动吸底功能。另外为了防止频繁操作，记录当前的 `ScrollHeight` 是否发生变化；

为支持平滑处理的浏览器设置平滑滚动效果。

```jsx
        scrollToBottom(scrollTopBottom = false) {
            // 确保 DOM 更新完成后再执行滚动
            this.$nextTick(() => {
                const container = this.$refs.scrollableContainer;
                if (!container) return;

                // 1. 强制滚动的情况（如首次加载）
                if (scrollTopBottom) {
                    smoothScroll(container)
                    return;
                }

                // 2. 内容未变化，不处理
                if (this.lastScrollHeight === container.scrollHeight) return;

                // 3. 计算是否应该自动滚动 这里很重要扩大底部的距离防止内容增加不滚动
                const threshold = container.clientHeight * 0.2;
                const isNearBottom = container.scrollTop + container.clientHeight >= this.lastScrollHeight - threshold;

                // 4. 需要滚动则执行
                if (isNearBottom) {
                    smoothScroll(container)
                }
            });
            const smoothScroll = (container)=> {
                //优化 支持平滑处理的浏览器
                if ('scrollBehavior' in document.documentElement.style) {
                    container.scrollTo({
                        top: container.scrollHeight - container.clientHeight,
                        behavior: 'smooth'
                    });
                } else {
                    container.scrollTop = container.scrollHeight - container.clientHeight
                }
                this.lastScrollHeight = container.scrollHeight;
            }
        },
```

到这里我们的需求就实现啦具体的对接接口的效果涉及到内部业务就不在这里展示了。

## 四、额外扩展了解 ##

### 使用第三方库实现打字效果 ###

#### typed.js ####

- 官网地址：mattboldt.github.io/typed.js/
- 该库设计为一次性渲染预设字符串，不支持动态更新。
- MIT（免费商用，需保留版权声明）

#### TypeIt ####

- 官网地址：www.typeitjs.com/
- 该库支持光标点样式、自定义动画速度曲线、链式调用等高级功能，但是存在协议。
