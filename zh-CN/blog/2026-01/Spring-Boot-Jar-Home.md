---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 打包后如何读取 JAR 包同级目录的外部文件？
description: Spring Boot 打包后如何读取 JAR 包同级目录的外部文件？
date: 2026-04-07 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 背景与痛点 ##

在平时的项目开发中，我们经常会遇到这样的需求：项目中有一个 `template` 文件夹（比如存放 Word、Excel 模板，或者 Freemarker/HTML 模板），我们希望在代码中去读取它。

如果是直接放在 `src/main/resources` 下，打包后文件会被打进 JAR 包内部。这就带来一个问题：*如果生产环境下需要修改模板内容，就必须重新打包发布，非常不方便*。

因此，更优雅的做法是：*将 `template` 文件夹放在项目根目录，并在打包后，让它与 JAR 包处于同级目录。代码去读取这个外部文件夹。*

本文将手把手教你如何实现这个需求，并避开路径解析中的常见“坑”。

## 避坑指南：为什么不建议直接用 `./template`？ ##

很多开发者直觉上会写出这样的代码：

```java
File templateDir = new File("./template");
```

> 结论：能用，但有非常大的隐患！

在 Java 中，`./` 代表的是当前工作目录（Current Working Directory），等同于 `System.getProperty("user.dir")`。它的致命弱点在于：*它依赖于“你在哪里敲的启动命令”，而不是“JAR 包在哪里”*。

- 场景 1（正常）： 你 `cd` 到了 JAR 包所在的目录，然后执行 `java -jar app.jar`。此时 ./ 就是 JAR 包所在目录，读取成功。
- 场景 2（报错）： 你的 JAR 包在 `/app/my-project/` 下，但你在系统根目录启动项目：

```bash
cd /
java -jar /app/my-project/app.jar
```

此时，Java 认为的 `./` 是根目录 `/`！程序会去寻找 `/template`，结果自然是找不到文件。
- 场景 3（报错）： 将 Spring Boot 配置为 Linux 的 Systemd 服务启动时，如果没有严格配置 `WorkingDirectory`，默认路径也会导致找不到文件。

> 为了代码的健壮性，我们需要使用绝对路径来定位 JAR 包！

## 核心方案：精准定位 JAR 包所在目录 ##

### 方法 1：Spring Boot 的极简写法（强烈推荐） ###

如果你使用的是 Spring Boot 项目，Spring 官方提供了一个非常贴心的类 `ApplicationHome`。它可以自动判断当前是处于 IDE 环境还是 JAR 包运行环境，并牢牢锁定真实的根目录。

```java
import org.springframework.boot.system.ApplicationHome;
import java.io.File;

public class TemplateReader {
    
    public void readTemplates() {
        // 获取当前程序所在的根目录 (IDE中是项目根目录，打包后是 jar 包所在目录)
        ApplicationHome home = new ApplicationHome(getClass());
        File rootDir = home.getDir();
        
        // 拼接出 template 目录的绝对路径
        File templateDir = new File(rootDir, "template");
        
        if (templateDir.exists() && templateDir.isDirectory()) {
            System.out.println("成功找到 template 目录: " + templateDir.getAbsolutePath());
            File[] files = templateDir.listFiles();
            if (files != null) {
                for (File file : files) {
                    System.out.println("读取到文件: " + file.getName());
                    // 在这里处理你的文件逻辑...
                }
            }
        } else {
            System.out.println("未找到 template 目录，请检查路径: " + templateDir.getAbsolutePath());
        }
    }
}
```

### 方法 2：原生 Java 通用写法（适用于非 Spring 项目） ###

如果你使用的是普通的 Java Maven 项目，可以通过 `ProtectionDomain` 获取当前类的实际运行物理路径，然后反推根目录：

```java
import java.io.File;
import java.net.URLDecoder;

public class NativeTemplateReader {

    private static File getTemplateDir() {
        try {
            // 获取当前类的代码源路径
            String path = NativeTemplateReader.class.getProtectionDomain().getCodeSource().getLocation().getPath();
            path = URLDecoder.decode(path, "UTF-8"); // 防止路径中的中文或空格被 URLEncode
            File file = new File(path);

            File rootDir;
            if (file.isFile() && path.endsWith(".jar")) {
                // 环境：打包后的 jar 运行，根目录就是 jar 包所在的父目录
                rootDir = file.getParentFile();
            } else {
                // 环境：IDE (如 IDEA) 中运行，退回项目根目录
                rootDir = new File(System.getProperty("user.dir")); 
            }

            return new File(rootDir, "template");

        } catch (Exception e) {
            // 兜底方案
            return new File(System.getProperty("user.dir"), "template");
        }
    }
}
```

## 工程化进阶：让 Maven 打包时自动复制文件夹 ##

代码写好了，但每次执行 `mvn clean package` 打包后，我们还需要手动把根目录的 `template` 文件夹复制到 `target` 目录下，和 `jar` 包放在一起，太繁琐了！

我们可以通过配置 `maven-resources-plugin` 插件，让 Maven 在打包时自动完成复制。

### 规范的项目结构 ###

首先确保你的项目目录长这样：

```text
my-project/
 ├── src/
 │    └── main/java/...
 ├── template/          <-- 放在项目根目录下，与 src 同级
 │    ├── test1.txt
 │    └── test2.html
 └── pom.xml
```

### 修改 pom.xml ###

在 `<build><plugins>` 节点下添加以下配置：

```xml
  <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <id>copy-template-folder</id>
            <!-- 在打包(package)阶段执行 -->
            <phase>package</phase>
            <goals>
                <goal>copy-resources</goal>
            </goals>
            <configuration>
                <!-- 复制的目标位置：打包后的 target 目录下的 template 文件夹 -->
                <outputDirectory>${project.build.directory}/template</outputDirectory>
                <resources>
                    <resource>
                        <!-- 复制的源位置：项目根目录下的 template 文件夹 -->
                        <directory>${project.basedir}/template</directory>
                        <filtering>false</filtering>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
```

## 最终效果验证 ##

- 开发阶段：直接在 IDEA 中运行，代码会精准读取项目根目录下的 `template` 文件夹。
- 打包阶段：执行 `mvn clean package`。你会发现 `target` 目录下不仅有 `xxx.jar`，旁边还自动多出了一个 `template` 文件夹。
- 部署阶段：把 `target` 目录下的 `jar` 包和 `template` 文件夹一起丢到服务器上。无论你用什么姿势（跨目录、写脚本、systemd）启动项目，代码都能稳稳地读取到外部的模板文件。
- 后期运维：需要改模板？直接替换服务器上 `template` 里的文件即可，无需重启！无需重新打包！

## 总结 ##

- 读取外部同级文件，*不要直接用 `./`*，容易因为启动目录不同而产生 BUG。
- Spring Boot 项目无脑使用 `ApplicationHome`。
- 结合 Maven `maven-resources-plugin` 插件，可以实现丝滑的自动化打包体验。

希望这篇指南能帮你彻底解决 Java 读取外部配置文件/目录的烦恼！如果觉得有帮助，欢迎点赞收藏！
