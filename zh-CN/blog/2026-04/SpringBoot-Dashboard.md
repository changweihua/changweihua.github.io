---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 数据大屏缓存设计实战
description: 无空窗期 + 动态 Key
date: 2026-04-20 16:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

> 适用场景：数据大屏 / 统计看板 / 高频查询接口
> 
>关键词：`@Cacheable`、`@CachePut`、动态 Cache Key、定时刷新、Redis、无缓存空窗期

## 一、背景问题 ##

在做数据大屏接口时，通常会遇到这些现实问题：

- 接口全是查询，SQL 复杂、聚合多
- 前端轮询或多人同时访问
- 接口参数（如 areaCode）不同，需要多份缓存
- 定时任务需要刷新缓存
- ❌ 不希望出现：先删缓存 → 再查数据库 → 再写缓存 的“空窗期”

目标是：

- ✅ 前端永远读到数据
- ✅ 定时任务刷新时，新缓存直接覆盖旧缓存
- ✅ Controller 不关心缓存细节

## 二、错误但常见的几种方案 ##

### ❌ 方案 1：Controller 控制是否走缓存 ###

```java
if (refresh) {
    queryDbAndSetCache();
} else {
    readCacheOrQueryDb();
}
```

问题：

- Controller 承担了业务逻辑
- refresh 参数污染接口语义
- 不利于维护

### ❌ 方案 2：定时任务先清缓存，再建缓存 ###

```java
redisTemplate.delete(key);
redisTemplate.set(key, queryDb());
```

问题：

- 缓存空窗期
- 前端在这几秒内会拿到 `null`
- 大屏类系统不可接受

## 三、推荐的最终方案（生产可用） ##

### ✅ 核心思想 ##

| 场景 | 使用方式 |
| :--- | :--- |
| 前端查询 | `@Cacheable` |
| 定时刷新 | `@CachePut` |
| 不清缓存 | 只覆盖 |

> 👉 永远不 delete，只 put

## 四、统一 Cache Key 工厂（关键） ##

### 1️⃣ 为什么要统一 ###

- 避免 key 拼写不一致
- 避免方法名写进 key
- 支持参数标准化（如 null → ALL）

### 2️⃣ Cache Key 工厂代码 ###

```java
package com.gft.zhax.api.data.screen.scheduler.cache;

public class ScreenCacheKey {

    private ScreenCacheKey() {}

    /**
     * 农批市场数据总览
     * 示例：
     *   overview:ALL
     *   overview:210100
     */
    public static String marketOverview(String areaCode) {
        return "overview:" + normalize(areaCode);
    }

    /** 校园保供 */
    public static String schoolBase(String areaCode) {
        return "schoolBase:" + normalize(areaCode);
    }

    private static String normalize(String areaCode) {
        return (areaCode == null || areaCode.trim().isEmpty())
                ? "ALL"
                : areaCode;
    }
}
```

## 五、Service 层：Cacheable + CachePut ##

### 1️⃣ 对外方法（前端调用） ###

```java
@Override
@Cacheable(
    cacheNames = ScreenCacheNames.MARKET,
    key = "T(com.gft.zhax.api.data.screen.scheduler.cache.ScreenCacheKey).marketOverview(#areaCode)"
)
public MarketDataVO getMarketData(String areaCode) {
    return buildMarketData(areaCode);
}
```

含义：

- 有缓存 → 直接返回
- 没缓存 → 执行方法 + 自动写缓存

### 2️⃣ 定时刷新方法（覆盖缓存） ###

```java
@CachePut(
    cacheNames = ScreenCacheNames.MARKET,
    key = "T(com.gft.zhax.api.data.screen.scheduler.cache.ScreenCacheKey).marketOverview(#areaCode)"
)
public MarketDataVO refreshMarketData(String areaCode) {
    return buildMarketData(areaCode);
}
```

- ✔ 不 delete
- ✔ 新数据直接覆盖旧缓存
- ✔ 前端无感知

### 3️⃣ 真正的业务方法（无缓存） ###

```java
private MarketDataVO buildMarketData(String areaCode) {
    MarketQuarterOrderVO quarter = mapper.selectQuarter(areaCode);
    MarketSellerVO seller = mapper.selectSeller(areaCode);
    List<MarketMonthOrderVO> month = mapper.selectMonth(areaCode);

    MarketDataVO vo = new MarketDataVO();
    vo.setQuarter(quarter);
    vo.setSeller(seller);
    vo.setMonthList(month);
    return vo;
}
```

## 六、定时任务：批量刷新不同 areaCode ##

```java
@Scheduled(cron = "0 */5 * * * ?")
public void refreshMarketCache() {
    List<String> areaCodes = Arrays.asList(null, "210100");

    for (String areaCode : areaCodes) {
        marketService.refreshMarketData(areaCode);
    }
}
```

说明：

- Java 8 使用 Arrays.asList
- null 代表 ALL

## 七、Redis 序列化坑（必看） ##

### ❌ 常见报错 ###

```txt
DefaultSerializer requires a Serializable payload
```

原因：

- Redis 默认使用 JDK 序列化
- VO 没实现 Serializable

### ✅ 推荐解决方案（JSON 序列化） ###

```java
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory factory) {

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
    }
}
```

- ✔ VO 不用实现 Serializable
- ✔ Redis 可读性好

## 八、方案总结 ##

| 项目 | 方案 |
| :--- | :--- |
| Controller | 只调 Service |
| 查询缓存 | @Cacheable |
| 刷新缓存 | @CachePut |
| Key 管理 | 统一 Key 工厂 |
| 定时任务 | 覆盖式刷新 |
| 空窗期 | ❌ 无 |

## 九、适用与不适用 ##

✅ 非常适合：

- 数据大屏
- BI 统计接口
- 只读接口

❌ 不适合：

- 强一致写操作
- 高并发写入场景

## 十、结语 ##

这套方案的核心不是“炫技”，而是：

> 稳定、可维护、对前端无影响

如果你也在做数据大屏、统计系统，这一套可以直接上生产。
