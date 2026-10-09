---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 Mock 数据实战
description: 用 Mockjs + vite-plugin-mock 搭建前端独立开发环境
date: 2026-06-23 10:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言：告别"等后端"的被动开发模式

做前端开发，谁没经历过这种尴尬局面：页面样式写完、布局适配完毕、交互逻辑调试完成，最后却因为后端接口没写完，直接原地停工摸鱼。

项目进度被死死卡点，前端只能被动等待。更折磨的是：后端临时改字段、延期交付、调整接口逻辑，前端就要反复返工调试，极大拖垮开发效率。

想要打破前后端开发强耦合的僵局，核心解法只有一个：搭建前端本地 Mock 独立开发环境。

今天这篇实战，带你从零落地 Vue3 + Vite + Mockjs + vite-plugin-mock + Element Plus 全套方案。新手零门槛、开箱即用、支持动态数据、适配全业务场景、生产环境自动失效，彻底解决前后端联调等待痛点，手把手帮你拿捏前端自主开发能力。

## 一、Mock 方案选型：为什么首选 vite-plugin-mock？

前端 Mock 方案五花八门，但适配 Vite + Vue3 技术栈的优质方案并不多。我帮大家横向对比主流方案，一次性选对不踩坑。

### 主流 Mock 方案优劣对比

- 硬编码写死假数据：最鸡肋的方案，数据固定无法动态变更，不支持分页、空数据、异常场景调试，联调需要全量替换代码，返工率100%，直接淘汰。
- 在线 Mock 平台（Easy Mock、ApiFox）：依赖外网环境，断网即失效，团队协作同步麻烦，接口更新延迟，私有化项目无法适配，本地开发体验极差。
- 浏览器请求拦截 Mock：适配性差，不支持 SSR，无法模拟网络延迟、接口报错，复杂业务场景覆盖不全，实用性极低。
- vite-plugin-mock + Mockjs（最优解）：Vite 原生适配，本地离线运行、无需外网，支持动态随机数据、网络延迟、异常报错模拟，热更新实时生效，生产环境一键关闭，完美适配 Vue3 全场景开发。

### 这套组合方案核心优势

一句话概括核心价值：把接口开发权握在前端手里，实现前后端并行开发，彻底摆脱后端牵制。

- 本地离线运行，零外网依赖，不受后端开发进度影响
- Mockjs 生成动态随机数据，高度还原真实后端返回格式
- 支持网络延迟、接口报错、空数据、分页查询等全场景模拟
- Vite 插件原生集成，热更新生效，修改 Mock 文件无需重启项目
- 环境完全隔离，生产环境自动关闭，零代码侵入、无线上污染风险

## 二、快速集成：Vite + Vue3 搭建 Mock 环境

全程复制即用，适配所有 Vite + Vue3 项目，兼容组合式 API。

### 安装稳定版依赖

新版插件存在兼容问题，直接安装稳定适配版本，杜绝报错：

```bash
# 安装 Vue3 + Element Plus + Mock 相关依赖
npm install vue axios element-plus -S
npm install vite @vitejs/plugin-vue mockjs vite-plugin-mock@2.9.6 -D
```

### Vite 核心配置

修改 `vite.config.js`，注册 Mock 插件，实现环境隔离、热更新、生产自动关闭等核心能力：

```javascript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      viteMockServe({
        enable: env.VITE_USE_MOCK === 'true',
        dir: './mock',
        watch: true,
        prodEnable: false
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: '',
          changeOrigin: true
        }
      }
    }
  }
})
```

### `main.js` 引入 Element Plus

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

createApp(App).use(ElementPlus).mount('#app')
```

### 初始化项目目录结构

项目根目录新建 `mock` 文件夹，按业务模块统一管理接口，结构清晰、便于维护：

```txt
project
├── .env.development   # 开发环境变量
├── .env.production    # 生产环境变量
├── vite.config.js     # Vite核心配置
├── index.html
├── package.json
├── mock               # Mock接口根目录
│   ├── utils.js      # 统一返回格式工具
│   └── user.js       # 用户模块接口
└── src
    ├── main.js       # 入口文件
    ├── App.vue       # 根组件
    ├── style.css     # 全局样式
    └── MockDemo.vue  # Mock演示页面
```

## 三、Mockjs 核心实战：生成真实动态数据

Mock 最大的价值不是造假数据，而是*模拟真实、动态、不规则的业务数据*，完美还原后端接口返回效果，适配各类页面场景调试。

### Mockjs 高频语法速查

```javascript
import Mock from 'mockjs'

