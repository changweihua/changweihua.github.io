---
lastUpdated: true
commentabled: true
recommended: true
title: 给 .NET 网络调用设定“预算”
description: 用 `CancellationTokenSource.CancelAfter` 处理超时取消
date: 2026-10-19 10:25:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

网络请求没有在预期时间内完成时，调用方往往不希望无限等待。C# 的 `CancellationTokenSource.CancelAfter` 可以把这种等待上限表达为取消计划：到达指定时间后，它会向关联的取消令牌发出取消信号。Microsoft Learn 的示例把令牌传给 `HttpClient.GetAsync` 和 `HttpContent.ReadAsByteArrayAsync`，并在入口处捕获 `OperationCanceledException`。

## 先分清：取消信号不是“强行终止” ##

`CancelAfter` 的职责是安排取消，而不是替某个任意方法强制收尾。被调用的 API 是否能够及时结束，取决于它是否接收并观察同一个 CancellationToken。因此，下面两步应成对出现：

1. 用 `CancellationTokenSource` 生成令牌，并通过 `CancelAfter` 安排取消；
2. 把 `cts.Token` 继续传给支持取消的异步 API。

## 一个最小的 HTTP 示例 ##

```cs
using System.Net.Http;

static async Task<string> GetBodyAsync(Uri uri, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(timeout);

    try
    {
        using var response = await new HttpClient().GetAsync(uri, cts.Token);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync(cts.Token);
    }
    catch (OperationCanceledException) when (cts.IsCancellationRequested)
    {
        throw new TimeoutException($"请求在 {timeout} 内未完成。");
    }
}
```

这里的 `when (cts.IsCancellationRequested)` 用于区分这个调用范围内由超时计划触发的取消。是否要转换成 `TimeoutException` 取决于调用方的错误模型；如果上层需要统一处理取消，也可以保留原始的 `OperationCanceledException`。

## 把令牌传到实际 I/O 边界 ##

只在外层调用 `CancelAfter`、却遗漏向 I/O API 传递令牌，是最常见的失配。Microsoft Learn 的完整示例在循环中调用 `ProcessUrlAsync(url, client, s_cts.Token)`，而该方法又将 `token` 传给 `client.GetAsync(url, token)` 与 `response.Content.ReadAsByteArrayAsync(token)`。这样，下载尚未完成且已到取消时间时，等待中的可取消操作才有机会以取消结束。

## 异常处理放在调用边界 ##

官方示例在 `Main` 的 `try` 块中设置 `s_cts.CancelAfter(3500)` 并等待工作方法；若取消先发生，则捕获 `OperationCanceledException`。这种安排把“这一批工作是否超时”的决定集中在入口处，而不需要让每个底层方法各自猜测如何展示或记录超时。

同时要注意，取消与 HTTP 成功不是一回事：`GetAsync` 成功返回后，仍可能得到非成功状态码，所以示例额外调用 `EnsureSuccessStatusCode()`。取消逻辑解决的是等待边界；状态码校验仍应按业务需要单独处理。

## 资源生命周期也属于实现的一部分 ##

Microsoft Learn 的示例在 `finally` 中释放 `CancellationTokenSource`。在局部方法中使用 `using` 能让这一点更直接：请求成功、发生 HTTP 错误或因取消离开方法时，资源都会被释放。对于复用的 `HttpClient`，则应依据应用的生命周期和既有配置管理，而不是仅为一次请求随意复制全局策略。

## 落地检查清单 ##

- 超时上限是否由调用方明确给出，而不是散落的魔法数字？
- 令牌是否一直传到了数据库、HTTP、文件等真正可等待的 API？
- 是否在合适的调用边界处理 `OperationCanceledException`？
- 是否把取消、非成功 HTTP 状态和其他故障分别记录或映射？

把取消看作协作协议，而不是中断按钮，代码的控制流会更清晰：调用方声明等待预算，底层 API 观察令牌，边界层决定如何向上报告结果。

