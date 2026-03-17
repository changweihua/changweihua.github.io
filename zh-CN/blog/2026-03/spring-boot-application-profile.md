---
lastUpdated: true
commentabled: true
recommended: true
title: 配置文件application.yml使用指南
description: 配置文件application.yml使用指南
date: 2026-03-17 11:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

Spring Boot 是一个基于 Java 的开源框架，用于快速创建独立、生产级别的 Spring 应用程序。曾经在进行项目配置时，被复杂的配置项和层出不穷的错误信息折磨得几乎想要投降。每次启动应用，都是一场与神秘错误信息的斗争。项目配置就像是一场考验智商的冒险游戏，总是感觉自己掉进了游戏的无底洞。但现在，终于再也不用感到恐慌！只要掌握了 application.yml 的配置技巧，项目配置将变成你的得力助手，就像拥有了一本能解决一切问题的魔法宝典。本篇文章将重点介绍如何使用 application.yml 文件进行配置，帮助开发者更好地管理和优化项目配置。

## 一、概述 ##

### 基本介绍 ###

Spring Boot 的配置体系是其灵活性和易用性的重要体现，配置信息通常存储在 `application.yml` 或 `application.properties` 文件中。对于 Spring Boot 来说，配置文件是入门和基础知识的关键。当构建完 Spring Boot 项目后，`src/main/resources` 目录下会自动生成一个默认的全局配置文件 `application.properties`。这个文件初始为空，因为 Spring Boot 在底层已经完成了大部分的自动配置。即使不进行任何配置，该项目也能顺利的运行起来。当然当需要调整 Spring Boot 默认的配置值时，可以通过修改该配置文件来实现。

YAML 是一种以数据为中心的标记语言，比 XML 和 JSON 更适合作为配置文件。相较于传统的 Properties 配置文件，YAML 文件以数据为核心，是一种更为直观且容易被电脑识别的数据序列化格式。Spring Boot 默认使用的配置文件是 application.properties，此外，还有一种格式是以 .yaml 或 .yml 后缀结尾的 YAML 文件。这两种文件格式本质上是相同的，主要区别在于语法不同。而 application.yaml 作为 YAML 格式的代表，凭借树形结构和直观的层级关系，成为了开发者的好朋友。它不像 JSON 那样显得严肃得像一名老头，也不像 XML 那样繁琐得像一部历史小说。通过 application.yml 配置数据库，可以像给魔法师穿上闪亮的铠甲一样，轻松设置数据源、数据库连接池等信息。

### 配置文件的优先级 ###

Spring Boot 会在启动时自动扫描并加载以下五个目录中的配置文件：

| **序号**        |      **简要说明**      |
| :------------- | :-----------: |
|   1   | 类路径的根目录下的配置文件，例如：`classpath:/application.properties`  |
|   2   | 类路径下的 config 目录下的配置文件，例如：`classpath:/config/application.properties`  |
|   3   | 当前项目跟目录下的配置文件，例如：`./application.properties`  |
|   4   | 当前项目跟目录下的 config 目录下的配置文件，例如：`./config/application.properties`  |
|   5   | 当前项目跟目录下的 config 目录下的子目录下的配置文件，例如：`./config/subdir/application.properties`  |

上面列举了五个目录中的配置文件，其中越往下，配置文件的优先级越高，也就是数字越大，优先级越高。如果在这五个目录下的全局配置文件都配置了相同的属性，优先级高的配置文件会覆盖优先级低的配置文件，顺序越往下，优先级越高。如果在五个全局配置文件中配置了不同的属性，Spring Boot 则会对上面五个位置的配置文件都进行加载，会形成一个互补设置，也就是说不同的属性可以分散在这五个配置文件中，Spring Boot 启动的时候会见分散的不同属性合并在一起。上面的描述可能比较抽象，这里创建了一个项目并创建了五个目录下的五个配置文件，序号和上面的序号一一对应，如下图所示：

注意，如果同一个配置属性在多个配置文件中都配置了，优先级较高的文件中的值会覆盖优先级较低的文件中的值。通过合理利用这些机制，可以灵活地管理不同环境下的配置，确保应用程序在各个阶段都能正常运行。

