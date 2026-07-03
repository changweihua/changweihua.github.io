---
lastUpdated: true
commentabled: true
recommended: true
title: MySQL 8.0 性能优化全攻略
description: 索引、查询与配置调优的实战指南
date: 2026-02-24 09:59:00 
pageClass: blog-page-class
cover: /covers/mysql.svg
---

> 在2026年的今天，MySQL 8.0 已成为**企业级应用的首选数据库**。

本文将从*索引优化*、*查询优化*、*配置调优*、*监控诊断*四个维度，分享一套经过多个高并发项目验证的*MySQL 8.0 性能优化实战方案*。

## 一、索引优化：性能提升的基石 ##

### 索引类型与选择策略 ###

|          MySQL 8.0 索引类型           ||
|  索引类型  | 使用场景 |
|  :------------: | :-----------: |
|  B-Tree  |  默认索引，适用于 =, >, <, BETWEEN, LIKE |
|  Hash |  仅 Memory 引擎，等值查询 |
|  Full-Text |   全文搜索，InnoDB 支持 |
|  R-Tree |   空间数据，GIS 应用 |
|  降序索引 |  MySQL 8.0 新特性，支持 DESC 排序 |
|  函数索引 |   MySQL 8.0 新特性，基于表达式 |


### 创建高效索引 ###

```sql
-- ❌ 低效索引 - 选择性差
CREATE INDEX idx_gender ON users(gender);  -- 只有男/女两个值

-- ✅ 高效索引 - 高选择性
CREATE INDEX idx_email ON users(email);     -- 唯一性高
CREATE INDEX idx_phone ON users(phone);     -- 唯一性高

-- ✅ 复合索引 - 最左前缀原则
CREATE INDEX idx_name_age ON users(last_name, first_name, age);

-- 查询能利用索引：
SELECT * FROM users WHERE last_name = 'Smith';                    -- ✅
SELECT * FROM users WHERE last_name = 'Smith' AND age = 25;      -- ✅
SELECT * FROM users WHERE last_name = 'Smith' AND first_name = 'John';  -- ✅

-- 查询不能利用索引：
SELECT * FROM users WHERE age = 25;                              -- ❌
SELECT * FROM users WHERE first_name = 'John';                   -- ❌

-- ✅ MySQL 8.0 降序索引
CREATE INDEX idx_created_desc ON orders(user_id, created_at DESC);

-- 高效查询最新订单：
SELECT * FROM orders 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 10;  -- 无需 filesort

-- ✅ MySQL 8.0 函数索引（隐藏列实现）
ALTER TABLE users ADD COLUMN email_lower VARCHAR(255) 
GENERATED ALWAYS AS (LOWER(email)) STORED;
CREATE INDEX idx_email_lower ON users(email_lower);

-- 查询：
SELECT * FROM users WHERE email_lower = 'test@example.com';
```

### 覆盖索引优化 ###

```sql
-- ❌ 回表查询 - 性能较差
SELECT id, name, email FROM users WHERE age = 25;
-- 执行流程：idx_age → 回表 → 获取 name, email

-- ✅ 覆盖索引 - 无需回表
CREATE INDEX idx_age_name_email ON users(age, name, email);
SELECT id, name, email FROM users WHERE age = 25;
-- 执行流程：idx_age_name_email 直接获取所有数据

-- 验证覆盖索引
EXPLAIN SELECT id, name, email FROM users WHERE age = 25;
-- Extra 列显示 "Using index" 表示覆盖索引
```

### 索引维护与监控 ###

