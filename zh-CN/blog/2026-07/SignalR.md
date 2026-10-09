---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET SignalR 深入解析
description: 实时通信、Hub 与连接管理实战
date: 2026-07-17 10:35:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介

在传统 `HTTP` 请求模型里，客户端发请求，服务端给响应，请求结束后连接关系基本也就结束了。

这套模型处理普通 `CRUD` 没问题，但一到下面这些场景就开始别扭：

- 聊天室、站内通知、在线客服；
- 实时仪表盘、订单状态刷新、监控大屏；
- 协同编辑、在线白板、多人房间；
- 后端事件触发后，需要主动推送给客户端。

这类需求的核心矛盾很简单：

- 客户端不想一直轮询；
- 服务端又需要“有消息就主动推送”。

`SignalR` 就是 ASP.NET Core 生态里专门解决这个问题的实时通信框架。它帮你屏蔽底层传输细节，用统一的 Hub 模型把“客户端调用服务端”和“服务端推送客户端”都抽象了出来。

如果你要一句话理解它，可以这样记：

> SignalR 是 ASP.NET Core 中实现实时双向通信的标准方案。

## SignalR 到底解决了什么问题？

如果不用 SignalR，很多团队会先想到这些方案：

- 前端每隔 1 秒轮询一次接口；
- 后端自己维护 WebSocket 连接；
- 不同客户端协议各写一套推送逻辑。

这些方案不是不能做，但都很快会碰到问题：

- 轮询浪费请求和带宽，延迟也高；
- 手写 WebSocket 连接管理很麻烦；
- 连接、重连、分组、用户映射、广播都得自己补；
- 不同客户端之间的调用模型难以统一。

SignalR 提供的是一套更完整的基础设施：

- 统一的 Hub 编程模型；
- 自动协商底层传输方式；
- 客户端与服务端双向调用；
- 广播、单播、分组推送；
- 连接生命周期管理；
- 支持鉴权、重连和横向扩展。

## SignalR 的核心工作方式

SignalR 并不等于“只会用 WebSocket”。

它的底层会根据环境自动选择可用的传输方式，优先级通常是：

| 传输方式           | 说明                                 |
| :----------------- | :----------------------------------- |
| WebSockets         | 首选，真正的全双工长连接，性能最好   |
| Server-Sent Events | 服务端到客户端单向推送，浏览器端可用 |
| Long Polling       | 兜底方案，兼容性最好，但成本最高     |

客户端连接时，会先经过一次协商流程：

```text
Client -> negotiate -> Server
Server -> 告知支持的传输方式 -> Client
Client -> 选择最佳可用方式建立连接
```

也就是说，你平时写 SignalR 时，关注点通常不在传输协议本身，而在 Hub、连接和消息模型。

## SignalR 的几个核心概念

### Hub

Hub 是 SignalR 的核心入口，地位很像 Web API 里的控制器，但它不是处理 HTTP 请求，而是处理实时连接上的调用。

```csharp
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

客户端可以调用 Hub 上的方法，Hub 也可以反过来调用客户端注册的方法。

### Connection

每个客户端和服务端建立连接后，都会有一个唯一的 ConnectionId：

```csharp
Context.ConnectionId
```

但这里有一个很重要的认知：

- ConnectionId 只代表一次连接；
- 客户端断开重连后，ConnectionId 往往会变化；
- 它不是稳定用户标识。

所以：

- 想标识一个连接，可以用 ConnectionId；
- 想标识一个用户，不要直接依赖 ConnectionId。

### User

SignalR 支持“按用户推送”，也就是：

```csharp
await Clients.User(userId).SendAsync("ReceiveNotification", message);
```

它底层依赖的是 UserIdentifier，通常来自当前登录用户的 Claim。

这比自己维护“用户 ID -> ConnectionId”映射更稳，因为一个用户可能同时有多个连接：

- PC 一个连接；
- 手机一个连接；
- 浏览器多个标签页也可能是多个连接。

### Group

Group 是 SignalR 最实用的能力之一。

```csharp
await Groups.AddToGroupAsync(Context.ConnectionId, "room-1001");
await Clients.Group("room-1001").SendAsync("ReceiveRoomMessage", message);
```

它很适合这些场景：

- 聊天房间；
- 某个项目组的通知；
- 某个直播间；
- 某个订单、某个文档、某个租户的实时更新。

## 先跑通一个最小可用示例

在 ASP.NET Core 项目里，SignalR 的接入其实很轻。

### 服务注册与路由映射

```csharp
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

var app = builder.Build();

