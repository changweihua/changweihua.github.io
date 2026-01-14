---
lastUpdated: true
commentabled: true
recommended: true
title:  单独启动安卓模拟器教程
description: 单独启动安卓模拟器教程
date: 2024-07-09 10:18:00
pageClass: blog-page-class
---

# 单独启动安卓模拟器教程 #

- 安装SDK的目录 找到 emulator 文件夹

![示例图](/images/cmono-QQ截图20240709100918.png){data-zoomable}

- 查询已安装安卓模拟器列表

```bash
cd D:\Android\Sdk\emulator

D:\Android\Sdk\emulator> .\emulator.exe -list-avds
```

![示例图](/images/cmono-QQ截图20240709101138.png){data-zoomable}

- 启动指定安卓模拟器

```bash
D:\Android\Sdk\emulator> .\emulator.exe -avd Pixel_7_API_34
```

![示例图](/images/cmono-QQ截图20240709101227.png){data-zoomable}
