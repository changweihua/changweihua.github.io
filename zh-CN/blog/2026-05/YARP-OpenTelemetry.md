---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET YARP + OpenTelemetry
description: 网关链路追踪实战
date: 2026-05-22 11:35:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

微服务项目里，接口慢了、报错了、偶发超时了，最怕的不是失败本身，而是不知道请求到底卡在哪一层。

比如一个很常见的链路：

```text
浏览器
  |
  v
YARP Gateway
  |
  v
ProductService
  |
  v
OrderService
```

如果只看普通日志，经常只能看到：

```text
Gateway 收到请求
ProductService 收到请求
OrderService 收到请求
```

但很难一眼看出：

- 这几条日志是不是同一次请求产生的
- 请求在网关花了多久
- 转发到后端花了多久
- 后端服务之间调用花了多久
- 哪一段失败了
- TraceId 是什么

`OpenTelemetry` 解决的就是这类问题。

它可以把一次请求经过的多个服务串成一条链路：

```text
Gateway Span
  |
  +-- YARP Forwarder Span
        |
        +-- ProductService Span
              |
              +-- HttpClient Span
                    |
                    +-- OrderService Span
```

这样排查问题时，不再只看零散日志，而是能看到完整调用链。

## OpenTelemetry 是什么？ ##

`OpenTelemetry` 通常简称 `OTel`，它是一个开放标准，用来收集和导出可观测性数据。

可观测性一般分三类：

| 类型 | 说明 |
| :--- | :--- |
|  Logs  | 日志，记录发生了什么 |
|  Metrics  | 指标，例如请求数、耗时、错误率 |
|  Traces  | 链路追踪，记录一次请求跨服务经过了哪些步骤 |

这篇重点讲 `Traces`。

在 .NET 里，链路追踪底层主要依赖：

```txt
System.Diagnostics.Activity
System.Diagnostics.ActivitySource
```

`OpenTelemetry` 会采集这些 `Activity`，再导出到 Jaeger、Zipkin、Grafana Tempo、Azure Monitor、Elastic APM 等系统。

## YARP 和 OpenTelemetry 的关系 ##

`YARP` 本身是 `ASP.NET Core` 组件，所以它可以和普通 ASP.NET Core 应用一样接入 OpenTelemetry。

YARP 官方文档里提到：

- YARP 支持基于 `OpenTelemetry` 的分布式追踪
- 有监听器时，ASP.NET Core 会传播或创建 `trace-id`
- YARP 可以为代理转发请求创建 `activity`
- YARP 的 `ActivitySource` 名称是 `Yarp.ReverseProxy`
- 想看到代理转发相关 `span`，需要同时添加 `AddSource("Yarp.ReverseProxy")` 和 `AddHttpClientInstrumentation()`

所以网关里最关键的配置就是：

```csharp
using OpenTelemetry.Exporter;

// ...

.WithTracing(tracing => tracing
    .AddAspNetCoreInstrumentation()
    .AddHttpClientInstrumentation()
    .AddSource("Yarp.ReverseProxy")
    .AddOtlpExporter(options =>
    {
        options.Protocol = OtlpExportProtocol.HttpProtobuf;
        options.Endpoint = new Uri("http://localhost:4318/v1/traces");
    }));
```

其中：

| 配置 | 作用 |
| :--- | :--- |
| `AddAspNetCoreInstrumentation` | 采集进入 `ASP.NET Core` 的请求 |
| `AddHttpClientInstrumentation` | 采集通过 `HttpClient` 发出的请求，YARP 转发也需要它 |
| `AddSource("Yarp.ReverseProxy")` | 监听 YARP 自己创建的代理转发 `span` |
| `AddOtlpExporter` | 通过 `OTLP` 协议导出到后端观测系统 |

## Demo 目标 ##

这个 Demo 会做一个完整链路：

```text
GET /api/products/1/with-orders
        |
        v
Gateway
        |
        v
ProductService
        |
        v
OrderService
```

最终在 Jaeger 里看到一条完整 Trace：

```text
Gateway
  -> YARP 转发
    -> ProductService
      -> HttpClient 调用 OrderService
        -> OrderService
```

项目结构：

```text
YarpOtelDemo
├── Gateway
├── ProductService
└── OrderService
```

端口规划：

| 服务 | 地址 |
| :--- | :--- |
| Jaeger UI | `http://localhost:16686` |
| OTLP HTTP | `http://localhost:4318/v1/traces` |
| OTLP gRPC | `http://localhost:4317` |
| Gateway | `http://localhost:5000` |
| ProductService | `http://localhost:5101` |
| OrderService | `http://localhost:5201` |

