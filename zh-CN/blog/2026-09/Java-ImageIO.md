---
lastUpdated: true
commentabled: true
recommended: true
title: Java 图片处理还在用 ImageIO？
description: 这个库让你代码从 30 行变 3 行
date: 2026-09-15 09:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

## 引言 ##

在 Java 开发中，图片处理是一个高频需求——用户头像裁剪、商品缩略图生成、图片压缩瘦身、水印添加等场景无处不在。Java 原生提供了 ImageIO 和 BufferedImage 等 API 来处理图像，但代码冗长、易出错、效果一般。

Thumbnailator 是一个专为缩略图生成设计的开源 Java 类库，以极简的链式 API 和出色的处理效果著称。本文将系统介绍 Thumbnailator 的使用方法.

## 简介 ##

Thumbnailator 是一个用于生成图像缩略图的 Java 开源类库，由 Chris Kroells 开发，托管于 GitHub，采用 MIT 许可证。它的设计哲学是"简洁即美"——用一行链式调用替代原生 ImageIO 几十行的繁琐代码。

在GitHub已经收获了5.4k的star。虽然已经很多时间没有更新了，但是足够我们使用了，目前最新版本0.4.21， 发布于2025年。

## 快速开始 ##

### Maven依赖 ###

```xml
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.21</version>
</dependency>
```

### 生成缩略图 ###


```java
@Test
void test01() throws IOException {
        Thumbnails.of(imagePath)
                .size(200, 200)
                .toFile(targetBasePath + "ygyz_200x200.jpg");
}
```


还可以配合比例缩放、强制指定尺寸等：

```java
// 方式二：按比例缩放
Thumbnails.of("input.jpg")
    .scale(0.5)          // 缩放为原图的 50%
    .toFile("scaled.jpg");

// 方式三：强制指定尺寸（可能变形）
Thumbnails.of("input.jpg")
    .size(200, 200)
    .keepAspectRatio(false)
    .toFile("forced.jpg");
```

### 质量控制与格式转换 ###

```java
@Test
void test02() throws IOException{
    Thumbnails.of(imagePath)
            .scale(1.0)                    // 保持原尺寸
            .outputFormat("png")           // 输出格式
            .outputQuality(0.8)            // JPEG 质量 80%
            .toFile(targetBasePath + "ygyz_80.png");
}
```

### 添加水印 ###

```java
@Test
void test03() throws IOException{
    BufferedImage watermark = ImageIO.read(new File(watermarkPath));

    Thumbnails.of(imagePath)
            .size(1024, 768)
            .watermark(Positions.BOTTOM_RIGHT, watermark, 0.5f)  // 位置、水印图、透明度
            .outputQuality(0.9)
            .toFile(targetBasePath + "watermarked.jpg");
}
```

### 旋转图片 ###

```java
@Test
void test04() throws IOException{
    Thumbnails.of(imagePath)
            .size(800, 600)
            .rotate(90)                    // 顺时针旋转 90 度
            .toFile(targetBasePath +"rotated.jpg");
}
```

### 区域裁剪 ###

```java
@Test
void test05() throws IOException{
    // 从中心裁剪 400x400 区域，再缩放为 200x200
    Thumbnails.of(imagePath)
            .sourceRegion(Positions.CENTER, 400, 400)
            .size(200, 200)
            .keepAspectRatio(false)
            .toFile(targetBasePath + "cropped.jpg");
}
```

## 小结 ##

Thumbnailato 是 Java 生态中图片缩略图生成的首选工具库，它用极简的链式 API 封装了 ImageIO 和 Java2D 的底层复杂性，让开发者能用一行代码完成原生 API 几十行才能实现的功能。
