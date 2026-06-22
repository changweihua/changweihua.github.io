import { defineCustomElement } from 'vue'
import HeroLogo from './HeroLogo.ce.vue'

// 将 Vue 组件转换为 Web Components
const HeroLogoElement = defineCustomElement(HeroLogo)

// 注册自定义元素
customElements.define('w-hero-logo', HeroLogoElement)

import MyButton from './MyButton.ce.vue'

const MyButtonElement = defineCustomElement(MyButton)

// 注册自定义元素
customElements.define('my-button', MyButtonElement)