Mock.Random.string(6) // 随机字符串
Mock.Random.integer(1, 100) // 随机数字
Mock.Random.boolean() // 随机布尔值
Mock.Random.date() // 随机日期
Mock.Random.image() // 随机图片
Mock.Random.cname() // 随机中文名
Mock.Random.phone() // 随机手机号
Mock.Random.county() // 随机地址
```

### 统一返回格式工具

新建 `mock/utils.js`，统一接口返回格式：

```javascript
export const success = (data = null, msg = '请求成功') => {
  return { code: 200, message: msg, data }
}

export const fail = (msg = '请求失败', code = 500, data = null) => {
  return { code, message: msg, data }
}
```

### 基础动态接口实战

在 `mock/user.js` 编写用户接口，每次请求返回动态数据：

```javascript
import Mock from 'mockjs'
import { success, fail } from './utils'

const createAllUserList = () => {
  return Mock.mock({
    'list|50': [
      {
        id: '@increment',
        username: '@cname',
        phone: /^1[3-9]\d{9}$/,
        age: '@integer(18,45)',
        avatar: '@image(200x200,#f5f5f5,user)',
        createTime: '@datetime',
        status: '@integer(0,1)'
      }
    ]
  })
}
const allUserList = createAllUserList().list

const createUserList = () => {
  return Mock.mock({ 'list|10': allUserList.slice(0, 10) })
}

