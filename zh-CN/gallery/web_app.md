---
layout: doc
# 开启推荐
recommended: true
mermaids: 1
pageClass: gallery-page-class
---

## 简介 ##

基于 Maui 实现跨平台的 Hybird 应用平台，通过 `iframe` 和 `jsbridge` 的封装，完成子系统的嵌套及系统通信。

> 所有系统通信均校验内置的Ogirin限制，最大程度保障通信安全。

::: code-group

```sh [npm]
npm add -D vitepress
```
```sh [pnpm]
pnpm add -D vitepress
```
```sh [yarn]
yarn add -D vitepress
```
```sh [bun]
bun add -D vitepress
```
:::

<!-- <i class="i-custom:circle" /> -->

<!-- <i class="i-mono:juejin" /> -->

<!-- <i class="i-mono:juejin text-#1E80FF" /> -->

## 架构 ##

```mermaid
block
  columns 6
  block:software:4
    columns 1

    block:webapps
      %% columns auto (default)
      WEBAPP1 space WEBAPP2 space WEBAPP3
    end

    blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)

    WebView

    blockArrowId7<["&nbsp;&nbsp;&nbsp;"]>(down)

    Maui

    blockArrowId8<["&nbsp;&nbsp;&nbsp;"]>(down)

    block:platforms
      %% columns auto (default)
      iOS space Android space HarmonyOS space .etc
    end

    blockArrowId9<["&nbsp;&nbsp;&nbsp;"]>(down)

    硬件
  end
  blockArrowId1<["&nbsp;&nbsp;&nbsp;"]>(left)
  JsBridge:1
  
```

<!-- > [!NOTE]
> 强调用户在快速浏览文档时也不应忽略的重要信息。

> [!TIP]
> 有助于用户更顺利达成目标的建议性信息。

> [!IMPORTANT]
> 对用户达成目标至关重要的信息。

> [!WARNING]
> 因为可能存在风险，所以需要用户立即关注的关键内容。

> [!CAUTION]
> 行为可能带来的负面影响。 -->

<!-- ![](https://img.shields.io/badge/any_text-you_like-blue)

![](https://img.shields.io/badge/just_do_it-blue?style=for-the-badge&logo=alipay&logoColor=1677FF&label=%E6%94%AF%E4%BB%98%E5%AE%9D&labelColor=lightgrey)

[![](https://img.shields.io/badge/just_do_it-blue?style=for-the-badge&logo=alipay&logoColor=1677FF&label=%E6%94%AF%E4%BB%98%E5%AE%9D&labelColor=lightgrey)](https://shields.io/badges) -->

## 流程 ##

```mermaid
sequenceDiagram
	participant A as Host
	participant B as WebAPP
	participant C as MAUI
	participant D as Hardware
	participant E as 新生产
	participant F as 工具单

	A->>A:宿主应用启动
	A->>B:宿主内访问
    activate B
	    B-->>B:检测Token

        alt 未登录
            B->>B:监听消息
            A-->>B:发送Token
        end
        opt 已登录
            B-->>B:启动程序
            B->>A:程序启动完成
        end
        B->>E:获取用户信息
	  deactivate B
    
    E-->>B:返回用户信息
      activate B
        alt 调用接口
          B->>E:携带Token请求
          E-->>B:返回结果
          B->>F:携带Token请求
          F-->>B:返回结果
        end

        opt 调用硬件
          B->>D:JSBridge调用
          D-->>B:返回结果
        end
      deactivate B

	%% left or right
	note left of A:整体基于<br>iframe架构
```

## 案例 ##

### 无锡硕放机场新生产统计系统 ###

<div class="grid grid-cols-3 gap-4">

![示例图](/images/cmono-微信图片_20240816150009.png){data-zoomable}

![示例图](/images/cmono-微信图片_20240816150020.png){data-zoomable}

![示例图](/images/cmono-微信图片_20240816150027.png){data-zoomable}

</div>

MAUI [^1]

[^1]: .NET MAUI
