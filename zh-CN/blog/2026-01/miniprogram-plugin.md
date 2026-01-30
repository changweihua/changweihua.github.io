---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序插件从发布到使用的完整实战指南
description: 微信小程序插件从发布到使用的完整实战指南
date: 2026-01-30 13:45:00 
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

## 一、概念篇：插件是什么 ##

微信小程序的**插件（plugin）**是一种模块化复用机制。开发者可以将一个功能封装成插件，供其他小程序调用。例如常见的有「视频播放器插件」「地图定位插件」「支付工具插件」等。

**📌 特点**：

- 插件 *不能独立运行*；
- 插件必须通过 *宿主小程序引用后* 才能使用；
- 插件可以暴露组件、接口、页面供调用；
- 插件更新后可发布新版本供他人升级。

## 二、原理篇：插件与宿主小程序的关系 ##

插件的运行机制是*「宿主小程序 → 调用插件接口/组件」*。

宿主在 `app.json` 中声明依赖，微信框架会在编译阶段将插件资源合并加载。

调用链如下：

```txt
宿主小程序 page.wxml → 插件组件 → 插件逻辑层（plugin/index.js） → 微信宿主环境
```

因此，插件和宿主的小程序在逻辑上隔离，但在运行时通过接口通信。

## 三、实践篇（上）：发布插件步骤 ##

### 1️⃣ 创建插件项目 ###

在开发者工具中新建项目，选择：**·项目类型：插件·**

配置文件 `project.config.json`：

```json:project.config.json
{
  "appid": "wx05dfcd468442088e",
  "compileType": "plugin",
  "pluginRoot": "plugin"
}
```

### 2️⃣ 编写插件结构 ###

项目结构示例：

```txt
plugin/
 ├─ components/
 │   └─ video-player/
 │       ├─ video-player.wxml
 │       ├─ video-player.wxss
 │       ├─ video-player.js
 │       └─ video-player.json
 ├─ index.js
 └─ plugin.json
```

**plugin.json**

```json
{
  "publicComponents": {
    "video-player": "components/video-player/video-player"
  },
  "publicMethods": {
    "play": "index.play"
  }
}
```

**index.js**

```javascript
function play() {
  console.log("播放视频中……");
}
module.exports = {
  play
};
```

### 3️⃣ 上传并发布插件 ###

- 登录 [微信公众平台 → 小程序 → 开发 → 插件管理]
- 点击「上传插件版本」
- 填写版本号（如 1.0.0）与描述
- 提交审核
- 审核通过后即可发布插件。

## 四、实践篇（下）：在其他小程序中使用插件 ##

下面重点讲解——*如何在其他小程序使用你发布的插件*。

### 添加插件依赖 ###

在宿主小程序的后台（公众平台 → 开发 → 插件管理）中添加插件 AppId。

例如你要使用的插件：

```txt
AppID：wx05dfcd468442088e
插件版本：1.0.0
```

### 配置 app.json ###

```json
{
  "plugins": {
    "videoProxy": {
      "version": "1.0.0",
      "provider": "wx05dfcd468442088e"
    }
  }
}
```

解释：

- `videoProxy` 是插件引用名称；
- `provider` 是插件的 AppID；
- `version` 是要使用的插件版本号。

### 在页面中引入插件组件 ###

**index.json**

```json
{
  "usingComponents": {
    "plugin-video-player": "plugin://videoProxy/video-player"
  }
}
```

**index.wxml**

```xml
<view class="container">
  <plugin-video-player src="https://example.com/video.mp4"></plugin-video-player>
</view>
```

### 在 JS 文件中调用插件方法 ###

```ts
// 引用插件
const videoProxy = requirePlugin('videoProxy')

Page({
  onReady() {
    // 调用插件暴露的方法
    videoProxy.play()
  }
})
```

**解释**：

- `requirePlugin('videoProxy')` 获取插件对象；
- 通过插件中定义的 `publicMethods` 调用其方法。

### 插件的页面调用方式 ###

插件如果暴露了页面（如 `publicPages`），可以通过 `plugin://` 打开：

```ts
wx.navigateTo({
  url: 'plugin://videoProxy/video-page'
})
```

## 五、调试与常见问题 ##

