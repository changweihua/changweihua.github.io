---
layout: doc
# 开启推荐
recommended: true
mermaids: 1
pageClass: gallery-page-class
---

## 微前端简介 ##

微前端是微服务概念在前端的应用。在微前端架构下，一个大型单一的前端应用被拆分成多个小型、独立的子应用，这些子应用可以**独立开发**、**独立部署**、**独立运行**，从而带来更加灵活高效的项目开发和管理，但在用户看来仍然是内聚的单个产品。

> An architectural style where independently deliverable frontend applications are composed into a greater whole.

作为现代前端开发的趋势，许多企业的技术栈融入了微前端，有些是选择成熟的框架如 Qiankun、Micro-App 或 Single-SPA，有些是自研解决方案。

> 微前端最简单的实现形式是基于Iframe。

### 关于微前端概念的误区 ###

- 微前端不是一门具体的技术，而是整合了技术、策略和方法，可能会以脚手架、配套工具和规范约束等等成体系的形式综合呈现，是一种宏观上的架构。这种架构目前有多种方案，各有利弊，但只要适用业务场景的就是好方案。
- 微前端本身并没有技术栈的约束（技术栈无关不是微前端的固然要求）。每一套微前端方案的设计，都是基于实际需求出发。如果是多团队统一使用了 React 技术栈，可能对微前端方案的跨技术栈使用并没有要求；如果是多团队同时使用了 React 和 Vue 技术栈，可能就对微前端的跨技术栈要求比较高。
- 微前端要求各个应用能独立开发、测试、部署，但并不要求各个应用能独立运行。也就是说，微前端的粒度不一定是应用级的，也有可能是页面级，甚至组件级。

### 微前端的发展 ###

实现微前端的主流方案就已经多达 20 多种，实现的方式也是五花八门，至于应用微前端技术的产品之多，那就更数不清了。
就这个成果来看，当时的想法可以说是非常具有前瞻性🐮🐮。
如果再往前追溯，“微前端”其实是受到了 2014 年正式提出的“微服务（Microservices）”概念的启发。

> 微服务是指一种软件架构风格，以专注于单一责任与功能的小型功能区块 (Small Building Blocks) 为基础，利用模块化的方式组合出复杂的大型应用程序，各功能区块使用与语言无关 (Language-Independent/Language agnostic）的 API 集相互通信。

- 在技术上：
  - “微前端”和“微服务”需要解决的问题是共通的（你看，连定义都是这么相像...），简单说起来就是：应用随着项目迭代越来越庞大，耦合度升高，以致缺乏灵活性，难以维护。
- 在团队协作上：
  - 康威定律指出，设计系统的架构受制于产生这些设计的组织的沟通结构。它指出了组织架构越庞大，其系统间沟通成本越高的问题。
  - 解决这一问题的有效手段就是，将大的系统拆分成一个个微小的，可以独立自治的子系统。一旦系统的依赖限制在了内部，功能上更加内聚，对外部的依赖变少，那么就能显著的减少跨系统之间的沟通成本了。
  - 简单来说，康威定律的指导思想就是：既然沟通是大问题，那么就不要沟通就好了。所以，微前端(微服务架构)也关注如何解决组织和团队间协作带来的工程问题，而不是单纯的某个技术问题。
- 在业务上：
  - 选择前端微服务化的原因却刚好与“解耦”、“拆分”相反——人们更想要的结果是聚合，尤其是那些 To B 的应用。比如大家熟悉的各类云服务网站、以及大部分的中台应用。
  - 在“聚合”这一目标上，面临的另一个重大困难来自遗留系统。在既不重写原有系统的基础之下，又可以抽出人力来开发新的业务，对于业务和技术人员来说， 是一个相当吸引力的特性。这也是微前端大受欢迎的主要原因之一。

```markup

# 微前端要解决的问题

## 技术

- 应用随着项目迭代越来越庞大，耦合度升高，以致缺乏灵活性，难以维护

## 团队协作

- 组织架构越庞大，其系统间沟通成本越高

## 业务

- 用户青睐组合，一体化的前端应用 & 兼容遗留系统

```

### 微前端的特点 ###

- **技术栈无关** 主框架不限制接入应用的技术栈，子应用可自主选择技术栈
- **独立开发/部署** 子应用仓库独立，单独部署，互不依赖
- **增量升级** 当一个应用庞大之后，技术升级或重构相当麻烦，而微应用具备渐进式升级的特性
- **独立运行** 子应用之间运行时互不依赖，有独立的状态管理
- **提升效率** 微应用可以很好拆分项目，提升协作效率
- **可维护性** 微前端可以更容易地进行维护和测试，因为它们具有清晰的界限和独立的代码库


### 微前端的劣势 ###

- **增加了系统复杂度** 需要对系统进行拆分，将单体应用拆分成多个独立的微前端应用。这种拆分可能导致系统整体变得更加复杂，因为需要处理跨应用之间的通信和集成问题
- **需要依赖额外的工具和技术** 例如模块加载器、应用容器等，这些工具和技术需要额外的学习和维护成本，也可能会导致一些性能问题
- **安全性问题** 由于微前端应用是独立的，它们之间可能存在安全隐患。例如，如果某个微前端应用存在漏洞，攻击者可能会利用这个漏洞来攻击整个系统
- **兼容性问题** 由于微前端应用是独立的，它们之间可能存在兼容性问题。例如，某个微前端应用可能使用了一些不兼容的依赖库，这可能会导致整个系统出现问题
- **开发团队需要有一定的技术水平** 实现微前端需要开发团队有一定的技术水平，包括对模块化、代码复用、应用集成等方面有深入的了解。如果团队缺乏这方面的技能，可能会导致微前端实现出现问题


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
