---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot + 位图（Bitmap）+ HyperLogLog
description: 亿级用户签到、UV 统计极致优化
date: 2026-03-23 11:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言 ##

最近在做用户签到系统重构时遇到了一个棘手问题：每天要处理上亿用户的签到数据，传统的MySQL方案已经扛不住了。后来发现Redis的位图和HyperLogLog简直是为这种场景量身定制的神器。

很多同学可能还不知道，Redis除了基本的String、Hash这些数据结构，还有专门针对大数据统计的高级数据结构。今天就来聊聊如何用位图和HyperLogLog，让亿级用户的统计变得轻而易举。

## 为什么传统方案会崩？ ##

### MySQL的局限性 ###

面对亿级用户签到，传统MySQL方案的问题：

- 存储空间爆炸：

  - 每个用户每天一条记录，1亿用户就是1亿条数据
  - 按照每条记录1KB计算，一天就要100GB
  - 一个月下来就是3TB，成本惊人

- 查询性能瓶颈：

  - SELECT COUNT(DISTINCT user_id) WHERE date = '2024-01-01' 这种查询会全表扫描
  - 即使加索引，大数据量下性能依然很差
  - 多维度统计（月活、年活）更加困难

- 并发写入压力：

  - 高峰期大量用户同时签到
  - 数据库连接池被打满
  - 事务锁竞争严重

## Redis高级数据结构登场 ##

### 位图（Bitmap）的核心优势 ###

位图是用二进制位来存储状态的数据结构：

```txt
用户ID:  1   2   3   4   5   6   7   8
签到状态: 1   0   1   1   0   1   0   1
         ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓
内存存储: 1   0   1   1   0   1   0   1  (每个用户只占1位)
```

惊人的压缩效果：

- 1亿用户只需要12.5MB内存 (100,000,000 ÷ 8 ÷ 1024 ÷ 1024)
- 相比MySQL节省了上千倍的存储空间
- 查询速度从秒级降到毫秒级

### HyperLogLog的统计魔法 ###

HyperLogLog专门解决基数统计问题：

```txt
传统Set存储: {"user1", "user2", "user3", ...}  → 存储所有元素
HyperLogLog: 只存储哈希值的统计特征 → 固定12KB
```

核心原理：

- 通过哈希函数将用户ID映射到大空间
- 统计哈希值前导零的数量来估算基数
- 用概率算法实现超低内存占用

##  整体架构设计 ##

我们的亿级用户统计架构：

```txt
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户签到请求   │───▶│   Redis位图存储   │───▶│   实时统计查询   │
│                 │    │   (Bitmap)       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  日活统计    │      │  月活统计    │      │  留存分析    │
│ (HyperLogLog)│      │ (位图运算)   │      │ (位图交集)   │
└─────────────┘      └─────────────┘      └─────────────┘
```

## 核心设计要点 ##

### 位图存储策略 ###

```java
// 用户签到位图设计
public class SignInBitmapManager {
    
    // 按日期分key，避免单key过大
    private static final String DAILY_SIGNIN_KEY = "signin:daily:{date}";
    
    // 按用户ID作为位偏移量
    public void userSignIn(String date, Long userId) {
        String key = DAILY_SIGNIN_KEY.replace("{date}", date);
        // SETBIT key userId 1
        redisTemplate.opsForValue().setBit(key, userId, true);
    }
    
    // 统计当日签到人数
    public Long getDailySignInCount(String date) {
        String key = DAILY_SIGNIN_KEY.replace("{date}", date);
        // BITCOUNT key
        return redisTemplate.execute((RedisCallback<Long>) connection -> 
            connection.stringCommands().bitCount(key.getBytes()));
    }
}
```

### HyperLogLog统计方案 ###

```java
// UV统计管理器
public class UvStatisticsManager {
    
    // 按天统计UV
    private static final String DAILY_UV_KEY = "uv:daily:{date}";
    
    // 按月统计UV
    private static final String MONTHLY_UV_KEY = "uv:monthly:{year}:{month}";
    
    public void recordUserVisit(String date, String userId) {
        String dailyKey = DAILY_UV_KEY.replace("{date}", date);
        // PFADD dailyKey userId
        redisTemplate.opsForHyperLogLog().add(dailyKey, userId);
    }
    
    public Long getDailyUv(String date) {
        String key = DAILY_UV_KEY.replace("{date}", date);
        // PFCOUNT key
        return redisTemplate.opsForHyperLogLog().size(key);
    }
    
    // 合并多天UV统计
    public Long getMultiDayUv(List<String> dates) {
        List<String> keys = dates.stream()
            .map(date -> DAILY_UV_KEY.replace("{date}", date))
            .collect(Collectors.toList());
        
        String tempKey = "uv:temp:" + System.currentTimeMillis();
        try {
            // PFMERGE tempKey key1 key2 key3...
            redisTemplate.opsForHyperLogLog().union(tempKey, keys.toArray(new String[0]));
            return redisTemplate.opsForHyperLogLog().size(tempKey);
        } finally {
            redisTemplate.delete(tempKey);
        }
    }
}
```