app.MapHub<ChatHub>("/hubs/chat");

app.Run();
```

如果是现代 ASP.NET Core Web 项目，服务端通常不需要额外安装包；但如果你要写 JavaScript 客户端或 .NET 客户端，客户端 SDK 仍然需要单独引入。

## 一个最小的 Hub

```csharp
using Microsoft.AspNetCore.SignalR;

public sealed class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

### 浏览器端连接示例

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js"></script>
<script>
  const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/chat")
      .withAutomaticReconnect()
      .build();

  connection.on("ReceiveMessage", (user, message) => {
      console.log(`${user}: ${message}`);
  });

  await connection.start();

  await connection.invoke("SendMessage", "panfeng", "hello signalr");
</script>
```

这个最小示例里，最重要的是两件事：

- `invoke("SendMessage")` 是客户端调用服务端；
- `Clients.All.SendAsync("ReceiveMessage")` 是服务端调用客户端。

## SignalR 最常用的发送目标

这是日常开发里非常高频的一组 API。

| API                            | 含义                           |
| :----------------------------- | :----------------------------- |
| `Clients.All`                  | 发给所有连接                   |
| `Clients.Caller`               | 只发给当前调用者               |
| `Clients.Others`               | 发给除当前调用者之外的所有连接 |
| `Clients.Client(connectionId)` | 发给指定连接                   |
| `Clients.User(userId)`         | 发给指定用户的所有连接         |
| `Clients.Group(groupName)`     | 发给指定组                     |
| `Clients.Groups(groupNames)`   | 发给多个组                     |

例如聊天室里，用户发消息后，常见写法是：

```csharp
await Clients.Others.SendAsync("ReceiveMessage", user, message);
```

如果你想让发送者也收到回显，就用 `Clients.All`；如果不想重复渲染自己发送的消息，就用 `Clients.Others`。

## Hub 生命周期里最容易误解的一点

很多人会把 Hub 当成“长生命周期对象”，然后在里面存状态，比如：

- 当前在线用户列表；
- 房间成员列表；
- 上一次消息内容；
- 数据库上下文缓存。

这通常不是好主意。

更稳妥的理解方式是：

- Hub 是实时调用入口；
- 不要把它当成状态容器；
- 需要共享状态时，用单独服务、缓存或数据库存。

例如用户在线状态，不应该写在 Hub 实例字段里，而应该交给独立服务维护。

## 连接生命周期：上线、断线、重连

SignalR 提供了两个很常用的生命周期方法：

```csharp
public override async Task OnConnectedAsync()
{
    await base.OnConnectedAsync();
}

public override async Task OnDisconnectedAsync(Exception? exception)
{
    await base.OnDisconnectedAsync(exception);
}
```

你可以在这里做一些连接级处理，比如：

- 记录连接日志；
- 把连接加入默认分组；
- 清理在线状态；
- 广播上下线通知。

示例：

```csharp
public sealed class PresenceHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
```

但这里要注意一个务实结论：

- `OnDisconnectedAsync` 不保证一定像业务事件那样“绝对可靠”；
- 网络抖动、进程崩溃、节点故障时，在线状态可能存在短暂不一致；
- 真正严肃的在线系统，通常会配合心跳、超时清理、分布式缓存一起做。

## 分组是 SignalR 实战里的重头戏

很多业务一开始写 `Clients.All`，很快就会发现推送范围太粗。

这时候通常要改成分组模型。

例如房间聊天：

```csharp
public sealed class RoomHub : Hub
{
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SendRoomMessage(string roomId, string message)
    {
        await Clients.Group(roomId).SendAsync(
            "ReceiveRoomMessage",
            Context.ConnectionId,
            message);
    }
}
```

分组模型非常适合做“范围化推送”，但也要记住两个事实：

- 组成员关系默认是内存态的；
- 连接断开后，需要重新加入组。

所以在重连场景下，不要假设组关系会自动永久保留。

## 用户推送和连接推送，应该怎么选？

这是实际项目里经常踩坑的地方。

### 用 `Clients.Client(connectionId)`

适合：

- 你明确就是要发给某个具体连接；
- 例如一个浏览器页签、一个设备会话。

缺点：

- 重连后 ConnectionId 可能变化；
- 业务层自己维护连接映射会比较脆。

### 用 `Clients.User(userId)`

适合：

- 你要发给某个业务用户；
- 用户可能同时登录多个设备或多个标签页；
- 你不想自己维护连接映射。

大多数业务通知场景里，优先考虑 `Clients.User(userId)`，而不是死抓 `ConnectionId`。

## 指定用户通知：几种最常见的写法

实际项目里，“给指定用户发通知”通常比“群发消息”更常见。

比如：

- 某个订单支付成功，只通知下单人；
- 某条审批通过，只通知提交人和审批人；
- 某个 IM 私聊消息，只发给目标用户；
- 某个后台任务完成后，只通知发起任务的人。

下面给几种最常用的实现方式。

### 示例 1：基于默认 `UserIdentifier` 给当前登录用户推送

如果你的认证体系已经把用户 ID 放进了标准 Claim，那么 SignalR 可以直接按用户推送。

Hub 内：

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public sealed class NotificationHub : Hub
{
    public Task SubscribeMyNotifications()
    {
        var userId = Context.UserIdentifier;

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("当前连接未绑定有效用户");
        }

        return Clients.Caller.SendAsync(
            "NotificationSubscribed",
            $"当前订阅用户: {userId}");
    }
}
```

