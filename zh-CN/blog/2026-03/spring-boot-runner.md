---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot启动时的小助手
description: ApplicationRunner和CommandLineRunner
date: 2026-03-19 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、前言 ##

平常开发中有可能需要实现在项目启动后执行的功能，Springboot中的ApplicationRunner和CommandLineRunner接口都能够帮我们很好地完成这种事情。它们的主要作用是在应用启动后执行一段初始化或任务逻辑，常见于一些启动任务，例如加载数据、验证配置等等。今天我们就来聊聊这两个接口在实际开发中是怎么使用的。

## 二、使用方式 ##

我们直接看示例代码：

```java
@Component
public class CommandLineRunnerDemo implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        //执行特定的代码
        System.out.println("执行特定的代码");
    }
}
```

```java
@Component
public class ApplicationRunnerDemo implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunnerDemo.run");
    }
}
```

从源码上分析，`CommandLineRunner`与`ApplicationRunner`两者之间只有`run()`方法的参数不一样而已。`CommandLineRunner#run()`方法的参数是启动SpringBoot应用程序main方法的参数列表，而`ApplicationRunner#run()`方法的参数则是ApplicationArguments对象。

如果我们有多个类实现CommandLineRunner或ApplicationRunner接口，可以通过Ordered接口控制执行顺序。下面以ApplicationRunner接口为例子：

```
package net.cmono.xiyue.runner;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class FirstApplicationRunner implements ApplicationRunner, Ordered {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.debug("FirstApplicationRunner.run()");
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

order值越小，越先被执行。

### 传递参数 ###

Spring Boot应用启动时是可以接受参数的，这些参数通过命令行 `java -jar app.jar` 来传递。`CommandLineRunner`会原封不动照单全收这些参数，这些参数也可以封装到`ApplicationArguments`对象中供`ApplicationRunner`调用。下面我们来看一下`ApplicationArguments`的相关方法：

- `getSourceArgs()` 被传递给应用程序的原始参数，返回这些参数的字符串数组。

- `getOptionNames()` 获取选项名称的Set字符串集合。如 `--spring.profiles.active=dev --debug` 将返回 `["spring.profiles.active","debug"]` 。

- `getOptionValues(String name)` 通过名称来获取该名称对应的选项值。如`--config=dev --config=test` 将返回 `["dev","eat"]`。

- `containsOption(String name)` 用来判断是否包含某个选项的名称。

- `getNonOptionArgs()` 用来获取所有的无选项参数。

## 三、总结 ##

CommandLineRunner 和 ApplicationRunner 常用于应用启动后的初始化任务或一次性任务执行。它们允许你在 Spring 应用启动完成后立即执行一些逻辑。

ApplicationRunner 更适合需要处理命令行参数的场景，而 CommandLineRunner 更简单直接。
