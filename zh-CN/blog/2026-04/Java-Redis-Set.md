---
lastUpdated: true
commentabled: true
recommended: true
title: 基于 Redis Set 轻松搞定高并发抽奖系统
description: 如何使用Redis Set实现简单的抽奖系统？
date: 2026-04-21 11:15:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

想要从零手搓一个高性能的抽奖系统？Redis 的 `Set` （集合）数据结构绝对是你的不二之选。

它的特性和 Java 中的 `HashSet` 极其相似，天生自带*去重*光环。这就意味着，无论一个用户手速多快、疯狂点击了多少次参与，抽奖池里也永远只有他的一个名字，完美避免了重复报名的问题。更棒的是，它底层随机弹出元素的时间复杂度仅为 $O(1)$，即使面对海量用户的并发抽奖，也能轻松扛住压力。

利用 `Set` 实现抽奖系统的核心逻辑非常轻量，熟练掌握以下三个命令即可：

- `SADD key member1 member2 ...` ：向奖池中添加一个或多个参与者。
- `SPOP key count`：随机从奖池中抽出并*移除*指定数量的元素。非常适合“一等奖”、“二等奖”这种*不允许重复中奖*的核心业务场景。
- `SRANDMEMBER key count`：随机从奖池中获取指定数量的元素，但*不移除*它们。适合“阳光普照奖”、“参与奖”这种*允许重复中奖*的场景。

## 💻 核心代码实现 ##

下面我们结合 Java (Spring Boot) 与 Redis，来落地这个抽奖系统。

### Controller 层：定义抽奖接口 ###

在这里我们定义了加入奖池、抽取大奖（不放回）以及抽取阳光奖（可放回）的 API。

```Java
package com.example.redissetrandomget.lottery;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lottery")
public class LotteryController {

    private final LotteryService lotteryService;

    public LotteryController(LotteryService lotteryService) {
        this.lotteryService = lotteryService;
    }

    // 加入抽奖者（支持批量）
    @RequestMapping(path = "/add", method = {RequestMethod.GET, RequestMethod.POST})
    public String add(@RequestParam String activityId, @RequestParam String[] userIds) {
        lotteryService.addParticipants(activityId, userIds);
        long remainCount = lotteryService.getRemainCount(activityId);
        return "成功加入奖池！当前奖池总人数：" + remainCount;
    }

    // 抽核心大奖（抽完即踢出奖池，绝对不重复中奖）
    @GetMapping("/drawGrand")
    public List<String> drawGrand(@RequestParam String activityId, @RequestParam long count) {
        return lotteryService.drawGrandPrize(activityId, count);
    }
    
    // 抽幸运参与奖（抽完保留在奖池，下次还有机会）
    @GetMapping("/drawSunshine")
    public List<String> drawSunshine(@RequestParam String activityId, @RequestParam long count) {
        return lotteryService.drawSunshinePrize(activityId, count);
    }
    
    // 查询奖池剩余人数
    @GetMapping("/remain")
    public long remain(@RequestParam String activityId) {
        return lotteryService.getRemainCount(activityId);
    }
}
```

### Service 层：封装 Redis 操作 ###

Service 层主要负责与 Redis 进行交互，并做了一些基础的参数校验和清理工作，保证数据的健壮性。

```Java
package com.example.redissetrandomget.lottery;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Service
public class LotteryService {

    private static final String LOTTERY_KEY_PREFIX = "lottery:activity:";
    private final StringRedisTemplate redisTemplate;

    public LotteryService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addParticipants(String activityId, String... userIds) {
        redisTemplate.opsForSet().add(buildKey(activityId), normalizeUserIds(userIds));
    }

    // 使用 pop：随机抽取并移除（适用于大奖）
    public List<String> drawGrandPrize(String activityId, long count) {
        validateCount(count);
        List<String> winners = redisTemplate.opsForSet().pop(buildKey(activityId), count);
        return winners != null ? winners : List.of();
    }

    // 使用 randomMembers：随机抽取但不移除（适用于阳光普照奖）
    public List<String> drawSunshinePrize(String activityId, long count) {
        validateCount(count);
        List<String> winners = redisTemplate.opsForSet().randomMembers(buildKey(activityId), count);
        return winners != null ? winners : List.of();
    }

    public long getRemainCount(String activityId) {
        Long size = redisTemplate.opsForSet().size(buildKey(activityId));
        return size != null ? size : 0L;
    }

    public void joinLottery(String activityId, String... userIds) {
        addParticipants(activityId, userIds);
    }

    public List<String> drawWithoutRepeat(String activityId, long count) {
        return drawGrandPrize(activityId, count);
    }

    public List<String> drawWithRepeat(String activityId, long count) {
        return drawSunshinePrize(activityId, count);
    }

    public long participantCount(String activityId) {
        return getRemainCount(activityId);
    }

    // --- 私有辅助方法 ---

    private void validateCount(long count) {
        Assert.isTrue(count > 0, "抽奖人数必须大于 0");
    }

    private String buildKey(String activityId) {
        Assert.hasText(activityId, "活动 ID 不能为空");
        return LOTTERY_KEY_PREFIX + activityId.trim();
    }

    private String[] normalizeUserIds(String[] userIds) {
        Assert.notEmpty(userIds, "用户列表不能为空");

        String[] normalizedUserIds = Arrays.stream(userIds)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .distinct()
                .toArray(String[]::new);

        Assert.notEmpty(normalizedUserIds, "过滤后没有合法的用户 ID");
        return normalizedUserIds;
    }
}
```

## 接口测试与验证 ##

代码准备就绪，我们来模拟一次真实的抽奖流程。

首先，我们通过接口向活动 `2026` 的奖池中加入 `5` 名测试用户。你可以在 Redis 客户端中使用 `SCARD lottery:activity:2026` 命令来验证奖池内的人数，确认 `5` 人已成功入场：

### 测试一：抽取大奖（不放回） ###

我们先来测试一下抽取 `2` 名一等奖用户。调用 `drawGrand` 接口：

```bash
GET http://localhost:8080/api/lottery/drawGrand?activityId=2026&count=2
```

接口成功返回了 3 号和 5 号用户。由于使用的是 `SPOP` 命令，这两个幸运儿已经被移出奖池，后续的抽奖中绝不会再出现他们的身影。

```bash
HTTP/1.1 200 
Content-Type: application/json
Date: Fri, 13 Mar 2026 08:54:20 GMT

[
  "3",
  "5"
]
```

### 测试二：抽取幸运参与奖（可放回） ###

接下来，我们测试抽取 2 名阳光普照奖。调用 `drawSunshine` 接口：

```bash
GET http://localhost:8080/api/lottery/drawSunshine?activityId=2026&count=2
```

查看返回结果，我们发现 2 号用户被抽中了两次！这正是 `SRANDMEMBER` 的特性：随机抽取元素但保留在原集合中，因此同一个用户在同一轮或不同轮次中都有可能重复中奖。

```bash
HTTP/1.1 200 
Content-Type: application/json
Date: Fri, 13 Mar 2026 08:56:28 GMT

[
  "2",
  "2"
]
```


```infographic
infographic list-row-simple-horizontal-arrow
data
  title Example Flow
  items
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Completed
```
