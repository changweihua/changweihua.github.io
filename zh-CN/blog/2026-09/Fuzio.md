---
lastUpdated: true
commentabled: true
recommended: true
title: 用 Spring Boot + Vue + Fuzio 构建现代 Java 桌面应用
description: 用 Spring Boot + Vue + Fuzio 构建现代 Java 桌面应用
date: 2026-09-01 08:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---


很多人以为 Spring 只属于服务器。但当桌面项目复杂到需要清晰的分层、依赖注入、配置管理和数据访问时，把 Spring 引入客户端已经是一种成熟做法——尤其在企业级桌面软件中很常见。更进一步，Spring Boot 自带的内嵌 Web 服务器，让桌面客户端可以内置一个完整的本地后端，从而用 Web 技术来构建界面。

本文就把这套思路落地：用 Spring Boot 承载业务、数据并内置本地 HTTP 服务，用 Vue 构建界面，再用 Fuzio 把 Web 界面嵌进桌面窗口、并把它和 Spring 后端连起来。我们会一步一步从零把它搭起来。

## 为什么在桌面应用里引入 Spring ##

在桌面端引入 Spring 的真正动因，是*项目一旦复杂起来，原生工具包在应用结构管理上的短板就会暴露*。Swing 和 JavaFX 擅长界面呈现，却缺乏对依赖、配置和对象生命周期的统一管理：你得手动 new 服务、自己维护单例、把配置逻辑散落在各个控制器里。规模较小时尚可应付，应用一旦增长，代码很快变得纠缠难维护。这也是为什么在稍具规模的项目、尤其是企业级桌面软件中，*用 Spring 来组织桌面应用已经是一种成熟模式*。

把 Spring 引入桌面，你能直接复用整套后端能力：

- 依赖注入与 Bean 生命周期
- 配置与 Profile
- 数据访问
- 生态组件
- 内嵌 Web 服务器

一旦客户端内置了 HTTP 服务器，界面层就有了新的选择：*不必再用原生控件，而可以用 Web 技术来构建*。这恰好补齐了 Swing/JavaFX 在现代视觉和跨平台一致性上的短板。

这就引出了本文要搭建的架构：*用 Spring Boot 做内嵌后端，用 Web 技术做界面，再用 Fuzio 把两者缝合进一个 Java 桌面窗口*。 下面我们一步一步把它实现出来。

## 我们要构建什么 ##

一个单一可执行的 Java 桌面应用，内部由三部分组成：

- Spring Boot：随桌面应用一起启动，负责业务逻辑、配置管理与数据访问。
- Vue 前端：标准的 Vue 3 + Vite 工程，负责界面布局、交互和图表展示。
- Fuzio：在 Java 桌面窗口中嵌入 Chromium，把 Vue 界面渲染成原生桌面应用的一部分。

最终效果是一个深色风格的后台管理界面，运行在原生桌面窗口中：

项目结构如下：

```text
spring-fuzio-desktop-demo/
├── pom.xml                          # Maven 构建配置
├── src/main/
│   ├── java/tech/fuzio/demo/
│   │   ├── DesktopApplication.java  # 入口：启动 Spring Boot + Swing 窗口 + Fuzio
│   │   ├── dashboard/               # 方案 A：REST 接口（Controller + Service）
│   │   └── user/                    # 方案 B：用户业务
│   └── resources/
│       ├── application.yml          # 内嵌服务器配置（端口 / 监听地址）
│       └── static/                  # 前端构建产物（由 Spring Boot 托管）
└── web-app/                         # Vue 前端
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── pages/                   # Dashboard / 用户管理页
        ├── components/              # 图表等复用组件
        └── api/                     # 两套通信封装：HTTP 与 JS 桥
```

对于 Vue 页面如何获取 Java 后端的数据，这里有两种选择：

*方案 A：内嵌服务器 + REST 接口*：Spring Boot 内嵌 Tomcat，既托管前端，又以 REST 接口供数据，前端走标准 HTTP。

