---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀 Flyway 存量数据库迁移
description: 50张表一键导出清洗实战（附完整脚本）
date: 2026-09-14 10:35:00
pageClass: blog-page-class
cover: /covers/java.svg
---

> 摘要：接手遗留系统，50+张表如何接入 Flyway？手动写脚本？NO！本文手把手教你一键导出DDL、智能清洗、基线接入，3分钟搞定百张表迁移，零数据风险！

## 为什么需要基线迁移？ ##

*场景还原*：

- 你接手了一个运行2年的老系统
- 数据库有50+张表，结构复杂，外键交织
- 团队决定引入 Flyway 做版本管理
- 问题来了：难道要手写50个 `CREATE TABLE` 脚本？

*错误做法 ❌*：

```sql
-- V1__users.sql
CREATE TABLE users (...);

-- V2__orders.sql
CREATE TABLE orders (...);

-- V3__products.sql
CREATE TABLE products (...);

-- 😱 还要写47个...
```

*正确做法 ✅*：

```sql
# 1条命令导出所有表结构
mysqldump --no-data mydb > V1__initial_schema.sql

# 1条命令基线接入
flyway -baselineVersion=1 -baselineOnMigrate=true migrate

# ✅ 完成！50张表纳入版本管理
```

## 核心流程总览 ##

```mermaid
graph LR
    A[现有数据库&#x3C;br/>50+张表] --> B[一键导出DDL]
    B --> C[智能清洗脚本]
    C --> D[放入migration目录]
    D --> E[基线接入]
    E --> F[后续增量迭代]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

*关键原则*：

✅ 不碰数据：只导出结构（`--no-data`）
✅ 不删表：移除所有 `DROP TABLE` 语句
✅ 保留依赖：外键检查、字符集设置必须保留
✅ 一键基线：Flyway 自动标记，不重复执行

## 一键导出DDL ##

### MySQL 完整命令 ###

```bash
mysqldump -u root -p \
  --no-data \                    # 只导出结构，不导出数据
  --skip-add-drop-table \        # 不生成 DROP TABLE（关键！）
  --skip-triggers \              # 不导出触发器（单独管理）
  --no-create-db \               # 不生成 CREATE DATABASE
  --skip-add-locks \             # 不加 LOCK TABLES
  --complete-insert \            # 完整INSERT语句（如果有数据）
  --routines=0 \                 # 不导出存储过程
  --events=0 \                   # 不导出事件
  mydb > V1__initial_schema.sql
```

### PostgreSQL 完整命令 ###

```bash
pg_dump -U postgres \
  -s \                           # 仅结构（schema only）
  --no-owner \                   # 不输出所有者命令
  --no-privileges \              # 不输出权限命令
  --schema=public \              # 指定schema
  --exclude-table=flyway_schema_history \  # 排除Flyway元数据表
  mydb > V1__initial_schema.sql
```

### 导出后检查清单 ###

```bash
# 1. 查看文件大小（正常50张表约500KB-5MB）
ls -lh V1__initial_schema.sql

# 2. 统计表数量（应该≈50）
grep -c "^CREATE TABLE" V1__initial_schema.sql

# 3. 确认没有DROP语句
grep -i "DROP TABLE" V1__initial_schema.sql
# 应该无输出

# 4. 确认没有USE语句
grep "^USE " V1__initial_schema.sql
# 应该无输出
```

## 智能清洗脚本 ##

### 必须处理的5个地方 ###

| 序号 | 必须处理项 | 原因 | 风险等级 |
| :--- | :--- | :--- | :--- |
| 1 | 删除 `DROP TABLE IF EXISTS` | 基线接入时表已存在，执行DROP会清空数据 | 🔴 致命 |
| 2 | 删除 `CREATE DATABASE / USE db` | Flyway已通过url连接目标库 | 🔴 致命 |
| 3 | 保留 `SET FOREIGN_KEY_CHECKS=0/1` | 50张表有交叉外键，需临时关闭检查 | 🟢 必须保留 |
| 4 | 删除触发器/存储过程定义 | 这些应该用 R__ 脚本单独管理 | 🟡 建议删除 |
| 5 | 统一字符集为 `utf8mb4` | 避免中文乱码和索引失效 | 🟡 建议统一 |

### 自动化清洗脚本（Linux/Mac） ###

创建 `clean_flyway_sql.sh`：

```bash
#!/bin/bash
# Flyway DDL 清洗脚本
# 用法：./clean_flyway_sql.sh V1__initial_schema.sql