在 Hub 外主动推送：

```csharp
using Microsoft.AspNetCore.SignalR;

public sealed class UserNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public UserNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyOrderPaidAsync(string userId, long orderId)
    {
        return _hubContext.Clients.User(userId)
            .SendAsync("ReceiveNotification", new
            {
                Type = "OrderPaid",
                OrderId = orderId,
                Message = $"订单 {orderId} 已支付成功"
            });
    }
}
```

前端接收：

```javascript
const connection = new signalR.HubConnectionBuilder().withUrl('/hubs/notification').withAutomaticReconnect().build()

connection.on('ReceiveNotification', (payload) => {
  console.log('收到用户通知:', payload)
})

await connection.start()
await connection.invoke('SubscribeMyNotifications')
```

这种方式最省心，但前提是：

- 连接已经登录；
- 服务端能正确解析出稳定的 UserIdentifier。

这里一定要补一个很容易误解的点：

- 不是“前端登录过普通接口”就一定能收到 `Clients.User(userId)` 推送；
- 而是“这条 SignalR 连接本身”也必须进入 ASP.NET Core 的认证体系。

换句话说，真正决定 `Clients.User(userId)` 能不能生效的，不是前端有没有手动传 `userId`，而是：

- 当前连接有没有携带有效登录凭证；
- Hub 上的 `Context.User` / `Context.UserIdentifier` 能不能正确取到值；
- 你服务端推送时使用的 `userId`，是否和 `UserIdentifier` 对得上。

#### 前端代码是不是可以完全不变？

答案是：看你的认证方式。

##### 情况 1：Cookie 认证

如果你的站点本身就是基于登录 Cookie 认证，并且浏览器访问 Hub 路径时会自动带上 Cookie，那么前端代码通常可以基本保持不变：

```javascript
const connection = new signalR.HubConnectionBuilder().withUrl('/hubs/notification').withAutomaticReconnect().build()
```

这种情况下，前端通常不需要手动再传一个 userId。

##### 情况 2：JWT Bearer Token

如果你的前后端分离项目使用的是 JWT，那前端通常不能只写：

```javascript
.withUrl("/hubs/notification")
```

而是应该把 token 带给 SignalR 连接，例如：

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notification', {
    accessTokenFactory: () => localStorage.getItem('token') ?? ''
  })
  .withAutomaticReconnect()
  .build()
```

否则常见结果是：

- 普通 Web API 调用能过鉴权；
- 但 SignalR 连接本身没有带 token；
- 最终 `Context.UserIdentifier` 为空；
- `Clients.User(userId)` 推送不到这个连接。

所以更准确的说法是：

- 前端不需要手动传“业务用户 ID”；
- 但前端必须保证 SignalR 连接建立时带上正确的认证信息。

#### 一个更完整的前端示例

下面给一个更贴近前后端分离项目的示例：

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notification', {
    accessTokenFactory: () => localStorage.getItem('access_token') ?? ''
  })
  .withAutomaticReconnect()
  .build()

connection.on('ReceiveNotification', (payload) => {
  console.log('收到用户通知:', payload)
})

connection.onreconnecting((error) => {
  console.warn('SignalR 重连中', error)
})

connection.onreconnected((connectionId) => {
  console.log('SignalR 已重连', connectionId)
})

await connection.start()
await connection.invoke('SubscribeMyNotifications')
```

这段代码里，真正和“指定用户推送”相关的关键不是 `SubscribeMyNotifications`，而是：

- `withUrl(..., { accessTokenFactory })` 把认证凭证带上；
- 服务端能基于这个凭证识别出当前用户。

