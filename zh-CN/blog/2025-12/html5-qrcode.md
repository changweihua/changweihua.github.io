---
lastUpdated: true
commentabled: true
recommended: true
title: H5页面实现二维码/条形码扫描
description: H5页面实现二维码/条形码扫描
date: 2025-12-29 16:30:00 
pageClass: blog-page-class
cover: /covers/Html5.svg
---

`html5-qrcode` 是一个轻量、高效、纯前端的 *二维码/条形码扫描库*，专为在网页（H5）中实现摄像头扫码功能而设计。

## 🌟 一、什么是 `html5-qrcode`？ ##

`html5-qrcode` 是一个基于 *HTML5 和 JavaScript* 的开源库，它利用浏览器的 `MediaDevices.getUserMedia()` API 访问设备摄像头，实时扫描二维码（QR Code）和条形码（Barcode），*无需安装插件或 App*。

- ✅ 纯前端实现
- ✅ 支持手机和桌面浏览器
- ✅ 不依赖 jQuery 或其他框架
- ✅ 轻量、易集成

## ✅ 二、核心功能 ##

| **功能**        |      **说明**      |
| :------------- | :-----------: |
| 🔍 扫描二维码（QR Code）      | 支持标准 QR Code，可识别 URL、文本、联系方式等  |
| 📏 扫描条形码      | 支持 `Code 128`, `Code 39`, `EAN-13` 等常见格式（依赖底层引擎）  |
| 📱 手机端友好      | 自动适配移动端摄像头（前后置可选）  |
| 🖥 桌面端支持      | 支持 PC 浏览器调用摄像头扫码  |
| 🎯 自定义扫描区域      | 可设置 `qrbox` 限制扫描范围，提升体验  |
| 📦 纯 JS 实现      | 无依赖，仅 100KB 左右，加载快  |
| 🔌 支持多种集成方式      | CDN、npm、UMD、ES6 模块  |

## 📦 三、支持的码制（Barcode Formats） ##

`html5-qrcode` 底层使用了 ZXing (Zebra Crossing) 的 JavaScript 实现来解码，因此支持多种格式：

### ✅ 二维码（2D） ###

- `qr_code`（最常用）

### ✅ 条形码（1D） ###

- `code_128`（快递单、物流常用）
- `code_39`
- `ean_8`, `ean_13`（商品条码）
- `upc_a`, `upc_e`
- `itf`（Interleaved 2 of 5）
- `codabar`

> ⚠️ 注意：部分格式识别率受图像质量影响。

## 🚀 四、快速使用示例 ##

### 引入方式一：CDN（最简单） ###

```html
<script src="https://unpkg.com/html5-qrcode/html5-qrcode.min.js"></script>
```

### HTML 结构 ###

```html
<div id="qr-reader" style="width: 300px"></div>
<div id="qr-reader-results"></div>
```

### JavaScript 扫码 ###

```javascript
function onScanSuccess(decodedText, decodedResult) {
  // 扫码成功
  console.log(`扫码结果: ${decodedText}`);
  document.getElementById('qr-reader-results').innerHTML = 
    `<p>结果: ${decodedText}</p>`;
}

function onScanFailure(error) {
  // 失败回调（可选）
  console.warn(`扫码失败: ${error}`);
}

// 初始化
new Html5Qrcode("qr-reader").start(
  { facingMode: "environment" }, // 使用后置摄像头
  {
    fps: 10,           // 每秒扫描次数
    qrbox: 250         // 扫描框大小（px）
  },
  onScanSuccess,
  onScanFailure
).catch(err => {
  console.error("启动摄像头失败:", err);
});
```

## 🎨 五、常用配置项（config） ##

| **配置项**        |      **说明**      |
| :------------- | :-----------: |
| fps      |  每秒扫描帧数（建议 10~20）  |
| qrbox      |  扫描区域大小，可设为数字（正方形）或对象 `{width: 300, height: 150}`  |
| formats      |  指定只扫描某些码制，如 `['qr_code', 'code_128']`  |
| aspectRatio      |  摄像头预览宽高比，如 1.333（4:3）  |
| disableFlip      |  true 禁用图像翻转（适用于某些设备镜像问题）  |

## 🛠 六、高级用法 ##

### 只扫描条形码（如快递单） ###

```ts
new Html5Qrcode("qr-reader").start(
  { facingMode: "environment" },
  {
    fps: 10,
    qrbox: { width: 300, height: 100 }, // 横向长条
    formats: ["code_128", "code_39", "ean_13"] // 只识别条形码
  },
  (decodedText) => { /* 处理结果 */ }
);
```

