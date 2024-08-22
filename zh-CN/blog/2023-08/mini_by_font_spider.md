---
lastUpdated: true
commentabled: true
recommended: true
pageClass: blog-page
tags: []
title: 使用字蛛font-spider压缩字体文件
description: 使用字蛛font-spider压缩字体文件
poster: /images/cmono-12587d16b1cbfa8c14815ff017bcefa.png
date: 2023-08-20
---

# 使用字蛛font-spider压缩字体文件 #

## 解决方案 ##

项目中遇到有特殊字体要求，且中文字体文件包比较大的时候，为了压缩字体文件一般有两种思路

一、让设计根据常用字将原文件筛选字体子集，只需要给出所需文字的字体包就好。

二、用font-spider对文字进行筛选子集生成新的字体文件-- 官网：http://font-spider.org/

一般的汉字字体都是所有的汉字和简体繁体等都包含，所以这两种方式都是所用字体能够确定，或者使用的都是常用汉字这种。

常用汉字介绍：https://github.com/kaienfr/Font/tree/master/learnfiles

![Alt text](/images/cmono-12587d16b1cbfa8c14815ff017bcefa.png){data-zoomable}

以及：

```txt

  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  numbers: '0123456789'
  symbols: '!@#$%^&*()-=_+[]{}\\|;\':",.<>//?¥'

```

这些准备好之后，就开始在项目中使用font-spider进行字体压缩

## 方案优势 ##

### 特性 ###

轻巧：数 MB 的中文字体可被压成几十 KB
简单：完全基于 CSS，无需 js 与服务端支持
兼容：自动转码，支持 IE 与标准化的浏览器
自然：文本支持选中、搜索、翻译、朗读、缩放

### 原理 ###

字蛛通过分析本地 CSS 与 HTML 文件获取 WebFont 中没有使用的字符，并将这些字符数据从字体中删除以实现压缩，并生成跨浏览器使用的格式。

构建 CSS 语法树，分析字体与选择器规则
使用包含 WebFont 的 CSS 选择器索引站点的文本
匹配字体的字符数据，剔除无用的字符
编码成跨浏览器使用的字体格式

## 操作步骤 ##

### 安装font-spider ###

```bash

　　npm install font-spider -g

```

检查是否安装成功

```bash

　　font-spider -V

```

```txt

  -h, --help                    输出帮助信息
  -V, --version                 输出当前版本号
  --info                        仅提取 WebFont 信息显示，不压缩与转码
  --ignore <pattern>            忽略的文件配置（可以是字体、CSS、HTML）
  --map <remotePath,localPath>  映射 CSS 内部 HTTP 路径到本地
  --debug                       开启调试模式
  --no-backup                   关闭字体备份功能
  --silent                      不显示非关键错误
  --revert                      恢复被压缩的 WebFont

```

### 检索文字并进行压缩 ###

![Alt text](/images/cmono-e772a5c1213e4c9de7c8b69e376c980.png){data-zoomable}

> 特别说明： @font-face 中的 src 定义的 .ttf 文件必须存在，其余的格式将由工具自动生成。

1. 创建 index.html，引入字体文件 `Alibaba.css`，并且在 `index.html` 中抄录所有文字。

```html5

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="./Alibaba.css" rel="stylesheet" />
  <title>Document</title>
</head>
<body>
</body>
</html>

```

2. 将这些文字设定 `css:font-family: 'AlibabaPuHuiTi'`，在浏览器中预览 `index.html` 确保字体设置以及生效。

```css
@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Thin.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Thin.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Thin.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Light.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Light.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Light.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Regular.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Regular.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Regular.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Medium.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Medium.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Medium.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_SemiBold.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_SemiBold.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_SemiBold.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Bold.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Bold.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Bold.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_ExtraBold.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_ExtraBold.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_ExtraBold.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Heavy.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Heavy.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Heavy.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Heavy.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('./Alibaba/eot/AlibabaPuHuiTi_Black.eot') format('embedded-opentype'),
    url('./Alibaba/woff2/AlibabaPuHuiTi_Black.woff2') format('woff2'),
    url('./Alibaba/woff/AlibabaPuHuiTi_Black.woff') format('woff'),
    url('./Alibaba/ttf/AlibabaPuHuiTi_Black.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-weight: bold;
}


html,body{
  font-family: AlibabaPuHuiTi;
}

```

