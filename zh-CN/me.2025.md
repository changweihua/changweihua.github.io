---
layout: doc
pageClass: gallery-page-class
---

<ClientOnly>
  <HexagonHolder>
    <text
          x="150"
          y="150"
          font-size="20"
          text-anchor="middle"
          fill="#6feffa"
        >
          2025
        </text>
        <text
          x="150"
          y="230"
          font-size="14"
          text-anchor="middle"
          fill="#6feffa"
        >
          小结
        </text>
  </HexagonHolder>
</ClientOnly>

<script lang="ts" setup>
import HexagonHolder from '@/components/HexagonHolder.vue'
</script>


> [!IMPORTANT] 年度关键词
> 开花不一定结果，努力一定不会辜负青春。
> 
> 2025 对饮 2026 笃行。

<llm-exclude>
## Section for humans

This content will not be in the generated files for LLMs
</llm-exclude>

### MAUI 系列 ###

- 基于 Vant 的脚手架，主要针对 H5（包含内嵌微信小程序端）。
- 基于 Ant Design Vue 的脚手架，主要针对 WEB PC 端。
- 基于 iFrame 的微前端，主要针对以 iframe 形式内嵌其他系统集成的。


> [!NOTE] 备注
> 以上项目均已在无锡硕放机场的内部系统及小程序上得到实际应用和测试。

### Yolo 8 ~ 13 ###

- Yolo 技术的深入研究，模型训练。
- 为机场行李识别或危险品识别提供技术储备。
- 配合 OpenCV，实现动态图像实时判定。

![](/images/QQ20250805135713.png){data-zoomable}

> [!TIP] 备注
> 主要基于 Windows 平台。

### Envoy 开放认证授权平台 ###

- 集成Envoy的网关，网关支持JWKS认证和RBAC鉴权、流量控制、多种认证机制、镜像访问。
- Docker Compose 部署，Seq 等日志平台。


> [!WARNING] 备注
> 完整的 Docker 集成

### AI Gallery ###

- 本地搭建 Ollama 大模型，AnythingLLM 向量支持，本地调用，实现 SSE 输出。
- 学习 Agent 和 MCP，实现智能调用，目前已完成可独立部署和调用。
- 搭建 WPF 客户端，实现模型的切换、历史消息记录等功能，后续可独立作为客户端投入应用。
- 搭建基于本地 Docker 的 Dify 平台，接入 MCP 能力。

![](/images/QQ20250805135713.png){data-zoomable}

### 华东凯亚雀巢平台 ###

- 负责移动端应用架构，搭建基于H5的移动平台框架。
- 优化平台架构，[统一认证授权平台](/zh-CN/manual/kyt.md)。
- 搭建基于 `iframe` 的微前端架构，通过 `postMessage` 实现组件的全局通信，封装功能组件，实现抽象继承能力。
- 封装 `maui-jsbridge`，`maui-vant`，`maui-shell` 等移动端 npm 库。

> [!CAUTION] 备注
> 内部系统，无法展示。

### 常州奔牛国际机场行李智能测量项目 ###

- 试运行中

### 无锡硕放机场旅客服务平台 ###

- 完成原有阳光服务平台剥离，同时与旅客服务平台的深度集成。
- 参与 AI 相关开发，处理 SSE 数据流并显示。

![](/images/ai_sse.gif){data-zoomable}

### 扬州泰州国际机场智慧出行小程序 ###

- 指定扬泰机场完成微信认证和备案。
- 上线巴士管家功能模块。
- 更新小程序图片资源。





<!-- <Robot /> -->

```sh
npm i // [!=npm auto]
npm run build // [!=npm auto]
npm run test // [!=npm auto]
```

<!-- <HoverableText title="2025" /> -->

<i class="i-ci-svc-live" style="font-size:72px;"></i>
