---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot 对接发送钉钉消息，消息内容带图片
description: SpringBoot 对接发送钉钉消息，消息内容带图片
date: 2026-09-15 08:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在Spring Boot应用中向钉钉发送带图片的消息，主要有两种主流实现方式：一种是使用机器人Webhook发送包含图片链接的消息，另一种是通过钉钉开放平台SDK发送图片消息。

下面我为你详细说明这两种方法的实现步骤。

## 两种发送钉钉图片消息的方案对比 ##

| 方案类型 | 实现方式 | 图片处理 | 适用场景 | 主要限制 |
| :--- | :--- | :--- | :--- | :--- |
| 机器人Webhook方案 | 通过群机器人Webhook发送图文消息 | 图片需先上传至公网可访问的URL | 群聊通知、监控告警 | 图片需公网可访问；每分钟限20条 |
| 钉钉SDK方案 | 使用官方SDK上传媒体文件并发送 | 图片上传至钉钉服务器获取media_id | 企业内部应用、精确到人 | 需要企业应用权限；流程更复杂 |

## 📌 方案一：使用钉钉机器人Webhook发送图文消息 ##

这是最常用和简便的方法，适合向钉钉群发送带图片的通知消息。

### 创建钉钉群机器人 ###

首先需要在钉钉群中创建自定义机器人：

- 进入钉钉群设置 → 智能群助手 → 添加机器人 → 自定义
- 记录生成的Webhook地址和加签密钥（如有安全设置）

### 添加Maven依赖 ###

根据不同的starter库，可以选择以下依赖之一：

```xml
<!-- 方案A: snowheart的starter -->
<dependency>
    <groupId>cn.snowheart</groupId>
    <artifactId>spring-boot-dingtalk-robot-starter</artifactId>
    <version>1.0.3.RELEASE</version>
</dependency>

<!-- 方案B: javafamily的starter -->
<dependency>
    <groupId>club.javafamily</groupId>
    <artifactId>dingtalk-notification-spring-boot-starter</artifactId>
    <version>2.3.2-beta.13</version>
</dependency>
```

### 配置Webhook参数 ###

在 `application.yml` 中配置机器人信息：

```yml
# 如果使用snowheart的starter
dingtalk:
  robot:
    prefix: https://oapi.dingtalk.com/robot/send
    access-token: your_access_token_here
    secret:
      secret-enabled: true
      secret-token: your_secret_here

# 如果使用javafamily的starter
javafamily:
  notify:
    dingtalk:
      hook-url: https://oapi.dingtalk.com/robot/send?access_token=your_token
      enabled: true
```

### 实现图片消息发送 ###

以下是几种常见的带图片消息类型的实现代码：

#### 发送Link消息（图片+标题+描述） ####

```java
@RestController
public class DingTalkController {

    @Autowired
    private DingTalkRobotClient dingTalkRobotClient; // snowheart starter

    /**
     * 发送带图片的Link消息
     */
    @GetMapping("/sendLinkMessage")
    public void sendLinkMessageWithImage() {
        // 图片必须先上传到公网可访问的URL
        String imageUrl = "https://example.com/your-image.jpg";
        String title = "系统监控告警";
        String text = "服务器CPU使用率超过90%，请及时处理！";
        String messageUrl = "http://your-system.com/detail"; // 点击跳转链接

        LinkMessage linkMessage = new LinkMessage(title, text, imageUrl, messageUrl);
        DingTalkResponse response = dingTalkRobotClient.sendLinkMessage(linkMessage);

        if (response.getErrcode().longValue() == 0L) {
            System.out.println("Link消息发送成功");
        }
    }
}
```

#### 发送Markdown消息（图片嵌入正文） ####

```java
/**
 * 发送Markdown格式的图片消息
 */
@GetMapping("/sendMarkdownWithImage")
public void sendMarkdownWithImage() {
    String imageUrl = "https://example.com/chart.png";

    String markdownText = "### 业务数据报表\n\n" +
                         "最新业务数据统计图如下：\n\n" +
                         "![业务图表](" + imageUrl + ")\n\n" +
                         "**统计时间：** " + new Date();

    MarkdownMessage markdownMessage = new MarkdownMessage(
        "业务数据通知",
        markdownText
    );

    DingTalkResponse response = dingTalkRobotClient.sendMarkdownMessage(markdownMessage);

    if (response.getErrcode().longValue() == 0L) {
        System.out.println("Markdown消息发送成功");
    }
}
```

#### 使用javafamily starter发送消息 ####

```java
@SpringBootTest
public class DingTalkNotifyTests {

    @Autowired
    private DingTalkNotifyHandler dingTalkNotifyHandler; // javafamily starter

    @Test
    void testNotifyLinkMessage() {
        String imageUrl = "https://example.com/image.jpg";

        DingTalkLinkRequest request = DingTalkLinkRequest.of(
            "系统通知",
            "发现异常请求，请及时查看处理",
            "https://your-system.com/detail",
            imageUrl
        );

        String response = dingTalkNotifyHandler.notify(request);
        System.out.println("发送结果：" + response);
    }
}
```

