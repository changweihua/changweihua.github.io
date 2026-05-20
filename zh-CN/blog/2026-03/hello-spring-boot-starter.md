---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot Starter的用法以及原理
description: SpringBoot Starter的用法以及原理
date: 2026-03-24 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 示例：hello-spring-boot-starter ##

为了理解 SpringBoot Starter 的写法，以 `hello-spring-boot-starter` 作为示例来讲解

### 创建父模块 hello-spring-boot-starter-project ###

`hello-spring-boot-starter-project` 将作为整个项目的父模块，其 `pom.xml` 文件如下：

```xml
<!--添加子模块-->  
<modules>  
<module>hello-spring-boot-starter</module>  
<module>hello-spring-boot-starter-autoconfigure</module>  
</modules>  
<!--定义的参数-->  
<properties>  
<maven.compiler.source>17</maven.compiler.source>  
<maven.compiler.target>17</maven.compiler.target>  
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>  
<spring-boot.version>3.0.7</spring-boot.version>  
</properties>  
<!--依赖的配置约定-->  
<dependencyManagement>  
<dependencies>  
<dependency>  
<groupId>org.springframework.boot</groupId>  
<artifactId>spring-boot-autoconfigure</artifactId>  
<version>${spring-boot.version}</version>  
</dependency>  
<dependency>  
<groupId>org.springframework.boot</groupId>  
<artifactId>spring-boot-configuration-processor</artifactId>  
<version>3.5.11</version>  
</dependency>  
</dependencies>  
</dependencyManagement> 
```


### 创建子模块hello-spring-boot-starter-autoconfigure ###

`hello-spring-boot-starter-autoconfigure` 作为父模块 `hello-spring-boot-starter-project` 的一个子模块，其pom.xml关键配置如下：

```xml
<!--设置父模块-->  
<parent>  
<groupId>edu.whut</groupId>  
<artifactId>hello-spring-boot-starter-project</artifactId>  
<version>1.0-SNAPSHOT</version>  
</parent>
<dependencies>  
<dependency>  
<groupId>org.springframework.boot</groupId>  
<artifactId>spring-boot-autoconfigure</artifactId>  
</dependency>  
<dependency>  
<groupId>org.springframework.boot</groupId>  
<artifactId>spring-boot-configuration-processor</artifactId>  
</dependency>  
</dependencies>
```

在其模块内部创建三个文件

```java:HelloService.java
public class HelloService {  
private final HelloProperties properties;  
  
public HelloService(HelloProperties properties) {  
this.properties = properties;  
}  
  
public void sayHello() {  
System.out.println("Hello,"+properties.getObject());  
}  
}
```

```java:HelloProperties.java
@ConfigurationProperties(prefix = "hello")  
public class HelloProperties {  
private String object;  
  
public String getObject() {  
return object;  
}  
  
public void setObject(String object) {  
this.object = object;  
}  
}
```

```java:HelloAutoConfiguration.java
//标识自动配置类  
@AutoConfiguration  
@EnableConfigurationProperties(HelloProperties.class)  
public class HelloAutoConfiguration {  
@Bean  
//在application文件中配置了hello.object配置才会构造这个bean  
@ConditionalOnProperty(prefix = "hello", name = "object")  
public HelloService helloService(HelloProperties properties) {  
return new HelloService(properties);  
}  
}
```

在 `hello-spring-boot-starter-autoconfigure` 模块中的 `resources` 下的 `META-INF` 下的 `spring` 目录下创建一个名为org.`springframework.boot.autoconfigure.AutoConfiguration.imports`的文件，文件中写入：

```txt
net.cmono.HelloAutoConfiguration
```

### 创建hello-spring-boot-starter子模块 ###

`hello-spring-boot-starter` 作为父模块 `hello-spring-boot-starter-project` 的一个子模块，其 `pom.xml` 关键配置如下：

```xml
<!--指定父模块-->  
<parent>  
<groupId>edu.whut</groupId>  
<artifactId>hello-spring-boot-starter-project</artifactId>  
<version>1.0-SNAPSHOT</version>  
</parent>
<dependencies>  
<dependency>  
<groupId>edu.whut</groupId>  
<artifactId>hello-spring-boot-starter-autoconfigure</artifactId>  
<version>1.0-SNAPSHOT</version>  
</dependency>  
</dependencies>
```

这样这个模块就完成了

### 使用hello-spring-boot-starter ###

随意创建一个springboot项目，在 `main` 方法中查找对应的名为 `helloService`的`bean`

```java
public static void main(String[] args) {  
ConfigurableApplicationContext applicationContext = SpringApplication.run(DemoApplication.class, args);  
Object bean = applicationContext.getBean("helloService");  
System.out.println(bean);  
}
```

结果为：

```txt
Exception in thread "main" org.springframework.beans.factory.NoSuchBeanDefinitionException: No bean named 'helloService' available
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBeanDefinition(DefaultListableBeanFactory.java:978)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getMergedLocalBeanDefinition(AbstractBeanFactory.java:1381)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:302)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:202)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1296)
	at com.example.demo.DemoApplication.main(DemoApplication.java:12)
```

