---
lastUpdated: true
commentabled: true
recommended: true
title: 原子化的未来？了解一下全面进化的CSS attr函数
description: 原子化的未来？了解一下全面进化的CSS attr函数
date: 2025-07-25 10:05:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 背景 ##

> `CSS attr` 函数相信大家都用过了吧，通常会配合伪元素 `content` 动态生成内容，比如一个简易的 `tooltip`

```html
<span class="css-tips" data-title="我是tooltip" >提示上</span>
```

### 通过attr动态生成 ###

```css
.css-tips[data-title]:after {
  content: attr(data-title);
  /*...*/
}
```

### 效果如下 ###

:::demo

```vue
<template>
  <span class="css-tips" data-title="我是tooltip" >提示上</span>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.css-tips[data-title]:after {
  content: attr(data-title);
  /*...*/
}
</style>
```

:::

不过，之前仅仅支持字符串形式，对于数字、颜色等都无法识别，例如

```html
<div w="10"></div>
<style>
  div{
    width: attr(w);
  }
</style>
```

现在，CSS attr迎来了全面进化（chrome 133+），很多问题都得到了很好的解决，一起看看吧~

## 一、快速上手 ##

比如这样一个结构，是不是看着有些眼熟？

```html
<div w="100" h="100"></div>
<style>
  div{
    background: royalblue;
  }
</style>
```

那么，如何让属性上的尺寸传递应用到实际的宽高上呢？你可以这样

```css
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
```

来看看效果

我们可以用之前的规则，将尺寸通过content显示出来

```css
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
```
效果如下

:::demo

```vue
<template>
  <div w="100" h="100"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div {
  background: royalblue;
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
</style>
```

:::

更为关键的是，这些完全是自动获取的，你可以设置多个任意尺寸

```html
<div w="100" h="100"></div>
<div w="200" h="100"></div>
<div w="300" h="100"></div>
```

效果如下


:::demo

```vue
<template>
  <div w="20" h="20"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div {
  background: royalblue;
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
</style>
```

:::

是不是非常灵活？

## 二、语法详解 ##

现在来看看语法规则

```css
attr(<attr-name> <attr-type>? , <fallback-value>?)
```

其实相比之前的规则，多了两个可选参数，一个是 `attr-type`，表示属性类型，还有一个是 `allback-value` ，表示回退值，一些写法如下

```css
/* Basic usage */
attr(data-count)
attr(href)

/* With type */
attr(data-width px)
attr(data-size rem)
attr(data-name raw-string)
attr(id type(<custom-ident>))
attr(data-count type(<number>))
attr(data-size type(<length> | <percentage>))

/* With fallback */
attr(data-count type(<number>), 0)
attr(data-width px, inherit)
attr(data-something, "default")
```

前面的例子其实带类型的值，除了使用 `px` ，还可以使用任何已有的CSS单位，比如

```html
<div w="100" h="100" rotate="45"></div>
```

这里定义了一个旋转角度，可以直接加上角度单位 `deg`

```css
[rotate]{
  rotate: attr(rotate deg)
}
```
效果如下

:::demo

```vue
<template>
  <div w="20" h="20" rotate="45"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div {
  background: royalblue;
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
[rotate]{
  rotate: attr(rotate deg)
}
</style>
```

:::

但是，有些值其实是不带单位的，比如颜色，并没有什么后缀单位，比如

```html
<div w="100" h="100" rotate="45" bg="red"></div>
```
这时，可以采用type来手动指定

```css
[bg]{
  background: attr(bg type(<color>));
}
```

效果如下

:::demo

```vue
<template>
  <div w="20" h="20" rotate="45" bg="red"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div {
  background: royalblue;
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
[bg]{
  background: attr(bg type(<color>));
}
</style>
```

:::


有些属性可能不止一种类型，比如 `background`，支持颜色，也支持渐变，还支持图像，这里其实也能定义多种类型

```css
[bg]{
  background: attr(bg type(<color>|<image>));
}
```

我们换成渐变试试

```html
<div w="100" h="100" rotate="45" bg="linear-gradient(orange,red)"></div>
```

也能完美适配

:::demo

```vue
<template>
  <div w="20" h="20" rotate="45" bg="linear-gradient(orange,red)"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div {
  background: royalblue;
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
[bg]{
  background: attr(bg type(<color>|<image>));
}
</style>
```

:::

