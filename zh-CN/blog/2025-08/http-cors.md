---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3自定义指令的探究与实践应用
description: Vue3自定义指令的探究与实践应用
date: 2025-08-05 13:55:00 
pageClass: blog-page-class
cover: /covers/http.svg
---

## 什么是 OPTIONS 预检请求？ ##

预检请求是浏览器在发送某些跨域请求之前，会发送一个 `OPTIONS` 请求，目的是为了确认服务器是否允许该跨域请求。

## 什么情况下会触发预检请求？ ##

### 发送非简单请求时 ###

简单请求包括 `GET`、`HEAD`、`POST`，因此，当发送除了这三个方法之外的请求时，例如 `PUT`、`DELETE`、`PATCH`，浏览器会先发送一个 `OPTIONS` 请求，询问服务器是否允许该请求。

### Content-Type 为 application/json 时 ###

当 `Content-Type` 为 `application/json` 时也会触发遇见请求， 而值为 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`时则不会触发预检请求。

### 当存在自定义请求头时 ###

当请求头中存在自定义请求头时或者在标准请求头中设置非标准内容时，也会触发预检请求。

## OPTIONS 预检请求流程 ##

`OPTIONS` 请求会包含一下头部信息：

- `Origin`：请求来源的域名
- `Access-Control-Request-Method`： 实际请求所使用的 HTTP 方法
- `Access-Control-Request-Headers`：实际请求所携带的自定义请求头

服务器需要在响应头中返回一些 CORS 相关的头部信息，例如：

- `Access-Control-Allow-Origin`：允许跨域请求的域名
- `Access-Control-Allow-Methods`：允许跨域请求的方法
- `Access-Control-Allow-Headers`：允许跨域请求的自定义请求头

如果 HTTP 请求满足服务器返回的响应头中的信息， 即服务器允许当前请求的跨域访问，那么浏览器才会发送实际的 HTTP 请求。否则，浏览器会拒绝该请求，并在控制台中输出报错信息。

## 预检请求的缓存 ##

预检请求并不会每次都发生，是因为浏览器会对预检请求进行缓存，服务器通过设置 `Access-Control-Max-Age` 来指定预检请求的缓存时间。

如果设置为 `86400`，指 `24` 小时内不再预

如果设置为 `-1`，则表示不缓存，每次请求前都会发送预检请求。
