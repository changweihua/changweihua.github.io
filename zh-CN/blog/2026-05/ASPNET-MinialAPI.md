---
lastUpdated: true
commentabled: true
recommended: true
title: ASP.NET Core 最小 API 快速参考
description: ASP.NET Core 最小 API 快速参考
date: 2026-05-26 11:35:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

现在写 Web API 到底用控制器还是最小 API？这篇就来系统梳理 *ASP.NET Core 最小 API* 的完整知识体系，涵盖 WebApplication、配置、路由、参数绑定、中间件、认证授权等核心模块，方便日常开发速查。

- WebApplication 基础：模板代码、自动中间件、端口配置
- 配置与日志：多源读取、日志提供程序
- 依赖注入：服务注册、密钥服务、作用域管理
- 路由系统：路由处理程序、参数约束、路由组
- 参数绑定与响应：绑定源、JSON 反序列化、内置结果
- 安全相关：认证授权、CORS、验证

## 一、WebApplication 基础 ##

### 模板代码 ###

以下代码由 ASP.NET Core 模板生成：

```csharp
 var builder = WebApplication.CreateBuilder(args);
 var app = builder.Build();
 ​
 app.MapGet("/", () => "Hello World!");
 ​
 app.Run();
```

也可以通过 `dotnet new web` 或在 Visual Studio 中选择"空 Web"模板创建。

快捷方式 — 无需显式创建 `WebApplicationBuilder`：

```csharp
 var app = WebApplication.Create(args);
 ​
 app.MapGet("/", () => "Hello World!");
 ​
 app.Run();
```

划重点：  `WebApplication.Create`​ 使用预配置默认值初始化 WebApplication 类的新实例。如果不需要自定义服务注册和配置，这种方式最简洁。

### 自动添加的中间件 ###

​WebApplication​ 根据条件自动添加以下中间件：

| 条件 | 自动添加的中间件 | 位置 |
| :--- | :--- | :--- |
|  `​HostingEnvironment` ​为 `"Development"`  | `​UseDeveloperExceptionPage` | 最前面 |
|  已配置终结点且未调用 `UseRouting`  | `​UseRouting` | 异常页之后 |
|  未调用 `UseAuthentication` ​且可检测到 `IAuthenticationSchemeProvider`  | `​UseAuthentication` | `​UseRouting` 之后 |
|  未调用 `UseAuthorization` ​且可检测到 `IAuthorizationHandlerProvider`  | `​UseAuthorization` | 认证之后 |
|  配置了任何终结点  | `​UseEndpoints` | 管道末尾 |

用户配置的中间件与终结点被添加在 `UseRouting​` 和 `UseEndpoints` 之间。

自动中间件等价于以下代码：

```csharp
 if (isDevelopment)
 {
     app.UseDeveloperExceptionPage();
 }
 ​
 app.UseRouting();
 ​
 if (isAuthenticationConfigured)
 {
     app.UseAuthentication();
 }
 ​
 if (isAuthorizationConfigured)
 {
     app.UseAuthorization();
 }
 ​
 // user middleware/endpoints
 app.CustomMiddleware(...);
 app.MapGet("/", () => "hello world");
 // end user middleware/endpoints
 ​
 app.UseEndpoints(e => {});
```

中间件顺序修正示例：

如果需要在 `UseAuthentication​` 前调用 `UseCors`：

```csharp
 app.UseCors();
 app.UseAuthentication();
 app.UseAuthorization();
```

终端中间件 — 在所有路由处理后兜底：

```csharp
 app.UseRouting();
 ​
 app.MapGet("/", () => "hello world");
 ​
 app.UseEndpoints(e => {});
 ​
 app.Run(context =>
 {
     context.Response.StatusCode = 404;
     return Task.CompletedTask;
 });
```

> 常见坑：  在 `UseEndpoints​` 之后添加中间件时，必须显式调用 `UseRouting​` 和 `UseEndpoints`，否则终端中间件无法放置在正确位置。

