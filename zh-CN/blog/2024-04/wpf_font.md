---
lastUpdated: true
commentabled: true
recommended: true
title:  WPF 字体渲染
description: WPF 字体渲染
date: 2024-04-30 15:25:00
pageClass: blog-page-class
---

# WPF 字体渲染 #

WPF4对字体渲染做了很大的改善，增加了`TextOptions`属性，该属性可以设置`TextFormattingMode`，`TextRenderingMode`，`TextHintingMode`

## TextFormattingMode ##

它提供了两种设置：

- Ideal  —— WPF4之前的模式
- Display —— 新的模式，可以使字体显示更清晰

（一般将TextFormattingMode设置为Display，可以提高字体显示的清晰度）

## TextRenderingMode ##

设置渲染模式，可以有以下设置：

- Auto – This mode will use ClearType unless system settings have been set to specifically disable ClearType on the machine.
- Aliased – No antialiasing will be used to draw text.
- Grayscale – Grayscale antialiasing will be used to draw text.
- ClearType – ClearType antialising will be used to draw text.

（一般用ClearType渲染出来的字体会比较平滑）

## TextHintingMode ##

获取或设置一个值，该值影响文本元素的呈现行为，这是一种性能优化方式，当您对文本元素的任何文本属性进行动画处理时，可以使用此方式。

此属性的值采用以下两种可能的值：

- Animated 通过使用一个更高效、但视觉精确下降的平滑算法来针对动画进行优化。（文本仍然是可读的；精度损失并不严重。）
- Fixed（默认值）使用的算法针对视觉上精确的字体平滑效果进行了优化，但当将动画应用于字体元素的属性时，可能导致性能问题以及抖动，尤其是对于 FontSize 或转换/定位/投影。

（在需要对字体做一些动态效果，例如将字体缩放时，使用Animated能获取较高的性能，但同时也影响了其显示的清晰度）

## 东亚字体的渲染 ##

WPF4.0中同时针对东亚字体的渲染进行了优化，现在它支持点阵字体了，而开启这个新特性十分简单，只需为FontFamily设置一种点阵字体就可以了

以下是一张推荐设置表:

| Language            | Font      |
| ------------------- | --------- |
| Traditional Chinese | MingLiu   |
| Simplified Chinese  | SimSun    |
| Japanese            | MS Gothic |
| Korean              | Gulium    |
| Korean              | Batang    |


| Column 1          |        Column 2        |               Column 3 |
| :---------------- | :--------------------: | ---------------------: |
| centered 文本居左 | right-aligned 文本居中 | right-aligned 文本居右 |
