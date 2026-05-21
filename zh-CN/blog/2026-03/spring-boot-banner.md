---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot 控制台秒变炫彩特效
description: SpringBoot 控制台秒变炫彩特效
date: 2026-03-10 08:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、自定义 Spring Boot 启动横幅 banner.txt ##

### 什么是 banner.txt？ ###

当你启动 Spring Boot 应用时，控制台会打印出一个默认的 Spring Boot Banner（比如启动 LOGO）。这个内容来自 `resources` 目录下的 `banner.txt` 文件。你可以通过这个文件自定义你想展示的 ASCII 图案、版本号、提示文字等。

### 创建或修改 banner.txt ###

#### 文件位置 ####

在你的 Spring Boot 项目中，进入 `src/main/resources` 目录下，新建或编辑：

```txt
src/main/resources/banner.txt
```

#### 内容示例（纯色风格 + 启动信息） ####

```bash
===========================================
==         AbsWeb 启动成功！ 🚀         ==
==         端口：${server.port}               ==
==         环境：${spring.profiles.active}       ==
==         时间：${date}              ==
===========================================
```

你可以使用 Spring Boot 提供的一些占位符变量：

|  占位符   |  描述 |
| :-----------: | :-----------: |
| `${application.version}` | 项目的 MANIFEST.MF 版本  |
| `${application.formatted-version}` | 格式化版本号  |
| `${spring-boot.version}` | Spring Boot 版本  |
| `${server.port}` | 当前端口号  |
| `${spring.profiles.active}` | 当前激活的配置环境  |
| `${date}` | 启动时间  |
| `${AnsiColor.NAME}` | 控制台颜色（如 GREEN、RED）  |

### 加点颜色和风格（可选） ###

Spring Boot 支持 ANSI 颜色，在支持的终端中会显示彩色效果：

```txt
${AnsiColor.BRIGHT_CYAN}
===========================================
==         TGS-XIYUE 启动成功！ 🚀         ==
==         端口：${server.port}               ==
==         环境：${spring.profiles.active}       ==
==         时间：${date}              ==
===========================================
${AnsiColor.DEFAULT}
```

### 启动测试 ###

启动项目时，你会看到类似输出：

```txt
===========================================
==         TGS-XIYUE 启动成功！ 🚀         ==
==         端口：8082                     ==
==         环境：test                     ==
==         时间：2025-06-13 16:52:10      ==
===========================================
```

提供几个网站可以自己去生成图案:

