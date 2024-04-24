---
lastUpdated: true
commentabled: true
recommended: true
title:  微信小程序用户隐私保护指引
description: 微信小程序用户隐私保护指引
date: 2024-04-24 13:25:00
pageClass: blog-page-class
---

# 微信小程序用户隐私保护指引 #

## 背景 ##

切换到个人未认证的小程序后无法选中照片上传，苦寻无果。

上 Github 一番操作猛如虎，结果发现二十五，果断回退基础课至版本 `2.30.4`。高于 `2.33.0` 都需要通过隐私政策。

[Issue2628](https://github.com/Tencent/tdesign-miniprogram/issues/2628)

在做选择图片上传时调起该接口时无法调起系统相册，开发工具和真机测试都是一样无法调起相册。且返回报错内容如下：
`chooseMedia:fail api scope is not declared in the privacy agreement` 没有在控制台输出，这里会触发 fail 事件，可以绑定事件做业务处理。

## 原因及方案 ##

chooseMedia：隐私协议中未声明该api作用域


![错误预览图](/images/cmono-QQ截图20240424130333.png){data-zoomable}

[帮助链接](https://blog.csdn.net/weixin_43018356/article/details/134111826)


## 最终效果 ##

![效果预览图](/images/cmono-IMG_0884.png){data-zoomable}

> 注意：之前我调低了基础库，并推送到我的手机上测试是可以调起相册的，但是低版本的基础库是无法推送到正式版的！
> 所以最终的解决方案还是得更新隐私政策而且通过审核才能调起相册。
