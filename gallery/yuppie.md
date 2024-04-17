---
layout: doc
# 开启推荐
recommended: true
---

![服务对象](/yuppie.svg){data-zoomable}

::: info 项目简介
- 包含智能网关的统一平台
- 支持多端融合
:::

## 项目架构 ##

<div class="grid grid-cols-1 md:grid-cols-1">

![Yuppie平台网络架构图](/images/yuppie_network_arch.png){data-zoomable}

</div>

## 平台结构 ##

<LiteTree>
- Yuppie                   //   {color:red}important
    Guardance 应用网关
        认证鉴权
    Yuppie API
        .NET9
        MySQL
        Redis
        Rabbit
        SMS
        QuartZ
    移动端
        MiniProgram
        Flutter
        Uni-APP
</LiteTree>


## 项目预览 ##

<div style="width: 100%;height:50%;" class="grid grid-cols-1 gap-4">
  <video controls muted autoplay loop width="100%" height="100%" >
    <source src="/videos/QQ_20240105143902.mp4" type="video/mp4">
  </video>
</div>
