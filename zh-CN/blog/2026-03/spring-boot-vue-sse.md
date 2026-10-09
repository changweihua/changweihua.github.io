---
lastUpdated: true
commentabled: true
recommended: true
title: 构建实时消息应用
description: Spring Boot + Vue 与 WebSocket 的有机融合
date: 2026-03-16 13:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言 ##

在现代Web应用中，实时双向通信已成为提升用户体验的关键。无论是直播弹幕、在线客服、协同编辑还是实时数据大屏，都要求后端能主动、即时地将数据推送给前端。传统的HTTP请求-响应模式（如轮询）难以高效地满足这一需求。

本文将详细讲解如何整合 Spring Boot（后端）、Vue（前端）并通过 Spring WebSocket + STOMP + SockJS 这一强大组合，构建一个高效、可靠的双向通信机制。最后，我们还会介绍如何用 Nginx 来部署前后端分离的项目。

## 一、技术选型：为什么是它们？ ##

- WebSocket: HTML5提供的一种在单个TCP连接上进行全双工通信的协议，真正实现了低延迟的双向数据交换。
- STOMP (Simple Text Oriented Messaging Protocol) : 一种简单的基于帧的协议，定义了消息的格式和语义。它位于WebSocket之上，为我们提供了一个类似于消息队列（如RabbitMQ）的发布-订阅模式，使得我们可以像使用 `@MessageMapping` 注解那样处理消息，极大地简化了开发。
- SockJS: 一个JavaScript库，提供了WebSocket的模拟实现。它会在运行时优先尝试使用原生WebSocket，如果浏览器不支持或网络环境受限（如某些代理阻止WS连接），则会自动降级为其他技术（如长轮询），从而保证应用的兼容性和健壮性。
- Spring Boot: 提供了极其便捷的WebSocket支持，通过 `@EnableWebSocketMessageBroker` 等注解即可快速配置一个功能强大的WebSocket服务器。
- Vue: 轻量级、易上手的前端框架，配合stompjs和sockjs-client库可以轻松连接WebSocket服务。
Nginx: 高性能的HTTP和反向代理服务器，我们将用它来代理前端静态资源（Vue打包后的文件）和后端API/WebSocket请求。

## 二、实战 ##

我们将通过一个经典的消息收发场景来串联所有技术点。

### 第一部分：Spring Boot 后端实现 ###

#### 创建项目并引入依赖 ####

引入 Spring Web 和 WebSocket 依赖。

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

#### 配置 WebSocket 和 STOMP 代理 ####

创建一个配置类 WebSocketConfig：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 1. 启用WebSocket消息代理
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 2. 配置消息代理
        // 启用一个简单的基于内存的消息代理，将消息定向到以 `/topic` 为前缀的目的地
        config.enableSimpleBroker("/topic");
        // 设置应用程序目的地的前缀，所有以 `/app` 开头的消息都会路由到 @MessageMapping 注解的方法
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. 注册一个STOMP端点，客户端将使用它来连接
        registry.addEndpoint("/ws-chat") // 端点URL
                .setAllowedOriginPatterns("*") // 允许跨域。生产环境应严格限制为前端域名！
                .withSockJS(); // 启用SockJS回退选项
    }
}
```

- `/topic`: 用于发布-订阅模式（一对多）。服务端向所有订阅了 `/topic/xxx` 的客户端广播消息。
- `/app`: 用于点对点模式。客户端发送消息到 `/app/xxx`，由服务端的 `@MessageMapping(“xxx”)` 方法处理。
- `/ws-chat`: 这是WebSocket握手的HTTP端点URL。

#### 创建消息处理控制器 ####

创建一个控制器来处理消息。

```java
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    // 处理所有发送到 `/app/chat` 目的地的消息
    @MessageMapping("/chat") // 等价于 @RequestMapping
    @SendTo("/topic/messages") // 将方法的返回值广播给所有订阅了 `/topic/messages` 的客户端
    public ChatMessage sendMessage(ChatMessage message) {
        // 这里可以处理消息，比如保存到数据库等
        System.out.println("Received message: " + message.getContent());
        return message; // 直接将消息广播出去
    }
}
```

消息实体

```java
public class ChatMessage {
    private String from;
    private String content;
    private String timestamp;

