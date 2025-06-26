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
  ref,
  watch,
  useTemplateRef,
  nextTick,
  shallowRef,
} from "vue";
import * as echarts from "echarts";
import { deepmerge } from "deepmerge-ts";
import { baseThemeOption } from "../assets/echarts/echarts.option";
import ElementResize from "element-resize-detector";
import { debounce } from "lodash-es";

const props = defineProps({
  id: String,
  code: String,
});

const chartRef = useTemplateRef<HTMLDivElement>("chartRef");

const { isDark } = useData();

const initChart = (theme: string) => {
  myChart && myChart.dispose();
  myChart = echarts.init(chartRef.value!, theme, { renderer: "svg" });

  myChart.setOption(
    // @ts-ignore
    deepmerge(baseThemeOption, JSON.parse(decodeURIComponent(props.code!))),
  );
};

watch(
  () => isDark.value,
  (nVal, oVal) => {
    console.log(`isDark from ${oVal} to ${nVal}`);
    initChart(isDark.value ? "dark" : "light");
  },
);

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations, instance) {
  mutations.forEach(function (mutation) {
    const div = mutation.target as HTMLElement;
    console.log("div", div);
    // if (div && div.classList && div.classList.contains("rough-mermaid")) {
    //   const svg = div.querySelector("svg");
    //   if (!svg) {
    //     return;
    //   }

    //   console.log(svg.id);
    //   // TODO: 此时开始加载第三方脚本
    //   observer.disconnect();
    // }
  });
});
// 配置MutationObserver实例
const config = {
  attributes: true,
  childList: true, // 观察直接子节点
  subtree: true, // 及其更低的后代节点
  characterData: true,
  characterDataOldValue: true, // 将旧的数据传递给回调
};

onBeforeUnmount(() => {
  observer.disconnect();
  chartRef.value && elementResize.uninstall(chartRef.value);
});

let myChart: echarts.ECharts;

onMounted(() => {
  elementResize.listenTo(chartRef.value!, debounce(resizeChart, 500));
  nextTick(() => {
    initChart(isDark.value ? "dark" : "light");
  });
  // observer.observe(chartRef.value, config);
});

const resizeChart = () => {
  console.log("resizeChart");
  nextTick(function () {
    myChart && myChart.resize();
  });
};

const elementResize = ElementResize({
  strategy: "scroll",
  callOnAdd: true,
});
</script>

<style scoped>
.chart-div {
  width: 100%;
  min-height: 300px;
}
</style>
