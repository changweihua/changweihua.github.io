---
lastUpdated: true
commentabled: true
recommended: false
title: 关于 JWT、JWS、JWE
description: 关于 JWT、JWS、JWE
date: 2024-01
---

# 关于 JWT、JWS、JWE #

## JWT（JSON Web Token） ##

JWT 是一个字符串，表示了一组字段声明的集合，以 JSON 格式组织数据，并以 JWS 或 JWE 方式编码。

JWT 由 Header、Payload、Signature 三部分组成，三个部分之间使用英文 . 分隔。

```bash

JWTString = Base64(Header) + "." + Base64(Payload) + "." + Signature

```
