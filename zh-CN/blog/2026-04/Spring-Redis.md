---
lastUpdated: true
commentabled: true
recommended: true
title: Spring 自定义 Redis 超时
description: TTL、TTI 与 Pipeline 实战
date: 2026-04-13 10:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在 Spring Cache 接入 Redis 之后，最常见的问题通常不是“能不能用”，而是“默认配置够不够用”：

- 所有缓存都用同一个过期时间，明显不合理
- 热点缓存希望访问后续期，普通缓存只需要固定 TTL
- 清理缓存时如果直接走 `KEYS`，大 key 空间下可能拖慢 Redis
- 批量预热缓存时，一条条写入 RTT 太高，希望结合 pipeline 优化

如果把这些问题拆开看，核心其实只有两件事：

- Spring 是怎么把 `@Cacheable` 映射到 `Redis` 的
- 你该在哪一层自定义过期策略和批量写入策略

## 先说结论 ##

- `RedisCacheConfiguration` 决定缓存序列化、key 前缀、默认 TTL、是否开启 TTI。
- `RedisCacheManagerBuilderCustomizer` 适合做“不同 `cacheName` 对应不同过期时间”的精细化配置。
- `TTL` 是写入后固定过期，`TTI` 是访问后刷新空闲时间，两者不是一回事。
- 开启 `TTI` 后，读操作会改成类似 `GETEX` 的语义，因此要求 Redis 支持对应命令（redis 6）。
- `pipeline` 不会改变缓存过期策略本身，但很适合批量预热、批量回填这类高吞吐写入场景。

## Spring Cache 到 Redis 的调用链 ##

先看一遍抽象层级，后面的配置才不容易乱：

```txt
@Cacheable
  -> CacheInterceptor
  -> CacheResolver
  -> CacheManager
  -> RedisCache
  -> RedisCacheWriter
  -> RedisConnectionFactory： 从Lettuce中获取底层连接对象
  -> RedisConnection
```

从职责上理解：

- `CacheInterceptor` 负责拦截 `@Cacheable`、`@CachePut`、`@CacheEvict`
- `CacheResolver` / `CacheManager` 负责找到具体的缓存对象
- `RedisCache` 代表某个 `cacheName` 对应的一块缓存空间： 通过 `RedisCacheConfiguration` 构建，包含了ttl、序列化相关配置
- `RedisCacheWriter` 负责把 `get` / `put` / `evict` 翻译成底层 Redis 命令

因此，“Spring 自定义 Redis 超时”真正该改的，通常不是业务代码，而是 `RedisCacheConfiguration` 和 `RedisCacheManager`。

## 全局默认 TTL：先把基础配置定下来 ##

如果你什么都不配，所有缓存基本都会走默认行为。这通常不适合线上系统，因为：

- 序列化格式可能不符合你的兼容性要求
- `key` 前缀不统一，排查问题不方便
- 所有缓存 TTL 一刀切，不利于分层治理

一个更稳妥的基础配置如下：

```java
@EnableCaching
@Configuration(proxyBeanMethods = false)
public class RedisCacheConfig {

    @Value("${spring.application.name:app}")
    private String applicationName;

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .prefixCacheNameWith(applicationName + "::")
                .entryTtl(Duration.ofMinutes(10));
    }
}
```

这段配置做了三件事：

- value 统一使用 JSON 序列化，避免默认 JDK 序列化带来的可读性和兼容性问题
- 所有缓存 key 自动加上应用名前缀，便于隔离和排查
- 给所有 cache 一个默认 TTL，例如 10 分钟

如果你的系统只是中小规模项目，统一 TTL 已经够用；但只要业务稍微复杂一点，很快就会需要“按 cacheName 配不同过期时间”。

## 按缓存名称配置不同 TTL ##

这是 Spring Cache 接 Redis 最常见、也最实用的自定义能力。

例如：

- 用户基础信息缓存 30 分钟
- 热门榜单缓存 1 分钟
- 字典类缓存 12 小时

这类需求适合用 `RedisCacheManagerBuilderCustomizer` 做增量配置：

