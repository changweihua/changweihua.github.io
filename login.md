---
layout: login
---

<script setup>
import { ref } from 'vue'
import { setAuthToken, isLoggedIn } from '.vitepress/theme/auth'
import { useRouter } from 'vitepress'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

if (isLoggedIn()) {
  router.go('/') // 已登录则跳转首页
}

async function handleLogin() {
  try {
    // 实际项目中替换为真实 API 调用
    const res = await mockLogin(username.value, password.value)
    
    setAuthToken(res.token)
    // 跳转到原请求页面或首页
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
    window.location.href = redirect
  } catch (err) {
    error.value = '登录失败: ' + err.message
  }
}

// 模拟登录 API
function mockLogin(user, pass) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === 'admin' && pass === '123456') {
        resolve({ token: 'fake_jwt_token' })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 500)
  })
}
</script>

<template>
  <div class="login-container">
    <h1>用户登录</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 20px;
  border: 1px solid #ddd;
}
.error {
  color: red;
}
</style>
