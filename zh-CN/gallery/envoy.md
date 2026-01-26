---
layout: doc
# 开启推荐
recommended: true
pageClass: gallery-page-class
title: Envoy 网关
---

### Envoy 开放认证授权平台 ###

- 集成 Envoy 的网关，网关支持 JWKS 认证和 RBAC 鉴权、流量控制、多种认证机制、镜像访问。
- Docker Compose 部署，Seq 等日志平台。

<div class="wrapper">
<div class="item">
<span>A</span>
<span>B</span>
<span>C</span>
</div>
<div class="item">
<span>A</span>
<span>B<br />B<br />B</span>
<span>C</span>
</div>
<div class="item">
<span>A</span>
<span>B</span>
<span>C</span>
</div>
</div>

<HtmlPreview src="/htmls/buti-tab.html" height="600px" class="iframe-responsive" />

<style>
  .alarm-box {
    width: 200px;
    height: 60px;
    background: #ff4444;
    border-radius: 8px;
    position: relative;
    filter: glow(color=#ff0000, strength=5); /* 光晕滤镜 */
  }
  @keyframes blink {
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
  }
  .alarm-active {
    animation: blink 1s infinite;
  }

@keyframes emergency {
  0% { background-color: #ff0000; transform: scale(1); }
  50% { background-color: #ff9999; transform: scale(1.05); }
  100% { background-color: #ff0000; transform: scale(1); }
}

.emergency-mode {
  animation: emergency 0.8s infinite;
  border: 2px solid #fff;
  box-shadow: 0 0 30px rgba(255,0,0,0.5);
}

.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.item {
  grid-row: 1 / 4;
  display: grid;
  grid-template-rows: subgrid;
}

</style>