这是正常的，因为现在还未设置配置，更改 `aplication.properties`，写入：

```ini
hello.object="world"
```

再次运行程序，现在就可以获取到starter中配置的bean：

```txt
edu.whut.HelloService@4463d9d3
```

## 为什么要使用springboot starter？ ##

有人可能好奇，这么大费周章，就是为了把一个对象注入到IOC容器中？那为什么不直接在项目里注入？

因为每个Starter是一个高内聚的功能模块，通过依赖传递和条件化配置（@ConditionalOnClass等）实现“智能装配”，避免冗余代码。

## 为什么不直接写starter，反而需要一个autoconfigure？ ##

这是为了遵循Spring Boot官方提倡的“关注点分离”原则，将自动配置逻辑和依赖管理解耦，让架构更清晰、更易维护。

`autoconfigure` 包含条件化配置类、`@ConfigurationProperties`、`META-INF/spring.factories`（或`org.springframework.boot.autoconfigure.AutoConfiguration.imports`）

`starter` 仅一个 `pom.xml`，聚合 autoconfigure模块​ + 该功能所需的所有第三方依赖

## springboot starter自动装配的原理 ##

@SpringBootApplciation注解是一个组合注解，这个注解被一个@EnableAutoConfiguration所注解。

### @EnableAutoConfiguration ###

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class) // 核心关键
public @interface EnableAutoConfiguration {
    // ...
}
```

`ImportSelector` 是一个用于动态、编程式地选择要导入的配置类的核心接口，它是一个函数式接口，核心方法是：

```java
String[] selectImports(AnnotationMetadata importingClassMetadata);
```

这个方法根据给定的注解元数据（被@Import注解的类的信息），返回一个由全限定类名组成的字符串数组。这些返回的类名会在运行时被Spring容器处理，就像它们原本就被@Import注解直接引用一样，其内部的@Configuration、@Bean等注解会被正常解析。

### AutoConfigurationImportSelector ###

AutoConfigurationImportSelector实现了ImportSelector接口，实现了selectImports方法。

```java
public String[] selectImports(AnnotationMetadata annotationMetadata) {  
// 1. 检查是否开启了自动装配（默认是开启的）
if (!this.isEnabled(annotationMetadata)) {  
return NO_IMPORTS;  
} else {  
AutoConfigurationEntry autoConfigurationEntry = this.getAutoConfigurationEntry(annotationMetadata);  
return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());  
}  
}
```

因此核心的逻辑是 `getAutoConfigurationEntry(annotationMetadata)`

```java
protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {  
if (!this.isEnabled(annotationMetadata)) {  
return EMPTY_ENTRY;  
} else {  
AnnotationAttributes attributes = this.getAttributes(annotationMetadata); 
//加载所有候选配置类
List<String> configurations = this.getCandidateConfigurations(annotationMetadata, attributes);  //移除重复和显式排除的类
configurations = this.removeDuplicates(configurations);  
Set<String> exclusions = this.getExclusions(annotationMetadata, attributes);  
this.checkExcludedClasses(configurations, exclusions);  
configurations.removeAll(exclusions);  
//进行条件注解的筛选
configurations = this.getConfigurationClassFilter().filter(configurations);  
this.fireAutoConfigurationImportEvents(configurations, exclusions);  
return new AutoConfigurationEntry(configurations, exclusions);  
}  
}
```

在这个方法中，核心逻辑只有三步:

- 加载所有的候选配置类
- 移除重复和显式排除的类
- 进行“条件注解”筛选

### 加载候选配置类 ###

调用 `getCandidateConfigurations()`。这个方法会去约定好的位置，读取一个文件，这个文件里列出了所有可能被加载的自动配置类。
这个约定好的位置，在 `springboot3` 是`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`，这个文件的每一行是一个全类名，在 `springboot2.x` 中是`META-INF/spring.factories`，`org.springframework.boot.autoconfigure.EnableAutoConfiguration`为键的值就是一系列全类名。

无论哪种格式，此时得到的都是一个巨大的List，包含了Spring Boot所有内置的（如DataSourceAutoConfiguration, WebMvcAutoConfiguration）以及第三方starter提供的自动配置类。因此要进行后续的排除和筛选。

## 总结 ##

- 启动：执行 `SpringApplication.run()`，启动Spring容器
- 触发：容器解析主类上的 `@SpringBootApplication` -> `@EnableAutoConfiguration`
- 决策：`@EnableAutoConfiguration` 导入 `AutoConfigurationImportSelector`
- 扫描：`AutoConfigurationImportSelector` 从 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Spring Boot 3）中读取所有候选自动配置类。
- 排除和筛选：对候选列表进行层层筛选。
- 导入：将最终满足所有条件的自动配置类的全限定名数组返回给容器。
- 解析与注册：容器将这些自动配置类当作普通的 @Configuration类进行解析，将其内部符合条件的 @Bean方法注册为Bean定义。
