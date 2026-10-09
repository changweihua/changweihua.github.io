---
lastUpdated: true
commentabled: true
recommended: true
title: 一个接口多个实现，Spring 怎么"适配多场景"？
description: 一个接口多个实现，Spring 怎么"适配多场景"？
date: 2026-09-17 08:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

你正给后台加个报表导出：用户点一下，PDF、Excel、CSV 随便选。三个实现你全备齐了：

```java
public interface ReportExporter {
    boolean supports(String format);   // 我支持啥格式
    byte[] export(List rows);          // 导出
}

@Service
public class PdfExporter implements ReportExporter { ... }    // PDF

@Service
public class ExcelExporter implements ReportExporter { ... }  // Excel

@Service
public class CsvExporter implements ReportExporter { ... }    // CSV
```

然后随手一注：

```java
@Service
public class ReportService {
    @Autowired
    private ReportExporter exporter;   // 容器里仨，要哪个？
}
```

启动，啪——

```java
NoUniqueBeanDefinitionException: No qualifying bean of type 'ReportExporter' available:
expected single matching bean but found 3: csvExporter, excelExporter, pdfExporter
```

一个接口仨实现，Spring 懵了：你到底要哪个？

- 一个接口多个实现，Spring 凭什么选？
- 能不能一次把所有实现都拿到？
- 有些依赖”可能有也可能没有”，怎么不报错？

## 一个接口多个实现，Spring 听谁的 ##

容器里有三个 `ReportExporter`，Spring 不知道选哪个。三个解法，各有脾气。

### 解法一：@Primary——”有多个时，默认选我” ###

```java
@Service
@Primary
public class ExcelExporter implements ReportExporter { ... }
```

`@Primary` 标在某个实现上，意思是”有多个候选时，默认选我”。这下 @Autowired ReportExporter 不报错了，注入的是 ExcelExporter。

适合场景：大多数情况都用某一个实现，偶尔切换。比如默认导出 Excel，个别要 PDF 的再单独点名。

### 解法二：@Qualifier——”我点名要这个” ###

```java
@Service
public class ReportService {
    @Autowired
    @Qualifier("pdfExporter")
    private ReportExporter exporter;
}
```

`@Qualifier` 跟在 `@Autowire`d 后面，按 Bean 名字精确指定。比 `@Primary` 更明确——你要谁就是谁。代价是耦合到了具体的 Bean 名字上，Bean 一改名，注入也得跟着改。

适合场景：这个字段就是要那个特定的实现，没得商量。

### 解法三：`@Resource`——”我按名字找” ###

```java
@Service
public class ReportService {
    @Resource(name = "pdfExporter")
    private ReportExporter exporter;
}
```

`@Resource` 是 JSR-250 标准注解（不是 Spring 的），匹配规则是先按名字，再按类型。你可以理解成”加强版的 `@Autowired + @Qualifier`“。

那它和 @Autowired 到底差在哪？

| 对比维度 | @Autowired | @Resource |
| :--- | :--- | :--- |
| 来源 | Spring 自带 | JSR-250 标准（Java 规范） |
| 默认匹配 | 按类型 | 按名字 |
| 找不到时 | 报错（除非 required=false） | 回退按类型 |
| 能用在构造器上吗 | 能 | 不能（Spring 只支持字段/setter 上的 @Resource） |
| 推荐场景 | 构造器注入配它，或字段/setter | 字段/setter 注入按名字找 |

### Spring 到底怎么选的？ ###

| 试到哪级 | Spring 问自己 | 命中就 |
| :--- | :--- | :--- |
| ① | 你标了 @Qualifier 点名？ | 注入它指定的 |
| ② | 有 @Primary 实现吗？ | 注入那个 |
| ③ | 字段名恰好等于某个 Bean 名？ | 按名字注入 |
| 都不中 |  | 报 NoUniqueBeanDefinitionException |

候选有多个时，Spring 按下面这个顺序逐级往下试，命中哪级就用哪级：


`@Qualifier` 居首，`@Primary` 次之，”凑名字”殿后。

## 一次注入全部实现：List 和 Map ##

换个思路——多个实现，干嘛非得选一个？全都要。

### 注入 List：拿到所有实现 ###

```java
@Service
public class ReportService {

    private final List<ReportExporter> exporters;

    public ReportService(List<ReportExporter> exporters) {
        this.exporters = exporters;
    }

    public byte[] export(String format, List rows) {
        for (ReportExporter e : exporters) {
            if (e.supports(format)) {
                return e.export(rows);
            }
        }
        throw new IllegalArgumentException("不支持的格式：" + format);
    }
}
```

Spring 看到你要 `List<ReportExporter>`，会把容器里所有 `ReportExporter` 类型的 `Bean` 收集起来，按顺序塞进 List。你哪天加个 `HtmlExporter`，啥都不用改，自动进 `List`。

> 这是策略模式最优雅的 Spring 实现——注册即生效，零配置。

### 注入 Map：按 Bean 名字索引 ###

更进一步的玩法：