### 多维度统计设计 ###

```java
// 综合统计服务
@Service
public class UserStatisticsService {
    
    // 日活统计 (DAU)
    public Long getDailyActiveUsers(String date) {
        return signInBitmapManager.getDailySignInCount(date);
    }
    
    // 月活统计 (MAU) - 使用位图OR运算
    public Long getMonthlyActiveUsers(String year, String month) {
        List<String> dateKeys = generateMonthDates(year, month);
        return bitmapOperations.unionCount(dateKeys);
    }
    
    // 留存率分析 - 使用位图AND运算
    public Double getRetentionRate(String baseDate, String targetDate) {
        Long baseCount = getDailyActiveUsers(baseDate);
        if (baseCount == 0) return 0.0;
        
        Long retainedCount = bitmapOperations.intersectionCount(
            Arrays.asList(baseDate, targetDate));
            
        return (double) retainedCount / baseCount * 100;
    }
    
    // 新用户统计 - 使用HyperLogLog差集估算
    public Long getNewUsers(String date) {
        Long todayUv = uvStatisticsManager.getDailyUv(date);
        Long yesterdayCumulative = getCumulativeUv(getPreviousDate(date));
        return Math.max(0, todayUv - yesterdayCumulative);
    }
}
```

## 关键实现细节 ##

### 位图操作工具类 ###

```java
@Component
public class BitmapOperations {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 位图交集统计
    public Long intersectionCount(List<String> keys) {
        if (keys.isEmpty()) return 0L;
        if (keys.size() == 1) {
            return redisTemplate.execute((RedisCallback<Long>) connection -> 
                connection.stringCommands().bitCount(keys.get(0).getBytes()));
        }
        
        String tempKey = "bitmap:temp:" + System.currentTimeMillis();
        try {
            // BITOP AND tempKey key1 key2 key3...
            byte[][] keyBytes = keys.stream()
                .map(String::getBytes)
                .toArray(byte[][]::new);
                
            redisTemplate.execute((RedisCallback<Long>) connection -> {
                connection.stringCommands().bitOp(BitOperation.AND, 
                    tempKey.getBytes(), keyBytes);
                return null;
            });
            
            return redisTemplate.execute((RedisCallback<Long>) connection -> 
                connection.stringCommands().bitCount(tempKey.getBytes()));
        } finally {
            redisTemplate.delete(tempKey);
        }
    }
    
    // 位图并集统计
    public Long unionCount(List<String> keys) {
        if (keys.isEmpty()) return 0L;
        if (keys.size() == 1) {
            return redisTemplate.execute((RedisCallback<Long>) connection -> 
                connection.stringCommands().bitCount(keys.get(0).getBytes()));
        }
        
        String tempKey = "bitmap:temp:" + System.currentTimeMillis();
        try {
            byte[][] keyBytes = keys.stream()
                .map(String::getBytes)
                .toArray(byte[][]::new);
                
            redisTemplate.execute((RedisCallback<Long>) connection -> {
                connection.stringCommands().bitOp(BitOperation.OR, 
                    tempKey.getBytes(), keyBytes);
                return null;
            });
            
            return redisTemplate.execute((RedisCallback<Long>) connection -> 
                connection.stringCommands().bitCount(tempKey.getBytes()));
        } finally {
            redisTemplate.delete(tempKey);
        }
    }
}
```

### 签到服务实现 ###

