---
lastUpdated: true
commentabled: true
recommended: true
title: BeanRegistrar - Spring Boot 4 最被低估的新特性
description: 彻底改变 Bean 注册方式
date: 2026-08-13 12:08:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

> 本文深入解析 Spring Framework 7.0 引入的 `BeanRegistrar` 编程式 Bean 注册 API，带你从接口定义、三种使用姿势，一路走到 `ConfigurationClassParser` 解析链路和 `BeanRegistryAdapter` 内部实现，最后用一个"多数据库方言动态注册"实战收尾。

## 🎯 一、痛点场景：`@Bean` 解决不了的注册问题 ##

先看三个真实场景，你会发现 `@Bean` 方法其实非常"笨"：

### 场景 1：根据配置注册不同的实现 ###

```java
@Configuration
public class DaoConfiguration {

    // 一个 @Bean 方法只能注册一个 Bean，名称在解析期就定死了
    @Bean
    public UserDao userDao() {
        return new MySqlUserDao();  // 怎么根据配置换成 PgUserDao？
    }
}
```

`@Bean` 方法有三个硬约束：*一个方法只能注册一个 Bean、名称解析期就固定、无法按条件选择注册/不注册*。你没法写一个 `@Bean` 方法在 if/else 里注册 A 或 B，更没法用 for 循环注册 100 个路由 Bean——那需要 100 个注解方法。

### 场景 2：注册数量在运行时才确定 ###

```java
// 路由表：配置里写了 50 个路由，就得注册 50 个 bean —— @Bean 做不到
@Bean
public RouteHandler routeHandler() {
    return new RouteHandler("route-1");  // 只能写死一个
}
```

### 场景 3：注册逻辑要复用、要"入库" ###

一个框架想要把"根据环境变量注册一组 Bean"的能力封装成可复用的组件，`@Bean` 只能靠复制粘贴配置类。

### 那 Spring 3.1 时代的 `ImportBeanDefinitionRegistrar` 呢？ ###

它确实能编程式注册，但 API 太底层、太啰嗦：

```java
public class OldWay implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                        BeanDefinitionRegistry registry,
                                        BeanNameGenerator importBeanNameGenerator) {
        // 手工 new GenericBeanDefinition、setBeanClass、setPropertyValues……
        GenericBeanDefinition definition = new GenericBeanDefinition();
        definition.setBeanClass(MySqlUserDao.class);
        definition.getPropertyValues().add("url", "jdbc:mysql://...");
        registry.registerBeanDefinition("userDao", definition);
        // 想要根据 Environment 做分支？还得自己注入 Environment，代码蹭蹭往上涨
    }
}
```

三个痛点一叠加——编程式注册 + 简洁 API + 能读取环境——就是 `BeanRegistrar` 诞生的理由。

> 💡 它由 Sebastien Deleuze 在 Spring Framework 7.0 引入（`@since 7.0`），Spring Boot 4.x 基于 Spring Framework 7.x，所以 Spring Boot 4 应用天然可用。这也是它"最被低估"的原因之一：很多人以为这是 Spring Boot 的私有特性，其实它是框架层的通用能力。

## 📚 二、BeanRegistrar 是什么：一个函数式接口 + 一个注册表 ##

### 接口定义（源码） ##

它位于 `spring-beans` 模块，`org.springframework.beans.factory` 包：

> 📌 定位说明：`BeanRegistrar` 是 Spring Framework 7.0 层面的通用能力（Spring Boot 4.x 基于 Spring Framework 7.x 因此天然可用）。Spring Boot 4.1 参考文档没有为它单独成章，官方文档入口是 Spring Framework 参考文档的 Programmatic Bean Registration 章节（见文末参考资源）。

```java
// BeanRegistrar.java (spring-beans 7.0)
@FunctionalInterface
public interface BeanRegistrar {

    /**
     * Register beans on the given {@link BeanRegistry} in a programmatic way.
     * @param registry the bean registry to operate on
     * @param env the environment that can be used to get the active profile or some properties
     */
    void register(BeanRegistry registry, Environment env);

}
```

注意三个关键字：

| 关键字 | 含义 |
| :--- | :--- |
| `@FunctionalInterface` | 可以写 lambda / 方法引用，不一定要建类 |
| `registry` | `BeanRegistry`，注册操作的入口 |
| `env` | Environment，直接传入——这就是"比 `@Conditional` 更灵活"的底气 |

### 最小示例 ###

```java
@Configuration
@Import(MyBeanRegistrar.class)   // 通过 @Import 引入注册器
class MyConfiguration {
}

class MyBeanRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        registry.registerBean("foo", Foo.class);                                  // 最简单：类注册
        registry.registerBean("bar", Bar.class, spec -> spec                      // 链式定制
                .prototype()                                                      // 原型作用域
                .lazyInit()                                                       // 懒初始化
                .description("Custom description")
                .supplier(context -> new Bar(context.bean(Foo.class))));         // 自定义实例逻辑 + 依赖注入
        if (env.matchesProfiles("baz")) {                                         // 条件注册：直接 if
            registry.registerBean(Baz.class, spec -> spec
                    .supplier(context -> new Baz("Hello World!")));
        }
    }
}
```

### BeanRegistry 注册 API 全景 ###

`BeanRegistry` 提供 8 种 `registerBean` 重载，矩阵如下：

