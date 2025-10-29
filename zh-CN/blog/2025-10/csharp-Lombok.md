---
lastUpdated: true
commentabled: true
recommended: true
title: 打造.NET平台的Lombok
description: 实现构造函数注入、日志注入、构造者模式代码生成等功能
date: 2025-10-29 13:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

> 在Java生态系统中，Lombok是一个非常受欢迎的库，它通过注解的方式大大减少了Java开发者需要编写的样板代码量。通过简单的注解，如 `@Data`、`@Getter`、`@Setter`、`@AllArgsConstructor` 等，开发者可以自动生成getter/setter方法、构造函数、toString方法等。这不仅提高了开发效率，还减少了代码中的冗余，使代码更加简洁和易于维护。

然而，在.NET生态系统中，虽然没有直接等价于 `Lombok` 的官方库，但我们可以通过 `Roslyn` 源代码生成器来实现类似甚至更强大的功能。本文将介绍如何在.NET平台上构建一个类似 `Lombok` 的代码生成工具，实现构造函数注入、日志注入、构造者模式等代码生成功能。

## 为什么需要类似Lombok的工具？ ##

在现代软件开发中，我们经常需要编写大量重复的样板代码，例如：

- 依赖注入：为服务类编写构造函数注入代码
- 数据传输对象(DTO)：为实体类创建对应的DTO类
- Builder模式：为复杂对象创建Builder构建器
- 属性访问器：为私有字段生成公共属性
- 映射方法：在不同对象之间进行属性映射

这些样板代码不仅占用大量时间编写，还容易出错且难以维护。通过代码生成工具，我们可以自动化这些重复性工作，让开发者专注于业务逻辑的实现。

## Mud代码生成器 ##

`Mud` 代码生成器是一套基于 `Roslyn` 的源代码生成器，专门针对.NET平台设计，提供了类似 `Lombok` 的功能，甚至更加丰富。它包含两个主要组件：

