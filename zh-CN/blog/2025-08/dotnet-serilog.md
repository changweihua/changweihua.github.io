---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET Serilog 详解
description: C#.NET Serilog 详解
date: 2025-08-25 13:45:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`Serilog` 是 `.NET` 平台中非常流行且强大的结构化日志库，其最大特点是“结构化日志记录（`Structured Logging`）”，支持通过键值对记录丰富的上下文信息，并且拥有强大的 Sink 插件系统，支持写入控制台、文件、数据库、`Elasticsearch`、`Seq` 等。

## Serilog 核心概念 ##

| 概念  |  说明  | 
| :-------: | :---------: |
| Logger | 日志记录器实例 |
| Sink | 日志的输出目标，如 `Console`、`File`、`Elasticsearch` 等 |
| Enrichment | 日志信息的丰富，比如自动记录线程ID、机器名等上下文信息 |
| Filter | 日志的筛选器 |
| Structured Logging | 日志以键值对形式记录，便于搜索和分析 |

## 安装 Serilog（NuGet 包） ##

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Async
```

## 基础配置示例 ##

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting up");
    // 启动主程序或 ASP.NET Core 应用
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}
```

## ASP.NET Core 集成方式 ##

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 配置 Serilog 替换默认日志
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); // 使用 Serilog

builder.Services.AddControllers();
var app = builder.Build();
app.MapControllers();
app.Run();
```

## appsettings.json 配置方式 ##

```json
"Serilog": {
  "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
  "MinimumLevel": {
    "Default": "Information",
    "Override": {
      "Microsoft": "Warning",
      "System": "Warning"
    }
  },
  "Enrich": [ "FromLogContext", "WithThreadId" ],
  "WriteTo": [
    {
      "Name": "Console"
    },
    {
      "Name": "File",
      "Args": {
        "path": "Logs/log-.txt",
        "rollingInterval": "Day",
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
      }
    }
  ]
}
```

配合 `NuGet` 包：

```bash
dotnet add package Serilog.Settings.Configuration
```

## Serilog Sink 示例 ##

| Sink 名称  |  说明  | 
| :-------: | :---------: |
| Serilog.Sinks.Console | 输出到控制台 |
| Serilog.Sinks.File | 输出到文件 |
| Serilog.Sinks.Seq | 输出到 Seq 可视化平台 |
| Serilog.Sinks.Elasticsearch | 输出到 Elasticsearch |
| Serilog.Sinks.Async | 异步包装器 |
| Serilog.Sinks.MSSqlServer | 写入 SQL Server |

## 基本用法 ##

### 基本结构化日志 ###

```csharp
var orderId = 123;
var customerId = 456;

// 结构化日志记录
Log.Information("处理订单 {OrderId} 来自客户 {CustomerId}", orderId, customerId);

// 输出示例（JSON 格式）：
// {
//   "OrderId": 123,
//   "CustomerId": 456,
//   "Message": "处理订单 123 来自客户 456",
//   "Level": "Information"
// }
```

### 复杂对象序列化 ###

```csharp
var order = new Order { Id = 123, Products = new List<string> { "Book", "Pen" } };
Log.Information("创建订单 {@Order}", order);
// 输出: 创建订单 {"Id": 123, "Products": ["Book", "Pen"]}
```

### 上下文丰富（Enrichers） ###

```csharp
// 为当前作用域添加属性
using (LogContext.PushProperty("RequestId", Guid.NewGuid()))
{
    Log.Information("处理请求");
    // 所有日志自动附加 RequestId 属性
}
```

```csharp
// 添加全局属性
Log.Logger = new LoggerConfiguration()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentUserName()
    .CreateLogger();

// 添加临时上下文
using (LogContext.PushProperty("RequestId", Guid.NewGuid())) {
    Log.Information("处理请求");
}
```

常用 `Enrichers`

```csharp
.Enrich.WithProperty("AppVersion", "1.0.0")
.Enrich.FromLogContext()
.Enrich.WithThreadId()
```

### 文件滚动 ###

按日期或大小滚动日志文件：

```csharp
.WriteTo.File("logs/app-.log",
    rollingInterval: RollingInterval.Day,
    fileSizeLimitBytes: 10_000_000,
    retainedFileCountLimit: 30)
