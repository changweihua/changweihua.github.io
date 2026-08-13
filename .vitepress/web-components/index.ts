// .vitepress/theme/index.ts 或单独的注册文件
import { defineCustomElement } from 'vue'
import HeroLogo from './HeroLogo.ce.vue'
import MyButton from './MyButton.ce.vue'

// 只在客户端注册
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  const HeroLogoElement = defineCustomElement(HeroLogo)
  customElements.define('w-hero-logo', HeroLogoElement)

  const MyButtonElement = defineCustomElement(MyButton)
  customElements.define('my-button', MyButtonElement)
}