| 类型维度\定制维度 | 无定制 | 带定制`Consumer<Spec<T>>` |
| :--- | :--- | :--- |
| `Class<T>`（无名） | `String registerBean(Class)` | `String registerBean(Class, Consumer)` |
| `Class<T>`（指定名） | `void registerBean(String, Class)` | `void registerBean(String, Class, Consumer)` |
| 泛型（无名） | `String registerBean(ParameterizedTypeReference)` | `String registerBean(ParameterizedTypeReference, Consumer)` |
| 泛型（指定名） | `void registerBean(String, ParameterizedTypeReference)` | `void registerBean(String, ParameterizedTypeReference, Consumer)` |

外加两个成员：

```java
void register(BeanRegistrar registrar);          // 注册器嵌套注册器
void registerAlias(String name, String alias);   // 给已有 bean 起别名
```

几个细节：

- 不指定名字的重载会返回生成的 bean 名称：`BeanDefinitionReaderUtils.uniqueBeanName` 生成 "类全名 + #序号" 的形式（`GENERATED_BEAN_NAME_SEPARATOR = "#"`，序号从 0 开始，如 `com.example.Foo#0`；`#0` 被占用则依次尝试 `#1`、`#2`……）——注意无论是否冲突都会带序号，这是与直觉容易出入的点；
- 泛型重载通过 `ParameterizedTypeReference` 保留 `List<String>` 这类擦除类型，注册后 `setTargetType(ResolvableType)`，注入时按泛型精确匹配：

```java
registry.registerBean(new ParameterizedTypeReference<List<String>>() { },
        spec -> spec.supplier(context -> List.of("a", "b")));
```

### Spec：11 个链式定制方法 ###

`BeanRegistry.Spec<T>` 是定制入口（大纲里常说的"BeanRegistrationSpec"，官方实际类名是 `BeanRegistry.Spec`）。每个方法返回 `this` 支持链式调用，底层直接映射到 BeanDefinition 的对应 setter：

| 方法 | 作用 | 映射的 BeanDefinition API |
| :--- | :--- | :--- |
| `.supplier(Function<SupplierContext, T>)` | 自定义实例化逻辑 | `setInstanceSupplier` |
| `.prototype()` | 原型作用域 | `setScope(SCOPE_PROTOTYPE)` |
| `.scope(String)` | 自定义作用域 (7.0.4 新增) | `setScope(String)` |
| `.lazyInit()` | 懒初始化 | `setLazyInit(true)` |
| `.primary()` | 主候选 (同类型多 bean 时优先注入) | `setPrimary(true)` |
| `.fallback()` | 兜底候选 (比 primary 弱一档) | `setFallback(true)` |
| `.infrastructure()` | 标记为基础设施角色 (对用户不可见) | `setRole(ROLE_INFRASTRUCTURE)` |
| `.notAutowirable()` | 不作为自动装配候选 | `setAutowireCandidate(false)` |
| `.order(int)` | 排序，等价于 @Order | `ORDER_ATTRIBUTE` |
| `.description(String)` | 人类可读描述 | `setDescription` |
| `.backgroundInit()` | 允许在后台线程初始化 (Spring 6.2+ 特性) | `setBackgroundInit(true)` |

> ⚠️ `fallback` 和 `primary` 是互补关系：primary 是"优先选我"，fallback 是"其他候选都不行才选我"。

### SupplierContext：supplier 里的依赖获取 ###

`Spec.supplier()` 接收的 `Function<SupplierContext, T>`，其入参 SupplierContext 提供了 5 个取依赖的方法——这就是编程式注册里的"依赖注入"：

```java
interface SupplierContext {
    <T> T bean(Class<T> beanClass);                        // 唯一匹配的类型
    <T> T bean(ParameterizedTypeReference<T> beanType);    // 泛型唯一匹配
    <T> T bean(String name, Class<T> beanClass);           // 按名取
    <T> ObjectProvider<T> beanProvider(Class<T> beanClass);        // 懒获取/多候选
    <T> ObjectProvider<T> beanProvider(ParameterizedTypeReference<T> beanType);
}
```

`beanProvider` 返回 ObjectProvider，支持 `getIfAvailable()`、`orderedStream()` 等懒加载玩法——依赖的解析被推迟到 bean 真正实例化时，天然规避循环依赖问题。

## 🏗️ 三、怎么用：三种注册姿势 ##

### 姿势一：`@Import` 引入（最常见） ###

```java
@Configuration
@Import(DaoRegistrar.class)
public class AppConfig {
}
```

### 姿势二：`GenericApplicationContext.register()` ###

直接对一个应用上下文调用 `GenericApplicationContext.register(BeanRegistrar...)`：

```java
// GenericApplicationContext.java (spring-context 7.0)
public void register(BeanRegistrar... registrars) {
    for (BeanRegistrar registrar : registrars) {
        new BeanRegistryAdapter(this.beanFactory, getEnvironment(), registrar.getClass()).register(registrar);
    }
}
```

Spring Boot 自己的回归测试就是这么用的（`core/spring-boot/.../SpringApplicationTests.java`，gh-50264）：

```java
@Test
void beanDefinitionOverridingIsAppliedToInitializer() { // gh-50264
    assertThatExceptionOfType(BeanDefinitionOverrideException.class).isThrownBy(() -> {
        BeanRegistrar registrar = (registry, env) -> {
            registry.registerBean("someBean", String.class);
            registry.registerBean("someBean", String.class);   // 同名注册第二次 → 抛异常
        };
        ApplicationContextInitializer<GenericApplicationContext> initializer =
                (context) -> context.register(registrar);
        // ...
    });
}
```

