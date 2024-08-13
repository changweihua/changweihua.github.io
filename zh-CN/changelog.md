---
layout: page
title: changweihua.github.io 最新文章 CMONO.NET
---

<a-config-provider
  :theme="{
    token: {
      fontFamily: 'AlibabaPuHuiTi'
    },
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  }"
>
  <a-card title="更新日志" :bordered="true" :hoverable="true">
    <a-timeline mode="alternate">
      <a-timeline-item  :color="index % 2 === 0 ? 'green': 'red'" v-for="(c, index) in changelog">{{dayjs.tz(c.date).format('YYYY-MM-DD HH:mm')}} {{c.message}}</a-timeline-item>
    </a-timeline>
      <!-- <p>本节主要介绍了如何安装 Ant Design Vue 并且进行暗黑模式适配。</p>
      <p>例如这个卡片就是使用 Ant Card 实现的内容。</p> -->
  </a-card>
</a-config-provider>

<script lang="ts" setup>
import { theme } from 'ant-design-vue';
import { ref, unref, toRaw, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import dayjs from 'dayjs'

const { page, isDark } = useData()
console.log(toRaw(page.value))

const { changelog } = page.value.CommitData

</script>