    // 务必提供默认构造函数和getter/setter方法
    public ChatMessage() {}
    public ChatMessage(String from, String content, String timestamp) {
        this.from = from;
        this.content = content;
        this.timestamp = timestamp;
    }
    // ... getters and setters ...
}
```

至此，后端服务就完成了！它提供了一个WebSocket端点，能够接收/app/chat的消息，并将其广播到/topic/messages。

### 第二部分：Vue 前端实现 ###

#### 创建Vue项目并安装依赖 ####

```bash
npm create vue@latest my-websocket-chat
cd my-websocket-chat
npm install sockjs-client stompjs
```

#### 创建WebSocket工具类 (src/utils/websocket.ts) ####

```ts
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// 导出连接、断开、发送消息的方法
export const webSocketService = {
  stompClient: null,
  isConnected: false,

  // 连接WebSocket
  connect(config) {
    const { url, onConnect, onError } = config;
    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);

    // 禁用调试信息（生产环境）
    this.stompClient.debug = () => {};

    this.stompClient.connect(
      {},
      (frame) => {
        console.log('Connected: ' + frame);
        this.isConnected = true;
        if (onConnect) onConnect(this.stompClient);
      },
      (error) => {
        console.error('Connection error: ', error);
        this.isConnected = false;
        if (onError) onError(error);
      }
    );
  },

  // 断开连接
  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
      this.isConnected = false;
    }
    console.log("Disconnected");
  },

  // 订阅主题
  subscribe(destination, callback) {
    if (this.stompClient && this.isConnected) {
      return this.stompClient.subscribe(destination, (message) => {
        if (callback) callback(JSON.parse(message.body));
      });
    }
    return null;
  },

  // 发送消息
  sendMessage(destination, message) {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }
};
```

#### 在Vue组件中使用 (src/App.vue) ####

```vue
<template>
  <div id="app">
    <h1>Spring Boot + Vue Chat Room</h1>
    <div class="chat-box">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <strong>{{ msg.from }}:</strong> {{ msg.content }} <em>({{ msg.timestamp }})</em>
      </div>
    </div>
    <div class="input-area">
      <input v-model="currentMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
      <button @click="sendMessage" :disabled="!isConnected">Send</button>
      <p>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
    </div>
  </div>
</template>

<script>
import { webSocketService } from './utils/websocket.js';

export default {
  name: 'App',
  data() {
    return {
      isConnected: false,
      currentMessage: '',
      messages: [] // 存储收到的消息
    };
  },
  mounted() {
    this.connectWebSocket();
  },
  beforeUnmount() {
    // 组件销毁前断开连接
    webSocketService.disconnect();
  },
  methods: {
    connectWebSocket() {
      // 后端WebSocket端点，注意是 http，SockJS会自己处理
      const serverUrl = 'http://localhost:8080/ws-chat';
      
      webSocketService.connect({
        url: serverUrl,
        onConnect: (stompClient) => {
          this.isConnected = true;
          console.log('WebSocket connected successfully!');

          // 订阅 `/topic/messages`，接收广播消息
          webSocketService.subscribe('/topic/messages', (message) => {
            this.messages.push(message); // 将收到的消息添加到列表
          });
        },
        onError: (error) => {
          this.isConnected = false;
          console.error('Could not connect to WebSocket server.', error);
        }
      });
    },
    sendMessage() {
      if (this.currentMessage.trim() && this.isConnected) {
        const chatMessage = {
          from: 'VueUser', // 这里可以改成用户输入的名字
          content: this.currentMessage,
          timestamp: new Date().toLocaleTimeString()
        };

        // 发送消息到 `/app/chat`
        webSocketService.sendMessage('/app/chat', chatMessage);
        this.currentMessage = ''; // 清空输入框
      }
    }
  }
};
</script>