```

- `rollingInterval`：按天滚动。
- `fileSizeLimitBytes`：限制文件大小（10MB）。
- `retainedFileCountLimit`：保留 30 个文件。

### 数据库 Sink ###

```bash
dotnet add package Serilog.Sinks.MSSqlServer
```

```csharp
.WriteTo.MSSqlServer(
    connectionString: "Server=.;Database=Logs;Trusted_Connection=True;",
    sinkOptions: new MSSqlServerSinkOptions { TableName = "Logs" })
```

### 过滤日志 ###

#### 通过过滤器控制日志 ####

```csharp
.Filter.ByExcluding(logEvent => logEvent.Properties.ContainsKey("SensitiveData"))
```

#### JSON 配置 ###

```json
"Filter": [
  {
    "Name": "ByExcluding",
    "Args": {
      "expression": "SourceContext = 'Microsoft.*'"
    }
  }
]
```

## 配置 HTTP 上下文 ##

### 高级用法 ###

### 动态日志级别 ###

```csharp
var levelSwitch = new LoggingLevelSwitch(LogEventLevel.Information);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.ControlledBy(levelSwitch)
    .WriteTo.Console()
    .CreateLogger();

// 运行时调整级别
levelSwitch.MinimumLevel = LogEventLevel.Debug;
```

### 自定义输出模板 ###

```csharp
.WriteTo.Console(outputTemplate:
    "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties}{NewLine}{Exception}")
```

### 错误日志特殊处理 ###

```csharp
.WriteTo.Logger(lc => lc
    .Filter.ByIncludingOnly(e => e.Level == LogEventLevel.Error)
    .WriteTo.File("logs/errors.txt"))
```

### 请求日志中间件 ###

```csharp
app.UseSerilogRequestLogging(options => 
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("User", httpContext.User.Identity.Name);
        diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress);
    };
});
```

### 异步日志 ###

```csharp
.WriteTo.Async(a => a.File("logs/async.log"))
```

### 批量写入 ###

```csharp
// 使用 PeriodicBatchingSink 实现批处理
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.PeriodicBatchingSink(
        new HttpSink("https://logserver/api/logs"),
        batchSizeLimit: 100,
        period: TimeSpan.FromSeconds(2))
    .CreateLogger();
```

### 使用配置文件初始化 ###

```csharp
using Serilog;
using Serilog.Settings.Configuration;

var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();
```

### 条件性日志记录 ###

```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(e => e.Level == LogEventLevel.Error)
        .WriteTo.File("logs/errors.log"))
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(e => e.Level == LogEventLevel.Information)
        .WriteTo.Console())
    .CreateLogger();
```

### 级别动态控制 ###

```csharp
.MinimumLevel.Override("Microsoft", LogEventLevel.Warning)  // 抑制第三方库日志
```

### 轻量级序列化 ###

```csharp
.WriteTo.File(new CompactJsonFormatter(), "logs/compact.json")  // 节省存储
```

### 异步批处理配置 ###

```csharp
.WriteTo.Async(a => a.Elasticsearch(), batchSize: 1000)
```

#### 参数调优 ####

- `batchSize`：根据网络延迟调整（建议 500-5000）
- `blockWhenFull`：队列满时阻塞而非丢弃

### 零分配渲染（ZeroAllocation） ##

```csharp
var log = new LoggerConfiguration()
    .Destructure.ByTransforming<User>(u => new { u.Id, u.Name })
    .CreateLogger();

// 避免 ToString() 分配
Log.Information("用户 {@User} 登录", user); 
```

### 自定义 Sink 开发 ###

```csharp
public class CustomSink : ILogEventSink {
    public void Emit(LogEvent logEvent) {
        var json = JsonConvert.SerializeObject(logEvent.Properties);
        SendToQueue(queue, json); // 写入消息队列
    }
}
// 注册
.WriteTo.Sink(new CustomSink())
```

### 故障转移机制 ###

```csharp
.WriteTo.Conditional(
    e => IsElasticAlive(), 
    wt => wt.Elasticsearch(), 
    wt => wt.File("fallback.log")
)
```

### 过滤日志 ###

#### 通过过滤器控制日志 ####

```csharp
.Filter.ByExcluding(logEvent => logEvent.Properties.ContainsKey("SensitiveData"))
```

#### JSON 配置 ####

```json
"Filter": [
  {
    "Name": "ByExcluding",
    "Args": {
      "expression": "SourceContext = 'Microsoft.*'"
    }
  }
]
```
