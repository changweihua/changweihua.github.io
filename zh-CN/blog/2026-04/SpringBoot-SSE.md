---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot实现消息推送
description: 让服务器学会“主动搭讪”
date: 2026-04-03 08:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

想象一下这个场景：你的APP像个腼腆的男生，只会傻傻等着用户来“敲门”（刷新页面），而不知道主动说“嘿，我有新消息给你！”这多尴尬啊！消息推送就像给服务器装了社交牛逼症，让它能从幕后跳出来大喊：“注意！有热乎的消息！”

## 一、推送技术选型：给服务器装上“大喇叭” ##

- *SSE（Server-Sent Events）* - 像单相思，服务器可以一直对客户端叨叨叨，但客户端只能听着
- *WebSocket* - 像热恋中的情侣，双方可以随时互发消息
- *轮询（Polling）* - 像查岗的女朋友，隔几秒就问一次“有新消息吗？”
- *长轮询（Long Polling）* - 像有耐心的女朋友，等不到消息就不挂电话
- 
今天咱们重点玩一下SSE，因为它简单直接，就像给服务器装了个校园广播站！

## 二、SpringBoot推送实战：三步搞定 ##

### 第一步：添加依赖（给项目喂点“能量饮料”） ###

```xml
<!-- pom.xml -->
<dependencies>
    <!-- SpringBoot基础套餐 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- 给模板引擎加点料 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    
    <!-- 让我们能处理异步请求 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
```

### 第二步：创建SSE控制器（服务器的“播音室”） ###

```java
package net.cmono.xiyue.controller;

import lombok.RequiredArgsConstructor;
import net.cmono.xiyue.service.ConnectionManager;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sse")
public class SseController {

    private final ConnectionManager connectionManager;

    /**
     * 客户端连接入口
     * @param userId 唯一用户标识（由客户端生成并传递）
     * @return SseEmitter
     */
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@RequestParam String userId) {
        return connectionManager.addConnection(userId);
    }

    /**
     * 客户端回复心跳的接口
     */
    @PostMapping("/heartbeat-response")
    public String heartbeatResponse(@RequestParam String userId) {
        connectionManager.handleHeartbeatResponse(userId);
        return "ok";
    }

    /**
     * 向所有客户端广播消息
     */
    @PostMapping("/broadcast")
    public String broadcast(@RequestParam String message) {
        int successCount = connectionManager.broadcast(message);
        return String.format("广播完成！成功推送给 %d 个客户端", successCount);
    }

    /**
     * 发送系统通知
     */
    @PostMapping("/system-notice")
    public String sendSystemNotice(@RequestParam String notice) {
        int successCount = connectionManager.sendSystemNotice(notice);
        return String.format("系统通知已发送，成功推送给 %d 个客户端", successCount);
    }
}
```

### 第三步：创建WebSocket配置（备选方案，双向通信） ###

```java
package net.cmono.xiyue.config;

import net.cmono.xiyue.service.MyWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new XiyueWebSocketHandler(), "/ws")
                .setAllowedOrigins("*");  // 生产环境记得限制域名哦！
    }
}
```

