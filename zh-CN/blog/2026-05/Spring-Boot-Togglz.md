---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 项目与 Togglz 深度整合
description: 实现特性开关全攻略
date: 2026-05-06 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在当今快速迭代的软件开发领域，如何高效地管理和控制应用程序的功能特性，成为了开发者们面临的重要挑战。想象一下，在不重启应用的情况下，就能灵活地启用或禁用某些功能，根据不同的用户群体、环境条件等因素，动态调整应用的功能展示和使用权限，这是不是非常酷？而 Togglz，这个强大的 Java 应用功能开关框架，就能帮助我们轻松实现这些功能。

## 一、认识 Togglz：功能开关框架的魅力 ##

Togglz 是一款专为 Java 应用打造的功能开关框架，它就像是应用功能的 “智能管家”，允许开发者在不重启应用的情况下，便捷地启用或禁用功能。以下是 Togglz 的几大关键特性，让它在众多框架中脱颖而出

- 功能开关：Togglz 通过定义功能开关，精准控制哪些功能对用户可见或可用，为功能管理提供了清晰的界限和规则。
- 动态配置：支持在运行时更改功能开关的状态，无需重新部署应用程序，大大提高了开发和运维的效率，让功能调整更加灵活及时。
- 多种存储方式：可以将功能开关的状态存储在不同的后端，如数据库、文件系统或内存中，满足不同场景下的数据存储和管理需求。
- 集成简单：与 Spring、CDI 等主流框架有良好的集成，易于在现有项目中引入，降低了技术升级和功能扩展的成本。
- 用户界面：提供了一个直观的管理界面，方便管理员查看和修改功能开关的状态，操作便捷，一目了然。

## 二、Togglz 的常用应用场景 ##

Togglz 的应用场景十分广泛，在软件开发的各个环节都能发挥重要作用：

- 逐步发布新功能：在大型项目中，新功能可能需要逐步发布给部分用户，以确保其稳定性和性能。Togglz 可以帮助你精准控制哪些用户可以看到新功能，实现平滑的功能上线。
- A/B 测试：通过功能开关，你可以轻松地为不同用户群体提供不同的功能版本，从而进行 A/B 测试，评估新功能的效果，为产品优化提供数据支持。
- 紧急回滚：如果新功能在生产环境中出现问题，可以快速关闭功能开关，而无需重新部署整个应用，从而减少停机时间，保障业务的连续性。
- 内部测试：在功能开发阶段，可以仅对内部测试人员开放新功能，确保功能在正式发布前经过充分测试，提高产品质量。
- 环境隔离：不同的环境（如开发、测试、生产）可以有不同的功能开关配置，确保每个环境中的功能状态符合需求，避免环境差异带来的问题。
- 按需启用高级功能：对于付费用户或特定客户，可以通过功能开关控制高级功能的访问权限，实现差异化服务，提升用户体验和商业价值。
- 性能优化：某些功能可能会影响应用性能，可以在生产环境中临时关闭这些功能，以监控和优化性能，保障应用的高效运行。

## 三、实战演示：Spring Boot 项目与 Togglz 的整合 ##

接下来，我们通过一个实际的示例，详细演示如何在 Spring Boot 项目中与 Togglz 整合，实现特性开关的功能。我们以模拟在正式环境能获取某种资源，其他环境获取不到为例，逐步展开操作

### 引入 Togglz 相关依赖 ###

在项目的 pom.xml 文件中引入 Togglz 的依赖：

```xml
      <dependency>
            <groupId>org.togglz</groupId>
            <artifactId>togglz-spring-boot-starter</artifactId>
            <version>${togglz.version}</version>
        </dependency>
```

### 定义功能开关 ###

创建一个枚举类来定义功能开关：

```java
public enum EnvFeature implements Feature {

    @Label("生产环境")
    PROD,

    @Label("预发布环境")
    UAT,

    @Label("测试环境")
    TEST,


    @EnabledByDefault
    @Label("开发环境")
    DEV;

    public boolean isActive() {
        return FeatureContext.getFeatureManager().isActive(this);
    }

    public static EnvFeature getEnvFeature(String env){
        EnvFeature[] envFeatures = EnvFeature.values();
        for (EnvFeature envFeature : envFeatures) {
            if(envFeature.name().equalsIgnoreCase(env)){
                return envFeature;
            }
        }
        throw new IllegalArgumentException("env参数不合法");
    }
}
```