```java
@Service
@Transactional
public class SignInService {
    
    @Autowired
    private SignInBitmapManager signInBitmapManager;
    
    @Autowired
    private UvStatisticsManager uvStatisticsManager;
    
    public SignInResult userSignIn(Long userId, String date) {
        try {
            // 1. 记录位图签到
            signInBitmapManager.userSignIn(date, userId);
            
            // 2. 记录UV统计
            uvStatisticsManager.recordUserVisit(date, String.valueOf(userId));
            
            // 3. 更新用户连续签到天数
            Integer continuousDays = calculateContinuousSignInDays(userId, date);
            
            // 4. 发放签到奖励（异步处理）
            rewardService.grantSignInReward(userId, continuousDays);
            
            return SignInResult.success(continuousDays);
            
        } catch (Exception e) {
            log.error("用户签到失败: userId={}, date={}", userId, date, e);
            throw new ServiceException("签到失败", e);
        }
    }
    
    private Integer calculateContinuousSignInDays(Long userId, String currentDate) {
        // 从位图中查询连续签到天数
        int continuousDays = 0;
        String current = currentDate;
        
        while (true) {
            if (signInBitmapManager.isUserSignedIn(current, userId)) {
                continuousDays++;
                current = DateUtils.getPreviousDay(current);
            } else {
                break;
            }
        }
        
        return continuousDays;
    }
}
```

### 统计查询接口 ###

```java
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    
    @Autowired
    private UserStatisticsService userStatisticsService;
    
    @GetMapping("/dau")
    public ResponseEntity<Long> getDailyActiveUsers(
            @RequestParam String date) {
        Long dau = userStatisticsService.getDailyActiveUsers(date);
        return ResponseEntity.ok(dau);
    }
    
    @GetMapping("/mau")
    public ResponseEntity<Long> getMonthlyActiveUsers(
            @RequestParam String year,
            @RequestParam String month) {
        Long mau = userStatisticsService.getMonthlyActiveUsers(year, month);
        return ResponseEntity.ok(mau);
    }
    
    @GetMapping("/retention")
    public ResponseEntity<RetentionStats> getRetentionRate(
            @RequestParam String baseDate,
            @RequestParam String targetDate) {
        Double rate = userStatisticsService.getRetentionRate(baseDate, targetDate);
        RetentionStats stats = new RetentionStats(baseDate, targetDate, rate);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/new-users")
    public ResponseEntity<Long> getNewUsers(@RequestParam String date) {
        Long newUsers = userStatisticsService.getNewUsers(date);
        return ResponseEntity.ok(newUsers);
    }
}
```

## 业务场景应用 ##

### 用户签到系统 ###

```java
// 签到奖励规则
@Data
public class SignInRewardRule {
    private Integer minContinuousDays;  // 最低连续天数
    private Integer maxContinuousDays;  // 最高连续天数
    private List<RewardItem> rewards;   // 奖励物品
}

// 连续签到奖励
public class ContinuousSignInReward {
    private static final List<SignInRewardRule> REWARD_RULES = Arrays.asList(
        new SignInRewardRule(1, 6, Arrays.asList(new RewardItem("积分", 10))),
        new SignInRewardRule(7, 14, Arrays.asList(new RewardItem("积分", 20), new RewardItem("优惠券", 1))),
        new SignInRewardRule(15, 30, Arrays.asList(new RewardItem("积分", 50), new RewardItem("VIP体验卡", 1)))
    );
    
    public List<RewardItem> calculateRewards(Integer continuousDays) {
        return REWARD_RULES.stream()
            .filter(rule -> continuousDays >= rule.getMinContinuousDays() 
                         && continuousDays <= rule.getMaxContinuousDays())
            .findFirst()
            .map(SignInRewardRule::getRewards)
            .orElse(Collections.emptyList());
    }
}
```

### 活跃度分析 ###

```java
// 用户活跃度等级
public enum UserActivityLevel {
    INACTIVE(0, 0),      // 不活跃 (0天)
    LOW(1, 6),          // 低活跃 (1-6天)
    MEDIUM(7, 14),      // 中活跃 (7-14天)
    HIGH(15, 29),       // 高活跃 (15-29天)
    VERY_HIGH(30, 365); // 超高活跃 (30天以上)
    
    private final int minDays;
    private final int maxDays;
    
    public static UserActivityLevel fromSignInDays(int days) {
        return Arrays.stream(values())
            .filter(level -> days >= level.minDays && days <= level.maxDays)
            .findFirst()
            .orElse(INACTIVE);
    }
}
```

### 数据报表生成 ###

