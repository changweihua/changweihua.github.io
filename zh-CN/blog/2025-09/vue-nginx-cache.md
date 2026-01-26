---
lastUpdated: true
commentabled: true
recommended: true
title: VUE项目发版后用户访问的仍然是旧页面？
description: 原因和解决方案都在这啦！
date: 2025-09-19 09:30:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

A系统（VUE项目）在版本迭代中，有时会出现打包上线后，用户仍然访问的是旧版本页面的现象。这时，用户需手动刷新，才能访问到新版本页面，影响用户体验。

这种现象出现的根本原因是浏览器缓存机制问题，那么，浏览器的缓存机制到底是怎样的？上述现象又该如何避免呢？

## 一、浏览器缓存机制 ##

浏览器默认缓存机制‌主要包括两种类型：‌强缓存‌和‌协商缓存‌。

强缓存是指浏览器在加载网页时直接从本地缓存中读取资源，而不与服务器进行交互。强缓存主要通过设置HTTP响应头中的Expires和Cache-Control来实现。

协商缓存是指浏览器在加载资源时，先向服务器询问资源是否发生变化。如果服务器确认资源未变化，则返回304状态码，浏览器继续使用缓存中的资源；否则返回新的资源。协商缓存主要通过在HTTP响应头中设置Last-Modified和ETag来实现。

其中强缓存优先于协商缓存，而当没有设置缓存的时候浏览器默认的缓存策略为：

**缓存时长 = (访问时间 - 最后一次修改时间) / 10**

## 二、A系统针对浏览器缓存的既有解决方案 ##

### （一）对于JS、CSS等静态资源 ###

A系统是基于vue-cli4脚手架开发的，其在每次Webpack打包过程中，会给生成的JS、CSS等静态资源文件名添加哈希后缀，并在index.html中引入带有相应哈希后缀的静态资源文件。

当版本无更新时，这些静态资源走浏览器缓存，当版本有更新时，浏览器会比对，重新请求，因此，每个版本的静态资源都是被正确引入的，不会因升级而出现缓存问题。

> 但是，public文件夹里的文件是不会被Webpack处理的，这些文件会直接被复制到目标目录，而我们的系统入口文件index.html就在public文件夹里。
> 也就是说，打包时，index.html文件是不会添加哈希后缀的，所以在版本更新后，依然会走浏览器缓存。

### （二）对于动态数据 ###

服务器端配置了 `Cache-Control：no-store`，也就是说，所有接口内容浏览器都不会缓存，每次请求都是新请求。

## 三、A系统缓存方案优化 ##

综上，可以猜想，A系统在版本迭代中有时会出现打包上线后用户仍然访问的是旧版本页面的现象，很可能是因为
其入口文件index.html在版本更新时会有缓存。

那么，怎么才能让index.html不被缓存呢？

要实现让静态资源被缓存，但让index.html不被缓存，则需要借助Nginx配置，通过设置针对 `index.html` 请求的 `header` 来控制缓存，具体配置如下：

```nginx
# 针对 index.html 设置不缓存
location = /index.html {
    add_header Cache-Control "no-cache, no-store, max-age=0, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# 针对 JS/CSS等 文件设置缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
  add_header Cache-Control "public, no-transform";
}
```

Nginx 配置上述代码后第一次发版，打开页面时，如果页面还在磁盘缓存阶段，未与服务器发生交互，则页面还是旧页面。这是因为，浏览器因之前的缓存策略，将上个版本的 `index.html` 缓存下来，即使服务器已经设置了新版本不缓存，浏览器还是优先使用本地磁盘缓存。但是后续再发版，就没有缓存问题了，也就不会再出现发版后用户访问的仍然是旧页面的现象了！
