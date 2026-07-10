---
lastUpdated: true
commentabled: true
recommended: true
title: MyBatis-Flex 与 MyBatis-Plus 的逐项对比
description: MyBatis-Flex 与 MyBatis-Plus 的逐项对比
date: 2026-07-03 08:25:00
pageClass: blog-page-class
cover: /covers/java.svg
---

社区里好多程序员在讨论MyBatis-Flex，说它轻量、快、设计优雅。好奇心驱动，下载了源码，搭建了一个demo工程，认认真真学了一遍。过程中发现它和MyBatis-Plus的设计思路差异不小，记录下来做个对比。

这篇文章不评价谁好谁差，只是从源码和实际代码两个层面，看看这两个框架到底有什么不同。

> demo工程用的订单表和订单明细表。

## 同一张订单表，两种写法

先来段最简单的代码：对同一张表，两个框架的代码长什么样。

### 实体类

MyBatis-Flex的实体类用`@Table`和`@Id`注解：

```java
@Table("order")
@Data
public class Order {
    @Id(keyType = KeyType.Auto)
    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalAmount;
    private Integer status;
    private LocalDateTime createTime;
}
```

MyBatis-Plus的写法大家应该都很熟悉了，`@TableName`和`@TableId`：

```Java
@TableName("order")
@Data
public class Order {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalAmount;
    private Integer status;
    private LocalDateTime createTime;
}
```

注解名不同，但做的事情一样。真正的差异在查询条件的构建方式上。

### 条件查询

查某个用户的所有已支付订单，按创建时间倒序。

MyBatis-Plus用LambdaQueryWrapper：

```Java
LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(Order::getUserId, userId)
    .eq(Order::getStatus, 1)
    .orderByDesc(Order::getCreateTime);
List<Order> orders = orderMapper.selectList(wrapper);
```

MyBatis-Flex用QueryWrapper，但条件构建方式完全不同：

```Java
QueryWrapper query = QueryWrapper.create()
    .where(ORDER.USER_ID.eq(userId))
    .and(ORDER.STATUS.eq(1))
    .orderBy(ORDER.CREATE_TIME.desc());
List<Order> orders = orderMapper.selectListByQuery(query);
```

注意这里的 `ORDER` 不是字符串，是一个编译期自动生成的类。`ORDER.USER_ID`、`ORDER.STATUS`都是这个类里的常量字段。写错了字段名，编译直接报错，不需要等到运行时才发现。

这个`ORDER`类是怎么来的？后面讲架构差异的时候会详细说。

### 分页查询

MyBatis-Plus的分页需要先配置拦截器，然后创建Page对象：

```Java
// 需要先配置 MybatisPlusInterceptor + PaginationInnerInterceptor
Page<Order> page = new Page<>(1, 10);
orderMapper.selectPage(page, wrapper);
```

MyBatis-Flex的分页是内建的，不需要配置拦截器，直接调`paginate()`：

```Java
Page<Order> page = orderMapper.paginate(1, 10, query);
```

看起来只是一个方法调用的区别，背后是两个框架在架构设计上的根本分歧。

## 架构上的根本差异

写法不同只是表象，在设计层面上看，它们生成SQL的方式是不同的。

### MyBatis-Plus：启动期注入

MyBatis-Plus在MyBatis启动阶段，通过`AbstractSqlInjector`为每个Mapper接口注入CRUD对应的MappedStatement。每个操作背后都有一个专门的类来负责拼SQL：Insert类负责插入，DeleteById类负责按ID删除，SelectList类负责列表查询，等等。

这些类都是AbstractMethod的子类。启动时，AbstractSqlInjector遍历所有注册的AbstractMethod，为每个Mapper逐个注入。

MyBatis-Plus是在MyBatis原有的XML解析机制之上做扩展。它把CRUD操作的SQL模板预编译好，注册到MyBatis的Configuration里，运行时直接拿来用。