### 示例 2：自定义 IUserIdProvider

有些项目里，默认的用户标识并不满足需求，例如：

- 你希望使用 sub；
- 你希望使用员工工号；
- 你希望使用 `租户ID:用户ID` 这种复合标识。

这时可以自定义 IUserIdProvider。

```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

public sealed class TenantUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var tenantId = connection.User?.FindFirst("tenant_id")?.Value;
        var userId = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return $"{tenantId}:{userId}";
    }
}
```

注册：

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, TenantUserIdProvider>();
```

推送时：

```csharp
await _hubContext.Clients.User("tenant-a:10086")
    .SendAsync("ReceiveNotification", new
    {
        Type = "ApprovalPassed",
        Message = "你的审批已通过"
    });
```

这种方式特别适合多租户系统，因为它能避免“不同租户下用户 ID 碰撞”的问题。

### 示例 3：在控制器里给指定用户发通知

控制器里最常见的场景是“请求成功后顺手通知某个用户”。

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public OrdersController(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpPost("{orderId:long}/pay")]
    public async Task<IActionResult> Pay(long orderId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // 省略真实支付逻辑

        await _hubContext.Clients.User(userId)
            .SendAsync("ReceiveNotification", new
            {
                Type = "OrderPaid",
                OrderId = orderId,
                Message = "支付成功，正在为你刷新订单状态"
            });

        return Ok();
    }
}
```

这个模式适合：

- 接口成功后需要刷新前端页面；
- 某个用户发起操作后，希望页面立即得到结果。

### 示例 4：在 BackgroundService 里通知指定用户

这类场景也非常常见，比如导出任务、报表生成、审核流程、批处理任务等。

```csharp
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

public sealed class ExportNotifyBackgroundService : BackgroundService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public ExportNotifyBackgroundService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // 这里只是示意，真实项目一般会从数据库或队列取任务
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            var userId = "10001";
            var exportId = Guid.NewGuid().ToString("N");

            await _hubContext.Clients.User(userId)
                .SendAsync("ReceiveNotification", new
                {
                    Type = "ExportCompleted",
                    ExportId = exportId,
                    Message = "报表已生成完成，可以下载"
                }, stoppingToken);
        }
    }
}
```

它的价值在于：

- 用户请求可以快速返回；
- 耗时任务放后台跑；
- 任务完成后，再实时通知目标用户。

### 示例 5：一个用户多个连接时的效果

这一点非常值得明确：

```csharp
await _hubContext.Clients.User(userId)
    .SendAsync("ReceiveNotification", payload);
```

默认语义是：

- 发给该用户当前所有在线连接；
- 不只是某一个浏览器页签。

这通常正是我们想要的效果，因为用户可能同时登录：

- PC 浏览器；
- 手机浏览器；
- 桌面客户端；
- 同一浏览器的多个标签页。

如果你只想通知“当前这个页面”或“当前这台设备”，那就应该考虑：

- `Clients.Client(connectionId)`；
- 或自己维护设备维度、会话维度的组。

### 指定用户通知的几个关键注意点

- `Clients.User(userId)` 的前提是服务端能拿到稳定的 `UserIdentifier`。
- 不要让客户端直接传一个 userId，服务端不校验就拿来推送或加组。
- Cookie 认证和 JWT 认证在前端连接代码上通常不一样；JWT 场景下一般要显式配置 accessTokenFactory。
- 如果是多租户系统，尽量避免只用裸 userId，否则不同租户可能串消息。
- 如果用户离线，SignalR 不会帮你离线存储消息；需要的话要自己落库。
- 如果是多节点部署，指定用户推送同样需要 Redis backplane 或 Azure SignalR Service 才能完整覆盖所有节点连接。

## 在 Hub 之外主动推送：IHubContext

这是 SignalR 非常关键的能力。

因为真实项目里，真正触发推送的地方经常并不在 Hub 中，而是在：

- 控制器；
- 应用服务；
- 领域事件处理器；
- 后台任务；
- BackgroundService。

这时就需要 `IHubContext<T>`。

```csharp
using Microsoft.AspNetCore.SignalR;

public sealed class OrderNotifier
{
    private readonly IHubContext<OrderHub> _hubContext;

    public OrderNotifier(IHubContext<OrderHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyOrderPaidAsync(string userId, long orderId)
    {
        return _hubContext.Clients.User(userId)
            .SendAsync("OrderPaid", new { OrderId = orderId });
    }
}
```

你可以把它理解成：