INPUT_FILE=$1
OUTPUT_FILE=${INPUT_FILE%.sql}_cleaned.sql

if [ ! -f "$INPUT_FILE" ]; then
  echo "❌ 文件不存在: $INPUT_FILE"
  exit 1
fi

echo "🔧 开始清洗: $INPUT_FILE"

# 执行清洗
cat "$INPUT_FILE" | \
  # 删除 DROP TABLE 语句
  sed '/^DROP TABLE IF EXISTS/d' | \
  # 删除 CREATE DATABASE 语句
  sed '/^CREATE DATABASE/d' | \
  # 删除 USE 语句
  sed '/^USE /d' | \
  # 删除触发器定义（从 CREATE TRIGGER 到结尾分号）
  sed '/^CREATE.*TRIGGER/,/;$/d' | \
  # 删除存储过程定义
  sed '/^CREATE.*PROCEDURE/,/^END/d' | \
  # 删除函数定义
  sed '/^CREATE.*FUNCTION/,/^END/d' | \
  # 删除注释中的敏感信息（TODO/FIXME）
  sed '/--.*TODO/d' | \
  sed '/--.*FIXME/d' | \
  # 删除空行（超过3个连续空行压缩为1个）
  sed '/^$/N;/^\n$/D' | \
  # 统一字符集为 utf8mb4
  sed 's/CHARSET=utf8/CHARSET=utf8mb4/g' | \
  sed 's/COLLATE=utf8_bin/COLLATE=utf8mb4_unicode_ci/g' \
  > "$OUTPUT_FILE"

# 在文件头部添加标准注释
cat > temp_header.sql << EOF
-- =====================================================
-- Flyway Migration: V1 - Initial Schema
-- Generated: $(date +%Y-%m-%d)
-- Database: MySQL
-- Tables: $(grep -c "^CREATE TABLE" "$OUTPUT_FILE")
--
-- WARNING: This is a baseline script.
-- Do NOT modify existing tables here.
-- Use V2__, V3__ for incremental changes.
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

EOF

# 在文件尾部添加恢复语句
cat >> temp_footer.sql << EOF

SET FOREIGN_KEY_CHECKS = 1;
EOF

# 合并文件
cat temp_header.sql "$OUTPUT_FILE" temp_footer.sql > "${OUTPUT_FILE%.sql}_final.sql"

# 清理临时文件
rm -f temp_header.sql temp_footer.sql "$OUTPUT_FILE"

echo "✅ 清洗完成: ${OUTPUT_FILE%.sql}_final.sql"
echo "📊 统计信息:"
echo "   - 表数量: $(grep -c "^CREATE TABLE" "${OUTPUT_FILE%.sql}_final.sql")"
echo "   - 文件大小: $(du -h "${OUTPUT_FILE%.sql}_final.sql" | cut -f1)"
echo "   - 行数: $(wc -l < "${OUTPUT_FILE%.sql}_final.sql")"
```

*使用方法*：

```bash
chmod +x clean_flyway_sql.sh
./clean_flyway_sql.sh V1__initial_schema.sql

# 输出：
# 🔧 开始清洗: V1__initial_schema.sql
# ✅ 清洗完成: V1__initial_schema_cleaned_final.sql
# 📊 统计信息:
#    - 表数量: 50
#    - 文件大小: 1.2M
#    - 行数: 3420
```

### 手动清洗检查清单 ###

如果不想用脚本，至少手动检查这5点：

```bash
-- ✅ 文件头部应该有
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ❌ 不应该有这些（删除！）
DROP TABLE IF EXISTS `users`;
CREATE DATABASE IF NOT EXISTS `mydb`;
USE `mydb`;

-- ✅ 表定义应该完整保留
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ✅ 文件尾部应该有
SET FOREIGN_KEY_CHECKS = 1;
```

## 基线接入执行 ##

### 目录结构 ###

```txt
src/main/resources/
└── db/
    └── migration/
        ├── V1__initial_schema.sql    ← 清洗后的文件
        ├── V2__add_user_index.sql    ← 后续增量脚本
        ├── V2_1__add_order_status.sql
        └── R__refresh_report_views.sql  ← 可重复脚本
```

### 执行基线命令 ###

#### 方式A：自动基线（推荐） ####

```bash
flyway \
  -url=jdbc:mysql://localhost:3306/mydb \
  -user=root \
  -password=secret \
  -locations=filesystem:./migrations \
  -baselineVersion=1 \
  -baselineOnMigrate=true \
  migrate
