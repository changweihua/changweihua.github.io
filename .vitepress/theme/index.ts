// .vitepress/theme/index.ts
import { inBrowser, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { watchEffect } from 'vue'

import './index.css'

import { AntDesignContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    const { app } = ctx
    DefaultTheme.enhanceApp(ctx)
    app.use(Antd)
    app.component('demo-preview', AntDesignContainer)
  },
  setup() {
    const { lang } = useData()
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`
      }
    })
  }
}