| 问题   |   原因     |   解决方案 |
| :----------: | :----------: | :---------:  |
| `Component is not found in path` | 路径错误或插件未正确注册 | 检查 `plugin.json` 与 `usingComponents` |
| 插件无法调用方法 | 宿主小程序未 `requirePlugin` | 确保已在 JS 文件正确调用 |
| 模拟器启动失败 | 缺少 `provider` 或 `version` | app.json 插件配置必须完整 |
| 审核不通过 | 使用了禁止 API 或未备案资源 | 按审核意见修改后重新提交 |

## 六、拓展篇：插件版本与安全 ##

- 插件可维护多个版本，宿主可指定版本或自动升级；
- 插件中不能使用用户隐私相关 API；
- 可在后台限制哪些小程序可使用；
- 插件更新后宿主需要重新上传审核以同步。

## 七、总结 ##

微信小程序插件的使用流程可概括为：

- 插件开发并配置暴露接口；
- 在公众平台上传并发布；
- 宿主小程序后台添加插件；
- 在 `app.json` 声明插件；
- 页面引入并调用插件组件或方法。

这样，你就可以在多个小程序中共用同一功能模块，大大提升开发效率与一致性。

> 记录微信小程序原生截图功能，使用Skyline框架的snapshot

截图内容较复杂，不想使用canvas,微信官方有提供snapshot组件，调用其Snapshot.takeSnapshot方法实现。

> 注意：上线需AB 实验或直接如下配置app.json配灰度方案否则点击无效果

**配置 app.json**:

```json
{ 
  "lazyCodeLoading": "requiredComponents",
  "rendererOptions": {  "skyline": {
    "defaultDisplayBlock": true,
    "defaultContentBox": true,
    "tagNameStyleIsolation": "legacy",
    "enableScrollViewAutoSize": true,
    "disableABTest": true,
    "sdkVersionBegin": "3.0.1",
    "sdkVersionEnd": "15.255.255"
  }
}
```

**配置页面json**：

```json
{
  "renderer": "skyline",
  "componentFramework": "glass-easel",
  "disableScroll": true,
  "navigationStyle": "custom",
}
```

**页面实现js**：

```js
 takeSnapshot() {
        this.createSelectorQuery()
            .select("#targetArea")
            .node()
            .exec(res => {
                const node = res[0].node
                node.takeSnapshot({
                    type: 'arraybuffer',
                    format: 'png',
                    success: (res) => {
                        wx.showLoading({
                            title: '请稍后',
                          })
                        // 处理截图数据
                        const buffer = res.data
                        // 保存到本地文件
                        const filePath = `${wx.env.USER_DATA_PATH}/screenshot.png`
                        wx.getFileSystemManager().writeFile({
                            filePath,
                            data: buffer,
                            success: () => {
                                wx.saveImageToPhotosAlbum({
                                    filePath,
                                    success: function () {
                                        wx.showToast({
                                            title: "保存成功",
                                            icon: "success",
                                            duration: 2000,
                                        });
                                    },
                                    fail(err) {
                                        console.log(err);
                                        if (
                                            err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" ||
                                            err.errMsg === "saveImageToPhotosAlbum:fail auth deny" ||
                                            err.errMsg === "saveImageToPhotosAlbum:fail authorize no response"
                                        ) {
                                            wx.showModal({
                                                title: "提示",
                                                content: "需要您授权保存相册",
                                                success: (modalSuccess) => {
                                                    console.log(modalSuccess);
                                                    if(modalSuccess.confirm){
                                                        wx.openSetting({
                                                            success(settingdata) {
                                                                if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                                                                    wx.saveImageToPhotosAlbum({
                                                                        filePath,
                                                                        success: function () {
                                                                            wx.showToast({
                                                                                title: "保存成功",
                                                                                icon: "success",
                                                                                duration: 2000,
                                                                            });
                                                                        },
                                                                    });
                                                                } else {
                                                                    wx.showToast({
                                                                        title: "授权失败，请稍后重新获取",
                                                                        icon: "none",
                                                                        duration: 1500,
                                                                    });
                                                                }
                                                            },
                                                        });
                                                  }

                                                },
                                            });
                                        }
                                    },
                                });
                            },
                            complete:()=>{
                                wx.hideLoading()
                            }
                            
                        })
                    }
                })
            })
    },
```

**页面wxml**:

```xml
<snapshot mode="view" id="targetArea">
  </snapshot>
```
