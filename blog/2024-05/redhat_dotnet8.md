---
lastUpdated: true
commentabled: true
recommended: true
title:  Redhat 7.6 安装 .NET8
description: Redhat 7.6 安装 .NET8
date: 2024-05-07 13:18:00
pageClass: blog-page-class
---

# Redhat 7.6 安装 .NET8 #

1. 从官网下载对应的运行时环境压缩包。

下载地址：[dotnet-sdk-8.0.100-linux-x64.tar.gz](https://dotnet.microsoft.com/zh-cn/download/dotnet/8.0)

2.上传至服务器，以我为例我是上传至 `/usr/local/software/dotnet8`

3.运行命令解压环境压缩包

`tar -zxvf /home/dotnet8/dotnet-sdk-8.0.100-linux-x64.tar.gz -C /usr/local/software/dotnet8`

4.然后你可以将解压缩后的文件夹添加到你的系统 `PATH` 中，以便能够在任何地方运行 `dotnet` 命令。使用以下命令：

```bash
echo 'export PATH=$PATH:/usr/local/software/dotnet8' >> ~/.bashrc
source ~/.bashrc
```

5.验证一下是否成功安装。运行以下命令：

```bash
dotnet --version
```

如果报错：

问题1：

```bash
dotnet: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by dotnet)
dotnet: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by dotnet)
```
![alt text](/images/cmono-QQ截图20240506141018.png)

这可能是因为CentOS版本太低或者缺少`libstdc++.so.6` 版本 `GLIBCXX_3.4.20` 和 `GLIBCXX_3.4.21`

net8需要的环境 [libstdc.so-.6.0.26_c.gz](/files/net8需要的环境libstdc.so-.6.0.26_c.gz)

![alt text](/images/cmono-QQ截图20240506141039.png)

下载后上传至服务器，而后解压

```bash
cd /home
tar -zxvf /home/net8
```

检查一下目录中是否有 `libstdc++.so.6.0.26` 文件，将上面的最新动态库`libstdc++.so.6.0.26`复制到`/usr/lib64`目录下

```bash
cp /home/net8/libstdc++.so.6.0.26 /usr/lib64
```

然后先删除原有的`/usr/lib64/libstdc++.so.6` 这个符号链接，并创建相应的符号链接，最后更新系统的共享库缓存：

```bash
sudo rm /usr/lib64/libstdc++.so.6
sudo ln -s /usr/lib64/libstdc++.so.6.0.26 /usr/lib64/libstdc++.so.6
sudo ldconfig
```

默认动态库升级完成。重新运行以下命令检查动态库：

```bash
strings /usr/lib64/libstdc++.so.6 | grep GLIBC
```

然后在运行dotnet --version命令查看

> 补充：如果没有安装libstdc++可以先安装libstdc++

```bash
sudo yum install libstdc++
```

问题2：

* Process terminated .Couldn't find a valid ICU package installed on the system .Set the configuration flag System .Globalization .Invariant to true if you want to run with no globalization support
解决方式:有外网或者配置本地源:

```bash
yum install libicu
```

最后安装成功