这个测试同时告诉我们一个行为：BeanRegistrar 注册的 BeanDefinition 与普通注册走同一套覆盖规则（Spring Boot 默认 `allow-bean-definition-overriding=false`，同名重复注册直接抛 `BeanDefinitionOverrideException）。`

### 姿势三（Kotlin）：BeanRegistrarDsl ###

Kotlin 用户不用实现接口，直接继承 DSL 类（官方推荐）：

```java
@Configuration
@Import(MyBeanRegistrar::class)
class MyConfiguration

class MyBeanRegistrar : BeanRegistrarDsl({
    registerBean<Foo>()
    registerBean(name = "bar", prototype = true, lazyInit = true,
                 description = "Custom description") {
        Bar(bean<Foo>())
    }
    profile("baz") {                 // profile 条件块，等价于 env.matchesProfiles
        registerBean { Baz("Hello World!") }
    }
})
```

### 条件注册三板斧：if / matchesProfiles / 泛型 ###

`register()` 方法体就是普通 Java 代码，条件注册完全"内联"：

```java
@Override
public void register(BeanRegistry registry, Environment env) {
    // 1. Profile 判断
    if (env.matchesProfiles("dev")) {
        registry.registerBean(DevDataSource.class, spec -> spec.primary());
    }
    else if (env.matchesProfiles("prod")) {
        registry.registerBean(ProdDataSource.class, spec -> spec.primary());
    }

    // 2. 属性值判断
    String cacheType = env.getProperty("app.cache.type", "local");
    switch (cacheType) {
        case "redis" -> registry.registerBean(RedisCacheManager.class, spec -> spec.primary());
        case "local" -> registry.registerBean(LocalCacheManager.class, spec -> spec.primary());
    }

    // 3. 循环批量注册（@Bean 完全做不到）
    List<String> routes = env.getProperty("app.routes", List.class, List.of());
    for (String route : routes) {
        registry.registerBean("route-" + route, RouteHandler.class,
                spec -> spec.supplier(context -> new RouteHandler(route)));
    }
}
```

## ⚙️ 四、源码剖析：一个 `@Import` 背后的完整链路 ##

这一节我们从 `@Import(MyBeanRegistrar.class)` 出发，跟着源码走完注册的全过程。

### 触发链路全景 ###

```
应用启动
 └─ SpringApplication.run() → refresh()
     └─ ConfigurationClassPostProcessor（BeanDefinitionRegistryPostProcessor）
         ├─ ① ConfigurationClassParser.parse()           【解析阶段】
         │    └─ processImports() → BeanRegistrar 分支
         │         └─ 实例化注册器 + configClass.addBeanRegistrar()
         │
         └─ ② ConfigurationClassBeanDefinitionReader.loadBeanDefinitions() 【读取阶段】
              └─ loadBeanDefinitionsFromBeanRegistrars()
                   └─ registrar.register(new BeanRegistryAdapter(...), env)
                        └─ registerBeanDefinition(name, BeanRegistrarBeanDefinition)
                             └─ 此后与普通 BeanDefinition 无差别：
                                 构造器解析 → 实例化 → BeanPostProcessor → AOP
```

关键点：注册发生在 `ConfigurationClassPostProcessor` 阶段——即容器 refresh 中最早的 invokeBeanFactoryPostProcessors 环节，远早于任何 bean 的实例化。所以注册器注册的 bean 与 `@Bean` 注册的 bean 地位完全平等：参与完整生命周期、可以被 AOP 代理、可以被 `@Autowired` 注入。

### 解析阶段：`ConfigurationClassParser.processImports` ###

`ConfigurationClassParser.processImports()` 里，被 `@Import` 的候选类按优先级分四类处理（贴 7.0.8 源码节选）：

```java
for (SourceClass candidate : importCandidates) {
    if (candidate.isAssignable(ImportSelector.class)) {
        // 分支 1：ImportSelector → 委托选择器决定 import 什么
        // ...（略）
    }
    else if (candidate.isAssignable(BeanRegistrar.class)) {          // ★ 我们的目标
        Class<?> candidateClass = candidate.loadClass();
        BeanRegistrar registrar = (BeanRegistrar) BeanUtils.instantiateClass(candidateClass);
        AnnotationMetadata metadata = currentSourceClass.getMetadata();
        if (registrar instanceof ImportAware importAware) {          // 可选：获取 import 元数据
            importAware.setImportMetadata(metadata);
        }
        configClass.addBeanRegistrar(metadata.getClassName(), registrar);
    }
    else if (candidate.isAssignable(ImportBeanDefinitionRegistrar.class)) {
        // 分支 3：老式 ImportBeanDefinitionRegistrar，与上面是"邻居"分支
        // ...（略）
    }
    else {
        // 分支 4：普通 @Configuration 类，递归解析
        // ...（略）
    }
}
```

三个值得注意的设计细节：

- `BeanRegistrar` 分支排在 `ImportBeanDefinitionRegistrar` 之前——解析链路上二者是相邻的"邻居"分支，优先级上框架先识别 `BeanRegistrar`；