## 启动 Jaeger ##

本地演示可以直接用 Jaeger `all-in-one`。

```bash
docker run --rm --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:1.57
```

启动后打开：

```text
http://localhost:16686
```

这个 Demo 主线使用 `4318`，也就是 OTLP HTTP。对应的导出地址是：

```text
http://localhost:4318/v1/traces
```

`4317` 是 OTLP gRPC 端口，理论上也能用，但在本地 Docker、Jaeger 镜像版本、gRPC/HTTP2 支持不一致时更容易踩坑。为了让 Demo 更稳定，下面统一使用 `4318`。

## 创建项目 ##

```bash
mkdir YarpOtelDemo
cd YarpOtelDemo

dotnet new sln -n YarpOtelDemo

dotnet new web -n Gateway
dotnet new web -n ProductService
dotnet new web -n OrderService

dotnet sln add Gateway/Gateway.csproj
dotnet sln add ProductService/ProductService.csproj
dotnet sln add OrderService/OrderService.csproj
```

给 Gateway 安装包：

```bash
dotnet add Gateway/Gateway.csproj package Yarp.ReverseProxy
dotnet add Gateway/Gateway.csproj package OpenTelemetry.Extensions.Hosting
dotnet add Gateway/Gateway.csproj package OpenTelemetry.Instrumentation.AspNetCore
dotnet add Gateway/Gateway.csproj package OpenTelemetry.Instrumentation.Http
dotnet add Gateway/Gateway.csproj package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

给后端服务安装包：

```bash
dotnet add ProductService/ProductService.csproj package OpenTelemetry.Extensions.Hosting
dotnet add ProductService/ProductService.csproj package OpenTelemetry.Instrumentation.AspNetCore
dotnet add ProductService/ProductService.csproj package OpenTelemetry.Instrumentation.Http
dotnet add ProductService/ProductService.csproj package OpenTelemetry.Exporter.OpenTelemetryProtocol

dotnet add OrderService/OrderService.csproj package OpenTelemetry.Extensions.Hosting
dotnet add OrderService/OrderService.csproj package OpenTelemetry.Instrumentation.AspNetCore
dotnet add OrderService/OrderService.csproj package OpenTelemetry.Instrumentation.Http
dotnet add OrderService/OrderService.csproj package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

## Gateway 配置 ##

修改 Gateway/Program.cs：

```csharp
using System.Diagnostics;
using OpenTelemetry.Exporter;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("Gateway"))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddSource("Yarp.ReverseProxy")
            .AddOtlpExporter(options =>
            {
                options.Protocol = OtlpExportProtocol.HttpProtobuf;
                options.Endpoint = new Uri("http://localhost:4318/v1/traces");
            });
    });

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        var traceId = Activity.Current?.TraceId.ToString();

        if (!string.IsNullOrWhiteSpace(traceId))
        {
            context.Response.Headers["X-Trace-Id"] = traceId;
        }

        return Task.CompletedTask;
    });

    await next();
});

app.MapGet("/gateway/ping", () => Results.Ok(new
{
    Service = "Gateway",
    TraceId = Activity.Current?.TraceId.ToString(),
    Time = DateTimeOffset.Now
}));

app.MapReverseProxy();

app.Run();
```

这里有两个重点。

第一个重点是：

```csharp
.AddSource("Yarp.ReverseProxy")
```

它负责监听 YARP 自己创建的转发 span。

第二个重点是：

```csharp
.AddHttpClientInstrumentation()
```

YARP 转发请求底层会走 HTTP 客户端相关能力，所以这个配置不能漏。

`X-Trace-Id` 响应头只是为了本地排查方便。浏览器、curl、前端日志里能直接看到当前请求的 TraceId，方便去 Jaeger 里搜索。

修改 `Gateway/appsettings.json`：

```json
{
  "Urls": "http://localhost:5000",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information",
      "Yarp": "Information"
    }
  },
  "AllowedHosts": "*",
  "ReverseProxy": {
    "Routes": {
      "product-route": {
        "ClusterId": "product-cluster",
        "Match": {
          "Path": "/api/products/{**catch-all}"
        },
        "Transforms": [
          {
            "PathRemovePrefix": "/api"
          }
        ]
      }
    },
    "Clusters": {
      "product-cluster": {
        "Destinations": {
          "product-1": {
            "Address": "http://localhost:5101/"
          }
        }
      }
    }
  }
}
```

