---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET 仓储模式详解
description: C#.NET 仓储模式详解
date: 2025-07-23 14:05:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

仓储模式（`Repository Pattern`）是一种数据访问抽象模式，它在领域模型和数据访问层之间创建了一个隔离层，使得领域模型无需直接与数据访问逻辑交互。仓储模式的核心思想是将数据访问逻辑封装在一个独立的组件中，使业务逻辑与数据访问解耦。

## 仓储模式核心概念 ##

### 仓储模式定义 ###

仓储（ `Repository` ）是一个领域对象的集合抽象，它：

- 封装数据访问细节
- 提供领域对象集合的接口
- 隔离业务逻辑与数据存储技术
- 与传统数据访问层对比

| 特性   |   仓储模式     |   传统DAL |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| 抽象级别 | 领域对象集合  | 数据库表操作 |  |
| 关注点 | 领域模型持久化 | 数据CRUD操作 |  |
| 技术耦合 | 完全解耦 | 与具体实现紧密耦合 |  |
| 可测试性 | 易于模拟(Mock) | 测试困难 |  |
| 扩展性 | 支持多种数据源 | 通常单一数据源 |  |

## 仓储模式的核心作用 ##

### 解耦业务逻辑与数据访问 ###

- 业务层不需要依赖具体的数据访问技术（如 `Entity Framework`、`Dapper` 等）
- 更换数据存储方式时（如从 `SQL Server` 切换到 `MongoDB`），无需修改业务逻辑

### 提高可测试性 ###

- 可以通过实现仓储接口的模拟对象（ `Mock` ）进行单元测试
- 隔离外部依赖，使测试更专注于业务逻辑

### 统一数据访问接口 ###

- 为不同的实体提供一致的数据操作方法（如 `CRUD` ）
- 简化数据访问代码，减少重复工作

### 支持领域驱动设计（DDD） ###

- 作为领域模型与数据持久化之间的桥梁
- 帮助实现聚合根（ `Aggregate Root` ）的概念

## 仓储模式实现详解 ##

### 基础接口定义 ###

```csharp
public interface IRepository<TEntity> where TEntity : class
{
    // 查询操作
    TEntity GetById(int id);
    Task<TEntity> GetByIdAsync(int id);
    IEnumerable<TEntity> GetAll();
    Task<IEnumerable<TEntity>> GetAllAsync();
    IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> predicate);
    
    // 修改操作
    void Add(TEntity entity);
    Task AddAsync(TEntity entity);
    void AddRange(IEnumerable<TEntity> entities);
    void Update(TEntity entity);
    void Remove(TEntity entity);
    void RemoveRange(IEnumerable<TEntity> entities);
    
    // 聚合函数
    int Count(Expression<Func<TEntity, bool>> predicate = null);
    bool Any(Expression<Func<TEntity, bool>> predicate);
}
```

### 泛型仓储实现 (EF Core) ###

```csharp
public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly DbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public Repository(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    public virtual TEntity GetById(int id) => 
        _dbSet.Find(id);

    public virtual async Task<TEntity> GetByIdAsync(int id) => 
        await _dbSet.FindAsync(id);

    public virtual IEnumerable<TEntity> GetAll() => 
        _dbSet.ToList();

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync() => 
        await _dbSet.ToListAsync();

    public virtual IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> predicate) => 
        _dbSet.Where(predicate).ToList();

    public virtual void Add(TEntity entity) => 
        _dbSet.Add(entity);

    public virtual async Task AddAsync(TEntity entity) => 
        await _dbSet.AddAsync(entity);

    public virtual void AddRange(IEnumerable<TEntity> entities) => 
        _dbSet.AddRange(entities);

    public virtual void Update(TEntity entity) => 
        _context.Entry(entity).State = EntityState.Modified;

    public virtual void Remove(TEntity entity) => 
        _dbSet.Remove(entity);

    public virtual void RemoveRange(IEnumerable<TEntity> entities) => 
        _dbSet.RemoveRange(entities);

    public virtual int Count(Expression<Func<TEntity, bool>> predicate = null) => 
        predicate == null ? _dbSet.Count() : _dbSet.Count(predicate);

    public virtual bool Any(Expression<Func<TEntity, bool>> predicate) => 
        _dbSet.Any(predicate);
}
```

### 工作单元(Unit of Work)模式集成 ###

