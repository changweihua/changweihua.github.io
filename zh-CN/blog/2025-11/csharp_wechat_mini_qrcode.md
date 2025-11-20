---
lastUpdated: true
commentabled: true
recommended: true
title: C#后端接口返回小程序二维码
description: C#后端接口返回小程序二维码
date: 2025-11-20 10:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

在C#后端接口中返回小程序二维码，通常需要调用微信官方的“获取小程序码”接口，然后将生成的二维码图片流返回给前端。

以下是实现步骤和代码示例：

## 一、准备工作 ##

### 获取小程序Access Token ###

调用微信接口需要先获取 `access_token`（有效期2小时），接口地址：`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET`（`APPID` 和 `APPSECRET` 在微信公众平台获取）

### 调用微信生成二维码接口 ###

推荐使用“获取不限制的小程序码”接口（适用于需要大量生成二维码的场景）：

`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=ACCESS_TOKEN`

## 二、后端接口实现（ASP.NET Core为例） ##

### 工具类：获取 Access Token ###

```csharp
public class WeChatHelper
{
    private readonlystring _appId;
    private readonlystring _appSecret;

    public WeChatHelper(string appId, string appSecret)
    {
        _appId = appId;
        _appSecret = appSecret;
    }

    ///<summary>
    /// 获取Access Token
    ///</summary>
    public async Task<string> GetAccessTokenAsync()
    {
        using var httpClient = new HttpClient();
        var url = $"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={_appId}&secret={_appSecret}";
        var response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadAsStringAsync();
        var json = JObject.Parse(result);
        if (json.ContainsKey("errcode"))
        {
            throw new Exception($"获取Access Token失败：{json["errmsg"]}");
        }
        return json["access_token"].ToString();
    }
}
```

### 接口：生成并返回二维码 ###

```csharp
[ApiController]
[Route("api/[controller]")]
public class QrCodeController : ControllerBase
{
    private readonly WeChatHelper _weChatHelper;

    // 从配置文件注入APPID和APPSECRET（建议通过配置文件管理）
    public QrCodeController(IConfiguration configuration)
    {
        var appId = configuration["WeChat:AppId"];
        var appSecret = configuration["WeChat:AppSecret"];
        _weChatHelper = new WeChatHelper(appId, appSecret);
    }

    ///<summary>
    /// 生成小程序二维码
    ///</summary>
    ///<param name="scene">场景值（如：userId=123）</param>
    ///<param name="page">小程序页面路径（如：pages/index/index）</param>
    [HttpGet("wxacode")]
    public async Task<IActionResult> GetWxaCode(string scene, string page = "pages/index/index")
    {
        try
        {
            // 1. 获取Access Token
            var accessToken = await _weChatHelper.GetAccessTokenAsync();

            // 2. 调用微信生成二维码接口
            using var httpClient = new HttpClient();
            var url = $"https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token={accessToken}";

            // 构建请求参数（详细参数见微信文档）
            var requestData = new
                {
                    scene = scene,       // 场景值，必填
                    page = page,         // 页面路径，可选（默认首页）
                    width = 430,         // 二维码宽度，可选（默认430）
                    auto_color = false,  // 是否自动配置线条颜色
                    line_color = new { r = 0, g = 0, b = 0 }, // 线条颜色（auto_color为false时生效）
                    is_hyaline = false// 是否透明底色
                };

            var jsonData = JsonConvert.SerializeObject(requestData);
            var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync(url, content);

            // 3. 处理返回结果（微信接口成功返回图片流，失败返回JSON）
            if (response.Content.Headers.ContentType.MediaType == "image/jpeg")
                        {
            // 成功：返回图片流
            var stream = await response.Content.ReadAsStreamAsync();
            return File(stream, "image/jpeg");
                }
            else
            {
                // 失败：解析错误信息
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { message = "生成二维码失败", detail = error });
             }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
```

## 三、配置文件（appsettings.json） ##

```json
{
    "WeChat": {
        "AppId": "你的小程序APPID",
        "AppSecret": "你的小程序APPSECRET"
    }
}
```

## 四、前端调用（小程序示例） ##

```js
// 调用后端接口获取二维码
wx.request({
    url: 'https://你的域名/api/QrCode/wxacode',
    data: {
    scene: 'userId=123', // 场景值
        page: 'pages/detail/detail'// 跳转页面
      },
    responseType: 'arraybuffer', // 关键：指定返回二进制流
      success: (res) => {
    // 将二进制流转为图片URL
    const imageUrl = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(res.data);
    // 在页面中显示
    this.setData({ qrCodeUrl: imageUrl });
  }
});
```

## 五、注意事项 ##

**Access Token缓存**：`access_token` 有效期2小时，建议缓存（如用Redis）避免频繁调用接口。

**场景值限制**：`scene` 参数长度不能超过32个字符，可用于传递业务标识（如用户ID）。

**页面路径权限**：`page` 参数指定的页面必须在小程序“已配置的页面路径”中，否则二维码无法跳转。

**接口频率限制**：微信接口有调用频率限制，大量生成时需注意控制频率。
