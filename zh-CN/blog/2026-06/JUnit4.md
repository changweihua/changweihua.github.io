---
lastUpdated: true
commentabled: true
recommended: true
title: JUnit4 完整配置流程
description: JUnit4 完整配置流程
date: 2026-06-05 14:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

> 本文档基于 JacocoDemo 项目（AGP 8.10.1 + Gradle Kotlin DSL + Java 11），详细说明如何在 Android 项目中配置和使用 JUnit4 进行本地单元测试。

## 一、JUnit4 是什么？ ##

JUnit4 是 Java 生态中最流行的单元测试框架。在 Android 项目中，它主要用于 本地单元测试（Local Unit Test）——在本地 JVM 上快速运行，不依赖 Android 设备和模拟器。

### JUnit4 在 Android 项目中的作用 ###

- 快速验证业务逻辑：无需启动设备，秒级执行
- 测试纯 Java/Kotlin 代码：Utils、Model、ViewModel（配合 Robolectric）等
- 与 JaCoCo 集成：生成代码覆盖率报告
- CI/CD 集成：在持续集成流水线中自动执行

## 二、通过版本目录声明依赖 ##

本项目使用 Gradle Version Catalog（版本目录）管理依赖版本，配置文件位于项目根目录的 gradle/libs.versions.toml。

### 在 `libs.versions.toml` 中声明版本和依赖 ###

```ini
[versions]
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"

[libraries]
# 本地单元测试：JUnit 4
junit = { group = "junit", name = "junit", version.ref = "junit" }

# 仪器化测试（Android 设备测试）：AndroidX Test JUnit
ext-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }

# UI 测试：Espresso
espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
```

### 版本目录的优势 ###

- 集中管理：所有版本定义在一个文件中
- 引用统一：通过 `version.ref` 确保版本一致性
- 便于升级：修改一处即可全局生效

## 三、在 `app/build.gradle.kts` 中引用依赖 ##

### 依赖声明 ###

```ini
dependencies {
    // 本地单元测试依赖（运行在本地 JVM）
    testImplementation(libs.junit)

    // 仪器化测试依赖（运行在 Android 设备/模拟器）
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}
```

### `testImplementation` 与 `androidTestImplementation` 的区别 ###

```mermaid
| 配置指令 | 运行环境 | 测试目录 | 典型用途 |
| :--- | :--- | :--- | :--- |
| `testImplementation` | 本地 JVM (电脑) | `src/test/java` | 纯逻辑测试、工具类测试 |
| `androidTestImplementation` | Android 设备/模拟器 | `src/androidTest/java` | UI 测试、需要 Android Framework 的测试 |
```

*核心区别*：

- `testImplementation` 的测试 不依赖 Android 框架，运行速度极快（毫秒级）
- `androidTestImplementation` 的测试 需要 Android 运行时环境，运行速度较慢（秒级）

## 四、测试目录结构说明 ##

```bash
app/
└── src/
    ├── main/java/                          # 主源代码
    │   └── com/android/jacocodemo/
    │       ├── MainActivity.java
    │       └── util/
    │           └── ScoreUtil.java
    │
    ├── test/java/                          # 本地单元测试（本地 JVM 运行）
    │   └── com/android/jacocodemo/
    │       ├── ExampleUnitTest.java
    │       └── ScoreUtilTest.java
    │
    └── androidTest/java/                   # 仪器化测试（Android 设备运行）
        └── com/android/jacocodemo/
            └── ExampleInstrumentedTest.java
```

## 目录对比 ##

| 目录 | 完整路径 | 运行环境 | Gradle Task |
| :--- | :--- | :--- | :--- |
| **本地单测** | `src/test/java` | 本地 JVM | `testDebugUnitTest` |
| **仪器化测试** | `src/androidTest/java` | Android 设备 | `connectedAndroidTest` |

## 五、编写测试类的完整步骤 ##

### 基本结构 ###

一个标准的 JUnit4 测试类：

