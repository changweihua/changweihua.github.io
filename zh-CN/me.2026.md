---
layout: doc
pageClass: gallery-page-class
---

> [!IMPORTANT] 年度关键词
> 如果还在。
> 
> 2026 笃行。

- 计划
- [ ] 计划 A
- [x] 计划 B

```markmap
# 2026
## Q1
- 无锡硕放机场团体旅客保障系统
## Q2
- ???
## Q3
- ???
## Q4
- ???
```

<br />

### 无锡硕放机场团体旅客保障系统 ###

- 2026 年 1 月初完成项目试运行


<style scoped>
/* 卡片容器 - 提供 3D 透视空间 */
.flip-card {
  width: 300px;
  height: 400px;
  perspective: 1000px;
  /* perspective 值越小，3D 效果越明显 */
}

/* 内部翻转层 - 保持 3D 空间 */
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  /* preserve-3d 让子元素保持在 3D 空间中 */
}

/* 正反面共同样式 */
.flip-card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  /* 隐藏元素的背面，避免翻转时看到镜像 */
}

/* 正面 */
.flip-card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 背面 - 初始旋转 180 度 */
.flip-card-back {
  background: white;
  color: #333;
  transform: rotateY(180deg);
  /* 背面预先旋转 180 度，这样翻转时才能正确显示 */
}

/* Hover 触发翻转 */
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

/* Click 触发翻转（通过 JavaScript 添加 .flipped 类）*/
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}
</style>
