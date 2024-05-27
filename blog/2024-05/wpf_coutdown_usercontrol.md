---
lastUpdated: true
commentabled: true
recommended: true
title:  WPF 自定义倒计时控件
description: WPF 自定义倒计时控件
date: 2024-05-27 09:18:00
pageClass: blog-page-class
---

# WPF 自定义倒计时控件 #

> Redhat配置yum源（使用阿里云yum Repo）

本教程使用于redhat7.6

## 1.查看版本号和系统类别：##

```bash
cat /etc/redhat-release
```

## 配置yum源 ##

```bash
cd /etc/yum.repos.d/ 
wget http://mirrors.aliyun.com/repo/Centos-7.repo
sed -i 's/$releasever/7/g' /etc/yum.repos.d/Centos-7.repo
yum makecache
```

## 完成 ##
