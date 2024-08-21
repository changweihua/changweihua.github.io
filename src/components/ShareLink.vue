<template>
  <ConfigProvider>
    <Paragraph :copyable="{ text: shareLink }">复制分享链接</Paragraph>
  </ConfigProvider>
</template>

<script lang="ts" setup>
import ConfigProvider from "./ConfigProvider.vue";
import { Typography } from "ant-design-vue";
import { ref, onMounted } from "vue";
const { Paragraph } = Typography;

const shareLink = ref("");

onMounted(() => {
  shareLink.value = window.location.href;
});
</script>
