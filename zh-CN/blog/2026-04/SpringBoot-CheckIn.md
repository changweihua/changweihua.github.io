---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot的5种签到打卡实现方案
description: SpringBoot的5种签到打卡实现方案
date: 2026-04-13 11:30:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在现代应用开发中，签到打卡功能广泛应用于企业考勤管理、在线教育、社区运营等多个领域。

它不仅是一种记录用户行为的方式，也是提升用户粘性和活跃度的重要手段。

本文将介绍5种签到打卡的实现方案。

## 一、基于关系型数据库的传统签到系统 ##

### 基本原理 ###

最直接的签到系统实现方式是利用关系型数据库（如MySQL、PostgreSQL）记录每次签到行为。

这种方案设计简单，易于理解和实现，适合大多数中小型应用场景。

### 数据模型设计 ###

```sql
-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 签到记录表
CREATE TABLE check_ins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_in_date DATE NOT NULL,
    check_in_type VARCHAR(20) NOT NULL, -- 'DAILY', 'COURSE', 'MEETING' 等
    location VARCHAR(255),
    device_info VARCHAR(255),
    remark VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_date (user_id, check_in_date, check_in_type)
);

-- 签到统计表
CREATE TABLE check_in_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_days INT DEFAULT 0,
    continuous_days INT DEFAULT 0,
    last_check_in_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user (user_id)
);
```

### 核心代码实现 ###

#### 实体类设计 ####

```java
@Data
@TableName("check_ins")
public class CheckIn {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("check_in_time")
    private LocalDateTime checkInTime;
    
    @TableField("check_in_date")
    private LocalDate checkInDate;
    
    @TableField("check_in_type")
    private String checkInType;
    
    private String location;
    
    @TableField("device_info")
    private String deviceInfo;
    
    private String remark;
}

@Data
@TableName("check_in_stats")
public class CheckInStats {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("total_days")
    private Integer totalDays = 0;
    
    @TableField("continuous_days")
    private Integer continuousDays = 0;
    
    @TableField("last_check_in_date")
    private LocalDate lastCheckInDate;
}

@Data
@TableName("users")
public class User {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    @TableField("created_at")
    private LocalDateTime createdAt;
}
```

#### Mapper层 ####

```java
@Mapper
public interface CheckInMapper extends BaseMapper<CheckIn> {
    
    @Select("SELECT COUNT(*) FROM check_ins WHERE user_id = #{userId} AND check_in_type = #{type}")
    int countByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
    
    @Select("SELECT * FROM check_ins WHERE user_id = #{userId} AND check_in_date BETWEEN #{startDate} AND #{endDate} ORDER BY check_in_date ASC")
    List<CheckIn> findByUserIdAndDateBetween(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
    
    @Select("SELECT COUNT(*) FROM check_ins WHERE user_id = #{userId} AND check_in_date = #{date} AND check_in_type = #{type}")
    int existsByUserIdAndDateAndType(
            @Param("userId") Long userId, 
            @Param("date") LocalDate date, 
            @Param("type") String type);
}

@Mapper
public interface CheckInStatsMapper extends BaseMapper<CheckInStats> {
    
    @Select("SELECT * FROM check_in_stats WHERE user_id = #{userId}")
    CheckInStats findByUserId(@Param("userId") Long userId);
}

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);
}
```

#### Service层 ####

```java
@Service
@Transactional
public class CheckInService {
    
    @Autowired
    private CheckInMapper checkInMapper;
    
    @Autowired
    private CheckInStatsMapper checkInStatsMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 用户签到
     */
    public CheckIn checkIn(Long userId, String type, String location, String deviceInfo, String remark) {
        // 检查用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        LocalDate today = LocalDate.now();
        
        // 检查今天是否已经签到
        if (checkInMapper.existsByUserIdAndDateAndType(userId, today, type) > 0) {
            throw new RuntimeException("Already checked in today");
        }
        
        // 创建签到记录
        CheckIn checkIn = new CheckIn();
        checkIn.setUserId(userId);
        checkIn.setCheckInTime(LocalDateTime.now());
        checkIn.setCheckInDate(today);
        checkIn.setCheckInType(type);
        checkIn.setLocation(location);
        checkIn.setDeviceInfo(deviceInfo);
        checkIn.setRemark(remark);
        
        checkInMapper.insert(checkIn);
        
        // 更新签到统计
        updateCheckInStats(userId, today);
        
        return checkIn;
    }
    
    /**
     * 更新签到统计信息
     */
    private void updateCheckInStats(Long userId, LocalDate today) {
        CheckInStats stats = checkInStatsMapper.findByUserId(userId);
        
        if (stats == null) {
            stats = new CheckInStats();
            stats.setUserId(userId);
            stats.setTotalDays(1);
            stats.setContinuousDays(1);
            stats.setLastCheckInDate(today);
            
            checkInStatsMapper.insert(stats);
        } else {
            // 更新总签到天数
            stats.setTotalDays(stats.getTotalDays() + 1);
            
            // 更新连续签到天数
            if (stats.getLastCheckInDate() != null) {
                if (today.minusDays(1).equals(stats.getLastCheckInDate())) {
                    // 连续签到
                    stats.setContinuousDays(stats.getContinuousDays() + 1);
                } else if (today.equals(stats.getLastCheckInDate())) {
                    // 当天重复签到，不计算连续天数
                } else {
                    // 中断连续签到
                    stats.setContinuousDays(1);
                }
            }
            
            stats.setLastCheckInDate(today);
            
            checkInStatsMapper.updateById(stats);
        }
    }
    
    /**
     * 获取用户签到统计
     */
    public CheckInStats getCheckInStats(Long userId) {
        CheckInStats stats = checkInStatsMapper.findByUserId(userId);
        if (stats == null) {
            throw new RuntimeException("Check-in stats not found");
        }
        return stats;
    }
    
    /**
     * 获取用户指定日期范围内的签到记录
     */
    public List<CheckIn> getCheckInHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        return checkInMapper.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
}
```