```sql
-- 查看索引使用情况（MySQL 8.0）
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_READ,
    COUNT_WRITE,
    SUM_NUMBER_OF_BYTES_READ,
    SUM_NUMBER_OF_BYTES_WRITTEN
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database'
ORDER BY COUNT_READ DESC;

-- 查看未使用的索引
SELECT 
    s.schema_name,
    s.table_name,
    s.index_name
FROM sys.schema_unused_indexes s
WHERE s.schema_name NOT IN ('mysql', 'performance_schema', 'sys');

-- 查看冗余索引
SELECT 
    table_schema,
    table_name,
    index_name,
    redundant_index_name
FROM sys.schema_redundant_indexes;

-- 删除未使用索引
DROP INDEX idx_unused ON users;

-- 分析索引统计信息
ANALYZE TABLE users;

-- 检查表碎片
SELECT 
    table_name,
    data_free,
    data_length,
    ROUND(data_free / data_length * 100, 2) AS fragmentation_ratio
FROM information_schema.tables
WHERE table_schema = 'your_database'
ORDER BY fragmentation_ratio DESC;

-- 优化表（谨慎使用，会锁表）
OPTIMIZE TABLE users;
```

### 索引设计最佳实践 ###

```sql
-- ✅ 索引设计检查清单

-- 1. 主键选择
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- ✅ 自增主键
    order_no VARCHAR(32) UNIQUE NOT NULL,           -- ✅ 业务唯一键
    user_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB;

-- 2. 外键索引
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    INDEX idx_order_id (order_id),      -- ✅ 外键必须建索引
    INDEX idx_product_id (product_id)   -- ✅ 外键必须建索引
);

-- 3. 字符串索引长度
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    INDEX idx_email_prefix (email(20))  -- ✅ 前缀索引节省空间
);

-- 4. 避免过度索引
-- 单表索引建议不超过 5-6 个
-- 每个索引都会增加写操作开销

-- 5. 使用 EXPLAIN 验证
EXPLAIN FORMAT=TREE SELECT * FROM users WHERE email = 'test@example.com';
```

## 二、查询优化：SQL 执行效率提升 ##

### EXPLAIN 深度解析 ###

|          EXPLAIN 输出字段详解           ||
|  字段  | 含义 |
|  :------------: | :-----------: |
|  id  |  查询执行顺序（数字越小越先执行） |
|  select_type  |  查询类型（SIMPLE/PRIMARY/SUBQUERY 等） |
|  table  |  当前操作的表 |
|  type  |  访问类型（性能从好到差） |
|  possible_keys  |  可能使用的索引 |
|  key  |  实际使用的索引 |
|  key_len  |  索引使用长度 |
|  ref  |  索引比较的列或常量 |
|  rows  |  预估扫描行数 |
|  filtered  |  过滤比例（MySQL 8.0+） |
|  Extra  |  额外信息（重要！） |

```txt
-- type 字段性能排序（从优到劣）
/*
system > const > eq_ref > ref > range > index > ALL

✅ system/const: 常量查询，最优
✅ eq_ref: 主键/唯一索引等值查询
✅ ref: 非唯一索引等值查询
✅ range: 索引范围扫描
⚠️ index: 全索引扫描
❌ ALL: 全表扫描（需要优化）
*/

-- Extra 字段关键信息
/*
✅ Using index: 覆盖索引，无需回表
✅ Using where: 使用 WHERE 过滤
⚠️ Using temporary: 使用临时表（需要优化）
⚠️ Using filesort: 文件排序（需要优化）
⚠️ Using join buffer: 使用连接缓冲
*/
```

### 查询优化实战 ###

