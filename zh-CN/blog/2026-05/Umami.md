---
lastUpdated: true
commentabled: true
recommended: true
title: Umami 轻量级网站访问分析工具
description: Umami 轻量级网站访问分析工具
date: 2026-05-08 09:15:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 一 、部署 Umami ##

### 服务器准备 ###

确保服务器已安装 Docker 和 Docker Compose：

## 二、检查版本 ##

```bash
docker --version
docker compose version
```

## 三、 创建 docker-compose.yml ##

在服务器上创建项目目录并编写配置文件：

```bash
mkdir -p /opt/umami && cd /opt/umami
```

docker-compose.yml 内容如下：

```yaml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "8484:3000"
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@db:5432/umami
      APP_SECRET: ${UMAMI_APP_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

volumes:
  umami-db-data:
```

说明：

- Umami 容器内部端口是 3000，这里映射到宿主机的 8484
- 数据库密码和应用密钥通过 .env 文件注入，不要硬编码在 yml 中
- PostgreSQL 数据通过 volume 持久化，删除容器不会丢失数据
- healthcheck 确保数据库就绪后 Umami 才启动

## 四、 配置环境变量 ##

在同目录创建 `.env` 文件，设置密钥（不要用默认值）：

```bash
cat > .env << 'EOF'
UMAMI_DB_PASSWORD=your_strong_password_here
UMAMI_APP_SECRET=your_random_secret_here
EOF
```

生成随机密钥可以用：

```bash
openssl rand -hex 32
```

## 五、启动服务 ##

```bash
docker compose up -d
```

## 六、 验证运行状态 ##

```bash
 docker compose ps
 docker compose logs -f umami
```

服务启动后访问 `http://服务器IP:8484`，默认账号：

- 用户名：admin
- 密码：umami

登录后立即修改密码！

### 如果需要 HTTPS（推荐） ###

如果服务器已有 Nginx 做反向代理，在 Nginx 配置中加：