#### Controller层 ####

```java
@RestController
@RequestMapping("/api/check-ins")
public class CheckInController {
    
    @Autowired
    private CheckInService checkInService;
    
    @PostMapping
    public ResponseEntity<CheckIn> checkIn(@RequestBody CheckInRequest request) {
        CheckIn checkIn = checkInService.checkIn(
                request.getUserId(),
                request.getType(),
                request.getLocation(),
                request.getDeviceInfo(),
                request.getRemark()
        );
        return ResponseEntity.ok(checkIn);
    }
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<CheckInStats> getStats(@PathVariable Long userId) {
        CheckInStats stats = checkInService.getCheckInStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<CheckIn>> getHistory(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CheckIn> history = checkInService.getCheckInHistory(userId, startDate, endDate);
        return ResponseEntity.ok(history);
    }
}

@Data
public class CheckInRequest {
    private Long userId;
    private String type;
    private String location;
    private String deviceInfo;
    private String remark;
}
```

### 优缺点分析 ###

优点：

- 设计简单直观，易于理解和实现
- 支持丰富的数据查询和统计功能
- 事务支持，确保数据一致性
- 易于与现有系统集成

缺点：

- 数据量大时查询性能可能下降
- 连续签到统计等复杂查询逻辑实现相对繁琐
- 不适合高并发场景
- 数据库负载较高

### 适用场景 ###

- 中小型企业的员工考勤系统
- 课程签到系统
- 会议签到管理
- 用户量不大的社区签到功能

## 二、基于Redis的高性能签到系统 ##

### 基本原理 ###

利用Redis的高性能和丰富的数据结构，可以构建一个响应迅速的签到系统。尤其是对于高并发场景和需要实时统计的应用，Redis提供了显著的性能优势。

### 系统设计 ###

Redis中我们可以使用以下几种数据结构来实现签到系统：

- String: 记录用户最后签到时间和连续签到天数
- Hash: 存储用户当天的签到详情
- Sorted Set: 按签到时间排序的用户列表，便于排行榜等功能
- Set: 记录每天签到的用户集合

### 核心代码实现 ###

#### Redis配置 ####

```java
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // 使用Jackson2JsonRedisSerializer序列化和反序列化redis的value值
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
        serializer.setObjectMapper(mapper);
        
        template.setValueSerializer(serializer);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        
        return template;
    }
}
```

#### 签到服务实现 ####

