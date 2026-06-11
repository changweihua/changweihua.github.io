---
lastUpdated: true
commentabled: true
recommended: true
title: 别再乱加exclusion了！
description: Maven依赖冲突有妙解
date: 2026-03-26 09:34:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

## 线上事故引发的思考 ##

前几天，我遇到了一个令人头疼的线上问题。系统突然报错，大量的 SQL 解析直接超时，日志里满是 `JSQLParserException: Time out occurred`。这可把我急坏了，赶紧着手排查。

一番艰难的排查后，发现问题出在 `JSqlParser` 4.6 版本上，这是一个已知的 bug，在解析复杂 SQL 时，会陷入回溯地狱，CPU 直接被打满。找到问题就好办了，解决方案也很简单，升级到 4.9 版本就可以解决。

但事情远没有这么简单。当我准备升级版本时，发现我们项目里有好几个库都依赖 `JSqlParser：mybatis-plus-core` 依赖 4.6 ，pagehelper 依赖 4.6 ，而我们自己的 `flcloud-jdbc-cipher` 要用 4.9 。这就尴尬了，同一个 jar 包，三个地方要三个版本，Maven 该怎么处理呢？相信不少小伙伴在日常开发中也遇到过类似的依赖冲突问题，今天咱们就来好好聊聊如何正确处理 Maven 依赖冲突，别再到处写 exclusion 了。

## Maven 依赖仲裁机制揭秘 ##

要解决依赖冲突，首先得了解 Maven 的依赖仲裁机制。Maven 在处理依赖时，主要遵循两个核心规则：路径最短优先和最先声明优先 。

### 深度决定版本？路径最短优先 ###

路径最短优先，简单来说，就是 Maven 会选择依赖树中路径最短的那个版本。比如说，我们有一个项目Project，它依赖了A和B两个库。A库又依赖了C库的 1.0 版本，而 `B` 库依赖了 `D` 库， `D` 库又依赖了 `C` 库的 2.0 版本 。这时候，Project对C库就有了两条依赖路径：`Project -> A -> C:1.0`和`Project -> B -> D -> C:2.0` 。很明显，第一条路径的长度是 2，第二条路径的长度是 3 。根据路径最短优先原则，Maven 最终会选择C库的 1.0 版本。

用依赖树的形式表示就是：

```txt
Project
├── A:1.0
│   └── C:1.0
└── B:1.0
    └── D:1.0
        └── C:2.0
```

在这个例子中，`C` 库的 1.0 版本路径更短，所以它会被 Maven 选中。这就好比你要去一个地方，有两条路可以走，一条路更近，你肯定会选择更近的那条路，Maven 也是这么想的。

### 声明顺序也关键？最先声明优先 ###

当依赖路径长度相同时，Maven 就会启用第二个规则：最先声明优先。这个规则是说，在 `pom.xml` 文件中，哪个依赖声明在前面，就优先使用哪个依赖的版本。比如说，还是上面那个`Project`，现在`A`库和`B`库都直接依赖`C`库，`A`库依赖C库的 `1.0` 版本，`B`库依赖`C`库的 `2.0` 版本 ，并且在`pom.xml`中，`A`库的依赖声明在`B`库之前。这时候，虽然两条依赖路径长度都是 1，但是由于`A`库的依赖声明在前，Maven 就会选择`C`库的 `1.0` 版本。

依赖树表示如下：

```txt
Project
├── A:1.0
│   └── C:1.0
└── B:1.0
    └── C:2.0
```

在 `pom.xml` 中的声明顺序如下：

```xml
<dependencies>
    <!-- 先声明A -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>A</artifactId>
        <version>1.0</version>
    </dependency>
    <!-- 后声明B -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>B</artifactId>
        <version>1.0</version>
    </dependency>
</dependencies>
```

这样，Maven 就会根据声明顺序，选择 `C` 库的 `1.0` 版本。这就像是排队买票，谁排在前面谁先买，Maven 在选择依赖版本时也是这个道理。

## 最初的 “简单粗暴” 方案 ##

### 大量使用 exclusion 的操作 ###

当时遇到 `JSqlParser` 版本冲突问题，我第一时间想到的就是在 `pom.xml` 文件中大量使用 `exclusion` 标签来排除不需要的版本。在 `mybatis-plus-boot-starter` 的依赖中添加 `exclusion`：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
    <exclusions>
        <exclusion>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

同样，在 `pagehelper-spring-boot-starter` 的依赖中也进行类似的操作：

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>2.1.0</version>
    <exclusions>
        <exclusion>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

