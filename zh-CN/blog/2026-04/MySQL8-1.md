---
lastUpdated: true
commentabled: true
recommended: true
title: MySQL 8 窗口函数真香 
description: Java 告别繁琐数据统计代码！
date: 2026-04-30 12:30:00 
pageClass: blog-page-class
cover: /covers/mysql.svg
---

大家在开发中有没有遇到过这样的场景：需要对数据进行排名、分组统计、求前后行数据、计算累计和？如果只用Java代码硬写，往往要写一堆循环、判断，既繁琐又容易出错；但如果用MySQL8新增的窗口函数，可能一行SQL就能搞定！今天我们就一起来解锁这个“效率神器”

## 一、先看对比：Java硬写统计 vs MySQL窗口函数，差距太明显！ ##

假设我们有一个员工表（emp），包含员工ID（emp_id）、部门ID（dept_id）、员工工资（salary），现在要实现一个需求：查询每个员工的工资，以及他所在部门的工资排名、部门内工资总和。

### Java代码硬写（繁琐版） ###

如果不用窗口函数，我们用Java实现的思路大概是这样：

```java
import java.util.*;
import java.util.stream.Collectors;

// 员工实体类
class Emp {
    private Integer empId;
    private Integer deptId;
    private Integer salary;
}

public class EmpStatistic {
    public static void main(String[] args) {
        // 1. 模拟查询所有员工信息（实际开发中从数据库查询）
        List<Emp> empList = Arrays.asList(
                new Emp(1, 101, 8000),
                new Emp(2, 101, 9500),
                new Emp(3, 101, 8000),
                new Emp(4, 102, 7500),
                new Emp(5, 102, 10000)
        );

        // 2. 按部门ID分组（key：部门ID，value：该部门所有员工）
        Map<Integer, List<Emp>> deptEmpMap = empList.stream()
                .collect(Collectors.groupingBy(Emp::getDeptId));

        // 3. 遍历每个部门，计算部门工资总和、给员工排名
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Integer, List<Emp>> entry : deptEmpMap.entrySet()) {
            Integer deptId = entry.getKey();
            List<Emp> deptEmps = entry.getValue();

            // 计算部门工资总和
            Integer deptSalTotal = deptEmps.stream()
                    .mapToInt(Emp::getSalary)
                    .sum();

            // 按工资降序排序，给员工排名（处理并列排名，对应RANK()逻辑）
            List<Emp> sortedEmps = deptEmps.stream()
                    .sorted((e1, e2) -> Integer.compare(e2.getSalary(), e1.getSalary()))
                    .collect(Collectors.toList());

            // 给每个员工分配排名
            for (int i = 0; i < sortedEmps.size(); i++) {
                Emp emp = sortedEmps.get(i);
                int rank = i + 1;
                // 处理并列：如果当前员工工资和上一个相同，排名相同
                if (i > 0 && emp.getSalary().equals(sortedEmps.get(i-1).getSalary())) {
                    rank = result.get(result.size()-1).get("deptSalRank") != null ?
                            (Integer) result.get(result.size()-1).get("deptSalRank") : rank;
                }

                // 封装结果（保留原始员工信息，添加排名、部门工资总和）
                Map<String, Object> empResult = new HashMap<>();
                empResult.put("empId", emp.getEmpId());
                empResult.put("deptId", deptId);
                empResult.put("salary", emp.getSalary());
                empResult.put("deptSalRank", rank);
                empResult.put("deptSalTotal", deptSalTotal);
                result.add(empResult);
            }
        }

        // 输出结果（实际开发中返回给前端或其他服务）
        for (Map<String, Object> map : result) {
            System.out.println(map);
        }
    }
}
```

这段代码完整实现了需求，包含员工实体类、分组、排序、排名、求和等逻辑，足足几十行代码。

- 先查询所有员工的信息，存入List集合；
- 遍历集合，按部门ID分组，把每个部门的员工单独存到一个子集合；
- 对每个部门的子集合，按工资降序排序，给每个员工分配排名；
- 再遍历每个部门的子集合，计算部门内的工资总和；
- 最后把排名、部门工资总和，和员工原有信息拼接起来，返回结果。

光听思路就觉得麻烦吧？实际写代码还要处理空值、排序异常、分组逻辑，至少要写几十行代码，而且数据量大的时候，循环遍历会特别耗时，维护起来也头疼。

### MySQL窗口函数（简洁版） ###

同样的需求，用MySQL8的窗口函数，一行SQL就能搞定：

```sql
SELECT 
  emp_id,
  dept_id,
  salary,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_sal_rank, -- 部门内工资排名
  SUM(salary) OVER (PARTITION BY dept_id) AS dept_sal_total -- 部门工资总和
FROM emp;
```

是不是瞬间清爽了？没有复杂的循环，没有繁琐的分组判断，SQL直接帮我们完成了统计。看到这里，你是不是已经对窗口函数充满好奇了？👉 评论区说说，你以前处理这种统计需求，用的是哪种方式？

其实窗口函数的核心就是“简化复杂统计”，接下来我们就正式介绍它，看看它到底能解决哪些问题，具体怎么用。

