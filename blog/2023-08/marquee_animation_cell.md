---
lastUpdated: true
commentabled: true
recommended: true
tags: ["小程序", "轮播"]
title: 小程序左右轮播显示文字
description: 小程序左右轮播显示文字
poster: /images/cmono-GIF-2023-8-10-9-24-24.gif
date: 2023-08
---

# 左右轮播显示文字 #

![效果图](/images/cmono-GIF-2023-8-10-9-24-24.gif){data-zoomable}

## 代码

```html
<view
  id="gatenumber_cell"
  style="--gatenumber-width: {{gatenumber_width}}"
  class="cell"
>
  <view class="marquee-container">
    <view
      class="{{ checkin_container_width > checkin_text_width ? 'static-text' : 'marquee-text' }}"
      id="gatenumber_text"
      >{{flightInfo.checkInNumber}}</view
    >
  </view>
  <view>值机柜台</view>
</view>
```

```typescript
    onReady() {
        //
        const query = this.createSelectorQuery()
        query.select('#gatenumber_cell').boundingClientRect(res => {
            this.setData({
                gatenumber_width: res.width + 'px',
                checkin_container_width: res.width
            })
        }).exec()
        query.select('#gatenumber_text').boundingClientRect((res) => {
            this.setData({
                checkin_text_width: res.width
            })
        }).exec()
    },
```

```less
.container {
  --gatenumber-width: 124rpx;
}

.marquee-container {
  width: var(--gatenumber-width, 118rpx);
  white-space: nowrap;
  overflow: hidden;
  margin: 0 auto;

  .marquee-text {
    position: relative;
    animation: scroll 3s ease-in-out 2ms infinite alternate backwards;
  }

  .static-text {
    width: var(--gatenumber-width, 118rpx);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@keyframes scroll {
  from {
    // transform: translateX(calc(var(--gatenumber-width, 118rpx) * 1));
    transform: translateX(30rpx);
  }

  to {
    transform: translateX(
      calc(-1 * (100% - var(--gatenumber-width, 118rpx)) - 30rpx)
    );
  }
}
```

<!-- ::: CodeView
```vue
<template>我是 vue 模板</template>
```
::: -->

```vue preview
<template>
  <h1>Demo: vite-plugin-vue-preview</h1>
</template>
```