```java
@Service
public class RedisCheckInService {
    
    private static final String USER_CHECKIN_KEY = "checkin:user:";
    private static final String DAILY_CHECKIN_KEY = "checkin:daily:";
    private static final String CHECKIN_RANK_KEY = "checkin:rank:";
    private static final String USER_STATS_KEY = "checkin:stats:";
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    
    /**
     * 用户签到
     */
    public boolean checkIn(Long userId, String location) {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String userKey = USER_CHECKIN_KEY + userId;
        String dailyKey = DAILY_CHECKIN_KEY + today;
        
        // 判断用户今天是否已经签到
        Boolean isMember = redisTemplate.opsForSet().isMember(dailyKey, userId);
        if (isMember != null && isMember) {
            return false; // 已经签到过了
        }
        
        // 记录用户签到
        redisTemplate.opsForSet().add(dailyKey, userId);
        
        // 设置过期时间（35天后过期，以便统计连续签到）
        redisTemplate.expire(dailyKey, 35, TimeUnit.DAYS);
        
        // 记录用户签到详情
        Map<String, String> checkInInfo = new HashMap<>();
        checkInInfo.put("time", LocalDateTime.now().toString());
        checkInInfo.put("location", location);
        redisTemplate.opsForHash().putAll(userKey + ":" + today, checkInInfo);
        
        // 更新签到排行榜
        redisTemplate.opsForZSet().incrementScore(CHECKIN_RANK_KEY + today, userId, 1);
        
        // 更新用户签到统计
        updateUserCheckInStats(userId);
        
        return true;
    }
    
    /**
     * 更新用户签到统计
     */
    private void updateUserCheckInStats(Long userId) {
        String userStatsKey = USER_STATS_KEY + userId;
        
        // 获取当前日期
        LocalDate today = LocalDate.now();
        String todayStr = today.format(DateTimeFormatter.ISO_DATE);
        
        // 获取用户最后签到日期
        String lastCheckInDate = (String) redisTemplate.opsForHash().get(userStatsKey, "lastCheckInDate");
        
        // 更新总签到天数
        redisTemplate.opsForHash().increment(userStatsKey, "totalDays", 1);
        
        // 更新连续签到天数
        if (lastCheckInDate != null) {
            LocalDate lastDate = LocalDate.parse(lastCheckInDate, DateTimeFormatter.ISO_DATE);
            
            if (today.minusDays(1).equals(lastDate)) {
                // 连续签到
                redisTemplate.opsForHash().increment(userStatsKey, "continuousDays", 1);
            } else if (today.equals(lastDate)) {
                // 当天重复签到，不增加连续天数
            } else {
                // 中断连续签到
                redisTemplate.opsForHash().put(userStatsKey, "continuousDays", 1);
            }
        } else {
            // 第一次签到
            redisTemplate.opsForHash().put(userStatsKey, "continuousDays", 1);
        }
        
        // 更新最后签到日期
        redisTemplate.opsForHash().put(userStatsKey, "lastCheckInDate", todayStr);
    }
    
    /**
     * 获取用户签到统计信息
     */
    public Map<Object, Object> getUserCheckInStats(Long userId) {
        String userStatsKey = USER_STATS_KEY + userId;
        return redisTemplate.opsForHash().entries(userStatsKey);
    }
    
    /**
     * 获取用户是否已签到
     */
    public boolean isUserCheckedInToday(Long userId) {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String dailyKey = DAILY_CHECKIN_KEY + today;
        
        Boolean isMember = redisTemplate.opsForSet().isMember(dailyKey, userId);
        return isMember != null && isMember;
    }
    
    /**
     * 获取今日签到用户数
     */
    public long getTodayCheckInCount() {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String dailyKey = DAILY_CHECKIN_KEY + today;
        
        Long size = redisTemplate.opsForSet().size(dailyKey);
        return size != null ? size : 0;
    }
    
    /**
     * 获取签到排行榜
     */
    public Set<ZSetOperations.TypedTuple<Object>> getCheckInRank(int limit) {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String rankKey = CHECKIN_RANK_KEY + today;
        
        return redisTemplate.opsForZSet().reverseRangeWithScores(rankKey, 0, limit - 1);
    }
    
    /**
     * 检查用户在指定日期是否签到
     */
    public boolean checkUserSignedInDate(Long userId, LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ISO_DATE);
        String dailyKey = DAILY_CHECKIN_KEY + dateStr;
        
        Boolean isMember = redisTemplate.opsForSet().isMember(dailyKey, userId);
        return isMember != null && isMember;
    }
    
    /**
     * 获取用户指定月份的签到情况
     */
    public List<String> getMonthlyCheckInStatus(Long userId, int year, int month) {
        List<String> result = new ArrayList<>();
        YearMonth yearMonth = YearMonth.of(year, month);
        
        // 获取指定月份的第一天和最后一天
        LocalDate firstDay = yearMonth.atDay(1);
        LocalDate lastDay = yearMonth.atEndOfMonth();
        
        // 逐一检查每一天是否签到
        LocalDate currentDate = firstDay;
        while (!currentDate.isAfter(lastDay)) {
            if (checkUserSignedInDate(userId, currentDate)) {
                result.add(currentDate.format(DateTimeFormatter.ISO_DATE));
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return result;
    }
}
```

#### 控制器实现 ####

```java
@RestController
@RequestMapping("/api/redis-check-in")
public class RedisCheckInController {
    
    @Autowired
    private RedisCheckInService checkInService;
    
    @PostMapping
    public ResponseEntity<?> checkIn(@RequestBody RedisCheckInRequest request) {
        boolean success = checkInService.checkIn(request.getUserId(), request.getLocation());
        
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Check-in successful"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Already checked in today"));
        }
    }
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<Object, Object>> getUserStats(@PathVariable Long userId) {
        Map<Object, Object> stats = checkInService.getUserCheckInStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, Object>> getCheckInStatus(@PathVariable Long userId) {
        boolean checkedIn = checkInService.isUserCheckedInToday(userId);
        long todayCount = checkInService.getTodayCheckInCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("checkedIn", checkedIn);
        response.put("todayCount", todayCount);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/rank")
    public ResponseEntity<Set<ZSetOperations.TypedTuple<Object>>> getCheckInRank(
            @RequestParam(defaultValue = "10") int limit) {
        Set<ZSetOperations.TypedTuple<Object>> rank = checkInService.getCheckInRank(limit);
        return ResponseEntity.ok(rank);
    }
    
    @GetMapping("/monthly/{userId}")
    public ResponseEntity<List<String>> getMonthlyStatus(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam int month) {
        List<String> checkInDays = checkInService.getMonthlyCheckInStatus(userId, year, month);
        return ResponseEntity.ok(checkInDays);
    }
}

@Data
public class RedisCheckInRequest {
    private Long userId;
    private String location;
}
```

### 优缺点分析 ###

优点：

- 极高的性能，支持高并发场景
- 丰富的数据结构支持多种签到功能（排行榜、签到日历等）
- 内存数据库，响应速度快
- 适合实时统计和分析

缺点：

- 数据持久性不如关系型数据库
- 复杂查询能力有限
- 内存成本较高

### 适用场景 ###

- 大型社区或应用的签到功能
- 实时性要求高的签到系统
- 高并发场景下的打卡功能
- 需要签到排行榜、签到日历等交互功能的应用

## 三、基于位图(Bitmap)的连续签到统计系统 ##

### 基本原理 ###

Redis的Bitmap是一种非常节省空间的数据结构，它可以用来记录签到状态，每个bit位代表一天的签到状态（0表示未签到，1表示已签到）。利用Bitmap可以高效地实现连续签到统计、月度签到日历等功能，同时极大地节省内存使用。

### 系统设计 ###

主要使用Redis的Bitmap操作来记录和统计用户签到情况：

- 每个用户每个月的签到记录使用一个Bitmap
- Bitmap的每一位代表当月的一天（1-31）
- 通过位操作可以高效地统计签到天数、连续签到等信息