*方案 B：自定义协议 + Java↔JS 桥*：不启动本地 HTTP 服务器，Vue 资源由 Fuzio 自定义协议从应用内部加载，前后端通过 Java↔JS 桥直接对话。

两套方案怎么选，我们后面会讨论。下面先从两者共同的基础——让 Spring Boot 与 Swing 共处一个进程开始。

## 第一步：为桌面应用启动 Spring Boot 后端 ##

先解决最基础的问题：一个 Spring Boot 应用怎么同时弹出一个 Swing 窗口。

和任何 Spring Boot 应用一样，入口类用 · 注解修饰， 注解启用 Spring Boot 服务。

应用本身通过 · 创建，这样我们可以在启动前调整启动参数。这里要调整的关键一项是关闭无头模式：默认情况下 Spring Boot 以"无头模式"（headless）启动，这种模式适用于服务器环境，不提供图形界面支持。而在这种模式下创建 `JFrame`，`JDialog` 等需要图形环境的组件时候， 会抛 `HeadlessException`。因此启动时显式 `headless(false)`。

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

// @SpringBootApplication 启用 Spring Boot 的自动配置与组件扫描。
@SpringBootApplication
public class DesktopApplication {

    public static void main(String[] args) {
        // 用 SpringApplicationBuilder 创建应用，并在启动前关闭无头模式。
        // headless(false) 是桌面应用的必备项，否则创建 Swing 窗口会抛 HeadlessException。
        ConfigurableApplicationContext context =
                new SpringApplicationBuilder(DesktopApplication.class)
//                        .web(WebApplicationType.NONE)
                        .headless(false)
                        .run(args);

        // ... 后面创建窗口
    }
}
```

这里要不要保留内嵌 Web 服务器，取决于你走哪套方案：

- 走方案 A（第三步，用内嵌服务器托管前端 + REST），就保持默认——不要加 `web(WebApplicationType.NONE)`，让 Spring Boot 把内嵌 Tomcat 跑起来。
- 走方案 B（第四步，自定义协议 + JS 桥），用不到 HTTP，可以显式 `web(WebApplicationType.NONE)` 把 Spring 当作纯 DI 容器。

本文先按方案 A 往下走。为此配置 `application.yml`，让内嵌 Tomcat 用随机端口、只监听本地回环：

```yaml
server:
  # 0 = 随机端口，启动后由代码读取实际端口，避免端口冲突。
  port: 0
  # 只监听本地回环地址，避免内嵌服务被局域网访问。
  address: 127.0.0.1
```

用 `port: 0` 让系统分配一个空闲端口，再在启动后回读真实端口——这样多个实例或被占用端口都不会冲突。读取端口的方式：

```java
import org.springframework.boot.web.context.WebServerApplicationContext;

int port = ((WebServerApplicationContext) context).getWebServer().getPort();
String appUrl = "http://127.0.0.1:" + port + "/";
```

到这里，Spring Boot 已经能在桌面环境下启动。但还没有窗口——接下来交给 Fuzio。

## 第二步：用 Fuzio 在桌面窗口中渲染 Vue 界面 ##

Fuzio 是一个 Java 嵌入式 Chromium 浏览器组件，可以把基于 Chromium 的 Web 视图集成进 Swing、JavaFX、SWT、Compose Desktop 应用。这里我们使用 Swing 的 JFrame 作为主窗口，并在窗口内部嵌入 Fuzio 的 BrowserView。

先加入 Fuzio 依赖。下面分别给出 Maven 和 Gradle 的写法。

*Maven（`pom.xml`）*：

```xml
<repositories>
    <repository>
        <id>tech.fuzio</id>
        <url>https://jiku.mycloudrepo.io/public/repositories/releases</url>
    </repository>
</repositories>