```sql
-- ❌ 低效查询 - 函数导致索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- ✅ 优化后 - 范围查询
SELECT * FROM users 
WHERE created_at >= '2024-01-01' 
  AND created_at < '2025-01-01';

-- ❌ 低效查询 - LIKE 前缀通配符
SELECT * FROM users WHERE name LIKE '%John%';

-- ✅ 优化后 - 使用全文索引
ALTER TABLE users ADD FULLTEXT INDEX ft_name (name);
SELECT * FROM users WHERE MATCH(name) AGAINST('John');

-- ❌ 低效查询 - OR 条件索引失效
SELECT * FROM users WHERE email = 'test@example.com' OR phone = '123456';

-- ✅ 优化后 - UNION ALL
SELECT * FROM users WHERE email = 'test@example.com'
UNION ALL
SELECT * FROM users WHERE phone = '123456';

-- ❌ 低效查询 - 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000;  -- phone 是 VARCHAR

-- ✅ 优化后 - 类型匹配
SELECT * FROM users WHERE phone = '13800138000';

-- ❌ 低效查询 - SELECT *
SELECT * FROM users WHERE age = 25;

-- ✅ 优化后 - 只取需要的列
SELECT id, name, email FROM users WHERE age = 25;

-- ❌ 低效查询 - 深分页
SELECT * FROM orders ORDER BY created_at DESC LIMIT 100000, 20;

-- ✅ 优化后 - 延迟关联
SELECT o.* 
FROM orders o
INNER JOIN (
    SELECT id FROM orders 
    ORDER BY created_at DESC 
    LIMIT 100000, 20
) tmp ON o.id = tmp.id;

-- ✅ 优化后 - 记录上次位置
SELECT * FROM orders 
WHERE created_at < '2024-01-01 00:00:00'
ORDER BY created_at DESC 
LIMIT 20;
```

### JOIN 优化 ###

```sql
-- ✅ JOIN 优化原则

-- 1. 小表驱动大表
SELECT * FROM orders o 
INNER JOIN users u ON o.user_id = u.id;
-- users 表应该更小，作为驱动表

-- 2. 关联字段必须有索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_users_id ON users(id);

-- 3. 避免多表 JOIN（不超过 3 张表）
-- ❌ 不推荐
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id;

-- ✅ 推荐 - 拆分查询，应用层组装

-- 4. LEFT JOIN 注意 NULL 值
SELECT * FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;  -- 查找没有订单的用户
-- 确保 WHERE 条件不会把 LEFT JOIN 变成 INNER JOIN

-- 5. 使用 EXISTS 替代 IN（子查询优化）
-- ❌ 低效
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- ✅ 高效
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.amount > 1000
);
```

### 子查询优化 ###

```sql
-- ❌ 低效 - 相关子查询
SELECT u.*, 
    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;

-- ✅ 优化 - LEFT JOIN
SELECT u.*, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;

-- ❌ 低效 - IN 子查询
SELECT * FROM products 
WHERE category_id IN (SELECT id FROM categories WHERE status = 1);

-- ✅ 优化 - JOIN
SELECT p.* 
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE c.status = 1;

-- ✅ MySQL 8.0 CTE（公共表表达式）
WITH active_categories AS (
    SELECT id FROM categories WHERE status = 1
)
SELECT p.* 
FROM products p
INNER JOIN active_categories ac ON p.category_id = ac.id;
```

### 排序与分组优化 ###

```sql
-- ❌ 低效 - 文件排序
SELECT * FROM users ORDER BY name, age;

-- ✅ 优化 - 使用索引排序
CREATE INDEX idx_name_age ON users(name, age);
SELECT * FROM users ORDER BY name, age;

-- ❌ 低效 - GROUP BY 未使用索引
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- ✅ 优化 - 使用索引
CREATE INDEX idx_status ON orders(status);
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- ✅ MySQL 8.0 窗口函数
SELECT 
    user_id,
    order_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
    SUM(amount) OVER (PARTITION BY user_id) AS total_amount,
    AVG(amount) OVER (PARTITION BY user_id) AS avg_amount
FROM orders;

-- 获取每个用户的最新订单
SELECT * FROM (
    SELECT 
        user_id,
        order_id,
        amount,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders
) tmp
WHERE rn = 1;
```

## 三、配置调优：服务器性能最大化 ##

### 核心配置参数 ###