### 注释规则与最佳实践 ###

在 application.yml 文件中添加注释可以帮助其他开发者更好地理解配置项的意义和用途。YAML 格式支持单行注释，注释以 # 开头。例如：

```yaml
server:
  port: 8080 # 服务器端口
  servlet:
    context-path: /app # 应用上下文路径
```

除了基本的注释规则，还有一些最佳实践可以帮助提高配置文件的可读性和可维护性：

- 明确注释目的：注释应简明扼要地说明配置项的作用和可能的取值范围。
- 避免冗余注释：对于显而易见的配置项，可以省略注释，以免增加不必要的复杂性。
- 分组注释：对于相关的配置项，可以在其上方添加一个分组注释，以便快速定位和理解。
- 版本控制：在团队协作中，使用版本控制系统（如 Git）管理配置文件，记录每次修改的原因和影响。

通过遵循这些最佳实践，我们可以编写出更加清晰、易于维护的配置文件，从而提高开发效率和代码质量。

## 二、YAML 配置文件语法 ##

上面介绍了不同文件目录下配置文件的优先级以及不同文件名的配置文件的优先级，但我们在实际开发是不会这么花里胡哨的，一般都是放在 `src/main/resources/` 目录下，同时在该目录下创建一个名为 `application.yaml` 的配置文件，后缀名为 yaml 格式的配置文件更常用。这里会介绍一些常用的配置信息，更多的配置信息，可以参考官网：Spring Boot 配置

### 基本语法 ###

yaml 格式配置文件通过 `key: value` 表示键值对关系，冒号后面必须加一个空格。而且 yaml 格式是大小写敏感的，也就是无论是键、还是值，都是区分大小写的。其使用缩进表示层级关系，但是缩进不允许使用 Tab 键，只允许使用空格，缩进的空格数不重要（一般都是两个空格），只要相同层级的元素左对齐即可。

```yaml
server:
  port: 8081   # 注意：冒号后面必须加一个空格
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/mycnblog?characterEncoding=utf8&useSSL=false
    username: root
    password: root
```

### 值的写法 ###

#### 字面量写法 ####
  字面量是指单个的、不可拆分的值，包括：数字、字符串、布尔值、以及日期等。使用一个例子来快速了解纯量的基本使用，如下所示：

```yaml
server:
  port: 8080  # 数字，设置端口号
  ssl:
    enabled: true  # 布尔值，启用 SSL
spring:
  application:
    name: MySpringBootApp  # 字符串，应用名称
  datasource:
    hikari:
      maximum-pool-size: 10  # 数字，数据库连接池最大连接数
logging:
  level:
    org.springframework: INFO  # 字符串，设置日志级别
app:
  featureEnabled: true  # 布尔值，启用某些功能
```

上述示例中，在双引号字符串中，可以使用转义字符（例如 `\n`、`\t`、`\\` 等），这些转义字符会被解析和转义。而单引号中的字符串会被原样输出，任何转义字符（如 `\n`）都会被视作普通字符，而不会被解析为换行符。如果字符串什么引号都不加，默认也是不支持转义字符。如果冒号后面什么都不加则表示空字符串，当这种方式不直观，更多的表示是使用引号括起来。

```yaml
spring:
  datasource:
    url: "" 	 # 空字符串
    username: '' # 单引号也表示空字符串
    password:    # 什么都不写表示空字符串
```

#### 对象或Map写法 ####

当YAML配置文件中配置的属性值为Map集合或对象类型时，可能包含多个属性，每一个属性都是一对键值对。对于这类的配置，可以使用块级表示法，例如：

```yaml
friends:
  name: zhangsan
  age: 20
```

Yaml 也允许另一种写法，将所有键值对写成一个行内对象。

```yaml
person: {name: "zhangsan", age: 25}
```

#### 数组、List、Set写法 ####

当 YAML 配置文件中配置的属性值为数组或单列集合类型时，可以使用块级表示法（即由一组连词线开头的行构成），或者也可以使用行内表示法，也就是写在一行，例如：

