---
lastUpdated: true
commentabled: true
recommended: true
title: 从Spring Boot 4.0升到4.1，我在Maven和gRPC上栽了跟头
description: 从Spring Boot 4.0升到4.1，我在Maven和gRPC上栽了跟头
date: 2026-06-30 11:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

先说结论：Spring Boot 4.1从4.0升上去确实不难，官方也说"增量更新、无破坏性变更"。但我的项目升完之后，CI挂了、gRPC服务起不来了。折腾了一下午，问题都出在"小变更"上。

记录一下过程，给准备升级的人提个醒。

## 升级动机

我们组的主力服务跑在Spring Boot 4.0.6上，稳定了大半年。4.1发布那天（6月10号），我看了一眼changelog，gRPC自动配置、SSRF防护、延迟数据源连接——几个点都挺实用。尤其是 `gRPC`，之前为了接微服务的RPC调用，我们自己写了一套 `starter` 来做自动配置，代码量不大但维护起来挺烦。4.1官方直接支持了，理论上可以把手写的starter干掉。

另外 `maven.test.skip` 那块改动我在 `release notes` 扫到了一眼，当时觉得"改个参数的事"，没当回事。

就是这两个"没当回事"，后面全炸了。

## Maven跳测试失效，CI全线飘红

升完版本，本地 `mvn clean package` 跑了一下，编译通过，没问题。顺手推到远端，等CI。

十分钟后 GitLab CI 全红。

一开始以为是环境问题，登上去看日志，发现所有模块的测试都跑了——而且有些测试在CI环境里本来就是要跳过的（依赖外部数据库、需要特定网络配置之类的）。

```txt
[ERROR] Tests run: 47, Failures: 3, Errors: 12, Skipped: 0
[ERROR] Failed to execute goal org.springframework.boot:spring-boot-maven-plugin:4.1.0:process-aot
```

我第一反应是：谁改了 `CI` 配置？看了一下 `pipeline` 定义，没动过。

再仔细看构建命令：

```bash
mvn clean package -DskipTests
```

这个命令我们用了三年了，一直在用。4.0及以下版本，`-DskipTests` 跳测试没问题。但4.1改了——Spring Boot Maven插件不再读 `-DskipTests` 了，得用 `maven.test.skip=true`。

翻了一下release notes，确实有这么一条：

> Maven plugin now requires maven.test.skip=true to skip tests during AOT processing; the -DskipTests parameter no longer takes effect.

注意这里有个细微区别：`-DskipTests` 是跳过测试执行但还是编译测试代码，而 `-Dmaven.test.skip=true` 是连测试代码都不编译。4.1的AOT处理流程改了，`-DskipTests` 这个参数被完全忽略了，不是"不跳"，是"根本不认这个参数"。

改法很简单，CI脚本里把`-DskipTests`换成`-Dmaven.test.skip=true`：

```bash
# 改前
mvn clean package -DskipTests

# 改后
mvn clean package -Dmaven.test.skip=true
```

改完CI就绿了。但我想说的是，如果你项目里有任何地方用了 `-DskipTests` 来跳测试——CI脚本、Makefile、Dockerfile构建步骤、甚至某个同事的alias——全得改。这不是一个"碰巧会踩到"的坑，是一个"一定会踩到但你发布notes里可能一眼扫过去"的坑。

我们组有个人的本地 `alias` 写的 `alias mvns='mvn package -DskipTests'`，升完之后他本地构建也挂了，跑来问我为什么。

## gRPC自动配置跟我手写的starter打架

第二个坑更隐蔽。

前面说了，我们之前自己写了一个gRPC starter来做自动配置。4.1官方原生支持gRPC了，我想着正好把自建的干掉，省事。
删掉自建starter的依赖，加了 `spring-boot-starter-grpc`，配了一下 `application.yml`：

```yaml
spring:
  grpc:
    server:
      enabled: true
      port: 9090
```

启动，报错：

```txt
Caused by: java.lang.IllegalStateException: Multiple GrpcServerFactory beans found.
Cannot determine primary candidate. Consider marking one as @Primary.
  at org.springframework.boot.grpc.server.autoconfigure.GrpcServerAutoConfiguration.resolveFactory(GrpcServerAutoConfiguration.java:84)
```