```csharp
public interface IUnitOfWork : IDisposable
{
    IRepository<TEntity> GetRepository<TEntity>() where TEntity : class;
    Task<int> CommitAsync();
    int Commit();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly DbContext _context;
    private Dictionary<Type, object> _repositories;

    public UnitOfWork(DbContext context)
    {
        _context = context;
        _repositories = new Dictionary<Type, object>();
    }

    public IRepository<TEntity> GetRepository<TEntity>() where TEntity : class
    {
        if (_repositories.ContainsKey(typeof(TEntity)))
            return (IRepository<TEntity>)_repositories[typeof(TEntity)];
        
        var repository = new Repository<TEntity>(_context);
        _repositories.Add(typeof(TEntity), repository);
        return repository;
    }

    public async Task<int> CommitAsync() => 
        await _context.SaveChangesAsync();

    public int Commit() => 
        _context.SaveChanges();

    public void Dispose() => 
        _context.Dispose();
}
```

## 高级应用 ##

### 特定领域仓储 ###

```csharp
// 用户领域特定接口
public interface IUserRepository : IRepository<User>
{
    User GetByEmail(string email);
    Task<User> GetByUsernameAsync(string username);
    IEnumerable<User> GetActiveUsers();
    Task<int> CountActiveUsersAsync();
}

// 具体实现
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public User GetByEmail(string email) => 
        _context.Users.FirstOrDefault(u => u.Email == email);

    public async Task<User> GetByUsernameAsync(string username) => 
        await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

    public IEnumerable<User> GetActiveUsers() => 
        _context.Users.Where(u => u.IsActive).ToList();

    public async Task<int> CountActiveUsersAsync() => 
        await _context.Users.CountAsync(u => u.IsActive);
}
```

### 规范模式(Specification)集成 ###

```csharp
// 规范接口
public interface ISpecification<T>
{
    Expression<Func<T, bool>> Criteria { get; }
    List<Expression<Func<T, object>>> Includes { get; }
    Expression<Func<T, object>> OrderBy { get; }
    Expression<Func<T, object>> OrderByDescending { get; }
}

// 仓储扩展
public static class RepositoryExtensions
{
    public static IQueryable<T> ApplySpecification<T>(this IRepository<T> repository, ISpecification<T> spec) 
        where T : class
    {
        var query = repository.GetQueryable();
        
        // 包含关联实体
        if (spec.Includes != null)
        {
            query = spec.Includes.Aggregate(
                query, (current, include) => current.Include(include));
        }
        
        // 应用条件
        if (spec.Criteria != null)
        {
            query = query.Where(spec.Criteria);
        }
        
        // 排序
        if (spec.OrderBy != null)
        {
            query = query.OrderBy(spec.OrderBy);
        }
        else if (spec.OrderByDescending != null)
        {
            query = query.OrderByDescending(spec.OrderByDescending);
        }
        
        return query;
    }
}
```

### 分页查询支持 ###

```csharp
public class PagedResult<T>
{
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public List<T> Items { get; set; }
}

public static class RepositoryExtensions
{
    public static async Task<PagedResult<T>> GetPagedAsync<T>(
        this IRepository<T> repository,
        Expression<Func<T, bool>> filter = null,
        int pageNumber = 1,
        int pageSize = 10,
        Expression<Func<T, object>> orderBy = null,
        bool ascending = true) where T : class
    {
        var query = repository.GetQueryable();
        
        if (filter != null)
            query = query.Where(filter);
        
        var totalCount = await query.CountAsync();
        
        if (orderBy != null)
        {
            query = ascending ? 
                query.OrderBy(orderBy) : 
                query.OrderByDescending(orderBy);
        }
        
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return new PagedResult<T>
        {
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Items = items
        };
    }
}
```

## 最佳实践 ##

### 依赖注入配置 ###

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // 注册DbContext
    services.AddDbContext<AppDbContext>(options => 
        options.UseSqlServer(Configuration.GetConnectionString("Default")));
    
    // 注册泛型仓储
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    
    // 注册工作单元
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    
    // 注册特定领域仓储
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IOrderRepository, OrderRepository>();
}
```

### 服务层使用示例 ###

```csharp
public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<User> RegisterUser(UserRegistrationDto dto)
    {
        if (await _userRepository.Any(u => u.Email == dto.Email))
            throw new Exception("Email already exists");
        
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password)
        };
        
        _userRepository.Add(user);
        await _unitOfWork.CommitAsync();
        
        return user;
    }
    
    public async Task<PagedResult<User>> GetActiveUsers(int page, int pageSize)
    {
        return await _userRepository.GetPagedAsync(
            filter: u => u.IsActive,
            pageNumber: page,
            pageSize: pageSize,
            orderBy: u => u.CreatedDate,
            ascending: false);
    }
}
```

### 性能优化技巧 ###

```csharp
// 1. 使用异步操作
await _userRepository.GetByIdAsync(id);