```java
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.rules.ExpectedException;

import static org.junit.Assert.*;

public class MyTest {

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Before
    public void setUp() {
        // 每个测试方法执行前运行
    }

    @After
    public void tearDown() {
        // 每个测试方法执行后运行
    }

    @Test
    public void testSomething() {
        // 测试逻辑
    }
}
```

### 核心注解说明 ###

| 注解 | 说明 | 执行时机 |
| :--- | :--- | :--- |
| `@Test` | 标记测试方法 | 被测试运行器调用 |
| `@Before` | 前置操作 | 每个 `@Test` 方法执行前 |
| `@After` | 后置操作 | 每个 `@Test` 方法执行后 |
| `@BeforeClass` | 类级别前置 | 所有测试执行前（需 static） |
| `@AfterClass` | 类级别后置 | 所有测试执行后（需 static） |
| `@Ignore` | 跳过测试 | 标记后该方法不会被执行 |
| `@Rule` | 测试规则 | 提供额外的测试功能 |
| `@ClassRule` | 类级别规则 | 作用于整个测试类 |

### 常用 `@Rule` ###

```java
// 1. 预期异常规则
@Rule
public ExpectedException thrown = ExpectedException.none();

// 使用示例
@Test
public void testException() {
    thrown.expect(IllegalArgumentException.class);
    thrown.expectMessage("不能为负数");
    ScoreUtil.calculate(-1);
}

// 2. 临时目录规则
@Rule
public TemporaryFolder tempFolder = new TemporaryFolder();

// 3. 超时规则
@Rule
public Timeout timeout = Timeout.seconds(5);
```

### 项目示例：`ExampleUnitTest` ###

本项目中的 `app/src/test/java/com/android/jacocodemo/ExampleUnitTest.java`：

```java
package com.android.jacocodemo;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

/**
 * 本地单元测试示例
 * 运行在本地 JVM，不依赖 Android 设备
 */
public class ExampleUnitTest {
    @Test
    public void addition_isCorrect() {
        assertEquals(4, 2 + 2);
    }
}
```

要点：

- 使用 `@Test` 注解标记测试方法
- 使用 `assertEquals` 进行断言
- 方法名无强制要求，但建议描述测试意图

### 项目示例：ScoreUtilTest ###

本项目中的 `app/src/test/java/com/android/jacocodemo/ScoreUtilTest.java`：

```java
package com.android.jacocodemo;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * ScoreUtil 工具类单元测试
 * 演示 @Before 初始化、分支覆盖测试
 */
public class ScoreUtilTest {

    private ScoreUtil scoreUtil;

    @Before
    public void setUp() {
        // 每个测试方法执行前创建新实例，保证测试隔离
        scoreUtil = new ScoreUtil();
    }

    @Test
    public void getGrade_score90以上_返回A() {
        assertEquals("A", scoreUtil.getGrade(95));
    }

    @Test
    public void getGrade_score80到89_返回B() {
        assertEquals("B", scoreUtil.getGrade(85));
    }

    @Test
    public void getGrade_score60到79_返回C() {
        assertEquals("C", scoreUtil.getGrade(70));
    }

    @Test
    public void getGrade_score低于60_返回D() {
        assertEquals("D", scoreUtil.getGrade(45));
    }

    @Test(expected = IllegalArgumentException.class)
    public void getGrade_负数分数_抛出异常() {
        scoreUtil.getGrade(-1);
    }

    @Test(expected = IllegalArgumentException.class)
    public void getGrade_超过100_抛出异常() {
        scoreUtil.getGrade(101);
    }
}
```

要点：

- `@Before` 在每个测试前重置对象状态
- 覆盖多个分支（A/B/C/D 等级 + 异常边界）
- 使用 `expected` 属性测试异常抛出
- 测试方法名采用 `方法名_条件_期望结果` 命名规范

## 六、断言方法说明 ##

JUnit4 提供在 org.junit.Assert 类中的断言方法：

### 基础断言 ###