### 端口配置 ###

| 方式 | 代码 / 命令 | 说明 |
| :--- | :--- | :--- |
|  代码指定  | `​app.Run("http://localhost:3000")` | 单端口，注意会覆盖 `launchSettings.json` |
|  多端口  | `​app.Urls.Add("http://localhost:3000")` | 可添加多个 |
|  命令行  | `​dotnet run --urls="https://localhost:7777"` | 优先级低于 `appsettings.json` 的 `Kestrel` 配置 |
|  环境变量  | `​ASPNETCORE_URLS=http://localhost:3000` | 支持多 URL，分号分隔 |

侦听所有接口：

```csharp
 app.Urls.Add("http://*:3000");    // 通配符
 app.Urls.Add("http://+:3000");    // 所有 IP
 app.Urls.Add("http://0.0.0.0:3000"); // 显式所有 IPv4
```

使用自定义证书的 HTTPS：

```csharp
 // 通过配置指定
 builder.Configuration["Kestrel:Certificates:Default:Path"] = "cert.pem";
 builder.Configuration["Kestrel:Certificates:Default:KeyPath"] = "key.pem";
 ​
 // 或通过 API
 builder.WebHost.ConfigureKestrel(options =>
 {
     options.ConfigureHttpsDefaults(httpsOptions =>
     {
         httpsOptions.ServerCertificate = X509Certificate2.CreateFromPemFile("cert.pem", "key.pem");
     });
 });
```

### 读取环境 ###

```csharp
 var app = WebApplication.Create(args);
 ​
 if (!app.Environment.IsDevelopment())
 {
     app.UseExceptionHandler("/oops");
 }
 ​
 app.MapGet("/", () => "Hello World!");
 app.MapGet("/oops", () => "Oops! An error happened.");
```

## 二、配置与日志 ##

### 读取配置 ###

```csharp
var app = WebApplication.Create(args);

var message = app.Configuration["HelloKey"] ?? "Config failed!";

app.MapGet("/", () => message);
```

默认配置源层级（后面的覆盖前面的）：

- `​appsettings.json`​ / `appsettings.{环境}.json`
- 环境变量
- 命令行参数

### 日志 ###

```csharp
var app = WebApplication.Create(args);

app.Logger.LogInformation("The app started");
```

添加 JSON 格式的控制台日志：

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Logging.AddJsonConsole();
```

## 三、依赖注入（DI） ##

### 启动时获取服务 ###

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<SampleService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var sampleService = scope.ServiceProvider.GetRequiredService<SampleService>();
    sampleService.DoSomething();
}
```

### 命名服务（Keyed Services） ###

```csharp
builder.Services.AddKeyedSingleton<ICache, BigCache>("big");
builder.Services.AddKeyedSingleton<ICache, SmallCache>("small");

app.MapGet("/big", ([FromKeyedServices("big")] ICache bigCache) => bigCache.Get("date"));
app.MapGet("/small", ([FromKeyedServices("small")] ICache smallCache) => smallCache.Get("date"));
```

### 自定义 DI 容器（Autofac 示例） ###

```csharp
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(builder => builder.RegisterModule(new MyApplicationModule()));
```

## 四、WebApplicationBuilder 进阶 ##

### 更改内容根、应用名和环境 ###

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ApplicationName = typeof(Program).Assembly.FullName,
    ContentRootPath = Directory.GetCurrentDirectory(),
    EnvironmentName = Environments.Staging,
    WebRootPath = "customwwwroot"
});
```

也可以通过环境变量或命令行参数：

| 功能 | 环境变量 | 命令行参数 |
| :--- | :--- | :--- |
|  应用程序名称  | `​ASPNETCORE_APPLICATIONNAME` | `​--applicationName` |
|  环境名称  | `​ASPNETCORE_ENVIRONMENT` | `​--environment` |
|  内容根目录  | `​ASPNETCORE_CONTENTROOT` | `​--contentRoot` |

### 自定义 IHostBuilder / IWebHostBuilder ###

```csharp
// IHostBuilder — 设置优雅关闭超时
builder.Host.ConfigureHostOptions(o => o.ShutdownTimeout = TimeSpan.FromSeconds(30));