```java
@Service
public class ReportService {

    private final Map<String, ReportExporter> exporterMap;

    public ReportService(Map<String, ReportExporter> exporterMap) {
        this.exporterMap = exporterMap;
    }

    public byte[] export(String format, List rows) {
        ReportExporter e = exporterMap.get(format + "Exporter");   // "pdf" -> pdfExporter
        if (e == null) {
            throw new IllegalArgumentException("不支持的格式：" + format);
        }
        return e.export(rows);
    }
}
```

`Map<String, ReportExporter>` 的 `key` 是 `Bean` 名字（默认类名首字母小写），`value` 是 `Bean` 实例。这样就能按名字 O(1) 直接查找，不用循环——用户传 `format=pdf，get("pdfExporter")` 直接拿到。

| 注入方式 | key 是什么 | 适合场景 |
| :--- | :--- | :--- |
| `List<接口>` | 顺序索引 | 需要遍历所有实现、按条件分发 |
| `Map<String, 接口>` | Bean 名字 | 需要按名字精准定位某个实现 |

这一招能干掉业务代码里几乎所有的 if-else 分支。

## 兜底三件套：`@Lazy`、`ObjectProvider`、`Optional` ##

前面都是”依赖一定存在”的情况。可现实里有些依赖可能有、也可能没有——比如通知服务，配了就发、没配就跳过。这时候硬注入会报错。三个兜底工具，挑一个用。

### @Lazy：循环依赖的创可贴 ###

构造器循环依赖是无解的——除非上 `@Lazy`：

```java
@Service
public class AService {
    private final BService bService;

    public AService(@Lazy BService bService) {
        this.bService = bService;
    }
}
```

`@Lazy` 的作用：Spring 不真注入 BService，而是注入它的代理对象。

等 AService 真正调用 bService 的方法时，代理才去容器里找真正的 Bean。

这就打破了”构造 A 需要 B、构造 B 又需要 A”的死循环——A 构造时拿到的是 B 的代理（占位），B 可以照常构造。

但记住： `@Lazy` 是创可贴，不是治本的药。

循环依赖本身是设计问题，最好的解法是——重新设计、用事件解耦。

`@Lazy` 留给实在改不动的老代码。

### ObjectProvider：延迟 + 可选，Spring 原生 ###

`ObjectProvider<T>` 是 Spring 提供的延迟获取容器：

```java
@Service
public class OrderService {

    private final ObjectProvider<NotificationService> notificationProvider;

    public OrderService(ObjectProvider<NotificationService> notificationProvider) {
        this.notificationProvider = notificationProvider;
    }

    public void placeOrder(Order order) {
        saveOrder(order);
        // 容器里没有 NotificationService 也不报错
        notificationProvider.ifAvailable(ns -> ns.notify(order));
    }
}
```

它一手解决两件事：

- 延迟获取——构造时只拿到一个 `Provider`，真正用时才查容器
- 可选依赖——用 `ifAvailable` / `getIfAvailable`，找不到也不报错

比 `@Autowired(required = false)` 优雅的地方在于：它把”可选”这件事显式表达在类型上——光看构造器签名，你就知道这个依赖是 optional 的，不用翻注解。

### Optional：Java 8 风格的可选注入 ###

从 Spring 4.3 起，构造器里还能直接注入 `Optional`：

```java
@Service
public class OrderService {

    private final Optional<NotificationService> notificationService;

    public OrderService(Optional<NotificationService> notificationService) {
        this.notificationService = notificationService;
    }
}
```

语义和 `ObjectProvider` 类似，但用的是 JDK 自带的 `java.util.Optional`。哪个顺眼，看个人喜好——语义上都清楚。

### 三个怎么选 ###

| 工具 | 解决什么 | 典型场景 |
| :--- | :--- | :--- |
| `@Lazy` | 延迟到使用时才真正创建/查找 | 打破构造器循环依赖 |
| `ObjectProvider` | 延迟 + 可选，Spring 原生 | 可选依赖、延迟获取 |
| `Optional` | 可选，JDK 原生 | 可选依赖，语义清晰 |

一句话体会：这三个都是兜底，不是日常。

## 总结 ##

如果系统永远只导出一种格式，给那个实现标个 `@Primary` 就完事了。但对产品来说，固定一种格式太单一——今天要 Excel，明天加 PDF，后天又要 CSV，每加一种都得改代码、重新部署，扩展性太差。

真正”适配多场景”的正解：按前端传进来的 `format` 参数，直接从 `Map` 里取对应的导出器——

```java
ReportExporter e = exporterMap.get(format + "Exporter");   // format=pdf -> pdfExporter
```

哪天产品要加 HTML 导出？写个 `HtmlExporter` 扔进容器，`ReportService` 一行都不用改，自动生效。注册即生效、按需路由——这才是”适配多场景”该有的样子。

回过头看，一个接口多个实现从来不是 Spring 的 bug，而是它给你留的多场景适配口子。至于 `@Lazy`、`ObjectProvider` 这些兜底工具，留给真撞墙的时候；日常依赖老老实实写在构造器上、让它”必须存在”，是便宜得多的保险。
