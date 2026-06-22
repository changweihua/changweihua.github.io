---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 ResourceLoader 统一管理你的本地资源
description: 使用 ResourceLoader 统一管理你的本地资源
date: 2026-04-01 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

在项目开发中，我们经常需要读取各种本地资源文件：配置文件、模板文件、静态资源、数据文件等。

Spring 框架提供了一个强大而优雅的解决方案——ResourceLoader 接口。本文将使用 Spring ResourceLoader 统一管理本地资源，让你的代码更加规范、灵活且易于维护。

## 一、ResourceLoader 的优势 ##

Spring 的 ResourceLoader 提供了一个统一的资源访问抽象：

```java
public interface ResourceLoader {
    Resource getResource(String location);
}
```

它的优势在于：

- 统一接口：无论资源来自文件系统、classpath 还是 URL，都用相同方式访问
- 位置透明：支持多种位置前缀，如 `classpath:`、`file:`、`http:` 等
- Spring 生态集成：与 Spring 容器完美集成，自动注入
- 灵活性：支持模式匹配、占位符解析等高级特性

## 二、核心概念与接口 ##

### Resource 接口 ###

Resource 是 Spring 对底层资源的抽象，它继承自 InputStreamSource 接口：

```java
public interface Resource extends InputStreamSource {
    boolean exists();
    boolean isReadable();
    boolean isOpen();
    boolean isFile();
    URL getURL() throws IOException;
    URI getURI() throws IOException;
    File getFile() throws IOException;
    long contentLength() throws IOException;
    long lastModified() throws IOException;
    Resource createRelative(String relativePath) throws IOException;
    String getFilename();
    String getDescription();
}
```

常见的 Resource 实现类：

|  实现类   |      用途   |
| :-----------: | :-----------: |
| FileSystemResource | 文件系统资源 |
| ClassPathResource | classpath 资源 |
| UrlResource | URL 资源（支持 http、ftp 等） |
| ServletContextResource | Web 应用上下文资源 |

`PathMatchingResourcePatternResolver` 是资源解析器，用于批量匹配资源路径，它实现了 ResourcePatternResolver 接口。

### ResourceLoader 接口 ###

ResourceLoader 是资源加载的核心接口：

```java
public interface ResourceLoader {
    Resource getResource(String location);
}
```

### ResourcePatternResolver 接口 ###

ResourcePatternResolver 是 ResourceLoader 的扩展，支持资源模式匹配：

```java
public interface ResourcePatternResolver extends ResourceLoader {
    String CLASSPATH_ALL_URL_PREFIX = "classpath*:";

    Resource[] getResources(String locationPattern) throws IOException;
}
```

关键特性是 `classpath*:` 前缀，它可以匹配 `classpath` 下所有同名资源：

```java
// 匹配所有 classpath 下的 *.xml 文件
Resource[] resources = resolver.getResources("classpath*:*.xml");
```

## 三、常用资源位置前缀 ##

Spring 支持多种资源位置前缀，每种前缀对应不同的资源来源：

### classpath: 前缀 ###

从 classpath 读取资源，这是最常用的方式：

```java
Resource resource = resourceLoader.getResource("classpath:config/app.properties");
// 或者简写，ResourceLoader 会自动识别
Resource resource = resourceLoader.getResource("config/app.properties");
```

### file: 前缀 ###

明确指定从文件系统读取：

```java
Resource resource = resourceLoader.getResource("file:/data/config/app.properties");
```

### http: / https: 前缀 ###

从网络读取资源：

```java
Resource resource = resourceLoader.getResource("https://example.com/config.json");
```

### 无前缀 ###

Spring 会根据资源路径的特征自动判断来源：

```java
// 以 / 开头，视为文件系统路径
Resource resource = resourceLoader.getResource("/etc/app/config.properties");

// 其他情况，优先从 classpath 查找
Resource resource = resourceLoader.getResource("config/app.properties");
```

## 四、最佳实践 ##

### 基础用法 ###

在 Spring Boot 应用中，我们可以直接注入 ResourceLoader：

```java
@Service
public class ConfigLoader {

    private final ResourceLoader resourceLoader;

    public ConfigLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public Properties loadProperties() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:application.properties");
        Properties props = new Properties();
        props.load(resource.getInputStream());
        return props;
    }
}
```

### 资源目录结构规划 ###

建议按照以下结构组织资源文件：

```txt
src/main/resources/
├── config/
│   ├── app.properties
│   └── database.properties
├── templates/
│   ├── email/
│   │   └── welcome.html
│   └── report/
│       └── monthly.xlsx
└── data/
    ├── initial-data.json
    └── lookup-tables.csv
```

### 批量读取资源文件 ###

使用 ResourcePatternResolver 可以批量读取匹配模式的资源：