[Mud.EntityCodeGenerator](https://gitee.com/mudtools/mud-code-generator)：实体代码生成器，用于根据实体类自动生成各种相关代码
[Mud.ServiceCodeGenerator](https://gitee.com/mudtools/mud-code-generator)：服务代码生成器，用于自动生成服务层相关代码

这套工具通过在代码中添加特定的特性(Attribute)标记，然后在编译时自动生成相应的代码，大大减少了开发者需要手动编写的代码量。

## 核心功能 ##

### 生成构造函数注入代码 ###

在.NET的依赖注入系统中，构造函数注入是最推荐的依赖注入方式。然而，手动编写构造函数注入代码可能会很繁琐，特别是当一个类需要注入多个服务时。

`Mud.ServiceCodeGenerator` 提供了多种注入特性，可以自动生成构造函数注入代码：

#### ConstructorInjectAttribute 字段注入 ####

使用 `[ConstructorInject]` 特性可以将类中已存在的私有只读字段通过构造函数注入初始化：

```csharp
[ConstructorInject]
public partial class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    
    // 生成的代码将包含:
    // public UserService(IUserRepository userRepository, IRoleRepository roleRepository)
    // {
    //     _userRepository = userRepository;
    //     _roleRepository = roleRepository;
    // }
}
```

#### LoggerInjectAttribute 日志注入 ####

使用 `[LoggerInject]` 特性可以为类注入ILogger类型的日志记录器：

```csharp
[LoggerInject]
public partial class UserService
{
    // 生成的代码将包含:
    // private readonly ILogger<UserService> _logger;
    // 
    // public UserService(ILoggerFactory loggerFactory)
    // {
    //     _logger = loggerFactory.CreateLogger<UserService>();
    // }
}
```

#### CacheInjectAttribute 缓存管理器注入 ####

使用 `[CacheInject]` 特性可以注入缓存管理器实例：

```csharp
[CacheInject]
public partial class UserService
{
    // 生成的代码将包含:
    // private readonly ICacheManager _cacheManager;
    // 
    // public UserService(ICacheManager cacheManager)
    // {
    //     _cacheManager = cacheManager;
    // }
}
```

#### UserInjectAttribute 用户管理器注入 ####

使用 `[UserInject]` 特性可以注入用户管理器实例：

```csharp
[UserInject]
public partial class UserService
{
    // 生成的代码将包含:
    // private readonly IUserManager _userManager;
    // 
    // public UserService(IUserManager userManager)
    // {
    //     _userManager = userManager;
    // }
}
```

#### OptionsInjectAttribute 配置项注入 ####

使用 `[OptionsInject]` 特性可以根据指定的配置项类型注入配置实例：

```csharp
[OptionsInject(OptionType = "TenantOptions")]
public partial class UserService
{
    // 生成的代码将包含:
    // private readonly TenantOptions _tenantOptions;
    // 
    // public UserService(IOptions<TenantOptions> tenantOptions)
    // {
    //     _tenantOptions = tenantOptions.Value;
    // }
}
```

#### CustomInjectAttribute 自定义注入 ####

使用 `[CustomInject]` 特性可以注入任意类型的依赖项：

```csharp
[CustomInject(VarType = "IRepository<SysUser>", VarName = "_userRepository")]
[CustomInject(VarType = "INotificationService", VarName = "_notificationService")]
public partial class UserService
{
    // 生成的代码将包含:
    // private readonly IRepository<SysUser> _userRepository;
    // private readonly INotificationService _notificationService;
    // 
    // public UserService(IRepository<SysUser> userRepository, INotificationService notificationService)
    // {
    //     _userRepository = userRepository;
    //     _notificationService = notificationService;
    // }
}
```

#### 组合注入示例 ####

多种注入特性可以组合使用，生成器会自动合并所有注入需求：

```csharp
[ConstructorInject]
[LoggerInject]
[CacheInject]
[UserInject]
[OptionsInject(OptionType = "TenantOptions")]
[CustomInject(VarType = "IRepository<SysUser>", VarName = "_userRepository")]
public partial class UserService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;
    
    // 生成的代码将包含所有注入项:
    // private readonly ILogger<UserService> _logger;
    // private readonly ICacheManager _cacheManager;
    // private readonly IUserManager _userManager;
    // private readonly TenantOptions _tenantOptions;
    // private readonly IRepository<SysUser> _userRepository;
    // private readonly IRoleRepository _roleRepository;
    // private readonly IPermissionRepository _permissionRepository;
    //
    // public UserService(
    //     ILoggerFactory loggerFactory,
    //     ICacheManager cacheManager,
    //     IUserManager userManager,
    //     IOptions<TenantOptions> tenantOptions,
    //     IRepository<SysUser> userRepository,
    //     IRoleRepository roleRepository,
    //     IPermissionRepository permissionRepository)
    // {
    //     _logger = loggerFactory.CreateLogger<UserService>();
    //     _cacheManager = cacheManager;
    //     _userManager = userManager;
    //     _tenantOptions = tenantOptions.Value;
    //     _userRepository = userRepository;
    //     _roleRepository = roleRepository;
    //     _permissionRepository = permissionRepository;
    // }
}
```

### Builder模式代码生成 ###

`Builder` 模式是一种创建型设计模式，能够分步骤创建复杂对象。使用 `Builder` 模式可以创建不同表现的对象，同时避免构造函数参数过多的问题。

`Mud.EntityCodeGenerator` 支持通过 `[Builder]` 特性自动生成 `Builder` 构建器模式代码：

```csharp
/// <summary>
/// 客户端信息实体类
/// </summary>
[DtoGenerator]
[Builder]
[Table(Name = "sys_client"),SuppressSniffer]
public partial class SysClientEntity
{
    /// <summary>
    /// id
    /// </summary>
    [property: Column(Name = "id", IsPrimary = true, Position = 1)]
    [property: Required(ErrorMessage = "id不能为空")]
    private long? _id;

    /// <summary>
    /// 客户端key
    /// </summary>
    [property: Column(Name = "client_key", Position = 3)]
    [property: Required(ErrorMessage = "客户端key不能为空")]
    private string _clientKey;

    /// <summary>
    /// 删除标志（0代表存在 2代表删除）
    /// </summary>
    [property: Column(Name = "del_flag", Position = 10)]
    private string _delFlag;
}
```

基于以上实体，将自动生成Builder构建器类：

```csharp
/// <summary>
/// <see cref="SysClientEntity"/> 的构建者。
/// </summary>
public class SysClientEntityBuilder
{
    private SysClientEntity _sysClientEntity = new SysClientEntity();

    /// <summary>
    /// 设置 <see cref="SysClientEntity.Id"/> 属性值。
    /// </summary>
    /// <param name="id">属性值</param>
    /// <returns>返回 <see cref="SysClientEntityBuilder"/> 实例</returns>
    public SysClientEntityBuilder SetId(long? id)
    {
        this._sysClientEntity.Id = id;
        return this;
    }

    /// <summary>
    /// 设置 <see cref="SysClientEntity.ClientKey"/> 属性值。
    /// </summary>
    /// <param name="clientKey">属性值</param>
    /// <returns>返回 <see cref="SysClientEntityBuilder"/> 实例</returns>
    public SysClientEntityBuilder SetClientKey(string clientKey)
    {
        this._sysClientEntity.ClientKey = clientKey;
        return this;
    }

    /// <summary>
    /// 设置 <see cref="SysClientEntity.DelFlag"/> 属性值。
    /// </summary>
    /// <param name="delFlag">属性值</param>
    /// <returns>返回 <see cref="SysClientEntityBuilder"/> 实例</returns>
    public SysClientEntityBuilder SetDelFlag(string delFlag)
    {
        this._sysClientEntity.DelFlag = delFlag;
        return this;
    }

    /// <summary>
    /// 构建 <see cref="SysClientEntity"/> 类的实例。
    /// </summary>
    public SysClientEntity Build()
    {
        return this._sysClientEntity;
    }
}
```

使用 `Builder` 模式可以链式设置实体属性，创建实体对象更加方便：

```csharp
var client = new SysClientEntityBuilder()
    .SetClientKey("client123")
    .SetDelFlag("0")
    .Build();
```

### DTO/VO代码生成 ###

在现代Web应用开发中，数据传输对象(DTO)和视图对象(VO)是常见的设计模式。它们用于在不同层之间传输数据，避免直接暴露实体类。

`Mud.EntityCodeGenerator` 可以自动生成DTO和VO类：

```csharp
/// <summary>
/// 客户端信息实体类
/// </summary>
[DtoGenerator]
[Table(Name = "sys_client"),SuppressSniffer]
public partial class SysClientEntity
{
    /// <summary>
    /// id
    /// </summary>
    [property: TableField(Fille = FieldFill.Insert, Value = FillValue.Id)]
    [property: Column(Name = "id", IsPrimary = true, Position = 1)]
    [property: Required(ErrorMessage = "id不能为空")]
    private long? _id;

    /// <summary>
    /// 客户端key
    /// </summary>
    [property: Column(Name = "client_key", Position = 3)]
    [property: Required(ErrorMessage = "客户端key不能为空")]
    [property: ExportProperty("客户端key")]
    [property: CustomVo1, CustomVo2]
    [property: CustomBo1, CustomBo2]
    private string _clientKey;

    /// <summary>
    /// 删除标志（0代表存在 2代表删除）
    /// </summary>
    [property: Column(Name = "del_flag", Position = 10)]
    [property: ExportProperty("删除标志")]
    [IgnoreQuery]
    private string _delFlag;
}
```

基于以上实体，将自动生成以下几类代码：

#### VO类 (视图对象) ####

```csharp
/// <summary>
/// 客户端信息实体类
/// </summary>
[SuppressSniffer, CompilerGenerated]
public partial class SysClientListOutput
{
    /// <summary>
    /// id
    /// </summary>
    public long? id { get; set; }

    /// <summary>
    /// 客户端key
    /// </summary>
    [ExportProperty("客户端key")]
    [CustomVo1, CustomVo2]
    public string? clientKey { get; set; }

    /// <summary>
    /// 删除标志（0代表存在 2代表删除）
    /// </summary>
    [ExportProperty("删除标志")]
    public string? delFlag { get; set; }
}
```

#### QueryInput类 (查询输入对象) ####

```csharp
// SysClientQueryInput.g.cs
/// <summary>
/// 客户端信息实体类
/// </summary>
[SuppressSniffer, CompilerGenerated]
public partial class SysClientQueryInput : DataQueryInput
{
    /// <summary>
    /// id
    /// </summary>
    public long? id { get; set; }
    /// <summary>
    /// 客户端key
    /// </summary>
    public string? clientKey { get; set; }
    /// <summary>
    /// 删除标志（0代表存在 2代表删除）
    /// </summary>
    public string? delFlag { get; set; }

    /// <summary>
    /// 构建通用的查询条件。
    /// </summary>
    public Expression<Func<SysClientEntity, bool>> BuildQueryWhere()
    {
        var where = LinqExtensions.True<SysClientEntity>();
        where = where.AndIF(this.id != null, x => x.Id == this.id);
        where = where.AndIF(!string.IsNullOrEmpty(this.clientKey), x => x.ClientKey == this.clientKey);
        where = where.AndIF(!string.IsNullOrEmpty(this.delFlag), x => x.DelFlag == this.delFlag);
        return where;
    }
}
```

#### CrInput类 (创建输入对象) ####

```csharp
// SysClientCrInput.g.cs
/// <summary>
/// 客户端信息实体类
/// </summary>
[SuppressSniffer, CompilerGenerated]
public partial class SysClientCrInput
{
    /// <summary>
    /// 客户端key
    /// </summary>
    [Required(ErrorMessage = "客户端key不能为空"), CustomBo1, CustomBo2]
    public string? clientKey { get; set; }
    /// <summary>
    /// 删除标志（0代表存在 2代表删除）
    /// </summary>
    public string? delFlag { get; set; }

    /// <summary>
    /// 通用的BO对象映射至实体方法。
    /// </summary>
    public virtual SysClientEntity MapTo()
    {
        var entity = new SysClientEntity();
        entity.ClientKey = this.clientKey;
        entity.DelFlag = this.delFlag;
        return entity;
    }
}
```

#### UpInput类 (更新输入对象) ####

```csharp
/// <summary>
/// 客户端信息实体类
/// </summary>
[SuppressSniffer, CompilerGenerated]
public partial class SysClientUpInput : SysClientCrInput
{
    /// <summary>
    /// id
    /// </summary>
    [Required(ErrorMessage = "id不能为空")]
    public long? id { get; set; }

    /// <summary>
    /// 通用的BO对象映射至实体方法。
    /// </summary>
    public override SysClientEntity MapTo()
    {
        var entity = base.MapTo();
        entity.Id = this.id;
        return entity;
    }
}
```

### 实体映射方法生成 ###

在不同对象之间进行属性映射是一项常见但繁琐的工作。`Mud.EntityCodeGenerator` 可以自动生成实体与DTO之间的映射方法：

```csharp
/// <summary>
/// 通用的实体映射至VO对象方法。
/// </summary>
public virtual SysClientListOutput MapTo()
{
    var voObj = new SysClientListOutput();
    voObj.id = this.Id;
    voObj.clientKey = this.ClientKey;
    voObj.delFlag = this.DelFlag;
    return voObj;
}
```

## 配置和使用 ##

### 项目配置 ###

在使用Mud代码生成器时，可以通过在项目文件中配置参数来自定义生成行为。

### 实体代码生成器配置参数 ###

```xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>  <!-- 在obj目录下保存生成的代码 -->
  <EntitySuffix>Entity</EntitySuffix>  <!-- 实体类后缀配置 -->
  <EntityAttachAttributes>SuppressSniffer</EntityAttachAttributes>  <!-- 生成的VO、BO类加上Attribute特性配置，多个特性时使用','分隔 -->
  
  <!-- 属性名配置 -->
  <PropertyNameLowerCaseFirstLetter>true</PropertyNameLowerCaseFirstLetter>  <!-- 是否将生成的属性名首字母小写，默认为true -->
  
  <!-- VO/BO 属性配置参数 -->
  <VoAttributes>CustomVo1Attribute,CustomVo2Attribute</VoAttributes>  <!-- 需要添加至VO类的自定义特性，多个特性时使用','分隔 -->
  <BoAttributes>CustomBo1Attribute,CustomBo2Attribute</BoAttributes>  <!-- 需要添加至BO类的自定义特性，多个特性时使用','分隔 -->
</PropertyGroup>

<ItemGroup>
  <CompilerVisibleProperty Include="EntitySuffix" />
  <CompilerVisibleProperty Include="EntityAttachAttributes" />
  <CompilerVisibleProperty Include="PropertyNameLowerCaseFirstLetter" />
  <CompilerVisibleProperty Include="VoAttributes" />
  <CompilerVisibleProperty Include="BoAttributes" />
</ItemGroup>
```

### 服务代码生成器配置参数 ###

```xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>  <!-- 在obj目录下保存生成的代码 -->
  
  <!-- 依赖注入相关配置 -->
  <DefaultCacheManagerType>ICacheManager</DefaultCacheManagerType>  <!-- 缓存管理器类型默认值 -->
  <DefaultUserManagerType>IUserManager</DefaultUserManagerType>  <!-- 用户管理器类型默认值 -->
  <DefaultLoggerVariable>_logger</DefaultLoggerVariable>  <!-- 日志变量名默认值 -->
  <DefaultCacheManagerVariable>_cacheManager</DefaultCacheManagerVariable>  <!-- 缓存管理器变量名默认值 -->
  <DefaultUserManagerVariable>_userManager</DefaultUserManagerVariable>  <!-- 用户管理器变量名默认值 -->
  
  <!-- 服务生成相关配置 -->
  <ServiceGenerator>true</ServiceGenerator>  <!-- 是否生成服务端代码 -->
  <EntitySuffix>Entity</EntitySuffix>  <!-- 实体类后缀配置 -->
  <ImpAssembly>Mud.System</ImpAssembly>  <!-- 需要生成代码的接口实现程序集 -->
  
  <!-- DTO生成相关配置 -->
  <EntityAttachAttributes>SuppressSniffer</EntityAttachAttributes>  <!-- 实体类加上Attribute特性配置，多个特性时使用','分隔 -->
</PropertyGroup>

<ItemGroup>
  <CompilerVisibleProperty Include="DefaultCacheManagerType" />
  <CompilerVisibleProperty Include="DefaultUserManagerType" />
  <CompilerVisibleProperty Include="DefaultLoggerVariable" />
  <CompilerVisibleProperty Include="DefaultCacheManagerVariable" />
  <CompilerVisibleProperty Include="DefaultUserManagerVariable" />
  <CompilerVisibleProperty Include="ServiceGenerator" />
  <CompilerVisibleProperty Include="EntitySuffix" />
  <CompilerVisibleProperty Include="ImpAssembly" />
  <CompilerVisibleProperty Include="EntityAttachAttributes" />
</ItemGroup>
```

### 依赖项配置 ###

```xml
<ItemGroup>
  <!-- 引入的代码生成器程序集 -->
  <PackageReference Include="Mud.EntityCodeGenerator" Version="1.1.8" />
  <PackageReference Include="Mud.ServiceCodeGenerator" Version="1.1.8" />
</ItemGroup>
```

## 高级特性 ##

### 忽略字段注入 ###

对于某些不需要通过构造函数注入的字段，可以使用 `[IgnoreGenerator]` 特性标记：

```csharp
[ConstructorInject]
public partial class UserService
{
    private readonly IUserRepository _userRepository;
    
    [IgnoreGenerator]
    private readonly string _connectionString = "default_connection_string"; // 不会被注入
    
    // 只有_userRepository会被构造函数注入
}
```

### 自定义属性生成 ###

Mud 代码生成器支持通过配置参数为生成的类添加自定义特性：

```xml
<PropertyGroup>
  <!-- 需要添加至VO类的自定义特性，多个特性时使用','分隔 -->
  <VoAttributes>CustomVo1Attribute,CustomVo2Attribute</VoAttributes>
  <!-- 需要添加至BO类的自定义特性，多个特性时使用','分隔 -->
  <BoAttributes>CustomBo1Attribute,CustomBo2Attribute</BoAttributes>
</PropertyGroup>
```

## 与其他工具的比较 ##

### 与AutoMapper的比较 ###

AutoMapper 是一个流行的对象映射工具，但它运行时进行映射，而Mud代码生成器在编译时生成映射代码。这意味着：

- 性能：Mud生成的代码在运行时性能更好，因为没有反射开销
- 类型安全：编译时生成的代码具有更好的类型安全性
- 调试友好：生成的代码可以直接调试，更容易排查问题

### 与传统手工编码的比较 ###

- 开发效率：大大减少了样板代码的编写时间
- 维护性：当实体类发生变化时，相关代码会自动更新
- 一致性：生成的代码风格统一，减少了人为错误

## 最佳实践 ##

### 合理使用特性标记 ###

不要为所有类都添加代码生成特性，只在确实需要的类上使用。过度使用可能导致生成大量不必要的代码。

### 配置参数优化 ###

根据项目实际情况配置生成参数，例如：

```xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
  <EntitySuffix>Entity</EntitySuffix>
  <PropertyNameLowerCaseFirstLetter>false</PropertyNameLowerCaseFirstLetter>
</PropertyGroup>
```

### 查看生成代码 ###

在开发阶段，建议启用 `[EmitCompilerGeneratedFiles]` 参数，以便查看生成的代码：

```xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
</PropertyGroup>
```

生成的代码将位于 `obj/[Configuration]/[TargetFramework]/generated/` 目录下，文件名以 `.g.cs` 结尾。

### 版本管理 ###

生成的代码不需要加入版本管理，因为它们会在编译时自动生成。可以在 `.gitignore` 中添加：

```txt
**/*.g.cs
```

## 实际应用案例 ##

### 案例1：用户服务类 ###

```csharp
[ConstructorInject]
[LoggerInject]
[CacheInject]
[UserInject]
public partial class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    
    public async Task<UserDto> GetUserAsync(long userId)
    {
        _logger.LogInformation("Getting user with id: {UserId}", userId);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User with id {UserId} not found", userId);
            return null;
        }
        
        var userDto = user.MapTo();
        return userDto;
    }
}
```

### 案例2：订单实体类 ###

```csharp
[DtoGenerator]
[Builder]
public partial class OrderEntity
{
    [property: Column(Name = "id", IsPrimary = true)]
    [property: Required]
    private long? _id;
    
    [property: Column(Name = "order_no")]
    [property: Required]
    private string _orderNo;
    
    [property: Column(Name = "amount")]
    [property: Required]
    private decimal? _amount;
    
    [property: Column(Name = "status")]
    private string _status;
}
```

## 性能和安全性考虑 ##

### 性能优势 ###

- 编译时生成：所有代码在编译时生成，运行时无额外开销
- 无反射调用：生成的代码直接调用，避免反射带来的性能损耗
- 类型安全：编译时检查确保类型安全，减少运行时错误

### 安全性考虑 ###

- 代码审查：虽然代码是自动生成的，但仍需要审查生成的代码以确保符合安全要求
- 依赖注入：通过构造函数注入确保依赖关系明确，便于测试和维护
- 访问控制：生成的属性和方法遵循.NET的访问控制原则

## 扩展和定制 ##

Mud代码生成器设计为可扩展的，开发者可以根据自己的需求定制代码生成逻辑：

- 自定义特性：可以创建自己的特性来控制代码生成行为
- 模板定制：可以修改代码生成模板以适应特定需求
- 插件机制：可以通过插件机制添加新的代码生成功能

## 总结 ##

通过Mud代码生成器，我们可以在.NET平台上实现类似Java Lombok的功能，甚至更加丰富和强大。这套工具通过Roslyn源代码生成技术，在编译时自动生成我们需要的样板代码，大大提高了开发效率，减少了手动编写代码的工作量。

**主要优势包括**：

- 提高开发效率：自动生成构造函数注入、Builder模式、DTO等代码
- 保证代码质量：生成的代码遵循统一规范，减少人为错误
- 提升性能：编译时生成，运行时无额外开销
- 易于维护：当源代码变化时，相关代码自动更新

通过合理使用这套工具，我们可以专注于业务逻辑的实现，而将重复性的样板代码交给代码生成器处理，真正实现高效、高质量的软件开发。

无论你是正在开发新的.NET项目，还是想要重构现有项目以减少样板代码，Mud代码生成器都是一个值得考虑的强大工具。它不仅能够显著提高开发效率，还能帮助团队保持代码的一致性和可维护性。

开始使用Mud代码生成器，让你的.NET开发体验更加接近Java Lombok带来的便利，甚至更进一步！