- [patorjk.com](https://patorjk.com/software/taag/)

## 二、进阶方式：关闭默认 Banner，自定义 Java 启动内容 ##

### 禁用 Spring Boot 的默认 banner ###

在你的配置文件（如 application.yml 或 application.properties）中添加：

yml 文件：

```yaml
spring:
  main:
    banner-mode: "off"
```

properties 文件：

```ini
spring.main.banner-mode=off
```

### 自定义启动打印代码 ###

在主启动类中添加一个打印方法，利用 ANSI 转义码输出彩色字符：

```java
public class TgsXiyueApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(TgsXiyueApplication.class);

        // 获取当前激活的Profile
        Environment env = app.run(args).getEnvironment();
        String activeProfiles = String.join(",", env.getActiveProfiles());

        System.out.println("应用启动成功！");
        System.out.println("激活的Profile: " + (activeProfiles.isEmpty() ? "无" : activeProfiles));
        System.out.println("服务地址: http://localhost:" + env.getProperty("server.port") +
                env.getProperty("server.servlet.context-path", ""));
    }

    private static boolean bannerPrinted = false; // 控制只打印一次

    /**
     * 在 ApplicationStartedEvent 事件中打印彩色 Banner
     * 这个事件在 Spring 容器启动后、ApplicationReadyEvent 之前触发，
     * 能够保证只执行一次（因为监听器是单例的）。
     */
    @EventListener(ApplicationStartedEvent.class)
    public void printColorfulBannerOnStartup() {
        // 双重检查锁，防止多线程环境下重复打印
        if (!bannerPrinted) {
            synchronized (TgsXiyueApplication.class) {
                if (!bannerPrinted) {
                    printColorfulBanner();
                    bannerPrinted = true;
                }
            }
        }
    }

    /**
     * 打印彩色的 ASCII 艺术字 Banner
     * 利用 ANSI 转义码设置颜色，使用 JDK 文本块格式化字符串
     */
    private static void printColorfulBanner() {
        // ANSI 颜色代码
        final String RESET = "\u001B[0m";
        final String RED = "\u001B[31m";
        final String GREEN = "\u001B[32m";
        final String YELLOW = "\u001B[33m";
        final String BLUE = "\u001B[34m";
        final String PURPLE = "\u001B[35m";
        final String CYAN = "\u001B[36m";

        // 使用 JDK 文本块（JDK 15+）定义 ASCII 艺术字
        String asciiArt = """
                ___________________  _________         ____  ___.________.___.____ ______________
            \\__    ___/  _____/ /   _____/         \\   \\/  /|   \\__  |   |    |   \\_   _____/
              |    | /   \\  ___ \\_____  \\   ______  \\     / |   |/   |   |    |   /|    __)_ 
              |    | \\    \\_\\  \\/        \\ /_____/  /     \\ |   |\\____   |    |  / |        \\
              |____|  \\______  /_______  /         /___/\\  \\|___|/ ______|______/ /_______  /
                             \\/        \\/                \\_/     \\/                       \\/
                """;

        // 打印彩色 Banner - 为每一行设置不同的渐变色
        String[] lines = asciiArt.split("\n");

        // 定义颜色数组，实现渐变效果
        String[] colors = {RED, YELLOW, GREEN, CYAN, BLUE, PURPLE};

        System.out.println(); // 空行
        for (int i = 0; i < lines.length; i++) {
            if (i < lines.length && i < colors.length) {
                // 为每一行应用不同的颜色
                System.out.println(colors[i % colors.length] + lines[i] + RESET);
            } else {
                // 剩余行用青色
                System.out.println(CYAN + lines[i] + RESET);
            }
        }

        // 打印彩色分隔线和 JDK 版本信息
        System.out.println(PURPLE + "========================================" + RESET);
        // 获取 JDK 版本 - 这是 JDK 9 引入的新特性
        Runtime.Version version = Runtime.version();
        System.out.println(GREEN + "JDK Version: " + version + RESET);
        System.out.println(BLUE + "Spring Boot with JDK 25" + RESET);
        System.out.println(PURPLE + "========================================" + RESET);
    }
}

```

输出结果如下：

```text
    ___________________  _________         ____  ___.________.___.____ ______________
\__    ___/  _____/ /   _____/         \   \/  /|   \__  |   |    |   \_   _____/
  |    | /   \  ___ \_____  \   ______  \     / |   |/   |   |    |   /|    __)_
  |    | \    \_\  \/        \ /_____/  /     \ |   |\____   |    |  / |        \
  |____|  \______  /_______  /         /___/\  \|___|/ ______|______/ /_______  /
                 \/        \/                \_/     \/                       \/
========================================
JDK Version: 25.0.2+10-LTS
Spring Boot with JDK 25
========================================
```

## 三、实现启动成功后的彩色提示 ##

```java
public class AbsWebApplication {
    public static void main(String[] args) {
        SpringApplication.run(AbsWebApplication.class, args);
        printStartupMessage();
    }

   private static void printStartupMessage() {
        String reset = "\u001B[0m";
        String red = "\u001B[31m";
        String yellow = "\u001B[33m";
        String green = "\u001B[32m";
        String cyan = "\u001B[36m";
        String magenta = "\u001B[35m";
        String blue = "\u001B[34m";
        System.out.println(cyan + "    (\\_/)  " + reset);
        System.out.println(cyan + "    ( •_•)  " + reset + red + "  TgsXiyueApplication 启动成功!" + reset);
        System.out.println(cyan + "  / >🍪  " + reset + yellow + "  祝你今天工作顺利，项目无BUG~" + reset);
        System.out.println();
        System.out.println(magenta + "  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓" + reset);
        System.out.println(magenta + "  ┃      🎉 欢迎使用 TGS-XIYUE！🎉      ┃" + reset);
        System.out.println(magenta + "  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛" + reset);
    }
}
```
