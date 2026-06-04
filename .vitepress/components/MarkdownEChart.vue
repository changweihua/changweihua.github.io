<template>
  <div :id="props.id" ref="chartRef" class="chart-div">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useData } from "vitepress";
import {
  onMounted,
  onBeforeUnmount,
  watch,
  useTemplateRef,
  nextTick,
} from "vue";
import * as echarts from "echarts";
import { deepmerge } from "deepmerge-ts";
import { baseThemeOption } from "../assets/echarts/echarts.option";

const props = defineProps({
  id: String,
  code: String,
});

const chartRef = useTemplateRef<HTMLDivElement>("chartRef");

let myChart: echarts.ECharts;

const { isDark } = useData();

const initChart = (theme: string) => {
  myChart && myChart.dispose();
  myChart = echarts.init(chartRef.value!, theme, { renderer: "svg" });

  myChart.setOption(
    // @ts-ignore
    deepmerge(baseThemeOption, JSON.parse(decodeURIComponent(props.code!)))
  );
};

watch(
  () => isDark.value,
  (nVal, oVal) => {
    initChart(isDark.value ? "dark" : "light");
  }
);
let resizeTimer: number;
// 创建 ResizeObserver 实例
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // 仅处理目标容器的尺寸变化
    // if (entry.target === myChart.getDom()) {
    if (entry.target === chartRef.value!) {
      // 防抖处理：避免高频 resize 导致的性能问题
      resizeTimer && clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        myChart.resize({
          animation: { duration: 300 }, // 可选：启用过渡动画
        });
      }, 100);
    }
  }
});

onBeforeUnmount(() => {
  // 销毁图表与监听器
  myChart && myChart.dispose();
  resizeObserver.disconnect();
});

onMounted(() => {
  nextTick(() => {
    initChart(isDark.value ? "dark" : "light");
  });
  chartRef.value && resizeObserver.observe(chartRef.value);
});

const resizeChart = () => {
  nextTick(function () {
    myChart && myChart.resize();
  });
};
</script>

<style scoped>
.chart-div {
  width: 100%;
  min-height: 300px;
}
</style>
