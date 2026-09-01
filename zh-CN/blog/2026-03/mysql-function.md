---
lastUpdated: true
commentabled: true
recommended: true
title: MySQL的10种高级SQL，性能飞升
description: MySQL的10种高级SQL，性能飞升
date: 2026-03-04 09:45:00 
pageClass: blog-page-class
cover: /covers/mysql.svg
---

## 前言 ##

很多小伙伴在工作中，可能只把MySQL当作一个简单的“数据存储箱”，用了它80%的基础功能，却不知道它还有另外20%的、能解决90%复杂问题的“高级用法”。

今天，我不谈基础的增删改查，就和你深入聊聊，在实际高性能、高并发、大数据量的场景下，那些真正能让你和团队生产力倍增、性能飞升的10种MySQL高级实战技巧。

希望对你会有所帮助。

## 执行计划 ##

在优化任何查询之前，读懂EXPLAIN的输出是你的第一门必修课。

它就像SQL的“X光片”，能告诉你MySQL究竟打算如何执行你的查询，瓶颈在哪里。

### 核心用法与实战 ###

执行EXPLAIN后，你需要重点关注以下几个关键字段：

- type：访问类型，从最优到最差大致是：`system`>`const`>`eq_ref`>`ref`>`range`>`index`>`ALL`。看到ALL（全表扫描）就要警惕了。
- key：实际使用的索引。如果为`NULL`，说明没用上索引。
- rows：MySQL预估要扫描的行数。这个数字越接近实际需要的数据行数越好。
- Extra：包含非常丰富的信息，例如`Using filesort`（需要额外排序）、`Using temporary`（使用了临时表），这通常是性能杀手。

```sql
-- 一个需要优化的查询示例
EXPLAIN
SELECT * FROM orders
WHERE user_id = 10086
AND create_time BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY amount DESC;
```

假设这个查询的`type`是`ALL`，`key`是`NULL`。这意味着它在`orders`表上进行了全表扫描，性能极差。优化方法通常是创建一个复合索引：

```sql
-- 创建覆盖了WHERE和ORDER BY的复合索引
CREATE INDEX idx_user_time_amount ON orders(user_id, create_time, amount);
-- 再次使用EXPLAIN，你会看到type变成了range，key显示了新索引，性能天差地别。
```

深度剖析：`EXPLAIN`是基于表的统计信息来估算成本的。如果表数据变化很大而统计信息未更新，优化器可能会选错索引。
这时，可以用`ANALYZE TABLE table_name;`来手动更新统计信息。

有些小伙伴在工作中写的SQL本身不复杂，但执行很慢，第一步就应该祭出EXPLAIN。

## 高级索引策略 ##

索引是性能的基石，但错误的索引比没有索引更糟糕。

### 高级索引策略 ###

覆盖索引（Covering Index） ：如果索引包含了查询需要的所有字段，引擎就无需回表查询数据行，速度极快。

```sql
-- 假设常用查询是获取用户的姓名和邮箱
SELECT name, email FROM users WHEREage > 20;
-- 为这个查询设计覆盖索引
CREATE INDEX idx_age_name_email ON users(age,name, email);
-- age用于查询，name和email本身就在索引页中，无需查找数据行。
```

索引下推（Index Condition Pushdown， ICP） ：这是MySQL 5.6引入的重大优化。对于复合索引`(a, b)`，查询`WHERE a = ? AND b LIKE ‘%xxx’`。在旧版本中，即使a命中了索引，引擎也会将所有`a=?`的记录回表，再去过滤b。而ICP允许将`b LIKE ‘%xxx’`这个条件下推到存储引擎层，在索引扫描时就过滤，大大减少回表次数。

前缀索引（Prefix Index） ：对于超长文本字段（如`VARCHAR(500)`），为整个字段建索引非常臃肿。可以只对前N个字符建立索引，在空间和效率间取得平衡。

```sql
-- 为content字段前100个字符创建索引
CREATE INDEX idx_content_prefix ON articles (content(100));
-- 缺点是前缀索引无法用于GROUP BY和ORDER BY操作。
```