## 二、什么是窗口函数？它主要解决什么问题？ ##

### 窗口函数的定义 ###

窗口函数（Window Function）是 MySQL 8 新增的核心功能，它的本质是：对数据集合进行“分区、排序、计算”，在不改变原有数据行数的前提下，对每行数据进行额外的统计计算。

这里的“窗口”，可以理解为“一个被划定的数据集”——我们可以把整个表当作一个窗口，也可以按某个字段（比如部门ID）把表分成多个小窗口，然后在每个窗口内进行统计。

### 窗口函数主要解决的问题 ###

在窗口函数出现之前，很多统计需求要么用Java代码硬写，要么用GROUP BY分组（但GROUP BY会合并行，无法保留每行的原始数据），窗口函数正好解决了这些痛点，主要适用以下场景：

- 排名类需求：给每个分组内的数据排名（如部门内工资排名、班级内成绩排名）；
- 聚合类需求：计算每个分组内的累计和、平均值、最大值（如累计销售额、部门内平均工资）；
- 前后行关联需求：获取当前行的前一行、后一行数据（如获取员工的上一个同事、下一个同事的工资）；
- 比例类需求：计算每行数据占分组内总数据的比例（如员工工资占部门总工资的比例）。

简单说，只要你需要“既保留原始数据，又要对数据进行分组统计”，窗口函数就是最优解。大家可以想一想，你平时开发中，有没有遇到过上面这些场景？

接下来我们就用几个典型示例，带你快速上手窗口函数，看看它实际用法有多简单。

## 三、窗口函数典型示例：一看就会，一用就通 ##

窗口函数的通用语法很简单：`函数名() OVER (PARTITION BY 分组字段 ORDER BY 排序字段)`，其中 `PARTITION BY`（可选）用来划分窗口（分组），`ORDER BY`（可选）用来对窗口内的数据排序。

下面我们结合具体需求，介绍几个最常用的窗口函数，全程用上面的员工表（emp）举例，大家可以直接复制SQL测试～

### 示例1：排名函数（RANK()、DENSE_RANK()、ROW_NUMBER()） ###

需求：查询每个员工的工资，以及部门内的工资排名（处理并列排名）。

```sql
SELECT 
  emp_id,
  dept_id,
  salary,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank1, -- 并列排名，跳过后续名次（如1、1、3）
  DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank2, -- 并列排名，不跳过后续名次（如1、1、2）
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank3 -- 不考虑并列，依次排序（如1、2、3）
FROM emp;
```

小提示：如果不需要分组（比如给所有员工按工资排名），直接去掉 `PARTITION BY` 即可。你觉得这三个排名函数，哪个最常用？评论区留下你的答案～

### 示例2：聚合窗口函数（SUM()、AVG()、MAX()） ###

需求：查询每个员工的工资，以及部门内的工资总和、平均工资、最高工资。

```sql
SELECT 
  emp_id,
  dept_id,
  salary,
  SUM(salary) OVER (PARTITION BY dept_id) AS dept_sal_total, -- 部门工资总和
  AVG(salary) OVER (PARTITION BY dept_id) AS dept_sal_avg, -- 部门平均工资
  MAX(salary) OVER (PARTITION BY dept_id) AS dept_sal_max -- 部门最高工资
FROM emp;
```

这里要注意：聚合窗口函数和普通聚合函数（`GROUP BY+SUM`）的区别是——前者不合并行，每行都能显示统计结果，后者会合并分组后的行。

### 示例3：前后行函数（LAG()、LEAD()） ###

需求：查询每个员工的工资，以及他的上一个员工、下一个员工的工资（按部门内工资排序）。

```sql
SELECT 
  emp_id,
  dept_id,
  salary,
  LAG(salary, 1, 0) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS prev_sal, -- 上一行工资，无则显示0
  LEAD(salary, 1, 0) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS next_sal -- 下一行工资，无则显示0
FROM emp;
```

语法说明：`LAG(字段, 偏移量, 默认值)` 表示“获取当前行往前第N行的字段值”，LEAD则是“往后第N行”，非常适合做前后数据对比。

这三个示例基本覆盖了窗口函数的常用场景，是不是觉得很简单？

大家可能会有疑问：统计功能经常会用到统计表（提前存储统计结果的表），那窗口函数和我们平时用的“统计表”相比，哪个更好？接下来我们就做一个详细对比，帮你快速选择。

## 四、窗口函数 vs 统计表：该选哪个？ ##

很多项目中，为了提高统计效率，会专门创建“统计表”（比如`dept_sal_stat`，存储每个部门的工资总和、平均工资等），定期通过定时任务更新统计数据。

下面我们从多个维度，对比窗口函数和统计表的优劣：

|  对比维度   |      窗口函数 |   统计表 |
| :-----------: | :-----------: | :-----------: |
|  实时性   |      高：实时计算，数据变更后立即能查询到最新统计结果 |   低：依赖定时任务更新，存在数据延迟（比如每小时更新一次） |
|  执行效率   |      数据量小时高效；数据量大、窗口复杂时低效 |   高：直接查询统计结果，无需实时计算，不受数据量影响 |
|  维护成本   |      低：无需额外创建表，无需维护定时任务，SQL直接计算 |   高：需要创建统计表，维护定时任务（处理数据更新、异常），还要考虑数据一致性 |
|  灵活性   |      高：可灵活调整分组、排序、统计逻辑，支持多种复杂统计需求 |   低：统计逻辑固定，修改统计需求时，需要修改统计表结构和定时任务 |

