---
lastUpdated: true
commentabled: true
recommended: true
title: Electron判断是内置摄像头还是接摄像头
description: Electron判断是内置摄像头还是接摄像头
date: 2026-07-22 11:25:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

## 前言

在 `Electron` 中使用摄像头时，经常需要区分「内置摄像头」和「外接摄像头」。但是 `navigator.mediaDevices.enumerateDevices()` 只提供 `label`、`deviceId` 等，不直接标明内置/外接。所以需要原生模块来判断是内置还是外接摄像头。

Windows和Mac的实现思路不一样。

后面有代码，也有npm包。

## Windows

在Windows系统中可以使用设备安装日期做判断：内置摄像头多为随系统或整机出厂时安装（安装日期较早），外接摄像头多为用户后来插上（安装日期较晚）。还可以配合系统安装时间，工厂预装系统时会同时安装内置摄像头驱动，因此内置摄像头的安装日期通常早于或等于系统安装日期；而外接摄像头是用户后续插入的，安装日期晚于系统安装日期。

## Mac

在Mac系统中可以使用系统给出的 `deviceType` 直接区分内置（BuiltIn）与外置（External）。

比如：`AVCaptureDeviceTypeBuiltInWideAngleCamera`（内置广角摄像头）和
`AVCaptureDeviceTypeExternal`（外置设备）

具体可以查看官方的类型文档：[developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct](https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct?language=objc)

## 结尾

引入原生模块，然后在Electron中根据不同的平台，使用不同的字段来区分「内置摄像头」和「外接摄像头」。

原生模块的实现源码地址：[zt-camera-recognition](https://github.com/lzt-T/zt-camera-recognition)

npm包地址：[zt-camera-recognition](https://www.npmjs.com/package/zt-camera-recognition)

感兴趣的可以去试试