// IWebHostBuilder — 更换 HTTP 服务器为 HTTP.sys
builder.WebHost.UseHttpSys();
```

### 常用中间件速查 ###

| 中间件 | 方法 | 说明 |
| :--- | :--- | :--- |
|  身份认证  | `​UseAuthentication()` | 提供身份验证支持 |
|  授权  | `​UseAuthorization()` | 提供授权支持 |
|  CORS  | `​UseCors()` | 配置跨域资源共享 |
|  HTTPS 重定向  | `​UseHttpsRedirection()` | HTTP → HTTPS 重定向 |
|  静态文件  | `​UseStaticFiles()`​/`UseFileServer()` | 提供静态文件 |
|  响应压缩  | `​UseResponseCompression()` | Gzip/Brotli 压缩 |
|  响应缓存  | `​UseResponseCaching()` | 缓存响应 |
|  Session  | `​UseSession()` | 管理用户会话 |
|  WebSocket  | `​UseWebSockets()` | 启用 WebSocket 协议 |
|  请求超时  | `​UseRequestTimeouts()` | 配置请求超时 |
|  请求日志  | `​UseHttpLogging()` | 记录 HTTP 请求和响应 |

## 五、路由系统 ##

### HTTP 方法映射 ###

```csharp
app.MapGet("/", () => "This is a GET");
app.MapPost("/", () => "This is a POST");
app.MapPut("/", () => "This is a PUT");
app.MapDelete("/", () => "This is a DELETE");
app.MapMethods("/options-or-head", new[] { "OPTIONS", "HEAD" },
               () => "This is an options or head request");
```

### 路由处理程序（四种形式） ###

| 形式 | 示例 |
| :--- | :--- |
|  Lambda 表达式  | `​app.MapGet("/", () => "Hello")` |
|  Lambda 变量  | `​var h = () => "Hello"; app.MapGet("/", h)` |
|  本地函数  | `​string Fn() => "Hello"; app.MapGet("/", Fn)` |
|  实例/静态方法  | `​app.MapGet("/", handler.Hello)` |

### 路由参数与约束 ###

```csharp
app.MapGet("/users/{userId}/books/{bookId}",
    (int userId, int bookId) => $"User {userId}, Book {bookId}");

// 路由约束
app.MapGet("/todos/{id:int}",    (int id) => db.Todos.Find(id));
app.MapGet("/todos/{text}",      (string text) => db.Todos.Where(t => t.Text.Contains(text)));
app.MapGet("/posts/{slug:regex(^[a-z0-9_-]+$)}", (string slug) => $"Post {slug}");

// 通配符（全部捕获）
app.MapGet("/posts/{*rest}", (string rest) => $"Routing to {rest}");
```

| 路由模板 | 匹配示例 |
| :--- | :--- |
|  `​/todos/{id:int}`  | `​/todos/1` |
|  `​/todos/{text}`  | `​/todos/something` |
|  `​/posts/{slug:regex(^[a-z0-9_-]+$)}`  | `​/posts/mypost` |

### 命名终结点与链接生成 ###

```csharp
app.MapGet("/hello", () => "Hello named route")
   .WithName("hi");

app.MapGet("/", (LinkGenerator linker) =>
    $"The link to the hello route is {linker.GetPathByName("hi", values: null)}");
```

> 划重点：  终结点名称区分大小写、必须全局唯一。启用 OpenAPI 时，名称会被用作 OpenAPI 操作 ID。

### 路由组（Route Groups） ###

路由组帮助组织具有共同前缀的终结点，减少重复代码：

```csharp
// 定义两组路由
app.MapGroup("/public/todos")
    .MapTodosApi()
    .WithTags("Public");

