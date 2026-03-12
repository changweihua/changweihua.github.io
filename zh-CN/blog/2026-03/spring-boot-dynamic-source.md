---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot + MyBatis Plus + Druid 实现多数据源读写分离完整案例
description: SpringBoot + MyBatis Plus + Druid 实现多数据源读写分离完整案例
date: 2026-03-11 09:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

本文将详细介绍两种实现多数据源读写分离的方式：使用 dynamic-datasource 框架和基于 AbstractRoutingDataSource 的自定义实现。

## 方式一：使用 dynamic-datasource 框架（推荐） ##

### Maven 依赖配置 ###

```xml
<dependencies>
    <!-- Spring Boot 核心 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.4.3.4</version>
    </dependency>
    
    <!-- Druid 连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.1.18</version>
    </dependency>
    
    <!-- 多数据源框架 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
        <version>2.4.2</version>
    </dependency>
    
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

### application.yml 配置 ###

```yaml
spring:
  datasource:
    dynamic:
      # 设置默认的数据源或者数据源组，默认值即为 master
      primary: master
      # 严格匹配数据源，默认 false
      # 为 true 时未匹配到指定数据源会抛出异常，为 false 时则使用默认数据源
      strict: false
      datasource:
        # 主库配置（写操作）
        master:
          url: jdbc:mysql://localhost:3306/master_db?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false
          username: root
          password: root
          driver-class-name: com.mysql.cj.jdbc.Driver
          # Druid 连接池配置
          druid:
            initial-size: 5
            max-active: 20
            min-idle: 5
            max-wait: 60000
            time-between-eviction-runs-millis: 60000
            min-evictable-idle-time-millis: 300000
            validation-query: SELECT 1 FROM DUAL
            test-while-idle: true
            test-on-borrow: false
            test-on-return: false
        # 从库1配置（读操作）
        slave1:
          url: jdbc:mysql://localhost:3306/slave1_db?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false
          username: root
          password: root
          driver-class-name: com.mysql.cj.jdbc.Driver
          druid:
            initial-size: 5
            max-active: 20
            min-idle: 5
        # 从库2配置（读操作）
        slave2:
          url: jdbc:mysql://localhost:3306/slave2_db?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false
          username: root
          password: root
          driver-class-name: com.mysql.cj.jdbc.Driver
          druid:
            initial-size: 5
            max-active: 20
            min-idle: 5

# MyBatis-Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.example.entity
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 使用方式 ###

#### 注解方式切换数据源 ####

```java
import com.baomidou.dynamic.datasource.annotation.DS;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    // 默认使用主库（写操作）
    @Override
    public boolean saveUser(User user) {
        return userMapper.insert(user) > 0;
    }
    
    // 手动指定使用从库（读操作）
    @DS("slave1")
    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
    
    // 指定使用另一个从库
    @DS("slave2")
    @Override
    public List<User> listAllUsers() {
        return userMapper.selectList(null);
    }
}
```

#### 启动类配置 ####

```java
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.mapper")
public class ReadWriteSplitApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ReadWriteSplitApplication.class, args);
    }
}
```

## 方式二：基于 AbstractRoutingDataSource 自定义实现 ##

### Maven 依赖配置 ###

```xml
<dependencies>
    <!-- Spring Boot 核心 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- AOP 支持 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
    
    <!-- MyBatis Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.4.3.4</version>
    </dependency>
    
    <!-- Druid 连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.1.18</version>
    </dependency>
    
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

### 实现数据源路由 ###

#### 数据源类型枚举 ####

```java
public enum DataSourceType {
    MASTER, SLAVE
}
```

#### 数据源上下文管理 ####

```java
public class DataSourceContextHolder {
    
    private static final ThreadLocal<DataSourceType> CONTEXT_HOLDER = new ThreadLocal<>();
    
    /**
     * 设置数据源类型
     */
    public static void setDataSourceType(DataSourceType dataSourceType) {
        CONTEXT_HOLDER.set(dataSourceType);
    }
    
