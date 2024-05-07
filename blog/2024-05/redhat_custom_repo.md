---
lastUpdated: true
commentabled: true
recommended: true
title:  Redhat配置yum源
description: Redhat配置yum源
date: 2024-05-07 09:18:00
pageClass: blog-page-class
---

# Redhat配置yum源 #

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
