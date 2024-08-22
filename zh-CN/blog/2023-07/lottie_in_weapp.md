---
lastUpdated: true
commentabled: true
recommended: false
title: 过于单调的小程序页面，靠 Lottie 动画拯救
description: 过于单调的小程序页面，靠 Lottie 动画拯救
date: 2023-07
---

# 过于单调的小程序页面，靠 Lottie 动画拯救 #

## 背景 ##

最近给客户做小程序，直面C端的。

用户反馈页面比较单调，不够吸人眼球，又不能靠大标题。

那如何靠内容来闪亮眼睛呢，没错，就是今天的主角 Lottie 动画，既有动画效果，由体积不大，是最合适的解决方案。

## lottie-miniprogram ##

引入 `lottie-miniprogram` 包

## WXML ##

```html5
<canvas id="lottiejs-canvas" canvas-id="lottiejs-canvas" type="2d"></canvas>
```

## TypeScript ##

```ts
import lottie from 'lottie-miniprogram'
import animationData from '~/assets/jsons/party'

Page({
    onReady() {
    wx.createSelectorQuery().select('#lottiejs-canvas').fields({ node: true, size: true }).exec(res => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');

      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      lottie.setup(canvas);
      lottie.loadAnimation({
        loop: true,
        autoplay: true,
        animationData: animationData,
        //远程动画。一定要把json格式的文件放到服务器中，并且注意域名是合法的
        // path:"htttps//........a.json",
        rendererSettings: {
          context: ctx,
        },
      });
    });
  }
})
```

## 封装调用 ##

封装成方法，立省百分百

```ts
import lottie from 'lottie-miniprogram'

/**
 * @function json动画方法
 * @param {*} context this指向的对象
 * @param {*} id canvas的id选择器
 * @param {*} data 动画数据
 * @param {*} loop 是否循环播放
 * @param {*} autoplay 是否立即播放
 * @author 常伟华
 */
const jsonAnimation = function({
  context,
  id,
  data,
  loop = true,
  autoplay = true
}: {
  context: any
  id: string
  data: string | object
  loop: boolean
  autoplay: boolean
}) {
  wx.createSelectorQuery()
    .in(context)
    .select(id)
    .node((res) => {

      const width = res.node.width
      const height = res.node.height
      const canvas = res.node
      const lottieContext = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio

      canvas.width = width * dpr
      canvas.height = height * dpr
      lottieContext.scale(dpr, dpr)
      lottie.setup(canvas)
      lottie.loadAnimation({
        loop: loop,
        autoplay: autoplay,
        animationData: data,
        rendererSettings: {
          context: lottieContext
        }
      })
    })
    .exec()
}

export {
  jsonAnimation
}
```

## 预览图 ##

![党建 Lottie 动画](/images/cmono-%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20230719092233.jpg)