- Hub 负责接收实时调用；
- IHubContext 负责在外部任何地方主动发消息。

这在“订单状态变化后通知前端刷新”“后台任务完成后通知客户端”这类场景里非常好用。

## 强类型 Hub：少写魔法字符串

默认写法里，客户端方法名通常是字符串：

```csharp
await Clients.All.SendAsync("ReceiveMessage", user, message);
```

问题是：

- 方法名拼错，编译器帮不了你；
- 参数不匹配，很多问题只能在运行时发现。

更稳妥的方式是使用强类型 Hub。

```csharp
public interface IChatClient
{
    Task ReceiveMessage(string user, string message);
    Task UserConnected(string connectionId);
}

public sealed class ChatHub : Hub<IChatClient>
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.ReceiveMessage(user, message);
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.All.UserConnected(Context.ConnectionId);
        await base.OnConnectedAsync();
    }
}
```

这种写法的好处很直接：

- 少写字符串；
- 方法签名更明确；
- 重构更安全。

如果项目规模较大，或者 Hub 方法越来越多，强类型写法通常更值得投入。

## 鉴权与授权：SignalR 不是天然“匿名聊天室”

很多 demo 都是匿名示例，但生产环境里，SignalR 很少真的匿名开放。

通常你至少要考虑：

- 谁能建立连接；
- 谁能调用某个 Hub 方法；
- 谁能加入某个组；
- 谁能接收某类消息。

SignalR 可以直接复用 ASP.NET Core 的认证授权体系。

```csharp
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddSignalR();
```

然后在 Hub 或方法上加授权：

```csharp
[Authorize]
public sealed class NotificationHub : Hub
{
    public Task Ping() => Task.CompletedTask;
}
```

也可以在方法里结合当前用户做业务校验：

```csharp
public async Task JoinOrderRoom(long orderId)
{
    var userId = Context.UserIdentifier;
    var allowed = await _orderPermissionService.CanAccessOrderAsync(userId, orderId);

    if (!allowed)
    {
        throw new HubException("无权访问该订单");
    }

    await Groups.AddToGroupAsync(Context.ConnectionId, $"order:{orderId}");
}
```

在安全上，一个常见错误是：

- 客户端传一个 `userId` 给服务端；
- 服务端不校验，直接按这个 `userId` 加组或推送。

这相当危险。真正可信的用户身份，应来自服务端认证上下文，而不是客户端自己报上来的参数。

## 异常处理：HubException 比随便抛异常更清晰

Hub 方法里如果直接抛普通异常，客户端通常只能得到一个失败结果，但不一定适合直接透出所有细节。

更适合业务异常的方式是：

```csharp
throw new HubException("房间不存在或已关闭");
```

这样客户端更容易拿到可理解的错误信息，而不是一堆不该暴露的服务端细节。

当然，真正的系统级异常仍然应该配合日志记录，而不是只靠客户端提示。

## 自动重连要开，但别误以为“开了就万事大吉”

前端常见写法：

```javascript
const connection = new signalR.HubConnectionBuilder().withUrl('/hubs/chat').withAutomaticReconnect().build()
```

这很有必要，但要知道它只解决“重连动作”，解决不了所有状态恢复问题。

重连之后，你仍然可能需要重新做这些事：

- 重新加入组；
- 重新同步在线状态；
- 重新拉取最近消息；
- 重新绑定当前页面上下文。

也就是说：

- 自动重连解决“连接回来”；
- 不解决“业务状态自动恢复”。

## 重连后的状态恢复：真正的难点不在重连，而在恢复

很多人第一次用 `withAutomaticReconnect()`，会误以为问题已经解决了。

其实没有。

SignalR 自动重连解决的是：

- 连接断了以后，尽量自动重新连回来。

但它不负责：

- 把旧连接上的业务状态原样恢复；
- 把断线期间漏掉的消息自动补回来；
- 把之前加入的组、当前页面订阅、上下文状态全部自动重建。

所以更准确地说：

- 自动重连解决“重新建立连接”；
- 状态恢复解决“把业务上下文补回来”。

### 为什么重连后还要恢复状态？

因为重连成功后，你拿到的通常不是“续上原来的连接”，而是“建立了一个新的连接”。

这会带来几个直接影响：

- ConnectionId 往往会变化；
- 基于旧连接维护的状态可能失效；
- 基于组、房间、页面上下文的订阅可能需要重建。

所以只要你的业务里存在这些设计：

- 通过 ConnectionId 标识连接；
- 通过 Group 维护房间、页面、租户订阅；
- 当前页面需要订阅某个订单、某个项目、某个设备；
- 重连期间消息不能直接丢掉；

