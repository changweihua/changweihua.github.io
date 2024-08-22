---
lastUpdated: true
commentabled: true
recommended: true
title:  懒加载及异步图像解码方案
description: 现代图片性能优化： 懒加载及异步图像解码方案
date: 2024-04-24 09:18:00
pageClass: blog-page-class
---

# 现代图片性能优化： 懒加载及异步图像解码方案 #

懒加载是一种网页性能优化的常见方式，它能极大的提升用户体验。到今天，现在一张图片超过几 M 已经是常见事了。如果每次进入页面都需要请求页面上的所有的图片资源，会较大的影响用户体验，对用户的带宽也是一种极大的损耗。
所以，图片懒加载的意义即是，当页面未滚动到相应区域，该区域内的图片资源（网络请求）不会被加载。反之，当页面滚动到相应区域，相关图片资源的请求才会被发起。
在过去，我们通常都是使用 `JavaScript` 方案进行图片的懒加载。而今天，我们在图片的懒加载实现上，有了更多不一样的选择。

## content-visibility ##

**使用 `content-visibility: auto` 实现图片内容的延迟渲染**

一个相对较为冷门的属性 – `content-visibility`
`content-visibility`：属性控制一个元素是否渲染其内容，它允许用户代理（浏览器）潜在地省略大量布局和渲染工作，直到需要它为止。
利用 `content-visibility` 的特性，我们可以实现如果该元素当前不在屏幕上，则不会渲染其后代元素。

```html5
<div v-for="item in items" :key="item">
   <div class="container-box">
      <p>-------------{{ item.id }}-------------</p>   
      <img :src="item.src" alt=""/>
   </div>
</div>

<script>
export default {
  data() {
    return {
      items: [{
        id: 0,
        src: "http://g.hiphotos.baidu.com/image/pic/item/6d81800a19d8bc3e770bd00d868ba61ea9d345f2.jpg"
      },{
        id: 1,
        src: "https://gtd.alicdn.com/sns_logo/i3/TB1wnBTKFXXXXcQXXXXSutbFXXX.jpg_240x240xz.jpg"
      }, {
        id: 2,
        src: "//www.baidu.com/img/flexible/logo/pc/result.png"
      }, {
        id: 3,
        src: "http://e.hiphotos.baidu.com/image/pic/item/a1ec08fa513d2697e542494057fbb2fb4316d81e.jpg"
      }, {
        id: 4,
        src: "http://c.hiphotos.baidu.com/image/pic/item/30adcbef76094b36de8a2fe5a1cc7cd98d109d99.jpg"
      }, {
        id: 5,
        src: "http://h.hiphotos.baidu.com/image/pic/item/7c1ed21b0ef41bd5f2c2a9e953da81cb39db3d1d.jpg"
      }, {
        id: 6,
        src: "http://g.hiphotos.baidu.com/image/pic/item/55e736d12f2eb938d5277fd5d0628535e5dd6f4a.jpg"
      }, {
        id: 7,
        src: "http://e.hiphotos.baidu.com/image/pic/item/4e4a20a4462309f7e41f5cfe760e0cf3d6cad6ee.jpg"
      }, {
        id: 8,
        src: "http://b.hiphotos.baidu.com/image/pic/item/9d82d158ccbf6c81b94575cfb93eb13533fa40a2.jpg"
      }, {
        id: 9,
        src: "http://e.hiphotos.baidu.com/image/pic/item/4bed2e738bd4b31c1badd5a685d6277f9e2ff81e.jpg"
      }, {
        id: 10,
        src: "http://g.hiphotos.baidu.com/image/pic/item/0d338744ebf81a4c87a3add4d52a6059252da61e.jpg"
      }, {
        id: 11,
        src: "http://a.hiphotos.baidu.com/image/pic/item/f2deb48f8c5494ee5080c8142ff5e0fe99257e19.jpg"
      }, {
        id: 12,
        src: "http://f.hiphotos.baidu.com/image/pic/item/4034970a304e251f503521f5a586c9177e3e53f9.jpg"
      }, {
        id: 13,
        src: "http://b.hiphotos.baidu.com/image/pic/item/279759ee3d6d55fbb3586c0168224f4a20a4dd7e.jpg"
      }, {
        id: 14,
        src: "http://a.hiphotos.baidu.com/image/pic/item/e824b899a9014c087eb617650e7b02087af4f464.jpg"
      }]
    }
  }
}
</script>
```

只需要给需要延迟（实时）渲染的元素，设置简单的 CSS 样式：

```css
.container-box { content-visibility: auto; }
```

但是它有一个**缺点：
滚动条在向下滚动在不断的抽搐，这是由于下面不在可视区域内的内容，一开始是没有被渲染的，在每次滚动的过程中，才逐渐渲染，以此来提升性能。**

当然，其实使用 `content-visibility: auto` 并不能真正意义上实现图片的懒加载。
这是因为，即便当前页面可视区域外的内容未被渲染，但是图片资源的 HTTP/HTTPS 请求，依然会在页面一开始被触发！

因此，这也得到了一个非常重要的结论：
`content-visibility: auto` 无法直接替代图片懒加载，设置了 `content-visibility: auto` 的元素在可视区外只是未被渲染，但是其中的静态资源仍旧会在页面初始化的时候被全部加载。因此，它更像是一个虚拟列表的替代方案。

## loading=“lazy” 和 decoding=“async” ##

**使用 `loading=“lazy”` 和 `decoding=“async”` HTML属性实现图片懒加载**

`content-visibility` 略有瑕疵，还好我们有其他方式

```css
loading="lazy"
```

HTML5 新增了一个 `loading` 属性。

到今天，除了 IE 系列浏览器，目前都支持通过 `loading` 属性实现延迟加载。此属性可以添加到 `< img >` 元素中，也可以添加到 `< iframe >` 元素中。

属性的值为 `loading=lazy` 会告诉浏览器，如果图像位于可视区时，则立即加载图像，并在用户滚动到它们附近时获取其他图像。

可以这样使用它

```html5
<img :src="item.src" alt="" loading="lazy"/>
```

这样，便可以非常便捷的实现图片的懒加载，省去了添加繁琐的 JavaScript 代码的过程。

```css
decoding="async
```

使用 `decoding=async` 实现图片的异步解码

除了 `loading=lazy`，HTML5 还新增了一个非常有意思的属性增强图片的用户体验。那就是 `decoding` 属性。

`HTMLImageElement` 接口的 `decoding` 属性用于告诉浏览器使用何种方式解析图像数据。

它的可选取值如下：

  - sync: 同步解码图像，保证与其他内容一起显示。
  - async: 异步解码图像，加快显示其他内容。
  - auto: 默认模式，表示不偏好解码模式。由浏览器决定哪种方式更适合用户。

上文其实也提及了，浏览器在进行图片渲染展示的过程中，是需要对图片文件进行解码的，这一个过程快慢与图片格式有关。

而如果我们不希望图片的渲染解码影响页面的其他内容的展示，可以使用 `decoding=async` 选项，像是这样：

```html5
<img :src="item.src" alt="" loading="lazy" decoding="async"/>
```

这样，浏览器便会异步解码图像，加快显示其他内容。这是图片优化方案中可选的一环。

同样的，`decoding=“async”` 的兼容性，整体还是非常不错的，作为渐进增强方案使用，是非常好的选择。