- 注册器实例化用的是 `BeanUtils.instantiateClass(candidateClass)`，不会注入 Environment/ResourceLoader（对比 ImportSelector 分支的 `ParserStrategyUtils.instantiateClass`）——注册器本身保持"纯函数"风格，环境通过 register() 参数传入；
- 此时并没有真正注册任何 bean——只是把注册器实例挂到 ConfigurationClass 上（addBeanRegistrar），真正的注册动作推迟到读取阶段。这就是"解析与注册分离"的经典设计。

### 读取阶段：ConfigurationClassBeanDefinitionReader ###

配置类解析完成后，`loadBeanDefinitionsForConfigurationClass()` 按固定顺序落库：

```java
private void loadBeanDefinitionsForConfigurationClass(
        ConfigurationClass configClass, TrackedConditionEvaluator trackedConditionEvaluator) {

    if (trackedConditionEvaluator.shouldSkip(configClass)) {   // 条件注解在读取阶段再次评估
        // ...跳过
    }
    if (configClass.isImported()) {
        registerBeanDefinitionForImportedConfigurationClass(configClass);
    }
    for (BeanMethod beanMethod : configClass.getBeanMethods()) {
        loadBeanDefinitionsForBeanMethod(beanMethod);          // ① @Bean 方法
    }
    loadBeanDefinitionsFromImportedResources(configClass.getImportedResources());            // ② @ImportResource
    loadBeanDefinitionsFromImportBeanDefinitionRegistrars(configClass.getImportBeanDefinitionRegistrars()); // ③ 老式注册器
    loadBeanDefinitionsFromBeanRegistrars(configClass.getBeanRegistrars());                   // ④ 新式 BeanRegistrar
}
```

`loadBeanDefinitionsFromBeanRegistrars()` 的完整实现只有 10 行：

```java
private void loadBeanDefinitionsFromBeanRegistrars(MultiValueMap<String, BeanRegistrar> registrars) {
    if (!(this.registry instanceof ListableBeanFactory beanFactory)) {
        throw new IllegalStateException("Cannot support bean registrars since " +
                this.registry.getClass().getName() + " does not implement ListableBeanFactory");
    }
    registrars.values().forEach(registrarList -> registrarList.forEach(registrar ->
            registrar.register(new BeanRegistryAdapter(
                    this.registry, beanFactory, this.environment, registrar.getClass()), this.environment)));
}
```

注意硬性前提：注册环境必须是 ListableBeanFactory（SupplierContext 要按类型查 bean）。标准 Spring Boot 容器（AnnotationConfigServletWebServerApplicationContext 等）都满足。

### 注册实现：BeanRegistryAdapter 与 BeanRegistrarBeanDefinition ###

BeanRegistryAdapter（`org.springframework.beans.factory.support`）是 BeanRegistry 的唯一官方实现，它只是"薄薄一层适配"——把高层 API 翻译成底层的 `BeanDefinitionRegistry` 操作。

以最常用的 `registerBean(String, Class, Consumer)` 为例：

```java
@Override
public <T> void registerBean(String name, Class<T> beanClass, Consumer<Spec<T>> customizer) {
    BeanRegistrarBeanDefinition beanDefinition = new BeanRegistrarBeanDefinition(beanClass, this.beanRegistrarClass);
    customizer.accept(new BeanSpecAdapter<>(beanDefinition, this.beanFactory));   // 定制链 → BeanDefinition
    // ...（可选的 registry 级 BeanDefinitionCustomizer 应用）
    this.beanRegistry.registerBeanDefinition(name, beanDefinition);               // 标准注册
}
```

核心在 BeanRegistrarBeanDefinition——一个定制的 RootBeanDefinition：

```java
private static class BeanRegistrarBeanDefinition extends RootBeanDefinition {

    public BeanRegistrarBeanDefinition(Class<?> beanClass, Class<? extends BeanRegistrar> beanRegistrarClass) {
        super(beanClass);
        this.setSource(beanRegistrarClass);                        // 溯源：标记是谁注册的
        this.setAttribute("aotProcessingIgnoreRegistration", true); // ★ AOT 交互，见 4.7
    }

    @Override
    public Constructor<?> @Nullable [] getPreferredConstructors() {
        if (this.getInstanceSupplier() != null) {
            return null;   // 有 supplier 就不用解析构造器
        }
        try {
            return new Constructor<?>[] { BeanUtils.getResolvableConstructor(getBeanClass()) };
        }
        catch (IllegalStateException ex) {
            return null;
        }
    }
    // cloneBeanDefinition() 也必须保留这两点（覆盖）
}
```

两个要点：

- `getPreferredConstructors()` 决定了实例化方式：没有 supplier 时，返回 BeanUtils.getResolvableConstructor() 解析出的构造器——解析优先级为 主构造器（Kotlin/record）→ 唯一 public 构造器 → 唯一非 public 构造器 → 默认构造器。注意这里 catch (IllegalStateException) 后返回 null：构造器解析失败不会在注册阶段报错，而是被推迟到实例化阶段。所以不写 supplier 时，自动构造器注入是生效的——class Foo(Bar bar) 注册成 `registry.registerBean("foo", Foo.class)`，Bar 会被自动注入；
- `setSource(beanRegistrarClass)` 让 BeanDefinition 带有"出生证明"，排错时能定位到具体注册器。

### Spec → BeanDefinition：BeanSpecAdapter 映射表 ###