```ini
# my.cnf - MySQL 8.0 生产环境配置示例
# 基于 16GB 内存、4 核 CPU 服务器

[mysqld]
# ==================== 基础配置 ====================
port = 3306
basedir = /usr/local/mysql
datadir = /var/lib/mysql
socket = /var/lib/mysql/mysql.sock
pid-file = /var/run/mysqld/mysqld.pid
user = mysql

# ==================== 连接配置 ====================
max_connections = 500              # 最大连接数
max_connect_errors = 10000         # 最大连接错误数
wait_timeout = 28800               # 连接超时（秒）
interactive_timeout = 28800        # 交互超时
thread_cache_size = 100            # 线程缓存

# ==================== 内存配置 ====================
# InnoDB 缓冲池（关键！）
innodb_buffer_pool_size = 10G      # 物理内存的 60-70%
innodb_buffer_pool_instances = 8   # 缓冲池实例数（每 GB 一个）

# 日志缓冲
innodb_log_buffer_size = 64M       # 日志缓冲大小
innodb_log_file_size = 512M        # 日志文件大小
innodb_log_files_in_group = 2      # 日志文件组数量

# 其他内存
sort_buffer_size = 4M              # 排序缓冲（每连接）
read_buffer_size = 2M              # 读缓冲（每连接）
read_rnd_buffer_size = 4M          # 随机读缓冲（每连接）
join_buffer_size = 4M              # 连接缓冲（每连接）
tmp_table_size = 64M               # 临时表大小
max_heap_table_size = 64M          # 内存表大小

# ==================== InnoDB 配置 ====================
innodb_engine = ON
innodb_flush_log_at_trx_commit = 1  # 0/1/2（1 最安全）
innodb_flush_method = O_DIRECT      # 刷新方法
innodb_file_per_table = ON          # 每表一个文件
innodb_lock_wait_timeout = 50       # 锁等待超时
innodb_thread_concurrency = 0       # 线程并发数（0=自动）
innodb_io_capacity = 2000           # IO 能力（SSD 可调高）
innodb_io_capacity_max = 4000       # 最大 IO 能力
innodb_read_io_threads = 8          # 读 IO 线程
innodb_write_io_threads = 8         # 写 IO 线程

# ==================== 日志配置 ====================
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2                 # 慢查询阈值（秒）
log_queries_not_using_indexes = ON  # 记录未使用索引的查询
log_throttle_queries_not_using_indexes = 60

general_log = OFF                   # 生产环境关闭
general_log_file = /var/log/mysql/general.log

# ==================== 复制配置 ====================
server_id = 1
log_bin = /var/log/mysql/mysql-bin
binlog_format = ROW                 # 行格式
binlog_cache_size = 4M
max_binlog_size = 500M
expire_logs_days = 7
sync_binlog = 1                     # 最安全

# ==================== 字符集配置 ====================
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci
init_connect = 'SET NAMES utf8mb4'

# ==================== 安全配置 ====================
skip_name_resolve = ON              # 禁用 DNS 解析
local_infile = OFF                  # 禁用本地文件加载
symbolic_links = OFF                # 禁用符号链接
```

### 配置参数调优指南 ###

```sql
-- 查看当前配置
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE '%buffer%';
SHOW VARIABLES LIKE '%log%';

-- 查看配置来源（MySQL 8.0）
SELECT * FROM performance_schema.variables_info 
WHERE VARIABLE_NAME = 'innodb_buffer_pool_size';

-- 动态修改配置（部分参数支持）
SET GLOBAL innodb_buffer_pool_size = 10737418240;  -- 10GB
SET GLOBAL max_connections = 500;

-- 配置持久化（MySQL 8.0）
SET PERSIST innodb_buffer_pool_size = 10737418240;

-- 推荐配置计算公式
/*
innodb_buffer_pool_size = 物理内存 × 0.6 ~ 0.7
innodb_buffer_pool_instances = innodb_buffer_pool_size / 1GB
max_connections = (可用内存 - innodb_buffer_pool_size) / 每连接内存
每连接内存 ≈ sort_buffer + read_buffer + read_rnd_buffer + join_buffer
*/
```

