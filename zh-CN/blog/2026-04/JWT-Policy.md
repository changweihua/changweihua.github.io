---
lastUpdated: true
commentabled: true
recommended: true
title: JWT、Policy 与权限边界怎么落地
description: ASP.NET Core 认证鉴权实战：JWT、Policy 与权限边界怎么落地
date: 2026-04-03 05:29:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

这篇文章不讨论完整身份平台建设，只聚焦 ASP.NET Core 里最常见、也最容易出错的一段：JWT 认证、Policy 授权，以及资源级权限边界该怎么落到代码里。

## 问题背景 ##

真实现场：一个后台退款接口原本只允许财务角色调用，但线上排查发现，普通运营账号只要拿到有效 token，也能调用成功。

根因并不复杂：

- 接口加了 `[Authorize]`
- 系统只校验“是否登录”
- 没有继续校验角色、权限和资源归属

结果就是，认证做了，授权却只做了一半。

这也是很多系统的共性问题。认证只是在回答“你是谁”，授权回答的是“你能做什么”。如果这两件事没有拆开设计，接口表面安全，实际边界会很模糊。

## 原理解析 ##

### 认证解决身份确认 ###

认证的目标，是确认当前请求对应的是哪个用户、哪个客户端，常见做法就是校验 JWT 的签名、过期时间、签发方和受众。

这一步做完后，系统拿到的是一个 `ClaimsPrincipal`。它说明“请求身份可信”，但并不说明这个身份就有所有权限。

### 授权解决操作范围 ###

授权是在认证之后，对用户能力做进一步判断。

在 ASP.NET Core 里，最常见的落点是 Policy。你可以按角色、权限声明、租户、部门或业务规则定义策略，而不是在控制器里到处手写 if 判断。

### 角色不等于权限模型 ###

很多系统一开始只有 Admin、Operator、User 这几个角色，后来业务一复杂，就会发现角色粒度太粗。

更稳妥的方式通常是：

- 角色用于粗粒度分组
- 权限声明用于精细操作控制

例如“财务”和“运营”都属于后台用户，但是否允许退款、导出、调价，应该由权限声明决定，而不是只靠角色名硬编码。

### 资源级授权才是真正的边界 ###

就算用户具备 `orders.refund` 权限，也不代表他可以操作所有订单。

很多越权问题出在这里：接口只校验了功能权限，没有校验资源归属，比如租户是否匹配、门店是否匹配、是否只能操作自己负责的数据。

所以完整授权通常分两层：

- 功能级：你有没有这个动作权限
- 资源级：你能不能对这条具体数据执行这个动作

## 示例代码 ##

下面用一个“订单退款接口”来说明一套常见落地方式。

先配置 JWT 认证：

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SigningKey"]!)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
```

再定义基于权限声明的授权策略：

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OrdersRefund", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permission", "orders.refund");
    });
});
```

如果 token 里的声明长这样：

```json
{
  "sub": "1001",
  "name": "alice",
  "tenant_id": "t-01",
  "permission": ["orders.read", "orders.refund"]
}
```

那么接口级功能授权可以这样写：

```csharp
app.MapPost("/api/orders/{id:long}/refund",
    async (
        long id,
        RefundRequest request,
        IAuthorizationService authorizationService,
        ClaimsPrincipal user,
        OrderRefundService service,
        CancellationToken ct) =>
    {
        var result = await service.RefundAsync(id, request, user, ct);
        return result ? Results.Ok() : Results.Forbid();
    })
    .RequireAuthorization("OrdersRefund");
```

但这样还不够。因为用户即使有退款权限，也未必能退任意租户、任意门店的订单。

所以业务层还要做资源级校验：

```csharp
public sealed class OrderRefundService
{
    private readonly AppDbContext _db;

    public OrderRefundService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> RefundAsync(
        long orderId,
        RefundRequest request,
        ClaimsPrincipal user,
        CancellationToken ct)
    {
        var tenantId = user.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrWhiteSpace(tenantId))
        {
            return false;
        }

        var order = await _db.Orders.FirstOrDefaultAsync(x => x.Id == orderId, ct);
        if (order is null)
        {
            return false;
        }

        if (!string.Equals(order.TenantId, tenantId, StringComparison.Ordinal))
        {
            return false;
        }

        if (order.Status != OrderStatus.Paid)
        {
            return false;
        }

        order.Status = OrderStatus.Refunded;
        order.RefundReason = request.Reason;
        order.RefundedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
```

如果你希望把这类判断进一步收敛到授权层，也可以自定义 Requirement 和 Handler：

```csharp
public sealed class SameTenantRequirement : IAuthorizationRequirement
{
}

public sealed class SameTenantHandler : AuthorizationHandler<SameTenantRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SameTenantRequirement requirement,
        Order resource)
    {
        var tenantId = context.User.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrWhiteSpace(tenantId) && tenantId == resource.TenantId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

这种方式的价值在于：功能权限和资源权限都能被组织成一致的授权模型，而不是散落在各个接口里。

## 工程实践建议 ##

### 不要把 `[Authorize]` 当成权限治理的终点 ###

`[Authorize]` 只能说明这个接口需要登录，不能说明权限模型已经设计正确。

真正需要明确的是：这个接口到底限制到角色、权限、租户、组织，还是具体资源。

### Claim 设计要稳定，不要随业务字段漂移 ###

JWT 里的声明一旦进入多个服务，就会变成契约。

建议优先保留稳定字段，例如用户 ID、租户 ID、权限编码，不要把频繁变化的展示信息和大块业务数据塞进 token。

### 权限编码要业务化 ###

与其用 Admin、Manager 这种泛化概念，不如直接定义 `orders.refund`、`orders.export`、`products.adjust-price` 这类权限编码。

这样做的好处是边界清晰，也更适合做前后端联动和审计。

### 认证失败、授权失败要能区分 ###

401 和 403 不是一回事。

- 401 表示身份无效或缺失
- 403 表示身份有效，但没有权限

很多系统把两者混成一个“没权限”，最后排查问题时非常费劲。

### 审计日志不要缺席 ###

高风险操作除了鉴权，还应该记录审计日志。至少要能追到：

- 谁发起了操作
- 操作了哪个资源
- 操作前后的关键状态
- 请求是否被拒绝以及原因

这样越权、误操作和合规追查才有依据。

## 评论区讨论 ##

- 你们现在的权限模型更偏角色驱动，还是权限点驱动？
- 资源级授权你们是放在 Policy Handler，还是业务层服务里？
- 对高风险接口，你们有没有单独做审计日志和告警？

## 总结 ##

认证鉴权最容易出问题的地方，不是 token 验不过，而是系统把“已登录”和“有权限”混成了一件事。

JWT 负责身份可信，Policy 负责能力边界，资源级校验负责数据归属。把这三层拆开设计，接口安全才不是停留在表面。