这个网关只代理商品服务。商品服务内部再调用订单服务，这样能看到更长的链路。

## ProductService 配置 ##

修改 ProductService/Program.cs：

```csharp
using System.Diagnostics;
using System.Net.Http.Json;
using OpenTelemetry.Exporter;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("orders", client =>
{
    client.BaseAddress = new Uri("http://localhost:5201");
});

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("ProductService"))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddOtlpExporter(options =>
            {
                options.Protocol = OtlpExportProtocol.HttpProtobuf;
                options.Endpoint = new Uri("http://localhost:4318/v1/traces");
            });
    });

var app = builder.Build();

app.MapGet("/products/{id:int}/with-orders", async (
    int id,
    IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("orders");
    var orders = await client.GetFromJsonAsync<OrderDto[]>($"/orders/by-product/{id}");

    return Results.Ok(new
    {
        Service = "ProductService",
        Product = new { Id = id, Name = $"Product-{id}", Price = 100 + id },
        Orders = orders ?? Array.Empty<OrderDto>(),
        TraceId = Activity.Current?.TraceId.ToString()
    });
});

app.MapGet("/products/{id:int}", (int id) =>
{
    return Results.Ok(new
    {
        Service = "ProductService",
        Product = new { Id = id, Name = $"Product-{id}", Price = 100 + id },
        TraceId = Activity.Current?.TraceId.ToString()
    });
});

app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

public sealed record OrderDto(int Id, int ProductId, int Count, decimal Amount);
```

这里的关键是 ProductService 会通过 HttpClient 调用 OrderService：

```csharp
var orders = await client.GetFromJsonAsync<OrderDto[]>($"/orders/by-product/{id}");
```

因为加了：

```csharp
.AddHttpClientInstrumentation()
```

所以这次服务间 HTTP 调用也会产生 span。

## OrderService 配置 ##

修改 OrderService/Program.cs：

```csharp
using System.Diagnostics;
using OpenTelemetry.Exporter;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("OrderService"))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddOtlpExporter(options =>
            {
                options.Protocol = OtlpExportProtocol.HttpProtobuf;
                options.Endpoint = new Uri("http://localhost:4318/v1/traces");
            });
    });

var app = builder.Build();

app.MapGet("/orders/by-product/{productId:int}", async (int productId) =>
{
    await Task.Delay(80);

    return Results.Ok(new[]
    {
        new OrderDto(1001, productId, 2, 398),
        new OrderDto(1002, productId, 1, 199)
    });
});

app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

public sealed record OrderDto(int Id, int ProductId, int Count, decimal Amount);
```

这里加了一个 `Task.Delay(80)`，只是为了让链路图上能更明显看到 OrderService 的耗时。

## 启动服务 ##

启动 OrderService：

```bash
dotnet run --project OrderService/OrderService.csproj --urls http://localhost:5201
```

启动 ProductService：

```bash
dotnet run --project ProductService/ProductService.csproj --urls http://localhost:5101
```

启动 Gateway：

```bash
dotnet run --project Gateway/Gateway.csproj
```

访问接口：

```bash
curl -i http://localhost:5000/api/products/1/with-orders
```

响应里会看到类似：

```text
X-Trace-Id: 2b1c9ffaf39fadc2f1ec05dd4d96b3e0
```

响应体里也会看到：

```json
{
  "service": "ProductService",
  "product": {
    "id": 1,
    "name": "Product-1",
    "price": 101
  },
  "orders": [
    {
      "id": 1001,
      "productId": 1,
      "count": 2,
      "amount": 398
    }
  ],
  "traceId": "2b1c9ffaf39fadc2f1ec05dd4d96b3e0"
}
```

## 在 Jaeger 查看链路 ##

打开：

```text
http://localhost:16686
```

在左侧服务列表里可以看到：

```text
Gateway
ProductService
OrderService
```

选择 Gateway，点击查询。

一条完整 Trace 大概会包含这些 span：

```text
Gateway: GET /api/products/{**catch-all}
Yarp.ReverseProxy: proxy forwarder
ProductService: GET /products/{id}/with-orders
System.Net.Http: GET http://localhost:5201/orders/by-product/1
OrderService: GET /orders/by-product/{productId}
```

从这条链路里能直接看出：

- 请求总耗时
- 网关耗时
- 代理转发耗时
- 商品服务耗时
- 商品服务调用订单服务耗时
- 订单服务接口耗时