### 扫描一次后停止 ###

```js
onScanSuccess(decodedText, result) {
  console.log(decodedText);
  // 停止扫码
  html5QrCode.stop().then(() => {
    console.log("扫码结束");
  });
}
```

### 切换摄像头 ###

```js
// 获取摄像头列表
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length > 0) {
    const rearCamera = devices.find(d => d.label.toLowerCase().includes("back"));
    html5QrCode.start(rearCamera.id, config, success, error);
  }
});
```

## 📱 七、兼容性 ##

| **环境**        |      **是否支持**      |
| :------------- | :-----------: |
| 现代浏览器      | ✅ Chrome、Firefox、Safari、Edge |
| 移动端      | ✅ Android Chrome、iOS Safari（需 HTTPS） |
| 微信内置浏览器      | ✅ 支持（需 HTTPS + 用户授权） |
| HTTP 环境      | ❌ 大多数浏览器禁止摄像头访问 |
| 低版本 IE      | ❌ 不支持 |

> 🔐 必须在 HTTPS 或 localhost 下运行，否则浏览器会拒绝摄像头权限。

## 📦 八、安装方式 ##

### npm 安装（推荐用于 Vue/React 项目） ###

```bash
npm install html5-qrcode
```

```js
import Html5Qrcode from 'html5-qrcode';
```

### CDN 引入（H5 快速集成） ###

```html
<script src="https://unpkg.com/html5-qrcode/html5-qrcode.min.js"></script>
```

## ✅ 九、适用场景 ##

| **场景**        |      **说明**      |
| :------------- | :-----------: |
| 🔗 网页扫码登录      | 如后台系统扫码登录 |
| 📦 快递单号扫描      | H5 页面扫描条形码录入单号 |
| 💳 支付码扫描      | 扫描支付宝/微信付款码（需合规） |
| 🎟 电子票核销      | 活动签到、电影票扫码验证 |
| 🏷 商品溯源      | 扫码查看商品信息 |

## ⚠️ 十、注意事项 ##

- 必须 HTTPS：生产环境必须部署在 HTTPS 域名下。
- 用户授权：首次使用需用户允许摄像头权限。
- 性能优化：避免在低性能设备上长时间运行。
- 错误处理：处理摄像头不可用、无权限等异常。
- 移动端体验：建议全屏扫描，避免页面滚动干扰。

## 📊 十一、与其他库对比 ##

| **库名**        |      **特点**      |  **适用场景** |
| :------------- | :-----------: | :----: |
| html5-qrcode      | 轻量、易用、功能全 | 通用扫码，推荐首选 |
| zxing-js/library      | 更底层，灵活但复杂 | 需要高度定制 |
| quaggaJS      | 支持条形码强，但维护弱 | 老项目 |
| instascan      | 依赖 `webrtc`，已归档 | 不推荐新项目 |

## ✅ 总结 ##

`html5-qrcode` 是目前 最推荐的前端扫码库，优点：

- ✅ 简单易用，文档清晰
- ✅ 支持二维码和条形码
- ✅ 适合 H5、Vue、React、微信公众号
- ✅ 社区活跃，持续维护

📌 如果你需要在网页中实现扫码功能，html5-qrcode 是首选方案！

## 案例 ##

项目基于vue3框架开发：

### 安装html5-qrcode ###

```bash
npm install html5-qrcode
```

### 页面代码实现 ###

