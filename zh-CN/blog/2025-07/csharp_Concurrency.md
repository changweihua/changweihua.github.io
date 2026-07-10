---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET 并发令牌 详解
description: C#.NET 并发令牌 详解
date: 2025-07-23 10:05:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

在多用户环境中，多个进程或线程可能同时修改同一资源，导致数据不一致问题。并发控制是数据库和应用程序中用于解决这类问题的机制。

在数据库应用中，并发控制是确保数据一致性的关键技术。`EF Core` 通过并发令牌（`Concurrency Tokens`） 提供乐观并发控制机制。

### 常见并发问题 ###

- 丢失更新：两个用户同时修改同一记录，后提交的更新覆盖先提交的更新
- 脏读：一个事务读取另一个未提交事务的数据
- 不可重复读：同一查询在同一事务中返回不同结果

### 并发控制策略 ###

- 悲观锁：假设冲突一定会发生，通过锁机制阻止并发访问
- 乐观锁：假设冲突很少发生，在提交更新时检查是否有冲突

### 并发控制策略对比 ###

| 策略   |   实现机制     |   优点 |  缺点 |
| :----------: | :----------: | :---------: | :-------: |
| 悲观并发 | 加锁(`SELECT FOR UPDATE`)  | 保证强一致性 | 性能差，易死锁 |
| 乐观并发 | 冲突检测(版本号/时间戳)  | 高性能，无锁 | 需处理冲突 |
| 最后写入胜出 | 无冲突检测 | 实现简单 | 数据不一致风险高 |

`EF Core` 使用乐观并发控制，通过并发令牌实现。

## 配置并发令牌的三种方式 ##

### 数据注解(Data Annotations) ###

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Stock { get; set; }

    [ConcurrencyCheck] // 标记为并发令牌
    public Guid Version { get; set; }
}
```

### Fluent API配置 ###

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>()
        .Property(p => p.Version)
        .IsConcurrencyToken(); // 配置为并发令牌
}
```

### 行版本(数据库原生支持) ###

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Stock { get; set; }

    [Timestamp] // SQL Server专用
    public byte[] RowVersion { get; set; }
}
```

等效 `Fluent API` 配置：

```csharp
modelBuilder.Entity<Product>()
    .Property(p => p.RowVersion)
    .IsRowVersion(); // 自动标记为并发令牌
```

### 时间戳字段 ###

```csharp
public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; }
    
    [ConcurrencyCheck] // 数据注解方式
    public DateTime LastUpdated { get; set; }
}

// Fluent API 方式
modelBuilder.Entity<Order>()
    .Property(o => o.LastUpdated)
    .IsConcurrencyToken();
```

## 迁移与版本管理 ##

### 添加并发令牌迁移 ###

```bash
# 添加RowVersion字段
dotnet ef migrations add AddRowVersionConcurrencyToken

# 生成脚本
dotnet ef migrations script -o AddConcurrencyToken.sql
```

### 迁移文件内容 ###

```csharp
public partial class AddRowVersionConcurrencyToken : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<byte[]>(
            name: "RowVersion",
            table: "Products",
            rowVersion: true, // SQL Server特定
            nullable: false,
            defaultValue: new byte[0]);
        
        // 其他数据库提供程序
        // migrationBuilder.AddColumn<DateTime>(
        //     name: "LastUpdated",
        //     table: "Products",
        //     nullable: false,
        //     defaultValueSql: "CURRENT_TIMESTAMP");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "RowVersion",
            table: "Products");
    }
}
```

## 处理并发冲突 ##

### 基本异常处理 ###

```csharp
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    // 处理并发冲突
    foreach (var entry in ex.Entries)
    {
        var databaseValues = await entry.GetDatabaseValuesAsync();
        
        if (databaseValues == null)
        {
            // 记录已被删除
        }
        else
        {
            // 处理策略...
        }
    }
}
```

### 冲突解决策略 ###

#### 策略1: 客户端优先(覆盖数据库值) ####

```csharp
// 使用数据库值刷新原始值
entry.OriginalValues.SetValues(databaseValues);