深度剖析：索引是一把双刃剑，加速查询的同时，会降低写操作（INSERT/UPDATE/DELETE）的速度，因为索引树也需要维护。
一个表上创建十几个索引是常见的设计误区。

你需要定期使用SHOW INDEX FROM table_name;审查索引的基数（Cardinality，唯一值数量），删除使用率极低的冗余索引。

## 窗口函数 ##

这是MySQL 8.0带来的“神兵利器”，用于进行跨行计算，完美解决复杂排名、累加、移动平均等问题。

### 核心场景与语法 ###

```sql
-- 经典场景：计算每个部门内员工的薪水排名
SELECT
 name,
  department,
  salary,
 RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_salary_rank,
 -- 同时计算公司整体排名
 RANK() OVER(ORDER BY salary DESC) as company_rank,
 -- 计算部门内薪水累计占比
 SUM(salary) OVER(PARTITION BY department) as dept_total,
  salary /SUM(salary) OVER(PARTITION BY department) as salary_ratio
FROM employees;
```

`PARTITION BY`类似于`GROUP BY`，但不会将行合并，而是定义窗口范围。

`ORDER BY`决定窗口内的排序。

深度剖析：在MySQL 8.0之前，要实现上述查询，你需要写复杂的自连接或效率极低的子查询。窗口函数在数据库内部进行了深度优化，性能提升可达几个数量级。

它特别适用于分析报表、实时排行榜、计算同比环比等OLAP型场景。

## 通用表表达式（CTE） ##

CTE（WITH子句）是另一个MySQL 8.0的重要特性，它允许你定义临时的命名结果集，在后续查询中像普通表一样引用。

### 优势与示例 ###

- 提升可读性：将复杂查询分解成逻辑清晰的步骤。
- 支持递归：这是CTE的杀手级功能，可以轻松查询树形或图状数据。

```sql
-- 示例1：分解复杂查询（非递归）
WITH
 high_value_orders AS(-- 找出高价值订单
  SELECT user_id,SUM(amount) as total_spent
  FROM orders
  WHERE status='completed'
  GROUP BY user_id
  HAVING total_spent > 10000
 ),
 active_users AS(-- 找出活跃用户
  SELECT DISTINCT user_id
  FROM user_logs
  WHERE last_active_date > DATE_SUB(NOW(), INTERVAL30DAY)
 )
-- 最终查询：既是高价值又是活跃的用户
SELECT u.name, u.email, h.total_spent
FROM user su
JOIN high_value_orders h ONu.id = h.user_id
JOIN active_users a ON u.id = a.user_id;

-- 示例2：递归CTE，查询部门树
WITH RECURSIVE department_tree AS(
 -- 锚点：找到根部门
 SELECT id,name, parent_id,1 as level
 FROM departments
 WHERE parent_id IS NULL
 UNION ALL
 -- 递归成员：连接父部门和子部门
 SELECT d.id, d.name, d.parent_id, dt.level + 1
 FROM departments d
 INNER JOIN department_tree dt ON d.parent_id = dt.id
)
SELECT * FROM department_tree ORDER BY level, id;
```

深度剖析：递归CTE极大地简化了组织架构、分类目录、评论嵌套等层次数据的查询。

在旧版本中，这通常需要在应用层进行多次查询或在数据库中使用存储过程，递归CTE在数据库内核完成遍历，效率更高。

## JSON类型与函数 ##

MySQL 5.7+原生支持JSON数据类型，让你能够在关系型数据库中灵活地存储和查询半结构化数据，这在处理动态字段、配置信息或第三方API返回的数据时非常有用。

### 核心操作 ###