## 📌 方案二：使用钉钉官方SDK发送图片消息 ##

这种方法适合企业内部应用，需要用户授权，可以发送给指定用户。

### 添加官方SDK依赖 ###

```xml
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>alibaba-dingtalk-service-sdk</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 实现图片上传和发送 ###

```java
@Component
public class DingTalkService {

    @Value("${dingding.app-key}")
    private String appKey;

    @Value("${dingding.app-secret}")
    private String appSecret;
    @Value("${dingding.agent-id}")
    private Long agentId;

    /**
     * 获取AccessToken
     */
    public String getAccessToken() throws ApiException {
        DingTalkClient client = new DefaultDingTalkClient("https://oapi.dingtalk.com/gettoken");
        OapiGettokenRequest request = new OapiGettokenRequest();
        request.setAppkey(appKey);
        request.setAppsecret(appSecret);
        request.setHttpMethod("GET");

        OapiGettokenResponse response = client.execute(request);
        return response.getAccessToken();
    }

    /**
     * 上传图片并发送
     */
    public void sendImageMessage(String userId, String imageUrl) throws ApiException {
        String accessToken = getAccessToken();

        // 1. 先上传图片获取media_id
        String mediaId = uploadImage(accessToken, imageUrl);

        // 2. 发送图片消息
        DingTalkClient client = new DefaultDingTalkClient(
            "https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2");

        OapiMessageCorpconversationAsyncsendV2Request req = new OapiMessageCorpconversationAsyncsendV2Request();
        req.setAgentId(agentId);
        req.setUseridList(userId);

        OapiMessageCorpconversationAsyncsendV2Request.Msg msg =
            new OapiMessageCorpconversationAsyncsendV2Request.Msg();
        msg.setMsgtype("image");

        msg.setImage(new OapiMessageCorpconversationAsyncsendV2Request.Image());
        msg.getImage().setMediaId(mediaId);

        req.setMsg(msg);

        OapiMessageCorpconversationAsyncsendV2Response rsp = client.execute(req, accessToken);
        if (rsp.getErrcode() != 0) {
            throw new RuntimeException("发送失败：" + rsp.getErrmsg());
        }
    }

    /**
     * 上传图片到钉钉服务器
     */
    private String uploadImage(String accessToken, String imageUrl) throws ApiException {
        DingTalkClient client = new DefaultDingTalkClient("https://oapi.dingtalk.com/media/upload");
        OapiMediaUploadRequest request = new OapiMediaUploadRequest();
        request.setType("image");

        // 需要下载图片并上传
        FileItem item = new FileItem(new URL(imageUrl).openStream());
        request.setMedia(item);

        OapiMediaUploadResponse response = client.execute(request, accessToken);
        return response.getMediaId();
    }
}
```

## ⚠️ 重要注意事项 ##

### 图片处理要点 ###

​- ​图片URL必须公网可访问​​：钉钉机器人需要从公网下载图片进行展示
​- ​图片格式支持​​：支持JPG、PNG等常见格式，建议图片大小不超过2MB
​- ​图片缓存​​：钉钉会对图片进行缓存，相同URL的图片可能不会实时更新

### 安全限制 ###

​- ​频率限制​​：每个机器人每分钟最多发送20条消息
​- ​安全设置​​：支持自定义关键词、加签、IP白名单等安全措施
​- ​token保护​​：Webhook中的access_token要妥善保管，避免泄露

## 实际应用示例：监控告警带图表 ##

```java
@Service
public class MonitorAlertService {

    @Autowired
    private DingTalkRobotClient dingTalkRobotClient;

    public void sendAlertWithChart(String alertMsg, String chartImageUrl) {
        String markdownContent = "### 🚨 系统监控告警\n\n" +
                               "**告警信息：** " + alertMsg + "\n\n" +
                               "**趋势图表：** \n\n" +
                               "![监控图表](" + chartImageUrl + ")\n\n" +
                               "**时间：** " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

        MarkdownMessage message = new MarkdownMessage("系统监控告警", markdownContent);

        // @所有人
        message.setIsAtAll(true);

        DingTalkResponse response = dingTalkRobotClient.sendMarkdownMessage(message);

        if (response.getErrcode() == 0) {
            System.out.println("告警消息发送成功");
        }
    }
}
```

## 💎 方案选择建议 ##

​- ​对于群通知和监控告警​​，推荐使用​​方案一（机器人Webhook）​​，配置简单，适合向群内发送带图表的通知
​- ​对于企业内部精准推送​​，需要​​方案二（官方SDK）​​，可以指定接收人并确保消息送达
- ​图片准备​​：确保图片已上传至公网可访问的图床或自有CDN


根据你的具体场景选择合适的方案，即可实现Spring Boot应用向钉钉发送带图片的消息。
