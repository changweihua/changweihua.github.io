---
layout: doc
# 开启推荐
recommended: true
mermaids: 1
---

## 引言  {#custom-id} ##

:::demo

```vue
<script lang="ts" setup>
import { isSpecialBooleanAttr } from '@vue/shared'
</script>

<template>
  <h1>演示： vite-plugin-vue-preview</h1>
  <span>readonly is special boolean attr: {{ isSpecialBooleanAttr('readonly') }}</span>
</template>
```

:::


微前端是微服务概念在前端的应用。在微前端架构下，一个大型单一的前端应用被拆分成多个小型、独立的子应用，这些子应用可以独立开发、独立部署、独立运行，从而带来更加灵活高效的项目开发和管理。

作为现代前端开发的趋势，许多企业的技术栈融入了微前端，有些是选择成熟的框架如 Qiankun、Micro-App 或 Single-SPA，有些是自研解决方案。

> 微前端最简单的实现形式是基于Iframe。

~~世界是平坦的。~~ 我们现在知道世界是圆的。

去露营了！ :tent: 很快回来。

真好笑！ :joy:

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### 一个完善的微前端框架 ###

- 子应用的激活和卸载能力-
  - 页面从主应用切换到子应用，子应用切换到另一个子应用，框架需要正确加载资源、渲染页面、切换流畅
- 子应用独立运行能力
  - 需要考虑到子应用运行后不污染主应用的css/js/window/location等对象
- 应用通信能力
  - 需要设计主应用和子应用通信，子应用互相通信的能力
- 路由切换能力
  - 接入子应用后，需要不影响浏览器正常的前进、后退、URL展示

## 隔离 ##

由于使用的是iframe标签，两个子应用天然地存在CSS和JS隔离，不会有样式和运行时的冲突。

## 微前端 why iframe not div? ##

为什么微前端使用iframe做隔离，而不是普通div。

主要是因为iframe在浏览器中具有天然的隔离环境，主要表现在：

- JavaScript 隔离：iframe 内的 JavaScript 运行在独立的全局上下文中。这意味着，iframe 内的 JavaScript 变量和函数不会影响到主页面，反之亦然。这种特性对于确保应用间不会相互干扰是非常重要的。
- 样式隔离：iframe 内的样式不会影响到外部页面。每个 iframe 有自己的文档流，所以里面的 CSS 只会作用于 iframe内部，不会泄露到外部，这保证了样式的独立性和一致性。
- DOM 隔离：每个 iframe 都有自己的 DOM 树，与主页面的 DOM 树完全隔离。这意味着，iframe 内的 DOM 操作不会影响到外部页面，减少了应用间的直接 DOM 冲突。

这些隔离特性对于普通的div标签是没有的。

## 共享(通信) ##

虽然iframe能实现简单的微前端架构，但是通过代码中设计的全局事件总线，我们可以看出基于iframe的微前端需要单独设计跨域通信方式。

本方案主要是通过PostMessage方法实现的。PostMessage 是一种安全地实现不同浏览器窗口（包括弹出窗口和iframe）间通信的方式。允许不同源（origin）的窗口进行数据交换，从而克服了同源策略的限制。适用于多种场景，如页面与弹出窗口、页面与嵌入的iframe、甚至是不同的web workers之间的通信。

此处引入自己编写的 `maui-jsbridge`[^maui-jsbridge] npm包, `H5微应用平台`[^H5微应用平台], `Maui Hybird 架构`[^MauiHybird], 基本符合功能预期 。

### 主应用 ###


**广播消息**

```ts
import { FrameCommands, MauiJsBridge } from 'maui-jsbridge'

const close = () => {
    resetFrame()
    MauiJsBridge.broadcastMessage({
        command: FrameCommands.CLOSING,
        data: {
            title: '广播消息'
        }
    }, '*')
    delay(function () {
        router.replace({
            path: '/'
        });
    }, 500)
};
```

**消息转发**

```ts
const sendReceivedMessageToAllIframes = (event) => {
  document
    .querySelectorAll('iframe')
    .forEach((iframe) => iframe.contentWindow.postMessage(event.data, '*'));
};
```

**接收消息**

```ts
import { onMounted, onBeforeUnmount } from 'vue'
import { FrameCommands, IFrameMessage, MauiJsBridge } from 'maui-jsbridge'

onMounted(async () => {
  MauiJsBridge.init(window, handleMessage)
})

let allowedDomains = [window.origin, window.location.origin]

if (appStore.appPermissions) {
  allowedDomains = allowedDomains.concat(appStore.appPermissions.flatMap(_ => _.applications.map(__ => __.homePage)))
}

const handleMessage: (event: MessageEvent<IFrameMessage>) => void = (event) => {
  if (!allowedDomains.includes(event.origin)) {
     console.warn('不确定来源:', event.origin);
     return
  }

  // 处理来自可信源和特定的类型的消息
  console.log('可信来源数据:', event.data);

  if (!event.data) {
    return
  }

  // 根据上面制定的结构来解析iframe内部发回来的数据
  const { command, data } = event.data;
  console.log(data);
  switch (command) {
    case FrameCommands.ROUTE_BACK:
      console.log('Token失效,需返回登录页')
      appStore.setAccessToken('')
      router.replace(defaultLoginPath)
      break;
    default:
      break;
  }
};

onBeforeUnmount(() => {
  MauiJsBridge.dispose()
});
```