| 方法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `assertEquals(expected, actual)` | 断言两个值相等 | `assertEquals(4, 2 + 2)` |
| `assertNotEquals(unexpected, actual)` | 断言两个值不相等 | `assertNotEquals(5, 2 + 2)` |
| `assertTrue(condition)` | 断言条件为真 | `assertTrue(list.isEmpty())` |
| `assertFalse(condition)` | 断言条件为假 | `assertFalse(str.isEmpty())` |
| `assertNull(object)` | 断言对象为 null | `assertNull(result)` |
| `assertNotNull(object)` | 断言对象不为 null | `assertNotNull(result)` |
| `assertSame(expected, actual)` | 断言同一对象（`==`） | `assertSame(a, b)` |
| `assertNotSame(unexpected, actual)` | 断言不同对象 | `assertNotSame(a, b)` |

### 带消息的断言 ###

所有断言方法都支持第一个参数为失败消息：

```java
assertEquals("分数等级应为 A", "A", scoreUtil.getGrade(95));
assertTrue("列表不应为空", !list.isEmpty());
assertNotNull("结果不应为 null", result);
```

### 数组和集合断言 ###

```java
// 数组相等（内容比较）
assertArrayEquals(new int[]{1, 2, 3}, result);

// 集合内容相等
assertThat(list, hasItems("a", "b", "c"));  // 需 Hamcrest 库
```

### 异常测试 ###

```java
// 方式一：@Test 的 expected 属性
@Test(expected = IllegalArgumentException.class)
public void testException() {
    scoreUtil.getGrade(-1);
}

// 方式二：ExpectedException 规则（可检查异常消息）
@Rule
public ExpectedException thrown = ExpectedException.none();

@Test
public void testExceptionWithMessage() {
    thrown.expect(IllegalArgumentException.class);
    thrown.expectMessage("不能为负数");
    scoreUtil.getGrade(-1);
}
```

## 七、运行测试 ##

### 通过 Gradle 命令运行 ###

```bash
# 运行所有本地单元测试
gradlew testDebugUnitTest

# 查看测试结果
# 报告路径：app/build/reports/tests/testDebugUnitTest/index.html
```

### 测试输出 ###

测试执行后，结果文件位于：

```bash
app/build/
├── reports/tests/testDebugUnitTest/    # HTML 格式测试报告
├── test-results/testDebugUnitTest/     # XML 格式测试结果
└── outputs/unit_test_code_coverage/    # JaCoCo 覆盖率数据（已开启时）
```

## 八、常见问题 ##

### Q1：测试找不到 Android 资源（R.string.xxx）？ ###

本地单元测试运行在纯 JVM 环境，不加载 Android 资源。

*解决方案*：

```kotlin
// app/build.gradle.kts 中已配置
testOptions {
    unitTests.isIncludeAndroidResources = true  // 包含 Android 资源
    unitTests.isReturnDefaultValues = true      // Android 方法返回默认值
}
```

### Q2：如何测试需要 Context 的代码？ ###

- 方案一：重构代码，将需要 Context 的逻辑抽取为可注入的接口
- 方案二：使用 Mockito 模拟 Context
- 方案三：使用 Robolectric 框架（在本地模拟 Android 环境）

### Q3：`@Before` 和 `@BeforeClass` 有什么区别？ ###

| 注解 | 执行频率 | 方法要求 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `@Before` | 每个测试方法前 | 实例方法 | 重置测试数据 |
| `@BeforeClass` | 整个类只执行一次 | 静态方法 | 初始化共享资源 |

## 九、总结 ##

| 配置项 | 本项目实际值 |
| :--- | :--- |
| JUnit 版本 | 4.13.2 |
| 版本目录文件 | `gradle/libs.versions.toml` |
| 本地测试依赖 | `testImplementation(libs.junit)` |
| 仪器化测试依赖 | `androidTestImplementation(libs.ext.junit)` |
| 本地测试目录 | `src/test/java` |
| 仪器化测试目录 | `src/androidTest/java` |
| Gradle 测试 Task | `testDebugUnitTest` |