```java
package net.cmono.xiyue.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
public class XiyueWebSocketHandler extends TextWebSocketHandler {

    // 存储 sessionId -> WebSocketSession（线程安全）
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    // 存储 sessionId -> 最后心跳时间（用于服务端主动检测）
    private final Map<String, Long> lastHeartbeatTime = new ConcurrentHashMap<>();
    // 连接计数器（仅用于统计）
    private final AtomicInteger totalConnections = new AtomicInteger(0);

    // 心跳超时阈值（毫秒）
    private static final long HEARTBEAT_TIMEOUT_MS = 60_000;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        lastHeartbeatTime.put(sessionId, System.currentTimeMillis());
        totalConnections.incrementAndGet();

        log.info("WebSocket 连接建立: sessionId={}, 当前连接数={}, 累计连接数={}",
                sessionId, sessions.size(), totalConnections.get());

        // 发送欢迎消息（JSON 格式，便于前端解析）
        sendMessage(session, "welcome", "💬 欢迎来到 WebSocket 聊天室！");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String payload = message.getPayload();

        // 更新心跳时间（收到任何消息都视为活跃）
        lastHeartbeatTime.put(sessionId, System.currentTimeMillis());

        log.debug("收到消息: sessionId={}, payload={}", sessionId, payload);

        // 处理心跳消息（客户端主动发送的 ping）
        if ("ping".equalsIgnoreCase(payload)) {
            sendMessage(session, "pong", "heartbeat");
            return;
        }

        // 广播消息给所有其他客户端（可选：包括自己）
        String broadcastMsg = String.format("用户 %s 说：%s", sessionId, payload);
        broadcast(sessionId, broadcastMsg);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        lastHeartbeatTime.remove(sessionId);
        log.info("WebSocket 连接关闭: sessionId={}, 关闭原因={}, 剩余连接数={}",
                sessionId, status.getReason(), sessions.size());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String sessionId = session.getId();
        log.error("WebSocket 传输错误: sessionId={}, 错误信息={}", sessionId, exception.getMessage(), exception);
        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (IOException e) {
            log.error("关闭异常会话失败: sessionId={}", sessionId, e);
        } finally {
            sessions.remove(sessionId);
            lastHeartbeatTime.remove(sessionId);
        }
    }

    /**
     * 发送 JSON 格式消息（统一消息结构）
     */
    private void sendMessage(WebSocketSession session, String type, String content) {
        if (!session.isOpen()) {
            log.warn("会话已关闭，无法发送消息: sessionId={}", session.getId());
            return;
        }
        try {
            String json = String.format("{\"type\":\"%s\",\"data\":\"%s\",\"timestamp\":%d}",
                    type, content.replace("\"", "\\\""), System.currentTimeMillis());
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("发送消息失败: sessionId={}, type={}, content={}", session.getId(), type, content, e);
        }
    }

    /**
     * 广播消息给所有在线用户（排除指定 sessionId）
     */
    private void broadcast(String excludeSessionId, String message) {
        int successCount = 0;
        for (WebSocketSession session : sessions.values()) {
            if (!session.isOpen()) {
                continue;
            }
            if (excludeSessionId != null && excludeSessionId.equals(session.getId())) {
                continue; // 不发给发送者自己（可根据需求调整）
            }
            sendMessage(session, "broadcast", message);
            successCount++;
        }
        log.debug("广播完成: 成功推送给 {} 个客户端", successCount);
    }

    /**
     * 定时心跳检测（由外部调度器调用，例如每30秒执行一次）
     * 清理长时间未响应心跳的无效连接
     */
    public void cleanDeadConnections() {
        long now = System.currentTimeMillis();
        sessions.forEach((sessionId, session) -> {
            Long lastTime = lastHeartbeatTime.get(sessionId);
            if (lastTime != null && (now - lastTime) > HEARTBEAT_TIMEOUT_MS) {
                log.warn("心跳超时，准备关闭连接: sessionId={}, 最后活跃时间={}ms前",
                        sessionId, now - lastTime);
                try {
                    session.close(CloseStatus.POLICY_VIOLATION);
                } catch (IOException e) {
                    log.error("关闭心跳超时连接失败: sessionId={}", sessionId, e);
                } finally {
                    sessions.remove(sessionId);
                    lastHeartbeatTime.remove(sessionId);
                }
            }
        });
    }

    /**
     * 获取当前连接数（用于监控接口）
     */
    public int getCurrentConnectionCount() {
        return sessions.size();
    }
}
```