如果某一段报错，Jaeger 里也能看到对应 span 的错误状态。

## TraceId 是怎么传下去的？ ##

OpenTelemetry 默认使用 W3C Trace Context。

请求从网关转发到后端时，会携带类似这样的请求头：

```text
traceparent: 00-2b1c9ffaf39fadc2f1ec05dd4d96b3e0-8c7f3e6b9e7b4d12-01
```

其中：

```text
2b1c9ffaf39fadc2f1ec05dd4d96b3e0
```

就是 TraceId。

后端服务收到这个请求头后，会继续复用同一个 TraceId，并创建自己的 span。

所以同一次请求跨过多个服务以后，仍然可以被追踪系统串成一条链路。

## Activity、Trace、Span 怎么理解？ ##

这几个词很容易混。

可以这样理解：

| 概念 | 说明 |
| :--- | :--- |
|  Trace  |  一次完整请求链路  |
|  Span  |  链路中的一个步骤  |
|  Activity  |  .NET 里对 Span 的实现  |
|  TraceId  |  一整条链路的 ID  |
|  SpanId  |  某一个步骤的 ID  |

例如：

```text
TraceId = abc
  Span 1：Gateway 收到请求
  Span 2：YARP 转发请求
  Span 3：ProductService 处理请求
  Span 4：ProductService 调用 OrderService
  Span 5：OrderService 处理请求
```

这些 span 的 TraceId 相同，但 SpanId 不同。

## 给日志加 TraceId ##

链路追踪解决的是可视化调用链，但日志依然很重要。

更实用的做法是：日志里也带上 TraceId。

可以在网关里加一个简单中间件：

```csharp
app.Use(async (context, next) =>
{
    using var scope = app.Logger.BeginScope(new Dictionary<string, object?>
    {
        ["TraceId"] = Activity.Current?.TraceId.ToString()
    });

    await next();
});
```

然后日志格式里输出 `scope` 信息。这样看到某条错误日志后，可以拿 TraceId 去 Jaeger 查完整链路。

## 采样策略 ##

本地 Demo 通常希望所有请求都采集。

生产环境不一定要 100% 采样，尤其是高流量网关。

可以配置采样器：

```csharp
using OpenTelemetry.Exporter;

// ...

.WithTracing(tracing =>
{
    tracing
        .SetSampler(new TraceIdRatioBasedSampler(0.1))
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSource("Yarp.ReverseProxy")
        .AddOtlpExporter(options =>
        {
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
            options.Endpoint = new Uri("http://localhost:4318/v1/traces");
        });
});
```

`0.1` 表示大约采样 10% 的 Trace。

常见策略：

| 策略 | 场景 |
| :--- | :--- |
| `AlwaysOnSampler` | 本地调试、低流量系统 |
| `TraceIdRatioBasedSampler` |  高流量生产系统  |
| 按错误采样 | 需要配合后端观测平台或 Collector |

生产网关流量大时，采样比例要结合请求量、存储成本和排障需求一起定。

## 过滤不重要的请求 ##

健康检查、静态资源、探活接口通常不需要进链路追踪。

可以在 `AspNetCoreInstrumentation` 里过滤：

```csharp
.AddAspNetCoreInstrumentation(options =>
{
    options.Filter = context =>
    {
        var path = context.Request.Path;
        return !path.StartsWithSegments("/health")
            && !path.StartsWithSegments("/alive");
    };
})
```

这样 `/health`、`/alive` 就不会被采集。

对网关项目来说，过滤健康检查很有必要，否则 Jaeger 里会充满探活请求。

## 和日志、指标怎么配合？ ##

`OpenTelemetry` 不只做 Traces，也能做 Logs 和 Metrics。

但落地时不建议一口气把所有东西都堆上去。更稳的顺序是：

```text
第一步：先把 Trace 串起来
第二步：日志里带 TraceId
第三步：关键接口加 Metrics
第四步：统一接入告警
```

网关层最值得关注的指标包括：

- 请求总数
- 请求耗时
- 代理转发耗时
- 4xx 数量
- 5xx 数量
- 后端连接失败次数
- 每个 route / cluster 的错误率

## 常见问题 ##

### Jaeger 里只有 jaeger-all-in-one ###

如果 Service 下拉框里只有：

```text
jaeger-all-in-one
```

说明 Jaeger 自己运行正常，但 .NET 应用的 Trace 还没有成功写进去。

按下面顺序排查。

#### 第一步，确认已经真正请求过网关接口 ####

```bash
curl -i http://localhost:5000/api/products/1/with-orders
```