<style>
/* 添加一些简单的样式 */
.chat-box {
  border: 1px solid #ccc;
  height: 300px;
  overflow-y: scroll;
  margin-bottom: 10px;
  padding: 10px;
}
.message {
  margin-bottom: 5px;
}
.input-area {
  display: flex;
  gap: 10px;
}
input {
  flex-grow: 1;
  padding: 5px;
}
</style>
```

### 第三部分：Nginx 部署配置 ###

现在，我们有了独立的前端（Vue，通常在8081端口）和后端（Spring Boot，在8080端口）。我们需要Nginx作为反向代理，让用户通过一个统一的域名和端口（通常是80/443）来访问整个应用。

#### 打包前端项目 ####

```bash
npm run build
```

这会生成一个 dist 目录，里面是静态资源文件（HTML, JS, CSS）。

#### 编写Nginx配置文件 (nginx.conf 或 sites-available/your-site) ####

```nginx
http {
    # ... 其他全局配置 ...

    server {
        listen 80;
        server_name your-domain.com; # 你的域名，本地测试可用 localhost

        # 1. 代理所有静态资源请求到Vue的dist目录
        location / {
            root /path/to/your/vue-project/dist; # 替换为你的dist目录绝对路径
            index index.html;
            try_files $uri $uri/ /index.html; # 支持Vue Router的history模式
        }

        # 2. 代理后端API请求到Spring Boot应用
        location /api/ {
            proxy_pass http://localhost:8080/; # 代理到后端服务器
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 3. 代理WebSocket连接请求！
        # 关键：因为WebSocket使用HTTP Upgrade机制，需要特殊配置
        location /ws-chat/ {
            proxy_pass http://localhost:8080; # 注意这里没有尾随的 `/`
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade; # 升级协议头
            proxy_set_header Connection "Upgrade"; # 升级连接
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400; # WebSocket连接保持时间可以设长一些
        }

        # 也可以代理其他WebSocket端点，比如 /ws-notification/
    }
}
```

#### 重启Nginx使配置生效 ####

```bash
sudo nginx -s reload
```

#### 修改前端连接配置 ####

在生产环境中，前端不再直接连接 `localhost:8080`，而是连接相同的域名（或相对路径）。

```js
// 在 websocket.js 或 App.vue 中修改
// const serverUrl = 'http://localhost:8080/ws-chat'; // 开发环境
const serverUrl = '/ws-chat'; // 生产环境：使用相对路径，Nginx会自动代理
```

现在，访问 `http://your-domain.com`，Nginx会：

- 将 `/` 请求指向Vue静态页面。
- 将 `/api/xxx` 请求转发给后端的Spring Boot应用。
- 将 `/ws-chat` 的WebSocket升级请求也转发给后端，从而建立起全双工通信。

### 第四部分：SimpMessagingTemplate 支持 ###

使用 Spring Boot 的 SimpMessagingTemplate 给客户端发送消息非常方便。使用 `convertAndSend(String destination, Object payload)` 方法，所有订阅了该目的地（destination）的客户端都会收到消息。

```java
private final SimpMessagingTemplate messagingTemplate;

@Autowired // 通过构造器注入
public MessageSendingService(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
}

public void broadcastMessage(String messageContent) {
    // 构建你的消息对象，这里用一个简单的字符串示例
    String greeting = "Hello, everyone! " + messageContent;
    // 发送给所有订阅了 "/topic/greetings" 的客户端
    messagingTemplate.convertAndSend("/topic/greetings", greeting);
}
```

前端订阅示例（使用 Stomp.js）：

```javascript
stompClient.subscribe('/topic/greetings', function(message) {
    console.log('Received broadcast: ' + message.body);
    // 更新UI...
});
```

> Spring WebSocket 服务实现的主流方案与最佳实践

本文主要介绍了在 Spring 框架中实现 WebSocket 服务的几种解决方案，并提供了 Spring WebSocket 最佳实践，以及需要注意的问题。

## WebSocket 实现方案概述 ##

在 Spring 项目中实现 WebSocket 服务一般有如下几种解决方案：

- Spring-WebSocket 模块：Spring 官方提供的原生支持，与 Spring 生态深度整合。
- Jakarta EE 规范 API：基于 Java EE 标准的 WebSocket 实现，适用于兼容 Jakarta EE 的容器。
- Netty 实现：基于高性能网络框架 Netty 自定义开发，灵活性高但开发成本较大

本文重点探讨前两种主流方案的实现与实践。

## Jakarta EE WebSocket ##

### 启动 WebScoket 支持 ###

通过配置 `ServerEndpointExporter` 扫描并注册所有带有 `@ServerEndpoint` 注解的端点：

```java
@Configuration  
public class WebSocketConfig {
    
   /**
     * ServerEndpointExporter类的作用是，会扫描所有的服务器端点，
     * 把带有@ServerEndpoint 注解的所有类都添加进来
     */
    @Bean  
    public ServerEndpointExporter serverEndpointExporter() {  
        return new ServerEndpointExporter();  
    }  
} 
```

### WebSocketServer ###

`WebSocketServer` 类相当于 WS 协议的控制器，通过 `@ServerEndpoint` 和 `@Component` 注解启用，并实现生命周期方法：`@OnOpen`，`@OnClose`，`@OnMessage`等方法。

- `@OnOpen`：当WebSocket建立连接时，会触发这个注解修饰的方法。
- `@onClose`： 当WebSocket关闭连接时，会触发这个注解修饰的方法。
- `@onMessage`： 当WebSocket接收到消息时，会触发这个注解修饰的方法。

```java
/**
 * 消息中心 websocket 连接
 */
@ServerEndpoint("/subscribe/{userName}")
@CrossOrigin
@Component
@Slf4j
public class MessageWsServer {

    /**
     * key: userName
     * value: 连接的客户端
     */
    @Getter
    private static final Map<String, CopyOnWriteArraySet<Session>> clients = new ConcurrentHashMap<>();
    /**
     * 当前在线连接数统计。线程安全
     */
    private static final AtomicInteger onlineCount = new AtomicInteger(0);

    public static <T> void sendToAllClientByUserName(String userName, WsMessage<T> message) {
        CopyOnWriteArraySet<Session> sessions = clients.get(userName);
        if (sessions != null) {
            final Iterator<Session> iterator = sessions.iterator();
            while (iterator.hasNext()) {
                Session session = iterator.next();
                if (!session.isOpen()) {
                    iterator.remove();
                    log.warn("{} 的 session 关闭, 数据无法发送", userName);
                    continue;
                }
                sendMessage(session, JSON.toJSONString(message));
            }
        } else {
            log.warn("{} 没有在线的客户端", userName);
        }
    }

    public static int getOnlineCount() {
        return onlineCount.get();
    }

    private static void sendMessage(Session session, String message) {
        try {
            session.getBasicRemote().sendText(message);
        } catch (Exception e) {
            log.error("WebSocket 数据发送异常：{}", e.getMessage());
        }
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("userName") String param) {
        Collection<Session> list = clients.computeIfAbsent(param, c -> new CopyOnWriteArraySet<>());
        list.add(session);
        incrementCount(param);
    }

    @OnMessage
    public void onMessage(Session session, @PathParam("userName") String param, String message) {
        log.info("WebSocket 收到 {} 客户端发来的消息: {}", param, message);
        try {
            session.getBasicRemote().sendText("ok");
        } catch (Exception e) {
            log.error(e.toString());
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket 连接发生未知错误", error);
    }

    @OnClose
    public void onClose(Session session, @PathParam("userName") String param) {
        Collection<Session> list = clients.get(param);
        if (CollUtil.isNotEmpty(list) && (list.remove(session))) {
            decrementCount(param);
        }
    }

    private void incrementCount(String param) {
        onlineCount.incrementAndGet();
        log.info("{} 建立新的连接, 当前在线客户端总数: {}", param, getOnlineCount());
    }

    private void decrementCount(String param) {
        onlineCount.decrementAndGet();
        log.info("{} 连接断开, 当前在线客户端总数: {}", param, getOnlineCount());
    }
}
```

*会话管理*：使用 ConcurrentHashMap 和 CopyOnWriteArraySet 存储用户会话，保证多线程环境下的安全操作。

*生命周期方法*：

- @OnOpen：连接建立时将会话加入集合，并更新在线计数。
- @OnClose：连接关闭时移除会话，并更新在线计数。
- @OnMessage：接收消息后回复确认，并记录日志。

*消息发送*：支持向指定用户的所有在线客户端发送消息，自动过滤已关闭的会话

#### 跨域问题 ####

如果您想要使用`@ServerEndpoint`来创建WebSocket服务端，并且允许来自不同源的客户端连接，您可能需要配合`@CrossOrigin`使用，否则可能会遇到跨域问题。

### 高并发问题 ###

在高并发下的问题，如果你同时向在线的 3 个 WebSocket 在线客户端发送消息，即广播所有在线用户（目前是 3 个），每个用户每秒10条，那就是说，你每秒要发送 30 条数据，我们调用上述的 `sendText()` 方法，有时候会出现

```txt
java.lang.IllegalStateException: 远程 endpoint 处于 [xxxxxx] 状态，如：
The remote endpoint was in state [TEXT_FULL_WRITING] which is an invalid state for calle
```

这是因为在高并发的情况下，出现了 session 抢占的问题，导致 session 的状态不一致，所以这里需要加锁操作

## Spring WebSocket（推荐用法） ##

在介绍 Spring WebSocket 中我会拿出已经实现的封装，目前来看还是够用的，所以配置代码会相对较多，而不是简单的配置

首先我们需要集成 Spring Websocket 的 starter 包

```xml
<dependency>  
  <groupId>org.springframework.boot</groupId>  
  <artifactId>spring-boot-starter-websocket</artifactId>  
</dependency> 
```

### 配置 WebSocketConfig ###

新增可配置属性类 WebSocketProperties

```java
@Data
@ConfigurationProperties("allin.ws")
public class WebSocketProperties {

    /**
     * 发送时间的限制，默认3秒，单位：毫秒
     */
    private Integer sendTimeLimit = 1000 * 3;

    /**
     * 发送消息缓冲上线，5MB
     */
    private Integer bufferSizeLimit = 1024 * 1024 * 5;

    /**
     * 核心线程池数量，默认10个
     */
    private Integer coreThreadSize = 10;

    /**
     * 最大线程池数量，默认50个
     */
    private Integer maxThreadSize = 50;

    /**
     * 消息队列容量，默认100
     */
    private Integer queueCapacity = 100;
}
```

新增配置类，实现 WebSocketConfigurer ，主要配置 websocket 的注册连接地址。

- 通过注入 `List<CustomParamWebSocketHandler>` 自动收集所有注册的 WebSocket 处理器
- 在 `defaultWebSocketConfigurer` 方法中遍历所有处理器，并根据各自的 urlPath 进行注册

```java
/**
 * 开启 websocket
 *
 */
@Slf4j
@EnableConfigurationProperties(WebSocketProperties.class)
@EnableWebSocket
@Configuration
public class WebSocketAutoConfiguration implements InitializingBean {

    private final WebSocketProperties webSocketProperties;

    private final TokenApi tokenApi;

    public WebSocketAutoConfiguration(WebSocketProperties webSocketProperties,
                                      TokenApi tokenApi) {
        this.webSocketProperties = webSocketProperties;
        this.tokenApi = tokenApi;
    }

    @Bean
    public WebSocketConfigurer defaultWebSocketConfigurer(List<CustomParamWebSocketHandler> customParamWebSocketHandlers) {
        return registry -> {
            for (CustomParamWebSocketHandler customParamWebSocketHandler : customParamWebSocketHandlers) {
                registry.addHandler(customParamWebSocketHandler, customParamWebSocketHandler.getUrlPath())
                        .setAllowedOrigins("*");
                log.info("注册 WebSocketHandler, 连接路径:{}, 路径模板:{}, 连接参数:{}",
                        customParamWebSocketHandler.getUrlPath(),
                        customParamWebSocketHandler.getUriTemplate(),
                        customParamWebSocketHandler.getParamKey());
            }
        };
    }

    
    @Primary
    @Bean("defaultWebSocketHandler")
    public CustomParamWebSocketHandler customParamWebSocketHandler() {
        return new CustomParamWebSocketHandler(webSocketProperties);
    }

    @Override
    public void afterPropertiesSet() {
        // 初始化ws消息发送的线程池
        WebSocketMessageSender.initializeExecutor(webSocketProperties);
    }
}
```

### 封装通用的处理器 WebSocketHandler ###

WebSocketHandler 就是监听 websocket 连接之后的操作，也是上面继承的TextWebSocketHandle，我们只要在原有的基础上进行业务处理就行了。

它提供了一些方法来处理 WebSocket 会话的各个阶段，使用只要继承 TextWebSocketHandler 类就行。

- afterConnectionEstablished()：当客户端建立连接时调用，用于执行连接建立后的操作。
- handleTextMessage()：当接收到消息时调用，用于处理客户端发送的消息
- handleTransportError()：当连接发生错误时调用，用于处理连接错误
- afterConnectionClosed()：当连接关闭时调用，用于执行连接关闭后的操作。

在这里我们继承了TextWebSocketHandler并实现了部分封装，添加了 urlPath 和 paramKey 属性，分别用于指定 WebSocket 的 URL 路径和参数名，这样就可以根据注释中的部分实现复用

```java
/**
 * 复用示例
 */
@Configuration
public class MyWebSocketConfig {

    @Bean
    public CustomParamWebSocketHandler userWebSocketHandler(WebSocketProperties properties) {
        // 自定义URL路径、URI模板和参数名
        return new CustomParamWebSocketHandler(
            properties,
            "/user/*",           // URL路径模式
            "/user/{userId}",    // URI模板
            "userId"             // 参数名
        );
    }

    @Bean
    public CustomParamWebSocketHandler roomWebSocketHandler(WebSocketProperties properties) {
        return new CustomParamWebSocketHandler(
            properties,
            "/room/*",
            "/room/{roomId}",
            "roomId"
        );
    }
}

/**
 * 自定义参数发送信息的WebSocket
 */
@Slf4j
public class CustomParamWebSocketHandler extends TextWebSocketHandler implements ApplicationContextAware {

    @Getter
    private final WebSocketSessionManager sessionManager;

    @Getter
    private final WebSocketMessageSender sender;

    private final WebSocketProperties properties;

    @Getter
    private final String uriTemplate;

    @Getter
    private final String urlPath;

    /**
     * 用于标识 WebSocket 连接的主键参数名
     * 默认为"param"，可以通过构造函数自定义
     */
    @Getter
    private final String paramKey;

    /**
     * Spring 事件发布器，用于发布 WebSocket 消息事件
     */
    private ApplicationEventPublisher eventPublisher;

    /**
     * 构造函数
     *
     * @param properties WebSocket属性配置
     */
    public CustomParamWebSocketHandler(WebSocketProperties properties) {
        this(properties, "/websocket/*", "/websocket/{param}", "param");
    }

    /**
     * 构造函数
     *
     * @param properties  WebSocket属性配置
     * @param urlPath     URL路径模式，例如"/websocket/*"
     * @param uriTemplate URI模板，例如"/websocket/{param}
     * @param paramKey    用于标识 WebSocket 连接的主键参数名
     */
    public CustomParamWebSocketHandler(WebSocketProperties properties, String urlPath, String uriTemplate, String paramKey) {
        this.sessionManager = new WebSocketSessionManager(uriTemplate);
        this.sender = new WebSocketMessageSender(sessionManager);
        this.properties = properties;
        this.uriTemplate = uriTemplate;
        this.urlPath = urlPath;
        this.paramKey = paramKey;
    }

    /**
     * 获取路径变量映射
     *
     * @param session WebSocket会话
     * @return 路径变量映射
     */
    protected String getPathVariable(WebSocketSession session) {
        final URI uri = session.getUri();
        if (uri == null || uri.getPath() == null) {
            log.error("获取 websocket url 失败");
            return null;
        }

        UriTemplate template = new UriTemplate(uriTemplate);
        Map<String, String> pathVariables = template.match(uri.getPath());

        return pathVariables.getOrDefault(paramKey, "");
    }


    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String pathVariable = getPathVariable(session);
        if (StrUtil.isNotBlank(pathVariable)) {
            // 实现 session 支持并发，可参考 https://blog.csdn.net/abu935009066/article/details/131218149
            session = new ConcurrentWebSocketSessionDecorator(session,
                    properties.getSendTimeLimit(),
                    properties.getBufferSizeLimit());
            sessionManager.add(pathVariable, session);
            log.info("{}, {} 建立连接, 该Key连接总数: {}, 系统连接总数: {}", uriTemplate, pathVariable,
                    sessionManager.getSession(pathVariable).size(),
                    sessionManager.getAllSession().size());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String pathVariable = getPathVariable(session);
        if (StrUtil.isBlank(pathVariable)) {
            return;
        }

        String messagePayload = message.getPayload();

        if (!JSON.isValid(messagePayload)) {
            // 非 JSON 格式，直接回复 ok
            sender.sendToParam(pathVariable, "ok");
            return;
        }
        // 解析为 JSON
        JSONObject jsonMessage = JSON.parseObject(messagePayload);

        // 检查是否包含 type 字段
        if (jsonMessage != null && jsonMessage.containsKey("type")) {
            String messageType = jsonMessage.getString("type");

            // 异步发布事件
            if (eventPublisher != null) {
                var eventData =
                        new WebSocketMessageEvent.WebSocketMessageEventData(messageType, jsonMessage, session);

                // 发布事件，避免阻塞 WebSocket 消息处理
                eventPublisher.publishEvent(new WebSocketMessageEvent(eventData));
                log.debug("WebSocket 消息事件已发布: paramKey={}, type={}", pathVariable, messageType);
            }
        } else {
            // JSON 格式但没有 type 字段，回复 ok
            sender.sendToParam(pathVariable, "ok");
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        if (!(exception instanceof EOFException)) {
            log.error("WebSocket 连接发生错误", exception);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
        String primaryKey = getPathVariable(session);
        if (StrUtil.isNotBlank(primaryKey)) {
            sessionManager.remove(primaryKey, session);
        }
        log.info("{}, {} 关闭连接, 该Key连接总数: {}, 系统连接总数: {}", uriTemplate, primaryKey,
                sessionManager.getSession(primaryKey).size(),
                sessionManager.getAllSession().size());
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        eventPublisher = applicationContext;
    }
}
```

在这里我们使用ConcurrentWebSocketSessionDecorator来处理线程安全问题，他是 Spring WebSocket 提供的一个装饰器类，用于增强底层的 WebSocketSession 的线程安全性。它通过并发安全的方式包装原始的 WebSocketSession 对象，确保在多线程环境下安全地访问和修改会话属性，以及进行消息发送操作。

#### 构造方法 ####

- delegate 需要代理的session
- sendTimeLimit 表示发送单个消息的最大时间
- bufferSizeLimit 表示发送消息的队列最大字节数，不是消息的数量而是消息的总大小
- overflowStrategy 表示大小超过限制时的策略，默认是断开连接，还有个选项就是丢弃最老的数据，直到大小满足

### 会话管理 ###

实现会话管理，用来实现服务端向指定的客户端单发或者群发消息

```java
/**
 * WebSocket Session管理实现，不同的CustomParamWebSocketHandler之间WebSocketSessionManager不复用
 * <p>
 * 每个key是一个分组，每个key下支持多个客户端
 *
 */
@Slf4j
public class WebSocketSessionManager {

    /**
     * 全局管理器
     */
    public static Map<String, Map<String, CopyOnWriteArraySet<WebSocketSession>>> webSocketSessionManagers = new HashMap<>();

    /**
     * key 与 WebSocketSession 映射
     * value 为集合
     */
    private final ConcurrentMap<String, CopyOnWriteArraySet<WebSocketSession>> sessions
            = new ConcurrentHashMap<>();

    public WebSocketSessionManager(String uriTemplate) {
        webSocketSessionManagers.put(uriTemplate, this.sessions);
    }

    /**
     * 添加 Session
     *
     * @param session Session
     */
    public void add(String key, WebSocketSession session) {
        // 使用compute方法来确保线程安全地添加会话
        sessions.compute(key, (k, v) -> {
            if (v == null) {
                v = new CopyOnWriteArraySet<>();
            }
            v.add(session);
            return v;
        });
    }

    /**
     * 移除 Session
     *
     * @param session Session
     */
    public void remove(String key, WebSocketSession session) {
        CopyOnWriteArraySet<WebSocketSession> webSocketSessions = sessions.get(key);
        if (CollUtil.isNotEmpty(webSocketSessions)) {
            webSocketSessions.removeIf(t -> t.getId().equals(session.getId()));
        }
    }

    /**
     * 移除 key 下的 所有 Session
     */
    public void remove(String key) {
        CopyOnWriteArraySet<WebSocketSession> sessionByKeys = sessions.get(key);
        if (CollUtil.isNotEmpty(sessionByKeys)) {
            synchronized (sessionByKeys) {
                for (WebSocketSession session : sessionByKeys) {
                    try {
                        session.close();
                    } catch (IOException e) {
                        log.error("关闭 {} 的 ws 连接失败", key);
                    }
                }
                sessions.remove(key);
            }
        }
    }

    /**
     * 获得指定 key 的 Session 列表
     *
     * @param key key
     * @return Session
     */
    public Collection<WebSocketSession> getSession(String key) {
        if (StrUtil.isEmpty(key)) {
            return Collections.emptyList();
        }
        return sessions.getOrDefault(key, new CopyOnWriteArraySet<>());
    }

    /**
     * 获取所有session
     */
    public Collection<WebSocketSession> getAllSession() {
        return sessions.values().stream().flatMap(Collection::stream).toList();
    }


    /**
     * 获取所有key
     */
    public Set<String> getAllKeys() {
        return sessions.keySet();
    }

}
```

### 客户端消息广播 ###

当接收到客户端消息时，我们可以约定一种规范，来将这个消息做为 Spring 事件广播出去，由事件监听者来处理后续动作，例如以下约束

非 JSON 消息或JSON 消息（不包含 type 字段）

- 输入：任何非 JSON 格式的文本消息或JSON 消息（不包含 type 字段）
- 处理：直接回复 "ok"
- 示例：

```txt
客户端发送: "hello"
服务端回复: "ok"
```

JSON 消息（包含 type 字段）

- 输入：有效 JSON 且包含 type 字段
- 处理：

  - 构造 WsMessage 格式回复
  - 异步发布 WebSocketMessageEvent 事件

- 示例：

```txt
客户端发送: {"type": "heartbeat"}
服务端回复: {
  "type": "heartbeat",
  "payload": "客户端需要的数据",
  "sendTime": "2025-01-08 10:30:00"
}
```

封装的事件类如下

```java
/**
 * WebSocket 消息事件
 * 当 WebSocket 接收到包含 type 字段的 JSON 消息时触发此事件
 *
 * @author zhulin
 * @see #verify(String)
 */
public class WebSocketMessageEvent extends ApplicationEvent {

    public WebSocketMessageEvent(WebSocketMessageEventData source) {
        super(source);
    }

    /**
     * 获取事件数据
     */
    public WebSocketMessageEventData getData() {
        return (WebSocketMessageEventData) getSource();
    }

    /**
     * 校验是不是需要处理的类型
     */
    public boolean verify(String type) {
        if (type == null) {
            return false;
        }
        return type.equals(getData().getType());
    }

    /**
     * WebSocket 消息事件数据
     */
    @Data
    public static class WebSocketMessageEventData {
        /**
         * 消息类型
         */
        private String type;

        /**
         * 解析后的 JSON 对象
         */
        private JSONObject parsedMessage;

        /**
         * WebSocket 会话
         */
        private WebSocketSession session;

        public WebSocketMessageEventData(String type,
                                         JSONObject parsedMessage,
                                         WebSocketSession session) {
            this.type = type;
            this.parsedMessage = parsedMessage;
            this.session = session;
        }

        /**
         * 获取项目id
         */
        public String getProjectId() {
            return WsContextHolder.getProjectId(session);
        }

        /**
         * 获取用户id
         */
        public String getUserId() {
            return WsContextHolder.getUserId(session);
        }
    }
}
```

#### 监听器示例 ####

```java
@Component
public class EventInvasionWebSocketController {

    private final String EventInvasionRedDotWsMessageType = "event_invasion_red_dot";

    private final EventInvasionQueryService queryService;

    public EventInvasionWebSocketController(EventInvasionQueryService queryService) {
        this.queryService = queryService;
    }

    @Async
    @EventListener
    public void redDot(WebSocketMessageEvent messageEvent) {
        // 校验是不是自己关注的消息类型
        if (messageEvent.verify(EventInvasionRedDotWsMessageType)) {
            final WebSocketMessageEvent.WebSocketMessageEventData messageEventData = messageEvent.getData();
            final WebSocketSession session = messageEventData.getSession();
            final String userId = messageEventData.getUserId();
            final String projectId = messageEventData.getProjectId();
            WebSocketMessageSender.sendToSession(session, WsMessage.of(EventInvasionRedDotWsMessageType,
                                                                       queryService.unhandled(userId, projectId)));
        }
    }
}
```

### 消息发送 ###

这里需要提醒一点，WebSocketMessageSender 消息发送类所有的消息都由该类实例化的对象发送，但所有的对象共用一个线程池，但是线程池的参数可以通过配置文件配置，所以你可以根据项目实际情况去修改这些参数。

```java
/**
 * 消息发送类
 *
 */
@Slf4j
public class WebSocketMessageSender {

    /**
     * 共用一个线程池
     */
    private static ThreadPoolTaskExecutor executor;

    private final WebSocketSessionManager sessionManager;

    public WebSocketMessageSender(WebSocketSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    public static synchronized void initializeExecutor(WebSocketProperties properties) {
        if (executor != null) {
            return;
        }
        executor = ThreadPoolUtils.createThreadPoolTaskExecutor(
                "websocket-sender",
                properties.getCoreThreadSize(),
                properties.getMaxThreadSize(),
                properties.getQueueCapacity()
        );
        log.info("初始化 WebSocketMessageSender 线程池成功");
    }

    /**
     * 发送消息到某个连接
     *
     * @param session websocket连接
     * @param message 发送的消息
     */
    public static void sendToSession(WebSocketSession session, WsMessage<?> message) {
        executor.execute(() -> {
            // 1. 各种校验，保证 Session 可以被发送
            if (session == null || !session.isOpen()) {
                return;
            }
            // 2. 执行发送
            try {
                session.sendMessage(new TextMessage(JSON.toJSONString(message)));
            } catch (IOException ex) {
                log.error(StrUtil.format("给[{}]发送消息失败", session.getId()), ex);
            } catch (SessionLimitExceededException ex) {
                // 一旦有一条消息发送超时，或者发送数据大于限制，limitExceeded 标志位就会被设置成true，标志这这个 session 被关闭
                // 后面的发送调用都是直接返回不处理，但只是被标记为关闭连接本身可能实际上并没有关闭，这是一个坑需要注意。
                try {
                    session.close();
                } catch (IOException e) {
                    log.error(StrUtil.format("主动关闭[{}]连接失败", session.getId()), e);
                }
                log.error(StrUtil.format("给[[{}]发送消息失败", session.getId()), ex);
            }
        });
    }

    /**
     * 发送消息到某个参数的客户端
     *
     * @param param   websocket连接时的参数
     * @param message 发送的消息
     */
    public void sendToParam(String param, String message) {
        executor.execute(() -> {
            // 1. 获得 Session 列表
            Collection<WebSocketSession> sessions = sessionManager.getSession(param);
            if (CollUtil.isEmpty(sessions)) {
                return;
            }
            // 2. 执行发送
            sessions.forEach(session -> {
                // 1. 各种校验，保证 Session 可以被发送
                if (session == null || !session.isOpen()) {
                    sessionManager.remove(param, session);
                    return;
                }
                // 2. 执行发送
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException ex) {
                    log.error(StrUtil.format("给[{}]分组的[{}]发送消息失败", param, session.getId()), ex);
                } catch (SessionLimitExceededException ex) {
                    // 一旦有一条消息发送超时，或者发送数据大于限制，limitExceeded 标志位就会被设置成true，标志这这个 session 被关闭
                    // 后面的发送调用都是直接返回不处理，但只是被标记为关闭连接本身可能实际上并没有关闭，这是一个坑需要注意。
                    try {
                        session.close();
                        sessionManager.remove(param, session);
                    } catch (IOException e) {
                        log.error(StrUtil.format("主动关闭[{}]分组的[{}]连接失败", param, session.getId()), e);
                    }
                    log.error(StrUtil.format("给[{}]分组的[{}]发送消息失败", param, session.getId()), ex);
                }
            });
        });
    }

    /**
     * 发送消息到客户端
     *
     * @param param   分组
     * @param message 发送的消息
     */
    public void sendToParam(String param, WsMessage<?> message) {
        sendToParam(param, JSON.toJSONString(message));
    }

    /**
     * 广播消息到全部客户端
     *
     * @param message 发送的消息
     */
    public void sendToAll(String message) {
        for (String key : sessionManager.getAllKeys()) {
            sendToParam(key, message);
        }
    }

    /**
     * 广播消息到全部客户端
     *
     * @param message 发送的消息
     */
    public void sendToAll(WsMessage<?> message) {
        for (String key : sessionManager.getAllKeys()) {
            sendToParam(key, message);
        }
    }

}
```

### 注意 `@EnableScheduling` 的自动配置线程池失效场景 ###

在 SpringBoot 2.x 中同时使用 `@EnableWebSocket` 和 `@EnableScheduling` 时，org.`springframework.web.socket.config.annotation.WebSocketConfigurationSupport#defaultSockJsTaskScheduler` 会导致 `@EnableScheduling` 中自动配置线程池失效，所以需要手动创建线程池。

```java
@Bean(name = "taskScheduler")
public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setThreadNamePrefix("CommonScheduling-");
    // 线程数
    scheduler.setPoolSize(corePoolSize);
    scheduler.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    return scheduler;
}
```
