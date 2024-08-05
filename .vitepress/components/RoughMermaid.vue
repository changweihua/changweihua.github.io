<template>
  <div ref="graphRef" class="graph-div">
    <slot></slot>
  </div>
  <div class="sketch-div">
    <svg ref="sketchSvgRef"></svg>
  </div>
</template>


<script lang="ts" setup>
import { Svg2Roughjs } from 'svg2roughjs'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const graphRef = ref()
const sketchSvgRef = ref()

async function makeRough(svg: SVGSVGElement, div: HTMLElement) {
  console.log(svg, div)
  const svg2roughjs = new Svg2Roughjs(sketchSvgRef.value)
  svg2roughjs.svg = svg
  svg2roughjs.fontFamily = "AlibabaPuHuiTi"
  await svg2roughjs.sketch(false)
  graphRef.value.remove()
  const sketch = sketchSvgRef.value;
  if (sketch) {
    const height = sketch.getAttribute('height');
    const width = sketch.getAttribute('width');
    sketch.setAttribute('height', '100%');
    sketch.setAttribute('width', '100%');
    sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
    sketch.style.maxWidth = '100%';
  }
}

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations, instance) {
  mutations.forEach(function (mutation) {
    const div = mutation.target as HTMLElement
    if (div && div.classList && div.classList.contains('rough-mermaid')) {
      const svg = div.querySelector('svg')
      if (!svg) {
        return
      }

      console.log(svg.id)
      // TODO: 此时开始加载第三方脚本
      observer.disconnect();

      makeRough(svg, div)
    }
  });
});
// 配置MutationObserver实例
const config = {
  attributes: true,
  childList: true, // 观察直接子节点
  subtree: true, // 及其更低的后代节点
  characterData: true,
  characterDataOldValue: true // 将旧的数据传递给回调
};

onBeforeUnmount(() => {
  observer.disconnect();
})

onMounted(() => {
  observer.observe(graphRef.value, config);
})
</script>
