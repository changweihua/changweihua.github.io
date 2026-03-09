---
lastUpdated: true
commentabled: true
recommended: true
title: MyBatis Plus 的实用技巧
description: 从业务场景到代码实现
date: 2026-03-09 11:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、前言 ##

作为一名有多年 Java 后端开发经验的工程师，我经历了从原始 JDBC 到 Hibernate，再到 MyBatis 的演进。而在 MyBatis 的基础上，MyBatis Plus（MP） 的出现无疑大大提升了我们的开发效率，尤其是在中后台管理系统、BFF 层接口、快速迭代项目中表现尤为突出。

本文将基于几个真实的业务场景，分享我在使用 MyBatis Plus 过程中的一些实用技巧，包括查询优化、批量操作、代码规范、分页、分表等内容，结合代码进行逐一解析。

## 二、业务场景一：动态查询构建太复杂？ ##

### 背景 ###

在实际业务中，如订单查询接口，前端会传递多个条件：订单号、客户名、下单时间范围、状态等。传统 MyBatis 里 XML 动态 SQL 写起来冗长、难维护、易出错。

### 解决方案：使用 QueryWrapper 构建动态查询条件 ###

```java
QueryWrapper<Order> wrapper = new QueryWrapper<>();
wrapper.eq(StringUtils.isNotBlank(query.getOrderNo()), "order_no", query.getOrderNo())
       .like(StringUtils.isNotBlank(query.getCustomerName()), "customer_name", query.getCustomerName())
       .ge(query.getStartTime() != null, "create_time", query.getStartTime())
       .le(query.getEndTime() != null, "create_time", query.getEndTime())
       .eq(query.getStatus() != null, "status", query.getStatus());
```

### 优点 ###

- 代码更清晰，条件判断集中处理
- 避免 XML 动态 SQL 的拼写错误
- 易于维护和扩展

## 三、业务场景二：分页查询性能瓶颈 ##

### 背景 ###

在订单列表分页接口中，记录数过大，导致分页查询性能下降。

### 解决方案 ###

- 使用 MP 的分页插件
- 优化 SQL：避免 `select *`，只查必要字段
- 索引优化

### 示例代码 ###

```java
Page<Order> page = new Page<>(query.getPageNo(), query.getPageSize());
IPage<OrderVO> result = orderMapper.selectPage(page, wrapper);
```

#### 配置分页插件（Spring Boot） ####

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

## 四、业务场景三：批量插入/更新操作写起来繁琐？ ##

### 背景 ###

在导入 Excel 表时，需要将上千条记录导入数据库。传统做法是循环执行 `insert` 或 `update` 操作，效率极低。

### 解决方案：使用 MP 提供的批量操作方法 ###

```java
// 批量插入
orderService.saveBatch(orderList);

// 批量更新
orderService.updateBatchById(orderList);
```

### 注意事项 ###

- 默认每 1000 条提交一次，可以通过 `saveBatch(list, batchSize)` 设置
- 批量更新时需确保实体类包含主键

## 五、业务场景四：逻辑删除支持不一致？ ##

### 背景 ###

部分表支持逻辑删除（`is_deleted` 字段），部分表不支持。在查询时容易忘记加上 `is_deleted = 0` 条件。

### 解决方案：使用 MP 的逻辑删除插件 ###

配置实体类：

```java
@TableLogic
private Integer isDeleted;
```

全局配置：

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: isDeleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

### 效果 ###

MP 会自动在删除、查询时加上逻辑删除条件，无需手动维护。

## 六、业务场景五：多表查询怎么办？ ##

### 背景 ###
MyBatis Plus 不支持多表关联查询，但实际业务中又常常需要查询用户和订单的联表信息。

### 解决方案：使用自定义 SQL ###

```java
@Select("SELECT o.*, u.name AS user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = #{status}")
List<OrderDTO> selectOrderWithUserName(@Param("status") Integer status);
```

或使用 BaseMapper.xml 和 DTO 映射结合使用。

小技巧：

- 尽量将复杂 SQL 拆分成多个 VO/DTO 查询
- 不推荐使用 MP 做过于复杂的联表逻辑，保持职责清晰

## 七、总结与最佳实践 ##

|  场景   |    技巧  |   工具/方法  |
| :-----------: | :-----------: | :-----------: |
| 多条件查询 | 动态 QueryWrapper | `eq/like/ge/le` |
| 分页优化 | 分页插件 + 索引 | `selectPage()` |
| 批量操作 | `saveBatch` / `updateBatchById` | 自动分批提交 |
| 逻辑删除 | 注解 + 全局配置 | `@TableLogic` |
| 多表查询 | 自定义 SQL + DTO | `@Select` + 手动映射 |

### 最佳实践建议 ###

- 统一封装 Wrapper 构建器：减少重复代码
- 合理使用 BaseMapper，自定义复杂 SQL 放到 Mapper.xml
- 注重 SQL 语句的性能优化，避免 ORM 成为瓶颈
- 配合 Lombok、MapStruct 提高开发效率

## 八、结语 ##

MyBatis Plus 是一把好刀，用得好可以显著提升开发效率；但也要注意它的边界与短板。作为一名有多年开发经验的工程师，我们更应关注其背后的思想：如何通过规范化、组件化、工具化的方式提升系统的可维护性和开发效率。
