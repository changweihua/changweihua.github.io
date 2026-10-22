---
lastUpdated: true
commentabled: true
recommended: true
title: JUnit 5、Mockito 与 Testcontainers
description: 单元测试实战
date: 2026-10-22 09:35:00
pageClass: blog-page-class
cover: /covers/java.svg
---

一个可验证的结论：*单元测试跑得慢，往往不是测试框架慢，而是测试边界画错了*。JUnit 5 本身的开销很小，真正拖垮构建的是那些“伪装成单元测试的集成测试”——启动 Spring 上下文、连真实数据库、等外部 HTTP 服务。JUnit 5、Mockito、Testcontainers 三者不是替代关系，而是*三层边界工具*：JUnit 5 管生命周期与断言，Mockito 管协作对象的隔离，Testcontainers 管“必须真实”的基础设施。用错层，测试就会变成负担。

本文假设有一个 `order-service`（仅为讲解示例），围绕它拆解这三者的行为与常见误区。本系列前面讲过线程池、AQS 等并发底层，这里换到测试工程学的视角，不重复并发内容。

> 关键词：JUnit 5 扩展模型、Mockito 字节码代理、Testcontainers 生命周期、测试边界、Spring Boot 测试切片

## JUnit 5：扩展模型才是它的真正内核 ##

### 为什么 `@Test` 只是冰山一角 ###

JUnit 5 的架构分三层：`junit-platform`（引擎与启动）、`junit-jupiter`（API 与实现）、`junit-vintage`（兼容 JUnit 4）。真正决定测试行为的是 `Extension` 模型，而不是注解本身。`@BeforeEach`、`@Mock`、`@SpringBootTest` 的底层能力，全部由 `Extension` 接口实现。

关键接口是 `org.junit.jupiter.api.extension.Extension` 下的若干回调：

| 回调接口 | 触发时机 |
| :--- | :--- |
| `BeforeAllCallback` / `AfterAllCallback` | 整个测试类前后 |
| `BeforeEachCallback` / `AfterEachCallback` | 每个测试方法前后 |
| `TestInstancePostProcessor` | 测试实例创建后 |
| `ParameterResolver` | 解析测试方法参数 |
| `TestExecutionExceptionHandler` | 处理测试异常 |

Mockito 的 `MockitoExtension`、Spring 的 `SpringExtension`，本质都是这些回调的组合实现。理解这一点，才能明白“注解为什么能生效”。

### 一个真实的自定义扩展 ###

假设 `order-service` 需要每个测试方法记录耗时并打印，可以用 InvocationInterceptor（JUnit 5.5 引入，真实存在）：

```java
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.InvocationInterceptor;
import org.junit.jupiter.api.extension.ReflectiveInvocationContext;
import java.lang.reflect.Method;

public class TimingExtension implements InvocationInterceptor {

    @Override
    public void interceptTestMethod(Invocation<Void> invocation,
                                    ReflectiveInvocationContext<Method> invocationContext,
                                    ExtensionContext extensionContext) throws Throwable {
        long start = System.nanoTime();
        try {
            invocation.proceed();
        } finally {
            long costMs = (System.nanoTime() - start) / 1_000_000;
            System.out.printf("[timing] %s cost=%dms%n",
                    invocationContext.getExecutable().getName(), costMs);
        }
    }
}
```

通过 `@ExtendWith(TimingExtension.class)` 注册。注意 `invocation.proceed()` 必须调用，否则测试体不会执行——这是自定义扩展最常见的错误。

### 常见误区：`@TestInstance` 与静态状态 ###

JUnit 5 默认每个测试方法创建*新的测试实例*（`PER_METHOD`）。若改成 `@TestInstance(Lifecycle.PER_CLASS)`，实例字段可在方法间共享，但会引入测试间耦合。除非需要非静态的 `@BeforeAll`，否则不建议改。另一种误区是把可变状态放在 `static` 字段，这在并行执行（`junit.jupiter.execution.parallel.enabled=true`）下会产生竞态——JUnit 5 的并行是真实支持的，但要求测试本身无共享可变状态。

## Mockito：代理、桩与“过度 mock”的代价 ##

### Mockito 如何造出 mock 对象 ###

Mockito 的核心是运行时代理。对接口，用 JDK 动态代理；对类，用 Byte Buddy 生成子类（这也是为什么 `final` 类默认不能被 mock）。`Mockito.mock(Foo.class)` 返回的对象，所有方法默认返回“空值”（`null`、`0`、`false`、空集合），除非被 `when(...)` 桩住。

