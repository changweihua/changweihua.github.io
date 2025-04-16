<template>
  <div class="mermaid-graph">
    <div class="graph-div" ref="svgRef"></div>
    <div class="sketch-div cursor-pointer position-relative" ref="sketchRef">
      <div
        class="download flex flex-row gap-3"
        style="position: absolute; right: 6px; top: 6px; cursor: pointer"
      >
        <m-icon
          v-aria-empty
          :icon="
            isFullElementTag
              ? 'icon-park-outline:off-screen-one'
              : 'icon-park-outline:full-screen-one'
          "
          @click="toggleFullscreen()"
          :width="24"
          :height="24"
        />
        <m-icon
          v-aria-empty
          icon="line-md:download-loop"
          @click="downloadData"
          :width="24"
          :height="24"
        />
      </div>
      <svg ref="sketchSvgRef"></svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useData, inBrowser } from "vitepress";
import { onMounted, watch, toRaw, useTemplateRef, onUnmounted, ref } from "vue";
import * as roughjs from "svg2roughjs";
import mermaid, { MermaidConfig } from "mermaid";
import svgPanZoom, { Instance } from "@dash14/svg-pan-zoom";
import { useScreenfullEffect } from "../utils/useScreenfullEffect";
import { delay } from "lodash-es";

const { page } = useData();
const { frontmatter } = toRaw(page.value);
console.log("mermaid frontmatter", frontmatter);

const svgRef = useTemplateRef<HTMLDivElement>("svgRef");
const sketchRef = useTemplateRef<HTMLDivElement>("sketchRef");
const sketchSvgRef = useTemplateRef<SVGSVGElement>("sketchSvgRef");

let mut: MutationObserver;
let panZoomTiger: Instance;

const { handleFullscreenElement, isFullElementTag } = useScreenfullEffect();

function toggleFullscreen() {
  handleFullscreenElement(sketchRef.value!);
  delay(function () {
    if (panZoomTiger) {
      panZoomTiger.resize();
      panZoomTiger.updateBBox();
      panZoomTiger.center();
    }
  }, 500);
}

async function makeRough(svg: SVGSVGElement, id: string) {
  // const svgEle = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  // svgEle.innerHTML = svg
  const svg2roughjs = new roughjs.Svg2Roughjs(sketchSvgRef.value!);
  svg2roughjs.svg = svg;
  svg2roughjs.fontFamily = "Fangyuan";
  // svg2roughjs.randomize = true
  await svg2roughjs.sketch(false);

  svgRef.value!.innerHTML = "";
  const sketch = sketchSvgRef.value;
  if (sketch) {
    const height = sketch.getAttribute("height");
    const width = sketch.getAttribute("width");
    sketch.setAttribute("height", "100%");
    sketch.setAttribute("width", "100%");
    sketch.setAttribute("id", `${id}r`);
    sketch.setAttribute("viewBox", `0 0 ${width} ${height}`);
    sketch.style.maxWidth = "100%";
  }
}

async function makePanZoom(svg: SVGSVGElement, id: string) {
  // import('svg-pan-zoom').then((module) => {
  // use code
  // console.log(module)
  // const svgPanZoom = module.default
  // let svg = container.getBBox();
  const height = svg.getBBox().height;
  const aHeight = height > 800 ? 800 : height;
  svg.setAttribute("style", "height: " + aHeight + "px;overflow:scroll;");

  if (!panZoomTiger) {
    panZoomTiger = svgPanZoom(`#${props.id}r`, {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
    });
  }
  panZoomTiger.resize();
  panZoomTiger.updateBBox();
  // })
}

function downloadData() {
  const sketch = sketchSvgRef.value;
  if (sketch) {
    let svg = sketch.cloneNode(true) as SVGSVGElement;

    // remove svg-pan-zoom-controls for the download file
    svg.getElementById("svg-pan-zoom-controls")?.remove();

    let serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    source = source.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
    source = source.replace(/ns\d+:href/g, "xlink:href"); // Safari NS namespace fix.

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
      );
    }

    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, source], {
      type: "image/svg+xml;charset=utf-8",
    });
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    let name = props.id + ".svg";

    downloadLink.download = name;
    downloadLink.href = svgUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

// const { isDark } = useData()

// watch(() => isDark.value, async (nVal, oVal) => {
//   console.log(`current theme from ${oVal} to ${nVal}`)

//   // mermaid.mermaidAPI.setConfig({
//   //   theme: nVal ? 'dark' : 'forest',
//   // })

//   await renderChart(props.id, decodeURIComponent(props.code!))
// })

const props = defineProps({
  id: String,
  code: String,
});

const pluginSettings = ref<MermaidConfig>({
  securityLevel: "loose",
  startOnLoad: false,
  fontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
});

const renderChart = async (id, code) => {
  const hasDarkClass = document.documentElement.classList.contains("dark");

  let mermaidConfig: MermaidConfig = {
    ...pluginSettings.value,
  };

  if (hasDarkClass) mermaidConfig.theme = "dark";
  // mermaid 初始化
  mermaid.initialize(mermaidConfig);

  // mermaid.run({
  //   querySelector: id,
  //   postRenderCallback: (id) => {
  //     console.log(id);
  //   }
  // });

  if (svgRef.value) {
    svgRef.value.innerHTML = "";

    const { svg } = await mermaid.render(id, code);
    // const svgCode = await mermaid.render(id, code)

    svgRef.value.innerHTML = svg;
    await makeRough(svgRef.value.querySelector("svg")!, id);

    if (inBrowser) {
      await makePanZoom(sketchSvgRef.value!, `${props.id}r`);
    }

    // // This is a hack to force v-html to re-render, otherwise the diagram disappears
    // // when **switching themes** or **reloading the page**.
    // // The cause is that the diagram is deleted during rendering (out of Vue's knowledge).
    // // Because svgCode does NOT change, v-html does not re-render.
    // // This is not required for all diagrams, but it is required for c4c, mindmap and zenuml.
    // const salt = Math.random().toString(36).substring(7);
    // svgRef.value.innerHTML = `<span style="display: none">${salt}</span>`;
  }
};
// 在组件挂载后进行mermaid渲染
onMounted(async () => {
  // let settings = await import("virtual:mermaid-config");
  // if (settings?.default) pluginSettings.value = settings.default;

  mut = new MutationObserver(
    async () => await renderChart(props.id, decodeURIComponent(props.code!)),
  );
  mut.observe(document.documentElement, { attributes: true });
  await renderChart(props.id, decodeURIComponent(props.code!));

  // mut = new MutationObserver(async () => await renderChart(props.id, decodeURIComponent(props.code!)));
  // mut.observe(document.documentElement, { attributes: true });
});

onUnmounted(() => mut?.disconnect());
</script>

<style lang="less" scoped>
// .mermaid-graph {
//   // :deep(.text-container) * {
//   //   font-family: Fangyuan !important;
//   // }

//   // background-image: url("/images/mermaid-background.svg");
//   // background-repeat: no-repeat;
//   // background-size: cover;
// }
</style>