// 再次尝试保存
await _context.SaveChangesAsync();
```

#### 策略2: 数据库优先(放弃当前更改) ####

```csharp
// 使用数据库值覆盖当前值
entry.CurrentValues.SetValues(databaseValues);
```

#### 策略3: 合并冲突值 ####

```csharp
var databaseProduct = (Product)databaseValues.ToObject();
var currentProduct = (Product)entry.Entity;

// 自定义合并逻辑
currentProduct.Stock = databaseProduct.Stock - currentProduct.OrderQuantity;
```

## 高级用法 ##

### 组合多个令牌 ###

```csharp
modelBuilder.Entity<Order>()
    .Property(o => o.Status)
    .IsConcurrencyToken();
    
modelBuilder.Entity<Order>()
    .Property(o => o.LastUpdated)
    .IsConcurrencyToken();
```

生成 `SQL` :

```sql
UPDATE Orders SET ... 
WHERE Id = @p0 
AND Status = @p1 
AND LastUpdated = @p2
```

### 计算列作为令牌 ###

```csharp
modelBuilder.Entity<Person>()
    .Property(p => p.FullName)
    .HasComputedColumnSql("[FirstName] + ' ' + [LastName]")
    .IsConcurrencyToken();
```

### 自定义令牌生成器 ###

```csharp
modelBuilder.Entity<Blog>()
    .Property(b => b.ConcurrencyToken)
    .HasValueGenerator<GuidValueGenerator>() // 每次更新生成新值
    .IsConcurrencyToken();
```

### 乐观锁重试策略 ###

```csharp
public async Task UpdateProductWithRetryAsync(Product product, int maxRetries = 3)
{
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            using (var context = new ApplicationDbContext())
            {
                context.Products.Update(product);
                await context.SaveChangesAsync();
                return;
            }
        }
        catch (DbUpdateConcurrencyException ex)
        {
            if (i == maxRetries - 1)
            {
                throw; // 达到最大重试次数，抛出异常
            }
            
            // 获取数据库中的最新值
            var entry = ex.Entries.Single();
            var databaseValues = entry.GetDatabaseValues();
            
            if (databaseValues == null)
            {
                throw new InvalidOperationException("记录已被删除");
            }
            
            // 合并更改
            entry.OriginalValues.SetValues(databaseValues);
            
            // 可选：将数据库中的值合并到当前实体
            entry.CurrentValues.SetValues(databaseValues);
        }
    }
}
```

### 分布式系统并发控制 ###

```csharp
// 添加ETag支持
public class Product
{
    [ConcurrencyCheck]
    public string ETag { get; set; } = Guid.NewGuid().ToString();
}

// API更新方法
[HttpPut("{id}")]
public async Task<IActionResult> UpdateProduct(int id, 
    [FromBody] ProductUpdateDto dto, 
    [FromHeader(Name = "If-Match")] string etag)
{
    var product = await context.Products.FindAsync(id);
    
    // 验证ETag
    if (product.ETag != etag)
    {
        return StatusCode(StatusCodes.Status412PreconditionFailed);
    }
    
    // 更新逻辑
    mapper.Map(dto, product);
    product.ETag = Guid.NewGuid().ToString(); // 生成新ETag
    
    await context.SaveChangesAsync();
    return Ok(product);
}
```

### 多数据库支持策略 ###

```csharp
// 统一并发令牌接口
public interface IConcurrencyTokenEntity
{
    byte[] RowVersion { get; set; }
    DateTime LastUpdated { get; set; }
    bool IsRowVersionSupported { get; }
}

// 实体基类
public abstract class EntityBase : IConcurrencyTokenEntity
{
    [Timestamp] 
    public byte[] RowVersion { get; set; }
    
    [ConcurrencyCheck]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    
    [NotMapped]
    public bool IsRowVersionSupported => 
        context.Database.ProviderName.Contains("SqlServer");
}