```java
@Service
public class TemplateLoader {

    private final ResourcePatternResolver resourcePatternResolver;

    public TemplateLoader(ResourcePatternResolver resourcePatternResolver) {
        this.resourcePatternResolver = resourcePatternResolver;
    }

    public Map<String, String> loadAllTemplates() throws IOException {
        Map<String, String> templates = new HashMap<>();

        // 读取所有 HTML 模板
        Resource[] resources = resourcePatternResolver
            .getResources("classpath*:templates/**/*.html");

        for (Resource resource : resources) {
            String path = resource.getPath();
            String name = path.substring(path.lastIndexOf("templates/"));
            try (InputStream is = resource.getInputStream()) {
                templates.put(name, new String(is.readAllBytes(), StandardCharsets.UTF_8));
            }
        }
        return templates;
    }
}
```

### 统一路径管理 ###

推荐使用配置属性 + 常量类的方式：

#### 定义资源路径常量类 ####

```java
public final class ResourcePaths {

    private ResourcePaths() {}

    // 配置文件
    public static final String CONFIG_DIR = "classpath:config/";
    public static final String APP_PROPERTIES = CONFIG_DIR + "app.properties";
    public static final String DATABASE_PROPERTIES = CONFIG_DIR + "database.properties";

    // 模板文件
    public static final String TEMPLATES_DIR = "classpath:templates/";
    public static final String EMAIL_WELCOME = TEMPLATES_DIR + "email/welcome.html";

    // 数据文件
    public static final String DATA_DIR = "classpath:data/";
    public static final String INITIAL_DATA = DATA_DIR + "initial-data.json";
}
```

#### 使用配置属性（推荐） ####

在 application.yml 中集中管理：

```yaml
app:
  resource:
    config-dir: classpath:config/
    templates-dir: classpath:templates/
    data-dir: classpath:data/
```

对应的配置属性类：

```java
@ConfigurationProperties(prefix = "app.resource")
public record ResourceProperties(
    String configDir,
    String templatesDir,
    String dataDir
) {
    public String getConfigPath(String fileName) {
        return configDir + fileName;
    }
}
```

#### 统一资源服务 ####

封装资源访问逻辑，统一处理路径和异常

```java
@Service
public class ResourceService {

    private final ResourceLoader resourceLoader;
    private final ResourceProperties properties;

    public ResourceService(ResourceLoader resourceLoader, ResourceProperties properties) {
        this.resourceLoader = resourceLoader;
        this.properties = properties;
    }

    /**
     * 读取配置文件（Properties 格式）
     */
    public Properties loadProperties(String fileName) throws IOException {
        Resource resource = resourceLoader.getResource(properties.getConfigPath(fileName));
        Properties props = new Properties();
        try (InputStream is = resource.getInputStream()) {
            props.load(is);
        }
        return props;
    }

    /**
     * 读取模板文件内容
     */
    public String readTemplate(String relativePath) throws IOException {
        Resource resource = resourceLoader.getResource(properties.templatesDir() + relativePath);
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * 批量加载模板（支持 Ant 风格模式）
     */
    public Map<String, String> loadTemplates(String pattern) throws IOException {
        Map<String, String> templates = new HashMap<>();
        Resource[] resources = ((ResourcePatternResolver) resourceLoader)
            .getResources(properties.templatesDir() + pattern);

        for (Resource resource : resources) {
            String path = resource.getFilename();
            try (InputStream is = resource.getInputStream()) {
                templates.put(path, new String(is.readAllBytes(), StandardCharsets.UTF_8));
            }
        }
        return templates;
    }

    /**
     * 检查资源是否存在
     */
    public boolean exists(String path) {
        return resourceLoader.getResource(path).exists();
    }
}
```

使用示例：

```java
@Service
public class EmailService {

    private final ResourceService resourceService;

    public EmailService(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    public String getWelcomeTemplate() {
        try {
            return resourceService.readTemplate("email/welcome.html");
        } catch (IOException e) {
            throw new RuntimeException("Failed to load welcome template", e);
        }
    }
}
```

### 轻量级工具类 ###

也可以封装一个工具类

```java
public final class ResourceUtils {

    private static ResourcePatternResolver resolver;

    // Spring 注入
    public static void setResourcePatternResolver(ResourcePatternResolver resolver) {
        ResourceUtils.resolver = resolver;
    }

    /**
     * 读取资源为字符串
     */
    public static String readAsString(String path) throws IOException {
        Resource resource = resolver.getResource(path);
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * 批量获取匹配的资源路径
     */
    public static List<String> listResources(String pattern) throws IOException {
        Resource[] resources = resolver.getResources(pattern);
        return Arrays.stream(resources)
                .map(r -> {
                    try {
                        return r.getURL().getPath();
                    } catch (IOException e) {
                        return pattern;
                    }
                })
                .collect(Collectors.toList());
    }
}
```

在配置类中初始化：

```java
@Configuration
public class ResourceConfig {

    @Bean
    public ResourceUtils resourceUtils(ResourcePatternResolver resolver) {
        ResourceUtils.setResourcePatternResolver(resolver);
        return new ResourceUtils();
    }
}
```

使用示例：

```java
String template = ResourceUtils.readAsString(ResourcePaths.EMAIL_WELCOME);
List<String> configs = ResourceUtils.listResources("classpath:config/*.properties");
```

## 五、总结 ##

Spring ResourceLoader 提供了统一的资源访问接口，支持 classpath、file、http 等多种前缀，配合 ResourcePatternResolver 可实现批量资源加载，让本地资源管理更加简洁规范。