一个真实可运行的示例：

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldReturnOrderWhenExists() {
        Order order = new Order(1L, "PAID");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Optional<Order> result = orderService.findOrder(1L);

        assertTrue(result.isPresent());
        assertEquals("PAID", result.get().getStatus());
        verify(orderRepository, times(1)).findById(1L);
    }
}
```

`@InjectMocks` 会尝试构造器注入、setter 注入、字段注入，按顺序选择。注意：*它不会注入到 `final` 字段*，也不会处理复杂构造依赖，复杂场景建议手动构造被测对象。

### `when` 与 `doReturn` 的边界 ###

`when(mock.method())` 会*真实调用* `mock` 方法，只是返回值被替换。对于 `void` 方法必须用 `doThrow(...).when(mock).voidMethod()`。对于 `spy` 对象，`when(spy.method())` 会先执行真实方法，可能产生副作用，应改用 `doReturn(...).when(spy).method()`。这是 Mockito 官方文档明确强调的行为差异。

### 过度 mock 的反模式 ###

一种常见场景是：为了测一个纯业务方法，把五六个协作者全部 `mock`，然后写一堆 `verify`。这类测试的断言对象变成了“调用序列”，而非“业务结果”。一旦重构内部实现（哪怕行为不变），测试就红。判断标准很简单：如果你删掉被测方法的一行实现，测试是否因为“行为变化”而失败？ 如果只是因为 `verify` 次数变化而失败，那它测的是实现，不是契约。

Mockito 提供 `verifyNoMoreInteractions`、`strictness`（默认 `STRICT_STUBS`）来约束未使用的桩，但不要用它来强行追求“零冗余调用”，否则会陷入脆弱测试。

## Testcontainers：把“必须真实”的部分交给容器 ##

### 它解决什么问题 ###

数据库方言、SQL 语法、事务隔离、连接池行为，这些用 mock 测不出来。Testcontainers 用 Docker 在测试期拉起真实中间件（PostgreSQL、MySQL、Redis、Kafka 等），测试结束销毁。它不是单元测试工具，而是*集成测试的边界工具*。

### 生命周期与复用 ###

Testcontainers 的容器默认随测试类生命周期启停。`@Testcontainers` + `@Container` 是声明式用法；`static` 容器在类级别启动一次，`@Container` 非 `static` 则每个方法重启（慢）。更优的做法是配合 junit-jupiter 的 `@TestInstance` 或使用 `reusable` 容器（`withReuse(true)`），但后者依赖本地配置，不适合 CI 无状态环境。

一个真实可运行的示例（PostgreSQL）：

```java
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void shouldPersistAndQueryOrder() throws Exception {
        try (Connection conn = DriverManager.getConnection(
                postgres.getJdbcUrl(),
                postgres.getUsername(),
                postgres.getPassword());
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE TABLE orders (id BIGINT PRIMARY KEY, status VARCHAR(16))");
            stmt.execute("INSERT INTO orders VALUES (1, 'PAID')");
            try (ResultSet rs = stmt.executeQuery("SELECT status FROM orders WHERE id = 1")) {
                assertTrue(rs.next());
                assertEquals("PAID", rs.getString("status"));
            }
        }
    }
}
```

`PostgreSQLContainer`、`@Testcontainers`、`@Container` 均为真实存在的类与注解。注意 `postgres:16-alpine` 是真实镜像标签，但版本会随上游更新，生产项目建议锁定具体 digest 或版本号。

### 与 Spring Boot 测试切片的配合 ###

Spring Boot 3 提供 `@ServiceConnection`，可直接把容器连接信息注入 `DataSource`，省去手写 `@DynamicPropertySource`。但要注意：`@SpringBootTest` 会拉起完整上下文，测试变慢；能用 `@DataJpaTest`、`@JdbcTest` 等切片时优先用切片，再叠加 `Testcontainers`。

## 三层边界的组合策略 ##

把三者放进一个决策框架：

| 被测对象 | 推荐工具 | 理由 |
| :--- | :--- | :--- |
| 纯业务逻辑（无 IO） | JUnit 5 断言 | 无需 mock，最快 |
| 依赖协作者（接口） | Mockito | 隔离外部行为 |
| 依赖真实数据库/SQL | Testcontainers | mock 无法验证方言与事务 |
| Spring 装配正确性 | `@SpringBootTest` + 切片 | 验证上下文，成本高，慎用 |

一个务实原则：*测试金字塔不是教条，而是成本模型*。Mockito 测交互契约，Testcontainers 测基础设施契约，JUnit 5 负责把两者组织起来。不要让 Mockito 去模拟数据库行为，也不要让 Testcontainers 去测一个纯计算函数。

## 什么时候别用 / 别踩的坑 ##

*别用 Mockito mock `final` 类*：默认代理不了，除非启用 `mockito-inline`（Mockito 5 起默认 inline mock maker，但仍有性能与兼容成本）。不确定就先查官方文档。
*别在 `@SpringBootTest` 里再手动 `new` 被测对象*：上下文已注入，手动 `new` 会绕过 Spring 代理，测出假象。
*别把 `Testcontainers` 当单元测试*：它依赖 Docker 守护进程，CI 需保证 `Docker` 可用，否则测试直接失败。
*别滥用 verify*：断言调用次数是脆弱测试的高发区，优先断言返回值与状态。
*别在并行执行下共享静态可变状态*：JUnit 5 并行是真实能力，但测试必须无共享状态。
*别迷信覆盖率*：行覆盖率高不代表契约被验证，`assertNotNull` 堆出来的覆盖率没有意义。