```

#### 方式B：手动基线（更严谨） ####

```bash
# 第一步：标记基线
flyway -baselineVersion=1 baseline

# 第二步：执行迁移（会跳过V1，从V2开始）
flyway migrate
```

### 验证结果 ###

```bash
# 查看迁移状态
flyway info
```

预期输出：

```txt
+-----------+----------------------+----------+----------+---------------------+
| Version   | Description          | State    | Type     | Installed On        |
+-----------+----------------------+----------+----------+---------------------+
| 1         | Initial schema       | Success  | BASELINE | 2026-04-08 10:30:15 |
+-----------+----------------------+----------+----------+---------------------+
```

检查数据库：


```sql
-- 1. 查看元数据表
SELECT * FROM flyway_schema_history;

-- 结果应该只有1条记录，version=1，state=Success

-- 2. 确认表结构未改变
SHOW TABLES;
-- 应该还是原来的50张表，没有被DROP

-- 3. 确认数据完整
SELECT COUNT(*) FROM users;
-- 数据量应该和迁移前一致
```

## 避坑指南 ##

### 坑1：外键依赖报错 ###

*现象*：

```txt
ERROR: Cannot add foreign key constraint
```

*原因*：表创建顺序错误，子表先于父表创建

*解决方案*：

```sql
-- ✅ 保留导出时的外键检查开关
SET FOREIGN_KEY_CHECKS = 0;

-- 所有 CREATE TABLE 语句（顺序无所谓）
CREATE TABLE child (... FOREIGN KEY (parent_id) REFERENCES parent(id));
CREATE TABLE parent (...);

SET FOREIGN_KEY_CHECKS = 1;
```

### 坑2：自增ID冲突 ###

*现象*：新环境初始化后，插入数据报 `Duplicate entry '1'`

*原因*：基线脚本中 `AUTO_INCREMENT=1`，但业务数据已从100开始

*解决方案*：

```bash
# 方法1：导出后统一修改
sed -i 's/AUTO_INCREMENT=[0-9]*/AUTO_INCREMENT=10000/g' V1__initial_schema.sql

# 方法2：在脚本头部统一设置
cat >> V1__initial_schema.sql << EOF
-- 重置自增起点
ALTER TABLE users AUTO_INCREMENT=10000;
ALTER TABLE orders AUTO_INCREMENT=10000;
EOF
```

### 坑3：视图/存储过程混入 ###

*现象*：基线执行失败，报权限不足或语法错误

*原因*：视图依赖的表还没创建，或存储过程需要特殊权限

*解决方案*：

```txt
✅ 正确做法：
- V1__initial_schema.sql：只放表/索引/约束
- R__create_views.sql：用可重复脚本管理视图
- R__create_procedures.sql：用可重复脚本管理存储过程