### 硬件优化建议 ###

|          MySQL 8.0 硬件配置建议           ||
|  组件  | 推荐配置 |
|  :------------: | :-----------: |
|  CPU |   高主频优先，4 核起步，推荐 8-16 核 |
|  内存 |   16GB 起步，推荐 32-64GB，innodb 缓冲池占 60-70% |
|  磁盘 |   SSD 必备，NVMe 更佳，RAID 10 |
|  网络 |   千兆起步，推荐万兆，低延迟 |
|  操作系统 |   Linux（CentOS/Ubuntu），关闭 NUMA |


```ini
# Linux 系统优化
# /etc/sysctl.conf
vm.swappiness = 1                    # 减少 swap 使用
vm.dirty_ratio = 40                  # 脏页比例
vm.dirty_background_ratio = 10       # 后台刷脏页比例
vm.overcommit_memory = 1             # 允许内存超分
net.core.somaxconn = 65535           # 最大连接队列
net.ipv4.tcp_max_syn_backlog = 65535 # SYN 队列

# 应用配置
sysctl -p

# 禁用 NUMA（对于多 CPU 系统）
# /etc/default/grub
GRUB_CMDLINE_LINUX="numa=off"
update-grub

# 文件系统优化（XFS 推荐）
# /etc/fstab
/dev/sda1 /var/lib/mysql xfs noatime,nodiratime 0 0
```

## 四、监控与诊断：问题快速定位 ##

### 性能监控视图 ###

```sql
-- MySQL 8.0 Performance Schema 关键视图

-- 1. 查看最耗时的 SQL
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    SUM_TIMER_WAIT / 1000000000000 AS total_latency_sec,
    AVG_TIMER_WAIT / 1000000000000 AS avg_latency_sec,
    ROWS_EXAMINED,
    ROWS_SENT
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 20;

-- 2. 查看表 IO 等待
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    COUNT_READ,
    COUNT_WRITE,
    SUM_TIMER_READ / 1000000000000 AS read_latency_sec,
    SUM_TIMER_WRITE / 1000000000000 AS write_latency_sec
FROM performance_schema.table_io_waits_summary_by_table
ORDER BY SUM_TIMER_READ + SUM_TIMER_WRITE DESC
LIMIT 20;

-- 3. 查看锁等待
SELECT 
    r.trx_id waiting_trx_id,
    r.trx_mysql_thread_id waiting_thread,
    r.trx_query waiting_query,
    b.trx_id blocking_trx_id,
    b.trx_mysql_thread_id blocking_thread,
    b.trx_query blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;

-- 4. 查看当前连接
SELECT 
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE,
    INFO
FROM information_schema.processlist
WHERE COMMAND != 'Sleep'
ORDER BY TIME DESC;

-- 5. 查看表锁和行锁
SHOW ENGINE INNODB STATUS\G
```

### 慢查询分析 ###

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 查看慢查询统计
SELECT * FROM mysql.slow_log;

-- 使用 mysqldumpslow 分析
mysqldumpslow -s t -t 20 /var/log/mysql/slow.log  # 按时间排序
mysqldumpslow -s r -t 20 /var/log/mysql/slow.log  # 按返回记录数排序
mysqldumpslow -s c -t 20 /var/log/mysql/slow.log  # 按调用次数排序

-- 使用 pt-query-digest 分析（Percona Toolkit）
pt-query-digest /var/log/mysql/slow.log > slow_analysis.txt
```

### 性能诊断工具 ###

```bash
# MySQL 8.0 内置工具

# 1. mysqladmin
mysqladmin -u root -p status          # 服务器状态
mysqladmin -u root -p processlist     # 进程列表
mysqladmin -u root -p variables       # 配置变量
mysqladmin -u root -p extended-status # 扩展状态

