---
lastUpdated: true
commentabled: true
recommended: true
title: 使用registry搭建私服并推送拉去私服镜像
description: 使用registry搭建私服并推送拉去私服镜像
date: 2025-06-03 10:30:00 
pageClass: blog-page-class
---

# 使用registry搭建私服并推送拉去私服镜像 #

> 私服例子 `ip:192.168.1.2`

## docker拉取安装registry ##

```bash
docker run -d -v /你的挂载路径/:/var/lib/registry -p 5000:5000 --restart=always --privileged=true --name registry registry
```

## 需要配置一下/etc/docker/daemon.json ##

```json
{
  "registry-mirrors":[
     "https://docker.m.daocloud.io"
  ],
  "insecure-registries":["192.168.1.2:5000"]
}
```

`"insecure-registries"` 配置是让docker信任该地址，否则会提示https安全问题 `"insecure-registries":["registry-ip:5000"]`

## 重启docker命令 ##

```bash
systemctl restart docker
```

> 注意：如果docker重启报错要将daemon.json中的注释全部去掉。

### 检验是否安装成功使用命令 ###

```bash
curl http://192.168.1.2:5000/v2/
```

## 要推送前必须重命名成registry仓库地址/镜像名称 ##

```bash
docker tag hello-world 192.168.1.2:5000/hello-world
```

如果不是latest版本（下同）：

```bash
docker tag hello-world:版本 192.168.1.2:5000/hello-world:版本
```

如果不重名会默认推送和拉取docker官方地址docker.io

### 推送命令 ###

```bash
docker push 192.168.1.2:5000/hello-world
```

### 拉取命令 ###

```bash
docker pull 192.168.1.2:5000/hello-world
```

如果嫌拉取下来的带ip难用可以是命令重命名然后删除原来的镜像

```bash
docker tag 192.168.1.2:5000/hello-world hello-world
docker rmi 192.168.1.2:5000/hello-world
```