Flyway 会自动按顺序：
1. 执行 V1（建表）
2. 执行 R__（创建视图/过程）
```

### 坑4：字符集不一致 ###

*现象*：中文乱码，或索引失效

*解决方案*：

```sql
-- 在脚本头部统一设置
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 每个表明确指定
CREATE TABLE `users` (
  ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 坑5：Git 提交过大 ###

*现象*：5MB 的 SQL 文件触发 CI 扫描慢，或 Git 历史膨胀

*解决方案*：

```bash
# 方案1：按模块拆分（适合>100张表）
V1_1__core_tables.sql      # 用户、权限等核心表（10张）
V1_2__business_tables.sql  # 订单、商品等业务表（30张）
V1_3__log_tables.sql       # 日志、审计表（10张）

# 方案2：使用 Git LFS
git lfs track "*.sql"
git add V1__initial_schema.sql
git commit -m "Add baseline schema"

# 方案3：压缩后提交（不推荐，难Review）
gzip V1__initial_schema.sql
# 但 Flyway 不支持 .sql.gz，需解压后执行
```

## 自动化脚本 ##

### 完整的一键迁移脚本 ###

创建 `migrate_baseline.sh`：

```bash
#!/bin/bash
# Flyway 基线迁移一键脚本
# 用法：./migrate_baseline.sh mydb root password

set -e  # 遇到错误立即退出

DB_NAME=$1
DB_USER=${2:-root}
DB_PASS=${3:-}
FLYWAY_URL="jdbc:mysql://localhost:3306/${DB_NAME}"

echo "🚀 开始 Flyway 基线迁移"
echo "   数据库: ${DB_NAME}"
echo "   用户: ${DB_USER}"
echo ""

# Step 1: 导出DDL
echo "📦 Step 1: 导出数据库结构..."
mysqldump -u "${DB_USER}" \
  ${DB_PASS:+-p"${DB_PASS}"} \
  --no-data \
  --skip-add-drop-table \
  --skip-triggers \
  --no-create-db \
  --skip-add-locks \
  --routines=0 \
  --events=0 \
  "${DB_NAME}" > V1__initial_schema.sql

TABLE_COUNT=$(grep -c "^CREATE TABLE" V1__initial_schema.sql)
echo "   ✅ 导出完成，共 ${TABLE_COUNT} 张表"

# Step 2: 清洗脚本
echo "🔧 Step 2: 清洗SQL脚本..."
cat V1__initial_schema.sql | \
  sed '/^DROP TABLE IF EXISTS/d' | \
  sed '/^CREATE DATABASE/d' | \
  sed '/^USE /d' | \
  sed '/^CREATE.*TRIGGER/,/;$/d' | \
  sed '/^CREATE.*PROCEDURE/,/^END/d' | \
  sed 's/CHARSET=utf8[^ ]*/CHARSET=utf8mb4/g' \
  > V1__initial_schema_clean.sql

# 添加头部注释
cat > V1__initial_schema.sql << EOF
-- =====================================================
-- Flyway Migration: V1 - Initial Schema
-- Database: ${DB_NAME}
-- Generated: $(date +%Y-%m-%d_%H:%M:%S)
-- Tables: ${TABLE_COUNT}
--
-- WARNING: This is a BASELINE script.
-- Do NOT modify existing tables here.
-- Use V2__, V3__ for incremental changes.
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

EOF

cat V1__initial_schema_clean.sql >> V1__initial_schema.sql
echo "SET FOREIGN_KEY_CHECKS = 1;" >> V1__initial_schema.sql

rm -f V1__initial_schema_clean.sql
echo "   ✅ 清洗完成"

# Step 3: 移动到migration目录
echo "📁 Step 3: 移动到迁移目录..."
mkdir -p src/main/resources/db/migration
mv V1__initial_schema.sql src/main/resources/db/migration/
echo "   ✅ 已放入 src/main/resources/db/migration/"

# Step 4: 执行基线
echo "🎯 Step 4: 执行Flyway基线..."
flyway \
  -url="${FLYWAY_URL}" \
  -user="${DB_USER}" \
  ${DB_PASS:+-password="${DB_PASS}"} \
  -locations=filesystem:src/main/resources/db/migration \
  -baselineVersion=1 \
  -baselineOnMigrate=true \
  migrate

echo ""
echo "🎉 基线迁移完成！"
echo ""
echo "后续操作："
echo "1. 新增表结构变更 → 创建 V2__xxx.sql"
echo "2. 查看迁移状态 → flyway info"
echo "3. 验证数据完整性 → SELECT COUNT(*) FROM your_table"
```

使用方法：

```bash
chmod +x migrate_baseline.sh
./migrate_baseline.sh mydb root your_password
```

## 总结 ##

### 核心要点回顾 ###

- 一键导出：`mysqldump --no-data --skip-add-drop-table`
- 智能清洗：删除 DROP/USE/CREATE DATABASE，保留外键检查
- 基线接入：`flyway -baselineVersion=1 -baselineOnMigrate=true migrate`
- 零数据风险：基线只记录版本，不执行DDL（表已存在）

### 时间对比 ###

| 方法 | 50张表耗时 | 风险 | 可维护性 |
| :--- | :--- | :--- | :--- |
| 手写50个脚本 | 2-3天 | 中（易漏表） | 差 |
| 导出后手动拼接 | 2小时 | 中（易出错） | 中 |
| 一键导出+清洗 | 5分钟 | 低（自动化） | 优 ✅ |

### 最佳实践清单 ###

✅ 基线脚本只放表/索引/约束，视图/过程用 R__ 脚本
✅ 统一字符集为 utf8mb4
✅ 保留 FOREIGN_KEY_CHECKS=0/1 包裹
✅ 生产环境设置 flyway.cleanDisabled=true
✅ CI/CD 中强制 flyway validate

### 后续迭代建议 ###

```txt
V1__initial_schema.sql    ← 基线（已完成）
↓
V2__add_user_email_index.sql
V2_1__add_order_cancel_reason.sql
V3__refactor_payment_module.sql
↓
R__refresh_report_views.sql  ← 可重复脚本
R__update_stored_procedures.sql
```