大意是说找到了多个 `GrpcServerFactory` 的实现，不知道用哪个。

我愣了几秒——我明明把自建starter删了，哪来的多个？

全局搜了一下 `GrpcServerFactory`，发现在另一个公共依赖包里（一个公司内部的通用组件库），有人也在里面写了一个@Configuration，注册了 `GrpcServerFactory` 的bean。这个包不是我们组的，是基础架构组维护的，好几个服务都在用。

问题就出在这：我删了本服务里的自建 `starter`，但那个公共包里还有一份。4.1的 gRPC 自动配置检测到了两个工厂 bean，就炸了。

_解决方式有两个思路_：

一是在公共包里给那个 `bean` 加上 `@ConditionalOnMissingBean`，让它在有官方自动配置的时候不生效。但这是公共包，改动需要基础架构组评审发版，不是我能说了算的。

二是临时方案：在自己的配置里加一个 `@Primary` 标记，或者在 `application.yml` 里排除掉那个冲突的自动配置类：

```yaml
spring:
  autoconfigure:
    exclude:
      - com.company.common.grpc.CommonGrpcAutoConfiguration
```

我们选了方案二先顶着，等基础架构组下个版本修复。但这事给了我一个教训：升级之前不能只看自己的代码，得查一下所有依赖包有没有跟新特性冲突的配置。特别是那种"公司通用组件包"，里面藏了什么你自己都不知道。

排查这类问题的方法是看启动日志里的CONDITIONS EVALUATION REPORT，Spring Boot启动时会打印所有自动配置的匹配和排除情况。加上这个JVM参数就能看到：

```bash
java -jar app.jar --debug
```

日志里会有一段 `Positive matches` 和 `Negative matches`，找gRPC相关的那几行，看哪些配置类被加载了，就能定位到冲突源。

## 其他值得一提的变更

除了上面两个实打实踩到的坑，还有几个变更我瞄了一眼，目前没影响到我们项目，但后面可能会用到：

- _SSRF防护_：新增了 `InetAddressFilter`，可以给HTTP客户端配白名单/黑名单，阻止对指定地址段的出站请求。如果你的服务会对外部URL发起请求（比如爬虫、webhook回调），建议配上，不然一旦有参数注入类的漏洞，攻击者可以利用你的服务器去扫内网。

- _延迟数据源连接_：`spring.datasource.connection-fetch=lazy`，把物理连接的获取推迟到实际执行SQL的时候。我试了一下，启动速度确实快了一点（我们项目连接池配了20个连接，lazy模式下启动时不建连，能省个几百毫秒），但这个改动可能会影响依赖启动时连接状态的地方，比如有些健康检查或者初始化逻辑假设启动时连接池是满的。

- _`@Async`上下文传播_：现在`@Async`方法自动跨线程传播Micrometer的追踪上下文了，不用自己配。这个对我们组挺有用的，之前每次异步任务丢失traceId都要手动处理，现在省了。不过要注意一点，虚拟线程环境下ThreadLocal的行为跟平台线程不一样，如果你自定义了ThreadLocal存业务数据，升完还是要检查一下传播是否符合预期。

- _弃用项清理_：4.0里标记为 `deprecated` 的API在4.1里全部移除了，包括 `layertools` JAR模式（改用 `tools` 模式）、Apache Derby支持、DevTools LiveReload。如果你的项目还在用这些，升之前得先处理掉。DevTools LiveReload被砍了没替代方案，官方也没解释为什么，社区有人猜是维护成本太高。

## 升级路径建议

如果你还在4.0上，升4.1的流程我觉得可以这么走：

先全局搜 `-DskipTests`，全部换成 `-Dmaven.test.skip=true`。这一步5分钟搞定但不改CI必挂。

然后搜一下项目里有没有手写的gRPC、Redis、JPA相关自动配置类。4.1新增了好几个自动配置，跟你自己写的可能冲突。有的话要么加 `@ConditionalOnMissingBean`，要么用 `spring.autoconfigure.exclude`排除。

最后在测试环境跑一遍全量回归，重点看启动日志里的CONDITIONS EVALUATION REPORT，确认没有意外的自动配置加载。

4.1整体来说是个不错的增量版本，gRPC自动配置和SSRF防护都很实用。但这些"小变更"藏得深，不看release notes根本不知道。