app.MapGroup("/private/todos")
    .MapTodosApi()
    .WithTags("Private")
    .RequireAuthorization();
```

```csharp
// 扩展方法：将 CRUD 终结点组织到组中
public static RouteGroupBuilder MapTodosApi(this RouteGroupBuilder group)
{
    group.MapGet("/", GetAllTodos);
    group.MapGet("/{id}", GetTodo);
    group.MapPost("/", CreateTodo);
    group.MapPut("/{id}", UpdateTodo);
    group.MapDelete("/{id}", DeleteTodo);
    return group;
}
```

嵌套组与路由参数捕获：

```csharp
var all = app.MapGroup("").WithOpenApi();
var org = all.MapGroup("{org}");
var user = org.MapGroup("{user}");
user.MapGet("", (string org, string user) => $"{org}/{user}");
```

筛选器在路由组中的执行顺序：

```csharp
var outer = app.MapGroup("/outer");    // 先注册的组
var inner = outer.MapGroup("/inner");  // 后注册的组

inner.AddEndpointFilter(...);   // inner 组筛选器
outer.AddEndpointFilter(...);   // outer 组筛选器
inner.MapGet("/", () => "Hi!").AddEndpointFilter(...); // 终结点筛选器
```

对 `/outer/inner/` 的请求执行顺序：

```txt
/outer group filter
/inner group filter
MapGet filter
```

> 常见坑：  筛选器应用于不同组时，添加顺序不影响执行顺序（外部组先执行）。但应用于同一组或特定终结点时，添加顺序很重要。

## 六、参数绑定 ##

### 绑定源 ###

| 源 | 属性 | 示例 |
| :--- | :--- | :--- |
|  路由值  | `​[FromRoute]`（默认） | `​{id}` |
|  查询字符串  | `​[FromQuery]`（默认） | `​?page=1` |
|  Header  | `​[FromHeader]` | `​X-CUSTOM-HEADER` |
|  请求体  | `​[FromBody]`（默认） | JSON 反序列化 |
|  表单  | `​[FromForm]` | `​IFormFile` 上传 |
|  DI 服务  | `​[FromServices]`（自动） | 容器注册的服务 |
|  特殊类型  | 自动绑定 | `​HttpContext`​、`HttpRequest`​、`CancellationToken` 等 |

```csharp
app.MapGet("/{id}", (int id,
                     int page,
                     [FromHeader(Name = "X-CUSTOM-HEADER")] string customHeader,
                     Service service) => { });
```

### .NET 10 新特性：PipeReader 反序列化 ###

从 .NET 10 开始，JSON 反序列化使用基于 PipeReader​ 的 `JsonSerializer.DeserializeAsync`​ 重载，性能更好。但自定义转换器需要处理 `Utf8JsonReader.HasValueSequence`：

```csharp
// 快速修复：将 ReadOnlySequence 转为数组
public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
{
    var span = reader.HasValueSequence ? reader.ValueSequence.ToArray() : reader.ValueSpan;
    // ...
}
```

### .NET 10 新特性：内置验证支持 ###

使用 `System.ComponentModel.DataAnnotations` 属性定义验证规则：

```csharp
码public record Product(
    [Required] string Name,
    [Range(1, 1000)] int Quantity);
```

启用验证：

```csharp
builder.Services.AddValidation();
```

验证失败自动返回 400 Bad Request，包含错误详情。可通过 `IProblemDetailsService` 自定义错误响应格式。

> 划重点：  .NET 10 新增的最小 API 验证支持，对 Query、Header、请求体自动执行 DataAnnotations 验证。可以用 DisableValidation() 对特定终结点禁用。

## 七、响应 ##

### 返回值类型 ###

| 返回值类型 | 行为 | Content-Type |
| :--- | :--- | :--- |
|  `​IResult`（含 Task/ValueTask）  | 框架调用 `ExecuteAsync` | 由实现决定 |
|  `​string`（含 Task/ValueTask）  | 直接写入响应 | `​text/plain` |
|  `​T`（其他任意类型）  | JSON 序列化 | `​application/json` |

### 示例 ###

```csharp
// 字符串
app.MapGet("/hello", () => "Hello World");

