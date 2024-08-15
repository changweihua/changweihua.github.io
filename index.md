---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
layoutClass: m-nav-layout
pageClass: index-page-class
title: CMONO.NET
titleTemplate: 首页

description: CMONO.NET Official Page Site

---

<script setup lang="ts">
import { useRouter } from 'vitepress'

const router = useRouter()
// router.onBeforeRouteChange = (to: string) => false;
router.go('/en-US/')

// window.location.replace(`${window.location.href}zh-CN/`)

</script>