这样做的目的很明确，就是想把 `mybatis-plus-core` 和 `pagehelper` 引入的 `JSqlParser 4.6` 版本排除掉，让项目最终使用我们自己 `flcloud-jdbc-cipher` 需要的 4.9 版本。

### 该方案存在的问题 ###

这种方法虽然看似解决了当下的问题，但很快我就发现它存在诸多弊端。项目中有多个依赖都需要处理，这意味着我要在多个地方添加exclusion标签 ，整个 `pom.xml` 文件变得冗长繁琐，到处都是 `exclusion` 的配置，可读性大大降低。而且这种手动添加 `exclusion` 的方式非常容易遗漏，只要有一个地方忘记排除，就可能导致依赖冲突再次出现 ，就像一颗隐藏的定时炸弹，随时可能引爆项目。

对于新加入项目的同事来说，他们很难理解这些 `exclusion` 的含义和作用。如果他们在不知情的情况下，添加了一个新的依赖，而这个依赖又引入了旧版本的 `JSqlParser` ，那么之前好不容易解决的依赖冲突问题就会再次出现，整个项目又会陷入混乱。所以，这种大量使用 `exclusion` 的方案并不是一个可持续的、优雅的解决方案，我们需要寻找更好的方法来处理依赖冲突。

## 更优雅的解决方案 ##

### dependencyManagement 锁版本 ###

后来我发现了一种更优雅的解决方案，那就是在 `父pom` 的 `dependencyManagement` 中锁定版本。只需要在父 `pom.xml` 中添加如下配置：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
            <version>4.9</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

就这么简单的几行配置，加上之后，不管子模块的依赖树里 `jsqlparser` 出现多少次、原本写的是什么版本，最终都会被统一成 `4.9` 版本。这就像是给所有子模块的 `jsqlparser` 依赖定了一个 “规矩”，大家都得按照这个版本来。

用依赖树图示表示就是：

```txt
Parent Pom
└── dependencyManagement
    └── com.github.jsqlparser:jsqlparser:4.9

Child Module 1 (mybatis - plus - core)
├── mybatis - plus - core
│   └── com.github.jsqlparser:jsqlparser:4.6 (被覆盖为4.9)

Child Module 2 (pagehelper)
├── pagehelper
│   └── com.github.jsqlparser:jsqlparser:4.6 (被覆盖为4.9)

Child Module 3 (flcloud - jdbc - cipher)
├── flcloud - jdbc - cipher
│   └── com.github.jsqlparser:jsqlparser:4.9
```

从这个依赖树中可以清晰地看到，即使 `mybatis-plus-core` 和 `pagehelper` 原本依赖的是 4.6 版本，但在 `dependencyManagement` 的作用下，最终都被统一成了 4.9 版本。

### 优先级背后的原理 ###

可能有些小伙伴会好奇，为什么 `dependencyManagement` 的优先级最高呢？我之前也没太搞明白，后来翻了下 Maven 的文档，才弄清楚其中的原理。`dependencyManagement` 的作用就是 “预定义” 版本号，它不会真的引入依赖，但一旦这个依赖在依赖树中出现，就会强制使用预定义的版本 。所以它的优先级比什么路径深度、声明顺序都高，直接一锤定音 。

根据 Maven 的官方文档描述，在依赖解析过程中，Maven 会优先检查 `dependencyManagement` 中定义的版本。如果在 `dependencyManagement` 中找到了对应的依赖版本，就会使用这个版本，而忽略其他地方声明的版本 。这就好比在一个团队中， `dependencyManagement` 就像是一个 “权威的领导者”，它制定的规则（版本号），其他成员（依赖）都必须遵守。哪怕其他依赖在路径深度上有优势，或者声明顺序在前，在 `dependencyManagement` 面前，都得按照它规定的版本来。所以，通过 `dependencyManagement` 来锁定版本，能够有效地避免依赖冲突，让项目的依赖管理更加可控、更加优雅。

## 解决冲突后的验证工作 ##

### 验证各库在新版本下的兼容性 ###

在通过 `dependencyManagement` 锁定版本解决依赖冲突后，可不能掉以轻心，还有很重要的一步 —— 验证各库在新版本下的兼容性 。不同版本的库，其 API 和功能可能会有变化，如果不进行验证，很可能会引入新的问题。

就拿之前的JSqlParser版本升级来说，从 4.6 升级到 4.9 ，虽然解决了 SQL 解析超时的问题，但也可能带来其他问题。因为新版本的JSqlParser在 API 上可能有一些改动 ，如果我们的代码中使用了一些在 4.9 版本中被废弃或者改动的 API，那么项目在运行时就可能会报错。比如，4.6 版本中解析 SQL 的某个方法签名是`parseSql(String sql) `，到了 4.9 版本可能变成了`parse(String sql, SqlParserConfiguration config)` ，如果我们的代码没有及时更新，就会出现方法找不到的错误。

