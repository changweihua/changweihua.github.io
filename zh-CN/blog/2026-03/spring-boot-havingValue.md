---
lastUpdated: true
commentabled: true
recommended: true
title: 一个 havingValue=""
description: Spring Boot 条件注解每次看到都让我懵逼一会的配置
date: 2026-03-19 09:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

> 每次看到这个小东西我都要楞一下，烦人，今天非得记录一把

## 现象 ##

下面这个条件注解：

```java
@ConditionalOnProperty(
    prefix = "demo.feature",
    name = "enabled",
    havingValue = ""
)
```

配置文件中写：

```yaml
demo:
  feature:
    enabled: true
```

Bean 被加载了。

如果你以为 `havingValue=""` 表示“`只匹配空字符串`”，那这个结果一定不符合预期。

## 结论先行 ##

`havingValue = ""` 并不表示匹配空值。

真实含义是：

> 属性存在，且值不等于 false，条件成立

这不是 Bug，是 Spring Boot 的既定行为。

## 源码怎么判的 ##

核心逻辑在 OnPropertyCondition：

```java
private boolean isMatch(String value, String requiredValue) {
    if (StringUtils.hasLength(requiredValue)) {
        return requiredValue.equalsIgnoreCase(value);
    }
    return !"false".equalsIgnoreCase(value);
}
```

关键点只有一个：

> `havingValue="" → hasLength("") == false`

直接进入兜底逻辑：

> 只要值不是 "false"，就返回 true

## 实际判定规则 ##

当 `havingValue=""` 时，等价判断如下：


|  配置值   |    是否生效  |
| :-----------: | :-----------: |
| true | ✅ |
| 1 / yes / on | ✅ |
| 空字符串 | ✅ |
| false | ❌ |

> 注意：根本不存在“等于空字符串才生效”这回事。

## 为什么这么设计 ##

Spring Boot 对开关型配置的默认态度一直很明确：

> 存在即启用，除非显式关闭

`havingValue=""` 只是触发了这套默认逻辑。

这也是为什么很多自动配置只写：

```java
@ConditionalOnProperty(prefix = "xxx", name = "enabled")
```

## 正确使用建议（经验结论） ##

### 1️⃣ 明确语义的写法（推荐） ###

```ini
havingValue = "true"
```

谁看都不会误解，行为稳定。

### 2️⃣ 不推荐但常见的写法 ###

```ini
havingValue = ""
```

这行代码的真实含义，90% 的人第一眼都会理解错。

## 这次踩坑的本质 ##

问题不在 Spring，而在于：

> 人会把“空字符串”当成业务语义，但 Spring 只把它当成“未配置规则”

如果你不翻源码，就永远以为自己用对了。

## 记录一句话 ##

`@ConditionalOnProperty` 从来不是“值匹配注解”，而是“布尔开关注解”。