// 配置方法
modelBuilder.Entity<Product>(entity =>
{
    if (entity.Metadata.ClrType
        .GetInterface(nameof(IConcurrencyTokenEntity)) != null)
    {
        if (IsRowVersionSupported)
        {
            entity.Property("RowVersion")
                .IsRowVersion()
                .IsConcurrencyToken();
        }
        else
        {
            entity.Property("LastUpdated")
                .IsConcurrencyToken()
                .ValueGeneratedOnAddOrUpdate();
        }
    }
});
```

### 冲突日志记录 ###

```csharp
public class ConcurrencyExceptionHandler
{
    private readonly ILogger<ConcurrencyExceptionHandler> _logger;
    
    public async Task HandleAsync(DbUpdateConcurrencyException ex)
    {
        _logger.LogWarning("并发冲突发生: {Message}", ex.Message);
        
        foreach (var entry in ex.Entries)
        {
            var dbValues = await entry.GetDatabaseValuesAsync();
            var currentValues = entry.CurrentValues;
            var originalValues = entry.OriginalValues;
            
            var entityType = entry.Metadata.Name;
            var conflictDetails = new StringBuilder();
            
            foreach (var property in entry.Properties)
            {
                var dbValue = dbValues?[property.Metadata.Name];
                var currentValue = currentValues[property.Metadata.Name];
                
                if (!Equals(dbValue, originalValues[property.Metadata.Name]))
                {
                    conflictDetails.AppendLine(
                        $"{property.Metadata.Name}: " +
                        $"数据库值={dbValue}, " +
                        $"原始值={originalValues[property.Metadata.Name]}, " +
                        $"当前值={currentValue}");
                }
            }
            
            _logger.LogInformation(
                "实体 {EntityType} 冲突详情:\n{ConflictDetails}", 
                entityType, conflictDetails.ToString());
        }
    }
}
```

### 并发令牌与数据库的关系 ###

| 数据库   |   行版本实现方式     |   推荐配置方式 |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| SQL Server | rowversion 或 timestamp 类型 | 使用 `[Timestamp]` 特性  |  |
| PostgreSQL | xmin 系统列或 updated_at 字段  | 使用 `[ConcurrencyCheck]` |  |
| MySQL | TIMESTAMP 或 datetime 字段 | 使用 `[ConcurrencyCheck]` |  |
| SQLite | 自增 INTEGER PRIMARY KEY 或 datetime | 使用 `[ConcurrencyCheck]` |  |

### 最佳实践 ###

| 令牌类型   |   适用场景     |   注意事项 |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| `RowVersion` | 所有 `SQL Server` 环境 | 自动递增，性能最佳 |  |
| `GUID` | 多数据库兼容  | 存储空间大，索引效率低 |  |
| 时间戳 | 非 `SQL Server` 数据库 | 精度可能不足 |  |
| 组合字段 | 需要业务字段参与冲突检测 | 更新时需维护多个字段 |  |

### 性能优化建议 ###

#### 为令牌列创建索引 ####

```sql
CREATE NONCLUSTERED INDEX IX_Products_Version 
ON Products (Version)
```

#### 避免在令牌中使用大字段 ####

```csharp
// 避免 ❌
.Property(p => p.LargeDocument)
.IsConcurrencyToken();
```

#### 不要暴露令牌值 ####

```csharp
// DTO中排除令牌字段
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    // 排除 Version 字段
}
```

## 实战案例 ##

### 领域模型 ###

```csharp
public class InventoryItem
{
    public int Id { get; set; }
    public string ProductCode { get; set; }
    public int Stock { get; set; }
    
    [Timestamp]
    public byte[] RowVersion { get; set; }
}
```

### 库存扣减服务 ###

```csharp
public class InventoryService
{
    private readonly AppDbContext _context;

    public async Task<OperationResult> ReduceStock(string productCode, int quantity)
    {
        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.ProductCode == productCode);
        
        if (item == null)
            return OperationResult.Fail("Product not found");
        
        if (item.Stock < quantity)
            return OperationResult.Fail("Insufficient stock");
        
        item.Stock -= quantity;
        