```yaml
pets:
  - cat
  - dog
  - pig
  - cat  # 重复元素 会被当作List处理

person:
  hobby: [篮球, 跑步, 读书]
```

### 属性占位符 ###

在 Spring Boot 中的占位符语法通常是 `${var}`，用来引用配置文件中的其他属性或系统环境变量，可以使用这种语法来动态替换或传递值。application.yml 配置示例如下所示：

```yaml
app:
  name: Spring Boot Properties Sample
  description: ${app.name} For My Github's Blog
```

我们还可以使用 `${var:defalutValue}` 语法来设置默认的值，如果 var 不存在, 则使用默认的值。application.yml 配置示例如下所示：

```yaml
app:
  name: Spring Boot Properties Sample
  description: ${app.name :YourName} For My Github's Blog
```

### 配置随机值 ###

在一些特殊情况下，有些参数我们希望它每次加载的时候不是一个固定的值，比如：密钥、服务端口等，可以提高系统的灵活性和安全性。Spring Boot 提供了一个 `random.*` 属性，专门用于确保应用程序在每次启动时都能获得不同的配置。这样我们就可以容易的通过配置来属性的随机生成，而不是在程序中通过编码来实现这些逻辑。具体的生成的随机值的函数如下表所示，可作为参考使用。

| **属性**        |      **描述**      |
| :------------- | :-----------: |
|   `random.int`   | 随机产生正负的整数  |
|   `random.int(max)`   | 随机产生 [0, max) 区间的整数  |
|   `random.int(min,max)`   | 随机产生 [min, max) 区间的整数  |
|   `random.long`   | 随机产生正负的长整数  |
|   `random.long(max)`   | 随机产生 [0, max) 区间的长整数  |
|   `random.long(min,max)`   | 随机产生 [min, max) 区间的长整数  |
|   `random.uuid`   | 产生UUID字符串（含-字符）  |
|   `random.*`   | 表示除上面列举之外的其他字符，用于随机产生 32 位字符串  |


该配置方式可以用于设置应用端口等场景，避免在本地调试时出现端口冲突的麻烦。例如：

```yaml
random-seed:
  random-int-value: ${random.int}
  random-int-range-value: ${random.int(2)}
  random-long-value: ${random.long}
  random-long-range-value: ${random.long(1,3)}
  random-uuid-value: ${random.uuid}
  random-str-value: ${random.whatever}
```

## 三、配置文件读取 ##

Spring Boot 对 yaml 文件中配置的属性名称提供了一些绑定规则，它不要求配置的属性名称完全与Bean中的属性名称相同。它支持以下几种规则的命名方式：

| **属性**        |      **简要说明**      |
| :------------- | :-----------: |
|   userName  | 标准的驼峰式命名。  |
|   user-name  | 单词之间通过 - 分隔，Spring Boot 推荐这种。  |
|   user_name  | 单词之间通过 _ 分隔U  |
|   SER_NAME  | 单词全部大写并通过 _ 分隔，在使用系统环境变量时推荐这种。  |

### 通过 @Value 读取 ###

通过使用 `@Value("${属性名称}")` 来将配置文件里面的值注入到程序属性中，同时还需要使用 `@Component` 或者 `@Configuration` 将该组件加入 Spring Boot 容器，只有这个组件是容器中的组件，配置才生效。一般只是在某个业务逻辑中需要获取配置文件中的某项值，就使用可以使用该注解。例如：需要读取配置文件中指定的端口和ID。

```yaml
server:
  port: 8082
  ip: 127.0.0.1
```

```java
@Data
@Component
public class ServerConfig {
    @Value("${server.port}")
    public String Port;
    @Value("${server.ip}")
    public String IP;
}
```

### 通过 `@ConfigurationProperties` 读取 ###