这套机制的代价是：每个Mapper接口，不管你用不用，启动时都会注入一整套CRUD方法。

### MyBatis-Flex：Provider注解

MyBatis-Flex走了一条完全不同的路。它的BaseMapper上的方法，用的是MyBatis原生的`@SelectProvider`、`@InsertProvider`等注解，指向一个EntitySqlProvider类。SQL不是在启动时预生成的，而是在运行时由Provider动态拼出来的。

调用`orderMapper.selectOneById(1)`的时候，MyBatis会调用EntitySqlProvider里对应的方法，这个方法根据实体类的元数据（表名、字段、主键等）实时拼出一条SQL。

这种设计带来了MyBatis-Flex官网一直在强调的「三个轻」：

- 轻依赖：整个框架只依赖MyBatis，没有其他任何第三方依赖。

- 轻实现：没有拦截器。MyBatis-Plus的分页、租户、乐观锁等功能都是通过拦截器实现的，MyBatis-Flex把这些能力直接内建在core里，不走拦截器。

- 轻运行：没有SQL解析。MyBatis-Plus的拦截器在执行前会解析原始SQL（比如分页拦截器要解析SQL来生成count语句），MyBatis-Flex直接拼SQL，不需要解析。

### APT：编译期代码生成

前面条件查询里用到的ORDER类，不是手写的，是编译期自动生成的。

MyBatis-Flex用了一个叫APT（Annotation Processing Tool）的技术，和Lombok的原理类似。在mvn compile的时候，mybatis-flex-processor模块会扫描所有带`@Table`注解的实体类，自动生成两样东西：

- 一个是TableDef类（比如OrderTableDef），里面包含每个字段对应的QueryColumn常量。ORDER.USER_ID就是OrderTableDef里的一个QueryColumn，它知道这个字段对应哪张表的哪一列。
- 另一个是Mapper接口。如果项目里没有手写Mapper，APT会自动生成一个继承BaseMapper的接口。

这套机制的好处是：查询条件的构建是类型安全的。ORDER.USER_NAME（假设有这个字段）写错了字段名，IDE直接标红，编译都过不了。MyBatis-Plus的Lambda方式也能做到编译期检查，但它依赖实体类的getter方法，Flex这边不需要，直接引用字段常量就行。

不过这个设计也有代价：用MyBatis-Flex写查询，你得知道两个类——Order（实体）和ORDER（APT生成的TableDef）。新人刚接触的时候可能会懵：这个ORDER是哪来的？它在源码里看不到，是编译后才会出现的类。而用MyBatis-Plus，只需要知道Order一个类就够了，Order::getUserId这种方法引用很直观，不需要理解额外的生成机制。社区里讨论框架选型的时候，不少人提到MyBatis-Flex的学习曲线比Plus陡，APT生成的这些类就是原因之一。

那这个取舍值不值？Flex用「多一个类」换来的是：不依赖getter方法、支持多表join、QueryWrapper可序列化传输。这些都是Plus的Lambda方式做不到的。但如果你只是做单表CRUD，Plus的方式确实更简单直接。

> 感觉和 .NET 越来越像了。

## 多表查询：差异最大的地方

单表CRUD两个框架差别不大，真正与众不同的是多表查询。

假设要查询已支付订单及其明细，在MyBatis-Plus里，QueryWrapper不支持join，你得手写XML：

```XML
<select id="listWithDetail" resultType="Order">
    SELECT o.*, d.product_name, d.price, d.quantity
    FROM `order` o
    LEFT JOIN order_detail d ON o.id = d.order_id
    WHERE o.status = 1
</select>
```

Mapper接口里还得加一个对应的方法声明。代码量不多，但每个多表查询都得这么写一遍。

在MyBatis-Flex里，QueryWrapper直接支持leftJoin：

