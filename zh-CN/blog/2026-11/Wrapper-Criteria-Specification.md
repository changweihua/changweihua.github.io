---
lastUpdated: true
commentabled: true
recommended: true
title: Java 查询能不能写得好维护一点
description: Wrapper、Criteria、Specification
date: 2026-11-26 09:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

先交代背景。一个后台列表页，筛选条件是很常见的那种：

```sql
select * from user
where status = 1
  and (name like '%张%' or code = 'U001')
  and age between 18 and 35
order by create_time desc
```

四行 SQL，缩进就是逻辑，谁扫一眼都懂。然后我打开项目，用 Java 把同一件事再写一遍，写了三遍——因为项目里三个框架都在用。

之前写过一篇从 Wrapper 聊 MyBatis-Plus 复杂度演化的文章，那篇讲的是一条演化路径。这篇换个角度：为什么所有框架在"查询 DSL"这条路上，摔的跤都长得一模一样。

## 同一条查询，三副面孔 ##

### MyBatis-Plus Wrapper ###

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getStatus, 1)
       .and(w -> w.like(User::getName, "张").or().eq(User::getCode, "U001"))
       .between(User::getAge, 18, 35)
       .orderByDesc(User::getCreateTime);
List<User> users = userMapper.selectList(wrapper);
```


### JPA Criteria ###

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> cq = cb.createQuery(User.class);
Root<User> root = cq.from(User.class);

Predicate statusEq = cb.equal(root.get("status"), 1);
Predicate nameLike = cb.like(root.get("name"), "%张%");
Predicate codeEq = cb.equal(root.get("code"), "U001");
Predicate nameOrCode = cb.or(nameLike, codeEq);
Predicate ageBetween = cb.between(root.get("age"), 18, 35);

cq.select(root)
  .where(cb.and(statusEq, nameOrCode, ageBetween))
  .orderBy(cb.desc(root.get("create_time")));

List<User> users = em.createQuery(cq).getResultList();
```

### JPA Specification ###

```java
Specification<User> spec = (root, query, cb) -> {
    Predicate statusEq = cb.equal(root.get("status"), 1);
    Predicate nameOrCode = cb.or(
            cb.like(root.get("name"), "%张%"),
            cb.equal(root.get("code"), "U001"));
    Predicate ageBetween = cb.between(root.get("age"), 18, 35);
    return cb.and(statusEq, nameOrCode, ageBetween);
};
List<User> users = userRepository.findAll(spec);
```

说句公道话：三家都能写、能跑、类型大体安全，做到这一步不容易。Wrapper 最短，代价是 or 嵌套藏进 lambda；Criteria 最啰嗦，但每个 Predicate 有名字；Specification 把 Criteria 裹一层 lambda，顺手解决了复用——同一段 spec 能传给 `findAll`、`count`、分页。

设计者都尽力了。那问题出在哪？

## 它们其实在干同一件事：在 Java 里重建 WHERE ##

把三段代码的语法糖剥掉，剩下的东西一模一样：一棵拿 Java 拼出来的语法树。

```txt
                    and
          ┌───────┼────────┐
       status=1   or    between(18,35)
              ┌───┴───┐
          name like  code =
```

Criteria 最诚实，变量名直接叫 `Predicate`，你一行一行 new 出 SQL 的 AST，new 完自己组装。Wrapper 把这棵树藏进链式调用，`.and(w -> ...)` 里的 lambda 就是"开一个子节点"。Specification 是 Criteria 的 lambda 包装，换汤不换药。

看穿"都是 AST 构建器"这一点，几个老毛病就都能解释了。

### 毛病一：or 一出现，可读性断崖 ###

AND 是默认连接符，天生适合链式。OR 不一样，OR 是结构，要分组、要括号。而链式调用是一维的，`.a().b().c()` 一条直线，没给嵌套留位置，只能借 lambda 当括号使。

`where (a or b) and c`，SQL 里一眼的结构，到了 Java 变成 `.and(w -> w.like(...).or().eq(...))`。读代码的人得在脑子里跑一条规则：见到 lambda 就还原成括号。条件每多一层，脑子里的栈就深一层。我review代码时最怕的就是这种，别人写的时候爽，我读的时候像在做编译原理作业。

### 毛病二：类型安全管得住语法，管不住最要命的事 ###

`User::getName` 方法引用确实把字段钉死在编译期，重构改字段名会跟着走，这是实打实的好处。

但两个漏网之鱼。

`lt` 和 `gt` 写反了。`wrapper.lt(User::getAge, 18)` 和 `gt` 类型签名完全一样，编译器一声不吭，语义恰好相反。类型系统查"字段在不在、类型对不对"，查不了"逻辑对不对"。查询的 bug 十有八九是后者。

Criteria 的 `root.get("name")` 更是裸字符串。想真类型安全？上 JPA Metamodel，注解处理器生成静态元模型，又添一层基建。多数项目的选择是忍。然后某天 IDE 重构改个字段名，运行期才炸。