### 第四步：创建HTML测试页面（给客户端配个"收音机"） ###

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>消息推送测试 - 服务器的碎碎念</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 5px solid #3498db;
        }
        
        .message-area {
            height: 300px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            background: #fff;
        }
        
        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 8px;
            animation: fadeIn 0.5s;
        }
        
        .system { background: #e3f2fd; }
        .welcome { background: #e8f5e9; }
        .user { background: #fff3e0; }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
            margin: 5px;
        }
        
        button:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: #e74c3c;
        }
        
        .btn-success {
            background: #2ecc71;
        }
        
        .input-group {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        
        input {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
        }
        
        input:focus {
            border-color: #3498db;
            outline: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>服务器广播站测试</h1>
        
        <div class="card">
            <h3>连接状态</h3>
            <p id="status">准备连接服务器...</p>
            <button onclick="connectSSE()">连接SSE服务器</button>
            <button onclick="connectWebSocket()">连接WebSocket</button>
            <button class="btn-danger" onclick="disconnect()">断开连接</button>
        </div>
        
        <div class="card">
            <h3>消息测试</h3>
            <div class="input-group">
                <input type="text" id="messageInput" 
                       placeholder="输入要广播的消息..." />
                <button onclick="sendBroadcast()">广播消息</button>
                <button class="btn-success" onclick="sendSystemNotice()">
                    发送系统通知
                </button>
            </div>
        </div>
        
        <div class="card">
            <h3>收到的消息</h3>
            <div id="messageArea" class="message-area"></div>
            <button onclick="clearMessages()">清空消息</button>
            <span id="counter">消息数量: 0</span>
        </div>
    </div>

    <script>
        let eventSource = null;
        let ws = null;
        let messageCount = 0;
        
        // 添加消息到显示区域
        function addMessage(content, type = 'system') {
            const area = document.getElementById('messageArea');
            const message = document.createElement('div');
            message.className = `message ${type}`;
            message.innerHTML = `
                <strong>[${new Date().toLocaleTimeString()}]</strong>
                <span>${content}</span>
            `;
            area.appendChild(message);
            area.scrollTop = area.scrollHeight;
            
            messageCount++;
            document.getElementById('counter').textContent = 
                `消息数量: ${messageCount}`;
        }
        
        // 连接SSE
        function connectSSE() {
            if (eventSource) {
                addMessage('已经连接过了，别着急嘛！');
                return;
            }
            
            eventSource = new EventSource('/sse/connect');
            
            eventSource.onopen = () => {
                document.getElementById('status').innerHTML = 
                    'SSE连接成功！服务器现在可以主动推送消息了';
                addMessage('SSE连接已建立', 'welcome');
            };
            
            // 监听不同类型的消息
            eventSource.addEventListener('welcome', (e) => {
                addMessage(e.data, 'welcome');
            });
            
            eventSource.addEventListener('message', (e) => {
                addMessage(`收到广播: ${e.data}`, 'user');
            });
            
            eventSource.addEventListener('system', (e) => {
                addMessage(e.data, 'system');
            });
            
            eventSource.onerror = (e) => {
                document.getElementById('status').innerHTML = 
                    'SSE连接出错，尝试重连中...';
                console.error('SSE错误:', e);
                
                // 3秒后重连
                setTimeout(() => {
                    if (eventSource.readyState === EventSource.CLOSED) {
                        disconnect();
                        connectSSE();
                    }
                }, 3000);
            };
        }
        
        // 连接WebSocket
        function connectWebSocket() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                addMessage('WebSocket已经连接了！');
                return;
            }
            
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            ws = new WebSocket(`${protocol}//${host}/ws`);
            
            ws.onopen = () => {
                document.getElementById('status').innerHTML = 
                    'WebSocket连接成功！可以双向通信了';
                addMessage('WebSocket连接已建立', 'welcome');
            };
            
            ws.onmessage = (e) => {
                addMessage(`WebSocket消息: ${e.data}`, 'user');
            };
            
            ws.onerror = (e) => {
                addMessage('WebSocket连接错误', 'system');
            };
            
            ws.onclose = () => {
                document.getElementById('status').innerHTML = 
                    'WebSocket连接已关闭';
            };
        }
        
        // 发送广播消息
        async function sendBroadcast() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) {
                addMessage('请输入要发送的消息！', 'system');
                return;
            }
            
            try {
                const response = await fetch('/sse/broadcast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `message=${encodeURIComponent(message)}`
                });
                
                const result = await response.text();
                addMessage(`${result}`, 'system');
                input.value = '';
            } catch (error) {
                addMessage('发送失败: ' + error, 'system');
            }
        }
        
        // 发送系统通知
        async function sendSystemNotice() {
            const notice = prompt('请输入系统通知内容:', '服务器即将维护');
            if (!notice) return;
            
            try {
                const response = await fetch(`/sse/system-notice?notice=${encodeURIComponent(notice)}`, {
                    method: 'POST'
                });
                
                const result = await response.text();
                addMessage(`${result}`, 'system');
            } catch (error) {
                addMessage('发送系统通知失败', 'system');
            }
        }
        
        // 断开连接
        function disconnect() {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
                addMessage('SSE连接已关闭', 'system');
            }
            
            if (ws) {
                ws.close();
                ws = null;
                addMessage('WebSocket连接已关闭', 'system');
            }
            
            document.getElementById('status').innerHTML = 
                '连接已断开';
        }
        
        // 清空消息
        function clearMessages() {
            document.getElementById('messageArea').innerHTML = '';
            messageCount = 0;
            document.getElementById('counter').textContent = '消息数量: 0';
            addMessage('消息已清空', 'system');
        }
        
        // 页面加载时的小动画
        window.onload = () => {
            addMessage('消息推送演示系统已启动', 'welcome');
            addMessage('试试点击"连接SSE服务器"按钮开始体验吧！', 'system');
        };
        
        // 监听键盘事件
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBroadcast();
            }
        });
    </script>