```Java
QueryWrapper query = QueryWrapper.create()
    .select()
    .from(ORDER)
    .leftJoin(ORDER_DETAIL).on(ORDER.ID.eq(ORDER_DETAIL.ORDER_ID))
    .where(ORDER.STATUS.eq(1));
List<Order> orders = orderMapper.selectListByQuery(query);
```

不需要写XML，不需要额外声明Mapper方法。join条件用的是编译期生成的QueryColumn，字段名写错了编译就报错。

这个差异在项目里影响很大。用过MyBatis-Plus的人都知道，稍微复杂一点的查询最终都得回到XML，QueryWrapper能覆盖的场景其实有限。MyBatis-Flex的QueryWrapper覆盖面更广，大多数场景都能在Java代码里完成。

## QueryWrapper的设计差异

两个框架的QueryWrapper虽然名字一样，但设计思路完全不同。

MyBatis-Plus的QueryWrapper是泛型的：`QueryWrapper<T>`。条件构建有两种方式：字符串字段名（`wrapper.eq("user_name", "sam")`）和Lambda方法引用（`wrapper.eq(User::getUserName, "sam")`）。字符串方式容易写错字段名，Lambda方式解决了这个问题，但要求实体类必须有对应的getter方法。

MyBatis-Flex的QueryWrapper不带泛型。条件通过APT生成的QueryColumn来构建，`ORDER.USER_NAME.eq("sam")`这种写法。字段引用是编译期常量，天然类型安全，不依赖实体类的getter方法。

还有一个容易忽略的差异：MyBatis-Flex的QueryWrapper支持序列化和RPC传输。在微服务架构下，一个服务构建的QueryWrapper可以通过RPC传给另一个服务执行。MyBatis-Plus的Wrapper内部持有Lambda表达式引用，不支持序列化传输。

另外MyBatis-Flex的QueryWrapper在遇到null值时会自动忽略该条件，不需要手动判断。MyBatis-Plus需要用`wrapper.eq(value != null, "column", value)`来处理动态条件。

## 部分字段更新

更新订单状态，只改status字段，其他字段不动。

MyBatis-Plus用UpdateWrapper的set方法显式指定要更新的字段：

```Java
UpdateWrapper<Order> wrapper = new UpdateWrapper<>();
wrapper.eq("id", orderId)
    .set("status", 2)
    .set("total_amount", new BigDecimal("0.00"));
orderMapper.update(null, wrapper);
```

MyBatis-Flex用UpdateEntity，只更新调了setter的字段：

```Java
Order order = UpdateEntity.of(Order.class, orderId);
order.setStatus(2);
order.setTotalAmount(new BigDecimal("0.00"));
orderMapper.update(order);
```

UpdateEntity创建的代理对象会记录每个setter调用，最终只把这些字段写进UPDATE语句。没调setter的字段，不管实体对象里的值是什么，都不会出现在SQL里。

这个设计还有一个很实用的好处：可以把某个字段从有值更新为null。在MyBatis-Plus里，updateById默认忽略null值，你传个null进去它不更新。想置空某个字段，就得额外再调一次update：

```Java
orderMapper.updateById(order);
// 想置空remark，还得再补一次
if (order.getRemark() == null) {
    orderMapper.update(null, new LambdaUpdateWrapper<Order>()
        .eq(Order::getId, order.getId())
        .set(Order::getRemark, null));
}
```

这种写法用过的应该都懂，不优雅但没办法。UpdateEntity就不存在这个问题，你调了`order.setRemark(null)`，它就给你更新为null，不需要二次操作。

## Db + Row：无实体类操作

这是MyBatis-Flex独有的能力，MyBatis-Plus没有。

Db是一个工具类，Row是HashMap的子类。两者配合，可以在没有实体类的情况下直接操作数据库：

```Java
Row row = new Row();
row.set("order_no", "ORD20250703002");
row.set("user_id", 1004L);
row.set("total_amount", new BigDecimal("66.00"));
row.set("status", 0);
Db.insert("`order`", row);
```

