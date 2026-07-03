---
layout: page
sidebar: true
---

<div class="p-6">
    <a-radio-group v-model:value="size" style="margin-bottom: 16px">
      <a-radio-button value="small">Small</a-radio-button>
      <a-radio-button value="default">Default</a-radio-button>
      <a-radio-button value="large">Large</a-radio-button>
    </a-radio-group>
    <a-tabs v-model:activeKey="activeKey" :size="size">
      <a-tab-pane key="1" tab="Tab 1">
        <LunarCalendar />
      </a-tab-pane>
      <a-tab-pane key="2" tab="Tab 2">Content of tab 2</a-tab-pane>
      <a-tab-pane key="3" tab="Tab 3">Content of tab 3</a-tab-pane>
    </a-tabs>
  </div>

<script lang="ts" setup>
import { ref } from 'vue';
import type { TabsProps } from 'ant-design-vue';
import LunarCalendar from "@/components/LunarCalendar.vue"

const size = ref<TabsProps['size']>('small');
const activeKey = ref('1');
</script>