3. 在当前目录运行 `font-spider .\font\index.html` 这时候就会在相应的字体文件中生成压缩后的文件。且源文件(ttf格式)会放到新生成的.font-spider文件夹中，如下图

![Alt text](/images/cmono-c7f2a9136fc9849331ea143e2fe1f38.png){data-zoomable}　

4. 现在可以看见字体大小已经从原来8多M压缩到了200Kb左右。

原：

![Alt text](/images/cmono-b89118bc3d35017751318e8bb06c7c0.png){data-zoomable}

压缩后：

![Alt text](/images/cmono-eedba2e720ace149d3c390bda5b301b.png){data-zoomable}
　　

到现在字体文件压缩就算已经全部搞定，可以检测一下项目看是否生效。

## 注意事项 ##

1. font-spider 已经几年没有更新了，所以在使用中不可避免的会出现小问题，其中提示压缩的文件类型一般为ttf或者otf，可以在字体天下网站上下载字体进行测试：https://www.fonts.net.cn/
2. 在压缩过程中，会提示Offset is outside the bounds of the DataView ，这种可以重启命令行，重新打开相应文件，删除其中生成的未完成文件，就能运行成功。

## 提取项目中的所有汉字 ##

```js
const fs = require("fs");
const path = require("path");
console.log(__dirname)
console.log('------------------start--------------------')
let filesList = []; //文件路径列表
let jsFilesList = []; //文件路径列表
function readFileList(dir, filesList = []) {
console.log(`------------------${dir}--------------------`)
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList); //递归读取文件
    } else if (fullPath.endsWith(".vue")) {
      filesList.push(fullPath);
    } else if (fullPath.endsWith(".md")) {
      filesList.push(fullPath);
    } else if (/(.ts|.js)$/g.test(fullPath)) {
      jsFilesList.push(fullPath);
    }
  });
  return filesList;
}

readFileList(path.resolve(__dirname, "blog"), filesList);
readFileList(path.resolve(__dirname, "category"), filesList);
readFileList(path.resolve(__dirname, "gallery"), filesList);

fs.stat(path.resolve(__dirname, "font/local"), function (err, statObj) {
  // 判断local文件是否存在，如果不存在则创建，如果创建则直接处理json文件
  if (!statObj) {
    fs.mkdir(path.resolve(__dirname, "font/local"), function (err) {
      writeFile(filesList, "index");
      writeFile(jsFilesList, "jsIndex");
    });
  } else {
    writeFile(filesList, "index");
    writeFile(jsFilesList, "jsIndex");
  }
});
function writeFile(fileArr, fileName) {
  const reg_1 =
    /(?<!\/\/\s*.*|<!--\s.*)([\u2E80-\u9FFF]*\$?{{0,2}\w*\.*\w*}{0,2}[\u2E80-\u9FFF]+)*/g;
  const obj = fileArr.reduce((pre, cur) => {
    let fileSuffix = cur.match(/(.ts|.js|.vue|.md)$/g)?.[0];
    let pathName = path.basename(cur, fileSuffix);
    // 如果文件名是index,取父级文件名
    if (pathName === "index") {
      const pathArr = cur.split(path.sep);
      pathName = pathArr[pathArr.length - 2];
    }
    pre[pathName] = {};
    let pkg = fs.readFileSync(cur, "utf-8");
    const strArr = pkg.match(reg_1);
    if (strArr?.length) {
      strArr.forEach((item, index) => {
        if (item.includes("{")) {
          let index = 0;
          item = item.replace(/\$?{{0,2}\w*\.*\w*}{0,2}/g, function (val) {
            if (val) {
              index++;
              return `{${index - 1}}`;
            } else {
              return "";
            }
          });
        }
        // 如果匹配的字符串的字数大于10，处理key 值
        if (item.length) {
          let str = item.length >= 10 ? `${item.substring(0, 7)}...` : item;
          pre[pathName][str] = item;
        }
      });
    }
    return pre;
  }, {});
  // 创建json文件
  fs.writeFile(
    path.resolve(__dirname, `src/local/${fileName}.json`),
    JSON.stringify(obj),
    "utf8",
    function (err) {
      // console.log(err)
    }
  );
}
```

```bash
  node .\font_extractor.cjs
```

将生成的 json 内容复制到 `index.html` 中。
