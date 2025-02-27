---
outline: false
aside: false
layout: doc
pageClass: manual-page-class
---

##  docker的安装 ##

### 检查卸载老版本docker ###

ubuntu下自带了docker的库，不需要添加新的源。 但是ubuntu自带的docker版本太低，需要先卸载旧的再安装新的。

> 注：docker的旧版本不一定被称为docker，docker.io 或 docker-engine也有可能，所以我们卸载的命令为：

```bash
$ sudo apt-get remove docker docker-engine docker.io containerd runc
```

### 安装步骤 ###

1. 更新软件包

在终端中执行以下命令来更新Ubuntu软件包列表和已安装软件的版本:

```bash
sudo apt update
sudo apt upgrade
```

2. 添加Docker官方GPG密钥

执行以下命令来添加Docker官方的GPG密钥:

```bash
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
```

3. 添加Docker软件源

执行以下命令来添加Docker的软件源:

```bash
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
```

4. 安装docker，执行以下命令来安装Docker:

```bash
apt-get install docker-ce docker-ce-cli containerd.io
```

### 运行docker ###

- 我们可以通过启动docker来验证我们是否成功安装。

命令如下：

```bash
systemctl start docker
```

- 安装工具

```bash
apt-get -y install apt-transport-https ca-certificates curl software-properties-common
```

- 重启docker

```bash
service docker restart
```

- 验证是否成功

```bash
sudo docker version
```

## docker配置nginx镜像 ##

1. nginx的安装可参考以下博客：

此处忽略。

2. 在home下建立一下文件夹及子文件夹，用来待会挂载docker镜像中nginx容器的配置文件

3. 进入该nginx文件夹下，启动以下指令：

**获取docker镜像列表**

```bash
docker images
```

**拉取nginx配置生成nginx的docker镜像**

```bash
docker pull nginx
```

**进入与退出容器**

进入docker容器中查看所需挂载文件是否存在（容器中暂时称呼为容器环境，外部为宿主环境）

```bash
docker run -it nginx bash #进入
exit   #退出
```

**挂载配置文件**

因为我们不可能每次项目更新都去更改容器中nginx的配置，所以需要把容器中nginx的配置挂载在宿主环境，后续只需要更改宿主环境nginx配置即可。

复制容器中nginx配置文件于宿主环境：

```bash
docker cp 容器id: 容器naginx配置路径 宿主环境添加的路径
docker cp b4ceef0f6e91:/etc/nginx/nginx.conf /home/fronted-docker/nginx/conf/nginx.conf # nginx.conf复制
docker cp b4ceef0f6e91:/etc/nginx/conf.d/default.conf /home/fronted-docker/nginx/conf.d/default.conf # default.conf复制
```

根据自己端口来配置default.conf文件：

```bash
vim default.conf
```

### docker容器的创建启动及nginx的挂载 ###

- 把打包好的dist文件放入宿主环境的html下

- 容器的运行与配置文件挂载：端口号需与default.conf中的配置文件中一致

```bash
# docker run --name 自定义容器名 -d -p 宿主端口号:容器代理端口号
docker run --name mynginx -d -p 8082:8082 # mynginx: #自己命名的容器名，建议全部小写字母
-v /home/fronted-docker/nginx/html:/usr/share/nginx/html      #html文件夹的挂载
-v /home/fronted-docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf  #nginx.conf文件的挂载
-v /home/fronted-docker/nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf
-v /home/fronted-docker/nginx/logs:/var/log/nginx nginx           #nginx: 镜像名
```

- 查看容器是否正常启动：

```bash
docker ps
```

## 一些常用的docker指令 ##

- 查看镜像列表:

```bash
docker images
```

- 查看已经启动的容器

```bash
docker ps
```

- 停止容器运行

```bash
docker stop 容器id
```

- 删除容器(该指令执行必须先停止容器)

```bash
docker rm 容器id
```

- 进入容器

```bash
docker run -it 容器名或id bash
```

- 删除所有已经停止的容器

```bash
docker container prune
```

- 删除镜像

```bash
docker rmi 镜像id
```