只打开 Jaeger UI 不会产生 Gateway、ProductService、OrderService 的 Trace。必须先访问业务接口，应用产生 span 后，Jaeger 里才会出现对应服务。

#### 第二步，确认 Jaeger 的 OTLP 端口已经暴露 ####

```bash
docker ps
```

端口映射里应该能看到：

```text
0.0.0.0:4317->4317/tcp
0.0.0.0:4318->4318/tcp
0.0.0.0:16686->16686/tcp
```

如果没有 4317 或 4318，说明 Jaeger 启动命令不完整。重新启动：

```bash
docker run --rm --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:1.57
```

#### 第三步，看 .NET 应用控制台有没有导出失败日志 ####

常见错误包括：

```text
connection refused
deadline exceeded
failed to export
```

这类错误通常说明应用连不上 `http://localhost:4318/v1/traces`。

#### 第四步，确认 .NET 应用是不是跑在 Docker 里 ####

如果 .NET 服务直接跑在宿主机上：

```csharp
options.Protocol = OtlpExportProtocol.HttpProtobuf;
options.Endpoint = new Uri("http://localhost:4318/v1/traces");
```

通常没问题。

如果 .NET 服务也跑在 Docker 容器里，localhost 指的是应用容器自己，不是宿主机，也不是 Jaeger 容器。这时要改成 Docker 网络里的 Jaeger 服务名，或者使用宿主机地址。

例如 Docker Compose 里服务名叫 jaeger，则写：

```csharp
options.Protocol = OtlpExportProtocol.HttpProtobuf;
options.Endpoint = new Uri("http://jaeger:4318/v1/traces");
```

#### 第五步，确认 4318 的协议和路径写完整 ####

正确写法：

```csharp
using OpenTelemetry.Exporter;

// ...

.AddOtlpExporter(options =>
{
    options.Protocol = OtlpExportProtocol.HttpProtobuf;
    options.Endpoint = new Uri("http://localhost:4318/v1/traces");
});
```

4318 是 OTLP HTTP 端口，必须配 `OtlpExportProtocol.HttpProtobuf`，地址也要带 `/v1/traces`。

不要只写：

```csharp
options.Endpoint = new Uri("http://localhost:4318");
```

这样只是写了端口，但没有告诉导出器使用 OTLP HTTP，也没有写 HTTP traces 接口路径。

如果要使用 4317，那是 OTLP gRPC 写法：

```csharp
options.Endpoint = new Uri("http://localhost:4317");
```

4317 不需要 `/v1/traces`。这个 Demo 主线不使用 4317，只作为可选方案说明。

#### 第六步，确认三个服务都配置了导出器 ####

至少要有：

```csharp
using OpenTelemetry.Exporter;

// ...

.AddOtlpExporter(options =>
{
    options.Protocol = OtlpExportProtocol.HttpProtobuf;
    options.Endpoint = new Uri("http://localhost:4318/v1/traces");
});
```

如果只有网关配置了 OpenTelemetry，Jaeger 里最多只能看到 Gateway。后端服务也要配置后，才能看到 ProductService 和 OrderService。

#### 第七步，确认 Jaeger UI 没有卡在旧的固定时间范围 ####

Jaeger 搜索页 URL 里如果带着：

```text
start=...
end=...
```

说明当前页面可能在查一个固定时间段。即使左侧看起来选了 Last Hour，也可能仍然显示旧结果。

最简单的处理方式是直接打开干净地址：

```text
http://localhost:16686/search
```

然后重新选择 Service，选择 Last Hour 或 Last 5 Minutes，再点击 Find Traces。

也可以直接用 API 查最近 5 分钟：

```bash
curl "http://localhost:16686/api/traces?service=Gateway&lookback=5m&limit=20"
```

如果 API 能查到新 Trace，但 UI 还是旧数据，就是 UI 查询条件没刷新。

#### 第八步，用 ConsoleExporter 判断问题在采集还是导出 ####

临时安装：

```bash
dotnet add Gateway/Gateway.csproj package OpenTelemetry.Exporter.Console
dotnet add ProductService/ProductService.csproj package OpenTelemetry.Exporter.Console
dotnet add OrderService/OrderService.csproj package OpenTelemetry.Exporter.Console
```

然后在 `.WithTracing(...)` 里追加：

```csharp
.AddConsoleExporter()
```

例如：