    /**
     * 获取数据源类型
     */
    public static DataSourceType getDataSourceType() {
        return CONTEXT_HOLDER.get() == null ? DataSourceType.MASTER : CONTEXT_HOLDER.get();
    }
    
    /**
     * 清除数据源类型
     */
    public static void clearDataSourceType() {
        CONTEXT_HOLDER.remove();
    }
}
```

#### 动态数据源实现 ####

```java
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class DynamicDataSource extends AbstractRoutingDataSource {
    
    /**
     * 确定当前使用的数据源
     */
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDataSourceType();
    }
}
```

### 数据源配置类 ###

```java
import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {
    
    /**
     * 配置主数据源
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.master")
    public DataSource masterDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    /**
     * 配置从数据源
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.slave")
    public DataSource slaveDataSource() {
        return DruidDataSourceBuilder.create().build();
    }
    
    /**
     * 配置动态数据源，设置默认数据源为主库
     */
    @Bean
    @Primary
    public DataSource dynamicDataSource(DataSource masterDataSource, DataSource slaveDataSource) {
        DynamicDataSource dynamicDataSource = new DynamicDataSource();
        
        // 设置数据源映射
        Map<Object, Object> dataSourceMap = new HashMap<>();
        dataSourceMap.put(DataSourceType.MASTER, masterDataSource);
        dataSourceMap.put(DataSourceType.SLAVE, slaveDataSource);
        dynamicDataSource.setTargetDataSources(dataSourceMap);
        
        // 设置默认数据源
        dynamicDataSource.setDefaultTargetDataSource(masterDataSource);
        
        return dynamicDataSource;
    }
}
```

### 自定义数据源切换注解 ###

```java
import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataSource {
    
    DataSourceType value() default DataSourceType.MASTER;
}
```

### AOP 实现数据源切换 ###

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class DataSourceAspect {
    
    // 切入点：拦截所有带有 @DataSource 注解的方法
    @Pointcut("@annotation(com.example.config.DataSource)")
    public void dataSourcePointCut() {}
    
    @Around("dataSourcePointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        
        // 获取方法上的 @DataSource 注解
        DataSource dataSource = method.getAnnotation(DataSource.class);
        if (dataSource != null) {
            // 设置数据源类型
            DataSourceContextHolder.setDataSourceType(dataSource.value());
        }
        
        try {
            // 执行方法
            return point.proceed();
        } finally {
            // 清除数据源类型
            DataSourceContextHolder.clearDataSourceType();
        }
    }
}
```

### 自动识别读写操作（可选） ###

```java
@Aspect
@Component
public class ReadWriteSplitAspect {
    
    // 切入点：拦截所有 mapper 接口方法
    @Pointcut("execution(* com.example.mapper.*.*(..))")
    public void dataSourcePointCut() {}
    
    @Around("dataSourcePointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        String methodName = method.getName();
        
        // 自动识别读写操作
        // 读操作方法：get、select、query、find、list
        // 写操作方法：insert、update、delete、save
        DataSourceType dataSourceType;
        if (methodName.startsWith("get") || methodName.startsWith("select") || 
            methodName.startsWith("query") || methodName.startsWith("find") || 
            methodName.startsWith("list")) {
            dataSourceType = DataSourceType.SLAVE;
        } else {
            dataSourceType = DataSourceType.MASTER;
        }
        
        // 设置数据源类型
        DataSourceContextHolder.setDataSourceType(dataSourceType);
        
        try {
            // 执行方法
            return point.proceed();
        } finally {
            // 清除数据源类型
            DataSourceContextHolder.clearDataSourceType();
        }
    }
}
```

### application.yml 配置 ###