`@Label` 注解用于为功能开关提供一个友好的显示名称，方便在管理界面中识别；`@EnabledByDefault` 注解用于标记某个功能开关在默认情况下是启用的

### 定义togglz功能管理配置 ###

实现TogglzConfig接口，自定义功能开关的管理方式：

```java
/**
 * @see <a href="https://www.togglz.org/documentation/configuration">...</a>
 */

@Slf4j
@RequiredArgsConstructor
public class EnvTogglzConfig implements TogglzConfig , InitializingBean {

    private final ObjectProvider<List<StateRepositoryFactory>> listObjectProvider;
    private final EnvTogglzProperties envTogglzProperties;

    private Map<String,StateRepositoryFactory> stateRepositoryMap;
    @Override
    public Class<? extends Feature> getFeatureClass() {
        // 返回定义功能开关的枚举类
        return EnvFeature.class;
    }

    /***
     * @see <a href="https://www.togglz.org/documentation/repositories"></a>
     * @return
     */
    @Override
    public StateRepository getStateRepository() {
        //配置功能开关状态的存储方式
        if(stateRepositoryMap == null || stateRepositoryMap.isEmpty()){
            log.warn("stateRepositoryFactories is empty,select inMemoryStateRepository");
            return new InMemoryStateRepository();
        }

        return stateRepositoryMap.get(envTogglzProperties.getStateRepositoryType()).create();

    }

    /**
     * @see <a href="https://www.togglz.org/documentation/authentication"></a>
     * @return
     */
    @Override
    public UserProvider getUserProvider() {
        // 提供功能开关的提供者,返回当前登录的用户对象
      return new SingleUserProvider("lybgeek", true);
    }

    @Override
    public void afterPropertiesSet() {

        List<StateRepositoryFactory> stateRepositoryFactories = listObjectProvider.getIfAvailable();
        if(CollectionUtils.isEmpty(stateRepositoryFactories)){
            return;
        }
        stateRepositoryMap = new HashMap<>(stateRepositoryFactories.size());
        stateRepositoryFactories.forEach(stateRepositoryFactory -> stateRepositoryMap.put(stateRepositoryFactory.supportType(),stateRepositoryFactory));


    }
}
```

在这个配置类中，我们主要完成了以下几个配置点：

- 功能开关类：指定定义了所有功能开关的枚举类。
- 用户解析：提供一个方法来解析当前用户，这对于基于用户的功能开关策略非常重要。
- 状态持久化：配置功能开关状态的存储方式，例如内存、数据库、文件等。
- 策略配置：配置功能开关的激活策略，例如基于用户角色、请求参数、时间等

### 创建功能管理器 ###

创建一个FeatureManager的 Bean：

```java
@Bean
    @ConditionalOnMissingBean
    public FeatureManager featureManager(EnvTogglzConfig envTogglzConfig){
        return new FeatureManagerBuilder()
                .featureEnum(envTogglzConfig.getFeatureClass())
                .stateRepository(envTogglzConfig.getStateRepository())
                .userProvider(envTogglzConfig.getUserProvider())
                .build();
    }
```

FeatureManager提供了一系列的方法来查询和修改功能开关的状态，以及执行与功能开关相关的操作，包括查询功能开关状态、修改功能开关状态、获取功能开关元数据、执行功能开关策略等。

### 使用功能开关 ###

这边炫技一下，我们使用 `bytebuddy` 来实现一个切面，以更灵活地使用功能开关。

#### 项目pom引入bytebuddy依赖 ####

```xml
 <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy</artifactId>
            <version>${bytebuddy.version}</version>
        </dependency>
```

#### 自定义激活功能开关注解 ####

```java
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Target(ElementType.METHOD)
public @interface EnvTogglz {

    String activeEnv() default "${lybgeek.togglz.env:dev}";
}
```

#### 创建代理 ####

实现InvocationHandler接口，创建一个代理类：

```java
@RequiredArgsConstructor
public class EnvTogglzInvocationHandler implements InvocationHandler {

    private final String activeEnv;
    private final Object target;
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if(StringUtils.isEmpty(activeEnv)){
            return method.invoke(target, args);
        }

        if(EnvFeature.getEnvFeature(activeEnv).isActive()){
            return method.invoke(target, args);
        }

        throw new EnvTogglzException("非法访问", HttpStatus.FORBIDDEN.value());
    }
}
```

