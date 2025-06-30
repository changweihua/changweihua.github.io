---
layout: home
layoutClass: m-nav-layout
pageClass: index-page-class
title: CMONO.NET
titleTemplate: Home Page

description: CMONO.NET Official Page Site

hero:
  name: "常伟华"
  text: "DOTNET Developer"
  tagline: 阳光大男孩
  image:
    src: /cwh.svg
    alt: CMONO.NET
  actions:
    - theme: brand
      text: Resume
      link: /en-US/resume
    - theme: alt
      text: Github
      link: https://github.com/changweihua


features:
  - title: Airport
    icon:
      src: /baggage.svg
      alt: 无锡硕放机场
    details: 无锡硕放机场
    link: /en-US/gallery/Airport
  - title: AirStrip
    icon:
      src: /baggage.svg
      alt: 无锡硕放机场
    details: 无锡硕放机场
    link: /en-US/gallery/AirStrip
  - title: ThreePlane
    icon:
      src: /baggage.svg
      alt: 无锡硕放机场
    details: 无锡硕放机场
    link: /en-US/gallery/ThreePlane

importMap: {
  "plotty": "https://esm.sh/plotty",
  "geotiff": "https://esm.sh/geotiff@2.1.3",
}
---

# Heading

::: stepper
Paragraph

- List item #1
- List item #2
:::

::: stepper This is a title
Another paragraph

- Another list item #1
- Another list item #2
:::

# Heading

:::: stepper This is a title
Paragraph

- List item #1
- List item #2

::: stepper This is another title
Nested paragraph

- Nested list item #1
- Nested list item #2
:::
::::

## 使用 plotty 渲染 tiff 数据

<sfc-playground src="../src/components/FireWorks.vue" language="vue" title="plotty" desc="plotty渲染"></sfc-playground>

<script lang="ts" setup>
</script>

<style scoped>
@media only screen and (max-width: 768px) {
  /** add more styles */
  .stepper .card,
  /** default moves left */
  .stepper-content .vp-code-group {
    margin-left: -3rem;
  }
}
</style>