### 核心代码实现 ###

```java
@Service
public class BitmapCheckInService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 用户签到
     */
    public boolean checkIn(Long userId) {
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth(); // 获取当月的第几天
        String key = buildSignKey(userId, today);
        
        // 检查今天是否已经签到
        Boolean isSigned = redisTemplate.opsForValue().getBit(key, day - 1);
        if (isSigned != null && isSigned) {
            return false; // 已经签到
        }
        
        // 设置签到标记
        redisTemplate.opsForValue().setBit(key, day - 1, true);
        
        // 设置过期时间（确保数据不会永久保存）
        redisTemplate.expire(key, 100, TimeUnit.DAYS);
        
        // 更新连续签到记录
        updateContinuousSignDays(userId);
        
        return true;
    }
    
    /**
     * 更新连续签到天数
     */
    private void updateContinuousSignDays(Long userId) {
        LocalDate today = LocalDate.now();
        String continuousKey = "user:sign:continuous:" + userId;
        
        // 判断昨天是否签到
        boolean yesterdayChecked = isSignedIn(userId, today.minusDays(1));
        
        if (yesterdayChecked) {
            // 昨天签到了，连续签到天数+1
            redisTemplate.opsForValue().increment(continuousKey);
        } else {
            // 昨天没签到，重置连续签到天数为1
            redisTemplate.opsForValue().set(continuousKey, "1");
        }
    }
    
    /**
     * 判断用户指定日期是否签到
     */
    public boolean isSignedIn(Long userId, LocalDate date) {
        int day = date.getDayOfMonth();
        String key = buildSignKey(userId, date);
        
        Boolean isSigned = redisTemplate.opsForValue().getBit(key, day - 1);
        return isSigned != null && isSigned;
    }
    
    /**
     * 获取用户连续签到天数
     */
    public int getContinuousSignDays(Long userId) {
        String continuousKey = "user:sign:continuous:" + userId;
        String value = redisTemplate.opsForValue().get(continuousKey);
        return value != null ? Integer.parseInt(value) : 0;
    }
    
    /**
     * 获取用户当月签到次数
     */
    public long getMonthSignCount(Long userId, LocalDate date) {
        String key = buildSignKey(userId, date);
        int dayOfMonth = date.lengthOfMonth(); // 当月总天数
        
        return redisTemplate.execute((RedisCallback<Long>) con -> {
            return con.bitCount(key.getBytes());
        });
    }
    
    /**
     * 获取用户当月签到情况
     */
    public List<Integer> getMonthSignData(Long userId, LocalDate date) {
        List<Integer> result = new ArrayList<>();
        String key = buildSignKey(userId, date);
        int dayOfMonth = date.lengthOfMonth(); // 当月总天数
        
        for (int i = 0; i < dayOfMonth; i++) {
            Boolean isSigned = redisTemplate.opsForValue().getBit(key, i);
            result.add(isSigned != null && isSigned ? 1 : 0);
        }
        
        return result;
    }
    
    /**
     * 获取用户当月首次签到时间
     */
    public int getFirstSignDay(Long userId, LocalDate date) {
        String key = buildSignKey(userId, date);
        int dayOfMonth = date.lengthOfMonth(); // 当月总天数
        
        for (int i = 0; i < dayOfMonth; i++) {
            Boolean isSigned = redisTemplate.opsForValue().getBit(key, i);
            if (isSigned != null && isSigned) {
                return i + 1; // 返回第一次签到的日期
            }
        }
        
        return -1; // 本月没有签到记录
    }
    
    /**
     * 构建签到Key
     */
    private String buildSignKey(Long userId, LocalDate date) {
        return String.format("user:sign:%d:%d%02d", userId, date.getYear(), date.getMonthValue());
    }
}
```

#### 控制器实现 ####

```java
@RestController
@RequestMapping("/api/bitmap-check-in")
public class BitmapCheckInController {
    
    @Autowired
    private BitmapCheckInService checkInService;
    
    @PostMapping("/{userId}")
    public ResponseEntity<?> checkIn(@PathVariable Long userId) {
        boolean success = checkInService.checkIn(userId);
        
        if (success) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("continuousDays", checkInService.getContinuousSignDays(userId));
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Already checked in today"));
        }
    }
    
    @GetMapping("/{userId}/status")
    public ResponseEntity<?> checkInStatus(
            @PathVariable Long userId,
            @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("signedToday", checkInService.isSignedIn(userId, date));
        response.put("continuousDays", checkInService.getContinuousSignDays(userId));
        response.put("monthSignCount", checkInService.getMonthSignCount(userId, date));
        response.put("monthSignData", checkInService.getMonthSignData(userId, date));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{userId}/first-sign-day")
    public ResponseEntity<Integer> getFirstSignDay(
            @PathVariable Long userId,
            @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        int firstDay = checkInService.getFirstSignDay(userId, date);
        return ResponseEntity.ok(firstDay);
    }
}
```

### 优缺点分析 ###

优点：

- 极其节省存储空间，一个月的签到记录仅需要4字节
- 位操作性能高，适合大规模用户
- 统计操作（如计算签到天数）非常高效
- 适合实现签到日历和连续签到统计

缺点：

- 不能存储签到的详细信息（如签到时间、地点等）
- 仅适合简单的签到/未签到二元状态记录
- 复杂的签到业务逻辑实现较困难
- 历史数据查询相对复杂

### 适用场景 ###

