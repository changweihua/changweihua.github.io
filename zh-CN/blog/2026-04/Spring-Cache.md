---
lastUpdated: true
commentabled: true
recommended: true
title: 如何使用 Spring Cache
description: 如何使用 Spring Cache
date: 2026-04-09 11:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、Spring Cache简介 ##

Spring Cache 是 Spring 框架提供的一套声明式缓存抽象层，通过注解方式简化缓存操作，它通过在方法上添加注解（如 `@Cacheable`、`@CacheEvict`）来地管理缓存操作，无需手动编写缓存逻辑。

它支持多种缓存实现（如 Caffeine、Redis、EhCache），并统一了缓存访问的 API。

这里需要注意两点：

- Spring Cache 只是一个声明式的抽象缓存层，意思是它只提供了接口，不提供实现
- 具体的实现可以有很多，比如 Caffeine，Redis，EhCache 这些，只要实现了这些接口，就可以被 Spring Cache 使用。

**核心特点**：

- 基于注解的声明式缓存
- 支持 SpEL 表达式
- 自动与 Spring 生态集成
- 支持条件缓存

## 二、基础配置 ##

### 添加依赖 ###

```xml
<!-- Spring Boot Cache Starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- 如果使用Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 如果使用caffeine -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

### 启用缓存 ###

在启动类添加 `@EnableCaching` 注解：

```java
@SpringBootApplication
@EnableCaching
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
```

### 缓存配置方案 ###

#### 方案1：通过 yml 配置文件 ####

```yml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=60s
    # 或者分开配置
    cache-names: users,products
    caffeine.spec: # 全局默认配置
      maximumSize=1000,
      expireAfterAccess=30m
```

#### 方案2：自定义 Bean ####

```java
@Configuration  // 标记这是一个Spring配置类
public class CacheConfig {

    /**
     * 创建并配置Caffeine缓存管理器
     *
     * @return CacheManager 实例，用于管理应用中所有缓存
     *
     * 主要配置参数说明：
     * - initialCapacity: 初始缓存空间大小（提升初始性能）
     * - maximumSize: 缓存最大容量（基于条目数）
     * - expireAfterWrite: 写入后过期时间（数据一致性优先场景）
     * - recordStats: 开启统计功能（用于监控和调优）
     */
    @Bean
    public CacheManager cacheManager() {
        // 创建Caffeine缓存管理器实例
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // 配置Caffeine缓存参数
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)      // 初始容量100个条目
                .maximumSize(1000)          // 最大缓存1000个条目，超过后按LRU淘汰
                .expireAfterWrite(10, TimeUnit.MINUTES)  // 写入10分钟后过期
                .recordStats());           // 启用缓存统计（命中率等）

        return cacheManager;
    }

    /**
     * 创建短期缓存实例（独立于主缓存管理器）
     *
     * @return Cache 实例，适用于高频访问的临时数据
     *
     * 典型使用场景：
     * - 高频访问的临时数据
     * - 需要快速失效的验证码等
     * - 与其他缓存不同生命周期的数据
     */
    @Bean(name = "shortTermCache")  // 指定Bean名称便于按名称注入
    public Cache shortTermCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)  // 1分钟过期（短期存储）
                .maximumSize(100)                       // 最大100个条目
                .build();                               // 构建Cache实例
    }
}
```

## 三、 缓存注解使用示例 ##

- `@Cacheable`：用于标记方法，表示该方法将结果缓存起来，下次调用时直接从缓存中获取结果，而不需要重新执行方法。
- `@CacheEvict`：用于标记方法，表示该方法将清除缓存，通常用于删除缓存。
- `@CachePut`：用于标记方法，表示该方法将更新缓存，通常用于更新缓存。
- `@Caching`：用于组合多个缓存注解，可以同时使用多个缓存注解。
- `@CacheConfig`：用于标记类，表示该类中的所有方法将使用指定的缓存配置。

### `@Cacheable` - 数据查询缓存 ###

```java
/**
 * 根据ID获取用户信息（带缓存）
 * @param id 用户ID
 * @return 用户对象，如果不存在返回null
 * 
 * @Cacheable 参数说明：
 * - value/cacheNames: 指定缓存名称（对应Caffeine配置）
 * - key: 缓存键，使用SpEL表达式（#参数名引用方法参数）
 * - unless: 条件表达式，当结果满足条件时不缓存
 */
@Cacheable(value = "users", key = "#id", unless = "#result == null")
public User getUserById(Long id) {
    log.info("执行数据库查询，用户ID: {}", id);
    return userRepository.findById(id).orElse(null);
}
```

### `@CachePut` - 更新数据并缓存 ###

```java
/**
 * 更新用户信息（同时更新缓存）
 * @param user 用户对象
 * @return 更新后的用户对象
 * 
 * @CachePut 特点：
 * - 总是执行方法体
 * - 用返回值更新缓存
 * - 适用于"先写后读"场景
 */