export default [
  {
    url: '/api/user/list',
    method: 'get',
    timeout: 300,
    response: () => success(createUserList())
  }
]
```

## 四、高阶实战：全覆盖业务场景模拟

真实开发中，不仅需要正常接口，还需要调试 loading、报错、提交传参、分页等场景，下面实现全场景 Mock 模拟。

### 模拟网络延迟（调试 Loading 必备）

本地接口响应过快会导致 `loading` 一闪而过，无法调试，通过 `timeout` 模拟真实网络延迟。

### 模拟接口异常报错

用于调试页面错误兜底、请求重试、异常提示逻辑：

```javascript
{
  url: '/api/user/error',
  method: 'get',
  statusCode: 500,
  response: () => fail('服务器繁忙，请稍后重试')
}
```

### 模拟 POST 提交接口（支持前端传参）

```javascript
{
  url: '/api/user/add',
  method: 'post',
  timeout: 500,
  response: (req) => {
    const { username, phone } = req.body
    const newUser = {
      id: Mock.Random.increment(),
      username: username || '新用户',
      phone: phone || /^1[3-9]\d{9}$/.source,
      age: Mock.Random.integer(18, 45),
      avatar: Mock.Random.image('200x200', '#f5f5f5', 'user'),
      createTime: Mock.Random.datetime(),
      status: 1
    }
    allUserList.unshift(newUser)
    return success({ id: newUser.id }, `用户${username}创建成功`)
  }
}
```

### 真实分页接口（业务高频场景）

模拟后端分页逻辑，支持前端动态传参切换页码、每页条数，完美调试分页组件：

```javascript
{
  url: '/api/user/page',
  method: 'get',
  timeout: 400,
  response: (req) => {
    const { page = 1, pageSize = 10 } = req.query
    const start = (page - 1) * pageSize
    const list = allUserList.slice(start, start + Number(pageSize))
    return success({ list, total: allUserList.length, page, pageSize })
  }
}
```

## 五、前端业务调用：Element Plus 优雅整合

使用 Element Plus 组件库快速搭建美观的 Mock 演示页面。

### 完整页面调用示例（MockDemo.vue）

```vue
<template>
  <div class="mock-demo">
    <h3>Vue3 Mock 数据实战演示</h3>

    <el-tabs
      v-model="activeTab"
      class="demo-tabs"
      @tab-change="handleTabChange"
    >
      <el-tab-pane
        label="普通列表"
        name="list"
      >
        <el-table
          :data="userList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="username"
            label="姓名"
            width="100"
          />
          <el-table-column
            prop="phone"
            label="手机号"
            width="140"
          />
          <el-table-column
            prop="age"
            label="年龄"
            width="80"
          />
          <el-table-column
            prop="avatar"
            label="头像"
            width="80"
          >
            <template #default="{ row }">
              <el-avatar
                :src="row.avatar"
                :size="40"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          />
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="分页查询"
        name="page"
      >
        <el-table
          :data="pagination.list"
          v-loading="pageLoading"
          stripe
        >
          <el-table-column
            prop="username"
            label="姓名"
            width="100"
          />
          <el-table-column
            prop="phone"
            label="手机号"
            width="140"
          />
          <el-table-column
            prop="age"
            label="年龄"
            width="80"
          />
          <el-table-column
            prop="avatar"
            label="头像"
            width="80"
          >
            <template #default="{ row }">
              <el-avatar
                :src="row.avatar"
                :size="40"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          />
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="新增用户"
        name="add"
      >
        <el-form
          :model="form"
          label-width="80px"
          style="max-width: 400px"
        >
          <el-form-item label="用户名">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="addUser"
              :loading="addLoading"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
        <el-alert
          v-if="addResult"
          :title="addResult"
          type="success"
          show-icon
          :closable="false"
        />
      </el-tab-pane>

      <el-tab-pane
        label="异常测试"
        name="error"
      >
        <el-button
          type="danger"
          @click="testError"
          >测试异常接口</el-button
        >
        <el-alert
          v-if="errorMsg"
          :title="errorMsg"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 16px"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
  import axios from 'axios'
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'

  const activeTab = ref('list')
  const loading = ref(false)
  const pageLoading = ref(false)
  const addLoading = ref(false)

  const userList = ref([])
  const pagination = reactive({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10
  })

  const form = reactive({
    username: '',
    phone: ''
  })
  const addResult = ref('')
  const errorMsg = ref('')

  const getUserList = async () => {
    loading.value = true
    try {
      const res = await axios.get('/api/user/list')
      if (res.data.code === 200) {
        userList.value = res.data.data.list
      }
    } catch (e) {
      ElMessage.error('请求失败：' + (e.message || '未知错误'))
    }
    loading.value = false
  }

  const getPageList = async (page = 1) => {
    pageLoading.value = true
    try {
      const res = await axios.get('/api/user/page', { params: { page, pageSize: pagination.pageSize } })
      if (res.data.code === 200) {
        pagination.list = res.data.data.list
        pagination.total = res.data.data.total
        pagination.page = Number(res.data.data.page)
      }
    } catch (e) {
      ElMessage.error('请求失败：' + (e.message || '未知错误'))
    }
    pageLoading.value = false
  }

  const handleSizeChange = (val) => {
    pagination.pageSize = val
    getPageList(1)
  }

  const handleCurrentChange = (val) => {
    getPageList(val)
  }

  const addUser = async () => {
    if (!form.username) {
      ElMessage.warning('请输入用户名')
      return
    }
    addLoading.value = true
    addResult.value = ''
    try {
      const res = await axios.post('/api/user/add', { username: form.username, phone: form.phone })
      if (res.data.code === 200) {
        addResult.value = res.data.message
        ElMessage.success(res.data.message)
        form.username = ''
        form.phone = ''
        if (activeTab.value === 'list') {
          getUserList()
        }
      }
    } catch (e) {
      ElMessage.error('请求失败：' + (e.message || '未知错误'))
    }
    addLoading.value = false
  }

  const testError = async () => {
    errorMsg.value = ''
    try {
      await axios.get('/api/user/error')
    } catch (e) {
      errorMsg.value = e.response?.data?.message || e.message || '请求失败'
    }
  }

  const handleTabChange = (key) => {
    if (key === 'list' && userList.value.length === 0) {
      getUserList()
    } else if (key === 'page' && pagination.list.length === 0) {
      getPageList(1)
    }
  }

  getUserList()
</script>

