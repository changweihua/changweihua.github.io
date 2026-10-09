---
lastUpdated: true
commentabled: true
recommended: true
title: 基于Vue3封装 ECharts 的最佳实践
description: 前端数据可视化：基于Vue3封装 ECharts 的最佳实践
date: 2025-09-03 09:00:00 
pageClass: blog-page-class
cover: /covers/echarts.svg
---

这是一个基于 Vue 3 和 ECharts 的可复用图表组件，支持常见的图表功能，包括动态配置、自动调整大小、加载状态、空数据提示等。

## 🚀 功能特性 ##

- **ECharts 配置**：支持传入完整的 ECharts 配置项 (`option`)。
- **动态数据更新**：通过监听 `option` 的变化，动态更新图表。
- **自动调整大小**：支持父容器尺寸变化时自动触发图表 `resize`。
- **加载状态**：支持显示加载状态。
- **空数据提示**：支持无数据时显示自定义的空状态。
- **事件绑定**：支持图表的 `click`、`resize` 等事件。
- **灵活扩展**：支持动态主题切换、渲染器类型选择（`canvas` 或 `svg`）。
- **生命周期管理**：支持图表实例的初始化、销毁、重置等操作。
- **暴露 ECharts 实例**：可获取 ECharts 实例，完成更为灵活、复杂的操作。


## 源码 ##

### 入口 index.vue ###

```vue:index.vue
<template>
  <div ref="rootRef" :class="props.className" :style="rootStyle"></div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
  watch,
  computed,
  defineEmits,
  defineProps,
  toRaw,
  shallowRef,
  onUnmounted
} from "vue";
import type { SetOptionOpts, ECharts as EChartsInstance } from "echarts/core";
import { echarts, ECOption } from "./core";

export interface Props {
  /**
   * ECharts 配置项
   */
  option: ECOption | any;
  /**
   * 是否有图表数据 （用于显示空状态）
   */
  hasData?: boolean;
  /**
   * 根节点类名
   */
  className?: string;
  /**
   * 主题名称或主题对象
   */
  theme?: string | Record<string, unknown>;
  /**
   * 父容器尺寸变化时自动响应
   */
  autoresize?: boolean;
  /**
   * 渲染器类型
   */
  renderer?: "canvas" | "svg";
  /**
   * 图表容器宽度
   */
  width?: string;
  /**
   * 图表容器高度
   */
  height?: string;
  /**
   * 是否展示 Loading
   */
  loading?: boolean;
  /**
   * setOption notMerge
   */
  notMerge?: boolean;
  /**
   * setOption lazyUpdate
   */
  lazyUpdate?: boolean;
  /**
   * setOption replaceMerge
   */
  replaceMerge?: string | string[];
  /**
   * setOption 图表联动的 group 名称
   */
  group?: string;
}

const props = withDefaults(defineProps<Props>(), {
  autoresize: true,
  hasData: true,
  renderer: "canvas",
  width: "100%",
  height: "360px",
  loading: false,
  notMerge: false,
  lazyUpdate: true
});

/**
 * 组件事件
 * @event ready - ECharts 实例已创建
 * @event resize - 图表触发了尺寸调整
 * @event click  - 图表点击事件
 */
const emit = defineEmits<{
  (e: "ready", instance: EChartsInstance): void;
  (e: "resize", size: { width: number; height: number }): void;
  (e: "click", params: unknown): void;
}>();

const rootRef = ref<HTMLDivElement | null>(null);
const chartRef = shallowRef<EChartsInstance | null>(null);
// 监听rootRef容器尺寸变化
const observerRef = ref<ResizeObserver | null>(null);

const rootStyle = computed(() => ({
  width: props.width,
  height: props.height
}));

/**
 * 获取echarts实例
 */
function getInstance(): EChartsInstance | null {
  return chartRef.value;
}

/**
 * 设置图表配置
 * @param {ECOption} option - ECharts 配置
 * @param {SetOptionOpts} [opts] - setOption 选项
 */
function setChartOption(option: ECOption, opts?: SetOptionOpts) {
  if (!chartRef.value) return;

  chartRef.value.setOption(toRaw(option), {
    notMerge: props.notMerge,
    lazyUpdate: props.lazyUpdate,
    replaceMerge: props.replaceMerge,
    ...opts
  });
}

/**
 * 触发图表 resize
 */
function resize(width?: number, height?: number) {
  if (!chartRef.value) return;

  chartRef.value.resize({ width, height });
  const size = { width: chartRef.value.getWidth(), height: chartRef.value.getHeight() };
  emit("resize", size);
}

/**
 * 销毁实例
 */
function destroy() {
  if (observerRef.value) {
    observerRef.value.disconnect();
    observerRef.value = null;
  }
  if (chartRef.value) {
    chartRef.value.dispose();
    chartRef.value = null;
  }
}

function showChartLoading() {
  if (!chartRef.value) return;
  chartRef.value.showLoading("default", {
    text: "数据加载中..."
    // color: "#409EFF",
    // textColor: "#999",
    // maskColor: "rgba(255, 255, 255, 0.8)",
    // zlevel: 0
  });
}

/**
 * 初始化图表实例
 */
function init() {
  if (!rootRef.value) return;

  destroy();

  chartRef.value = echarts.init(rootRef.value, props.theme, { renderer: props.renderer });

  if (props.group) chartRef.value.group = props.group;
  // 绑定常用事件
  chartRef.value.on("click", params => emit("click", params));

  // 初始配置
  if (props.option) setChartOption(props.option);
  if (props.loading) showChartLoading();

  emit("ready", chartRef.value);

  if (props.autoresize) {
    observerRef.value = new ResizeObserver(() => {
      resize();
    });
    observerRef.value.observe(rootRef.value);
  }
}

/**
 * 监听 option 变化
 */
watch(
  () => props.option,
  val => {
    if (!chartRef.value) return;
    if (val) setChartOption(val);
  },
  { deep: true }
);

/**
 * 监听 loading 和 hasData 变化
 */
watch(
  () => [props.loading, props.hasData],
  val => {
    if (!chartRef.value) return;

    const [_loading, _hasData] = val;

    // loading 状态
    if (_loading) {
      showChartLoading();
    } else {
      chartRef.value.hideLoading();
    }

    // 空数据状态
    setChartOption(
      _hasData
        ? {
            graphic: {
              style: {
                text: ""
              }
            }
          }
        : {
            graphic: {
              type: "text",
              left: "center",
              top: "middle",
              style: {
                text: "暂无数据",
                fontSize: 18,
                fill: "#4b5675"
              }
            }
          }
    );
  }
);

onMounted(init);

onUnmounted(destroy);

/**
 * 对外暴露方法
 * getInstance - 获取 ECharts 实例
 * setOption - 设置图表配置
 * resize - 触发图表 resize
 */
defineExpose({ getInstance, setOption: setChartOption, resize });
</script>

<style scoped></style>
```

