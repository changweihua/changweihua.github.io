---
lastUpdated: true
commentabled: true
recommended: true
title: 纯前端 PDF 旋转方案实战
description: Vue 3 + pdf-lib 在浏览器里修正页面方向
date: 2026-07-22 09:45:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

最近在处理 PDF 工具箱的旋转功能时，发现大部分在线工具要么需要上传文件到服务器，要么用 Canvas 重新渲染导致矢量内容变糊。这篇文章记录一下我们如何用 `pdf-lib` 在浏览器端直接修改 PDF 页面旋转元数据，做到不上传、不失真、可离线。

## 为什么坚持纯前端处理

用户上传的 PDF 可能是合同、扫描件、发票、病历，这些文件并不适合上传到第三方服务器。纯前端方案的优势很明显：

- 文件不离开用户设备，隐私风险最低
- 没有后端带宽和存储成本
- 不受服务器文件大小限制
- 页面加载完成后可以离线使用

代价也很直接：能做什么完全取决于浏览器能力。对于旋转页面这种操作，pdf-lib 刚好够用。

## 技术栈

- Vue 3 + Composition API：UI 状态管理
- pdf-lib：读取、修改、保存 PDF
- File API：读取用户上传的文件

```bash
npm install pdf-lib
```

## 核心思路

PDF 页面本身有旋转属性。我们不需要把每一页画到 Canvas 再导出，而是直接修改每页的 Rotation 元数据。这样：

- 文字仍然是可选中的文字
- 矢量图形不会变糊
- 文件大小基本不变
- 处理速度极快

## 加载 PDF

```javascript
import { PDFDocument } from 'pdf-lib'
​
async function loadPdf(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer()
  return await PDFDocument.load(arrayBuffer)
}
```

## 旋转指定页面

`pdf-lib` 的 `Page.setRotation()` 接收一个角度对象。常见角度是 90°、180°、270°。

```typescript
function rotatePages(pdfDoc: PDFDocument, angle: number, selectedPages?: number[]): PDFDocument {
  const pages = pdfDoc.getPages()
  const targets = selectedPages ?? pages.map((_, i) => i)
  targets.forEach((index) => {
    const page = pages[index]
    if (!page) return // 注意：要基于当前旋转角度累加，而不是直接覆盖
    const current = page.getRotation().angle
    page.setRotation({ angle: (current + angle) % 360 })
  })
  return pdfDoc
}
```

这里的关键细节是*读取现有旋转角度再叠加*。有些 PDF 在生成时已经带了一个基础旋转值，直接覆盖容易把方向搞得更乱。

## 保存并触发下载

```ts
async function downloadPdf(pdfDoc: PDFDocument, filename: string) {
  const bytes = await pdfDoc.save()
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

## Vue 3 组件示例

```vue
<template>
   
  <div class="rotate-tool">
       <input
      type="file"
      accept="application/pdf"
      @change="handleFile"
    />
    ​    <select v-model="angle">
           
      <option :value="90">顺时针 90°</option>
           
      <option :value="180">180°</option>
           
      <option :value="270">顺时针 270°</option>
         
    </select>
    ​    <button
      @click="rotate"
      :disabled="!pdfDoc"
    >
      旋转 PDF
    </button>
     
  </div>
</template>
​
<script setup lang="ts">
  import { ref } from 'vue'
  import { PDFDocument } from 'pdf-lib'
  const pdfDoc = ref<PDFDocument | null>(null)
  const angle = ref(90)
  const originalName = ref('')
  async function handleFile(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    originalName.value = file.name.replace(/.pdf$/i, '')
    const buffer = await file.arrayBuffer()
    pdfDoc.value = await PDFDocument.load(buffer)
  }
  async function rotate() {
    if (!pdfDoc.value) return
    const pages = pdfDoc.value.getPages()
    pages.forEach((page) => {
      const current = page.getRotation().angle
      page.setRotation({ angle: (current + angle.value) % 360 })
    })
    await downloadPdf(pdfDoc.value, `${originalName.value}-rotated.pdf`)
  }
  async function downloadPdf(pdfDoc: PDFDocument, filename: string) {
    const bytes = await pdfDoc.save()
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
</script>
```

## 支持部分页面旋转

实际产品中，用户可能只想旋转其中几页。实现方式完全一样，只是传入选中的页码数组：

```ts
const selectedPages = [0, 2, 5] // 第 1、3、6 页
rotatePages(pdfDoc, 90, selectedPages)
```

## 为什么不直接用 Canvas 旋转

用 Canvas 画一遍再导出 PDF 也能实现旋转，但有几个明显问题：

- 文字变图片：原本可选中的文字被栅格化，文件变大
- 矢量图形失真：图标、图表变成位图，放大后变糊
- 处理慢：需要逐页渲染，大文件会卡死
- 破坏原有结构：书签、链接、表单等信息可能丢失

直接改旋转元数据就没有这些问题。

## 实际踩坑

### 加密 PDF 会加载失败

带打开密码的 PDF 直接 `PDFDocument.load()` 会抛异常。需要先引导用户用解密工具处理，或者调用 `PDFDocument.load(arrayBuffer, { password })`。

### 某些扫描件的旋转角度嵌在图片里

如果 PDF 每一页就是一张扫描图片，旋转页面角度后图片本身方向正确，这种情况没有问题。但如果扫描时图片已经被旋转过，而页面角度又是 0°，那改角度也没用——不过这种情况比较少见。

### 大文件内存占用

pdf-lib 会把整个 PDF 加载到内存。几百页的超大文件在低端设备上可能吃紧。我们在产品里加了一个提示："超大文件处理可能较慢"。

## 效果

最终上线的版本支持：

- 全部页面旋转
- 指定页面旋转
- 90° / 180° / 270° 三种角度
- 顺时针 / 逆时针选择
- 文件不上传，纯浏览器本地处理

## 总结

pdf-lib 修改页面旋转元数据的方式，是做纯前端 PDF 旋转最轻量、最高质量的方案。比 Canvas 重渲染更保真，比上传服务器更安全。如果你的项目也有类似需求，建议直接走这条路线。

如果你在找功能更全面的桌面 PDF 编辑器，可以考虑 Wondershare PDFelement，支持 OCR、表单编辑、数字签名等高级功能。