        try
        {
            await _context.SaveChangesAsync();
            return OperationResult.Success();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            var entry = ex.Entries[0];
            var dbValues = await entry.GetDatabaseValuesAsync();
            
            if (dbValues == null)
                return OperationResult.Fail("Item deleted");
                
            var dbStock = dbValues.GetValue<int>(nameof(InventoryItem.Stock));
            
            if (dbStock >= quantity)
            {
                // 重试逻辑
                entry.OriginalValues.SetValues(dbValues);
                item.Stock = dbStock - quantity;
                await _context.SaveChangesAsync();
                return OperationResult.Success();
            }
            
            return OperationResult.Fail("Concurrent modification prevented");
        }
    }
}
```

### 局限性 ###

#### 分布式系统限制 ####

- 仅适用于单数据库事务
- 跨服务需分布式事务协调

#### 批量操作不适用 ####

```csharp
// 不会触发并发检查
context.Products
    .Where(p => p.IsDiscontinued)
    .ExecuteUpdate(p => p.SetProperty(x => x.Price, x => x.Price * 0.9));
```

#### 逻辑删除问题 ####

```csharp
public class SoftDeleteEntity
{
    public bool IsDeleted { get; set; }
    
    [ConcurrencyCheck]
    public Guid Version { get; set; }
}

// 删除时需更新Version
entity.IsDeleted = true;
entity.Version = Guid.NewGuid(); // 必须更新令牌
```

## MySQL 并发令牌完整配置流程 ##

### 实体类配置（使用版本号） ###

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    
    // 并发令牌字段
    [ConcurrencyCheck]
    public uint Version { get; set; }  // 推荐使用 uint 类型
}
```

### Fluent API 配置（MySQL 特有优化） ###

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>(entity =>
    {
        // 配置并发令牌
        entity.Property(p => p.Version)
            .IsConcurrencyToken()
            .ValueGeneratedOnAddOrUpdate()
            .HasDefaultValue(1);  // MySQL需要初始值
        
        // MySQL特定优化：配置列类型为 UNSIGNED
        entity.Property(p => p.Version)
            .HasColumnType("INT UNSIGNED");
    });
}
```

### MySQL 表结构生成 ###

```sql
CREATE TABLE `Products` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `Price` DECIMAL(18,2) NOT NULL,
  `Stock` INT NOT NULL,
  `Version` INT UNSIGNED NOT NULL DEFAULT 1, -- 无符号整数
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB;
```

### 冲突处理流程 ###

```csharp
public async Task UpdateProductPrice(int productId, decimal newPrice)
{
    using var context = new AppDbContext();
    
    var product = await context.Products.FindAsync(productId);
    if (product == null) throw new Exception("Product not found");
    
    product.Price = newPrice;
    
    try
    {
        await context.SaveChangesAsync();
    }
    catch (DbUpdateConcurrencyException ex)
    {
        var entry = ex.Entries[0];
        var databaseValues = await entry.GetDatabaseValuesAsync();
        
        if (databaseValues == null)
        {
            throw new Exception("The product was deleted by another user");
        }
        
        // 解决策略1：使用数据库值覆盖
        entry.OriginalValues.SetValues(databaseValues);
        
        // 解决策略2：合并值（自定义业务逻辑）
        var dbProduct = databaseValues.ToObject() as Product;
        var currentProduct = entry.Entity as Product;
        
        // 保留价格修改，但接受库存更新
        currentProduct.Stock = dbProduct.Stock;
        
        // 更新原始值以匹配数据库
        entry.OriginalValues.SetValues(databaseValues);
        
        // 重试保存
        await context.SaveChangesAsync();
    }
}
```

值状态对比表

| 状态   |   获取方式     |   并发冲突时值示例 |  典型用途 |
| :----------: | :----------: | :---------: | :-------: |
| `OriginalValues` | `entry.OriginalValues` | Version=1 | 生成WHERE子句 |
| `CurrentValues` | `entry.CurrentValues`  | Price=29.99 | 生成SET子句 |
| `DatabaseValues` | `entry.GetDatabaseValues()` | Version=2, Stock=50 | 冲突解决基准 |

### MySQL 特定优化策略 ###

#### 无符号整数优化 ####

```csharp
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .HasColumnType("INT UNSIGNED"); // 防止负值
```

#### 初始值配置 ####

```csharp
// 设置默认值
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .HasDefaultValue(1);
    
