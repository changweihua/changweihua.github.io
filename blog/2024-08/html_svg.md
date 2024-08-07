---
lastUpdated: true
commentabled: true
recommended: true
title: 动态创建DOM元素（包括动态创建svg元素）
description: 动态创建DOM元素（包括动态创建svg元素）
date: 2024-08-06 12:18:00
pageClass: blog-page-class
---

# 动态创建DOM元素（包括动态创建svg元素） #

## 问题由来 ##

在某项目中，我需要在svg标签中插入circle元素，最初按照往常使用createElement来创建，结果发现创建成功了，dom中也插入成功了，但就是在页面中不显示。

创建svg元素需要使用createElementNS，在第一个参数传入字符串’http://www.w3.org/2000/svg’

这是由于，svg严格来说不属于HTML5元素，属于XML标准。

svg元素一般通过setAttribute方法来设置属性值。

## svg介绍 ##

svg全称为：scalable vector graphics，意为可伸缩矢量图形。
是一种用XML描述图形的标记语言。

svg特点：

- svg提供了各种类型的元素，包括形状、文本、渐变、动画、滤镜等
- 可以为每个元素附加DOM事件
- 能用css控制它们的样式，不过只有部分css样式可以使用，例如border、background不能使用
- svg可以插入img元素，执行裁剪、遮罩、旋转，不过svg不能像Canvas那样，将处理过的图形输出。

Canvas有一个toDataURL方法，可以将画布中的内容编码成字符串形式。

动态创建DOM元素方法封装：

```javascript $(1#)
insertElement(tagName,options,father){
    var svgTags=['svg','g','path','filter','animate','marker','line','polyline','rect','circle','ellipse','polygon'];
    let newElement;
    if(svgTags.indexOf(tagName)>=0){
      newElement = document.createElementNS("http://www.w3.org/2000/svg",tagName);
    }else{
      newElement=document.createElement(tagName);
    }
    if(options){
      if(options.css){
        newElement.style.cssText=options.css;
      }
      if(options.props){
        for(var key in options.props){
          newElement.setAttribute(key,options.props[key])
        }
      }
    }
    if(father){
      father.appendChild(newElement);
    }
    return newElement;
  }
```
