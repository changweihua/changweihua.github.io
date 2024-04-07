---
lastUpdated: true
commentabled: true
recommended: true
title: netcore项目在Linux部署:nohup和supervisor方式
description: netcore项目在Linux部署:nohup和supervisor方式
date: 2024-04-07
---

# netcore项目在Ubuntu部署:nohup和supervisor方式 #

> 在Linux上部署netcore应用程序有两种常用方式：nohup和supervisord，这里简单演示一下这两种部署方式。

## 使用nohup部署 ##

介绍这种部署放方式前，首先认识一下 `nohup command &` 命令。这条命令表示：不挂断地后台执行command，输出在当前目录的nohup.out 文件中（补充：如果当前目录的nohup.out文件不可写，那么输出在 `$HOME/nohup.out` 文件中）。nohub表示不挂断执行，&表示后台执行。下边我们看一下怎样使用nohub来部署我们的项目。

首先发布项目，我习惯在windows上使用VS发布，然后通过文件上传工具（如WinSCP）上传到Ubuntu上。我们把发布的文件放在Ubuntu的Apps/HelloWorld目录下，如下：

然后执行 `nohup dotnet HelloWorld.dll &` 即可，非常简单。输出保存在`nohup.out`文件下，

>一个小细节：如果我们直接关闭Centos命令窗口可能会造成程序停止，尽量使用exit命令退出命令终端。

## 使用supervisord部署 ##

使用`supervisord`进行netcore项目部署是一种比较主流的方式，我们先了解一下supervisord吧！

Supervisor是用Python开发的一套通用的进程管理程序，能将一个普通的进程变为daemon（守护进程），并监控进程状态，异常退出时能自动重启了，被管理的进程被当作supervisor的子进程。supervisor可以控制这些子进程的开始，停止等。我们把一个进程交给supervisor管理时，可以给这个被管理的进程添加一个配置文件，用于设置这个进程是否自动启动、记录日志位置等。

### 安装supervisor ###

```bash
# yum install epel-release
# yum install -y supervisor
# systemctl enable supervisord  # 开机自启动
# systemctl start supervisord   # 启动supervisord服务
# systemctl status supervisord  # 查看supervisord服务状态
```

安装`supervisor`完成后，我们给`HelloWorld`项目添加一个配置文件，配置文件统一放在 `/etc/supervisord.d` 目录下，我们添加一个`HelloWorld.ini`配置文件

```bash
[program:Helloworld]
directory=/root/Apps/Helloworld
Command=/usr/bin/dotnet /root/Apps/Helloworld/Helloworld.dll
autostart=true
autorestart=true
startsecs=3
startretries=3
stopwaitsecs=10
log_stdout=/Apps/logs/Helloworld/out.log
log_stderr=/Apps/logs/Helloworld/err.log
```

添加完配置文件后，使用 `systemctl restart supervisord.service` 命令重启`supervisord`服务，因为我们在上边的`ini`文件中设置的自动启动`（autostart=true）`，所以我们的`HelloWorld`项目会自动启动。我们可以通过`supervisord`来查看管理的进程状态，停止和启动进程等。我们也可以使用 `supervisorctl stop/start all` 来停止/启动管理的所有进程。

> 总结：使用supervisord部署netcore应用十分简单：①添加一个xxx.ini配置文件  ②重启supervisord 即可。