// JSON（匿名对象自动序列化）
app.MapGet("/hello", () => new { Message = "Hello World" });

// TypedResults（推荐，便于测试）
app.MapGet("/hello", () => TypedResults.Ok(new Message { Text = "Hello World!" }));

// Results
app.MapGet("/api/todoitems/{id}", async (int id, TodoDb db) =>
    await db.Todos.FindAsync(id) is Todo todo
    ? Results.Ok(todo)
    : Results.NotFound());

// 自定义状态码 / 文本 / Stream / 重定向 / 文件
Results.StatusCode(405);
Results.Text("Some text");
Results.Stream(stream, "application/json");
Results.Redirect("/new-path");
Results.File("myfile.text");
```

> 划重点：  优先返回 `TypedResults​` 而不是 Results​。TypedResults​ 的返回类型是公共的，可以在单元测试中用 Assert.IsInstanceOfType 做类型断言。

### 修改标头 ###

```csharp
app.MapGet("/", (HttpContext context) => {
    context.Response.Headers["X-Custom-Header"] = "CustomValue";
    context.Response.Headers.CacheControl = "public,max-age=3600";
    return "Hello World";
});
```

### 自定义 IResult ###

```csharp
class HtmlResult : IResult
{
    private readonly string _html;

    public HtmlResult(string html) => _html = html;

    public Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.ContentType = MediaTypeNames.Text.Html;
        httpContext.Response.ContentLength = Encoding.UTF8.GetByteCount(_html);
        return httpContext.Response.WriteAsync(_html);
    }
}

// 通过扩展方法暴露
public static IResult Html(this IResultExtensions extensions, string html)
    => new HtmlResult(html);
```

## 八、安全 ##

### 授权 ###

```csharp
// 方式一：属性
app.MapGet("/auth", [Authorize] () => "Requires authorization.");

// 方式二：方法
app.MapGet("/auth2", () => "Requires authorization.").RequireAuthorization();

// 基于策略
app.MapGet("/admin", [Authorize("AdminsOnly")] () => "Admins only.");

// 允许匿名
app.MapGet("/login", [AllowAnonymous] () => "Public endpoint.");
```

### CORS ###

```csharp
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        builder => builder.WithOrigins("http://example.com", "http://www.contoso.com"));
});

app.UseCors();

// 终结点级别启用
app.MapGet("/cors", [EnableCors(MyAllowSpecificOrigins)] () => "CORS enabled.");
app.MapGet("/cors2", () => "CORS enabled.").RequireCors(MyAllowSpecificOrigins);
```

## 九、ValidateScopes 与 ValidateOnBuild ##

| 选项 | 开发环境 | 发布环境 | 说明 |
| :--- | :--- | :--- | :--- |
|  `​ValidateScopes`  | 默认启用 | 默认禁用 | 验证是否从根作用域解析作用域服务（防内存泄漏） |
|  `​ValidateOnBuild`  | 默认启用 | 默认禁用 | 生成时验证 DI 配置（启动即报错） |

在开发环境中禁用验证（不推荐）：

```csharp
if (builder.Environment.IsDevelopment())
{
    builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes = false;
        options.ValidateOnBuild = false;
    });
}
```

> 常见坑：  从 `app.Services`​（根容器）解析作用域服务会抛出 `InvalidOperationException`​。正确做法是从 `HttpContext.RequestServices`​ 或手动创建的 `IServiceScope` 中获取。

## 最后 ##

最小 API 在 .NET 10 中已经是非常成熟的编程模型了。路由组、内置验证、PipeReader 反序列化这些新特性让它在保持简洁的同时越来越强大。核心建议：小型项目 / 微服务 / 原型阶段直接用最小 API；大型复杂项目如果需要 AOP、过滤器链、复杂模型绑定，用控制器模式可能更合适。