> 别把 `CancellationTokenSource.TryReset` 当成通用对象池：它的可复用边界

在高频、短生命周期的 .NET 操作里，看到 `CancellationTokenSource.TryReset()` 后，很容易把它理解为“用完的 CTS 可以直接复用”。这个理解过于宽泛。它的返回值和源码约束都指向同一件事：它只尝试把尚未进入取消状态的实例整理好，供下一次彼此无关的操作使用；它不会把已经取消的 token 变回未取消。

## 先读返回值：true 不是“任何时候都已重置” ##

微软 API 文档给出的签名是 `public bool TryReset()`。当该 `CancellationTokenSource` 尚未收到取消请求，并且其状态能够被重置以供后续操作使用时，方法返回 `true`；否则返回 `false`。

```cs
using var cts = new CancellationTokenSource();

// 当前操作已经结束，且 cts 从未被取消。
bool canReuse = cts.TryReset();
if (canReuse)
{
    // 此处才开始把同一个 cts 用于下一次独立操作。
}
```

因此，返回 `false` 不是异常信号，而是调用方应继续按原有生命周期处理该实例的结果。尤其不能据此假设一个已取消的 `token` 会恢复为未取消。

## 为什么“已经取消后再重置”不成立 ##

`dotnet/runtime` 中的实现先检查内部状态是否仍为未取消状态。源码注释明确说明：不能允许一个 `CancellationToken` 从“已取消”转回“未取消”。这保护了已经拿到该 `token` 的代码，使其观察到的取消语义不会倒退。

这也是设计 API 时应保留的判断顺序：如果一次操作可能已经调用过 `Cancel`，不要把 `TryReset` 当作恢复手段；应创建新的 `CancellationTokenSource`，并把新的 `token` 交给下一次操作。

## 带超时的 CTS 还有定时器条件 ##

源码还处理了 CTS 内部可能存在的定时器。实现只有在没有定时器，或成功把定时器改为无限等待、并确认它尚未进入队列时，才继续重置。原因很直接：若旧定时器仍可能触发取消，它就不应影响下一次独立操作。

```cs
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(5));

// 只有在操作已完成且调用方满足独占前提时，才考虑：
if (!cts.TryReset())
{
    // 不复用这个实例；为下一次操作创建新的 CTS。
}
```

这段示例没有承诺任何特定业务操作一定可复用；它展示的是调用方必须处理布尔结果，而不是忽略它。

## 注册回调是另一个边界 ##

成功重置时，运行时会清理现有注册。官方文档也提醒：成功后，这些注册不会在随后取消时收到通知。若其他组件仍然持有 CTS 或由它发出的 token，它们观察到的仍是同一个实例的当前状态。

所以，适合调用 `TryReset` 的不是“谁都可能持有 `token` 的共享 CTS”，而是调用方能够确认独占所有权的 CTS。文档列出的前提包括：上一项操作已完成、没有其他人会尝试取消它，以及残留注册本身是错误的或不应延续到下一项操作。

## 并发取消时不要调用它 ##

官方文档明确指出：`TryReset` 与请求取消并发执行并不线程安全。在这种并发下，它甚至可能返回 true，即使取消请求已经发生；注册回调也可能不会随该次并发取消被调用。换句话说，这不是一个用来协调取消竞争的原语。

工程上更稳妥的做法是先建立所有权边界：等待或停止上一项操作、确保没有并发 Cancel 调用者、再决定是否尝试重置。无法证明这些条件时，分配新的 CTS 通常更容易推理，也更不容易把旧操作的状态带入新操作。

## 一份简短的判断清单 ##

- 上一项操作是否已经结束？
- 该 CTS 是否从未被取消？
- 调用方是否独占 CTS，且没有其他取消者？
- 旧的注册是否不应带入下一项操作？
- 是否实际检查了 `TryReset` 的返回值？

五项都能明确回答“是”时，`TryReset` 才是值得考虑的生命周期优化。否则，新建 `CTS` 是更符合取消语义的选择。