### 子应用 ###

**初始化**

```ts
appReady(import.meta.env.VUE_APP_OWNER_HOST).then(() => {
    router
        .isReady()
        .then(() => {
            app.mount('#app')
        })
        .catch((err: any) => {
            console.error(err)
        })
})
```

```ts
import { useAppStore } from '@/stores'
import { getUserInfo } from './api'
import { showFailToast } from 'vant'
import { IFrameMessage } from 'maui-jsbridge'

type AppReadyMessage = {
    iFrameReady: boolean
    appCode: string
    accessToken: string
}

const appReady = function (hostOrgin = 'http://localhost:3000') {
    console.log('check app ready')
    const { getAccessToken } = useAppStore()

    return new Promise(async (resolve, reject) => {
        function waitAppReady(e: MessageEvent<IFrameMessage>) {
            console.log(`${hostOrgin}, ${e.origin.toString()}`)
            if (`${e.origin}` !== hostOrgin) {
                console.log('不能访问')
                return
            }


            if (e && e.data && e.data.data) {
                console.log('waitAppReady', e.data)

                const { accessToken, appCode, iFrameReady } = e.data.data as AppReadyMessage

                if (!iFrameReady) {
                    return
                }

                const { setAccessToken, setAppCode } = useAppStore()

                console.log('收到消息')
                setAccessToken(accessToken);
                setAppCode(appCode);
                window.removeEventListener('message', waitAppReady)

                resolve(true)
            }

            // getUserInfo({
            //     accessToken, appCode
            // }).then(res => {
            //     if (res.errCode === -1) {
            //         showFailToast(res['errorMessage'])
            //         return
            //     }
            //     console.log('res', res)

            //     const { setAccessToken, setAppCode } = useAppStore()

            //     console.log('收到消息')
            //     setAccessToken(accessToken);
            //     setAppCode(appCode);
            //     window.removeEventListener('message', waitAppReady)

            //     resolve(true)
            // })
        }

        if (getAccessToken() === '') {
            console.log('app ready pending')

            window.addEventListener('message', waitAppReady)
        } else {
            console.log('app ready')
            resolve(true)
        }
    })
}

export default appReady
```


**发送消息**

```ts
import { MauiJsBridge } from 'maui-jsbridge'

MauiJsBridge.attach(window.parent)

MauiJsBridge.postMessage()
```

**接收消息**

```ts
import { onMounted, onBeforeUnmount } from 'vue'
import { FrameCommands, IFrameMessage, MauiJsBridge } from 'maui-jsbridge'

const appStore = useAppStore()
const { setAccessToken } = appStore

onMounted(async () => {
  MauiJsBridge.init(window, handleMessage);
});

const handleMessage = (event: MessageEvent<IFrameMessage>) => {
  if (event.origin !== import.meta.env.VUE_APP_OWNER_HOST) {
    console.warn('不确定来源:', event.origin);
    return
  }

  // 处理来自可信源和特定的类型的消息
  console.log('可信来源数据:', event.data);

  const { command, data } = event.data;
  console.log('handleMessage', command, data)
  switch (command) {
    case FrameCommands.CLOSING:
      setAccessToken('')
      MauiJsBridge.detach()
      break;
    default:
      break;
  }
};

onBeforeUnmount(() => {
  MauiJsBridge.detach()
  setAccessToken('')
});
```

## 总结 ##

一个 iframe 具备四层能力：文档的加载能力、HTML 的渲染能力、独立执行 JavaScript 的能力、隔离样式的能力。

这些能力，其实也是微前端项目设计的核心要求。通过学习本项目，我们可以很好地初步学习微前端，为后来深入学习Single-SPA、qiankun等框架提供理论基础。

## 标准案例 ##

### 无锡硕放机场新生产统计系统 ###

<div class="grid grid-cols-3 gap-4">

![alt text](/images/cmono-微信图片_20240816150009.png){data-zoomable}

![alt text](/images/cmono-微信图片_20240816150020.png){data-zoomable}

![alt text](/images/cmono-微信图片_20240816150027.png){data-zoomable}

</div>


[^maui-jsbridge]: *[maui-jsbridge](https://www.npmjs.com/package/maui-jsbridge)*

[^H5微应用平台]: *[H5微应用平台](/zh-CN/gallery/maui.md)*

[^MauiHybird]: *[MauiHybird架构](/zh-CN/gallery/web_app.md)*
