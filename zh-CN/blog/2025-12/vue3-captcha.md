---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 实现验证码功能
description: Vue3 实现验证码功能
date: 2025-12-29 15:30:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

验证码输入组件实现了现代网站常见的验证码输入交互，主要特性和实现细节如下：

- 自动跳转与退格回退：当用户在某一输入框输入1位有效字符（数字或字母）后，光标会自动跳转到下一个输入框，删除时自动跳回上一个，提升输入效率。
- `v-model` 双向绑定：每个输入框绑定数组 `codes` 双向绑定，方便统一获取和处理验证码。
- 粘贴支持：支持用户直接粘贴完整验证码（如6位），自动将每一位分配到对应输入框，并自动跳转到最后一位，极大提升用户体验。
- 错误提示：输入非数字或字母时，会在输入框下方实时显示红色错误提示，并自动清空非法输入。
- 按钮禁用：只有所有输入框都填满有效字符时，“继续”按钮才可点击，防止用户误操作。


### 代码实现 ###

:::demo

```vue
<template>
  <div class="verify-container">
    <h2 class="title">验证电子邮件地址</h2>
    <div class="subtitle">请输入发送到以下设备的验证码：</div>
    <div class="masked-info">+86 138 **** 8888</div>
    <div class="inputs">
      <input
        v-for="(item, idx) in codeLength"
        :key="idx"
        :ref="(el) => setInputRef(el, idx)"
        class="code-input"
        type="text"
        maxlength="1"
        v-model="codes[idx]"
        @input="onInput(idx, $event)"
        @keydown="onKeydown(idx, $event)"
        @paste="onPaste(idx, $event)"
        autocomplete="off"
      />
    </div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div class="actions">
      <button class="btn" @click="onBack">上一步</button>
      <button class="btn primary" :disabled="!isFull" @click="onSubmit">继续</button>
    </div>
    <div class="resend">
      <a href="#" @click.prevent="onResend">发送新验证码</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const codeLength = 6
const codes = ref<string[]>(Array(codeLength).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const errorMsg = ref('')

const setInputRef = (el: HTMLInputElement | null, idx: number) => {
  if (el) {
    inputRefs.value[idx] = el
  }
}

const isFull = computed(() => codes.value.every((c) => c.length === 1))

function fillCodes(startIdx: number, chars: string[]) {
  chars.forEach((char, i) => {
    if (startIdx + i < codeLength) {
      codes.value[startIdx + i] = char
    }
  })
  nextTick(() => {
    inputRefs.value[Math.min(startIdx + chars.length, codeLength - 1)]?.focus()
  })
}

const onInput = (idx: number, e: Event) => {
  const input = e.target as HTMLInputElement
  errorMsg.value = ''
  const val = input.value
  // 检查是否为数字或字母
  if (!/^[0-9a-zA-Z]*$/.test(val)) {
    errorMsg.value = '请输入数字或字母'
    codes.value[idx] = ''
    return
  }
  if (val.length === 0) {
    codes.value[idx] = ''
    return
  }
  // 粘贴或输入多个字符
  if (val.length > 1) {
    fillCodes(idx, val.split(''))
    return
  }
  codes.value[idx] = val
  // 只有当前输入框内容变化为1位且光标在最后时才跳下一个
  // 解决中文输入法等情况
  nextTick(() => {
    if (val && idx < codeLength - 1 && input.selectionEnd === 1) {
      inputRefs.value[idx + 1]?.focus()
    }
  })
}

const onKeydown = (idx: number, e: KeyboardEvent) => {
  // 退格到上一个
  if (e.key === 'Backspace') {
    if (codes.value[idx] === '' && idx > 0) {
      e.preventDefault()
      nextTick(() => {
        inputRefs.value[idx - 1]?.focus()
      })
    }
  }
  // 左右方向键支持
  if (e.key === 'ArrowLeft' && idx > 0) {
    e.preventDefault()
    inputRefs.value[idx - 1]?.focus()
  }
  if (e.key === 'ArrowRight' && idx < codeLength - 1) {
    e.preventDefault()
    inputRefs.value[idx + 1]?.focus()
  }
}
const onPaste = (idx: number, e: ClipboardEvent) => {
  const pasteValue = e.clipboardData?.getData('text') || ''
  const chars = pasteValue.replace(/[^0-9a-zA-Z]/g, '').split('')
  if (!chars.length) {
    return
  }
  e.preventDefault()
  fillCodes(idx, chars)
}

const onBack = () => {
  // 你的上一步逻辑
  alert('上一步')
}

const onSubmit = () => {
  // 你的提交逻辑
  alert('验证码为: ' + codes.value.join(''))
}

const onResend = () => {
  // 你的重新发送逻辑
  alert('已发送新验证码')
}
</script>

<style lang="scss">
.verify-container {
  max-width: 400px;
  margin: 140px auto;
  text-align: center;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  color: #333;
  margin-bottom: 6px;
}

.masked-info {
  color: #888;
  margin-bottom: 20px;
}

.inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.code-input {
  width: 60px;
  height: 60px;
  font-size: 2rem;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2196f3;
    box-shadow: 0 0 2px #2196f3;
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.btn {
  min-width: 100px;
  padding: 10px 0;
  border: 2px solid #2196f3;
  border-radius: 8px;
  background: #fff;
  color: #2196f3;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;

  &.primary {
    background: #0090ff;
    color: #fff;
    border: none;

    &:disabled {
      background: #e0e0e0;
      color: #aaa;
      cursor: not-allowed;
    }
  }
}

.error-msg {
  color: #ff4d4f;
  margin-bottom: 10px;
  font-size: 1rem;
}

.resend {
  margin-top: 12px;

  a {
    color: #2196f3;
    text-decoration: none;
    cursor: pointer;
  }
}
</style>
```

:::

**适用场景**

- 手机/邮箱验证码输入（登录、注册、找回密码等场景）
- 需要用户输入定长安全码、授权码等场景
