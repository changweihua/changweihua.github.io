---
lastUpdated: true
commentabled: true
recommended: false 
---

# docker搭建SVN #

> 容器 github目录 [https://github.com/elleFlorio/svn-docker](https://github.com/elleFlorio/svn-docker)


## 基础环境 ##

- 系统版本: centos-7.6(linux)
- 环境依赖: Docker
- 系统要求：
	- 防火墙放行80、3690端口(或者关闭防火墙)
	- 服务器的80和3690端口没有被占用

## 镜像 ##

推荐elleflorio/svn-server的镜像，包含了http和webui(svnadmin)

github地址: [https://github.com/elleFlorio/svn-docker](https://github.com/elleFlorio/svn-docker)

## 部署准备 ##

### 在宿主机创建svn相关目录 ###

```bash

mkdir -p /var/lib/svn/repo
chmod 777 /var/lib/svn/repo

```

- 创建放svn配置及仓库的目录
- 仓库给予权限为777，否则在svnadmin无法创建目录

### 拉取最新镜像 ###

```bash

docker pull elleflorio/svn-server

```

### 运行容器 ###

```bash

docker run --privileged=true -d --name svn-server -p 8011:80 -p 3690:3690 -v elleflorio/svn-server

```

### 复制容器中SVN配置文件至宿主机 ###

```bash

docker cp svn-server:/etc/subversion /var/lib/svn

```

> passwd 和 subversion-access-control 为文件

<br />

![Docker Container](/images/20201125145933.png){data-zoomable}

### 停止并移除容器 ###

```bash

docker stop svn-server
docker rm svn-server

```

## 正式运行 ##

### 运行容器并挂载配置及SVN目录 ###

```bash

docker run --privileged=true -d --restart=always --name svn-server 
	-p 8011:80 -p 3690:3690 
	-v /var/lib/svn/repo:/home/svn 
	-v /var/lib/svn/subversion-access-control:/etc/subversion/subversion-access-control 
	-v /var/lib/svn/passwd:/etc/subversion/passwd 
	elleflorio/svn-server

```

- 端口8011、3690可修改为自己要使用的端口；
- 8011对应于容器内httpd的80端口，也是用于外部访问svn的端口。

### 查看是否运行成功 ###

```bash

docker ps

```

> 若能够看到有svn-server正在运行中，则启动成功

### 修改容器内的httpd.conf中的ServerName ###

此时如果使用docker logs svn-server查看日志会发现以下错误
在这里插入图片描述
因此，需要修改httdp.conf的错误

```bash

docker exec -it svn-server /bin/sh
cd /etc/apache2/
vi httpd.conf

```

找到ServerName，去掉注释或者Copy一行，修改为自己的域名或IP+端口，如ServerName 192.168.1.2:8011

### 退出容器 ###

```bash

exit

```

### 重启容器并查看日志 ###

```bash

docker restart svn-server
docker logs svn-server

```

### 配置svnadmin ###

访问http://192.168.1.2:8011（此地址为模拟地址）设置svnadmin

- Subversion authorization file： /etc/subversion/subversion-access-control
- User authentication file (SVNUserFile)：/etc/subversion/passwd
- Parent directory of the repositories (SVNParentPath)：/home/svn
- Subversion client executable：/usr/bin/svn
- Subversion admin executable：/usr/bin/svnadmin

>

![Docker Container](/images/20201125145921.png){data-zoomable}

点击保存后，会默认创建admin/admin用户，进入界面后可修改admin的默认密码。

### 进入容器执行命令 ###

```bash

docker exec -it svn-server sh

```

### SVN 导入 ###

**导出原服务器备份**

![Docker Container](/images/20201209163420.png){data-zoomable}

```bash

# docker cp /home/test.dump  svn-server:/opt/test.dump
/home/svn # svnadmin load test < /opt/test.dump

```

![Docker Container](/images/20201127131743.png){data-zoomable}

### 总结 ###

- 使用elleflorio/svn-server镜像搭建SVN后，相对比较方便及快捷
- 通过elleflorio/svn-server容器中的svnadmin对SVN进行管理，创建资源库、管理用户及授权访问等比较方便
