---
lastUpdated: true
commentabled: true
recommended: true
title: 如何优雅地切换 Dev 和 Prod 环境进行打包？
description: IDEA + Maven 实战：如何优雅地切换 Dev 和 Prod 环境进行打包？
date: 2026-04-02 09:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在日常开发中，我们经常面临一个痛点：*本地开发（Dev）连接的是测试数据库，而上线（Prod）需要连接生产数据库*。如果在打包时手动修改配置文件，不仅繁琐，还容易因为误操作导致生产事故。

本文将介绍如何利用 Maven Profiles 结合 IDEA，实现“一键切换”环境打包，彻底告别手动修改配置文件的时代。

## 核心原理 ##

Maven 提供了一个强大的功能叫 Profiles（配置文件）。我们可以定义多套环境配置（如 dev、test、prod），并通过变量控制 Maven 在构建（Build）过程中加载不同的资源文件。

## 方案一：基于目录隔离（通用方案，推荐） ##

适用场景： 传统的 SSM 项目，或者希望打包后的 jar 包中只包含当前环境配置，不包含其他环境的杂乱文件。

### 规划项目目录 ###

在 src/main/resources 下，为不同环境建立独立的文件夹：

```text
src/main/resources
├── config-dev             <-- 开发环境目录
│   └── application.properties (数据库URL: 127.0.0.1)
├── config-prod            <-- 生产环境目录
│   └── application.properties (数据库URL: 192.168.x.x)
├── mapper                 <-- 公共资源
└── logback.xml            <-- 公共资源
```

### 配置 pom.xml ###

我们需要做两件事：定义变量、控制资源加载。

```xml
<project>
    <!-- ... -->
    
    <!-- 1. 定义 Profiles -->
    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <env>config-dev</env> <!-- 定义变量 env 指向对应文件夹 -->
            </properties>
            <activation>
                <activeByDefault>true</activeByDefault> <!-- 默认激活 dev -->
            </activation>
        </profile>
        <profile>
            <id>prod</id>
            <properties>
                <env>config-prod</env>
            </properties>
        </profile>
    </profiles>

    <build>
        <!-- 2. 动态资源加载 -->
        <resources>
            <!-- 加载对应环境的配置文件 -->
            <resource>
                <directory>src/main/resources/${env}</directory>
            </resource>
            <!-- 加载公共资源，并排除环境文件夹 -->
            <resource>
                <directory>src/main/resources</directory>
                <excludes>
                    <exclude>config-dev/**</exclude>
                    <exclude>config-prod/**</exclude>
                </excludes>
            </resource>
        </resources>
    </build>
</project>
```

## 方案二：Spring Boot 资源过滤（SpringBoot 专用） ##

适用场景： Spring Boot 项目，利用其多环境配置机制（application-{profile}.yml）。

### 规划项目目录 ###

文件通常平铺在 resources 目录下：

```text
src/main/resources
├── application.yml       <-- 主入口配置
├── application-dev.yml   <-- 开发配置详情
└── application-prod.yml  <-- 生产配置详情
```

### 修改 application.yml ###

在主配置文件中，使用 Maven 的占位符（Spring Boot 推荐使用 `@...@`）：

```yaml
spring:
  profiles:
    active: @profiles.active@  # 这里的值将由 Maven 打包时动态替换
```

### 配置 pom.xml ###

开启资源过滤（Filtering），让 Maven 解析文件中的占位符。

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <profiles.active>dev</profiles.active> <!-- 对应 application-dev.yml -->
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <profiles.active>prod</profiles.active> <!-- 对应 application-prod.yml -->
        </properties>
    </profile>
</profiles>

<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering> <!-- 关键：必须开启过滤 -->
        </resource>
    </resources>
</build>
```


## 实操：在 IDEA 中一键切换 ##

配置完成后，在 IntelliJ IDEA 中的操作步骤完全一致：

1. 打开 Maven 面板：点击 IDEA 右侧侧边栏的 Maven 标签。
2. 找到 Profiles：展开项目下的 Profiles 文件夹。
3. 勾选环境：

   - 想打生产包：勾选 prod（此时 dev 会自动取消勾选）。
  - 想打开发包：勾选 dev。

4. 执行打包：

   - 在 Lifecycle 下，双击 clean（清理旧文件）。
   - 双击 package（开始打包）。

> 💡 小技巧：勾选 Profile 后，如果代码中对变量的引用爆红，可以点击 Maven 面板左上角的 "Reload All Maven Projects"（刷新图标）来同步状态。

## 验证结果 ##

不要盲目相信配置，建议第一次打包后进行验证：

- 打包完成后，在项目左侧文件树中找到 target 目录。
- 展开 target/classes 或解压生成的 .jar 包。
- 方案一验证：检查根目录下是否有 application.properties，且内容是否为生产库地址。
- 方案二验证：打开 application.yml，检查 `active: @profiles.active@` 是否已被替换为 `active: prod`。

## 进阶：CI/CD 命令行打包 ##

如果你的项目使用 Jenkins 或 GitLab CI 进行自动化部署，不需要图形界面，只需在命令中加入 `-P` 参数：

```bash
# 打包开发环境
mvn clean package -Pdev

# 打包生产环境
mvn clean package -Pprod
```

## 总结 ##

通过 Maven Profiles，我们实现了环境配置与代码的解耦：

- 安全性提升：避免了手动修改配置导致的生产事故。
- 效率提升：IDEA 图形化勾选，一键切换。
- 标准化：无论是本地运行还是服务器构建，都统一管理。

建议根据你的项目类型（普通 Maven 项目选方案一，Spring Boot 选方案二）尽快接入这套流程。