### core 代码（提供一些基础配置、工具函数等） ###

```ts:config.ts
// 为了按需引入，使用 ECharts 6 模块化 API
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

// 常用组件（按需注册）
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  DatasetComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  TimelineComponent,
  GraphicComponent
} from "echarts/components";

// 常用图表（按需注册）
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  PictorialBarChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  CandlestickChart,
  BoxplotChart,
  SunburstChart,
  SankeyChart,
  GraphChart,
  ParallelChart,
  ThemeRiverChart,
  LinesChart,
  EffectScatterChart
} from "echarts/charts";

import type {
  BarSeriesOption,
  LineSeriesOption,
  LinesSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  RadarSeriesOption,
  GaugeSeriesOption
} from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  GraphicComponentOption,
  VisualMapComponentOption,
  DataZoomComponentOption,
  MarkAreaComponentOption,
  MarkLineComponentOption
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

echarts.use([
  // 渲染器
  CanvasRenderer,
  // 组件
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  DatasetComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  //   MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  //   TimelineComponent,
  GraphicComponent,
  // 图表
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  //   PictorialBarChart,
  //   RadarChart,
  FunnelChart,
  //   GaugeChart,
  //   HeatmapChart,
  //   MapChart,
  //   TreemapChart,
  //   CandlestickChart,
  //   BoxplotChart,
  //   SunburstChart,
  //   SankeyChart,
  //   GraphChart,
  //   ParallelChart,
  //   ThemeRiverChart,
  LinesChart
  //   EffectScatterChart
]);

type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | LinesSeriesOption
  | PieSeriesOption
  //   | RadarSeriesOption
  //   | GaugeSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | ScatterSeriesOption
  | GraphicComponentOption
  | VisualMapComponentOption
  | DataZoomComponentOption
  | MarkAreaComponentOption
  | MarkLineComponentOption
>;

export { echarts, ECOption };
```

