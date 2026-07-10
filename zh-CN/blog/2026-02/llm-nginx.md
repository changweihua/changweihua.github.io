---
lastUpdated: true
commentabled: true
recommended: true
title: 私有化部署 LLM 时，别再用 Nginx 硬扛流式请求了
description: 推荐一个专为 `vLLM/TGI` 设计的高性能网关
date: 2026-02-02 09:45:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

在私有化部署开源大模型（如 `Llama 3`、`Qwen`、`Mistral`）时，很多团队会直接用 `Nginx` 作为反向代理，将流量转发给 `vLLM` 或 `TGI` 后端。这在非流式请求下工作良好，但一旦启用 `stream=true`，问题就来了：

- 需手动关闭 `proxy_buffering`，否则首 `token` 延迟显著增加
- SSE 响应头（`Content-Type: text/event-stream`）需显式设置
- 连接超时、chunk 丢失、代理缓冲等问题频发
- 更不用说后续的 `token` 用量统计、多实例负载均衡等需求

最近注意到一个新开源项目 [LLMProxy](https://github.com/aiyuekuang/LLMProxy)，它没有试图成为“另一个 Nginx”，而是*专注解决 LLM 流量调度这一具体问题*，设计非常克制：

## ✅ 核心能力 ##

- 协议感知：自动识别 OpenAI API 中的 `stream` 字段，分别处理流式（SSE）与非流式（JSON）请求

- 零缓冲透传：SSE 响应逐 token 转发，不引入额外延迟，保障 TTFT（Time to First Token）

- 异步用量计量：请求结束后，将 `prompt_tokens` + `completion_tokens` 通过 HTTP Webhook 推送给业务系统，便于实现配额或计费

- 轻量无依赖：单 Go 二进制，镜像 `< 20MB`，配置仅需 YAML，不连接数据库，不影响主链路性能

- 生产就绪：内置 `Prometheus` 指标、健康检查、多后端负载均衡（轮询/最少连接）

|  能力  |  Nginx（通用反向代理）  |   LLMProxy（LLM 专用网关）  |
| :-----------: | :----: | :----: |
| 流式请求支持 |  需手动配置 `proxy_buffering off`、`proxy_cache off`、`proxy_http_version 1.1` 等，易出错  |  开箱即用：自动识别 `stream=true`，设置正确 SSE 头并透传流 |
| 首 Token 延迟（TTFT） |  若配置不当，缓冲会导致显著延迟  |  零缓冲透传，TTFT ≈ 后端原生延迟 |
| 协议理解能力 |  无语义感知，仅转发字节流  |  原生解析 OpenAI API，识别 `/v1/chat/completions` 和 `stream` 字段 |
| 用量计量（token 计数） |  需额外日志解析 + 离线处理，延迟高、易丢失  |  请求结束后异步上报 `prompt_tokens/completion_tokens` 到 Webhook，结构化、可靠 |
| 多后端负载均衡 |  支持，但需手动配置 `upstream` + `health_check`  |  内置轮询/最少连接策略，自动剔除故障节点 |
| 部署复杂度 |  配置文件冗长，调试困难（尤其 SSE）  |  单 YAML 文件，5 行配置即可运行 |
| 镜像体积 |  官方镜像 `～150MB+`  |  `< 20MB`（Alpine + Go 静态编译） |
| 扩展性 |  需 Lua（OpenResty）才能实现高级逻辑  |  专注 LLM 场景，不追求通用性，避免过度设计 |
| 监控集成 |  需额外模块（如 Prometheus Nginx Exporter）  |  内置 `Prometheus` 指标（请求量、延迟、Webhook 成功率等） |
| 适用场景 |  通用 Web 服务、静态资源、API 网关  |  专为 vLLM / TGI / OpenAI 兼容后端设计 |

## 🚀 快速体验 ##

```bash
# 1. 准备配置（指向你的 vLLM/TGI 地址）
wget https://raw.githubusercontent.com/aiyuekuang/LLMProxy/main/config.yaml.example -O config.yaml

# 2. 启动服务
docker run -d \
  --name llmproxy \
  -p 8080:8080 \
  -v $(pwd)/config.yaml:/home/llmproxy/config.yaml \
  ghcr.io/aiyuekuang/llmproxy:latest
```

客户端即可通过 `http://localhost:8080/v1/chat/completions` 访问，无需关心后端细节。

## 🎯 适用场景 ##

- 企业内部 LLM 助手平台，需统一入口与用量追踪
- 多租户 MaaS（Model-as-a-Service）服务，按客户计量 token 消耗
- vLLM/TGI 集群的高可用接入层，避免单点故障

项目采用 MIT 开源协议，代码结构清晰，文档包含架构图、部署示例、Grafana 监控面板，定位明确：不做通用网关，只做好 LLM 专用代理。
