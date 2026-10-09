---
lastUpdated: true
commentabled: true
recommended: true
title: JUnit 5 + Mockito 终极实战笔记
description: JUnit 5 + Mockito 终极实战笔记
date: 2026-04-09 10:00:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

这份笔记涵盖了从环境搭建、核心概念辨析到复杂场景（Spy、Final类）处理的完整流程。

## 第一部分：JUnit 4 vs JUnit 5 ##

在 Spring Boot 2.2+ 版本中，JUnit 5 是默认标准。

### 核心差异速查表 ###

|  特性   |      JUnit 4 (老旧)  |   JUnit 5 (现代/默认)  |
| :-----------: | :-----------: | :-----------: |
| 架构 | 单体 Jar 包 |   模块化 (Platform + Jupiter)  |
| Test 注解 | `@Test (org.junit.Test)` |   `@Test (org.junit.jupiter.api.Test)` |
| 生命周期 | `@Before`, `@After` |   `@BeforeEach`, `@AfterEach` |
| Spring 集成 | 必须写 `@RunWith(SpringRunner.class)` |   自动集成，只需 `@SpringBootTest` |
| 断言 | `Assert.assertEquals` |   `Assertions.assertEquals` |

### 环境搭建 (pom.xml) ###

Spring Boot 的 `spring-boot-starter-test` 默认已经包含了 JUnit 5 和 Mockito，无需额外配置。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 第二部分：核心概念与优雅测试 ##

### Mock 是什么？ ###

Mock 是一个“替身”。它代替真实的数据库或外部服务，让测试只关注当前类的逻辑，而不受外部环境影响（隔离性），且运行速度极快（无需 IO）。

### 优雅测试的三种策略 ###

#### 纯单元测试 (推荐 Service 层) ####

- 特点：不启动 Spring 容器，速度最快。
- 注解：`@ExtendWith(MockitoExtension.class)`

#### 切片测试 (推荐 Controller 层) ####

- 特点：只启动 Web 层容器。
- 注解：`@WebMvcTest`

#### 集成测试 (不推荐频繁使用) ####

- 特点：启动完整容器，速度慢。
- 注解：`@SpringBootTest`

## 第三部分：代码实战汇总 ##

假设我们有两个类：

- UserRepository (依赖，通常是数据库操作)
- UserService (被测类，包含业务逻辑)

### 纯单元测试 (使用 `@Mock` 和 `@InjectMocks`) ###

这是最标准、最优雅的写法。

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
​
import java.util.Optional;
​
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
​
// 1. 启用 Mockito 扩展，无需启动 Spring 容器
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
​
    // 2. 创建一个假的 UserRepository
    @Mock
    private UserRepository userRepository;
​
    // 3. 创建 UserService，并自动把上面的 userRepository 注入进去
    @InjectMocks
    private UserService userService;
​
    @Test
    void shouldFindUserById() {
        // --- Arrange (准备) ---
        // 定义 Mock 行为：当调用 findById(1L) 时，返回一个包含用户的 Optional
        User mockUser = new User(1L, "Alice");
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
​
        // --- Act (执行) ---
        User result = userService.findById(1L);
​
        // --- Assert (断言) ---
        assertNotNull(result);
        assertEquals("Alice", result.getName());
​
        // --- Verify (验证) ---
        // 验证 findById 方法是否真的被调用了一次
        verify(userRepository, times(1)).findById(1L);
    }
}
```

### 切片测试 (使用 `@MockBean`) ###

用于测试 Controller，需要 Spring 容器支持。

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
​
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
​
// 1. 只启动 Web 层
@WebMvcTest(UserController.class)
class UserControllerTest {
​
    @Autowired
    private MockMvc mockMvc;
​
    // 2. @MockBean：替换 Spring 容器中的 UserService 为 Mock 对象
    @MockBean
    private UserService userService;
​
    @Test
    void shouldReturnUser() throws Exception {
        // 模拟 Service 层返回数据
        when(userService.findById(1L)).thenReturn(new User(1L, "Alice"));
​
        // 发送 HTTP 请求并验证
        mockMvc.perform(get("/users/1"))
               .andExpect(status().isOk());
    }
}
```

## 第四部分：Spy (部分模拟) ##

当你需要测试真实对象，但想拦截其中某个方法时使用。

### 关键点 ###

- 必须手动初始化对象 (`= new UserService()`)。
- 存根语法必须用 `doReturn(...).when(spy)`。

```java
@ExtendWith(MockitoExtension.class)
class UserServiceSpyTest {
​
    // 1. 必须手动 new 出来！
    @Spy
    private UserService userService = new UserService();
​
    @Mock
    private UserRepository userRepository;
​
    @Test
    void testSpy() {
        // 2. 注入依赖（Spy 对象通常不会自动注入 Mock，需手动处理或构造）
        // 这里假设我们通过构造器注入了 mock
        userService = new UserService(userRepository); 
        // 重新 Spy 包装（注意：实际开发中建议直接在构造时注入）
        
        // 3. 拦截特定方法
        doReturn("VIP").when(userService).getUserLevel(anyLong());
​
        // 4. 调用真实方法，但 getUserLevel 会返回 "VIP"
        String level = userService.getUserLevel(1L);
        
        assertEquals("VIP", level);
    }
}
```

## 第五部分：Final 类 Mock 解决方案 ##

默认 Mockito 无法 Mock final 类。

### 步骤 1：添加依赖 ###

在 `pom.xml` 中添加 `mockito-inline`。

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <scope>test</scope>
</dependency>
```

### 步骤 2：创建配置文件 ###

在 `src/test/resources` 下创建文件夹 `mockito-extensions`，并创建文件 `org.mockito.plugins.MockMaker`。

文件内容：

```ini
mock-maker=inline
```

> Mockito 5 无须配置。

### 步骤 3：直接使用 ###

配置好后，final 类可以直接使用 `@Mock` 注解，无需任何代码变更。

## 总结速查 ##

- `@Mock`：假的，完全隔离，用于依赖。
- `@InjectMocks`：被测对象，自动注入 `@Mock`。
- `@Spy`：真的，但可拦截，用于部分测试。
- `@MockBean`：Spring 容器里的假 Bean，用于切片测试。
- Final 类：加 `mockito-inline` 依赖和配置文件。

你可以直接鼠标拖拽全选以上所有内容，按 `Ctrl+C` 就能一键复制啦。