- 需要节省存储空间的大规模用户签到系统
- 社区/电商平台的每日签到奖励功能
- 需要高效计算连续签到天数的应用
- 移动应用的签到日历功能

## 四、基于地理位置的签到打卡系统 ##

### 基本原理 ###

地理位置签到系统利用用户的GPS定位信息，验证用户是否在指定区域内进行签到，常用于企业考勤、学校上课点名、实地活动签到等场景。

该方案结合了关系型数据库存储签到记录和Redis的GEO功能进行位置验证。

### 数据模型设计 ###

```sql
-- 签到位置表
CREATE TABLE check_in_locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    radius DOUBLE NOT NULL, -- 有效半径（米）
    address VARCHAR(255),
    location_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 地理位置签到记录表
CREATE TABLE geo_check_ins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    accuracy DOUBLE, -- 定位精度（米）
    is_valid BOOLEAN DEFAULT TRUE, -- 是否有效签到
    device_info VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES check_in_locations(id)
);
```

### 核心代码实现 ###

#### 实体类设计 ####

```java
@Data
@TableName("check_in_locations")
public class CheckInLocation {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    private String name;
    
    private Double latitude;
    
    private Double longitude;
    
    private Double radius; // 单位：米
    
    private String address;
    
    @TableField("location_type")
    private String locationType;
    
    @TableField("created_at")
    private LocalDateTime createdAt;
}

@Data
@TableName("geo_check_ins")
public class GeoCheckIn {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("location_id")
    private Long locationId;
    
    @TableField("check_in_time")
    private LocalDateTime checkInTime;
    
    private Double latitude;
    
    private Double longitude;
    
    private Double accuracy;
    
    @TableField("is_valid")
    private Boolean isValid = true;
    
    @TableField("device_info")
    private String deviceInfo;
}
```

#### Mapper层 ####

```java
@Mapper
public interface CheckInLocationMapper extends BaseMapper<CheckInLocation> {
    
    @Select("SELECT * FROM check_in_locations WHERE location_type = #{locationType}")
    List<CheckInLocation> findByLocationType(@Param("locationType") String locationType);
}

@Mapper
public interface GeoCheckInMapper extends BaseMapper<GeoCheckIn> {
    
    @Select("SELECT * FROM geo_check_ins WHERE user_id = #{userId} AND check_in_time BETWEEN #{startTime} AND #{endTime}")
    List<GeoCheckIn> findByUserIdAndCheckInTimeBetween(
            @Param("userId") Long userId, 
            @Param("startTime") LocalDateTime startTime, 
            @Param("endTime") LocalDateTime endTime);
    
    @Select("SELECT * FROM geo_check_ins WHERE user_id = #{userId} AND location_id = #{locationId} " +
            "AND DATE(check_in_time) = DATE(#{date})")
    GeoCheckIn findByUserIdAndLocationIdAndDate(
            @Param("userId") Long userId, 
            @Param("locationId") Long locationId, 
            @Param("date") LocalDateTime date);
}
```

#### Service层 ####

```java
@Service
@Transactional
public class GeoCheckInService {
    
    @Autowired
    private CheckInLocationMapper locationMapper;
    
    @Autowired
    private GeoCheckInMapper geoCheckInMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    private static final String GEO_KEY = "geo:locations";
    
    @PostConstruct
    public void init() {
        // 将所有签到位置加载到Redis GEO中
        List<CheckInLocation> locations = locationMapper.selectList(null);
        
        if (!locations.isEmpty()) {
            Map<String, Point> locationPoints = new HashMap<>();
            
            for (CheckInLocation location : locations) {
                locationPoints.put(location.getId().toString(), 
                        new Point(location.getLongitude(), location.getLatitude()));
            }
            
            redisTemplate.opsForGeo().add(GEO_KEY, locationPoints);
        }
    }
    
    /**
     * 添加新的签到地点
     */
    public CheckInLocation addCheckInLocation(CheckInLocation location) {
        location.setCreatedAt(LocalDateTime.now());
        locationMapper.insert(location);
        
        // 添加到Redis GEO
        redisTemplate.opsForGeo().add(GEO_KEY, 
                new Point(location.getLongitude(), location.getLatitude()), 
                location.getId().toString());
        
        return location;
    }
    
    /**
     * 用户地理位置签到
     */
    public GeoCheckIn checkIn(Long userId, Long locationId, Double latitude, 
                              Double longitude, Double accuracy, String deviceInfo) {
        // 验证用户和位置是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        CheckInLocation location = locationMapper.selectById(locationId);
        if (location == null) {
            throw new RuntimeException("Check-in location not found");
        }
        
        // 检查今天是否已经在该位置签到
        LocalDateTime now = LocalDateTime.now();
        GeoCheckIn existingCheckIn = geoCheckInMapper
                .findByUserIdAndLocationIdAndDate(userId, locationId, now);
        
        if (existingCheckIn != null) {
            throw new RuntimeException("Already checked in at this location today");
        }
        
        // 验证用户是否在签到范围内
        boolean isWithinRange = isWithinCheckInRange(
                latitude, longitude, location.getLatitude(), location.getLongitude(), location.getRadius());
        
        // 创建签到记录
        GeoCheckIn checkIn = new GeoCheckIn();
        checkIn.setUserId(userId);
        checkIn.setLocationId(locationId);
        checkIn.setCheckInTime(now);
        checkIn.setLatitude(latitude);
        checkIn.setLongitude(longitude);
        checkIn.setAccuracy(accuracy);
        checkIn.setIsValid(isWithinRange);
        checkIn.setDeviceInfo(deviceInfo);
        
        geoCheckInMapper.insert(checkIn);
        
        return checkIn;
    }
    
    /**
     * 检查用户是否在签到范围内
     */
    private boolean isWithinCheckInRange(Double userLat, Double userLng, 
                                        Double locationLat, Double locationLng, Double radius) {
        // 使用Redis GEO计算距离
        Distance distance = redisTemplate.opsForGeo().distance(
                GEO_KEY,
                locationLat + "," + locationLng,
                userLat + "," + userLng,
                Metrics.METERS
        );
        
        return distance != null && distance.getValue() <= radius;
    }
    
    /**
     * 查找附近的签到地点
     */
    public List<GeoResult<RedisGeoCommands.GeoLocation<String>>> findNearbyLocations(
            Double latitude, Double longitude, Double radius) {
        
        Circle circle = new Circle(new Point(longitude, latitude), new Distance(radius, Metrics.METERS));
        RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                .newGeoRadiusArgs().includeDistance().sortAscending();
        
        GeoResults<RedisGeoCommands.GeoLocation<String>> results = redisTemplate.opsForGeo()
                .radius(GEO_KEY, circle, args);
        
        return results != null ? results.getContent() : Collections.emptyList();
    }
    
    /**
     * 获取用户签到历史
     */
    public List<GeoCheckIn> getUserCheckInHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        return geoCheckInMapper.findByUserIdAndCheckInTimeBetween(
                userId, startDateTime, endDateTime);
    }
}
```

