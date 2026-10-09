---
layout: page
sidebar: false
title: changweihua.github.io 最新文章 CMONO.NET
---

<ClientOnly>
  <SpinHolder :spinning="spinning" type="bounce" :fullscreen="spinning" tip="加载中...">
    <div class="flex p-6 justify-center items-center">
      <ArchiveList />
    </div>
  </SpinHolder>
</ClientOnly>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { delay } from "lodash-es";
import ArchiveList from '@/components/ArchiveList.vue'
import SpinHolder from "@vp/components/CubeSpin.vue"


const spinning = ref(true);

onMounted(() => {
  delay(function() {
    spinning.value = false;
  }, 3000)
});
</script>
