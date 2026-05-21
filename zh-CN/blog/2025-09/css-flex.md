---
lastUpdated: true
commentabled: true
recommended: true
title: 0 基础也能懂的 Flex 布局教程
description: 3 步搞定网页排版
date: 2025-09-24 10:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

如果你刚学网页制作，每次排版都要跟浮动（float）、margin/padding 死磕，那一定要试试 Flex 布局！它就像给容器装了个 “智能排版系统”，让里面的元素想怎么排就怎么排，不用再算来算去。

这篇文章全程用 “人话”+“例子” 讲解，哪怕你没写过一行代码，也能跟着学会。

## 一、先搞懂 2 个核心概念：容器和项目 ##

Flex 布局的本质，是 “容器指挥项目怎么排”。先分清这两个角色，后面就简单了：

|  角色   |  定义  |  举个例子  | 
| :-----------: | :-----------: | :-----------: |
| Flex 容器（Container） | 你划定的一块 “排版区域”，比如一个 div 盒子 | 就像一个书架，书架本身就是 “容器” |
| Flex 项目（Item） | 容器里面要排版的元素，比如多个小 div | 书架上的每一本书，就是 “项目” |

**关键第一步：把容器变成 “Flex 容器”**

只要给容器加一行 CSS 代码，它就拥有了指挥项目的能力：

```css
/* 给容器加这个属性，它就变成Flex容器了 */
.container {
  display: flex;
}
```

没加之前，项目会默认 “从上到下叠着排”；加了之后，项目会自动 “从左到右排成一行”—— 这是 Flex 的默认效果，也是最常用的效果之一。

## 二、核心用法：容器怎么指挥项目？（4 个常用属性） ##

Flex 容器有很多 “指挥权”，我们先学最常用的 4 个，覆盖 90% 的排版场景。每个属性都配 “代码 + 效果描述”，一看就懂。

### 控制项目 “排一行还是排多行”：flex-wrap ###

默认情况下，容器里的项目会挤在一行（哪怕超出容器也不换行）。用 `flex-wrap` 可以让项目 “装不下时自动换行”。

|  属性值   |  效果  |  适合场景  | 
| :-----------: | :-----------: | :-----------: |
| `nowrap`（默认） | 所有项目挤在一行，超出容器也不换行 | 导航栏、标签栏（项目少的情况） |
| `wrap` | 装不下时自动换行，往下排 | 商品列表、图片墙（项目多的情况） |

**例子：商品列表自动换行**

如果容器里有 6 个商品，加 `flex-wrap: wrap` 后，屏幕窄了会自动换行，不用手动调：

```css
/* 容器样式 */
.shop-container {
  display: flex; /* 开启Flex */
  flex-wrap: wrap; /* 装不下自动换行 */
  width: 800px; /* 容器宽度固定 */
}

/* 项目样式（每个商品） */
.shop-item {
  width: 200px; /* 每个商品宽200px */
  height: 300px; /* 每个商品高300px */
  margin: 10px; /* 商品之间留空隙 */
}
```

### 控制项目 “水平方向怎么排”：justify-content ###

这个属性管 “项目在容器里左右怎么对齐”，比如靠左、靠右、居中，或者均匀分布。是最常用的属性之一！

|  属性值   |  效果  |  适合场景  | 
| :-----------: | :-----------: | :-----------: |
| `flex-start`（默认） | 项目靠左排 | 普通列表、文章段落 |
| `flex-end` | 项目靠右排 | 右侧工具栏、按钮组 |
| `center` | 项目水平居中 | 页面标题、弹窗内容 |
| `space-between` | 项目两端对齐，中间空隙相等 | 导航栏（左边 logo，右边菜单） |
| `space-around` | 项目之间空隙相等，两边也有空隙 | 卡片列表、图标组 |

**例子：导航栏两端对齐**

左边放 logo，右边放菜单，用 `space-between` 一键搞定，不用再算 margin：

```css
/* 导航栏容器 */
.nav {
  display: flex; /* 开启Flex */
  justify-content: space-between; /* 两端对齐 */
  width: 100%; /* 导航栏占满屏幕宽度 */
  height: 60px; /* 导航栏高度 */
}

/* 项目：logo和菜单 */
.nav-logo, .nav-menu {
  height: 100%; /* 和导航栏同高 */
}
```

### 控制项目 “垂直方向怎么排”：align-items ###

这个属性管 “项目在容器里上下怎么对齐”，比如靠上、靠下、居中，解决了很多 “垂直居中” 的痛点！

|  属性值   |  效果  |  适合场景  | 
| :-----------: | :-----------: | :-----------: |
| `stretch`（默认） | 项目高度自动撑满容器 | 卡片列表（所有卡片一样高） |
| `flex-start` | 项目靠上对齐 | 顶部工具栏、标题栏 |
| `flex-end` | 项目靠下对齐 | 底部按钮组、版权信息 |
| `center` | 项目垂直居 | 中文字和图标对齐、弹窗内容居中 |
| `baseline` | 项目按文字基线对齐 | 表单（输入框和按钮文字对齐） |

**例子：文字和图标垂直居中**

