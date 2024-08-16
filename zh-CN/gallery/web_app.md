---
layout: doc
# 开启推荐
recommended: true
mermaids: 1
---

## 简介 ##

基于 Maui 实现跨平台的 Hybird 应用平台，通过 `iframe` 和 `jsbridge` 的封装，完成子系统的嵌套及系统通信。

## 架构 ##

![Maui Hybird](/images/cmono-image.png){data-zoomable}


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


MAUI [^1]

[^1]: .NET MAUI