<dependencies>
    <!-- Fuzio：获取所有平台的 Chromium 二进制文件 -->
    <dependency>
        <groupId>tech.fuzio</groupId>
        <artifactId>fuzio-cross-platform</artifactId>
        <version>2026.3.0</version>
        <type>pom</type>
    </dependency>

    <!-- Fuzio：Swing UI 工具包集成 -->
    <dependency>
        <groupId>tech.fuzio</groupId>
        <artifactId>fuzio-swing</artifactId>
        <version>2026.3.0</version>
    </dependency>
</dependencies>
```

*Gradle（`build.gradle`，使用官方 Fuzio Gradle 插件）*：

```groovy
plugins {
    id 'tech.fuzio.gradle' version '1.0.0'
}

fuzio {
    // Fuzio 版本（必需）
    version = '2026.3.0'
}

dependencies {
    // 检测当前平台并添加对应的 Chromium 二进制文件
    implementation fuzio.currentPlatform

    // Fuzio：Swing UI 工具包集成
    implementation fuzio.swing
}
```

应用主窗口基于 Java Swing 的 JFrame 实现——作为 Java 内置组件，它轻量且易用。窗口内部嵌入 Fuzio 提供的 Chromium 内核 Web 视图（BrowserView），直接在桌面窗口中渲染 Vue.js 界面，并支持所有现代浏览器特性：

```java
var engine = Engine.newInstance(HARDWARE_ACCELERATED);
var browser = engine.newBrowser();

SwingUtilities.invokeLater(() -> {
    var view = BrowserView.newInstance(browser);
    var frame = new JFrame("Spring + Fuzio 桌面应用");
    frame.addWindowListener(new WindowAdapter() {
        @Override
        public void windowClosing(WindowEvent e) {
            engine.close();
        }
    });
    frame.setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
    frame.add(view, BorderLayout.CENTER);
    frame.setSize(1280, 800);
    frame.setLocationRelativeTo(null);
    frame.setVisible(true);

    // 加载由内嵌 Spring Boot 托管的本地前端
    browser.navigation().loadUrl(appUrl);
});
```

这里 `appUrl` 指向内嵌 Spring Boot 的本地地址（`http://127.0.0.1:{port}/`）。

这套架构分工明确：Spring 后端负责核心业务逻辑（数据读写、文件操作等），Vue.js 前端专注界面布局与用户交互，各司其职、高效协同。

另外，Fuzio 采用多进程架构。Chromium 在独立进程中运行，并通过 IPC 与 Java 进程通信。这样即使某个网页崩溃，承载 Spring 后端的 Java 进程依然存活，对要保护用户数据的桌面应用尤为关键。

## 第三步：方案 A——内嵌服务器托管前端 + REST 接口 ##

第一套方案最直接：让 Spring Boot 启动内嵌 Tomcat，既托管 Vue 构建产物，又提供 REST 接口。这一步我们写一个普通的 `@RestController`，前端通过标准 HTTP 调用它：

```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService; // 普通 Spring Bean，构造器注入

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "statCards", dashboardService.statCards(),
                "revenueChart", dashboardService.revenueChart());
    }
}
```

DashboardService 是一个普通 Spring Bean，项目中则可以接入 Spring Data、MyBatis、本地数据库或企业内部系统。这里的重点是：桌面应用仍然可以沿用 Spring Boot 熟悉的分层方式组织业务代码。

前端（Vue）这边就是普通的 `fetch`：

```ts
// 前端通过标准 fetch 调用内嵌 Spring Boot 的 REST 接口。
export async function fetchSummary(): Promise<DashboardSummary> {
  const res = await fetch('/api/dashboard/summary')
  if (!res.ok) throw new Error('加载仪表盘数据失败：' + res.status)
  return res.json()
}
```

> 这里暂时省略了鉴权逻辑。实际企业项目或生产环境中，即使服务只监听 `127.0.0.1`，也建议在请求中携带应用启动时生成的本地访问 token，例如通过 `Authorization` 或自定义请求头传递，避免同一台机器上的其他进程直接调用本地接口。

*前端的构建产物也由这个内嵌 Spring Boot 托管*。Vue 工程用 Vite，把构建输出目录指向 Spring Boot 的静态资源目录：

