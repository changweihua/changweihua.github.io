---
lastUpdated: true
commentabled: true
recommended: true
title: C# BackgroundService 中的作用域管理
description: C# BackgroundService 中的作用域管理
date: 2025-08-22 09:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---


在使用 .NET 的 `BackgroundService` 开发后台服务时，我们经常需要使用依赖注入来获取作用域服务。微软官方文档提供了一个在循环内创建作用域的示例，但这种做法是否总是最优的呢？

## 官方示例代码分析 ##

让我们先看看微软官方文档中的示例代码：

```c#
namespace App.ScopedService;
 
public sealed class ScopedBackgroundService( 
    IServiceScopeFactory serviceScopeFactory,
    ILogger<ScopedBackgroundService> logger) : BackgroundService
{
    private const string ClassName = nameof(ScopedBackgroundService);
 
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "{Name} is running.", ClassName);
 
        while (!stoppingToken.IsCancellationRequested)
        {
            using IServiceScope scope = serviceScopeFactory.CreateScope();
 
            IScopedProcessingService scopedProcessingService =
                scope.ServiceProvider.GetRequiredService<IScopedProcessingService>();
 
            await scopedProcessingService.DoWorkAsync(stoppingToken);
 
            await Task.Delay(10_000, stoppingToken);
        }
    }
 
    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "{Name} is stopping.", ClassName);
 
        await base.StopAsync(stoppingToken);
    }
}
```

**这种做法的潜在问题**

- 频繁的内存分配：每10秒创建一个新的 `IServiceScope`
- GC 压力增加：频繁的对象创建和销毁
- 服务解析开销：每次循环都需要重新解析服务

## 何时选择循环内创建作用域 ##

### 场景一：订单处理服务（推荐循环内） ###

当你的服务涉及数据库操作或持有状态时，应该在循环内创建作用域：

```C#
public interface IOrderProcessingService
{
    Task ProcessOrderAsync(int orderId, CancellationToken cancellationToken);
}
 
public class OrderProcessingService : IOrderProcessingService
{
    private readonly IDbContext _dbContext;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderProcessingService> _logger;
    
    public OrderProcessingService(IDbContext dbContext, IEmailService emailService, ILogger<OrderProcessingService> logger)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _logger = logger;
    }
 
    public async Task ProcessOrderAsync(int orderId, CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders.FindAsync(orderId);
        if (order != null)
        {
            order.Status = "Processing";
            await _dbContext.SaveChangesAsync(); // 修改数据库状态
            await _emailService.SendOrderConfirmationAsync(order.CustomerEmail);
        }
    }
}
 
public class OrderProcessingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<OrderProcessingBackgroundService> _logger;
 
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // ✅ 每次处理都创建新的作用域
            using var scope = _serviceScopeFactory.CreateScope();
            var orderService = scope.ServiceProvider.GetRequiredService<IOrderProcessingService>();
            
            try
            {
                var orderIds = await GetPendingOrderIds();
                foreach (var orderId in orderIds)
                {
                    await orderService.ProcessOrderAsync(orderId, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "订单处理失败");
            }
            
            await Task.Delay(30_000, stoppingToken);
        }
    }
}
```

**为什么要在循环内创建作用域？**

- DbContext 是有状态的，长时间持有会导致内存泄漏
- 每次处理需要新的数据库连接和事务
- 确保每次处理的数据一致性和隔离性

## 何时选择循环外创建作用域 ##

### 场景二：系统监控服务（推荐循环外） ###

当你的服务是无状态的，且执行频率较高时，应该在循环外创建作用域：

```C#
public interface ISystemMonitoringService
{
    Task<SystemMetrics> CollectMetricsAsync();
    Task LogMetricsAsync(SystemMetrics metrics);
}
 
public class SystemMonitoringService : ISystemMonitoringService
{
    private readonly ILogger<SystemMonitoringService> _logger;
    private readonly IConfiguration _configuration;
    
    // 无状态服务，不持有可变状态
    public SystemMonitoringService(ILogger<SystemMonitoringService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }
 
    public async Task<SystemMetrics> CollectMetricsAsync()
    {
        return new SystemMetrics
        {
            CpuUsage = await GetCpuUsageAsync(),
            MemoryUsage = await GetMemoryUsageAsync(),
            DiskUsage = await GetDiskUsageAsync(),
            Timestamp = DateTime.UtcNow
        };
    }
 
    public async Task LogMetricsAsync(SystemMetrics metrics)
    {
        _logger.LogInformation("系统指标 - CPU: {CpuUsage}%, 内存: {MemoryUsage}%, 磁盘: {DiskUsage}%", 
            metrics.CpuUsage, metrics.MemoryUsage, metrics.DiskUsage);
    }
}
 
public class SystemMonitoringBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<SystemMonitoringBackgroundService> _logger;
 
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ✅ 在循环外创建作用域，减少 GC 压力
        using var scope = _serviceScopeFactory.CreateScope();
        var monitoringService = scope.ServiceProvider.GetRequiredService<ISystemMonitoringService>();
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var metrics = await monitoringService.CollectMetricsAsync();
                await monitoringService.LogMetricsAsync(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "系统监控失败");
            }
            
            await Task.Delay(5_000, stoppingToken); // 5秒监控一次
        }
    }
}
```

**为什么可以在循环外创建作用域？**

- 服务是无状态的，不会累积内存
- 不涉及数据库操作或其他需要事务隔离的操作
- 频繁创建作用域会带来不必要的性能开销

## 决策指南 ##

### 选择循环内创建作用域的情况 ###

- ✅ 服务涉及数据库操作（DbContext）
- ✅ 服务持有可变状态，需要每次重置
- ✅ 需要事务隔离
- ✅ 处理大量数据，担心内存泄漏
- ✅ 执行间隔较长（分钟级）

### 选择循环外创建作用域的情况 ###

- ✅ 服务是无状态的
- ✅ 不涉及数据库或文件操作
- ✅ 执行频率很高（秒级）
- ✅ 注重性能优化
- ✅ 服务只读取配置或进行计算

## 性能对比 ##

| 方面  |  循环内创建  |  循环外创建  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| 内存分配 | 频繁 | 一次性 |  |
| GC 压力 | 较高 | 较低 |  |
| 服务解析开销 | 每次循环 | 一次性 |  |
| 状态隔离 | 完全隔离 | 共享状态 |  |
| 适用场景 | 有状态服务 | 无状态服务 |  |

## 总结 ##

微软官方示例在循环内创建作用域是为了展示最安全的做法，确保每次执行都有干净的状态。但在实际开发中，我们需要根据具体业务场景来权衡：

- **数据一致性和状态隔离优先** → 选择循环内创建
- **性能和资源使用优先** → 选择循环外创建
