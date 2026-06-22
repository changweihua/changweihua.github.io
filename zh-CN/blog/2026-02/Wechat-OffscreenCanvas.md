---
lastUpdated: true
commentabled: true
recommended: true
title: 护航隐私！小程序纯前端“证件加水印”
description: OffscreenCanvas 全屏平铺实战
date: 2026-02-03 09:45:00 
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

## 背景与痛点：证件“裸奔”的风险 ##

在日常生活中，我们经常需要上传身份证、驾照或房产证照片来办理各种业务。然而，直接发送原图存在巨大的安全隐患：

- 被二次盗用：不法分子可能将你的证件照用于网贷、注册账号等非法用途。

- 服务器隐私泄露：如果使用在线工具加水印，图片必须上传到第三方服务器，这就好比“把钥匙交给陌生人保管”，风险不可控。

为了解决这一痛点，可利用小程序的 `OffscreenCanvas` 能力，在用户手机本地毫秒级合成水印，图片数据永远不会离开用户手机。

## 核心思路：离屏渲染 + 矩阵平铺 ##

实现全屏倾斜水印，主要难点在于*坐标计算*和*性能平衡*。我们的方案如下：

- *离屏渲染 (OffscreenCanvas)*：使用离屏画布在内存中处理，避免页面闪烁，且支持高性能的 2D 渲染模式。

- *智能 DPR 降级*：沿用我们之前文章提到的防爆内存策略。证件照通常分辨率很高，必须计算安全尺寸，防止 Canvas 内存溢出闪退。

- *矩阵平铺算法*：不简单的旋转画布，而是采用 “*保存环境 -> 平移 -> 旋转 -> 绘制 -> 恢复环境*” 的策略，在一个网格循环中将文字铺满全屏，确保无论图片比例如何，水印都能均匀分布。

## 硬核代码实现 ##

以下是封装好的 `watermarkUtils.js`。包含了*智能 DPR 计算*和*全屏水印绘制*的核心逻辑。

```javascript:utils/watermarkUtils.js

// 1. 获取系统基础信息
const wxt = {
  dpr: wx.getSystemInfoSync().pixelRatio || 2
};

// 图片缓存，避免重复加载
const cacheCanvasImageMap = new Map();

/**
 * 内部方法：获取/创建 Canvas Image 对象
 */
async function getCanvasImage(canvas, imageUrl) {
  if (cacheCanvasImageMap.has(imageUrl)) return cacheCanvasImageMap.get(imageUrl);
  
  // 兼容性处理：若不支持 Promise.withResolvers，请改用 new Promise
  const { promise, resolve, reject } = Promise.withResolvers();
  const image = canvas.createImage();
  image.onload = () => {
    cacheCanvasImageMap.set(imageUrl, image);
    resolve(image);
  };
  image.onerror = (e) => reject(new Error(`加载失败: ${e.errMsg}`));
  image.src = imageUrl;
  await promise;
  return image;
}

/**
 * 给图片添加全屏倾斜水印
 * @param {string} imageUrl 图片路径
 * @param {string} text 水印文字，如 "仅供办理租房业务使用"
 * @param {object} options 配置项 { color, size, opacity }
 */
export async function addWatermark(imageUrl, text = '仅供办理业务使用', options = {}) {
  // 默认配置
  const config = {
    color: '#aaaaaa',
    opacity: 0.5,
    fontSize: 0, // 0 表示自动计算
    gap: 100,    // 水印间距
    ...options
  };

  const offscreenCanvas = wx.createOffscreenCanvas({ type: '2d' });
  const image = await getCanvasImage(offscreenCanvas, imageUrl);
  const { width, height } = image;

  // --- ⚡️ 性能优化：智能 DPR 计算 (防止大图闪退) ---
  const LIMIT_SIZE = 4096; 
  let useDpr = wxt.dpr;
  if (Math.max(width, height) * useDpr > LIMIT_SIZE) {
    useDpr = LIMIT_SIZE / Math.max(width, height);
  }

  // 设置画布尺寸
  offscreenCanvas.width = width * useDpr;
  offscreenCanvas.height = height * useDpr;

  const ctx = offscreenCanvas.getContext('2d');
  ctx.scale(useDpr, useDpr);
  
  // 1. 绘制底图
  ctx.drawImage(image, 0, 0, width, height);

  // 2. 配置水印样式
  // 自动计算字号：约为图片宽度的 4%
  const fontSize = config.fontSize || Math.floor(width * 0.04); 
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = config.color;
  ctx.globalAlpha = config.opacity;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // 3. 计算平铺逻辑
  // 旋转 45 度后，覆盖范围需要比原图大，这里简单取对角线长度作为边界
  const maxSize = Math.sqrt(width * width + height * height);
  // 步长 = 文字宽度 + 间距
  const step = ctx.measureText(text).width + config.gap; 
  
  // 4. 循环绘制水印
  // 从负坐标开始绘制，确保旋转后边缘也有水印
  for (let x = -maxSize; x < maxSize; x += step) {
    for (let y = -maxSize; y < maxSize; y += step) {
      ctx.save();
      
      // 核心变换：平移到网格点 -> 旋转 -> 绘制
      ctx.translate(x, y);
      ctx.rotate(-45 * Math.PI / 180); // 逆时针旋转 45 度
      ctx.fillText(text, 0, 0);
      
      ctx.restore();
    }
  }

  // 5. 导出图片
  const res = await wx.canvasToTempFilePath({
    canvas: offscreenCanvas,
    fileType: 'jpg',
    quality: 0.8, // 稍微压缩以减小体积
  });

  return res.tempFilePath;
}
```

## 业务调用示例 ##

在小程序页面中，用户选择图片并输入水印文字后，实时预览效果。

```javascript:pages/watermark/index.js
import { addWatermark } from '../../utils/watermarkUtils';

Page({
  data: {
    originImg: '',
    resultImg: '',
    watermarkText: '仅供本次业务使用 他用无效'
  },

  async onAddWatermark() {
    if (!this.data.originImg) return;

    wx.showLoading({ title: '安全合成中...' });
    
    try {
      const tempFilePath = await addWatermark(
        this.data.originImg, 
        this.data.watermarkText,
        {
          color: '#ffffff', // 白色水印
          opacity: 0.4,     // 半透明
          gap: 120          // 间距疏松一点
        }
      );
      
      this.setData({ resultImg: tempFilePath });
      
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '合成失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
})
```

## 避坑与实战经验 ##

- *自动字号的重要性*：不要写死 `fontSize = 20px`。用户上传的图片分辨率差异极大（有的 500px 宽，有的 4000px 宽）。最佳实践是根据图片宽度动态计算字号（如 `width * 0.04`），这样无论处理缩略图还是 4K 原图，水印比例看起来都是协调的。

- *平铺范围的陷阱*：因为文字需要旋转 45 度，如果循环只从 `0` 到 `width`，图片的左下角和右上角可能会出现空白。代码中我们从 `-maxSize`（负数区域）开始循环，确保旋转后的文字能完全覆盖画布的每一个角落。

- *隐私第一*：在工具的 UI 界面上，建议显著提示 “*纯本地处理，无上传服务器*”，这能极大地增加用户的信任感，提升工具的使用率。

## 写在最后 ##

通过这个实践案例，我们可以看到，利用小程序强大的 Canvas 能力，开发者完全可以在保护用户隐私的前提下，提供专业级的图片处理服务。

*技术不只是代码，更是对用户安全的守护。*希望这篇分享能帮你在小程序中实现更安全、更高效的功能！