```vue
<template>
  <div class="registration-container">
    <h2>快递登记</h2>
    <el-form label-position="top" :model="ruleForm" :rules="rules" ref="ruleFormRef">
      <el-form-item label="真实退回快递单号" prop="expressNumber">
        <el-input v-model="ruleForm.expressNumber" placeholder="请输入快递单号" clearable>
          <template #suffix>
            <SvgIcon @click="startScan" name="take-pictures" width="24" height="24" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="快递公司" prop="expressCompany">
        <el-input v-model="ruleForm.expressCompany" placeholder="请输入快递公司" clearable />
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button class="submit-btn" type="primary" style="width: 100%" @click="submitForm">提交</el-button>
    </div>
  </div>
  <!-- 全屏扫码层 -->
  <div v-if="scanning" class="scanner-container">
    <div id="qr-reader" ref="qrReaderRef"></div>
    <p class="scan-hint">请将快递单条形码对准扫描框</p>
    <el-button class="close-btn" @click="stopScan">关闭</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, reactive } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { type FormInstance, type FormRules, ElMessage } from 'element-plus'

defineOptions({
  name: 'after-sales-registration'
})

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  expressNumber: '',
  expressCompany: ''
})
const rules = reactive<FormRules>({
  expressNumber: [{ required: true, message: '请输入快递单号', trigger: 'blur' }],
  expressCompany: [{ required: true, message: '请输入快递公司', trigger: 'blur' }]
})

const scanning = ref(false)
const qrReaderRef = ref(null)

let html5QrCode: Html5Qrcode | null = null

// 开始扫描
const startScan = (event: Event) => {
  // 阻止事件冒泡和默认行为，防止输入框获得焦点
  event.preventDefault()
  event.stopPropagation()

  if (scanning.value) return
  scanning.value = true

  // 如果有活动的输入框，尝试让它失去焦点
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  // 延迟确保 DOM 渲染
  setTimeout(() => {
    try {
      html5QrCode = new Html5Qrcode('qr-reader')

      const config = {
        fps: 10,
        qrbox: { width: 300, height: 100 }, // 横向长条，适合条形码
        formats: [
          'code_128', // ✅ 快递单最常用
          'code_39', // ✅ 部分快递使用
          'ean_13' // ✅ 商品类快递
        ]
      }

      html5QrCode
        .start(
          { facingMode: 'environment' }, // 后置摄像头
          config,
          (decodedText) => {
            // console.log('🎉 识别到快递单号:', decodedText)
            ruleForm.expressNumber = decodedText
            stopScan() // 自动关闭
          },
          () => {}
        )
        .catch((err) => {
          ElMessage.error('摄像头启动失败：' + (err.message || '未知错误'))
          scanning.value = false
          stopScan()
        })
    } catch (err) {
      ElMessage.error(`扫码库初始化失败，请重试${err}`)
      stopScan()
    }
  }, 300)
}

// 停止扫描
const stopScan = () => {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        html5QrCode?.clear()
        html5QrCode = null
        scanning.value = false
      })
      .catch(() => {
        // console.error('停止失败:', err)
        scanning.value = false
      })
  } else {
    scanning.value = false
  }
}

const submitForm = () => {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      // TODO:提交事件
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 组件卸载时确保关闭扫描
onUnmounted(() => {
  if (html5QrCode) {
    html5QrCode.stop()
  }
})
</script>

<style lang="scss" scoped>
.registration-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f8f8fa;
  box-sizing: border-box;
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 17px 0;
    text-align: center;
    box-shadow: 0px -4px 16px 0px rgba(60, 126, 254, 0.2);
    box-sizing: border-box;
    .submit-btn {
      width: 50% !important;
      background: #3c7efe;
      border-radius: 555px;
    }
  }
}
input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  text-align: center;
  background-color: #f9f9f9;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  background-color: #ef5350;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #c62828;
}
/* 全屏扫码层 */
.scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
}
#qr-reader {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
}
.scan-hint {
  color: #4caf50;
  margin-top: 12px;
  font-size: 18px;
  font-weight: bold;
}
.close-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}
</style>
```

## 其他 ##

### 注意事项 ###

- 必须 HTTPS：生产环境必须部署在 HTTPS 域名下。
- 用户授权：首次使用需用户允许摄像头权限。
- 性能优化：避免在低性能设备上长时间运行。
- 兼容性问题：在某些旧版浏览器可能不支持。
- 移动端体验：`html5-qrcode` 扫码体验一般，需要贴紧条形码。

### 其他方案对比 ###

| **方案**        |      **技术栈**      |  **是否推荐** |  **说明** |
| :------------- | :-----------: | :----: | :----: |
| 1. `html5-qrcode` + 格式过滤      | 纯前端 JS | ✅✅✅ 强烈推荐 | 轻量、易用、支持条形码 |
| 2. `ZXing JS`（原生）      | 纯前端 JS | ✅ 推荐 | 功能强大，但配置复杂 |
| 3. 原生 `getUserMedia` + `QuaggaJS`      | 纯前端 JS | ⚠️ 可用但不推荐 | QuaggaJS 已停止维护 |
| 4. 调用微信 JS-SDK 扫码      | 微信内置 | ✅ 限微信环境 | 依赖微信 App |
| 5. 调用 App 原生能力（Hybrid）      | WebView + Native | ✅ 高性能 | 需开发 App |
| 6. 拍照上传 + 后端识别      | 前端 + 后端 | ✅ 稳定兜底 | 适合弱网或兼容性差的设备 |