链式 API 的秘密在 BeanSpecAdapter，每个 Spec 方法就是对 BeanDefinition setter 的调用（节选）：

```java
@Override public Spec<T> prototype()      { this.beanDefinition.setScope(BeanDefinition.SCOPE_PROTOTYPE); return this; }
@Override public Spec<T> lazyInit()       { this.beanDefinition.setLazyInit(true); return this; }
@Override public Spec<T> primary()        { this.beanDefinition.setPrimary(true); return this; }
@Override public Spec<T> fallback()       { this.beanDefinition.setFallback(true); return this; }
@Override public Spec<T> infrastructure() { this.beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE); return this; }
@Override public Spec<T> notAutowirable() { this.beanDefinition.setAutowireCandidate(false); return this; }
@Override public Spec<T> order(int order) { this.beanDefinition.setAttribute(AbstractBeanDefinition.ORDER_ATTRIBUTE, order); return this; }
@Override public Spec<T> scope(String scope) { this.beanDefinition.setScope(scope); return this; }   // 7.0.4+
@Override public Spec<T> supplier(Function<SupplierContext, T> supplier) {
    this.beanDefinition.setInstanceSupplier(() ->
            supplier.apply(new SupplierContextAdapter(this.beanFactory)));  // 依赖获取 → BeanFactory
    return this;
}
```

而 SupplierContextAdapter 的所有方法，本质都是 `BeanFactory.getBean` 的转发：

```java
private static class SupplierContextAdapter implements SupplierContext {
    private final BeanFactory beanFactory;
    @Override public <T> T bean(Class<T> beanClass) throws BeansException { return this.beanFactory.getBean(beanClass); }
    @Override public <T> ObjectProvider<T> beanProvider(Class<T> beanClass) { return this.beanFactory.getBeanProvider(beanClass); }
    // ...
}
```

设计精髓：instanceSupplier 是 Spring 5.0 引入（@since 5.0）的懒实例化机制——supplier 在 bean 首次创建时才执行，因此 `context.bean(...)` 的依赖解析也被推迟到那时，编程式注册同样享受"延迟注入"的红利。

### 时序小结：解析 vs 注册 ###


```txt
parse 阶段（ConfigurationClassParser）            load 阶段（ConfigurationClassBeanDefinitionReader）
─────────────────────────────                  ─────────────────────────────────────────
@Import(MyBeanRegistrar.class)                 registrar.register(new BeanRegistryAdapter(...), env)
        │                                              │
        ▼                                              ▼
instanceof BeanRegistrar? ── yes ──► 实例化注册器   registerBean("foo", Foo.class)
        │                                     │             │
        ▼                                     ▼             ▼
configClass.addBeanRegistrar(...)       BeanRegistryAdapter      BeanRegistrarBeanDefinition
（此时容器里还没有任何新 bean）                │                     │
                                          registerBeanDefinition(name, def)
                                                        │
                                                        ▼
                                     DefaultListableBeanFactory —— 与 @Bean 产物同池同待遇
```

### 与 AOT / GraalVM 的交互 ###

BeanRegistrarBeanDefinition 设置了 `aotProcessingIgnoreRegistration = true` 属性——这正是 `BeanRegistrationAotProcessor.IGNORE_REGISTRATION_ATTRIBUTE`（since 6.2）约定的常量：

```java
// BeanRegistrationAotProcessor.java (spring-beans)
/**
 * 设置在 BeanDefinition 上、表示"此注册不应被 AOT 处理"的属性名。
 * @since 6.2
 */
String IGNORE_REGISTRATION_ATTRIBUTE = "aotProcessingIgnoreRegistration";
```

这个标记在 AOT 代码生成时被 `BeanDefinitionMethodGeneratorFactory.isImplicitlyExcluded()` 读取：

```java
// BeanDefinitionMethodGeneratorFactory.java (spring-beans)
private boolean isImplicitlyExcluded(RegisteredBean registeredBean) {
    if (Boolean.TRUE.equals(registeredBean.getMergedBeanDefinition()
            .getAttribute(BeanRegistrationAotProcessor.IGNORE_REGISTRATION_ATTRIBUTE))) {
        return true;   // ★ 命中：该 bean 被排除出 AOT 处理
    }
    // ...
}
```

排除的后果：`getBeanDefinitionMethodGenerator()` 对该 bean 返回 null——不会为它生成 BeanRegistrationAotContribution（构建期静态实例化代码）。而生成注册代码的入口 `BeanRegistrationsAotProcessor.processAheadOfTime()` 在构建期遍历容器全部 bean definition 时，拿到 null 的 bean（即被 ignore 标记的 BeanRegistrar 产物）会被跳过，不会写进生成的 ApplicationContextInitializer 的 registerBeanDefinitions 部分：

```java
// BeanRegistrationsAotProcessor.java (spring-beans)
for (String beanName : beanFactory.getBeanDefinitionNames()) {
    RegisteredBean registeredBean = RegisteredBean.of(beanFactory, beanName);
    BeanDefinitionMethodGenerator beanDefinitionMethodGenerator =
            beanDefinitionMethodGeneratorFactory.getBeanDefinitionMethodGenerator(registeredBean);
    if (beanDefinitionMethodGenerator != null) {        // null → 跳过，不生成注册代码
        registrations.add(new Registration(registeredBean, beanDefinitionMethodGenerator, ...));
    }
}
```