为了避免这种情况，我们需要进行充分的兼容性验证。最好的办法就是跑单测，通过编写一系列的单元测试用例，覆盖各种可能的场景，来验证新版本的库是否能正常工作。对于JSqlParser，我们可以编写测试用例来测试不同类型的 SQL 语句（如SELECT、INSERT、UPDATE、DELETE等）是否能正确解析，以及在复杂 SQL 场景下是否还会出现超时问题。如果单测通过，那么说明新版本的库在当前项目中基本是兼容的；如果单测失败，就需要仔细检查错误信息，看看是哪里出了问题，可能需要调整代码或者寻找其他解决方案。

### 查看依赖树的实用命令 ###

在解决依赖冲突的过程中，查看依赖树是非常重要的一步。通过查看依赖树，我们可以清楚地了解项目中各个依赖之间的关系，以及每个依赖的版本，从而更好地定位和解决冲突。Maven 提供了一些非常实用的命令来查看依赖树。

`mvn dependency:tree`：这个命令会输出项目的完整依赖树，显示所有依赖的层级关系和版本信息。在解决JSqlParser依赖冲突时，使用这个命令可以看到`mybatis-plus-core`、`pagehelper`和`flcloud-jdbc-cipher`对JSqlParser的依赖路径和版本，如下所示：

```txt
[INFO] com.example:my-project:jar:1.0.0
[INFO] +- com.baomidou:mybatis-plus-boot-starter:jar:3.5.3.1:compile
[INFO] |  \- com.baomidou:mybatis-plus-core:jar:3.5.3.1:compile
[INFO] |     \- com.github.jsqlparser:jsqlparser:jar:4.6:compile
[INFO] +- com.github.pagehelper:pagehelper-spring-boot-starter:jar:2.1.0:compile
[INFO] |  \- com.github.pagehelper:pagehelper:jar:5.3.2:compile
[INFO] |     \- com.github.jsqlparser:jsqlparser:jar:4.6:compile
[INFO] \- com.example:flcloud-jdbc-cipher:jar:1.0.0:compile
[INFO]    \- com.github.jsqlparser:jsqlparser:jar:4.9:compile
```

从这个依赖树中，我们可以清晰地看到各个依赖之间的关系，以及JSqlParser不同版本的依赖路径。

`mvn dependency:tree -Dincludes=groupId:artifactId`：这个命令可以用来查看特定依赖的引入路径。比如，我们想查看JSqlParser是被哪些依赖引入的，就可以使用 `mvn dependency:tree -Dincludes=com.github.jsqlparser:jsqlparser` ，这样就能更专注地查看与JSqlParser相关的依赖信息，而不会被其他无关的依赖干扰。

`mvn dependency:tree -Dverbose`：这个命令会输出更详细的依赖信息，包括依赖冲突、重复依赖、被排除的依赖等。在排查复杂的依赖冲突问题时，这个命令非常有用，它可以帮助我们发现一些隐藏的问题，比如某个依赖被意外排除导致的功能异常。

### IDEA 可视化查看依赖冲突 ###

除了使用 Maven 命令行工具查看依赖树和冲突，在 IDEA 中也有非常直观的方式来进行依赖分析。在 IDEA 中打开项目的 `pom.xml` 文件，然后在底部的标签栏中找到 “Dependency Analyzer” 标签页 。

点击进入 “Dependency Analyzer” 标签页后，IDEA 会以图形化的方式展示项目的依赖树，并且会用不同的颜色和标识来突出显示依赖冲突的部分。比如，当存在版本冲突的依赖时，冲突的依赖会被用红色字体标注出来，并且会显示出不同版本的依赖路径 。通过这种可视化的方式，我们可以非常直观地看到哪些依赖存在冲突，以及冲突的具体情况 ，相比命令行工具，更加方便快捷，尤其是对于复杂的项目依赖关系，能大大提高我们排查和解决问题的效率。而且，在这个界面中，我们还可以直接右键点击依赖，选择排除依赖或者查看依赖详情等操作，进一步简化了依赖管理的流程。

## 总结与互动 ##

处理 Maven 依赖冲突时，到处写 `exclusion` 虽然能解决一时之需，但从长远来看，并不是一个好的选择。而使用 `dependencyManagement` 来统一管理依赖版本，不仅能让 `pom.xml`文件更加简洁易读，还能从根本上避免依赖冲突的发生，让项目的依赖管理更加稳定和可靠。