#### Controller层 ####

```java
@RestController
@RequestMapping("/api/geo-check-in")
public class GeoCheckInController {
    
    @Autowired
    private GeoCheckInService geoCheckInService;
    
    @PostMapping("/locations")
    public ResponseEntity<CheckInLocation> addLocation(@RequestBody CheckInLocation location) {
        CheckInLocation savedLocation = geoCheckInService.addCheckInLocation(location);
        return ResponseEntity.ok(savedLocation);
    }
    
    @PostMapping
    public ResponseEntity<?> checkIn(@RequestBody GeoCheckInRequest request) {
        try {
            GeoCheckIn checkIn = geoCheckInService.checkIn(
                    request.getUserId(),
                    request.getLocationId(),
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getAccuracy(),
                    request.getDeviceInfo()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", checkIn.getId());
            response.put("checkInTime", checkIn.getCheckInTime());
            response.put("isValid", checkIn.getIsValid());
            
            if (!checkIn.getIsValid()) {
                response.put("message", "You are not within the valid check-in range");
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<?> findNearbyLocations(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "500") Double radius) {
        
        List<GeoResult<RedisGeoCommands.GeoLocation<String>>> locations = 
                geoCheckInService.findNearbyLocations(latitude, longitude, radius);
        
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<GeoCheckIn>> getUserHistory(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<GeoCheckIn> history = geoCheckInService.getUserCheckInHistory(userId, startDate, endDate);
        return ResponseEntity.ok(history);
    }
}

@Data
public class GeoCheckInRequest {
    private Long userId;
    private Long locationId;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private String deviceInfo;
}
```

### 优缺点分析 ###

优点：

- 利用地理位置验证提高签到真实性
- 支持多地点签到和附近地点查找
- 结合了关系型数据库和Redis的优势
- 适合需要物理位置验证的场景

缺点：

- 依赖用户设备的GPS定位精度
- 可能受到GPS欺骗工具的影响
- 室内定位精度可能不足
- 系统复杂度较高

### 适用场景 ###

- 企业员工考勤系统
- 外勤人员签到打卡
- 学校课堂点名
- 实地活动签到验证
- 外卖/快递配送签收系统

## 五、基于二维码的签到打卡系统 ##

### 基本原理 ###

二维码签到系统通过动态生成带有时间戳和签名的二维码，用户通过扫描二维码完成签到。
这种方式适合会议、课程、活动等场景，可有效防止代签，同时简化签到流程。

### 数据模型设计 ###

```sql
-- 签到活动表
CREATE TABLE check_in_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    organizer_id BIGINT,
    qr_code_refresh_interval INT DEFAULT 60, -- 二维码刷新间隔（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- 二维码签到记录表
CREATE TABLE qr_check_ins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    qr_code_token VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    device_info VARCHAR(255),
    FOREIGN KEY (event_id) REFERENCES check_in_events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_event_user (event_id, user_id)
);
```

### 核心代码实现 ###

#### 实体类设计 ####

```java
@Data
@TableName("check_in_events")
public class CheckInEvent {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    private String title;
    
    private String description;
    
    @TableField("start_time")
    private LocalDateTime startTime;
    
    @TableField("end_time")
    private LocalDateTime endTime;
    
    private String location;
    
    @TableField("organizer_id")
    private Long organizerId;
    
    @TableField("qr_code_refresh_interval")
    private Integer qrCodeRefreshInterval = 60; // 默认60秒
    
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    @TableField(exist = false)
    private String currentQrCode;
}

@Data
@TableName("qr_check_ins")
public class QrCheckIn {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("event_id")
    private Long eventId;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("check_in_time")
    private LocalDateTime checkInTime;
    
    @TableField("qr_code_token")
    private String qrCodeToken;
    
    @TableField("ip_address")
    private String ipAddress;
    
    @TableField("device_info")
    private String deviceInfo;
}
```

#### Mapper层 ####

