---
lastUpdated: true
commentabled: true
recommended: true
title: MyBatis-Plus LambdaQueryWrapper实战
description: 告别手写SQL
date: 2026-11-25 10:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

## 背景 ##

做Java后端的应该都用过 `MyBatis-Plus`，但很多人还是习惯写 `XML` 或者用 `QueryWrapper` 拼字符串。字符串拼字段名有个问题：字段名写错了编译器不报错，重构时IDE也不会帮你改，只能等单元测试或者线上报错才能发现。

`LambdaQueryWrapper` 解决了这个问题。它用 Java 的 `Lambda`表达式引用字段，编译期就能检查字段名是否正确。用了一年多，分享一些高频用法和踩坑经验。

## 基础用法 ##

假设有个用户表：

```java
@Data
@TableName("sys_user")
public class User {
    private Long id;
    private String username;
    private String email;
    private Integer status;    // 0禁用 1启用
    private Long deptId;
    private LocalDateTime createTime;
}
```

### 等值查询 ###

```java
// 老写法：字符串拼字段
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("username", username);  // 写错不报错
​
// Lambda写法：编译期检查
LambdaQueryWrapper<User> lambda = new LambdaQueryWrapper<>();
lambda.eq(User::getUsername, username);  // 字段名错了编译直接红
```

### 多条件组合 ###

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getStatus, 1)
       .like(User::getUsername, keyword)
       .ge(User::getCreateTime, startTime)
       .le(User::getCreateTime, endTime)
       .orderByDesc(User::getCreateTime);
​
List<User> users = userMapper.selectList(wrapper);
```

### 条件动态拼接 ###

这是业务代码里最常见的场景——前端传了哪些参数就拼哪些条件：

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getStatus, 1)
       .eq(StrUtil.isNotBlank(dto.getEmail()), User::getEmail, dto.getEmail())
       .like(StrUtil.isNotBlank(dto.getUsername()), User::getUsername, dto.getUsername())
       .eq(dto.getDeptId() != null, User::getDeptId, dto.getDeptId())
       .ge(dto.getStartTime() != null, User::getCreateTime, dto.getStartTime())
       .le(dto.getEndTime() != null, User::getCreateTime, dto.getEndTime());
```

`eq(condition, field, value)` 第一个参数是布尔条件，为 `false` 时自动跳过这个条件。不用写一堆 `if-else`，一个链式调用搞定。

### IN 查询 + 分页 ###

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.in(CollectionUtil.isNotEmpty(deptIds), User::getDeptId, deptIds)
       .eq(User::getStatus, 1);
​
Page<User> page = new Page<>(pageNum, pageSize);
userMapper.selectPage(page, wrapper);
```

### 只查部分字段 ###

有时候不需要查全部字段，用 `select` 指定：

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.select(User::getId, User::getUsername, User::getEmail)
       .eq(User::getDeptId, deptId);
​
List<User> users = userMapper.selectList(wrapper);
```

### 子查询 ###

```java
// 查有审批记录的用户
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.inSql(User::getId, "SELECT DISTINCT user_id FROM approval_record WHERE status = 'pending'");
```

## 复杂条件：AND/OR嵌套 ##

真实业务里经常遇到这种需求："查询（部门A 且 状态启用）或（部门B 且 角色为管理员）的用户"。Lambda写法：

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.and(w -> w.eq(User::getDeptId, 1L).eq(User::getStatus, 1))
       .or(w -> w.eq(User::getDeptId, 2L).eq(User::getRole, "ADMIN"));
```

生成的SQL：

```sql
SELECT * FROM sys_user
WHERE (dept_id = 1 AND status = 1)
   OR (dept_id = 2 AND role = 'ADMIN')
```

## 分组和聚合 ##

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.select(User::getDeptId, User::getStatus)
       .groupBy(User::getDeptId, User::getStatus)
       .having("COUNT(*) > {0}", 5);
```

## 踩过的两个坑 ##

### updateById 只更新非null字段 ###

这个坑前面文章也提过。MyBatis-Plus默认策略是 `FieldStrategy.NOT_NULL`，null字段不更新。如果你创建了一个只含两个字段的Entity去调 `updateById`，其他字段不会被更新——因为null被跳过了。

解决方案：

```java
@TableField(updateStrategy = FieldStrategy.ALWAYS)
private Integer status;
```

或者用 `LambdaUpdateWrapper` 明确指定：

```java
LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
updateWrapper.set(User::getStatus, 0)
             .eq(User::getId, userId);
userMapper.update(null, updateWrapper);
```

推荐后者，语义更明确。

### like 默认不加百分号 ###

`like` 方法不会自动加 `%`，如果不手动加就是精确匹配：

```java
// 错误：相当于 = 'xxx'
wrapper.like(User::getUsername, keyword);
​
// 正确：模糊匹配
wrapper.like(User::getUsername, "%" + keyword + "%");
```

用 Hutool 的 `StrUtil.format("%{}%", keyword)` 更简洁。

## 什么时候不用Lambda ##

- 复杂关联查询：多表 JOIN、复杂子查询，直接用 XML 写 SQL，Lambda 不适合
- 动态排序：orderBy 的字段来自前端传参时，只能用字符串
- 原生函数：聚合、窗口函数等 Lambda 不支持

## 总结 ##

LambdaQueryWrapper 的三个核心优势：

- 编译期检查 — 字段名写错直接红，不怕重构
- 代码可读性好 — `User::getUsername` 比 `"username"` 直观
- 条件动态拼接 — `eq(condition, field, value)` 一行搞定，告别 `if-else`

日常开发中 80% 的查询用它就够了，剩下 20% 复杂场景老老实实写 XML。
