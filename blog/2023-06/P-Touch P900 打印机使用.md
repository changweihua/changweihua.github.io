---
---

# P-Touch P900 打印机使用 #

## 驱动安装 ##

**支持操作系统**

Windows 11, Windows 10 (32-bit), Windows 10 (64-bit), Windows 8.1 (32-bit), Windows 8.1 (64-bit)

**适用机型**

PT-P900/P900c, PT-P900W/P900Wc, PT-P950NW

[官方驱动下载](https://support.brother.com/g/b/downloadend.aspx?c=cn&lang=zh&prod=p900cheas&os=10069&dlid=dlfp100982_000&flang=226&type3=347)

## SDK 下载 ##

[b-PAC SDK Ver.3.1](https://support.brother.com/g/s/es/dev/en/bpac/download/index.html?c=eu_ot&lang=zh-cn&navi=offall&comple=on&redirect=on)

![SDK 列表](/public/images/cmono-20230620090715.png)

<!-- ![](图片地址) -->
<!-- <img src="/public/images/cmono-20230620090715.png" data-fancybox="gallery"/> -->

**模板编辑器**

[官方下载](https://mksoftcdnhp.yesky.com/648fbc3e/65f2fe1f7889a07d90bdb09f031dac49/uploadsoft/PT_EDITOR_51012_CH.exe)

## 与 Vue 集成 ##

因为考虑到后端程序运行的环境是 CentOS，为保证后续的兼容性，考虑采取浏览器连接打印机的方式进行打印。

**思路**

用户点击打印按钮，打开预览弹窗(iframe方式)，在iframe页面内调用官方SDK和提取设计的二维码模板进行二维码图片预览和打印。

<div style="display: flex;">
    <img src="/public/images/cmono-20230620111603.png" data-fancybox="gallery"/>
    <img src="/public/images/cmono-20230620111612.png" data-fancybox="gallery"/>
    <img src="/public/images/cmono-20230620111621.jpg" data-fancybox="gallery"/>
</div>