// 或使用SQL表达式
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .HasDefaultValueSql("1");
```

#### 自定义更新 SQL ####

```csharp
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .HasComputedColumnSql("`Version` + 1", stored: true);
```

### 并发控制最佳实践 ###

#### 索引优化建议 ####

```sql
ALTER TABLE Products ADD INDEX IX_Products_Version (Version);
```

#### 监控工具 ####

```sql
-- 查看当前锁状态
SHOW ENGINE INNODB STATUS;

-- 监控并发冲突
SELECT * FROM information_schema.INNODB_METRICS
WHERE NAME LIKE 'row_lock%';
```

#### 配置参数优化 ####

```ini
# my.cnf 配置
[mysqld]
innodb_autoinc_lock_mode = 2
innodb_thread_concurrency = 0
transaction-isolation = READ-COMMITTED
```

#### 重试策略实现 ####

```csharp
var policy = Policy.Handle<DbUpdateConcurrencyException>()
    .WaitAndRetryAsync(3, retryAttempt => 
        TimeSpan.FromMilliseconds(200 * Math.Pow(2, retryAttempt)),
    (ex, timeSpan, retryCount, context) => 
    {
        // 重试前刷新原始值
        var concurrencyEx = ex as DbUpdateConcurrencyException;
        foreach (var entry in concurrencyEx.Entries)
        {
            entry.OriginalValues.SetValues(entry.GetDatabaseValues());
        }
    });

await policy.ExecuteAsync(async () => 
{
    await db.SaveChangesAsync();
});
```

## MySQL 与传统 SQL Server 并发控制对比 ##

| 特性   |   MySQL     |   SQL Server |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| 推荐令牌类型 | UNSIGNED INT | ROWVERSION (timestamp) |  |
| 自动更新机制 | 需手动递增或使用触发器  | 自动更新 |  |
| 默认值要求 | 需要显式设置默认值 | 自动初始化 |  |
| 并发冲突检测效率 | 依赖索引性能 | 原生支持效率高 |  |
| 批量操作支持 | 部分支持 | 完善支持 |  |
| 最大并发值 | 4,294,967,295 (UINT max) | 8字节二进制 |  |

## 三大核心值状态详解 ##

### 原始值 (OriginalValues) ###

- 定义：实体从数据库加载时的初始值
- 生命周期：在查询后立即固定
- 关键特性：
  - 代表数据库中的原始状态
  - 用于生成 `UPDATE/DELETE` 的 `WHERE` 子句
  - 在并发控制中作为基准值

### 当前值 (CurrentValues) ###

- 定义：应用程序修改后的实体当前状态
- 生命周期：随用户操作动态变化
- 关键特性：
  - 反映实体在内存中的最新状态
  - 用于生成 `UPDATE` 的 `SET` 子句
  - 在 `SaveChanges` 时提交到数据库

**关键要点**：

- `OriginalValues` 是并发控制的基准
- `CurrentValues` 反映业务操作意图
- `DatabaseValues` 是冲突解决的依据

### 数据库值 (DatabaseValues) ###

- 定义：发生并发冲突时的数据库实际值
- 生命周期：仅在捕获并发异常时获取
- 关键特性：
  - 代表冲突发生时数据库的真实状态
  - 通过 `GetDatabaseValues()` 方法获取
  - 用于解决冲突的基准数据

## 值状态操作API详解 ##

### 访问原始值 ###

```csharp
var originalPrice = context.Entry(product)
                .OriginalValues
                .GetValue<decimal>(nameof(Product.Price));
```

### 设置当前值 ###

```csharp
context.Entry(product)
       .CurrentValues
       .SetValues(new { Price = 29.99M, Stock = 100 });
```

### 数据库值处理 ###

```csharp
var dbValues = context.Entry(product).GetDatabaseValues();
var dbProduct = dbValues.ToObject() as Product;
```

### 属性级操作 ###

```csharp
var entry = context.Entry(product);

// 标记属性已修改
entry.Property(p => p.Price).IsModified = true;

// 排除属性更新
entry.Property(p => p.Version).IsModified = false;
```
