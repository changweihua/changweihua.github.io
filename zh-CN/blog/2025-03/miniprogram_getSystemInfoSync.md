---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序项目 wx.getSystemInfoSync 接口弃用问题
description: 微信小程序项目 wx.getSystemInfoSync 接口弃用问题：wx.getSystemInfoSync is deprecated.
date: 2025-03-17 10:00:00
pageClass: blog-page-class
---

# 微信小程序项目 wx.getSystemInfoSync 接口弃用问题 #

## 问题描述 ##

在微信小程序项目中，出现如下警告信息

```txt
wx.getSystemInfoSync is deprecated.
Please use wx.getSystemSetting/wx.getAppAuthorizeSetting/wx.getDeviceInfo/wx.getWindowInfo/wx.getAppBaseInfo instead.
```
> 翻译
> wx.getSystemInfoSync 已弃用
> 请改用 wx.getSystemSetting/wx.getAppAuthorizeSetting/wx.getDeviceInfo/wx.getWindowInfo/wx.getAppBaseInfo

## 问题原因 ##

微信小程序项目中使用了已经被标记为废弃的 wx.getSystemInfoSync 接口

微信小程序官方推荐使用新的替代接口来获取系统信息

## 处理策略 ##

### 获取设备信息 ###

获取设备信息：使用 wx.getDeviceInfo() 替代 wx.getSystemInfoSync 中与设备相关的内容

```ts
const deviceInfo = wx.getDeviceInfo()

console.log(deviceInfo.abi)
console.log(deviceInfo.benchmarkLevel)
console.log(deviceInfo.brand)
console.log(deviceInfo.model)
console.log(deviceInfo.platform)
console.log(deviceInfo.system)
```

### 获取窗口信息 ###

获取窗口信息：使用 wx.getWindowInfo() 替代 wx.getSystemInfoSync 中与窗口相关的内容

```ts
const windowInfo = wx.getWindowInfo()

console.log(windowInfo.pixelRatio)
console.log(windowInfo.screenWidth)
console.log(windowInfo.screenHeight)
console.log(windowInfo.windowWidth)
console.log(windowInfo.windowHeight)
console.log(windowInfo.statusBarHeight)
console.log(windowInfo.safeArea)
console.log(windowInfo.screenTop)
```

### 获取应用基础信息 ###

获取应用基础信息：使用 wx.getAppBaseInfo() 替代 wx.getSystemInfoSync 中与应用基础相关的内容

```ts
const appBaseInfo = wx.getAppBaseInfo()

console.log(appBaseInfo.SDKVersion)
console.log(appBaseInfo.enableDebug)
console.log(appBaseInfo.host)
console.log(appBaseInfo.language)
console.log(appBaseInfo.version)
console.log(appBaseInfo.theme)
```

### 获取系统设置 ###

获取系统设置：使用 wx.getSystemSetting() 替代 wx.getSystemInfoSync 中与系统设置相关的内容

```ts
const systemSetting = wx.getSystemSetting()

console.log(systemSetting.bluetoothEnabled)
console.log(systemSetting.deviceOrientation)
console.log(systemSetting.locationEnabled)
console.log(systemSetting.wifiEnabled)
```

### 获取应用授权设置 ###

获取应用授权设置：使用 wx.getAppAuthorizeSetting() 替代 wx.getSystemInfoSync 中与应用授权设置相关的内容

```ts
const appAuthorizeSetting = wx.getAppAuthorizeSetting()

console.log(appAuthorizeSetting.albumAuthorized)
console.log(appAuthorizeSetting.bluetoothAuthorized)
console.log(appAuthorizeSetting.cameraAuthorized)
console.log(appAuthorizeSetting.locationAuthorized)
console.log(appAuthorizeSetting.locationReducedAccuracy)
console.log(appAuthorizeSetting.microphoneAuthorized)
console.log(appAuthorizeSetting.notificationAlertAuthorized)
console.log(appAuthorizeSetting.notificationAuthorized)
console.log(appAuthorizeSetting.notificationBadgeAuthorized)
console.log(appAuthorizeSetting.notificationSoundAuthorized)
console.log(appAuthorizeSetting.phoneCalendarAuthorized)
```