# 2. mysqlshow
mysqlshow -u root -p database         # 数据库信息
mysqlshow -u root -p database table   # 表信息

# 3. Performance Schema 查询
# 查看锁情况
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

# 查看表锁
SELECT * FROM performance_schema.table_handles;

# 4. sys 库（简化 Performance Schema）
SELECT * FROM sys.schema_table_statistics;
SELECT * FROM sys.schema_index_statistics;
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile;
SELECT * FROM sys.waits_global_by_latency;
```

```bash
# 第三方工具推荐

# 1. Percona Toolkit
pt-deadlock-logger    # 死锁日志分析
pt-duplicate-key-checker  # 重复索引检查
pt-index-usage        # 索引使用分析
pt-query-digest       # 慢查询分析
pt-table-checksum     # 表一致性检查

# 2. Orchestrator
# MySQL 高可用管理工具

# 3. PMM (Percona Monitoring and Management)
# 完整的监控解决方案

# 4. Prometheus + Grafana
# 配合 mysqld_exporter 使用
```

### 常见问题诊断 ###

```sql
-- 问题1: CPU 使用率高
-- 诊断步骤
SELECT * FROM sys.statements_with_full_table_scans;  -- 全表扫描
SELECT * FROM sys.statements_with_temp_tables;       -- 临时表
SELECT * FROM sys.statements_with_sorting;           -- 排序操作

-- 问题2: 内存使用高
SHOW STATUS LIKE 'Innodb_buffer_pool_pages%';
SHOW STATUS LIKE 'Created_tmp%';
SELECT * FROM sys.memory_global_total;

-- 问题3: 连接数过多
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
SELECT * FROM sys.session;

-- 问题4: 磁盘 IO 高
SELECT * FROM sys.io_global_by_file_by_latency;
SELECT * FROM sys.io_global_by_wait_by_latency;

-- 问题5: 锁等待严重
SELECT * FROM sys.innodb_lock_waits;
SELECT * FROM performance_schema.data_lock_waits;
```

## 五、实战案例：性能优化全流程 ##

### 案例1: 电商订单查询优化 ###

```sql
-- 优化前：查询耗时 3.5 秒
SELECT o.*, u.name, u.email, p.title, c.name AS category_name
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE o.status = 'pending'
  AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 问题分析
EXPLAIN FORMAT=TREE SELECT ...;  -- 发现全表扫描和临时表

-- 优化步骤

-- 1. 添加索引
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category_id ON products(category_id);

-- 2. 优化查询（分页优化）
SELECT o.id, o.order_no, o.amount, o.status, o.created_at,
       u.name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending'
  AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 3. 应用层获取商品详情（避免多表 JOIN）
-- 先获取订单 ID 列表，再批量查询商品信息

-- 优化后：查询耗时 0.05 秒，提升 70 倍
```

### 案例2: 报表统计优化 ###

```sql
-- 优化前：每日销售报表耗时 30 秒
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY DATE(created_at)
ORDER BY date;

-- 问题分析
-- 1. DATE() 函数导致索引失效
-- 2. 全表扫描
-- 3. 每次查询都实时计算

-- 优化方案

-- 方案1: 使用范围查询
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount
FROM orders
WHERE created_at >= '2024-01-01' 
  AND created_at < '2025-01-01'
GROUP BY DATE(created_at);

