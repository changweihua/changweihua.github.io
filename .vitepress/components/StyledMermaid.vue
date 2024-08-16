<template>
  <div class="mermaid-graph">
    <div class="graph-div" ref="svgRef"></div>
    <div class="sketch-div cursor-pointer position-relative" ref="sketchRef">
      <div class="download" @click="downloadData" style="position:absolute;right:6px;top: 6px;cursor:pointer">
        <!-- <i class="i-line-md:download-loop" /> -->
        <my-icon icon="line-md:download-loop" :width="24" :height="24" />
      </div>
      <svg ref="sketchSvgRef"></svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useData } from 'vitepress'
import { ref, onMounted, watch } from 'vue'
import * as roughjs from 'svg2roughjs'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'

const svgRef = ref()
const sketchRef = ref<HTMLDivElement>()
const sketchSvgRef = ref<SVGSVGElement>()

async function makeRough(svg: SVGSVGElement, id: string) {
  // const svgEle = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  // svgEle.innerHTML = svg
  const svg2roughjs = new roughjs.Svg2Roughjs(sketchSvgRef.value!)
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
    sketch.setAttribute('id', `${id}r`);
    sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
    sketch.style.maxWidth = '100%';
  }

}

async function makePanZoom(svg: SVGSVGElement, id: string) {
  // let svg = container.getBBox();
  let height = svg.getBBox().height;
  let aHeight = height > 800 ? 800 : height;
  svg.setAttribute('style', 'height: ' + aHeight + 'px;overflow:scroll;');
  let panZoomTiger = svgPanZoom('#' + id, {
    zoomEnabled: true,
    controlIconsEnabled: false
  });
  panZoomTiger.resize();
  panZoomTiger.updateBBox();
}

function downloadData() {
  const sketch = sketchSvgRef.value;
  if (sketch) {
    let svg = sketch.cloneNode(true) as SVGSVGElement;

    // remove svg-pan-zoom-controls for the download file
    svg.getElementById("svg-pan-zoom-controls")?.remove();

    let serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    source = source.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    source = source.replace(/ns\d+:href/g, 'xlink:href'); // Safari NS namespace fix.

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, source], { type: "image/svg+xml;charset=utf-8" });
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    let name = props.id + '.svg';

    downloadLink.download = name;
    downloadLink.href = svgUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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

  mermaid.run({
    querySelector: id,
    postRenderCallback: (id) => {
      console.log(id);
    }
  });

  svgRef.value.innerHTML = ''

  const { svg } = await mermaid.render(id, code)

  svgRef.value.innerHTML = svg
  await makeRough(svgRef.value.querySelector('svg'), id)

  await makePanZoom(sketchSvgRef.value!, `${props.id}r`)
}
// 在组件挂载后进行mermaid渲染
onMounted(async () => {
  await render(props.id, decodeURIComponent(props.code!))
})

</script>
