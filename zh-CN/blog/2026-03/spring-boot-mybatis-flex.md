---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot整合MyBatis-Flex保姆级教程
description: SpringBoot整合MyBatis-Flex保姆级教程
date: 2026-03-10 09:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、MyBatis-Flex 介绍 ##

MyBatis-Flex 是一个基于 MyBatis 的增强框架，它提供了比传统 MyBatis Plus 更加强大和灵活的功能特性。以下是其主要特点：

### 核心特性 ###

- 轻量级设计：框架非常轻量，依赖少，启动速度快
- 功能强大：提供丰富的查询API，支持多表关联查询、分页查询等
- 灵活的查询方式：支持 QueryWrapper、Lambda 表达式等多种查询方式
- 多数据库支持：兼容多种主流数据库（MySQL、PostgreSQL、Oracle等）
- 代码生成：内置高效的代码生成器

### 优势亮点 ###

- 无侵入性：对原有 MyBatis 几乎无侵入，迁移成本低
- 性能优越：查询性能经过优化，比传统 MyBatis 更高效
- 注解丰富：提供丰富的注解支持，简化配置
- 动态SQL：强大的动态 SQL 构建能力
- 多租户支持：内置多租户方案，开箱即用

## 二、SpringBoot 整合 MyBatis-Flex 详细步骤 ##

### 步骤1：创建 SpringBoot 项目并添加依赖 ###

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis-Flex SpringBoot Starter -->
    <dependency>
        <groupId>com.mybatis-flex</groupId>
        <artifactId>mybatis-flex-spring-boot4-starter</artifactId>
        <version>1.8.6</version>
    </dependency>
    
    <!-- 数据库驱动 (以MySQL为例) -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- Lombok (可选) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- 代码生成器 (可选) -->
    <dependency>
        <groupId>com.mybatis-flex</groupId>
        <artifactId>mybatis-flex-codegen</artifactId>
        <version>1.8.6</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

### 步骤2：配置 application.yml ###

```yaml
# application.yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mybatis_flex_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456

mybatis-flex:
  # 配置 Mapper 扫描路径
  mapper-locations: classpath*:/mapper/**/*Mapper.xml
  # 全局配置
  configuration:
    # 下划线转驼峰
    map-underscore-to-camel-case: true
    # 日志实现
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  # 多数据源配置（可选）
  datasource:
    master:
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/master_db
      username: root
      password: 123456
    slave:
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/slave_db
      username: root
      password: 123456
```

### 步骤3：创建实体类 ###

```java
package com.example.demo.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
@Table("tb_user")  // 指定表名
public class User {
    
    @Id(keyType = KeyType.Auto)  // 主键，自动增长
    private Long id;
    
    private String username;
    
    private String email;
    
    private Integer age;
    
    private Integer status;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
    
    // 逻辑删除注解
    @com.mybatisflex.annotation.Column(isLogicDelete = true)
    private Boolean deleted;
}
```

### 步骤4：创建 Mapper 接口 ###

```java
package com.example.demo.mapper;

import com.mybatisflex.core.BaseMapper;
import com.example.demo.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 可以在此定义自定义的查询方法
    // 复杂的查询建议使用 QueryWrapper 或 Db + Row
    
    /**
     * 自定义查询方法示例
     */
    User selectByUsername(String username);
}
```

对应的 XML 映射文件（如果需要）：

```xml
<!-- src/main/resources/mapper/UserMapper.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.UserMapper">
    
    <select id="selectByUsername" resultType="com.example.demo.entity.User">
        SELECT * FROM tb_user WHERE username = #{username}
    </select>
    
</mapper>
```

### 步骤5：创建 Service 层 ###

```java
package com.example.demo.service;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import com.example.demo.entity.User;

public interface UserService extends IService<User> {
    
    User getByUsername(String username);
    
    boolean updateEmailById(Long id, String email);
}
```

```java
package com.example.demo.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.impl.ServiceImpl;
import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    @Override
    public User getByUsername(String username) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(User.class)
                .where(User::getUsername).eq(username);
        return mapper.selectOneByQuery(queryWrapper);
    }
    
    @Override
    public boolean updateEmailById(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return this.updateById(user);
    }
}
```

### 步骤6：创建 Controller ###

```java
package com.example.demo.controller;

import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 根据ID查询用户
     */
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getById(id);
    }
    
    /**
     * 分页查询用户
     */
    @GetMapping("/page")
    public Page<User> page(@RequestParam(defaultValue = "1") int pageNumber,
                           @RequestParam(defaultValue = "10") int pageSize) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(User.class)
                .where(User::getAge).ge(18)
                .orderBy(User::getCreateTime, false);
        
        return userService.page(new Page<>(pageNumber, pageSize), queryWrapper);
    }
    
    /**
     * 条件查询
     */
    @GetMapping("/list")
    public List<User> list(@RequestParam(required = false) String username,
                           @RequestParam(required = false) Integer minAge) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(User.class);
        
        if (username != null) {
            queryWrapper.and(User::getUsername).like(username);
        }
        
        if (minAge != null) {
            queryWrapper.and(User::getAge).ge(minAge);
        }
        
        return userService.list(queryWrapper);
    }
    
    /**
     * 新增用户
     */
    @PostMapping
    public boolean save(@RequestBody User user) {
        return userService.save(user);
    }
    
    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public boolean update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.updateById(user);
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return userService.removeById(id);
    }
}
```

### 步骤7：使用代码生成器（可选） ###