```java
@Service
public class ReportGenerationService {
    
    public UserActivityReport generateMonthlyReport(String year, String month) {
        UserActivityReport report = new UserActivityReport();
        
        // 基础数据
        report.setYear(year);
        report.setMonth(month);
        report.setTotalUsers(userService.getTotalUserCount());
        
        // 活跃数据
        report.setMonthlyActiveUsers(userStatisticsService.getMonthlyActiveUsers(year, month));
        report.setDailyAverages(calculateDailyAverages(year, month));
        
        // 留存数据
        report.setRetentionRates(calculateRetentionRates(year, month));
        
        // 趋势分析
        report.setTrendAnalysis(performTrendAnalysis(year, month));
        
        return report;
    }
    
    private Map<String, Double> calculateRetentionRates(String year, String month) {
        Map<String, Double> retentionRates = new HashMap<>();
        String baseDate = year + "-" + month + "-01";
        
        // 计算次日、7日、30日留存率
        retentionRates.put("day1", userStatisticsService.getRetentionRate(baseDate, 
            DateUtils.addDays(baseDate, 1)));
        retentionRates.put("day7", userStatisticsService.getRetentionRate(baseDate, 
            DateUtils.addDays(baseDate, 7)));
        retentionRates.put("day30", userStatisticsService.getRetentionRate(baseDate, 
            DateUtils.addDays(baseDate, 30)));
            
        return retentionRates;
    }
}
```

## 最佳实践建议 ##

### 内存优化策略 ###

```java
@Configuration
public class RedisBitmapConfig {
    
    // 位图数据过期策略
    @PostConstruct
    public void setupBitmapExpiration() {
        // 日统计数据保留90天
        scheduleExpirationTask("signin:daily:*", Duration.ofDays(90));
        
        // 月统计数据保留2年
        scheduleExpirationTask("signin:monthly:*", Duration.ofDays(730));
        
        // UV统计数据保留1年
        scheduleExpirationTask("uv:daily:*", Duration.ofDays(365));
    }
    
    // 冷数据归档到数据库
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
    public void archiveColdData() {
        // 将30天前的统计数据归档到MySQL
        archiveService.archiveHistoricalStatistics(30);
    }
}
```

### 性能监控 ###

```java
@Component
@Slf4j
public class BitmapMonitor {
    
    @EventListener
    public void handleBitmapOperation(BitmapOperationEvent event) {
        // 记录操作耗时
        log.info("位图操作: key={}, operation={}, duration={}ms, result={}", 
            event.getKey(), event.getOperation(), event.getDuration(), event.getResult());
        
        // 监控内存使用
        if (event.getKey().startsWith("signin:daily:")) {
            monitorDailyBitmapSize(event.getKey());
        }
        
        // 上报监控指标
        MeterRegistry registry = Metrics.globalRegistry;
        registry.timer("bitmap.operation", 
            "operation", event.getOperation(),
            "key_type", getKeyType(event.getKey()))
            .record(event.getDuration(), TimeUnit.MILLISECONDS);
    }
    
    private void monitorDailyBitmapSize(String key) {
        Long size = redisTemplate.execute((RedisCallback<Long>) connection -> 
            connection.stringCommands().bitCount(key.getBytes()));
        log.info("每日签到位图大小: key={}, users={}", key, size);
    }
}
```

### 容错处理 ###

```java
@Service
public class BitmapFallbackService {
    
    // Redis故障时的降级方案
    public Long getDailyActiveUsersFallback(String date) {
        try {
            // 从数据库查询历史统计数据
            return statisticsRepository.getHistoricalDau(date);
        } catch (Exception e) {
            log.error("降级查询失败: date={}", date, e);
            return 0L;  // 返回默认值
        }
    }
    
    // 数据一致性检查
    @Scheduled(fixedRate = 3600000)  // 每小时检查一次
    public void checkDataConsistency() {
        String today = DateUtils.getCurrentDate();
        Long bitmapCount = userStatisticsService.getDailyActiveUsers(today);
        Long dbCount = statisticsRepository.getActualSignInCount(today);
        
        if (Math.abs(bitmapCount - dbCount) > bitmapCount * 0.01) {  // 1%误差阈值
            log.warn("数据不一致: bitmap={}, db={}, date={}", bitmapCount, dbCount, today);
            // 触发数据修复流程
            triggerDataRepair(today);
        }
    }
}
```

## 预期效果 ##

通过位图和HyperLogLog方案，我们可以实现：

- 存储优化：相比MySQL节省99%以上的存储空间
- 性能提升：查询响应时间从秒级降到毫秒级
- 成本降低：大幅减少服务器和数据库资源消耗
- 扩展性强：轻松应对用户量增长，支持亿级用户规模
- 功能丰富：支持复杂的多维度统计分析

这套方案不仅解决了当前的性能瓶颈，还为未来的业务扩展打下了坚实基础，是处理大数据统计场景的最优选择。