```sql
-- 1. 创建包含JSON列的表
CREATE TABLE products (
 id INT PRIMARYKEY,
 name VARCHAR(100),
 attributes JSON COMMENT'存储颜色、尺寸等动态属性'
);

-- 2. 插入JSON数据
INSERT INTO products VALUES (1,'T-Shirt','{"color": "red", "size": ["M", "L"], "tags": ["casual", "cotton"]}');

-- 3. 查询 (使用 -> 和 ->> 操作符)
-- -> 返回JSON类型， ->> 返回纯文本字符串
SELECT
 name,
 attributes->>'$.color'ascolor,-- 提取color值
 attributes->'$.size'assize_array-- 提取size数组（仍为JSON）
FROM products
WHERE attributes->>'$.color'='red'
 OR JSON_CONTAINS(attributes->'$.tags','"cotton"');

-- 4. 更新部分JSON
UPDATE products
SET attributes = JSON_SET(attributes,'$.color','blue','$.new_field','value')
WHERE id=1;
```

深度剖析：JSON列同样可以建立索引（通过函数索引），加速查询。

```sql
CREATE INDEX idx_colorONproducts( (attributes->>'$.color') );
```

这允许你在保持灵活性的同时，不丧失对关键字段的查询性能。

它完美填补了关系模型在应对多变业务需求时的短板。

## 分区表（Partitioning） ##

当单表数据量巨大（如数亿行）时，分区可以将一张大表在物理上分割为多个更小、更易管理的部分，而逻辑上仍是一张表。

### 分区策略与示例 ###

```sql
-- 按时间范围(RANGE)分区，非常适合日志、订单表
CREATE TABLE sales (
 id INT,
  sale_date DATE,
  amount DECIMAL(10,2)
)
PARTITION BY RANGE COLUMNS(sale_date) (
 PARTITION p2023q1 VALUES LESS THAN('2023-04-01'),
 PARTITION p2023q2 VALUES LESS THAN('2023-07-01'),
 PARTITION p2023q3 VALUES LESS THAN('2023-10-01'),
 PARTITION p2023q4 VALUES LESS THAN('2024-01-01'),
 PARTITION p_future VALUES LESS THAN MAX VALUE
);

-- 查询时，优化器会自动定位到特定分区（分区裁剪，Partition Pruning）
EXPLAIN SELECT * FROM sales WHERE sale_date = '2023-05-15';
-- 你会看到partitions: p2023q2，意味着只扫描了2023年Q2的分区。
```

除了`RANGE`，还有`LIST`（按列表值）、`HASH`（按哈希值均匀分布）等分区方式。

深度剖析：分区的核心优势在于维护性和查询性能。

你可以快速删除或归档整个旧分区（`ALTER TABLE sales DROP PARTITION p2023q1;`），这比DELETE操作快得多，且不产生碎片。对于按分区键过滤的查询，性能提升显著。

但注意，分区键选择不当或跨分区查询，性能可能反而下降。

## 连接（JOIN）与子查询 ##

多表关联是业务常态，但写得不好就是性能灾难。

### 高级技巧 ###

控制连接顺序：MySQL优化器通常会选择它认为最佳的顺序，但你可以在复杂场景下用STRAIGHT_JOIN强制指定顺序。

```sql
SELECT...
FROM small_table s
STRAIGHT_JOIN large_table l ON s.id = l.s_id;-- 强制先查小表
```

利用衍生表（Derived Table）下推条件：有时将子查询或过滤条件提前，能极大地减少中间结果集。

```sql
-- 优化前：先连接两个大表，再过滤
SELECT * FROM A JOIN B ON A.id = B.aid WHERE A.create_time > '...';

-- 优化后：先过滤A表，再连接
SELECT * FROM (SELECT * FROM A WHERE create_time > '...') filtered_A
JOIN B ON filtered_A.id = B.aid;
```

`EXISTS`vs`IN`：对于“是否存在”的查询，特别是子查询结果集较大时，EXISTS（关联子查询）通常比IN（非关联子查询）性能更好，因为它找到第一个匹配项就会停止。

深度剖析：所有的JOIN优化，其核心思想都是 “尽早过滤，减少中间数据量” 。熟练使用EXPLAIN查看连接类型（如eq_ref很好，Using join buffer说明可能需要索引）是关键。