以前图标和文字总对不齐，用 `align-items: center` 一键解决：

```css
/* 容器：一行内容（图标+文字） */
.icon-text {
  display: flex; /* 开启Flex */
  align-items: center; /* 垂直居中 */
  height: 40px; /* 容器高度 */
}

/* 项目：图标和文字 */
.icon {
  width: 24px;
  height: 24px;
}
.text {
  font-size: 16px;
  margin-left: 8px; /* 图标和文字留空隙 */
}
```

### 控制 “多行项目” 的垂直对齐：align-content ###

如果项目换行了（用了 `flex-wrap: wrap`），`align-content` 可以控制 “多行项目整体在垂直方向怎么排”（单一行时无效）。

|  属性值   |  效果  |  适合场景  | 
| :-----------: | :-----------: | :-----------: |
| `stretch`（默认） | 多行项目高度平分容器 | 图片墙、商品列表 |
| `center` | 多行项目整体垂直居中 | 居中的卡片组 |
| `space-between` | 多行项目上下两端对齐，中间空隙相等 | 均匀分布的列表 |

**例子：多行商品垂直居中**

如果容器高度比所有商品加起来高，用 `align-content: center` 让所有商品整体居中：

```css
.shop-container {
  display: flex;
  flex-wrap: wrap; /* 先让项目换行 */
  align-content: center; /* 多行项目整体垂直居中 */
  width: 800px;
  height: 800px; /* 容器高度足够高 */
}
```

## 三、进阶：让单个项目 “搞特殊”（align-self） ##

前面的 `align-items` 是 “控制所有项目” 的垂直对齐，而 `align-self` 可以给 “单个项目” 单独设置垂直对齐方式，覆盖容器的 `align-items`。

**例子：让某个商品 “靠下对齐”**

比如 6 个商品里，第 3 个要特殊，靠下对齐，其他靠上：

```css
/* 容器：所有项目默认靠上对齐 */
.shop-container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start; /* 所有项目靠上 */
  width: 800px;
  height: 500px;
}

/* 单个项目：第3个商品靠下对齐 */
.shop-item:nth-child(3) {
  align-self: flex-end; /* 单独靠下 */
}
```

## 四、实战小案例：3 分钟做一个居中弹窗 ##

学完上面的知识，我们来做个实用的案例 —— 弹窗（登录框、提示框），用 Flex 轻松实现 “水平 + 垂直居中”。

### 最终效果 ###

弹窗在浏览器正中间，不管屏幕多大，都不会跑偏。

### 代码步骤 ###

1. 先做一个 “全屏背景容器”，让它覆盖整个页面；
2. 在背景里放 “弹窗容器”，用 Flex 让它居中；
3. 弹窗里放内容（标题、输入框、按钮）。

```html
<!-- HTML结构 -->
<div class="modal-bg"> <!-- 全屏背景容器 -->
  <div class="modal"> <!-- 弹窗容器 -->
    <h2>登录账号</h2> <!-- 弹窗内容 -->
    <input type="text" placeholder="用户名">
    <input type="password" placeholder="密码">
    <button>登录</button>
  </div>
</div>
```

```css
/* CSS样式 */
/* 1. 全屏背景容器：让弹窗在页面居中 */
.modal-bg {
  display: flex; /* 开启Flex */
  justify-content: center; /* 弹窗水平居中 */
  align-items: center; /* 弹窗垂直居中 */
  position: fixed; /* 固定在屏幕上 */
  top: 0;
  left: 0;
  width: 100%; /* 占满屏幕宽 */
  height: 100%; /* 占满屏幕高 */
  background: rgba(0,0,0,0.5); /* 半透明黑色背景 */
}

/* 2. 弹窗容器：里面的内容水平排列 */
.modal {
  display: flex; /* 开启Flex */
  flex-direction: column; /* 让内容垂直排列（默认是水平） */
  gap: 15px; /* 内容之间留15px空隙 */
  padding: 30px;
  background: white;
  border-radius: 8px; /* 圆角 */
}

/* 3. 弹窗内容样式（简单美化） */
.modal h2 {
  margin: 0;
  text-align: center;
}
.modal input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.modal button {
  padding: 10px;
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

### 为什么这么简单？ ###

- 不用算 `top: 50%; left: 50%; transform: translate(-50%, -50%)` 这种复杂公式；
- 不用管弹窗里有多少内容，Flex 会自动让它居中；
- 屏幕大小变化时，弹窗会跟着自动居中。

## 五、总结：Flex 布局核心口诀 ##

最后送你一句口诀，记住就能搞定大部分场景：

- 先给容器加 `display: flex`（开启 Flex 模式）；
- 水平对齐用 `justify-content`（左右怎么排）；
- 垂直对齐用 `align-items`（上下怎么排）；
- 装不下就用 `flex-wrap: wrap`（自动换行）；
- 单个项目搞特殊用 `align-self`（单独对齐）。

现在你可以打开代码编辑器，试着改改上面的例子 —— 比如把 `justify-content` 换成 `center`，看看项目怎么变；把 `align-items` 换成 `flex-end`，又会有什么效果。多试几次，你就会发现 Flex 布局真的很简单！