多个值写起来可能比较麻烦，可以用通配符来代替，相当于传入什么，读取的就是什么

```css
[bg]{
  background: attr(bg type(*));
}
```

最后就是回退值，非常类CSS变量，当属性不存在时（注意不能是空），采用回退值，比如

```css
div{
  background: attr(bg type(*), royalblue);
}
```

现在去除bg属性

```html
<div w="100" h="100" rotate="45"></div>
```

就回到了默认的宝蓝色

:::demo

```vue
<template>
  <div w="20" h="20" rotate="45"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
div{
  background: attr(bg type(*), royalblue);
}
div:before{
  content: attr(w) '*' attr(h);
  color: white;
  font-size: 14px;
}
[w]{
  width: attr(w px)
}
[h]{
  height: attr(h px)
}
</style>
```

:::

## 三、带数字显示的进度条 ##

在过去，如果想用单个标签、单一变量来实现，通常会用到CSS变量，就像这样

```html
<div class="progress" style="--value:30"></div>
<div class="progress" style="--value:42.5"></div>
<div class="progress" style="--value:50"></div>
<div class="progress" style="--value:90"></div>
```

进度很好办，直接用这个变量计算就好了，那后面的数字怎么办呢？直接使用变量是不行的

```css
::before{
  content: var(--value) /*不生效*/
}
```

其实可以用计数器来实现，类似于这样

```css
.progress::before {
  	--value: 50;
    counter-reset: progress var(--value);
    content: counter(value);
}
```

不过计数器在正常场景下不支持小数，导致有些场景受限。

现在有了attr，可以直接用属性来实现，实现更方便

```html
<div class="progress" value="30"></div>
<div class="progress" value="42.5"></div>
<div class="progress" value="50"></div>
<div class="progress" value="90"></div>
```

直接通过渐变绘制进度 `attr(value %)`

```css
.progress {
  color: royalblue;
  width: 300px;
  height: 20px;
  background: linear-gradient(currentColor, currentColor) 0 0 / attr(value %) 100% no-repeat #ccc;
  border-radius: 2px;
  position: relative;
}
.progress::after {
  content: attr(value);
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(10px, -50%);
  font-size: 20px;
}
```

:::demo

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 10px;">
    <div class="progress" value="30"></div>
    <div class="progress" value="42.5"></div>
    <div class="progress" value="50"></div>
    <div class="progress" value="90"></div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.progress {
  color: royalblue;
  width: 300px;
  height: 20px;
  background: linear-gradient(currentColor, currentColor) 0 0 / attr(value %) 100% no-repeat #ccc;
  border-radius: 2px;
  position: relative;
}
.progress::after {
  content: attr(value);
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(10px, -50%);
  font-size: 20px;
}
</style>
```

:::

## 四、原子化的未来？ ##

回头再来看看这种写法，是不是非常类似现在流行的原子化CSS？

```html
<div w="100" h="100"></div>
<div w="200" h="100"></div>
<div w="300" h="100"></div>
```

嗯...等到兼容性没有问题后，现在的原子化框架都得革新了 ，只需要极少部分原子CSS即可适配大量的样式，而不是这样生成大量用到的样式

用 `attr` 可能就两行，类似这样

```css
[fs]{
  font-size: attr(fs type(<length>))
}
p{
  padding: attr(p type(*))
}
```

是不是可以节省大量CSS代码？

## 五、优势和局限 ##

其实很多特性和CSS变量还是比较相似，不过相比而言还是有不少优势的

- 支持 `content` 内容生成
- `html`结构更直观，个人觉得CSS变量放在`style`上有些冗余
- 天然原子化，比现在框架生成要高效的多

然后有一个局限性，那就是不支持链接格式，比如

```html
<div src="xxx.png"></div>
```

如果直接这样使用，是不会生效的

```css
div{
  background: url(attr(src)); /*无效*/
}
```

只能用这种形式，其实和现在 `CSS变量` 差不多了

```html
<div src="url(xxx.png)"></div>
```

官方说明是为了安全考虑，不能用于动态构造 `URL`

😭太可惜了，一直想用这个功能能实现自定义 `img` 标签，将图片转成背景图片，这样就能做更多事情了

```html
<img src="xxx.png">
<style>
  img{
    background: url(attr(src));
  }
</style>
```

总之，这是一个未来非常有潜力的新特性，敬请期待吧。