```csharp
.WithTracing(tracing =>
{
    tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSource("Yarp.ReverseProxy")
        .AddOtlpExporter(options =>
        {
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
            options.Endpoint = new Uri("http://localhost:4318/v1/traces");
        })
        .AddConsoleExporter();
});
```

如果控制台能打印 span，说明应用采集没有问题，问题在 OTLP 到 Jaeger 或 Jaeger UI 查询条件。

如果控制台也没有打印 span，说明 AddAspNetCoreInstrumentation、AddHttpClientInstrumentation 或当前运行进程没有生效。

### Jaeger 里只有 Gateway，没有后端服务 ###

常见原因：

- 后端服务没有安装 OpenTelemetry 包
- 后端服务没有配置 AddAspNetCoreInstrumentation
- 后端服务没有配置 AddOtlpExporter
- 后端服务连不上 localhost:4318/v1/traces
- Docker 网络和宿主机地址写错

本地直接运行 .NET 服务时，`http://localhost:4318/v1/traces` 通常可以访问宿主机上的 Jaeger。

如果服务也跑在 Docker 里，localhost 指的是容器自己，需要改成 Docker 网络里的 Jaeger 服务名。

### Jaeger 里没有 YARP 转发 span ###

重点检查网关是否配置了：

```csharp
.AddSource("Yarp.ReverseProxy")
.AddHttpClientInstrumentation()
```

YARP 官方文档明确提到，这两个配置对代理请求 span 很关键。

### TraceId 断了，没有串成一条链 ###

常见原因：

- 中间代理移除了 traceparent
- 自定义 HttpClient 清理了追踪头
- 某个服务没有启用 OpenTelemetry
- 使用了非 W3C 的自定义追踪头，但没有配置 propagator

正常情况下，ASP.NET Core 和 HttpClient 会自动处理 W3C Trace Context。

### curl 响应里没有 X-Trace-Id ###

X-Trace-Id 是 Demo 里自己加的响应头，不是 OpenTelemetry 自动生成的标准响应头。

需要确认网关代码里有：

```csharp
context.Response.Headers["X-Trace-Id"] = traceId;
```

链路追踪本身不依赖这个响应头。它只是为了方便从客户端拿到 TraceId。

### 生产环境一定要用 Jaeger 吗？ ###

不一定。

Jaeger 很适合本地和自建环境。生产环境还可以选择：

- Grafana Tempo
- Zipkin
- Azure Monitor / Application Insights
- Elastic APM
- Datadog
- New Relic
- OpenTelemetry Collector + 后端存储

关键不是选哪个 UI，而是服务都通过统一协议导出 Trace。OTLP 就是现在最常见的通用出口。

## 生产环境注意点 ##

### 服务名要稳定 ###

```csharp
.ConfigureResource(resource => resource.AddService("Gateway"))
```

服务名会出现在 Jaeger、Grafana、APM 平台里。

不要频繁变化，也不要写成：

```text
test
demo
api
service1
```

更推荐：

```text
gateway
product-service
order-service
payment-service
```

### 不要把敏感信息写进 span ###

Trace 里不要记录：

- 密码
- Token
- 身份证号
- 银行卡号
- 完整手机号
- 大段请求体

Trace 是排障数据，不是业务数据仓库。

### 网关层要控制采样 ###

网关是流量入口，Trace 数据增长会很快。

生产环境建议：

- 设置采样比例
- 过滤健康检查
- 限制标签数量
- 控制高基数字段
- 结合错误采样

### Collector 比服务直连后端更稳 ###

本地 Demo 让服务直接发到 Jaeger：

```text
.NET Service -> Jaeger
```

生产环境更推荐：

```text
.NET Service -> OpenTelemetry Collector -> Jaeger / Tempo / APM
```

Collector 可以统一做：

- 批量发送
- 重试
- 采样
- 脱敏
- 路由
- 多后端导出

## 总结 ##

YARP + OpenTelemetry 的核心配置并不复杂：

- Gateway 加 AddAspNetCoreInstrumentation
- Gateway 加 AddHttpClientInstrumentation
- Gateway 加 AddSource("Yarp.ReverseProxy")
- 所有服务加 AddOtlpExporter
- 后端服务也接入 OpenTelemetry
- 请求头 traceparent 自动向下传播
- Jaeger / Tempo / APM 根据 TraceId 串起完整链路

网关层接入链路追踪以后，排查方式会从“翻多份日志猜问题”变成“按 TraceId 看完整请求路径”。这对微服务项目非常关键，尤其是网关、认证、服务发现、灰度发布都叠加以后，Trace 基本属于必备能力。
