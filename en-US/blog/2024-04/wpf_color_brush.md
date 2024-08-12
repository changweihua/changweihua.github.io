---
lastUpdated: true
commentabled: true
recommended: true
title:  WPF 各种颜色转换
description: WPF 各种颜色转换
date: 2024-04-30 13:25:00
pageClass: blog-page-class
---

# WPF 各种颜色转换 #

## 设置颜色 ##

```csharp
Color color = Color.FromArgb(透明度, red数字, green数字, blue数字); //这四个数字范围都是（0-255）
Color color = Color.FromRgb(red数字, green数字, blue数字);//默认透明度为255；
```

### String转换成Color ###

```csharp
Color color = (Color)ColorConverter.ConvertFromString(string);
```

### String转换成Brush ### 

```csharp
Brush brush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#555555"));
```

### Color转换成Brush ###

```csharp
Brush brush = new SolidColorBrush(color));
```

### Brush转换成Color ###

```csharp
Color color= (Color)ColorConverter.ConvertFromString(brush.ToString());
Color color= ((SolidColorBrush)CadColor.Background).Color;
```