适合写临时脚本、做数据迁移、或者处理一些不固定的动态表结构。不需要为每张表都定义一个实体类。查询也行，用QueryWrapper构建条件，调Db.paginate()就完事了。

## 功能对比

整理了一张对比表，方便选型时参考：

| 对比维度           | MyBatis-Plus 3.x               | MyBatis-Flex                     |
| :----------------- | :----------------------------- | :------------------------------- |
| SQL生成方式        | 启动期注入MappedStatement      | 运行时Provider注解               |
| 拦截器             | 分页、租户等拦截器实现         | 没有拦截器                       |
| SQL解析            | 拦截器内解析原始SQL            | 不解析，直接拼SQL                |
| 第三方依赖         | core+extension+starter         | 只依赖MyBatis                    |
| 条件查询类型安全   | LambdaQueryWrapper（方法引用） | APT生成QueryColumn（编译期常量） |
| 条件为null时       | 需要手动判断                   | 自动忽略                         |
| 分页实现           | 拦截器（需额外配置）           | 内建在core                       |
| 多表查询           | 需要手写XML                    | QueryWrapper直接join             |
| QueryWrapper序列化 | 不支持                         | 支持RPC传输                      |
| 无实体类操作       | 不支持                         | Db + Row                         |
| 部分字段更新       | `UpdateWrapper.set()`          | `UpdateEntity.of()`              |
| 多主键/复合主键    | 不支持                         | 支持                             |
| 数据脱敏/字段加密  | 收费功能                       | 免费                             |
| 生态和社区         | 成熟，文档丰富，用户多         | 较新，社区较小                   |
| 学习成本           | 低，上手快                     | 需要理解APT                      |

## 小结

两个框架不是谁替代谁的关系，设计取向不同。

MyBatis-Plus走的是「在MyBatis之上尽可能多扩展」的路线。功能全，拦截器机制让它的扩展点很多，生态也成熟。文档多，遇到问题搜一下基本都能找到答案。代价是体积不小，拦截器和SQL解析带来额外的复杂度，多表查询最终还是要回到XML。

MyBatis-Flex走的是「极简轻量」的路线。没有拦截器、没有SQL解析、零第三方依赖，QueryWrapper直接支持多表join，APT生成类型安全的查询条件。这些设计在工程上确实干净。代价是生态薄，社区小，遇到问题能查的资料不多。

老项目用着MyBatis-Plus没必要换，生态成熟这个优势不是技术层面能衡量的。新项目如果团队愿意花点时间熟悉，MyBatis-Flex值得试试，尤其是多表查询多的场景，能少写不少XML。

## 关于 APT 对 UUID 的支持

### 实体类

```java
package net.cmono.papers.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import lombok.Data;
import net.cmono.papers.id.UUIDTypeHandler;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BaseEntity {

    @Id(keyType = KeyType.Generator, value = "uuidV7")
    @Column(value = "id", typeHandler = UUIDTypeHandler.class)
    private UUID id;

    @Column(isLogicDelete = true)
    private Boolean deleted;

    @Column(onUpdateValue = "version + 1")
    private Long version;

    @Column(onInsertValue = "now()")
    private LocalDateTime createdAt;

    @Column(onUpdateValue = "now()")
    private LocalDateTime updatedAt;

    // 新增：创建人
    private UUID createdBy;

    // 新增：更新人
    private UUID updatedBy;
}

```

### BaseTypeHandler

```java
package net.cmono.papers.id;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

@MappedTypes(UUID.class)
public class UUIDTypeHandler extends BaseTypeHandler<UUID> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, UUID parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.toString());
    }

    @Override
    public UUID getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String s = rs.getString(columnName);
        return s == null ? null : UUID.fromString(s);
    }

    @Override
    public UUID getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String s = rs.getString(columnIndex);
        return s == null ? null : UUID.fromString(s);
    }

    @Override
    public UUID getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String s = cs.getString(columnIndex);
        return s == null ? null : UUID.fromString(s);
    }
}
```