那你就必须认真设计“重连后的状态恢复”。

### 哪些状态会丢？哪些不会丢？

#### ConnectionId 基本不要指望保留

```csharp
Context.ConnectionId
```

重连后通常会变。

这意味着：

- 之前的 `Clients.Client(oldConnectionId)` 失效；
- 你自己维护的 connectionId -> 用户 映射可能失效；
- 页面级绑定、设备级绑定也可能需要重建。

所以 `ConnectionId` 适合表示“当前这一次连接”，不适合表示“稳定用户身份”。

#### 分组关系通常需要重新加入

例如之前你把连接加入了这些组：

- `room:1001`
- `tenant:abc`
- `order:123`

重连后，新的连接通常要重新执行加入组逻辑，否则你可能收不到：

- 房间消息；
- 订单状态通知；
- 页面上下文内的范围推送。

这也是最常见的坑之一。

#### 用户身份通常可以恢复，但有前提

如果你的认证方式没问题，用户身份通常是可以恢复的。

例如：

- Cookie 认证下，浏览器仍然会自动带 cookie；
- JWT 认证下，accessTokenFactory 仍然能返回有效 token。

这时服务端的：

- `Context.User`
- `Context.UserIdentifier`

通常会重新建立。

但如果 token 已过期，或者重连时没有正确带认证信息，那就可能出现：

- 重连失败；
- 重连后变成匿名连接；
- `Clients.User(userId)` 无法命中这个连接。

#### 前端事件监听通常不会自动丢

像这种代码：

```javascript
connection.on('ReceiveNotification', (payload) => {
  console.log(payload)
})
```

只要你没有销毁这个 `connection` 对象，监听函数通常还在。

所以重连后真正容易丢的是：

- 服务端连接态；
- 基于连接的业务订阅；
- 断线期间遗漏的消息。

而不是前端本地的回调函数本身。

### 重连后最容易丢的业务状态

#### 房间或组订阅

例如：

- 聊天房间；
- 直播间；
- 某个订单详情页；
- 某个项目或租户范围。

之前加入组：

```csharp
await Groups.AddToGroupAsync(Context.ConnectionId, $"room:{roomId}");
```

重连后通常要重新调用对应的 `JoinRoom`、`SubscribeOrde`r、`JoinTenantChannel`。

#### 当前页面的业务上下文

这类上下文很常见，例如用户当前正在看：

- 某个订单；
- 某个工单；
- 某个设备监控页；
- 某个聊天室。

这些状态往往不是“用户级永久状态”，而是“当前这个页面或会话的临时订阅状态”。

所以重连后，前端要重新告诉服务端：

- 我现在还在看这个订单；
- 我还在这个房间；
- 我还要这类实时更新。

#### 在线状态

如果你的在线状态是按连接维度计算的，那么重连时往往会出现短暂抖动：

- 旧连接断开；
- 新连接重新建立；
- 页面上可能出现先离线再上线。

所以在线状态通常不能按“绝对即时、绝对准确”的理想模型设计，而要接受短时间抖动，并配合超时、心跳或后台校正。

#### 断线期间漏掉的消息

这是最关键的一点。

如果连接断开时，服务端正好推送了消息，那么：

- SignalR 不会自动帮你保存离线消息；
- 重连后也不会自动补发中间丢掉的通知。

所以只要你的消息是关键业务消息，比如：

- 审批通过；
- 支付成功；
- 导出完成；
- 任务执行完成；

那就不能只靠实时推送本身，通常还要配合“补偿拉取”。

## 自动重连事件应该怎么用？

前端通常会写这些事件：

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notification', {
    accessTokenFactory: () => localStorage.getItem('access_token') ?? ''
  })
  .withAutomaticReconnect()
  .build()

connection.onreconnecting((error) => {
  console.warn('重连中', error)
})

connection.onreconnected((connectionId) => {
  console.log('已重连', connectionId)
})

connection.onclose((error) => {
  console.error('连接关闭', error)
})
```

可以这样理解：

- onreconnecting：连接断开，正在尝试恢复；
- onreconnected：连接恢复成功，但通常是一个新连接；
- onclose：自动重连也失败了，连接彻底关闭。

真正的“状态恢复”逻辑，通常要放在 `onreconnected` 中。

## 最常见的恢复策略

### 策略 1：重新加入所有必要的组

前端可以维护自己当前已订阅的组：

```javascript
const joinedRooms = new Set()