那这些 bean 在 AOT 运行时由谁注册？答案是：生成的代码会把注册器本身"固化成代码"再执行一次。 ConfigurationClassPostProcessor 自身就是一个 BeanFactoryInitializationAotProcessor（processAheadOfTime(ConfigurableListableBeanFactory)），当解析到 BeanRegistrar 时会产出 BeanRegistrarAotContribution，往生成的 `initializer` 里追加一个 `applyBeanRegistrars` 方法：

```java
// 生成的 initializer 中 applyBeanRegistrars 方法的形态（由源码生成逻辑还原）
MyBeanRegistrar myBeanRegistrar = new MyBeanRegistrar();
myBeanRegistrar.register(new BeanRegistryAdapter((BeanDefinitionRegistry) beanFactory,
        beanFactory, environment, myBeanRegistrar.getClass(), customizers), environment);
```

所以对 BeanRegistrar 的 AOT 语义，准确的理解是：

- ✅ `register()` 始终在运行时执行——普通模式下由配置解析阶段调用；AOT 模式下（`spring.aot.enabled=true` 或原生镜像），`SpringApplication.prepareContext` 会跳过 `load()`（`@Configuration` 源类不再注册、配置解析不运行），改由生成的 initializer 在 refresh 前调用 applyBeanRegistrars 重新执行注册器；
- ✅ 被注册的 bean 没有静态注册代码与构造代码——它们被排除出 registerBeanDefinitions（ignore 标记）与 BeanRegistrationAotContribution（无生成的 `new Foo(...)` 代码），实例化走标准反射路径；AOT 生成器同时为其自动注册反射提示（首选构造器 registerConstructor、init/destroy 方法）；
- ✅ 官方文档原文明确："Bean registrars are supported with Ahead of Time Optimizations, either on the JVM or with GraalVM native images, including when instance suppliers are used"（AOT/JVM 与 GraalVM 原生镜像下均受支持，包括使用 instance supplier 的场景）；
- ⚠️ AOT 下的已知限制：`checkUnsupportedFeatures()` 会在构建期对带 factoryBeanName（FactoryBean 名）、constructorArgumentValues（构造器参数值）、qualifiers（限定符）的注册 bean 抛 UnsupportedOperationException（"not supported yet with BeanRegistrar"）；
- ℹ️ 补充：在 Spring Framework 7.0.8 / Spring Boot 4.1.0 中，ignore 标记目前只由 BeanRegistryAdapter 打上——普通 ImportBeanDefinitionRegistrar 注册的 bean 默认并不携带，二者在 AOT 下的处理路径并不相同。

## 🔄 五、对比：ImportBeanDefinitionRegistrar → BeanRegistrar ##

| 维度 | ImportBeanDefinitionRegistrar (3.1起) | BeanRegistrar (7.0起) |
| :--- | :--- | :--- |
| 所在模块 | spring-context | spring-beans（更底层，Boot/Cloud都能直接用） |
| 接口方法 | `registerBeanDefinitions(AnnotationMetadata, BeanDefinitionRegistry, BeanNameGenerator)` | `register(BeanRegistry, Environment)` |
| 操作对象 | 裸 BeanDefinitionRegistry（手工 new BeanDefinition） | 高层，`BeanRegistry` + 链式 Spec |
| 环境访问 | 需自己实现 `EnvironmentAware` 注入 | 参数自给（Environment 直接传入） |
| BeanDefinition构造 | 手写 `GenericBeanDefinition` + `PropertyValues` | 8个 `registerBean` 重载，类/泛型/命名全覆盖 |
| 依赖获取 | 需自行实现 Aware 注入 BeanFactory / 从 registry 手工查找 | `SupplierContext` 提供 `bean()` / `beanProvider()` |
| 支持 lambda | ✖️ 非函数式接口，须另具名实现类 | ✅ `@FunctionalInterface` 开箱即用 |
| ImportAware | 手动处理 | 注册器实现 `ImportAware` 即自动回调 |
| 条件注册 | 代码里写死 + 自行注入环境 | `env.matchesProfiles()` / 属性判断天然可用 |

最直观的代码对比——同样的"根据 profile 注册数据源"，老写法 vs 新写法：

```java
// 老写法：ImportBeanDefinitionRegistrar
public class OldDataSourceRegistrar implements ImportBeanDefinitionRegistrar, EnvironmentAware {
    private Environment environment;
    @Override public void setEnvironment(Environment env) { this.environment = env; }
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                        BeanDefinitionRegistry registry,
                                        BeanNameGenerator importBeanNameGenerator) {
        GenericBeanDefinition def = new GenericBeanDefinition();
        def.setBeanClass(MySqlDataSource.class);
        def.setScope(BeanDefinition.SCOPE_SINGLETON);
        registry.registerBeanDefinition("dataSource", def);
    }
}

// 新写法：BeanRegistrar —— 少一个 Aware、少一个裸 BeanDefinition
public class NewDataSourceRegistrar implements BeanRegistrar {
    @Override
    public void register(BeanRegistry registry, Environment env) {
        if (env.matchesProfiles("mysql")) {
            registry.registerBean("dataSource", MySqlDataSource.class, spec -> spec);
        }
    }
}
```

> 📌 注意：ImportBeanDefinitionRegistrar 并没有被废弃（源码无 `@Deprecated`），两个分支在 ConfigurationClassParser 里是邻居、长期共存。但新代码完全没必要再用老 API。

