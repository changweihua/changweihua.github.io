---
lastUpdated: true
commentabled: true
recommended: true
title: Caffeine结合Redis空值缓存实现多级缓存
description: Caffeine结合Redis空值缓存实现多级缓存
date: 2026-03-11 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在高并发系统中，缓存是提升响应速度、减轻数据库压力的核心手段，但单一缓存方案往往难以应对复杂场景 —— 本地缓存缺乏分布式一致性，Redis 缓存存在网络开销，还可能遭遇穿透、雪崩、击穿等致命问题。

本文基于实战案例，详解 SpringBoot 整合Caffeine 本地缓存 + Redis 分布式缓存 + 空值缓存的三级缓存方案，从架构设计到代码落地，构建高可用、低延迟的缓存体系。

## 一、多级缓存架构设计：为什么要 “三级联动”？ ##

传统缓存方案要么依赖单一本地缓存（无法分布式共享），要么仅用 Redis（网络 IO 开销影响性能），而三级缓存架构通过 “本地缓存 + 分布式缓存 + 数据库” 的层级设计，实现了 “速度” 与 “一致性” 的平衡：

- 第一级：Caffeine 本地缓存基于 Java 内存的高性能缓存，读写延迟低至纳秒级，专门存储热点数据（如高频访问的商品信息、配置参数），避免重复查询 Redis 和数据库，提升核心接口响应速度。
- 第二级：Redis 分布式缓存分布式环境下的共享缓存，解决本地缓存数据不一致问题，同时承担 “中间缓冲” 角色，减少数据库直接访问压力。
- 第三级：数据库数据最终存储源，仅在缓存未命中时触发查询，保证数据可靠性。

### 核心优势 ###

- 性能极致：本地缓存命中率超 90%，Redis 缓存命中率超 95%，99% 请求响应时间 < 10ms；
- 高可用：故障隔离设计，某一级缓存失效不影响整体服务（如 Redis 宕机时，本地缓存可临时兜底）；
- 资源优化：减少 Redis 网络 IO 和数据库查询压力，降低集群部署成本；
- 多层防护：从架构层面规避缓存穿透、雪崩、击穿三大经典问题。

## 二、核心问题解决方案：三大缓存难题逐个击破 ##

### 缓存穿透：拦截无效查询 ###

问题：恶意请求查询不存在的数据（如 ID=-1 的商品），导致缓存失效后直接穿透到数据库，引发性能问题。解决方案：空值缓存 + 布隆过滤器双重防护

- 空值缓存：数据库查询无结果时，在 Redis 和 Caffeine 中缓存空值（设置短期过期时间，如 5 分钟），避免重复穿透；
- 布隆过滤器：预先将数据库中存在的主键（如商品 ID、用户 ID）存入布隆过滤器，请求先经过过滤器校验，无效 ID 直接拦截，不进入缓存和数据库。

### 缓存雪崩：避免集中失效 ###

问题：大量缓存数据在同一时间过期，或 Redis 集群宕机，导致所有请求瞬间涌向数据库，引发数据库雪崩。解决方案：随机过期时间 + 优雅降级

- 随机 TTL：缓存数据时，在基础过期时间（如 30 分钟）上增加随机值（5-10 分钟），使缓存过期时间分散，避免集中失效；
- 优雅降级：Redis 宕机时，启用本地缓存兜底，同时触发告警机制，保障服务核心功能可用。

### 缓存击穿：保护热点数据 ###

问题：热点数据（如秒杀商品）缓存过期瞬间，大量并发请求穿透到数据库，导致数据库压力骤增。解决方案：热点数据预热 + 分布式锁

- 数据预热：系统启动时，主动将热点数据加载到 Caffeine 和 Redis 中，避免缓存冷启动；
- 分布式锁：缓存过期后，通过 Redis 分布式锁（如 Redisson）控制，仅允许一个线程查询数据库并更新缓存，其他线程等待缓存更新后再查询，防止并发穿透。

## 三、实战落地：SpringBoot 整合三级缓存 ##

### 依赖配置 ###