</body>
</html>
```

## 三、进阶优化：让推送更"聪明" ##

### 连接管理器（专业版） ###

```java
package net.cmono.xiyue.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ConnectionManager {

    // 存储 userId -> SseEmitter
    private final Map<String, SseEmitter> userConnections = new ConcurrentHashMap<>();
    // 存储 userId -> 最后一次收到心跳响应的时间戳
    private final Map<String, Long> lastHeartbeatTime = new ConcurrentHashMap<>();

    // 心跳超时阈值（毫秒），超过此值则认为连接死亡
    private static final long HEARTBEAT_TIMEOUT_MS = 60_000; // 60秒

    /**
     * 添加新的客户端连接
     */
    public SseEmitter addConnection(String userId) {
        // 移除旧连接（避免重复登录或重复连接）
        removeConnection(userId);

        SseEmitter emitter = new SseEmitter(0L); // 不设置超时，由心跳控制

        emitter.onCompletion(() -> {
            log.info("用户 {} 连接正常完成", userId);
            removeConnection(userId);
        });
        emitter.onTimeout(() -> {
            log.warn("用户 {} 连接超时", userId);
            removeConnection(userId);
        });
        emitter.onError(e -> {
            log.error("用户 {} 连接发生错误", userId, e);
            removeConnection(userId);
        });

        userConnections.put(userId, emitter);
        lastHeartbeatTime.put(userId, System.currentTimeMillis());

        // 发送连接成功事件
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("连接成功，心跳已启动"));
        } catch (IOException e) {
            log.error("发送连接成功消息失败，移除连接", e);
            removeConnection(userId);
        }

        log.info("新客户端加入: userId={}, 当前连接数: {}", userId, userConnections.size());
        return emitter;
    }

    /**
     * 处理客户端返回的心跳响应（pong）
     */
    public void handleHeartbeatResponse(String userId) {
        Long lastTime = lastHeartbeatTime.get(userId);
        if (lastTime != null) {
            lastHeartbeatTime.put(userId, System.currentTimeMillis());
            log.debug("收到用户 {} 的心跳响应", userId);
        } else {
            log.warn("收到未知用户 {} 的心跳响应", userId);
        }
    }

    /**
     * 向所有客户端广播普通消息
     * @return 成功推送的客户端数量
     */
    public int broadcast(String message) {
        int successCount = 0;
        for (Map.Entry<String, SseEmitter> entry : userConnections.entrySet()) {
            String userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(message + " - " + System.currentTimeMillis()));
                successCount++;
            } catch (IOException e) {
                log.error("广播消息给用户 {} 失败，移除连接", userId, e);
                removeConnection(userId);
            }
        }
        log.info("广播消息完成，成功推送 {} / {} 个客户端", successCount, userConnections.size());
        return successCount;
    }

    /**
     * 发送系统通知
     */
    public int sendSystemNotice(String notice) {
        int successCount = 0;
        for (Map.Entry<String, SseEmitter> entry : userConnections.entrySet()) {
            String userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event()
                        .name("system")
                        .data("系统通知：" + notice));
                successCount++;
            } catch (IOException e) {
                log.error("发送系统通知给用户 {} 失败，移除连接", userId, e);
                removeConnection(userId);
            }
        }
        return successCount;
    }

    /**
     * 向所有客户端发送心跳 ping
     */
    public void sendHeartbeatPing() {
        String pingData = "ping_" + System.currentTimeMillis();
        for (Map.Entry<String, SseEmitter> entry : userConnections.entrySet()) {
            String userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data(pingData));
                log.trace("心跳已发送给用户 {}", userId);
            } catch (IOException e) {
                log.error("发送心跳给用户 {} 失败，移除连接", userId, e);
                removeConnection(userId);
            }
        }
    }

    /**
     * 定时扫描并清理心跳超时的连接
     */
    @Scheduled(fixedDelay = 30_000) // 每30秒扫描一次
    public void cleanDeadConnections() {
        long now = System.currentTimeMillis();
        List<String> deadUsers = new ArrayList<>();
        for (Map.Entry<String, Long> entry : lastHeartbeatTime.entrySet()) {
            String userId = entry.getKey();
            long lastTime = entry.getValue();
            if (now - lastTime > HEARTBEAT_TIMEOUT_MS) {
                deadUsers.add(userId);
                log.warn("用户 {} 心跳超时（最后响应时间：{} ms前），即将断开", userId, now - lastTime);
            }
        }
        for (String userId : deadUsers) {
            removeConnection(userId);
        }
        if (!deadUsers.isEmpty()) {
            log.info("本次清理了 {} 个心跳超时的连接", deadUsers.size());
        }
    }

    /**
     * 移除指定用户的连接
     */
    private void removeConnection(String userId) {
        SseEmitter emitter = userConnections.remove(userId);
        if (emitter != null) {
            emitter.complete();
        }
        lastHeartbeatTime.remove(userId);
        log.info("用户 {} 的连接已移除，当前剩余连接数: {}", userId, userConnections.size());
    }
}
```

### 心跳检测（保持连接活跃） ###

```java
package net.cmono.xiyue.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class HeartbeatScheduler {

    private final ConnectionManager connectionManager;

    // 每 25 秒向所有客户端发送一次心跳 ping
    @Scheduled(fixedRate = 25_000)
    public void sendHeartbeat() {
        connectionManager.sendHeartbeatPing();
        log.debug("已向所有客户端发送心跳检测");
    }
}
```

## 四、不同方案的对比总结 ##

|  方案   |      优点 |  缺点   |      适用场景 |
| :-----------: | :-----------: | :-----------: | :-----------: |
| SSE | 简单易用、自动重连、HTTP协议友好  | 只能服务器到客户端单向 | 实时通知、新闻推送、股票行情  |
| WebSocket | 双向通信、实时性最好  | 实现复杂、需要额外协议 | 聊天室、在线游戏、协同编辑  |
| 长轮询 | 兼容性好、实现简单  | 延迟高、服务器压力大 | 兼容性要求高的老系统  |
| 短轮询 | 极其简单、无状态  | 实时性差、资源浪费 | 更新频率低的应用  |

## 五、总结：让服务器"开口说话"的艺术 ##

通过这次探索，我们给SpringBoot服务器装上了"嘴巴"，让它学会了主动和客户端聊天！总结一下关键点：

- SSE是你的好朋友 - 对于服务器向客户端的单向推送，SSE简单到让人感动
- 连接管理很重要 - 记得及时清理断开的连接，不然服务器内存会"爆炸"
- 错误处理不能忘 - 网络世界充满了不确定性，要优雅地处理各种异常
- 心跳检测保活力 - 定期发送心跳，防止连接被防火墙误杀
- 生产环境要优化 - 记得添加认证、限流、集群支持等

推送消息就像谈恋爱，不能太频繁（用户会烦），也不能太冷淡（用户会跑），要掌握好节奏！而且千万别"已读不回"，那比不推送还糟糕！

现在，你的服务器已经从"闷葫芦"变成了"社交达人"，快去让它和客户端愉快地聊天吧！记住：好的推送系统，应该是用户感觉不到它的存在，但需要时它永远在那里！