## 🎨 六、实战：动态注册数据库方言适配 Bean ##

### 场景描述 ###

一个 SaaS 服务要同时支持 MySQL / PostgreSQL 两种部署，方言相关逻辑（分页 SQL、函数差异）封装成接口族。要求：

- 根据配置 `app.db-dialect=mysql|pg` 注册对应方言 Bean；
- 不写死 `@Bean` 方法，未来加一种方言不用改配置类；
- 方言之间互斥，通过 `primary` 保证注入唯一性。

### 方言接口族 ###

```java
public interface SqlDialect {
    String getName();
    String paginate(String sql, long offset, long limit);
}

public class MySqlDialect implements SqlDialect {
    @Override public String getName() { return "mysql"; }
    @Override public String paginate(String sql, long offset, long limit) {
        return sql + " LIMIT " + limit + " OFFSET " + offset;
    }
}

public class PgDialect implements SqlDialect {
    @Override public String getName() { return "postgresql"; }
    @Override public String paginate(String sql, long offset, long limit) {
        return sql + " LIMIT " + limit + " OFFSET " + offset;   // PG 语法上同样支持
    }
}
```

### 注册器：一行 if 解决问题 ###

```java
public class SqlDialectRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        String dialect = env.getProperty("app.db-dialect", "mysql");
        switch (dialect) {
            case "mysql" -> registry.registerBean("sqlDialect", MySqlDialect.class,
                    spec -> spec.primary().description("MySQL dialect"));
            case "pg", "postgresql" -> registry.registerBean("sqlDialect", PgDialect.class,
                    spec -> spec.primary().description("PostgreSQL dialect"));
            default -> throw new IllegalStateException("Unsupported dialect: " + dialect);
        }
    }
}
```

### 装配使用 ###

```java
@Configuration
@Import(SqlDialectRegistrar.class)
public class DbConfiguration {
    // 配置类里照常声明其他依赖方言的 bean
    @Bean
    public UserDao userDao(SqlDialect dialect) {
        return new UserDao(dialect);
    }
}

// 使用方：与普通注入完全一致
@Service
public class UserService {
    private final UserDao userDao;
    public UserService(UserDao userDao) { this.userDao = userDao; }
    // ...
}
```

### 验证 ###

```yaml
# application.yml
app:
  db-dialect: pg
```

```java
// 测试断言（需先加载 application.yml 等属性源，或直接向容器注册属性）
ApplicationContext ctx = new AnnotationConfigApplicationContext(DbConfiguration.class);
SqlDialect dialect = ctx.getBean(SqlDialect.class);
assertThat(dialect).isInstanceOf(PgDialect.class);           // 按配置注册
assertThat(ctx.getBeanNamesForType(SqlDialect.class)).containsExactly("sqlDialect");
```

再加一种方言？写一个 `OracleDialect` + `case "oracle"` 即可——注册逻辑与方言实现完全解耦，这正是编程式注册的核心收益。

## 💡 七、注意事项与避坑指南 ##

### ⚠️ 坑 1：不能用 `@Bean` 方法"暴露" BeanRegistrar ###

```java
// ❌ 错误：@Bean 注册的只是"注册器"实例，它的 `register()` 永远不会被调用
@Configuration
public class WrongConfig {
    @Bean
    public SqlDialectRegistrar sqlDialectRegistrar() {
        return new SqlDialectRegistrar();
    }
}

// ✅ 正确：必须通过 @Import 让 ConfigurationClassParser 在解析期发现它
@Configuration
@Import(SqlDialectRegistrar.class)
public class RightConfig {
}
```

原因在 4.2 节：注册器只被 `processImports()` 的 `BeanRegistrar` 分支识别，`@Bean` 方法注册的注册器只是一个普通单例 bean，不具备"回调注册"语义。

### ⚠️ 坑 2：同名重复注册会抛异常 ###

BeanRegistrar 的注册走标准 registerBeanDefinition，遵守容器的覆盖策略。Spring Boot 默认 `spring.main.allow-bean-definition-overriding=false`，重复注册同名 bean 抛 BeanDefinitionOverrideException（Spring Boot 自己的 gh-50264 测试就是验证这一点）。

```java
// 会抛 BeanDefinitionOverrideException
registry.registerBean("foo", Foo.class);
registry.registerBean("foo", Bar.class);
```

⚠️ 因此一个注册器内多次注册时，注意名字要么显式不同，要么用无名重载（自动生成唯一名）。

### ⚠️ 坑 3：`@Conditional` 加在"引入方"配置类上 ###

BeanRegistrar 分支本身不评估注册器类上的条件注解——ConfigurationClassParser 里唯一的 shouldSkip 检查只针对配置类本身（读取阶段 TrackedConditionEvaluator 会对配置类条件二次评估，同样不涉及注册器类）。所以条件注册有两种正确姿势：

```java
// 姿势 A：条件注解放在引入它的 @Configuration 上（解析期+读取期均生效）
@Configuration
@ConditionalOnProperty(name = "app.db-dialect", havingValue = "mysql")
@Import(SqlDialectRegistrar.class)
public class MySqlConfig { }

// 姿势 B：条件逻辑写在 register() 方法体内（推荐，更灵活）
// 见 6.3 的 SqlDialectRegistrar
```

