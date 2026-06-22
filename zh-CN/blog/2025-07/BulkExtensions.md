---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET EFCore.BulkExtensions 扩展详解
description: C#.NET EFCore.BulkExtensions 扩展详解
date: 2025-07-23 13:05:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`EFCore.BulkExtensions` 是一个开源库，用于扩展 `Entity Framework Core` 的功能，提供高效的批量操作（Bulk Operations）支持。原生 `EF Core` 在处理大量数据时性能较差（例如逐条插入 / 更新），而该库通过优化 `SQL` 执行，显著提升了批量操作的效率。

## 为什么需要 BulkExtensions？ ##

### EF Core 原生操作瓶颈 ###

| 操作类型   |   10,000 记录耗时     |   瓶颈原因 |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| SaveChanges | 5-10 秒  | 逐条SQL + 变更跟踪 |  |
| AddRange | 3-5 秒 | 仍生成多条INSERT |  |
| Update | 8-15 秒 | 逐条UPDATE语句 |  |

### BulkExtensions 性能优势 ###

| 操作类型   |   10,000 记录耗时     |   性能提升 |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| BulkInsert | 0.5-1 秒  | 10x |  |
| BulkUpdate | 1-2 秒 | 8x |  |
| BulkDelete | 0.3-0.8 秒 | 15x |  |

## 核心功能 ##

### 批量插入 (BulkInsert) ###

```csharp
using (var context = new ApplicationDbContext())
{
    var products = new List<Product>
    {
        new Product { Name = "Product 1", Price = 9.99m },
        new Product { Name = "Product 2", Price = 19.99m },
        // 1000+ 条记录...
    };

    // 批量插入
    await context.BulkInsertAsync(products);
}

// 基础用法
context.BulkInsert(entities);

// 高级配置
context.BulkInsert(entities, options => {
    options.BatchSize = 2000;          // 每批数量
    options.InsertIfNotExists = true;   // 仅插入不存在记录
    options.SetOutputIdentity = true;   // 获取数据库生成ID
    options.PropertiesToExclude = new List<string> { "CreatedDate" }; // 排除属性
});
```

### 批量更新 (BulkUpdate) ###

```csharp
using (var context = new ApplicationDbContext())
{
    var products = await context.Products
        .Where(p => p.Price < 10)
        .ToListAsync();

    // 修改价格
    foreach (var product in products)
    {
        product.Price *= 1.1m; // 提价10%
    }

    // 批量更新
    await context.BulkUpdateAsync(products);
}

context.BulkUpdate(entities, options => {
    options.BatchSize = 1000;
    options.PropertiesToInclude = new List<string> { "Name", "Price" }; // 仅更新指定列
    options.UpdateByProperties = new List<string> { "ProductCode" };    // 自定义更新条件
});
```

### 批量删除 (BulkDelete) ###

```csharp
using (var context = new ApplicationDbContext())
{
    // 按条件批量删除（无需先查询）
    await context.BulkDeleteAsync<Product>(p => p.IsDiscontinued);
}

// 通过实体删除
context.BulkDelete(entities);

// 通过条件删除
context.Products.Where(p => p.IsObsolete)
               .BatchDelete();

// 等效SQL: DELETE FROM Products WHERE IsObsolete = 1
```

### 批量合并 (UPSERT/BulkInsertOrUpdate) ###

```csharp
using (var context = new ApplicationDbContext())
{
    var products = new List<Product>
    {
        // 新记录（ID=0）将被插入
        new Product { Name = "New Product", Price = 29.99m },
        
        // 已有记录（ID>0）将被更新
        new Product { Id = 1, Name = "Updated Product", Price = 14.99m }
    };

    // 批量合并
    await context.BulkMergeAsync(products);
}

context.BulkInsertOrUpdate(entities, options => {
    options.MergeOnProperty = "UniqueCode"; // 根据此字段判断插入/更新
});
```

### 批量读取 (BulkRead) ###

```csharp
var existingData = context.Products
    .Where(p => p.CategoryId == 1)
    .BatchRead(include: p => p.Supplier); // 包含关联实体
```

## 关键技术实现 ##

### SQL 批量生成 ###

```sql
/* BulkInsert 生成的SQL */
INSERT INTO [Products] ([Name], [Price])
VALUES 
('Product1', 10.99),
('Product2', 20.50),
... -- 2000行/批
```

### 临时表策略 (SQL Server) ###