总结选择建议：

- 如果是实时统计、统计逻辑灵活、数据量不大（比如后台管理系统的报表查询），优先用窗口函数；
- 如果是高并发查询、数据量极大、统计逻辑固定（比如首页展示的核心统计数据），优先用统计表。

了解完窗口函数与统计表的区别，我们也要清楚：窗口函数也不是万能的，它有自身的局限性，接下来我们就聊聊它的弊端和不适用情况，避免大家用错地方。

## 五、窗口函数的弊端和不适用情况 ##

虽然窗口函数很强大，但它也有自身的局限性，不是所有场景都适合用，大家一定要避开这些“坑”：

### 窗口函数的弊端 ###

- 性能问题：当数据量极大（百万级、千万级），且窗口划分复杂（比如多字段分组、排序）时，窗口函数的执行效率会明显下降——因为它需要对每个窗口进行排序和计算，消耗较多的CPU和内存；
- 逻辑复杂度高（复杂场景）：如果需要多个窗口嵌套、多条件组合统计，SQL语句会变得冗长，可读性和维护性会下降。

### 窗口函数的不适用情况 ###

- 简单聚合需求：如果只是单纯的“求总数量、总金额”，不需要保留原始数据，用普通GROUP BY+聚合函数更高效（比如“查询每个部门的工资总和”，直接GROUP BY dept_id即可）；
- 数据量极大且无索引：没有合适的索引（比如分组字段、排序字段无索引），窗口函数的排序操作会触发全表扫描，效率极低，此时不如用Java代码分批处理，或提前预处理数据；

看到这里，相信大家已经对窗口函数有了全面的了解——从它的便捷性，到具体用法，再到与统计表的对比、自身弊端，都已经讲得很清楚了。最后我们做一个整体总结，帮大家梳理重点，并新增附录方便大家查阅常用函数。

## 六、总结：窗口函数的核心价值与使用原则 ##

MySQL8的窗口函数，本质是“高效的分组统计工具”，它的核心价值在于：在不合并行的前提下，快速实现复杂统计，简化代码（替代繁琐的Java循环或多表关联）。

使用窗口函数的核心原则的是：

- 优先用于“保留原始数据+分组统计”的场景，避免用在简单聚合、数据量极大无索引的场景；
- 结合性能场景选型：实时、灵活选窗口函数；高并发、大数据量选统计表。

窗口函数虽然简单，但能极大提升我们的开发效率，尤其是在报表开发、数据统计场景中，堪称“神器”。希望这篇文章能帮你学会窗口函数，避开使用误区，少写无用代码～


## 附录：MySQL8常用窗口函数及功能说明 ##

为方便大家日常查阅使用，以下整理了MySQL8中最常用的窗口函数，按功能分类呈现，结合示例便于理解：

|  函数名称   |      功能说明 |   简单示例 |
| :-----------: | :-----------: | :-----------: |
|  `RANK()`   |      分组内排名，并列排名会跳过后续名次（如1、1、3） |   `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `DENSE_RANK()`   |      分组内排名，并列排名不跳过后续名次（如1、1、2） |   `DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `ROW_NUMBER()`   |      分组内排序，不考虑并列，依次分配唯一名次（如1、2、3） |   `ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `PERCENT_RANK()`   |      分组内计算相对排名百分比，取值范围`[0,1]`，公式：(当前排名-1)/(总条数-1) |   `PERCENT_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `NTILE(n)`   |      将分组内数据平均分成n组，返回当前行所在的组号，不足分组时自动调整 |   `NTILE(2) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `SUM()`   |      计算分组内指定字段的总和，不合并原始行 |   `SUM(salary) OVER (PARTITION BY dept_id)` |
|  `AVG()`   |      计算分组内指定字段的平均值，不合并原始行 |   `AVG(salary) OVER (PARTITION BY dept_id)` |
|  `MAX()`   |      计算分组内指定字段的最大值，不合并原始行 |   `MAX(salary) OVER (PARTITION BY dept_id)` |
|  `FIRST_VALUE()`   |      返回分组内排序后，当前窗口的第一行指定字段的值 |   `FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `LAST_VALUE()`   |      返回分组内排序后，当前窗口的最后一行指定字段的值 |   `LAST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `NTH_VALUE(字段, n)`   |      返回分组内排序后，当前窗口的第n行指定字段的值，n为正整数 |   `NTH_VALUE(salary, 2) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `LAG()`   |      获取当前行往前第N行的指定字段值，可设置默认值 |   `LAG(salary, 1, 0) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |
|  `LEAD()`   |      获取当前行往后第N行的指定字段值，可设置默认值 |   `LEAD(salary, 1, 0) OVER (PARTITION BY dept_id ORDER BY salary DESC)` |

