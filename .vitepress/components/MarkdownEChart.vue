<template>
  <div :id="props.id" ref="chartRef" class="chart-div">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useData } from "vitepress";
import { onMounted, onBeforeUnmount, ref, watch, useTemplateRef, nextTick } from "vue";
import * as echarts from 'echarts';
import { deepmerge } from "deepmerge-ts";
import { baseThemeOption } from "../assets/echarts/echarts.option";

const props = defineProps({
  id: String,
  code: String,
});

const chartRef = useTemplateRef<HTMLDivElement>("chartRef");

const { isDark } = useData();

watch(
  () => isDark.value,
  (nVal, oVal) => {
    console.log(`current theme from ${oVal} to ${nVal}`);
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
});

onMounted(() => {
  nextTick(() => {
    const myChart = echarts.init(chartRef.value!)

    // @ts-ignore
    myChart.setOption(deepmerge(baseThemeOption, JSON.parse(decodeURIComponent(props.code!))))
  })
  // observer.observe(chartRef.value, config);
});
</script>

<style lang="less" scoped>
.chart-div {
  width: 100%;
  min-height: 300px;
}
</style>
