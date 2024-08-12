<script setup lang="ts">
import { onMounted } from 'vue'
import { Svg2Roughjs, OutputType } from 'svg2roughjs'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// import mermaid from "mermaid";

const { frontmatter } = useData()
const { Layout } = DefaultTheme
// const isHome = computed(() => unref(page)?.filePath === 'index.md')

// const targetNode = document.body
const mermaids = new Set<string>()

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    // console.log('元素类型:', mutation.type);
    // console.log('元素属性:', mutation.attributeName);
    // console.log('元素值:', mutation.newValue);
    if (document.querySelector('.mermaid svg')) {
      const svg = document.querySelector<SVGSVGElement>('.mermaid svg')
      console.log(svg)

      if (!svg) {
        return
      }

      // TODO: 此时开始加载第三方脚本
      if (!mermaids.has(svg.id)) {
        mermaids.add(svg.id)
      }

      if (mermaids.values.length === parseInt(frontmatter['mermaids'])) {
        observer.disconnect(); // 销毁监视者
      }

      const sketchContainer = document.createElement('div')
      sketchContainer.setAttribute("type", "text");
      const sketchContainerId = `sketch-div-${svg.id}`
      sketchContainer.setAttribute("id", sketchContainerId);
      svg.parentElement?.appendChild(sketchContainer)
      const svg2roughjs = new Svg2Roughjs(`#${sketchContainerId}`, OutputType.SVG)
      // const graphDiv = document.querySelector<SVGSVGElement>('#graph-div');
      svg2roughjs.svg = svg!
      svg2roughjs.fontFamily = "AlibabaPuHuiTi"
      svg2roughjs.sketch(true)
      svg?.remove()
      const sketch = document.querySelector<HTMLElement>(`#${sketchContainerId} > svg`);
      if (sketch) {
        const height = sketch.getAttribute('height');
        const width = sketch.getAttribute('width');
        sketch.setAttribute('height', '100%');
        sketch.setAttribute('width', '100%');
        sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
        sketch.style.maxWidth = '100%';
      }
    }
    // if (mutation.type === 'childList') {
    //   // 处理子节点列表的变化
    // } else if (mutation.type === 'attributes') {
    //   // 处理属性的变化
    // } else if (mutation.type === 'characterData') {
    //   // 处理字符数据的变化
    // }
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

onMounted(() => {
  console.log(frontmatter.value['mermaids'])
  if (frontmatter.value['mermaids'] && frontmatter.value['mermaids'] > 0) {
    // observer.observe(targetNode, config);
  }
})

</script>

<template>
  <Layout>
    <template #doc-after>
      <!-- 首页 Layout 使用的是 doc 所以需要判断，如果是 page 不会使用插槽 -->
      <!-- <Comment v-if="!isHome" :key="page.filePath"></Comment> -->
    </template>
  </Layout>
</template>