```java
@Mapper
public interface CheckInEventMapper extends BaseMapper<CheckInEvent> {
}

@Mapper
public interface QrCheckInMapper extends BaseMapper<QrCheckIn> {
    
    @Select("SELECT * FROM qr_check_ins WHERE event_id = #{eventId} ORDER BY check_in_time DESC")
    List<QrCheckIn> findByEventIdOrderByCheckInTimeDesc(@Param("eventId") Long eventId);
    
    @Select("SELECT * FROM qr_check_ins WHERE user_id = #{userId} ORDER BY check_in_time DESC")
    List<QrCheckIn> findByUserIdOrderByCheckInTimeDesc(@Param("userId") Long userId);
    
    @Select("SELECT COUNT(*) FROM qr_check_ins WHERE event_id = #{eventId}")
    long countByEventId(@Param("eventId") Long eventId);
    
    @Select("SELECT COUNT(*) FROM qr_check_ins WHERE event_id = #{eventId} AND user_id = #{userId}")
    int existsByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);
}
```

#### QR码服务和校验 ####

```java
@Service
public class QrCodeService {
    
    @Value("${qrcode.secret:defaultSecretKey}")
    private String secretKey;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 生成带签名的二维码内容
     */
    public String generateQrCodeContent(Long eventId) {
        long timestamp = System.currentTimeMillis();
        String content = eventId + ":" + timestamp;
        String signature = generateSignature(content);
        
        // 创建完整的二维码内容
        String qrCodeContent = content + ":" + signature;
        
        // 保存到Redis，设置过期时间
        String redisKey = "qrcode:event:" + eventId + ":" + timestamp;
        redisTemplate.opsForValue().set(redisKey, qrCodeContent, 5, TimeUnit.MINUTES);
        
        return qrCodeContent;
    }
    
    /**
     * 验证二维码内容
     */
    public boolean validateQrCode(String qrCodeContent) {
        String[] parts = qrCodeContent.split(":");
        if (parts.length != 3) {
            return false;
        }
        
        String eventId = parts[0];
        String timestamp = parts[1];
        String providedSignature = parts[2];
        
        // 验证签名
        String content = eventId + ":" + timestamp;
        String expectedSignature = generateSignature(content);
        
        if (!expectedSignature.equals(providedSignature)) {
            return false;
        }
        
        // 验证二维码是否在Redis中存在（防止重复使用）
        String redisKey = "qrcode:event:" + eventId + ":" + timestamp;
        Boolean exists = redisTemplate.hasKey(redisKey);
        
        return exists != null && exists;
    }
    
    /**
     * 生成二维码图片
     */
    public byte[] generateQrCodeImage(String content, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        
        return pngOutputStream.toByteArray();
    }
    
    /**
     * 生成内容签名
     */
    private String generateSignature(String content) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            
            byte[] hash = sha256_HMAC.doFinal(content.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }
}
```

#### 服务层实现 ####

```java
@Service
@Transactional
public class QrCheckInService {
    
    @Autowired
    private CheckInEventMapper eventMapper;
    
    @Autowired
    private QrCheckInMapper qrCheckInMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private QrCodeService qrCodeService;
    
    /**
     * 创建签到活动
     */
    public CheckInEvent createEvent(CheckInEvent event) {
        event.setCreatedAt(LocalDateTime.now());
        eventMapper.insert(event);
        return event;
    }
    
    /**
     * 获取活动信息，包括当前二维码
     */
    public CheckInEvent getEventWithQrCode(Long eventId) {
        CheckInEvent event = eventMapper.selectById(eventId);
        if (event == null) {
            throw new RuntimeException("Event not found");
        }
        
        // 检查活动是否在有效期内
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getStartTime()) || now.isAfter(event.getEndTime())) {
            throw new RuntimeException("Event is not active");
        }
        
        // 生成当前二维码
        String qrCodeContent = qrCodeService.generateQrCodeContent(eventId);
        event.setCurrentQrCode(qrCodeContent);
        
        return event;
    }
    
    /**
     * 用户通过二维码签到
     */
    public QrCheckIn checkIn(String qrCodeContent, Long userId, String ipAddress, String deviceInfo) {
        // 验证二维码
        if (!qrCodeService.validateQrCode(qrCodeContent)) {
            throw new RuntimeException("Invalid QR code");
        }
        
        // 解析二维码内容
        String[] parts = qrCodeContent.split(":");
        Long eventId = Long.parseLong(parts[0]);
        
        // 验证活动和用户
        CheckInEvent event = eventMapper.selectById(eventId);
        if (event == null) {
            throw new RuntimeException("Event not found");
        }
        
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // 检查活动是否在有效期内
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getStartTime()) || now.isAfter(event.getEndTime())) {
            throw new RuntimeException("Event is not active");
        }
        
        // 检查用户是否已经签到
        if (qrCheckInMapper.existsByEventIdAndUserId(eventId, userId) > 0) {
            throw new RuntimeException("User already checked in for this event");
        }
        
        // 创建签到记录
        QrCheckIn checkIn = new QrCheckIn();
        checkIn.setEventId(eventId);
        checkIn.setUserId(userId);
        checkIn.setCheckInTime(now);
        checkIn.setQrCodeToken(qrCodeContent);
        checkIn.setIpAddress(ipAddress);
        checkIn.setDeviceInfo(deviceInfo);
        
        qrCheckInMapper.insert(checkIn);
        return checkIn;
    }
    
    /**
     * 获取活动签到列表
     */
    public List<QrCheckIn> getEventCheckIns(Long eventId) {
        return qrCheckInMapper.findByEventIdOrderByCheckInTimeDesc(eventId);
    }
    
    /**
     * 获取用户签到历史
     */
    public List<QrCheckIn> getUserCheckIns(Long userId) {
        return qrCheckInMapper.findByUserIdOrderByCheckInTimeDesc(userId);
    }
    
    /**
     * 获取活动签到统计
     */
    public Map<String, Object> getEventStatistics(Long eventId) {
        CheckInEvent event = eventMapper.selectById(eventId);
        if (event == null) {
            throw new RuntimeException("Event not found");
        }
        
        long totalCheckIns = qrCheckInMapper.countByEventId(eventId);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("eventId", eventId);
        statistics.put("title", event.getTitle());
        statistics.put("startTime", event.getStartTime());
        statistics.put("endTime", event.getEndTime());
        statistics.put("totalCheckIns", totalCheckIns);
        
        return statistics;
    }
}
```