```java
@EnableCaching
@Configuration(proxyBeanMethods = false)
public class RedisCacheConfig {

    @Value("${spring.application.name:app}")
    private String applicationName;

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .prefixCacheNameWith(applicationName + "::")
                .entryTtl(Duration.ofMinutes(10));
    }

    // 这里只是演示：实际应该定义到CacheService相关的地方，也可以通过配置文件的方式进行配置
    @Bean
    public Map<String, Duration> cacheTtls() {
        Map<String, Duration> ttlMap = new HashMap<>();
        ttlMap.put("user", Duration.ofMinutes(30));
        ttlMap.put("hot", Duration.ofMinutes(1));
        ttlMap.put("dict", Duration.ofHours(12));
        return ttlMap;
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            RedisConnectionFactory redisConnectionFactory,
            RedisCacheConfiguration redisCacheConfiguration,
            ObjectProvider<Map<String, Duration>> cacheTtls) {

        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();

        cacheTtls.stream()
                .flatMap(map -> map.entrySet().stream())
                .forEach(entry -> configMap.put(
                        entry.getKey(),
                        redisCacheConfiguration.entryTtl(entry.getValue())
                ));
        // 在为每个cacheName配置创建RedisCache对象时,会从configMap中获取RedisCacheConfiguration对象进行构建
        return builder -> builder
                .withInitialCacheConfigurations(configMap)
                .cacheWriter(RedisCacheWriter.nonLockingRedisCacheWriter(
                        redisConnectionFactory,
                        BatchStrategies.scan(500)
                ));
    }
}
```

这段配置的重点有两个：

- `withInitialCacheConfigurations(configMap)`
作用是为不同的 `cacheName` 指定不同的 `RedisCacheConfiguration`。
- `redisCacheConfiguration.entryTtl(...)`
不是原地修改，而是基于基础配置派生出一份新的配置对象。

> 这意味着你可以先定义一份“全局通用配置”，再在它的基础上按 cache 维度覆盖 TTL，而不用重复写序列化、前缀等公共设置。

## 为什么这里顺手把清理策略也配掉 ##

上面的 `cacheWriter(...)` 不只是“顺手一写”，它其实很实用。

很多项目默认不会关注 cache clear 的实现细节，但当 `key` 空间变大时，`KEYS` 的阻塞风险会很快暴露出来。相比之下：

```java
BatchStrategies.scan(500)
```

更适合线上环境，因为它会通过 `SCAN` 以游标形式分批遍历 key，避免一次性扫全量 key 带来的阻塞压力。

如果你的缓存空间不大，这个差异不明显；但一旦进入高并发或大 key 空间场景，SCAN 策略通常更稳。

## TTL 和 TTI 不是一回事 ##

很多文章会把“超时”混着讲，实际上至少要区分两个概念：

- `TTL`：写入之后固定多久过期
- `TTI`：空闲多久过期，读操作会刷新过期时间

如果你希望“只要一直有人访问，这个热点缓存就继续存活”，那应该考虑 TTI，而不是单纯把 TTL 调大。

Spring Data Redis 提供了对应能力：

```java
@Bean
public RedisCacheConfiguration redisCacheConfiguration() {
    return RedisCacheConfiguration.defaultCacheConfig()
            .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                            new GenericJackson2JsonRedisSerializer()
                    )
            )
            .prefixCacheNameWith("app::")
            .entryTtl(Duration.ofMinutes(10))
            .enableTimeToIdle();
}
```

这里的含义是：

- 写入时仍然有初始 TTL
- 读取命中缓存时，会刷新空闲过期时间

这很适合：

- 热点详情页缓存
- 频繁访问的用户会话缓存
- 某些只要持续命中就应该续期的热点数据

但要注意两点：

- TTI 会改变redis读取命令为 `GETEX`，该命令会携带一个 `EX` 参数，表示空闲 TTL
- 它依赖 Redis 对应命令能力，通常要确认服务端版本满足要求

如果你的 Redis 版本不支持这类读时续期命令，就不要直接开启。

## 业务代码应该长什么样 ##

当底层配置好之后，业务代码应该尽量保持简单，而不是把 TTL 逻辑散落到各个 Service 里。

```java
@Service
public class DemoCacheService {

    // 可以在这里定义各个缓存的TTL
    @Bean
    public Map<String, Duration> cacheTtls() {
        Map<String, Duration> ttlMap = new HashMap<>();
        ttlMap.put("user", Duration.ofMinutes(30));
        retunr ttlMap;
    }
   
    @Cacheable(cacheNames = "user", key = "#id")
    public String queryUser(Long id) {
        System.out.println("load user from db...");
        return "user-" + id;
    }

    @Cacheable(cacheNames = "hot", key = "#keyword")
    public String queryHotData(String keyword) {
        System.out.println("load hot data...");
        return "hot-" + keyword;
    }
}
```