```sql
CREATE TABLE #TempProducts (...) -- 创建临时表
BULK INSERT INTO #TempProducts   -- 批量插入临时表
MERGE INTO Products USING #TempProducts -- 合并操作
```

### 变更跟踪绕过 ###

- 直接操作数据库，跳过 `EF` 变更跟踪
- 上下文不更新实体状态

## 性能优化 ##

### 批处理配置 ###

```csharp
var optimalOptions = new BulkConfig {
    BatchSize = 4000,              // SQL Server 推荐值
    UseTempDB = true,              // SQL Server 专用
    SetOutputIdentity = true,      // 需要返回ID时启用
    CalculateStats = true,         // 获取操作统计
    WithHoldlock = true,           // 高并发安全
    PropertiesToExclude = new List<string> { 
        "CreatedDate", "Version"   // 排除非更新字段
    }
};
```

### 关闭变更跟踪 ###

```csharp
context.ChangeTracker.AutoDetectChangesEnabled = false;
```

### 不同数据库优化策略 ###

| 数据库   |   推荐 BatchSize     |   特殊配置 |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| SQL Server | 2000-5000  | UseTempDB=true |  |
| PostgreSQL | 3000-7000 | PgBulkImport=true |  |
| MySQL | 1000-3000 | MySqlBulkCopy=true |  |
| SQLite | 500-1000 | 事务分割(每批单独事务) |  |

### 百万级数据导入 ###

```csharp
const int totalRecords = 1_000_000;
const int batchSize = 5000;

for (int i = 0; i < totalRecords; i += batchSize)
{
    var batch = data.Skip(i).Take(batchSize).ToList();
    
    context.BulkInsert(batch, options => {
        options.BatchSize = batchSize;
        options.SetOutputIdentity = false;
    });
    
    context.DetachAllEntities(); // 防止内存膨胀
}
```

### 错误处理 ###

```csharp
try {
    context.BulkInsert(entities);
} 
catch (DbUpdateException ex) {
    // 处理唯一键冲突等错误
}
```

## 高级用法 ##

### 配置批量操作选项 ###

```csharp
var options = new BulkConfig
{
    SetOutputIdentity = true,          // 返回自增ID
    BatchSize = 1000,                  // 每批处理记录数
    UseTempDB = true,                  // 使用临时表（提高性能）
    PropertiesToInclude = "Name,Price" // 仅更新指定属性
};

await context.BulkUpdateAsync(products, options);
```

### 处理导航属性 ###

```csharp
var options = new BulkConfig
{
    CascadeOperations = true,          // 启用级联操作
    IncludeGraph = true                // 包含关联对象
};

// 批量插入产品及其关联的评论
await context.BulkInsertAsync(productsWithReviews, options);
```

### 自定义映射 ###

```csharp
var mapping = new Dictionary<string, string>
{
    { "ProductName", "Name" },         // CSV中的ProductName映射到实体的Name
    { "UnitPrice", "Price" }
};

await context.BulkReadAsync<Product>(csvFilePath, mapping);
```

### 事务处理 ###

```csharp
using (var transaction = await context.Database.BeginTransactionAsync())
{
    try
    {
        await context.BulkInsertAsync(products1);
        await context.BulkUpdateAsync(products2);
        
        await transaction.CommitAsync();
    }
    catch (Exception)
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## 与EF Core原生操作对比 ##

| 功能   |   EF Core 原生     |   BulkExtensions |  优势说明 |
| :----------: | :----------: | :---------: | :-------: |
| 插入10k记录 | 5-10秒  | 0.3-0.8秒 | 减少网络往返 |
| 更新10k记录 | 8-15秒 | 1-2秒 | 批量UPDATE语句 |
| 删除10k记录 | 7-12秒 | 0.2-0.5秒 | 单条DELETE WHERE |
| 内存消耗 | 高 (变更跟踪) | 极低 | 绕过变更跟踪 |
| 事务控制 | 自动或显式事务 | 默认每批独立事务 | 避免大事务锁表 |
| 关联数据操作 | 完善 | 有限支持 | 推荐用于根实体操作 |

## 最佳实践 ##

### 批处理大小调优 ###

```csharp
// 动态计算批大小
int optimalBatchSize = Math.Max(1000, totalRecords / 20);
```

### 定期清理上下文 ###

```csharp
// 防止内存泄漏
context.ChangeTracker.Clear();
context.DetachAllEntities();
```

### 异步操作支持 ###

```csharp
await context.BulkInsertAsync(entities);
await context.BulkUpdateAsync(entities);
```
