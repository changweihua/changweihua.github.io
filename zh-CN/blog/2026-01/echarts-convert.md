---
lastUpdated: true
commentabled: true
recommended: true
title: ECharts中的convertToPixel和convertFromPixel
description: ECharts中的convertToPixel和convertFromPixel
date: 2026-01-26 10:32:00 
pageClass: blog-page-class
cover: /covers/echarts.svg
---

在 **ECharts** 里，`convertToPixel` 和 `convertFromPixel` 是非常重要的一对方法 ——

> 它们的作用是：
>
> 在  “**数据坐标**” （图表内部的逻辑坐标） 和  “**像素坐标**” （屏幕上的实际位置）之间做互相转换。

我们一步一步来讲清楚它们的概念、用法和使用场景👇

## 🧩 一、先理解两种“坐标”概念 ##

### 1️⃣ 数据坐标（data coordinate） ###

- 是你在图表里写的数据点。

- 对应的是 `xAxis` / `yAxis` 的值。

- 例如：

```js
xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu'] },
series: [{ data: [10, 20, 30, 40] }]
```

- 在数据空间中：

  - 第一个点是 `('Mon', 10)`
  - 第二个点是 `('Tue', 20)`
  - …

### 2️⃣ 像素坐标（pixel coordinate） ###

- 是图表在浏览器画布上绘制时的 **实际像素位置**；
- 左上角通常是 (0,0)，右下角是 (width,height)；
- 图表内部元素（柱子、线点）最终都是以“像素”绘制的。

> 👉 所以：
>
> - `convertToPixel`：把 “数据坐标值” 转成 “图表上对应的像素位置”
> - `convertFromPixel`：反过来，把 “点击的像素位置” 转换成 “数据坐标值（索引或数值）”

## 📘 二、convertToPixel —— 数据 → 像素 ##

**💡 用法**：

```js
chart.convertToPixel(finder, value)
```

- `finder`: 用来指定你想按哪个组件转换，比如：

  - `{ xAxisIndex: 0 }`
  - `{ yAxisIndex: 0 }`
  - `{ seriesIndex: 0 }`

- `value`: 数据值，比如：

  - `['Mon', 20]`
  - 或者只传某一维度 `'Mon'`。

**🧠 返回结果**：

返回一个像素坐标（或数组），比如 `[x像素, y像素]`。

**✅ 举个例子**：

```js
const pixel = chart.convertToPixel({ xAxisIndex: 0 }, 'Wed');
// 比如返回 [350] —— 在画布上 X=350 像素处
```

或同时转换：

```js
const point = chart.convertToPixel({ seriesIndex: 0 }, ['Wed', 30]);
// 可能返回 [350, 180]
```

**🌟 常见用途**：

| **场景**    |    **功能**   |
| :------------- | :-----------: |
|    📍 绘制自定义图形    |      算出指定数据点对应的像素位置，在上面画标线、标注、图标等      |
|    📊 交互辅助线    |      点击后画固定虚线时，需要转换 x 轴的值成像素      |
|    🧮 联动多个图表    |      一个图表点击后，通过像素计算，定位到另一个图表对应位置      |

**⚙️ 示例**：

```js
// 获取x=2数据点的像素位置
const pixel = chart.convertToPixel({ seriesIndex: 0 }, [2, 50]);
console.log(pixel); // 例如 [280, 150]

// 用这个像素位置绘制一条竖线
const line = new echarts.graphic.Line({
  shape: { x1: pixel[0], y1: 0, x2: pixel[0], y2: 400 },
  style: { stroke: 'red', lineWidth: 1, lineDash: [4,4] }
});
chart.getZr().add(line);
```

## 📘 三、convertFromPixel —— 像素 → 数据 ##

**💡 用法**：

```js
chart.convertFromPixel(finder, pixel)
```

- `finder`: 同上，指定坐标系，例如 `{xAxisIndex: 0}`。
- `pixel`: 像素坐标点，比如 `[offsetX, offsetY]`。

**🧠 返回**：

返回图表中的“数据值”或“索引值”。

**✅ 举例**：

```js
chart.getZr().on('click', function (params) {
  const px = [params.offsetX, params.offsetY];
  const dataPoint = chart.convertFromPixel({ xAxisIndex: 0 }, px);
  console.log(dataPoint);
});
```

结果可能是：

```js
[2, 28] // 表示点击的位置对应数据索引2，Y轴约为28
```

**🌟 常见用途**：

| **场景**    |    **功能**   |
| :------------- | :-----------: |
|    🖱 获取用户点击的是哪一列    |      在点击事件中得到点击的数据索引      |
|    🎯 鼠标坐标对应的数据    |      鼠标经过时显示数据详细值      |
|    🔄 用点击像素反算数据索引    |      结合 `convertToPixel` 实现画布联动或选中效果      |

**⚙️ 示例**：

```js
chart.getZr().on('click', (params) => {
  const pixelPoint = [params.offsetX, params.offsetY];
  const dataCoord = chart.convertFromPixel({ seriesIndex: 0 }, pixelPoint);
  console.log('点击点对应的数据坐标：', dataCoord);
  // 比如返回 [3, 134] 表示点击在x轴第3个数据附近
});
```

## 🧭 四、成对使用的典型案例 ##

### 💬 例子：点击某个点 → 在该点位置画竖线 ###

- 1️⃣ 用户点击图表 → 得到点击的 `pixel` 坐标；
- 2️⃣ 用 `convertFromPixel` 得到数据的 `x` 值或索引；
- 3️⃣ 再用 `convertToPixel` 把这个数据值转换为正确的 `x` 像素；
- 4️⃣ 用 `echarts.graphic.Line` 在那条 `x` 位置画一条竖线。

## ✅ 小结对比表格 ##

| **方法**    |    **方向**   |  **作用**   |   **常见用法**   |
| :------------- | :-----------: | :------------- | :-----------: |
|    `convertToPixel()`    |      数据坐标 → 像素坐标      |  确定画布上某数据点的实际位置   |      绘制自定义图形、固定辅助线      |
|    `convertFromPixel()`    |     像素坐标 → 数据坐标      |  根据点击或鼠标坐标找出对应数据点  |      点击事件取数据索引、交互联动      |