// 2. 禁用变更跟踪（只读查询）
var users = await _userRepository
    .GetQueryable()
    .AsNoTracking()
    .Where(u => u.IsActive)
    .ToListAsync();

// 3. 批量操作
_userRepository.AddRange(users);
await _unitOfWork.CommitAsync();

// 4. 延迟加载避免（使用Include预加载）
var userWithOrders = await _userRepository
    .GetQueryable()
    .Include(u => u.Orders)
    .FirstOrDefaultAsync(u => u.Id == userId);
```

### 在工作单元中实现事务 ###

```csharp
public async Task CreateOrderWithTransaction(Order order, Payment payment)
{
    using var transaction = await _unitOfWork.BeginTransactionAsync();
    
    try
    {
        _orderRepository.Add(order);
        _paymentRepository.Add(payment);
        
        await _unitOfWork.CommitAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 测试策略 ###

```csharp
// 使用Moq测试仓储
[Fact]
public async Task RegisterUser_Should_AddNewUser()
{
    // 准备
    var mockRepo = new Mock<IUserRepository>();
    var mockUnit = new Mock<IUnitOfWork>();
    var service = new UserService(mockRepo.Object, mockUnit.Object);
    
    var dto = new UserRegistrationDto { /* ... */ };
    
    // 执行
    var user = await service.RegisterUser(dto);
    
    // 断言
    mockRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
    mockUnit.Verify(u => u.CommitAsync(), Times.Once);
    Assert.NotNull(user);
}
```

## 高级用法 ##

### 缓存集成 ###

```csharp
public class CachedUserRepository : IUserRepository
{
    private readonly IUserRepository _decorated;
    private readonly IDistributedCache _cache;
    
    public CachedUserRepository(IUserRepository decorated, IDistributedCache cache)
    {
        _decorated = decorated;
        _cache = cache;
    }
    
    public async Task<User> GetByIdAsync(int id)
    {
        var cacheKey = $"user_{id}";
        var user = await _cache.GetAsync<User>(cacheKey);
        
        if (user != null) return user;
        
        user = await _decorated.GetByIdAsync(id);
        if (user != null)
        {
            await _cache.SetAsync(cacheKey, user, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });
        }
        
        return user;
    }
    
    // 其他方法委托给_decorated实现...
}
```

### 多数据库支持 ###

```csharp
public class HybridOrderRepository : IOrderRepository
{
    private readonly SqlOrderRepository _sqlRepo;
    private readonly CosmosOrderRepository _cosmosRepo;
    
    public HybridOrderRepository(
        SqlOrderRepository sqlRepo, 
        CosmosOrderRepository cosmosRepo)
    {
        _sqlRepo = sqlRepo;
        _cosmosRepo = cosmosRepo;
    }
    
    public async Task AddAsync(Order order)
    {
        // 写操作到两个数据库
        await _sqlRepo.AddAsync(order);
        await _cosmosRepo.AddAsync(order);
    }
    
    public async Task<Order> GetByIdAsync(int id)
    {
        // 优先从缓存数据库读取
        var order = await _cosmosRepo.GetByIdAsync(id);
        return order ?? await _sqlRepo.GetByIdAsync(id);
    }
}
```

## 场景 ##

### 推荐使用场景 ###

- 领域驱动设计( `DDD` )：聚合根持久化
- 复杂业务系统：多数据源协调
- 可测试性要求高：业务逻辑单元测试
- 多数据源支持：混合 `SQL/NoSQL/API`
- 架构演进：准备替换数据访问技术

### 不推荐使用场景 ###

- 简单 `CRUD` 应用：增加不必要复杂度
- 高性能要求：直接使用原始 `SQL` 更高效
- 微服务简单查询：`CQRS` 模式更合适
- 小型项目：`YAGNI` 原则（不需要就不要加）