## 用户自定义变量 ##

MySQL允许你定义用户变量（如`@rank`），这在一些需要跨行计算或记录中间状态的分析中非常有用。

### 实战案例：计算行间差值 ###

```sql
-- 计算每日销售额的日环比增长率
SELECT
  sale_date,
  daily_amount,
 -- 使用变量记录前一天的值
  @prev_amountasprev_day_amount,
 ROUND( (daily_amount - @prev_amount) / @prev_amount *100,2) as growth_rate,
 -- 将当前值赋给变量，供下一行使用
  @prev_amount := daily_amount
FROM
  daily_sales_summary,
  (SELECT@prev_amount :=0) init-- 初始化变量
ORDER BY sale_date;
```

深度剖析：用户变量提供了过程式编程的能力，可以模拟窗口函数的部分功能（在MySQL 8.0之前）。

但它不是SQL标准，执行顺序有时反直觉，需谨慎使用。

在复杂的会话或事务中，变量的生命周期和作用域也需要仔细考量。

## 在线DDL与无锁变更 ##

在业务7x24小时运行的时代，给大表加字段、改索引再也不能随意停服务了。

MySQL 5.6+提供了`ALGORITHM`和`LOCK`选项，实现在线DDL（Online Data Definition）。

### 安全操作指南 ###

```sql
-- 添加一个可为空且有默认值的新列，使用INPLACE算法和尽量低的锁级别
ALTER TABLE huge_table
ADD COLUMN new_column VARCHAR(100) DEFAULT '' NOT NULL,
ALGORITHM=INPLACE,-- 尽量使用INPLACE（原地重建），避免COPY（锁表复制）
LOCK=NONE;-- 目标：不加锁，或共享锁

-- 修改列类型（某些情况需要COPY，会锁表）
ALTER TABLE huge_table
MODIFY COLUMN old_column BIGINT,
ALGORITHM=COPY,-- 注意：这里可能必须用COPY
LOCK=SHARED;
```

深度剖析：`ALGORITHM=INPLACE`意味着大部分工作（如重建索引）在引擎内部完成，允许并发DML操作。

而`ALGORITHM=COPY`会创建新表并复制数据，全程锁表。

执行前务必用`ALGORITHM=DEFAULT`先测试一下。

pt-online-schema-change是Percona提供的第三方工具，通过触发器实现真正的全程无锁，是更稳妥的选择。

##  利用生成列与函数索引 ##

生成列的值由表中其他列计算而来，可分为虚拟列（VIRTUAL，不存储，读取时计算）和存储列（STORED，持久化存储） 。
这为建立高效的函数索引铺平了道路。

### 应用场景 ###

```sql
-- 场景：经常需要根据 `first_name` 和 `last_name` 进行全名搜索
ALTER TABLE users
ADD COLUMN full_name VARCHAR(255)
GENERATED ALWAYSAS(CONCAT(first_name,' ', last_name)) STORED,-- 创建存储的生成列
ADD INDEX idx_full_name (full_name);-- 在生成列上建立索引

-- 现在，以下查询可以高效使用索引
SELECT * FROM users WHERE full_name = 'John Doe';
```

深度剖析：这解决了直接在表达式（如`CONCAT(first_name, ‘ ‘, last_name)`）上建立函数索引的难题。

虚拟列节省空间但增加CPU计算开销；存储列反之。

## 总结：从“会用”到“精通”的跃迁 ##

好了，一口气聊了11个MySQL的高级用法。让我们最后再梳理一下，这些技巧并非孤立存在，它们构成了一个应对不同场景挑战的工具箱。

有些小伙伴在工作中可能会有这样的疑问：“我知道它们好，但该从哪里开始学起呢？”

我的建议是：从EXPLAIN和索引优化开始。

这是性能问题的根本。

然后，根据你的业务需求，引入窗口函数或CTE来简化复杂查询。当数据量上来后，考虑分区。

对于动态数据结构，尝试JSON类型。