这里不需要在 `@Cacheable` 上额外写 TTL，因为 TTL 已经由 `cacheName -> RedisCacheConfiguration` 这层统一管理。

这样做的好处是：

- 业务代码更干净
- 过期策略集中治理
- 后续调整 TTL 不需要全局搜注解

## Pipeline 应该怎么融入这套方案 ##

pipeline 和“自定义超时”不是一层概念，但它们在真实项目里经常一起出现。

原因很简单：

- 平时的缓存读写，交给 `@Cacheable` 就够了
- 一旦遇到批量预热、批量回填、冷启动灌缓存，逐条写入的 RTT 就会变得很明显

这时就可以把 `pipeline` 当成“批量写缓存的性能优化手段”。

要先明确一点：

- `pipeline` 不会自动帮你决定 TTL
- `pipeline` 的作用是减少 `flush` 次数、减少 RTT、提高吞吐
- 每条缓存写入仍然需要你显式设置过期时间

### 一个批量回填缓存的示例 ###

下面这个例子适合“批量写入字符串缓存，并显式设置 TTL”的场景：

```java
@Service
public class CacheWarmService {

    private final StringRedisTemplate stringRedisTemplate;

    public CacheWarmService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public void warmHotCache(Map<String, String> values) {
        StringRedisSerializer serializer = StringRedisSerializer.UTF_8;

        stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            values.forEach((key, value) -> connection.stringCommands().setEx(
                    serializer.serialize("hot::" + key),
                    60,
                    serializer.serialize(value)
            ));
            return null;
        });
    }
}
```

这个例子里：

- `setEx` 负责写值并设置 TTL
- `executePipelined()` 负责把多条命令打包发送
- 适合缓存预热、榜单刷新、批量导入等场景

换句话说，TTL 负责“活多久”，pipeline 负责“写得快不快”，两者是互补关系。

## 如果底层是 Lettuce，需要优化 flush 策略 ##

如果 Spring Data Redis 的底层客户端是 Lettuce，需要调整默认 `pipeline` 的 `flush` 策略。

因为Spring-lettuce默认的 `pipeline` 策略是每条命令都进行flush， 这里有体现：LettuceConnectionFactory

### pipeliningFlushPolicy ###

```java
@Component
public class LettuceFactoryPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof LettuceConnectionFactory factory) {
            factory.setPipeliningFlushPolicy(
                    LettuceConnection.PipeliningFlushPolicy.buffered(100)
            );
        }
        return bean;
    }
}
```

这个配置的含义是：

- `pipeline` 模式下，不是每条命令都立刻 `flush`
- 每累计一定数量的命令再 `flush` 一次
- 关闭 `pipeline` 时，再把剩余命令统一刷出去

它适合：

- 批量缓存预热
- 一次性导入大量缓存数据
- 对单条请求延迟不敏感、但对整体吞吐敏感的任务

但它不适合直接套到所有场景，因为批次越大：

- 单次堆积的命令越多
- 客户端和服务端的缓冲压力越大
- 出问题时排查也更复杂

## 什么时候该用哪种方案 ##

可以把这套能力简单分成三层：

- 普通缓存读写
  - 使用 `@Cacheable` + `RedisCacheManager` 配 TTL，已经足够。
- 热点缓存续期
  - 在确认 Redis 版本支持的前提下，开启 TTI。
- 批量缓存预热或回填
  - 使用 `executePipelined()`，必要时再叠加 Lettuce 的 buffered flush 策略。

这样分层之后，配置和性能优化就不会混在一起。

## 总结 ##

Spring 自定义 Redis 超时，真正要抓住的是四个点：

- 用 `RedisCacheConfiguration` 定义全局默认行为
- 用 `RedisCacheManagerBuilderCustomizer` 按 `cacheName` 精细化配置 `TTL`
- 用 `TTI` 解决“热点数据访问后续期”的问题
- 用 `pipeline` 解决“批量写缓存吞吐不足”的问题

如果把这四层区分清楚，Spring Cache、Redis TTL 和 Lettuce pipeline 就能自然地衔接起来，而不是各写各的、后期越改越乱。