#### 控制器实现 ####

```java
@RestController
@RequestMapping("/api/qr-check-in")
public class QrCheckInController {
    
    @Autowired
    private QrCheckInService checkInService;
    
    @Autowired
    private QrCodeService qrCodeService;
    
    @PostMapping("/events")
    public ResponseEntity<CheckInEvent> createEvent(@RequestBody CheckInEvent event) {
        CheckInEvent createdEvent = checkInService.createEvent(event);
        return ResponseEntity.ok(createdEvent);
    }
    
    @GetMapping("/events/{eventId}")
    public ResponseEntity<CheckInEvent> getEvent(@PathVariable Long eventId) {
        CheckInEvent event = checkInService.getEventWithQrCode(eventId);
        return ResponseEntity.ok(event);
    }
    
    @GetMapping("/events/{eventId}/qrcode")
    public ResponseEntity<?> getEventQrCode(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "300") int width,
            @RequestParam(defaultValue = "300") int height) {
        
        try {
            CheckInEvent event = checkInService.getEventWithQrCode(eventId);
            byte[] qrCodeImage = qrCodeService.generateQrCodeImage(
                    event.getCurrentQrCode(), width, height);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCodeImage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody QrCheckInRequest request, 
                                     HttpServletRequest httpRequest) {
        try {
            String ipAddress = httpRequest.getRemoteAddr();
            
            QrCheckIn checkIn = checkInService.checkIn(
                    request.getQrCodeContent(),
                    request.getUserId(),
                    ipAddress,
                    request.getDeviceInfo()
            );
            
            return ResponseEntity.ok(checkIn);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/events/{eventId}/check-ins")
    public ResponseEntity<List<QrCheckIn>> getEventCheckIns(@PathVariable Long eventId) {
        List<QrCheckIn> checkIns = checkInService.getEventCheckIns(eventId);
        return ResponseEntity.ok(checkIns);
    }
    
    @GetMapping("/users/{userId}/check-ins")
    public ResponseEntity<List<QrCheckIn>> getUserCheckIns(@PathVariable Long userId) {
        List<QrCheckIn> checkIns = checkInService.getUserCheckIns(userId);
        return ResponseEntity.ok(checkIns);
    }
    
    @GetMapping("/events/{eventId}/statistics")
    public ResponseEntity<Map<String, Object>> getEventStatistics(@PathVariable Long eventId) {
        Map<String, Object> statistics = checkInService.getEventStatistics(eventId);
        return ResponseEntity.ok(statistics);
    }
}

@Data
public class QrCheckInRequest {
    private String qrCodeContent;
    private Long userId;
    private String deviceInfo;
}
```

### 优缺点分析 ###

优点：

- 签到过程简单快捷，用户体验好
- 适合集中式签到场景（会议、课程等）

缺点：

- 需要组织者提前设置签到活动
- 需要现场展示二维码（投影、打印等）
- 可能出现二维码被拍照传播的风险

### 适用场景 ###

- 会议、研讨会签到
- 课堂点名
- 活动入场签到
- 培训签到
- 需要现场确认的签到场景

## 六、各方案对比与选择指南 ##

### 功能对比 ###

|  功能特性   |      关系型数据库   |  Redis   |      Bitmap   |  地理位置   |      二维码   |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
|   实现复杂度   |      低   |  中   |      中   |  高   |      中   |
|   系统性能   |      中   |  高   |      极高   |  中   |      高   |
|   存储效率   |      中   |  高   |      极高   |  中   |      中   |
|   用户体验   |      中   |  高   |      高   |  中   |      高   |
|   开发成本   |      低   |  中   |      中   |  高   |      中   |
|   维护成本   |      低   |  中   |      低   |  高   |      中   |

### 适用场景对比 ###

|  方案   |  最佳适用场景   |      不适合场景   |
| :-----------: | :-----------: | :-----------: |
|     关系型数据库   |  中小型企业考勤、简单签到系统   |      高并发、大规模用户场景   |
|     Redis   |  高并发社区签到、连续签到奖励   |      需要复杂查询和报表统计   |
|     Bitmap   |  大规模用户的每日签到、连续签到统计   |      需要详细签到信息记录   |
|     地理位置   |  外勤人员打卡、实地活动签到   |      室内或GPS信号弱的环境   |
|     二维码   |  会议、课程、活动签到   |      远程办公、分散式签到   |

## 七、总结 ##

在实际应用中，可以根据具体需求、用户规模、安全要求和预算等因素选择最合适的方案，也可以将多种方案结合使用，构建更加完善的签到打卡系统。
