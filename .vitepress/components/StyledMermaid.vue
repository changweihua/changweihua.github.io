<template>
  <div class="mermaid-graph">
    <div class="graph-div" ref="svgRef"></div>
    <div class="sketch-div">
      <svg ref="sketchSvgRef"></svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useData } from 'vitepress'
import { ref, onMounted, watch } from 'vue'
import * as roughjs from 'svg2roughjs'
import mermaid from 'mermaid'
import { delay } from 'lodash-es'

const svgRef = ref()
const sketchSvgRef = ref()

async function makeRough(svg: SVGSVGElement) {
  // const svgEle = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  // svgEle.innerHTML = svg
  const svg2roughjs = new roughjs.Svg2Roughjs(sketchSvgRef.value)
  svg2roughjs.svg = svg
  svg2roughjs.fontFamily = "AlibabaPuHuiTi"
  // svg2roughjs.randomize = true
  await svg2roughjs.sketch(false)

  svgRef.value.innerHTML = ''
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

const { isDark } = useData()

watch(() => isDark.value, async (nVal, oVal) => {
  console.log(`current theme from ${oVal} to ${nVal}`)

  // mermaid.mermaidAPI.setConfig({
  //   theme: nVal ? 'dark' : 'forest',
  // })

  await render(props.id, decodeURIComponent(props.code!))
})

const props = defineProps({
  id: String,
  code: String,
})


const render = async (id, code) => {
  // mermaid 初始化
  mermaid.initialize({ startOnLoad: false, theme: isDark.value ? 'dark' : 'forest', fontFamily: "AlibabaPuHuiTi" })

  svgRef.value.innerHTML = ''

  const { svg } = await mermaid.render(id, code)

  svgRef.value.innerHTML = svg
  makeRough(svgRef.value.querySelector('svg'))
  delay(function () {
    // makeRough(svgRef.value.querySelector('svg'))
  }, 300)
}
// 在组件挂载后进行mermaid渲染
onMounted(async () => {
  await render(props.id, decodeURIComponent(props.code!))
})

</script>