首先引入核心依赖（Maven 示例），包含 SpringBoot 缓存 starter、Caffeine、Redis、Redisson（分布式锁）：

```xml
<!-- SpringBoot缓存核心依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<!-- Caffeine本地缓存 -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.1.8</version>
</dependency>
<!-- Redis依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<!-- Redisson分布式锁 -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.23.3</version>
</dependency>
```

### 核心配置文件（application.yml） ###

配置 Caffeine 缓存参数、Redis 连接信息、分布式锁等：

```yaml
spring:
  # Redis配置
  redis:
    host: 127.0.0.1
    port: 6379
    password: 123456
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 2
        max-wait: 1000ms
    timeout: 3000ms
  # 缓存配置
  cache:
    type: caffeine
    caffeine:
      # 初始容量、最大容量、过期时间（写入后30分钟过期）
      initial-capacity: 100
      maximum-size: 1000
      expire-after-write: 30m

# 自定义缓存配置
cache:
  # 空值缓存过期时间（5分钟）
  null-value-expire: 5m
  # 热点数据预热key前缀
  hot-data-prefix: "hot:"
  # 分布式锁前缀
  lock-prefix: "cache:lock:"
```

### 核心代码实现 ###

#### 缓存配置类：初始化 Caffeine 和 Redis 缓存 ####

```java
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CacheConfig {

    // Caffeine缓存管理器（本地缓存）
    @Bean
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        // 配置Caffeine缓存参数：初始容量100，最大容量1000，写入后30分钟过期
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(30)));
        return cacheManager;
    }

    // Redis缓存管理器（分布式缓存）
    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        // 序列化配置（避免Redis存储乱码）
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)) // 默认过期时间30分钟
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // 自定义不同缓存的过期时间（如空值缓存5分钟）
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("nullValueCache", config.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
```

#### 缓存工具类：封装三级缓存查询逻辑 ####

核心逻辑：先查 Caffeine→再查 Redis→最后查数据库，同时处理空值缓存、分布式锁、缓存更新：

```java
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

@Component
public class CacheUtil {

    @Resource
    private CacheManager caffeineCacheManager;
    @Resource
    private RedisCacheManager redisCacheManager;
    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    @Resource
    private RedissonClient redissonClient;
    @Resource
    private BloomFilterUtil bloomFilterUtil; // 布隆过滤器工具类

    // 缓存查询核心方法：key-缓存键，clazz-返回类型，dbLoader-数据库查询逻辑
    public <T> T getCache(String key, Class<T> clazz, DataLoader<T> dbLoader) {
        // 1. 布隆过滤器校验：无效key直接返回null
        if (!bloomFilterUtil.contains(key)) {
            return null;
        }

        // 2. 查询Caffeine本地缓存
        Cache caffeineCache = caffeineCacheManager.getCache("localCache");
        T localValue = caffeineCache.get(key, clazz);
        if (localValue != null) {
            return localValue;
        }

        // 3. 查询Redis分布式缓存
        Cache redisCache = redisCacheManager.getCache("redisCache");
        T redisValue = redisCache.get(key, clazz);
        if (redisValue != null) {
            // Redis命中，同步到本地缓存
            caffeineCache.put(key, redisValue);
            return redisValue;
        }

        // 4. 缓存未命中，分布式锁控制数据库查询
        RLock lock = redissonClient.getLock("cache:lock:" + key);
        try {
            // 尝试获取锁，最多等待3秒，持有锁10秒
            if (lock.tryLock(3, 10, TimeUnit.SECONDS)) {
                // 再次查询Redis（防止其他线程已更新缓存）
                redisValue = redisCache.get(key, clazz);
                if (redisValue != null) {
                    caffeineCache.put(key, redisValue);
                    return redisValue;
                }

                // 5. 查询数据库
                T dbValue = dbLoader.load();
                if (dbValue != null) {
                    // 数据库有结果，更新各级缓存
                    redisCache.put(key, dbValue);
                    caffeineCache.put(key, dbValue);
                } else {
                    // 数据库无结果，缓存空值（5分钟过期）
                    Cache nullValueCache = redisCacheManager.getCache("nullValueCache");
                    nullValueCache.put(key, null);
                    caffeineCache.put(key, null);
                }
                return dbValue;
            } else {
                // 获取锁失败，返回默认值或抛出异常
                throw new RuntimeException("缓存更新繁忙，请稍后重试");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    // 数据加载函数式接口（封装数据库查询逻辑）
    @FunctionalInterface
    public interface DataLoader<T> {
        T load();
    }
}
```