async function joinRoom(roomId) {
  await connection.invoke('JoinRoom', roomId)
  joinedRooms.add(roomId)
}

connection.onreconnected(async () => {
  for (const roomId of joinedRooms) {
    await connection.invoke('JoinRoom', roomId)
  }
})
```

这适合：

- 聊天房间；
- 多频道订阅；
- 项目组、租户组、设备组这类范围化推送。

### 策略 2：重新订阅当前页面上下文

例如订单详情页：

```javascript
let currentOrderId = null

async function watchOrder(orderId) {
  currentOrderId = orderId
  await connection.invoke('SubscribeOrder', orderId)
}

connection.onreconnected(async () => {
  if (currentOrderId) {
    await connection.invoke('SubscribeOrder', currentOrderId)
  }
})
```

这种做法本质上是把“当前页面关注的业务对象”重新挂回服务端。

### 策略 3：重连后主动拉一次最新状态

这是非常重要、也非常稳妥的做法。

不要只依赖实时推送来恢复状态，而是在重连成功后主动拉一份最新快照：

```javascript
connection.onreconnected(async () => {
  await reloadCurrentPageData()
})
```

它特别适合：

- 订单状态；
- 仪表盘数据；
- 在线成员列表；
- 审批流状态；
- 房间成员和最近消息。

原因很简单：

- 重连期间你可能已经漏过一些消息；
- 直接拉当前最新状态，通常比尝试推理中间过程更稳。

### 策略 4：对关键消息做补偿拉取

如果消息不能丢，就不要只靠实时推送。

更稳妥的模式是：

- 实时推送负责“尽快通知”；
- 数据库或通知中心负责“可靠补偿”。

例如重连后按最后游标补拉：

```javascript
connection.onreconnected(async () => {
  await fetchMissedNotifications(lastMessageId)
})
```

这类模式适合：

- 站内信；
- 审批通知；
- 支付结果；
- 后台任务完成提醒。

## 一个更完整的前端恢复示例

下面这个例子把几个关键恢复动作串起来：

```javascript
const joinedRooms = new Set()
let currentOrderId = null

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notification', {
    accessTokenFactory: () => localStorage.getItem('access_token') ?? ''
  })
  .withAutomaticReconnect()
  .build()

connection.on('ReceiveNotification', (payload) => {
  console.log('用户通知:', payload)
})

connection.on('ReceiveRoomMessage', (payload) => {
  console.log('房间消息:', payload)
})

connection.onreconnecting((error) => {
  console.warn('连接断开，正在重连', error)
  setUiDisconnected()
})

connection.onreconnected(async () => {
  console.log('重连成功')
  setUiConnected()

  for (const roomId of joinedRooms) {
    await connection.invoke('JoinRoom', roomId)
  }

  if (currentOrderId) {
    await connection.invoke('SubscribeOrder', currentOrderId)
  }

  await reloadCurrentPageData()
  await fetchMissedNotifications()
})

connection.onclose((error) => {
  console.error('连接关闭', error)
  setUiClosed()
})

async function startSignalR() {
  await connection.start()

  if (currentOrderId) {
    await connection.invoke('SubscribeOrder', currentOrderId)
  }
}

async function joinRoom(roomId) {
  await connection.invoke('JoinRoom', roomId)
  joinedRooms.add(roomId)
}