```ts:vite.config.ts
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    // 构建产物直接输出到 Spring Boot 的 static 目录，由内嵌 Tomcat 托管。
    outDir: fileURLToPath(new URL('../src/main/resources/static', import.meta.url)),
    emptyOutDir: true,
  },
})
```

这样一来，Spring Boot 启动后，Fuzio 加载 `http://127.0.0.1:<port>/` 就能显示完整的 Vue 页面，而前端的 `fetch('/api/dashboard/summary')` 也落在同一个内嵌服务上。

## 第四步：方案 B——自定义协议 + Java↔JS 桥 ##

第三步那套"内嵌服务器 + HTTP"已经能跑通完整应用。但它隐含了一个前提：你愿意在本地起一个 HTTP 服务器。有些场景并不需要 - 比如你只想用 Spring 的依赖注入、配置、数据访问，并不打算对外暴露任何 HTTP 接口；或者出于安全考虑，不希望前端代码和接口能被本地浏览器直接访问。

这种情况下，可以走一条完全不依赖本地服务器的路线：前端资源用 Fuzio 的自定义协议从应用内部加载，前后端通信用 Java↔JS 桥。这一步我们换用这套方案做用户管理页。

### 用自定义协议托管前端 ###

第三步是把 Vue 构建产物交给内嵌 Tomcat、通过 `http://127.0.0.1:port/` 提供。这里换一种思路：把 Vue 应用文件直接打包进 Java 资源目录，通过 Fuzio 的自定义协议拦截 API 从类路径中直接加载资源。

为了允许请求拦截器处理 Web 资源请求，我们将其分配给一个自定义协议：

```java
var engine = Engine.newInstance(
        EngineOptions.newBuilder(HARDWARE_ACCELERATED)
                .addScheme(Scheme.of("app"), interceptor)
                .build());
```

每当浏览器尝试加载 `app:// URL` 时，拦截器就会处理该请求，并从应用的资源目录中返回对应的 HTML、CSS 或 JavaScript 文件。

通过这种方式，所有 Web 资源的加载都发生在应用内部，外部无法拦截，也无法访问这些资源。同时，使用自定义协议可确保常规 HTTPS/XHR 请求（例如身份验证、API 调用）能够顺利通过。

之后让浏览器加载 `app:/my-app.com` 即可，不再需要本地端口：

```java
browser.navigation().loadUrl("app://my-app.com");
```

这样一来，所有 HTML、CSS、JavaScript 都从应用 JAR 内读取，不经过本地 HTTP 服务器，源码也不会暴露在某个本地地址上。
用 Java↔JS 桥进行通信

前端不再用 fetch 打 HTTP，而是直接调用注入到页面里的 Java 对象。出于安全考虑，Fuzio 只允许标注了 `@JsAccessible` 的公共方法被 JavaScript 访问。我们定义一个桥对象，注入需要的 Spring Bean，把方法暴露给前端：

```java
@Component
@JsAccessible
public class SpringBridge {

    private final UserService userService;

    public SpringBridge(UserService userService) {
        this.userService = userService;
    }

    public String listUsers() {
        return new Gson().toJson(userService.findAll());
    }
}
```

然后用 Fuzio 的 `InjectJsCallback`，把从 Spring 容器取出的桥对象挂到 `window` 上：

```java
SpringBridge bridge = context.getBean(SpringBridge.class);
browser.set(InjectJsCallback.class, params -> {
    params.frame().<JsObject>executeJavaScript("window").putProperty("springBridge", bridge);
    return InjectJsCallback.Response.proceed();
});
```

前端只要声明一下类型，就能像调用本地方法一样调用后端：

```ts
declare const springBridge: {
  listUsers(): string
}

const users = JSON.parse(springBridge.listUsers())
```

关于 Java↔JS 桥的更多用法，可参考 [Fuzio JavaScript 指南](https://fuzio.tech/docs/guides/javascript/)。