-- 方案2: 创建物化视图（MySQL 8.0 使用普通表模拟）
CREATE TABLE daily_order_stats (
    stat_date DATE PRIMARY KEY,
    order_count INT,
    total_amount DECIMAL(15,2),
    avg_amount DECIMAL(15,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 定时任务每日更新
INSERT INTO daily_order_stats 
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    NOW()
FROM orders
WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
GROUP BY DATE(created_at)
ON DUPLICATE KEY UPDATE
    order_count = VALUES(order_count),
    total_amount = VALUES(total_amount),
    avg_amount = VALUES(avg_amount),
    updated_at = NOW();

-- 查询时直接读取统计表
SELECT * FROM daily_order_stats 
WHERE stat_date >= '2024-01-01'
ORDER BY stat_date;

-- 优化后：查询耗时 0.01 秒，提升 3000 倍
```

### 案例3: 高并发写入优化 ###

```sql
-- 问题：秒杀活动，每秒 5000+ 写入，出现锁等待

-- 优化方案

-- 1. 批量插入
-- ❌ 单条插入
INSERT INTO orders (user_id, amount, status) VALUES (1, 100, 'pending');
INSERT INTO orders (user_id, amount, status) VALUES (2, 100, 'pending');
...

-- ✅ 批量插入
INSERT INTO orders (user_id, amount, status) VALUES 
(1, 100, 'pending'),
(2, 100, 'pending'),
(3, 100, 'pending'),
...
(100, 100, 'pending');  -- 每批 100-500 条

-- 2. 关闭自动提交（事务批量）
SET autocommit = 0;
START TRANSACTION;
-- 执行多条 INSERT
COMMIT;

-- 3. 调整 InnoDB 配置
-- my.cnf
innodb_flush_log_at_trx_commit = 2  # 降低日志刷新频率
innodb_buffer_pool_size = 10G       # 增加缓冲池
innodb_log_file_size = 1G           # 增加日志文件

-- 4. 表分区（按时间）
ALTER TABLE orders 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);

-- 5. 使用消息队列削峰
-- 订单先写入消息队列，异步消费写入数据库

-- 优化后：写入能力提升 10 倍，无锁等待
```

## 六、优化检查清单 ##

### 📋 MySQL 8.0 性能优化检查清单 ###

#### 索引优化 ####

- 主键使用自增整数
- 外键字段建立索引
- WHERE/ORDER BY/GROUP BY 字段有索引
- 复合索引遵循最左前缀原则
- 避免重复索引和冗余索引
- 定期分析未使用索引并删除
- 字符串字段使用前缀索引

#### 查询优化 ####

- 使用 EXPLAIN 分析查询计划
- 避免 `SELECT *`
- 避免函数导致索引失效
- 避免隐式类型转换
- 优化深分页问题
- JOIN 不超过 3 张表
- 使用 EXISTS 替代 IN 子查询
- 大表使用分区

#### 配置优化 ####

- innodb_buffer_pool_size 设置为内存 60-70%
- 启用慢查询日志
- 配置合适的 max_connections
- 禁用 DNS 解析（skip_name_resolve）
- 使用 ROW 格式 binlog
- 配置合理的超时参数

#### 监控维护 ####

- 部署性能监控（Prometheus+Grafana）
- 定期分析慢查询日志
- 监控锁等待情况
- 定期检查表碎片
- 定期备份并验证恢复
- 建立告警机制

## 七、总结与建议 ##

### 🎯 核心要点回顾 ###

|  优化维度  |  关键策略  |   预期效果  |
| :-----------: | :----: | :----: |
| 索引优化 |  复合索引 + 覆盖索引 + 定期清理  |  查询速度提升 10-100 倍 |
| 查询优化 |  EXPLAIN 分析 + 避免全表扫描  |  查询效率提升 5-50 倍 |
| 配置调优 |  缓冲池 + 日志配置 + 连接管理  |  吞吐量提升 2-5 倍 |
| 监控维护 |  慢查询分析 + 性能监控  |  问题定位时间 ↓ 80% |

### 🚀 实施建议 ###

- 先监控，后优化：建立基线，找到真正的瓶颈
- 先索引，后 SQL：80% 的性能问题通过索引解决
- 先查询，后配置：配置调优收益有限，优先优化 SQL
- 测试验证：所有优化在测试环境验证后再上线
- 持续优化：性能优化是持续过程，定期 Review