### ⚠️ 坑 4：`scope()` 定制 7.0.4 才有 ###

`Spec.scope(String)` 是 7.0.4 才补上的方法。7.0.0–7.0.3 只有 `prototype()`；需要自定义 scope（如 request/session/自定义 scope）时，请确认 Spring Framework 版本 ≥ 7.0.4（Spring Boot 4.1.x 默认满足）。

### ⚠️ 坑 5：注册环境必须支持按类型查询 ###

loadBeanDefinitionsFromBeanRegistrars 要求注册环境是 ListableBeanFactory（因为 SupplierContext.bean() 要按类型查找）。这本质是一个防御性检查：标准容器（AnnotationConfigApplicationContext、各种 Web 上下文、XML 上下文）底层都是 DefaultListableBeanFactory——它天然实现 ListableBeanFactory，永远不会触发。只有极少数自定义的、未实现 ListableBeanFactory 的 BeanDefinitionRegistry 才会抛 IllegalStateException，实践中基本遇不到。

### ✅ 与 `@Bean` 的共存规则 ###

- 同一个配置类里混用完全没问题：`@Bean` 方法先注册（4.3 节顺序①），BeanRegistrar 后注册（顺序④）；

- 需要被其他 `@Bean` 方法引用时，按正常注入规则即可（见 6.4 `userDao(SqlDialect dialect)`）；

- IDE 导航与可读性是 `@Bean` 的保留优势——BeanRegistrar 适合"动态/批量/条件"注册，静态的、一眼能数的注册留给 @Bean。

## 📊 八、选型建议：什么时候用 BeanRegistrar ##

```txt
                    ┌──────────────────────────────┐
                    │ 要注册的 Bean 数量确定吗？   │
                    └──────────────┬───────────────┘
                    ┌──────────────▼───────────────┐
                    │ 是（1~3 个，静态）           │
                    └──────────────┬───────────────┘
                    ┌──────────────▼───────────────┐
                    │ 注册逻辑有 if/for 分支？      │
                    └──────────────┬───────────────┘
                ┌───────────────┐  │  ┌────────────────┐
                │ 否            │  │  │ 是             │
                ▼               ▼  │  ▼                ▼
        ┌──────────────┐ ┌─────────┐ │ ┌───────────┐ ┌───────────────┐
        │ 用 @Bean     │ │ 要跨项目 │ │ │ BeanRegistrar│ │ 注册数量由配置/ │
        │ 简单清晰     │ │ 复用?   │ │ │ (推荐)     │ │ 循环决定?      │
        └──────────────┘ └────┬────┘ │ └───────────┘ └───────┬───────┘
                              │     │                        │ 是
                              │ 否  │                        ▼
                              ▼     │              ┌─────────────────┐
                        ┌──────────┐│              │ BeanRegistrar   │
                        │ 用 @Bean ││              │ (唯一可行方案)  │
                        └──────────┘│              └─────────────────┘
                                     │ 是
                                     ▼
                          ┌──────────────────────┐
                          │ BeanRegistrar 封装成  │
                          │ 独立注册器, @Import   │
                          │ 一行引入              │
                          └──────────────────────┘
```

一句话选型：

| 场景 | 推荐 |
| :--- | :--- |
| 静态的、可数的、互相引用的 bean | @Bean |
| 框架/库要"按配置注入一组能力" | BeanRegistrar + @Import |
| 数量运行时才知道（路由表、策略集） | BeanRegistrar （唯一解） |
| 需要读 Profile / 属性做分支 | BeanRegistrar （env 直接入参） |
| Kotlin 项目 | BeanRegistrarDsl |

## 📝 九、总结与行动清单 ##

### 核心优势回顾 ###

| 能力 | 说明 |
| :--- | :--- |
| **编程式** | `if/for/switch` 随便写，注册逻辑是普通代码 |
| **链式 API** | Spec 11 个方法，一行搞定 scope/lazy/primary |
| **环境直通** | Environment 直接入参，条件注册零样板 |
| **类型安全** | 泛型重载保留 `List<String>` 等擦除类型 |
| **地位平等** | 产物是标准 BeanDefinition，生命周期/注入/AOP 与 @Bean 一致 |
| **AOT 兼容** | 官方声明 AOT/原生镜像受支持；生成代码重新执行注册器（applyBeanRegistrars），被注册 bean 跳过静态注册/构造代码并自动获得反射提示 |

### 使用清单 ###

- Step 1: 新建类实现 BeanRegistrar（或 Kotlin 继承 BeanRegistrarDsl）
- Step 2: register() 里用 `registry.registerBean(...)` 编程式注册
- Step 3: 需要定制 → Spec 链式调用（supplier/prototype/lazyInit/primary...）
- Step 4: 依赖其它 bean → `SupplierContext.bean()`/`beanProvider()`
- Step 5: 条件注册 → `env.matchesProfiles()` / `getProperty()`
- Step 6: 配置类 `@Import(MyRegistrar.class)` 一行引入
- Step 7: （可选）实现 ImportAware 读取 import 元数据

### 一句话总结 ###

> `BeanRegistrar` 把"注册 Bean"从"声明式注解"变成了"一段可读、可复用、可分支的代码"——它是 Spring 7.0 在容器编程模型上最被低估的进化，也是 Spring Boot 4 里每一个框架级功能（如后续要讲的 gRPC 自动配置）背后反复使用的注册手段。 🚀