```ts:options.ts
/**
 * 提供图表的一些通用配置选项（可复用） 供业务图表选择使用
 */

/**
 * x轴 坐标轴刻度标签的相关设置
 */
export const xAxisLabel = {
  color: "#909399",
  fontSize: 11,
  rotate: 45
  //   interval: 2 // 每隔2个显示一个标签，避免拥挤
};

/**
 * 网格配置
 */
export const grid = {
  left: 10,
  right: 70,
  top: 60,
  bottom: 80,
  containLabel: true
};
```


```ts:utils.ts
import { getCssVar } from "@/utils";

/**
 * 图表主题配置
 */
export const getChartTheme = () => ({
  /** 字体大小 */
  fontSize: 14,
  /** 字体颜色 */
  fontColor: getCssVar("--text-color"),
  /** 主题颜色 */
  themeColor: getCssVar("--el-color-primary"),
  /** 颜色组 */
  color: [
    getCssVar("--el-color-primary"),
    "#4ABEFF",
    "#EDF2FF",
    "#14DEBA",
    "#FFAF20",
    "#FA8A6C",
    "#FFAF20"
  ]
});

/**
 * 计算Y轴刻度的函数
 * 规则：
 * Y轴：刻度最多5个（包含0),间隔=数据的Y轴最大值/4四舍五入，
 * 只保留整数位置（例：数据最大值100,那么刻度为0,25,50,75,100)
 * @param maxValue - 数据的最大值
 * @returns  Y轴刻度数组
 */
export function calculateYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0];

  const interval = maxValue > 1 ? Math.round(maxValue / 4) : +(maxValue / 4).toFixed(2);

  const ticks: number[] = [];

  for (let i = 0; i <= 4; i++) {
    ticks.push(i * interval);
  }

  // 确保最大值包含在内
  if (ticks[ticks.length - 1] !== maxValue) {
    ticks[ticks.length - 1] = maxValue;
  }

  return ticks;
}
```

## 📦 安装 ##

确保你已经安装了 Vue 3 和 ECharts 6：

```bash
npm install echarts
npm install vue
```

## 🔧 使用方法 ##

### 引入组件 ###

```vue
<template>
  <Chart
    :option="chartOption"
    :loading="isLoading"
    :hasData="hasData"
    @ready="onChartReady"
    @resize="onChartResize"
    @click="onChartClick"
  />
</template>

<script setup>
import Chart from './Chart.vue';
import { ref } from 'vue';

const chartOption = ref({
  title: { text: '示例图表' },
  tooltip: {},
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [10, 20, 30] }]
});

const isLoading = ref(false);
const hasData = ref(true);

function onChartReady(instance) {
  console.log('图表实例已创建:', instance);
}

function onChartResize(size) {
  console.log('图表尺寸调整:', size);
}

function onChartClick(params) {
  console.log('图表点击事件:', params);
}
</script>
```

### Props 说明 ###

|  参数名  |  类型  |  默认值  |  说明 |
| :-----------: | :-----------: | :----: | :----: |
|  option  |  ECOption 或 any  |  无  |  ECharts 的配置项，支持动态更新。 |
|  hasData  |  boolean  |  true  |  是否有数据，用于显示空状态。 |
|  className  |  string  |  无  |  根节点的类名。 |
|  theme  |  string 或 `Record<string, unknown>`  |  无  |  图表的主题名称或主题对象。 |
|  autoresize  |  boolean  |  true  |  父容器尺寸变化时是否自动触发图表 resize。 |
|  renderer  |  "canvas" 或 "svg"  |  "canvas"  |  渲染器类型，支持 canvas 或 svg。 |
|  width  |  string  |  "100%"  |  图表容器的宽度。 |
|  height  |  string  |  "360px"  |  图表容器的高度。 |
|  loading  |  boolean  |  false  |  是否显示加载状态。 |
|  notMerge  |  boolean  |  false  |  setOption 方法的 notMerge 参数，用于是否合并配置项。 |
|  lazyUpdate  |  boolean  |  true  |  setOption 方法的 lazyUpdate 参数，用于是否延迟更新。 |
|  replaceMerge  |  string 或 string[]  |  无  |  setOption 方法的 replaceMerge 参数，用于指定完全替换的配置部分。 |
|  group  |  string  |  无  |  图表联动的 group 名称，用于实现多个图表之间的联动。 |

