---
lastUpdated: true
commentabled: true
recommended: true
title: Ubuntu 系统上离线手动安装.NET SDK
description: Ubuntu 系统上离线手动安装.NET SDK
date: 2024-04-03
pageClass: blog-page-class
---


# Ubuntu 系统上离线手动安装.NET SDK #

## 业务场景 ##

有时候，我们需要在同一台服务器上同时部署 .Net 6.0 或  .Net 7.0 、 .Net 8 ，这个时候就需要安装多个版本的.Net 了


## 操作步骤 ##


### 下载SDK ###

[下载 .NET 8.0](https://dotnet.microsoft.com/zh-cn/download/dotnet/8.0)

### 上传SDK到linux服务器 ###

Net7.0上传路径 `/usr/local/dotnet/7.0/sdk`

Net8.0上传路径 `/usr/local/dotnet/8.0/sdk`

### 解压安装 ###

进入保存目录 `cd /usr/local/dotnet/7.0/sdk`，执行解压并安装

```bash
mkdir -p $HOME/dotnet/7.01 && tar zxf dotnet-sdk-7.0.400-linux-x64.tar.gz -C $HOME/dotnet/7.01
  
mkdir -p $(pwd)/dotnet/8.0 && tar zxf dotnet-sdk-8.0.100-linux-x64.tar.gz -C $(pwd)/dotnet/8.0
```

> 确保登录用户具有目录权限。

需要注意，执行上面命令后，实际上安装到的路径是： /~/dotnet/7.01/

备注：不一定非要装到 $HOME/dotnet 目录，其他地方也是可以的。

### 编辑profile ###

编辑文件 `/etc/profile`

执行 `sudo vi /etc/profile`  ，在最后加入如下代码

```bash
export PATH=$PATH:$HOME/dotnet/7.01
export DOTNET_ROOT=$HOME/dotnet/7.01
```

> 实际上就是加到自己安装的路径去

最后刷新配置文件生效

  source /etc/profile

验证是否安装成功

  dotnet --version

或

  dotnet --info

## 安装 8.0 ##

实际上和上面安装7.0的步骤一样，区别就是按照路径不要和7.0在一起就行了，但是需要注意，你安装完成后，执行 dotnet --info 实际上指向的是你第一次安装的版本，如果想查看安装的8.0版本是否成功，可以通过创建软连接方式实现，例如

### 创建8.0的软连接 ###

  sudo ln -s /root/dotnet801/dotnet /usr/local/bin/dotnet8.01

最后执行查询版本是否安装成功

  dotnet8.01 --info
