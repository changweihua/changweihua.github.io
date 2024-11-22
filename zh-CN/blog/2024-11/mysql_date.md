---
lastUpdated: true
commentabled: true
recommended: true
title: MySQL 数据查询整理，查询今天、昨天、本周、本月等的数据
description: MySQL 数据查询整理，查询今天、昨天、本周、本月等的数据
date: 2024-11-14 13:18:00
pageClass: blog-page-class
---

# MySQL 数据查询整理，查询今天、昨天、本周、本月等的数据 #

## MySQL使用日期统计数据或条件查询。 ##

### 查询当天 (今天) 数据 ###

```sql
select * from 表名 where to_days(时间字段名) = to_days(now());
```

> to_days函数：返回从0000年（公元1年）至当前日期的总天数

### 查询昨天数据 ###

```sql
select * from 表名 where to_days(now()) - to_days(时间字段名) <= 1;
```

### 查询近7天数据 ###

```sql
select * from 表名 where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(时间字段名);
```

> DATE() 函数返回日期或日期/时间表达式的日期部分。
> 2008-12-29 16:25:46.635 -> 2008-12-29
> CURDATE() 函数返回当前的日期。

### 查询近30天的数据 ###

```sql
select * from 表名 where DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(时间字段名);
```

### 查询本月数据 ###

**方法一**

```sql
select * from 表名 where DATE_FORMAT(时间字段名, '%Y%m') = DATE_FORMAT(CURDATE( ), '%Y%m');
```

**方法二**

```
select * from 表名 where YEAR(时间字段) = YEAR(CURDATE()) and  MONTH(时间字段) = MONTH(CURDATE());
//定义本年的本月
 MONTH(时间字段) = MONTH(CURDATE())//获取当前月时间
 YEAR(时间字段) = YEAR(CURDATE())//获取当前年份
```
:::tip 提示
DATE_FORMAT() 函数用于以不同的格式显示日期/时间数据。

```sql
DATE_FORMAT(date,format)
```

date 参数是合法的日期。format 规定日期/时间的输出格式。
:::

### 查询上个月数据 ###

```sql
select * from 表名 where PERIOD_DIFF(DATE_FORMAT(now() , '%Y%m'), DATE_FORMAT(时间字段名, '%Y%m')) = 1;
```

> PERIOD_DIFF() 函数返回两个周期之间的差值


### 查询本季度数据 ###

```sql
select * from 表名 where QUARTER(时间字段) = QUARTER(now()) AND YEAR(时间字段) = YEAR(now());
```

> QUARTER() 函数返回给定日期值（从 1 到 4 的数字）的一年中的季度。
> YEAR()函数接受date参数，并返回日期的年份。

### 查询上季度数据 ###

```sql
select * from 表名 where QUARTER(时间字段) = QUARTER(DATE_SUB(now(),interval 1 QUARTER))AND YEAR(时间字段) = YEAR(now());
```

### 查询本年数据 ###

```sql
select * from 表名 where YEAR(时间字段) = YEAR(now());
```

### 查询上年数据 ###

```sql
select * from 表名 where YEAR(时间字段) = YEAR(DATE_SUB(now(), INTERVAL 1 year));
```

### 查询本周数据 ###

```sql
select * from 表名 where YEARWEEK(date_format(时间字段,'%Y-%m-%d')) = YEARWEEK(now());
```

> YEARWEEK() 函数返回给定日期的年和周数（从 0 到 53 的数字）。
> YEARWEEK(date, firstdayofweek)
> 这里有firstdayofweek，可选。 指定一周从哪一天开始。中国习惯：1 - 一周的第一天是星期一，第一周超过 3 天

### 查询上周数据 ###

```sql
select * from 表名 where YEARWEEK(date_format(时间字段,'%Y-%m-%d')) = YEARWEEK(now())-1;
```

### 查询上个月的数据 ###

```sql
select * from 表名 where date_format(submittime,'%Y-%m') = date_format(DATE_SUB(curdate(), INTERVAL 1 MONTH),'%Y-%m')
 
select * from 表名 where DATE_FORMAT(时间字段,'%Y%m') = DATE_FORMAT(CURDATE(),'%Y%m'); 
 
select * from 表名 where WEEKOFYEAR(FROM_UNIXTIME(时间字段,'%y-%m-%d')) = WEEKOFYEAR(now()); 
 
select * from 表名 where MONTH(FROM_UNIXTIME(时间字段,'%y-%m-%d')) = MONTH(now());
 
select * from 表名 where YEAR(FROM_UNIXTIME(时间字段,'%y-%m-%d')) = YEAR(now()) and MONTH(FROM_UNIXTIME(时间字段,'%y-%m-%d')) = MONTH(now());
 
select * from 表名 where 时间字段 between 上月最后一天 and 下月第一天;
```

### 查询10分钟以内的数据 ###

```sql
select * from 表名 where 时间字段 >= CURRENT_TIMESTAMP - INTERVAL 10 MINUTE;
```

### 查询一段时间的数据 ###

```sql
SELECT * FROM 表名 WHERE 时间字段 BETWEEN 一段时间的开始 AND 一段时间的结束；

SELECT * FROM 表名 WHERE date_format(时间字段,'%Y-%m-%d') BETWEEN date_format(一段时间的开始,'%Y-%m-%d') AND date_format(一段时间的结束,'%Y-%m-%d')；
```

> 使用BETWEEN AND 查到的时间段数据是不包含后面的边界的。可以使用DATE_SUB加一天减一秒的方式扩大后边界，或者使用TO_DAYS转换为天数。

### 查询距离现在6个月内的数据 ###

```sql
select * from 表名 where 时间字段 between DATE_SUB(now(), INTERVAL 6 MONTH) and now();
```