有时候属性太多了，一个个绑定到属性字段上太累，官方提倡绑定一个对象的 bean。`@ConfigurationProperties` 向 Spring Boot 声明该类中的所有属性和配置文件中相关的配置进行绑定，所以该注解是一个作用在类上的注解，如下所示。同时还需要使用 `@Component` 或者 `@Configuration` 将该组件加入 Spring Boot 容器，只有这个组件是容器中的组件，配置才生效。

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Indexed
public @interface ConfigurationProperties {
    /**
     * 声明配置前缀，将该前缀下的所有属性进行映射
     */
    @AliasFor("prefix")
    String value() default "";

    @AliasFor("value")
    String prefix() default "";

    boolean ignoreInvalidFields() default false;

    boolean ignoreUnknownFields() default true;
}
```

当我们需要将配置文件中的属性映射成一个类的时，就可以使用该属性。

```yaml
server:
  port: 80
  ip: 127.0.0.1
```

```java
@Data
@Component
@ConfigurationProperties(prefix = "server")
public class ServerConfig {
    public String port;
    public String ip;
}
```

### 使用 @Profile 注解 ###

除了配置文件，还可以使用 @Profile 注解来实现环境特定的 Bean 配置。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class DataSourceConfig {
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // 返回开发环境的 DataSource 实例
    }
    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // 返回生产环境的 DataSource 实例
    }
}
```

## 四、多环境配置文件 ##

在实际项目中，有时候需要配置多个配置文件，不同的环境可能需要不同的配置，例如每个环境的数据库地址、服务器端口等等配置都会不同，如果在为不同环境打包时都要频繁修改配置文件的话，那必将是个非常繁琐且容易发生错误的事。为了让同一个应用在不同环境下使用不同的配置，Spring Boot 提供了基于 profile 的配置文件机制。Spring Boot 提供了 `spring.profiles.active` 属性来切换不同的配置文件。我们可以通过该属性来指定当前活动的配置文件，Spring Boot 会自动加载与指定环境相关的配置文件。

### 多环境配置 ###

假设现在有两个环境，一个是开发环境（dev），一个是生产环境（prod），这两个环境使用的数据库名不同，因此我们需要采用不同的配置。在Spring Boot 中，通常有三种方式来管理这种情况：

- 使用不同的配置文件（多配置文件方式）：将不同环境的配置分别存放在独立的文件中，例如 `application-dev.yaml` 和 `application-prod.yaml`。在全局的 `application.yaml` 文件中，通过设置 `spring.profiles.active` 来选择激活特定的配置文件，从而加载对应环境的配置。
- 使用Spring Profiles来切换不同的配置（多Profile的方式）：将所有环境的配置整合在同一个 application.yaml 文件中，通过 --- 分隔符区分不同的 Profile 块。例如，一个 Profile 块用于开发环境（dev），另一个用于生产环境（prod）。通过设置 `spring.profiles.active` 来激活相应的 Profile 块，从而应用对应环境的配置。
- 通过Maven Profile实现环境切换：利用 Maven 的 Profile 功能，在 pom.xml 中定义不同的 Maven Profile。每个 Maven Profile 配置相应的 `spring.profiles.active` 属性。在构建项目时，通过指定 Maven Profile 来自动激活对应的 Spring Profile，实现环境配置的自动切换，适合需要自动化和集成化管理的项目。

#### 多配置文件方式 ####

在实际开发中，不同的环境（如开发、测试、生产）往往需要不同的配置。Spring Boot 提供了多种方式来实现配置属性的继承与覆盖，以满足不同环境的需求。这种方式就是在 `/src/main/resources/` 目录下创建三个配置文件，其中 `application.yaml` 文件必须要有，不同环境下的配置文件的命名方式：`application-{profile}.yaml`。

application.yaml：全局通用配置文件

```yaml
spring:
  application:
    name: MyApp
  profiles:
    active: dev
logging:
  level:
    org.springframework: INFO
# 开发环境的配置
server:
  port: 8081
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/devdb
    username: devuser
    password: devpassword
```

application-dev.yaml：开发环境的配置文件

```yaml
# 开发环境的配置
server:
  port: 8081
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/devdb
    username: devuser
    password: devpassword
```

application-prod.yaml：生产环境的配置文件