```yaml
spring:
  datasource:
    # 主库配置
    master:
      url: jdbc:mysql://localhost:3306/master_db?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false
      username: root
      password: root
      driver-class-name: com.mysql.cj.jdbc.Driver
      # Druid 连接池配置
      initial-size: 5
      max-active: 20
      min-idle: 5
      max-wait: 60000
    # 从库配置
    slave:
      url: jdbc:mysql://localhost:3306/slave_db?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false
      username: root
      password: root
      driver-class-name: com.mysql.cj.jdbc.Driver
      initial-size: 5
      max-active: 20
      min-idle: 5

# MyBatis-Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.example.entity
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 使用方式 ###

```java
@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    // 默认使用主库（写操作）
    @Override
    public boolean saveUser(User user) {
        return userMapper.insert(user) > 0;
    }
    
    // 手动指定使用从库（读操作）
    @DataSource(DataSourceType.SLAVE)
    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
    
    // 如果配置了自动识别读写操作，也可以不使用注解
    @Override
    public List<User> listAllUsers() {
        return userMapper.selectList(null);
    }
}
```

## 三、多主多从架构实现 ##

如果需要实现多主多从架构，可以参考以下配置（基于 dynamic-datasource 框架）：

```yaml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        # 主库1
        master1:
          url: jdbc:mysql://master1:3306/db?serverTimezone=GMT%2B8
          username: root
          password: root
        # 主库2
        master2:
          url: jdbc:mysql://master2:3306/db?serverTimezone=GMT%2B8
          username: root
          password: root
        # 从库1
        slave1:
          url: jdbc:mysql://slave1:3306/db?serverTimezone=GMT%2B8
          username: root
          password: root
        # 从库2
        slave2:
          url: jdbc:mysql://slave2:3306/db?serverTimezone=GMT%2B8
          username: root
          password: root
      # 配置读写分离规则
      group:
        master: master1,master2
        slave: slave1,slave2
      # 配置负载均衡策略（轮询）
      strategy:
        slave: round_robin
```

使用时指定分组即可：

```java
@DS("master") // 使用主库组（负载均衡）
public void saveUser(User user) {
    userMapper.insert(user);
}

@DS("slave") // 使用从库组（负载均衡）
public List<User> listUsers() {
    return userMapper.selectList(null);
}
```

## 四、常见问题与解决方案 ##

### 事务一致性问题 ###

在使用多数据源时，需要确保事务内的操作使用同一个数据源：

```java
@Service
public class UserServiceImpl {
    
    @Transactional
    @Override
    public void updateUser(User user) {
        // 同一事务内的所有操作都会使用相同的数据源
        userMapper.updateById(user);
        logService.saveLog(new Log("更新用户"));
    }
}
```

### 动态数据源切换不生效 ###

- 检查 @DS 注解是否正确添加
- 确保 AOP 切面正确配置
- 检查 ThreadLocal 是否正确清理

### 数据源连接池配置优化 ###

针对高并发场景，优化 Druid 连接池配置：

```yaml
spring:
  datasource:
    dynamic:
      datasource:
        master:
          druid:
            # 初始化时建立物理连接的个数
            initial-size: 10
            # 最大连接池数量
            max-active: 100
            # 最小连接池数量
            min-idle: 10
            # 获取连接时最大等待时间，单位毫秒
            max-wait: 60000
            # 连接有效性检测
            validation-query: SELECT 1 FROM DUAL
            test-while-idle: true
            test-on-borrow: false
            test-on-return: false
            # 配置监控统计拦截的filters
            filters: stat,wall,log4j
```

### 数据库主从复制延迟 ###

针对主从复制延迟问题，可以：

- 对于实时性要求高的数据读取，强制走主库
- 使用 @DS("master") 注解标记需要实时数据的查询方法

## 五、总结 ##

本文介绍了两种实现 SpringBoot + MyBatis Plus + Druid 多数据源读写分离的方式：

- 使用 dynamic-datasource 框架：

  - 优点：配置简单，功能强大，支持分组、负载均衡等高级特性
  - 缺点：引入额外依赖

- 自定义 AbstractRoutingDataSource 实现：

  - 优点：灵活度高，可以完全控制数据源切换逻辑
  - 缺点：需要编写更多代码，维护成本较高

根据实际项目需求选择合适的实现方式，对于大多数场景，推荐使用 dynamic-datasource 框架，开发效率更高。对于有特殊需求的场景，可以考虑自定义实现方案。