核心代码通过判断功能开关是否激活，来决定是否执行目标方法。

#### 创建 bytebuddy 代理工厂 ####

创建一个代理工厂类，用于生成代理对象：

```java
@Slf4j
public final class EnvTogglzProxyFactory {
    private EnvTogglzProxyFactory(){}

    public static <T> T createProxy(T target,String activeEnv) {

        Class proxy = new ByteBuddy()
                .subclass(target.getClass())
                .method(any())
                .intercept(InvocationHandlerAdapter.of(new EnvTogglzInvocationHandler(activeEnv,target)))
                .attribute(MethodAttributeAppender.ForInstrumentedMethod.INCLUDING_RECEIVER)
                .annotateType(target.getClass().getAnnotations())
                .make()
                .load(EnvTogglzProxyFactory.class.getClassLoader(), ClassLoadingStrategy.Default.WRAPPER)
                .getLoaded();

        try {
            return (T)proxy.getDeclaredConstructor().newInstance();
        } catch (InstantiationException | InvocationTargetException | IllegalAccessException | NoSuchMethodException e) {
            log.error("create proxy error",e);
        }

        return null;

    }
```

#### 通过bytebuddy增强 ####

实现SmartInstantiationAwareBeanPostProcessor接口，对 Bean 进行增强处理：

```java
@Slf4j
public class EnvTogglzProxyBeanPostProcessor implements SmartInstantiationAwareBeanPostProcessor, ApplicationContextAware {

    private ApplicationContext applicationContext;

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        EnvTogglz envTogglz = getEnvTogglz(bean);
        if(envTogglz != null){
            String activeEnv = applicationContext.getEnvironment().resolvePlaceholders(envTogglz.activeEnv());
            return EnvTogglzProxyFactory.createProxy(bean,activeEnv);
        }

        return bean;

    }



    private EnvTogglz getEnvTogglz(Object bean) {
        boolean aopProxy = AopUtils.isAopProxy(bean);
        Class targetClz = bean.getClass();
        if(aopProxy){
           targetClz = AopUtils.getTargetClass(bean);
        }

        for (Method declaredMethod : targetClz.getDeclaredMethods()) {
            EnvTogglz envTogglz = AnnotationHelper.getAnnotation(declaredMethod, EnvTogglz.class);
            if(envTogglz != null){
                return envTogglz;
            }
        }

        return null;
    }


    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }


}
```

### 测试功能开关 ###

创建一个测试的 Controller：

```java
@RestController
@RequestMapping("test")
@RequiredArgsConstructor
public class TestController {

    @GetMapping("info")
    @EnvTogglz
    public ResponseEntity<String> info(){
        return ResponseEntity.ok("生产环境-资源");
    }
}
```

通过浏览器访问 `http://localhost:8080/test/info`

发现访问不到正式的资源，因为我们默认激活的环境开关是 `DEV`

要使用 Togglz 提供的控制面板，首先在项目的 pom.xml 文件中配置如下依赖：

```java
<!-- Togglz 控制台依赖，用于管理特性开关 -->
        <dependency>
            <groupId>org.togglz</groupId>
            <artifactId>togglz-console</artifactId>
            <version>${togglz.version}</version>
        </dependency>
```

然后在 `application.yml` 文件中激活控制台：

```yaml
togglz:
  console:
    enabled: true
    path: /togglz
    secured: true
```

`secured` 表示开启访问权限，权限取决于配置的 `UserProvider`。浏览器访问 `http://localhost:8080/togglz`

然后将生产环境改为激活状态

最后再次访问 `http://localhost:8080/test/info`，即可获取到资源。

## 四、总结 ##

通过上述详细的步骤，我们成功地在 Spring Boot 项目中与 Togglz 进行了整合，实现了特性开关的功能。Togglz 为我们提供了一种灵活、高效的功能管理方式，能够帮助我们更好地应对软件开发过程中的各种挑战。本文只是对 Togglz 的一个入门介绍，如果大家对 Togglz 的源码感兴趣，还可以深入研究，其中的一些实现思路和技巧可以为我们的日常开发带来很多启发。