### 事件说明 ###

|  事件名  |  参数说明   |  说明 |
| :-----------: | :-----------: | :----: |
|  ready  |  `instance: EChartsInstance`  |  图表实例创建完成后触发。 |
|  resize  |  `{ width: number; height: number }`  |   图表触发尺寸调整时触发。  |
|  click  |  `params: unknown`  |   图表触发点击事件时触发。  |

### 方法说明 ###

通过 defineExpose 暴露以下方法，供父组件调用：

|  方法名  |  参数说明   |  说明 |
| :-----------: | :-----------: | :----: |
|  getInstance  |  无   |  获取当前的 ECharts 实例。 |
|  setOption  |  `option: ECOption`   |  设置图表配置，支持动态更新。 |
|  resize  |  `width?: number, height?: number`   |  手动触发图表的 resize 方法。 |

#### 组件功能示例 demo ####

```vue
<template>
  <div class="page-container page">
    <h2>通用图表组件演示</h2>
    <div>
      <ElRow>
        <ElCol :span="12">
          <Chart
            :option="barOption"
            :loading="loading"
            height="320px"
            :has-data="hasData"
            @ready="onReady('bar')"
          />
        </ElCol>
        <ElCol :span="12">
          <Chart :option="lineOption" height="320px" @ready="onReady('line')" />
        </ElCol>
      </ElRow>

      <Chart :option="barOption2" height="320px" @ready="onReady('line')" />
      <Chart :option="pieOption" height="320px" @ready="onReady('pie')" />
      <Chart :option="scatterOption" height="320px" @ready="onReady('scatter')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElRow, ElCol } from "element-plus";
import Chart from "@/components/Chart/inde.vue";
import { ECOption } from "@/components/Chart/core";
import { getCssVar } from "@/utils";

const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const rand = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

// 模拟数据
const barData = categories.map(() => rand(12, 200));
const lineData = categories.map(() => rand(10, 150));
const scatterData = Array.from({ length: 40 }).map(() => [rand(0, 100), rand(0, 100)]);

const loading = ref(true);
const hasData = ref(false);

const barOption = ref<ECOption>({});

setTimeout(() => {
  barOption.value = {
    color: [getCssVar("--el-color-primary")],
    title: { text: "柱状图" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: [], label: { show: true } }]
  };
  loading.value = false;
  hasData.value = false;

  setTimeout(() => {
    barOption.value.series![0].data = barData;
    hasData.value = true;
  }, 2000);
}, 3000);

const lineOption = ref({
  title: { text: "折线图" },
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: categories },
  yAxis: { type: "value" },
  series: [{ type: "line", data: lineData, smooth: true }]
});

const pieOption = ref({
  color: ["#4ABEFF", "#EDF2FF", "#14DEBA", "#FFAF20", "#FA8A6C", "#FFAF20"],
  title: { text: "饼图" },
  tooltip: { trigger: "item" },
  legend: { top: "bottom" },
  series: [
    {
      type: "pie",
      radius: ["30%", "70%"],
      roseType: "radius",
      itemStyle: { borderRadius: 6 },
      data: categories.map((c, i) => ({ value: rand(20, 100), name: c }))
    }
  ]
});

const scatterOption = ref({
  title: { text: "散点图" },
  tooltip: { trigger: "item" },
  xAxis: {},
  yAxis: {},
  series: [{ type: "scatter", data: scatterData }]
});

const barOption2 = ref<ECOption>({
  legend: {},
  tooltip: {},
  dataset: {
    dimensions: ["product", "2015", "2016", "2017"],
    source: [
      { product: "Matcha Latte", 2015: 43.3, 2016: 85.8, 2017: 93.7 },
      { product: "Milk Tea", 2015: 83.1, 2016: 73.4, 2017: 55.1 },
      { product: "Cheese Cocoa", 2015: 86.4, 2016: 65.2, 2017: 82.5 },
      { product: "Walnut Brownie", 2015: 72.4, 2016: 53.9, 2017: 39.1 }
    ]
  },
  xAxis: { type: "category" },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }]
});

function onReady(name: string) {
  // 可在此联动、注册事件等
}
</script>

<style lang="scss" scoped>
.page {
  padding: 16px;
}
</style>
```