async function watchOrder(orderId) {
  currentOrderId = orderId
  await connection.invoke('SubscribeOrder', orderId)
}
```

这段代码做了 4 件很关键的事：

- 重连后恢复组订阅；
- 重连后恢复当前页面订阅；
- 重连后刷新最新页面状态；
- 重连后补拉可能漏掉的通知。

这才算一个比较完整的恢复方案。

## 服务端该如何配合状态恢复？

状态恢复不是只有前端的事，服务端设计也要配合。

### 加组逻辑尽量保持幂等

因为重连后客户端通常会再次调用加入组的方法，所以服务端不要把“重复加入”当成异常流程。

```csharp
public async Task JoinRoom(string roomId)
{
    await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
}
```

这种写法天然更适合重连恢复。

### 不要把关键状态只存放在连接对象上

错误思路通常是：

- 当前用户正在看的对象，只存在某个 Hub 实例字段里；
- 某个连接订阅了什么，只靠当前进程内存短暂记录。

更稳的方式是：

- 页面重连后主动重新订阅；
- 需要长期保留的业务状态，放缓存、数据库或可恢复的服务中。

### 用户通知尽量走 `Clients.User`

如果你用的是：

```csharp
Clients.Client(oldConnectionId)
```

那重连后旧连接通常就失效了。

对于“发给某个用户”的通知，通常更稳的是：

```csharp
Clients.User(userId)
```

因为它依赖的是用户标识，不是旧连接 ID。

### 页面订阅和用户通知要分开建模

通常建议分成两类：

- 用户级通知：用 `Clients.User(userId)`；
- 页面级、房间级、对象级订阅：用 `Group`。

这样重连恢复时会很清晰：

- 用户通知只要认证恢复即可继续接收；
- 页面或房间订阅则在重连后重新加入组。

## 一套比较务实的结论

如果你要在项目里把 SignalR 的重连恢复做好，可以直接记住下面几条：

- 自动重连不是完整方案，只是基础能力；
- ConnectionId 一定要假设重连后会变化；
- 组关系默认按“重连后重新加入”设计；
- 关键页面状态在重连后主动拉一次最新快照；
- 关键通知不要只靠实时推送，要有补偿拉取或离线存储；
- 用户通知和页面订阅分开建模，会让系统简单很多。

## 多节点部署时，SignalR 会遇到什么问题？

单机开发阶段，SignalR 用起来很顺；一到多节点部署，问题就来了。

原因很直接：

- 连接挂在具体某台节点上；
- 组信息和连接信息默认也在节点本地；
- 你在 A 节点发消息，不一定知道 B 节点上的连接。

这时就需要引入横向扩展方案，例如：

- Redis backplane；
- Azure SignalR Service。

如果你的部署架构是多实例 ASP.NET Core，但没有做这些扩展，通常会出现：

- 某些客户端收不到消息；
- 分组消息不完整；
- 在线状态不一致。

所以对生产环境来说，一个务实判断是：

- 单实例部署，原生 SignalR 就够用；
- 多实例部署，必须尽早考虑 backplane 或托管服务。

## SignalR 和 WebSocket 是什么关系？

这两个概念经常被混用，但它们不是同一个层级。

可以这样理解：

- WebSocket 是底层通信协议；
- SignalR 是基于多种传输方式之上的应用层框架。

如果你只需要一个极简、完全自定义的双向协议，并愿意自己做连接管理、序列化、鉴权和重连，那可以直接上 WebSocket。

但大多数业务系统其实更需要：

- 统一调用模型；
- 广播和分组；
- 客户端 SDK；
- 生命周期管理；
- 鉴权和扩展能力。

这也是为什么很多 .NET 项目最终更适合 SignalR。

## 常见实战场景

### 聊天与房间消息

最典型，也最适合用组。

### 通知中心

比如订单支付成功、审批状态变化、系统公告、工单流转提醒。

这类场景通常更适合：

- `Clients.User(userId)`；
- 或 `IHubContext` 配合应用服务主动推送。

### 实时仪表盘

例如监控数据、业务指标、库存变化、设备状态。

这类场景常见特点：

- 更新频率高；
- 可接受部分旧数据被覆盖；
- 更关注最新状态而不是每一条历史消息。

### 协同场景

比如多人看板、白板、文档批注、房间状态同步。

这类场景通常要重点考虑：

- 分组模型；
- 冲突控制；
- 重连后的状态恢复。

## 一些务实的最佳实践

如果你准备在项目里真正落地 SignalR，下面这些建议很实用：

- `Hub` 只做实时入口，不要塞太多业务逻辑；
- 共享状态不要存在 `Hub` 实例里；
- 业务用户标识优先走认证体系，不要靠客户端自报；
- 房间、租户、文档等范围化消息，优先考虑 `Group`；
- 业务通知优先考虑 `Clients.User`，不要过度依赖 `ConnectionId`；
- 自动重连打开后，仍然要处理组恢复和状态恢复；
- 多节点部署前，先把 `backplane` 或托管服务方案想清楚；
- 对高频消息场景，先评估是否真的每条都需要实时推送。

## 总结

SignalR 的价值，不只是“能做聊天室”，而是它把实时通信里最麻烦的一堆问题统一收敛成了一套清晰模型：

- `Hub` 负责通信入口；
- `Clients` 负责推送目标；
- `Connection`、`User`、`Group` 负责消息路由；
- `IHubContext` 负责在 `Hub` 之外主动推送；
- 认证、重连、扩展能力让它能从 `demo` 走向真实项目。

你可以把它理解成 ASP.NET Core 中“实时推送层”的标准组件。

如果你的需求是“服务端有事件发生，客户端要尽快知道”，并且你不想自己从零维护一整套长连接基础设施，那么 SignalR 通常就是最务实的选择。