<style scoped>
  .mock-demo {
    background: white;
    border-radius: 8px;
    padding: 24px;
  }

  .demo-tabs {
    margin-top: 16px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
```

## 六、环境精细化配置：开发/生产自动隔离

核心痛点解决：开发环境用 Mock，生产环境自动关闭，杜绝线上数据污染。

### 配置环境变量文件

`.env.development`（开发环境）

```ini
VITE_USE_MOCK = true
```

`.env.production`（生产环境）

```ini
VITE_USE_MOCK = false
```

打包执行 `npm run build` 时，Mock 插件自动失效，项目自动请求真实后端接口，全程全自动切换。

## 七、高频踩坑汇总与解决方案

整理新手开发90%会遇到的问题，直接对照排查，节省大量调试时间：

- 接口404请求失败：优先重装稳定版依赖 `npm install vite-plugin-mock@2.9.6`，检查 `mock` 目录路径是否配置正确，修改 `vite` 配置后重启项目。
- POST 接口拿不到参数：GET 参数取 `req.query`，POST 参数取 `req.body`，切勿混淆。
- 修改 Mock 文件不生效：确保开启 `watch: true`，开启热更新无需重启项目。
- ESM 导入报错：使用 `import { viteMockServe } from 'vite-plugin-mock'`（注意是 `viteMockServe` 不是 `vitePluginMock`）。
- 分页数据 NaN：`req.query` 返回的是字符串，需要转换类型 Number(`res.data.data.page`)。
- 线上出现 Mock 数据：确保 `prodEnable: false`，生产环境变量关闭 Mock。

## 八、企业级工程化进阶优化

### 统一全局返回格式

解决团队开发返回格式混乱问题，新建 `mock/utils.js` 工具封装：

```javascript
export const success = (data = null, msg = '请求成功') => {
  return { code: 200, message: msg, data }
}

export const fail = (msg = '请求失败', code = 500, data = null) => {
  return { code, message: msg, data }
}
```

接口直接复用，全局格式统一，维护成本大幅降低。

### 单接口精准开关（超实用）

支持部分接口用Mock、部分接口走真实后端，适配联调过渡阶段：

```javascript
const env = import.meta.env
export default [
  {
    url: '/api/user/list',
    method: 'get',
    enable: env.VITE_MOCK_USER === 'true',
    response: () => success(createUserList())
  }
]
```

## 九、团队开发规范 & 最佳实践

- 模块化管理：按业务拆分 `mock` 文件，避免单文件代码臃肿
- 数据真实化：优先动态数据，模拟空值、异常、边界场景
- 环境严格隔离：生产环境禁止开启 Mock，杜绝线上风险
- 渐进式关闭：联调时按需关闭单接口Mock，无需整体拆除环境
- 格式统一化：全员复用统一返回工具，规范团队接口格式
- UI 组件化：搭配 Element Plus 等组件库，快速搭建美观演示页面

## 十、全文总结

这套 _Vite + vite-plugin-mock + Mockjs + Element Plus_ 方案，是目前 Vue3 项目最稳、最高效的前端独立开发方案，没有之一。

它彻底解决了前后端开发耦合、进度互卡的痛点，让前端不用坐等后端接口，实现自主开发、并行迭代、提前自测。

Mock 不是摸鱼工具，而是前端工程化的必备技能。一次配置、终身复用，轻松拿捏高效开发，告别被动打工！

## 附录：全套可直接复制源码包

### 完整 package.json

```json
{
  "name": "vue3-mock-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "element-plus": "^2.14.0",
    "vue": "^3.3.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.1",
    "mockjs": "^1.1.0",
    "vite": "^5.0.10",
    "vite-plugin-mock": "^2.9.6"
  }
}
```

### 完整 `mock/user.js`（整合所有接口）

```javascript
import Mock from 'mockjs'
import { success, fail } from './utils'

const createAllUserList = () => {
  return Mock.mock({
    'list|50': [
      {
        id: '@increment',
        username: '@cname',
        phone: /^1[3-9]\d{9}$/,
        age: '@integer(18,45)',
        avatar: '@image(200x200,#f5f5f5,user)',
        createTime: '@datetime',
        status: '@integer(0,1)'
      }
    ]
  })
}
const allUserList = createAllUserList().list

const createUserList = () => {
  return Mock.mock({ 'list|10': allUserList.slice(0, 10) })
}

export default [
  {
    url: '/api/user/list',
    method: 'get',
    timeout: 300,
    response: () => success(createUserList())
  },
  {
    url: '/api/user/page',
    method: 'get',
    timeout: 400,
    response: (req) => {
      const { page = 1, pageSize = 10 } = req.query
      const start = (page - 1) * pageSize
      const list = allUserList.slice(start, start + Number(pageSize))
      return success({ list, total: allUserList.length, page, pageSize })
    }
  },
  {
    url: '/api/user/add',
    method: 'post',
    timeout: 500,
    response: (req) => {
      const { username, phone } = req.body
      const newUser = {
        id: Mock.Random.increment(),
        username: username || '新用户',
        phone: phone || /^1[3-9]\d{9}$/.source,
        age: Mock.Random.integer(18, 45),
        avatar: Mock.Random.image('200x200', '#f5f5f5', 'user'),
        createTime: Mock.Random.datetime(),
        status: 1
      }
      allUserList.unshift(newUser)
      return success({ id: newUser.id }, `用户${username}创建成功`)
    }
  },
  {
    url: '/api/user/error',
    method: 'get',
    statusCode: 500,
    response: () => fail('服务器繁忙，请稍后重试')
  }
]
```