#### 缓存更新与清除：保障数据一致性 ####

当数据库数据发生变更（新增、修改、删除）时，需同步清除各级缓存，避免数据不一致：

```java
// 缓存清除方法（用于数据库更新后）
public void clearCache(String key) {
    // 1. 清除本地缓存
    Cache caffeineCache = caffeineCacheManager.getCache("localCache");
    caffeineCache.evict(key);
    // 2. 清除Redis缓存
    Cache redisCache = redisCacheManager.getCache("redisCache");
    redisCache.evict(key);
    // 3. 清除空值缓存
    Cache nullValueCache = redisCacheManager.getCache("nullValueCache");
    nullValueCache.evict(key);
}
```

#### 热点数据预热：系统启动时加载 ####

通过CommandLineRunner实现系统启动时预热热点数据，避免缓存冷启动：

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.util.List;

@Component
public class HotDataPreloader implements CommandLineRunner {

    @Resource
    private CacheUtil cacheUtil;
    @Resource
    private ProductMapper productMapper; // 数据库DAO层

    @Override
    public void run(String... args) throws Exception {
        // 加载热点商品数据（如销量前100的商品）
        List<Product> hotProducts = productMapper.selectHotProducts(100);
        for (Product product : hotProducts) {
            String key = "product:" + product.getId();
            // 存入本地缓存和Redis
            cacheUtil.caffeineCacheManager.getCache("localCache").put(key, product);
            cacheUtil.redisCacheManager.getCache("redisCache").put(key, product);
        }
        System.out.println("热点数据预热完成，共加载" + hotProducts.size() + "条数据");
    }
}
```

## 四、优化与监控：让缓存体系更稳定 ##

### 配置优化建议 ###

- Caffeine 参数：初始容量设为预期热点数据量的 80%，最大容量避免超过 JVM 内存的 30%（防止 OOM）；
- Redis 优化：开启持久化（AOF+RDB），配置主从复制，避免单点故障；调整连接池参数适配并发量；
- 过期时间：根据数据更新频率调整，高频更新数据（如库存）过期时间设为 5-10 分钟，低频数据设为 1-2 小时。

### 监控与告警 ###

- 缓存命中率：通过 Spring Boot Actuator 暴露缓存指标，监控 Caffeine 和 Redis 命中率（目标：均≥90%）；
- 响应时间：统计接口缓存命中 / 未命中的响应时间，超过阈值（如 50ms）触发告警；
- 异常监控：监控 Redis 连接异常、分布式锁获取失败等情况，及时排查问题。

### 注意事项 ###

- 数据一致性：缓存清除需与数据库事务同步（建议用事务提交后异步清除，避免阻塞业务）；
- 内存管理：Caffeine 缓存避免存储大对象，定期清理过期数据；Redis 启用内存淘汰策略（如 LRU）；
- 敏感数据：缓存中不存储明文敏感数据（如密码、手机号），需加密后存储；
- 降级策略：Redis 集群故障时，关闭 Redis 缓存读取，仅用本地缓存 + 数据库兜底，保障核心功能可用。

## 五、总结 ##

SpringBoot+Caffeine+Redis + 空值缓存的三级缓存方案，通过 “本地缓存提效、分布式缓存保一致、空值缓存防穿透” 的设计，完美解决了高并发场景下的缓存核心难题。该方案不仅能将接口响应时间压缩至毫秒级，还能大幅降低数据库压力，同时具备故障隔离、优雅降级的高可用特性，适用于电商、支付、社交等各类高并发系统。

实际落地时，可根据业务场景灵活调整缓存参数（如过期时间、最大容量）和预热策略，结合监控工具持续优化，让缓存体系真正成为系统的 “性能加速器”。