```txt
location / {
    proxy_pass http://127.0.0.1:8484;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

然后端口 8484 就不需要对外开放了，只需要 80/443。

## Umami 与 Sentry 及其他分析工具的对比 ##

### 工具定位总览 ###

|  工具   |      核心定位 |    隐私友好  |  可自托管   |      脚本体积  |    适用场景  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| Umami | 隐私优先的网站流量分析 | 无 Cookie，不采集个人数据 |  开源免费自托管   |  ~2KB |    轻量级网站访问统计  |
| Plausible | 简洁的网站流量分析 | 无 Cookie，GDPR 友好 |  开源可自托管（付费云）   |      ~1KB |    极简流量分析  |
| Matomo | 全功能网站分析 | 支持数据匿名化和同意管理 |  开源可自托管   |      ~23KB |    企业级、政府机构的 GA 替代方案  |
| PostHog | 产品分析一体化平台 | 支持自托管 |  社区版可自托管（功能受限）   |      较大 |    产品分析、A/B 测试、会话回放、特性开关  |
| Google Analytics | 商业网站分析 | 差（多国 DPA 已裁定违规） |  不支持   |      较大 |    广告投放优化、深度商业分析  |
| Sentry | 错误监控与性能追踪 | 非核心关注点 |  开源可自托管   |      SDK 较大 |    应用崩溃追踪、错误堆栈分析、实时告警  |

### Umami vs Sentry：何时用哪个？ ###

这两者不是竞品，而是互补关系：

- Umami 回答的问题是："有多少人访问了我的网站？他们从哪里来？看了哪些页面？"——是流量分析工具。
- Sentry 回答的问题是："我的应用哪里报错了？错误频率多高？影响了多少用户？"——是错误监控工具，提供详细的堆栈追踪、请求上下文和实时告警工作流。

> 推荐做法：两者同时部署。Umami 提供流量全局视图，Sentry 作为 Bug 的安全网。

### 关键差异点 ###

- 隐私合规：Umami 和 Plausible 默认无 Cookie，是 GDPR 合规最简单的方案；Matomo 需要额外配置数据匿名化。
- 功能深度：Umami/Plausible 专注基础指标（PV、UV、来源、地理分布）；Matomo 提供热力图和会话录制；PostHog 提供漏斗分析、用户留存、特性开关等产品分析能力。
- 性能影响：Umami 脚本仅 ~2KB，对页面性能几乎无影响；Matomo 脚本约 23KB，相差一个数量级。
- 成本：Umami 自托管成本固定且可预测（一台 VPS 即可，不按 PV 计费）。

## 自定义 Umami 界面与仪表盘 ##

### Boards（自定义仪表盘）— v3.1.0 新功能 ###

Umami v3.1.0 引入了 Boards 功能，这是一个灵活的自定义仪表盘系统：

- 支持在自由网格布局中组合图表、表格、关键指标等组件
- 每个组件可绑定到不同的网站，实现跨站点的统一视图
- 支持拖拽和调整大小来排列组件
- 可在团队内分享或复制仪表盘
- 可通过设置 `ALLOWED_FRAME_URLS` 环境变量将 `Board` 嵌入到其他网页中

### 报表功能 ###

- 支持独立的 UTM 参数报表和详细数据报表
- 统一的筛选器支持 OR 条件、正则表达式、多选比较
- v3.1.0 集成了 Core Web Vitals 追踪
- 支持会话回放（Session Replay）功能

### 主题与外观 ###

- 内置深色模式 / 浅色模式切换（左下角太阳图标）
- Umami 基于 Next.js 构建，自托管用户可以 fork 源码后自行修改 CSS/组件样式
- 官方未提供独立的 CSS 主题配置文件或主题插件系统——如需深度定制 UI 外观，需直接修改源码

### 公开分享 ###

- 可创建公开仪表盘（Public Dashboard），通过链接分享给无需登录的用户

## 将 Umami 数据发送到其他后端 ##

### REST API（核心集成方式） ###

Umami 提供完整的 REST API，所有界面上能做的操作都有对应的 API 端点：

- 认证方式：`POST /api/auth/login` 获取 Bearer Token
- 常用端点：

  - `GET /api/websites/{id}/stats` — 获取网站统计数据
  - `GET /api/websites/{id}/events` — 获取事件数据

- 官方客户端：提供 TypeScript 客户端（@umami/api-client）和 Python 客户端（umami-analytics）

### 自定义数据收集端点 ###

通过 Tracker 脚本配置，可以控制数据发送的目标：

```html
<!-- 将追踪数据代理到你自己的域名 -->
<script defer src="https://your-umami.com/script.js"
  data-website-id="xxx"
  data-host-url="https://your-proxy-domain.com">
</script>
```

- `data-host-url`：让事件不直接发送到 Umami 服务器，而是通过你自己的域名代理转发（也有助于绕过广告拦截器）
- `COLLECT_API_ENDPOINT`：服务端环境变量，可自定义收集端点路径（默认为 `/api/send`）

### 事件追踪 API ###

在前端通过 JavaScript 发送自定义事件：

```javascript
// 追踪自定义事件及附加数据
umami.track('signup-button', { name: 'newsletter', id: 123 });
```

这些事件数据存储到 Umami 数据库后，可通过 API 或直接查询数据库获取。

### 数据库直接访问 ###

- Umami v3 仅支持 PostgreSQL（不再支持 MySQL）
- 自托管用户可直接用 SQL 查询原始数据，或通过 ETL 工具同步到数据仓库
- 这是最灵活的集成方式，适合需要自定义分析或数据归档的场景

### 关于 Webhook ###

- 原生 Webhook 尚未内置（社区有 Feature Request：GitHub Issue #2218）
- 替代方案：通过 cron 定时任务调用 API 拉取数据，再推送到你的系统