结论挺扫兴：类型安全只覆盖语法层。一段查询到底对不对，还是得靠人把它在脑子里还原回 SQL 再读一遍。既然每次都要还原，那一开始为什么不直接面对 SQL？

### 毛病三：真到复杂查询，三家殊途同归 ###

需求加一条：薪资高于本部门平均。

*Wrapper 的写法*：

```java
wrapper.apply("salary > (select avg(salary) from user where dept_id = {0})", deptId);
```

*Criteria 的写法（示意）*：

```java
Subquery<Double> sub = cq.subquery(Double.class);
Root<User> subRoot = sub.from(User.class);
sub.select(cb.avg(subRoot.get("salary")))
   .where(cb.equal(subRoot.get("dept_id"), root.get("deptId")));
cq.where(cb.gt(root.get("salary"), sub));
```

一个退化成字符串，一个膨胀成比 XML 还难读的构造代码。DSL 表达力一到边界，逃生舱全都指向同一个方向：更接近 SQL 的文本。这不是巧合。

## 根本矛盾：一维语言装二维语义 ##

SQL 为什么好读？它为查询而生：子句各占一行，缩进即层次，括号就是括号。它是二维的。

Java 方法调用是一维的，`.a().b().c()` 一条线。在一条线上表达一棵树，手段只有两种：

- 链式：线性 AND 链没问题，一遇分组就露怯，借 lambda 续命（Wrapper 走这条）；
- 显式构造：什么结构都能建，代价是每个树节点手写一遍（Criteria 走这条）。

MP 和 JPA 各选一条，各自把那条路的优缺点做到了典型。这不是哪家菜，是问题结构决定的。旁观名单很长：jOOQ 的 `DSLContext`、Kotlin Exposed 和 Ktorm、Scala Slick、.NET LINQ——全世界的语言都在这道题上摔跤。LINQ 算最接近解的，但那是 C# 编译器开了语言级的挂，Java 没这待遇。

还有一层痛，次要但真实：查询语义没有名字。链式构造是方法体里的局部语句，写完即弃；Specification 解决了复用，但复用的还是一段代码，读的人照样得在脑子里执行一遍才知道查的是什么。"找出可提现的活跃用户"——这个业务语义，在三个 DSL 里都没地方放。

## 历史上交过的四份卷 ##

"查询好不好写"这道题，业界交过四次卷：

| 路线 | 代表 | 付的代价 |
| --- | --- | --- |
| 回 SQL | MyBatis | SQL 和 Java 隔着 XML/字符串，动态条件靠 `<if>`，和类型系统绝缘 |
| 方法名即语义 | Spring Data 派生查询 | 简单查询确实直观，条件一多方法名 80 字符，也是灾难 |
| 宿主语言建 AST | Wrapper / Criteria / jOOQ | 前面两节说的全部问题 |
| 造一门语言 | HQL / JPQL | 方言要学、要配解析器和校验器，框架作者工作量最大 |

有意思的是，造语言这条路人最少，却是唯一保住 SQL 二维优势的——HQL 写在字符串里，照样分行、缩进、加括号。它的问题只剩两个：没有对象语义（写不了 `user.roleList` 这种导航），住在字符串里没有校验，写错运行期见。

那，把这两个短板补上呢？

## 我最后选的路 ##

写这篇文章的过程，也是我在反复确认一个判断：好维护的查询不会诞生在链式调用里，也不会诞生在语法树里，它长在结构化文本里。SQL 已经很接近了，缺的只是对象语义，和一个能被校验的住处。

所以我造了一门小语言。类 HQL 的语法，支持实体导航和关联；写在 DAO 接口的注解上；ANTLR4 解析成语法树；后面跟语法、语义两级共 11 个校验器——字段不存在、类型不匹配、关联方向错了，启动期就报，不等运行期；最后渲染成带 `?` 占位符的有界 SQL，交回 MyBatis 执行。

复杂查询长这样：

```java
@Statement("select * from User u where u.status = :status "
        + "and(u.name like :name or u.code = :code) "
        + "and u.age between :ageRange order by u.id desc")
List<User> findUsers(@Param("status") Integer status,
                     @Param("name") String name,
                     @Param("code") String code,
                     @Param("ageRange") List<Integer> ageRange);
```

没有链式，没有 Predicate，没有 `.apply()`。就是开头那四行 SQL，从 XML 搬进了注解，而且每个字段的合法性都有人验。

给 MyBatis 写一门查询语言，听起来是挺疯的。下周一我把它从头到尾摊开：文法怎么设计、解析树长什么样、11 个校验器各管什么、怎么保证注解里的 SQL 永远不会退化成没人检查的字符串。

## 结语 ##

Wrapper、Criteria、Specification 都是好东西，在它们各自的射程内。看清共同边界（一维宿主语言、语义无校验、查询无名）之后，选型就能少点信仰、多点算计：简单查询用谁都行，复杂查询，留给你真正信任的那件武器。
