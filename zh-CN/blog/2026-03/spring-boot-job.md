---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 定时任务多实例互斥执行
description: Spring Boot 定时任务多实例互斥执行
date: 2026-03-06 11:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

Spring Boot 的 `@Scheduled` 写定时任务很方便，但多实例部署时有个问题：同一个定时任务会在每台机器上都触发执行。

比如部署了两台应用服务器，凌晨 2 点的数据统计任务会同时跑两遍，数据重复、文件重复生成。

解决这个问题通常有几种思路。

## 常见方案 ##

### 方案一：单机执行 ###

只在一台指定的机器上跑任务：

```java
@Scheduled(cron = "0 0 2 * * ?")
public void scheduledTask() {
    String hostname = InetAddress.getLocalHost().getHostName();
    if (!"app-server-01".equals(hostname)) {
        return;
    }
    // do something
}
```

问题很明显：那台机器挂了，任务就不执行了。

### 方案二：Redis 分布式锁 ###

用 Redis 的 SETNX 实现互斥（或者Redission）：

```java
@Scheduled(cron = "0 0 2 * * ?")
public void scheduledTask() {
    Boolean locked = stringRedisTemplate.opsForValue()
        .setIfAbsent("task:data-sync", "1", 10, TimeUnit.MINUTES);
    if (Boolean.FALSE.equals(locked)) {
        return;
    }
    try {
        // do something
    } finally {
        stringRedisTemplate.delete("task:data-sync");
    }
}
```

能用，但每个任务都要写一遍加锁释放逻辑，而且需要项目里有 Redis。

### ShedLock 方案 ###

ShedLock 是一个专门解决定时任务重复执行问题的框架，支持多种存储后端（数据库、Redis、MongoDB 等）。

核心思路：在存储层记录每个任务的锁状态，任务执行前先抢锁，抢到了才执行。

#### 集成步骤 ####

**添加依赖**

```xml
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-spring</artifactId>
    <version>7.6.0</version>
</dependency>
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-provider-jdbc-template</artifactId>
    <version>7.6.0</version>
</dependency>
```

**创建锁表**

```sql
CREATE TABLE shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP(3) NOT NULL,
    locked_at TIMESTAMP(3) NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);
```

**配置 LockProvider**

```java
@Configuration
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class ShedLockConfig {

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
            JdbcTemplateLockProvider.Configuration.builder()
                .withDataSource(dataSource)
                .withTableName("shedlock")
                .build()
        );
    }
}
```

**给定时任务加注解**

```java
@Scheduled(cron = "0 0 2 * * ?")
@SchedulerLock(name = "dataSyncTask", lockAtMostFor = "5m")
public void syncData() {
    // do something
}
```

完成。多台服务器部署时，只有抢到锁的那台会执行任务。

## 注解参数说明 ##

`@SchedulerLock` 有几个关键参数：

- name：锁名称，相同 name 的任务会互斥执行。建议用任务名来命名，保持唯一。
- lockAtMostFor：锁的最大持有时间。
  - 这是为了防止任务执行过程中机器宕机，导致锁永远不释放。比如设置 5m，即使任务执行超时，锁也会在 5 分钟后自动过期。
  - 一般按任务预期执行时间的 2 倍左右设置，留些余量。
- lockAtLeastFor：锁的最小持有时间。
  - 这是为了防止任务执行太快，锁立即释放被其他机器抢到。
  - 比如定时任务每分钟执行一次，任务 5 秒就跑完了。如果没有这个参数，其他机器可能会在同一分钟内再次抢到锁执行。
  - 这种情况下可以设置 `lockAtLeastFor = "1m"`，确保锁保持到下一分钟。

## 实现原理 ##

ShedLock 的实现逻辑不复杂。

任务执行前，会向数据库插入或更新锁记录：

```sql
INSERT INTO shedlock (name, lock_until, locked_at, locked_by)
VALUES ('dataSyncTask', '2025-01-25 02:05:00', NOW(), '192.168.1.10')
ON DUPLICATE KEY UPDATE
  lock_until = '2025-01-25 02:05:00',
  locked_at = NOW(),
  locked_by = '192.168.1.10'
WHERE lock_until < NOW();
```

关键是最后的 `WHERE lock_until < NOW()` 条件：

- 如果当前锁已过期，UPDATE 成功，抢到锁
- 如果当前锁未过期，UPDATE 影响行数为 0，抢锁失败，任务不执行

任务执行完成后不需要主动释放锁，等待 `lock_until` 时间到期即可。

## 适用场景 ##

ShedLock 的定位很明确：专门为定时任务设计的分布式锁框架。

### 适合 ###

- 定时任务需要互斥执行，避免重复
- 希望用注解方式简化锁的代码逻辑
- 需要自动锁过期机制，防止死锁

### 不适合 ###

- 高并发抢锁的业务场景（比如秒杀、库存扣减），ShedLock 不是为此设计
- 需要可重入锁、读写锁等复杂特性
- 需要精确控制锁获取和释放时机的业务逻辑

ShedLock 和通用分布式锁是互补关系，不是替代关系。如果你的业务代码里需要手动加锁解锁，用 Redisson 或手动实现 Redis SETNX 更合适。但如果只是为了解决定时任务重复执行的问题，ShedLock 是更简洁的方案。

## 几个注意事项 ##

### 存储后端选择 ###

本文演示用的是 JDBC 方式（基于数据库表）。ShedLock 还支持 Redis、MongoDB、ZooKeeper、Hazelcast 等多种存储后端，根据项目现有技术栈选择即可。

### 表名自定义（数据库存储时） ###

如果用 JDBC 作为存储后端，默认表名是 shedlock，可以按需修改：

### 机器标识 ###

`locked_by` 字段记录是哪台机器拿到的锁，默认是主机名。可以自定义成更有意义的标识：

```java
.withLockedByValue("app-" + getServerIp())
```

### 主从/多数据源场景（数据库存储时） ###

如果项目有多个数据源，确保 ShedLock 用的是主库，避免主从延迟导致的锁问题。

## 总结 ##

ShedLock 是一个专门为定时任务设计的分布式锁框架：

- 优点：注解式使用、集成简单、自动锁过期、支持多种存储后端
- 局限性：只适用于定时任务场景，不适用于通用业务加锁

和手动写 Redis 分布式锁相比，ShedLock 把定时任务锁的逻辑抽象出来了，代码更简洁。但如果你需要的是通用业务锁，还是用 Redisson 或手写 SETNX 更合适。