```yaml
# 生产环境的配置
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/proddb
    username: produser
    password: prodpassword
```

在 application.yaml 文件中通过 `spring.profiles` 属性指定不同的环境，如果没有指定，默认就使用 `application.yaml` 文件中的配置。如果指定了 `spring.profiles.active=dev`，就是激活 `application-dev.yaml` 配置文件中的配置。

#### 多profile方式 ####

Spring Boot 支持基于环境的配置文件，这些文件会根据当前激活的 profile 被加载。这种方式将所有环境的配置放在一个配置文件中，并通过 Profile 块来区分不同的环境配置。在 application.yml 中，全局配置通常是最先加载的配置，通常在文件的顶部定义。之后，针对不同的环境或 Profile，可以通过 --- 来分隔不同的配置块，如开发环境、生产环境等。

```yaml
# 全局配置
server:
  port: 8081
spring:
  application:
    name: MyApp  # 全局应用名称
  profiles:
  	active: prod

# 开发环境配置
---
server:
  port: 8082  # 开发环境端口
spring:
  profiles: dev

# 生产环境配置
---
server:
  port: 8083  # 生产环境端口
spring:
  profiles: prod
```

#### 通过Maven来实现多环境配置 ####

Maven 允许根据不同的构建配置（Profile）来定制不同的资源文件，进而实现针对不同环境的配置。在 Maven 中，可以通过 `<profiles>`和 `<profile>` 标签来来定义不同的构建环境，每个环境对应不同的属性和资源文件。结合 Maven 的资源过滤功能，可以在构建过程中自动替换资源文件中的占位符，从而实现多环境的配置切换。

**配置Maven Profile**

Maven的 `<profile>`元素允许为不同的环境指定不同的构建配置，每个 `<profile>` 可以包含不同的属性、资源文件路径等。下面是一个示例，定义了多个构建环境，包括开发、测试和生产环境。

```xml
  <profiles>
    <!-- 本地开发环境 -->
    <profile>
        <id>dev</id>
        <properties>
            <env>dev</env>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <!-- 测试环境 -->
    <profile>
        <id>test</id>
        <properties>
            <env>test</env>
        </properties>
    </profile>
    <!-- 生产环境 -->
    <profile>
        <id>prod</id>
        <properties>
            <env>prod</env>
        </properties>
    </profile>
</profiles>
```

**配置资源文件过滤**

Maven 提供了资源文件过滤功能，通过在 `<build>` 中配置 `<resources>` 来指定哪些资源文件需要进行过滤。启用 `<filtering>` 后，Maven 会在构建过程中替换资源文件中定义的占位符。配置如下：

```xml
<build>
	<resources>
		<resource>
			<directory>src/main/resources</directory>
		</resource>
		<resource>
			<directory>src/main/resources-env/${env}</directory>
			<filtering>true</filtering>  <!-- 开启过滤，替换占位符 -->
		</resource>
	</resources>
</build>
```

**配置环境加载**

如果配置好了 pom.xml 文件以及在指定目录下创建好了配置文件，借助IDEA工具，就会OK

### 多环境配置的激活 ###

- 在主配置文件中激活指定配置文件：这是最简单的方式，就是在 `application.yaml` 中通过 `spring.profile.active` 来选择需要激活的配置文件。

- 命令行参数激活指定配置文件：就是在命令行将项目打包成jar包时，在打包命令中加入参数`--spring.profiles.active`，例如：

```bash
java -jar spring-boot-demo-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod  # 指定激活生产环境
```

- IDEA 配置参数激活指定配置文件：将 `Active profiles` 的参数设置为 `dev`，表示激活开发环境

## 五、小结 ##

本文深入探讨了 Spring Boot 框架中核心配置文件 application.yml 的详细使用和配置指南，application.yaml 是 Spring Boot 配置管理的核心工具，其层次结构和灵活性使其在多环境配置、属性绑定等场景中表现出色。通过理解其加载机制、掌握绑定技巧并结合高级功能，我们可以更高效地组织配置，提升应用的维护性和扩展性，确保其在不同环境下的稳定运行和高效性能。