```java
package com.example.demo;

import com.mybatisflex.codegen.Generator;
import com.mybatisflex.codegen.config.GlobalConfig;
import com.zaxxer.hikari.HikariDataSource;

public class CodeGenerator {
    
    public static void main(String[] args) {
        // 配置数据源
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/mybatis_flex_db");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");
        
        // 创建配置内容
        GlobalConfig globalConfig = new GlobalConfig();
        
        // 设置根包
        globalConfig.setBasePackage("com.example.demo");
        
        // 设置表前缀和只生成哪些表
        globalConfig.setTablePrefix("tb_");
        globalConfig.setGenerateTable("tb_user", "tb_order", "tb_product");
        
        // 设置生成实体类的路径
        globalConfig.setEntitySourceDir("src/main/java/com/example/demo/entity");
        
        // 设置生成Mapper类的路径
        globalConfig.setMapperSourceDir("src/main/java/com/example/demo/mapper");
        
        // 设置生成Service类的路径
        globalConfig.setServiceSourceDir("src/main/java/com/example/demo/service");
        
        // 设置生成ServiceImpl类的路径
        globalConfig.setServiceImplSourceDir("src/main/java/com/example/demo/service/impl");
        
        // 设置生成Controller类的路径
        globalConfig.setControllerSourceDir("src/main/java/com/example/demo/controller");
        
        // 通过 datasource 和 globalConfig 创建代码生成器
        Generator generator = new Generator(dataSource, globalConfig);
        
        // 生成代码
        generator.generate();
    }
}
```

### 步骤8：高级查询示例 ###

```java
package com.example.demo.service.impl;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.row.Db;
import com.mybatisflex.core.row.Row;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdvancedQueryService {
    
    /**
     * 复杂条件查询示例
     */
    public void complexQuery() {
        // 使用 QueryWrapper 构建复杂查询
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(User.ID, User.USERNAME, User.EMAIL)
                .from(User.class)
                .where(User.AGE.between(18, 60))
                .and(User.STATUS.eq(1))
                .and(User.USERNAME.like("张%"))
                .orderBy(User.CREATE_TIME.desc())
                .limit(10);
        
        // 使用 Db 执行原生SQL
        List<Row> rows = Db.selectListBySql(
                "SELECT u.*, o.order_count FROM tb_user u " +
                "LEFT JOIN (SELECT user_id, COUNT(*) as order_count FROM tb_order GROUP BY user_id) o " +
                "ON u.id = o.user_id " +
                "WHERE u.status = ?", 1);
    }
    
    /**
     * 关联查询示例
     */
    public void joinQuery() {
        QueryWrapper query = QueryWrapper.create()
                .select()
                .from(User.class).as("u")
                .leftJoin("tb_order").as("o").on("u.id = o.user_id")
                .where("u.status = ?", 1);
    }
}
```

### 步骤9：事务管理 ###

```java
package com.example.demo.service.impl;

import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 声明式事务管理
     */
    @Transactional(rollbackFor = Exception.class)
    public void transactionalOperation(User user1, User user2) {
        // 插入第一个用户
        userMapper.insert(user1);
        
        // 模拟业务逻辑
        if (user1.getAge() < 0) {
            throw new RuntimeException("年龄不能为负数");
        }
        
        // 插入第二个用户
        userMapper.insert(user2);
    }
}
```

## 三、配置类示例 ##

```java
package com.example.demo.config;

import com.mybatisflex.core.audit.AuditManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class MyBatisFlexConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(MyBatisFlexConfig.class);
    
    @PostConstruct
    public void init() {
        // 开启审计功能
        AuditManager.setAuditEnable(true);
        
        // 设置 SQL 审计收集器
        AuditManager.setMessageCollector(auditMessage -> {
            logger.info("执行 SQL: {}", auditMessage.getFullSql());
            logger.info("执行参数: {}", auditMessage.getQueryParams());
            logger.info("执行耗时: {}ms", auditMessage.getElapsedTime());
        });
    }
}
```

## 四、详细总结 ##

### 整合优势 ###

- 简化开发：MyBatis-Flex 提供了丰富的 API，大大减少了样板代码
- 灵活查询：QueryWrapper 和 Lambda 表达式让查询条件构建更加灵活
- 性能优越：框架经过优化，执行效率高
- 易于扩展：良好的扩展性，可以方便地添加自定义功能

### 使用建议 ###

- 简单CRUD：直接使用 BaseMapper 和 IService 提供的基础方法
- 复杂查询：优先使用 QueryWrapper，复杂的关联查询可使用原生 SQL
- 分页查询：使用内置的 Page 类，支持多种数据库的分页语法
- 事务管理：使用 Spring 的 @Transactional 注解管理事务

### 注意事项 ###

- 实体类需要正确使用注解标记主键、表名等
- 多数据源配置时注意事务管理器的配置
逻辑删除字段需要在配置中指定
生产环境建议关闭 SQL 日志输出

### 最佳实践 ###

- 使用代码生成器提高开发效率
- 复杂业务逻辑在 Service 层处理
- 合理使用缓存提升性能
- 定期监控 SQL 执行效率

### 常见问题解决 ###

- 问题1：字段名与数据库列名映射不正确

- 解决：检查 @Column 注解或配置 map-underscore-to-camel-case


- 问题2：分页查询异常

- 解决：检查数据库方言配置，确保使用正确的分页语法


- 问题3：事务不回滚

- 解决：确保 @Transactional 注解正确使用，异常被正确捕获

MyBatis-Flex 作为一个现代化的 MyBatis 增强框架，在保持 MyBatis 灵活性的同时，提供了更多便捷的功能，特别适合需要复杂查询和高性能要求的项目。通过合理的配置和使用，可以大大提高开发效率和系统性能。