@CachePut(value = "users", key = "#user.id")
public User updateUser(User user) {
    log.info("更新用户数据: {}", user.getId());
    return userRepository.save(user);
}
```

### `@CacheEvict` - 删除缓存 ###

```java
/**
 * 删除用户（同时移除缓存）
 * @param id 用户ID
 * 
 * @CacheEvict 参数说明：
 * - beforeInvocation: 是否在方法执行前清除缓存（默认false）
 * - allEntries: 是否清空整个缓存区域（慎用）
 */
@CacheEvict(value = "users", key = "#id")
public void deleteUser(Long id) {
    log.info("删除用户: {}", id);
    userRepository.deleteById(id);
}
```

### `@Caching` - 组合操作 ###

组合操作允许在单个方法上同时使用多个缓存注解，以实现更复杂的缓存策略。

```java
/**
* 更新用户状态（复杂缓存操作）
* @param userId 用户ID
* @param status 新状态
*
* 典型场景：
* - 更新用户缓存
* - 同时失效用户列表缓存
    */
    @Caching(
    put = @CachePut(value = "users", key = "#userId"),
    evict = @CacheEvict(value = "userList", allEntries = true)
    )
    public void updateUserStatus(Long userId, UserStatus status) {
    log.info("更新用户{}状态为{}", userId, status);
    userRepository.updateStatus(userId, status);
    }
```

### 条件缓存 (condition/unless) ###

条件缓存允许在缓存注解中添加 SpEL 条件表达式，以控制缓存的触发时机。

```java
/**
 * 获取用户详情（带条件缓存）
 * @param id 用户ID
 * 
 * 缓存条件说明：
 * - condition: 只有id>1000时才走缓存
 * - unless: 结果中status=DELETED时不缓存
 */
@Cacheable(value = "users", 
           key = "#id",
           condition = "#id > 1000",
           unless = "#result != null && #result.status == T(com.example.UserStatus).DELETED")
public User getUserDetail(Long id) {
    log.info("查询用户详情: {}", id);
    return userRepository.findDetailById(id);
}
```

### 异步缓存加载 ###

```java
/**
 * 获取用户订单列表（异步缓存）
 * @param userId 用户ID
 * 
 * @sync = true 表示：
 * - 多线程并发时，只有一个线程会执行加载
 * - 其他线程等待结果
 */
@Cacheable(value = "orders", key = "#userId", sync = true)
public List<Order> getUserOrders(Long userId) {
    log.info("加载用户{}订单数据...", userId);
    return orderService.getOrdersByUser(userId);
}
```

## 四、特殊场景处理 ##

### 缓存空值防御 ###

```java
/**
 * 查询用户（防穿透处理）
 * @param name 用户名
 * 
 * 特殊处理：
 * - 对null结果也进行缓存（特殊标记对象）
 * - 设置较短过期时间（配置文件中定义）
 */
@Cacheable(value = "usersByName", 
           key = "#name",
           unless = "#result == null || #result == T(com.example.CacheConstants).NULL_OBJECT")
public User getUserByName(String name) {
    User user = userRepository.findByName(name);
    return user != null ? user : CacheConstants.NULL_OBJECT;
}
```

### 复合缓存键 ###

```java
/**
 * 获取用户在某系统的权限列表
 * @param userId 用户ID 
 * @param systemCode 系统编码（如："OA", "CRM"等）
 * @return 权限字符串集合
 * 
 * 缓存Key设计说明：
 * 1. 使用复合Key结构：`用户ID_系统编码`（如：123_OA）
 * 2. 优点：
 *    - 避免不同系统权限缓存冲突
 *    - 支持按用户+系统维度独立管理缓存
 * 3. 缓存条件：仅当结果非空时缓存
 */
@Cacheable(value = "userPermissions", 
           key = "#userId + '_' + #systemCode",
           unless = "#result == null || #result.isEmpty()")
public Set<String> getUserSystemPermissions(Long userId, String systemCode) {
    log.debug("查询用户[{}]在系统[{}]的权限", userId, systemCode);
    return permissionService.findPermissions(userId, systemCode);
}

/**
 * 获取用户角色列表（带枚举参数的Key示例）
 * @param userId 用户ID
 * @param roleType 角色类型枚举
 * 
 * 枚举类型处理技巧：
 * 1. 调用枚举的name()方法转换为字符串
 * 2. 最终Key格式：`userId:roleType`（如：123:ADMIN）
 */
@Cacheable(value = "userRoles", 
           key = "#userId + ':' + #roleType.name()")
public List<Role> getUserRoles(Long userId, RoleType roleType) {
    return roleService.findByUserAndType(userId, roleType);
}
```

## 五、经验之谈 ##

- 推荐为每个 `@Cacheable` 方法添加 `unless` 条件防御 `null` 值
- 业务更新方法建议同时使用 `@CachePut` 和 `@CacheEvict`
- 高频访问数据考虑设置 `sync=true`
