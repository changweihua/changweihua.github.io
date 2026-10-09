---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序 ECharts 瘦身实战
description: 分包异步化 + componentPlaceholder 避开主包 2MB 限制
date: 2026-09-01 10:35:00
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

ECharts 的 `echarts.js` 体积接近 1MB，直接放在主包里，很容易让主包超过 2MB。

普通分包适合按页面拆分，但主包页面不能直接同步使用分包中的组件。需要在页面中配置 componentPlaceholder，先渲染一个占位节点，等 ECharts 分包下载完成后再替换成真实组件。

## 目录结构 ##

```txt
miniprogram/
├─ app.json
├─ pages/
│  └─ chart/
│     ├─ index.json
│     ├─ index.wxml
│     └─ index.scss
└─ subpackages/
   └─ echarts/
      ├─ ec-canvas/
      │  ├─ ec-canvas.js
      │  ├─ ec-canvas.json
      │  ├─ ec-canvas.wxml
      │  ├─ ec-canvas.wxss
      │  ├─ echarts.js
      │  └─ wx-canvas.js
      └─ components/
         └─ echart/
            ├─ index.json
            ├─ index.ts
            ├─ index.wxml
            └─ index.scss
```

`echarts.js`、`ec-canvas` 和包装组件都放在同一个分包中。主包页面只使用包装组件，不要再直接导入 ECharts。

## 声明 ECharts 分包 ##

在 `app.json` 中增加一个只提供组件的分包：

```json
{
  "pages": [
    "pages/chart/index"
  ],
  "subPackages": [
    {
      "root": "subpackages/echarts",
      "pages": []
    }
  ],
  "lazyCodeLoading": "requiredComponents"
}
```

分包本身仍受单包 `2MB` 限制。如果完整 ECharts 构建超过限制，需要使用 ECharts 自定义构建，只保留项目实际用到的图表和组件。

## 在分包内包装 ec-canvas ##

`subpackages/echarts/components/echart/index.json`：

```json
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "ec-canvas": "/subpackages/echarts/ec-canvas/ec-canvas"
  }
}
```

`index.wxml`：

```xml
<view class="chart-shell">
  <ec-canvas
    id="echart-canvas"
    class="chart"
    canvas-id="{{canvasId}}"
    ec="{{ec}}"
  />
</view>
```

`index.ts`：

```ts
import * as echarts from '../../ec-canvas/echarts';
import type { EChartsInstance } from '../../ec-canvas/echarts';

interface EChartsCanvas {
  setChart(chart: EChartsInstance): void;
}

interface EcCanvasComponent {
  init(
    callback: (canvas: EChartsCanvas, width: number, height: number, devicePixelRatio: number) => EChartsInstance,
  ): void;
}

interface EChartData {
  ec: {
    lazyLoad: boolean;
  };
}

type EChartProperties = Record<string, WechatMiniprogram.Component.AllProperty> & {
  canvasId: {
    type: StringConstructor;
    value: string;
  };
  option: {
    type: ObjectConstructor;
    value: Record<string, unknown>;
  };
};

type EChartMethods = Record<string, Function> & {
  renderChart(): void;
};

const charts = new WeakMap<object, EChartsInstance>();

Component<EChartData, EChartProperties, EChartMethods, []>({
  properties: {
    canvasId: {
      type: String,
      value: 'echart',
    },
    option: {
      type: Object,
      value: {},
    },
  },

  data: {
    ec: {
      lazyLoad: true,
    },
  },

  observers: {
    option(): void {
      this.renderChart();
    },
  },

  lifetimes: {
    ready(): void {
      this.renderChart();
    },
    detached(): void {
      charts.get(this)?.dispose();
      charts.delete(this);
    },
  },

  methods: {
    renderChart(): void {
      const option = this.properties.option;
      if (Object.keys(option).length === 0) return;

      const chart = charts.get(this);
      if (chart) {
        chart.setOption(option, true);
        return;
      }

      const canvasComponent = this.selectComponent('#echart-canvas') as unknown as EcCanvasComponent | null;
      if (!canvasComponent) return;
      canvasComponent.init((canvas, width, height, devicePixelRatio) => {
        const newChart = echarts.init(canvas, null, { width, height, devicePixelRatio });
        charts.set(this, newChart);
        canvas.setChart(newChart);
        newChart.setOption(this.properties.option, true);
        return newChart;
      });
    },
  },
});
```

这里使用 `lazyLoad`，由包装组件在 `ready` 后调用 `ec-canvas.init`。option 为空时不初始化，数据先于分包加载完成时，真实组件创建后会读取最新的 `option`。

实例保存在 `WeakMap` 中，每个组件实例分别持有自己的 ECharts 实例。组件销毁时调用 `dispose()`，同一页面放置多个图表也不会共享实例。

组件自身的 `index.scss` 负责把 Canvas 高度传递到宿主尺寸：

```css
:host,
.chart-shell,
.chart {
  display: block;
  height: 100%;
  width: 100%;
}
```

## 主包页面配置 componentPlaceholder ##

`pages/chart/index.json`：

```json
{
  "usingComponents": {
    "echart": "/subpackages/echarts/components/echart/index"
  },
  "componentPlaceholder": {
    "echart": "view"
  }
}
```

`usingComponents` 和 `componentPlaceholder` 中的组件名必须一致。

页面首次渲染时，如果 ECharts 分包还没有下载，基础库会先把 `<echart>` 当作 view 渲染。分包可用后，占位 view 会被真实组件自动替换。

## 页面使用 ##

业务页面只负责生成 ECharts option 并传给组件：

```xml
<view class="chart-frame">
  <echart
    class="chart"
    canvas-id="history-chart"
    option="{{chartOption}}"
  />
</view>
```

`index.scss`：

```css
.chart-frame {
  display: block;
  width: 100%;
  height: 520rpx;
}

.chart {
  display: block;
  width: 100%;
  height: 100%;
}
```

外层必须提前设置高度。否则占位节点没有尺寸，真实组件替换后，ECharts 初始化得到的 Canvas 高度也可能是 0。

*实际加载过程如下*：

```txt
主包页面开始渲染
  → 使用 view 代替 echart
  → 异步下载 ECharts 分包
  → 真实组件替换占位 view
  → 组件 ready
  → ec-canvas.init
  → echarts.init
  → setOption
```

开发者工具中可以通过“代码依赖分析”检查结果：`echarts.js` 应只存在于 `subpackages/echarts`，主包中不应再有一份副本。

`componentPlaceholder` 需要基础库 2.11.2 及以上版本。发布前还需要清除开发者工具缓存，模拟首次进入页面，检查占位切换、Canvas 尺寸和真机渲染是否正常。
