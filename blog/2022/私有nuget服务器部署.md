---
commentabled: true
recommended: false 
---

# 私有nuget服务器部署 #

我们采用BaGet进行Nuget私有服务器的搭建，支持容器化，可跨平台进行部署。

## 前期准备 ##

### Docker容器安装 ###

Install Docker

### Docker-compose安装 ###

[Install docker-compose](https://docs.docker.com/compose/install/)

## Baget 配置 ##

### 创建 `baget` 文件夹 ###

```bash

mkdir baget
cd baget

```

### 创建 `baget.env` 文件 ###

用来存储BaGet的配置信息

```bash

vim baget.env

```

在该文件中录入以下信息：（其中，ApiKey为推送nuget包时需要使用的，得记得。具体配置信息可参考baget官方文档）

```bash

ApiKey=NUGET-SERVER-API-KEY
Storage__Type=FileSystem
Storage__Path=/var/baget/packages
Database__Type=Sqlite
Database__ConnectionString=Data Source=/var/baget/baget.db
Search__Type=Database

```

### 创建data文件夹 ###

用于容器内数据持久化

```bash

mkdir data

```

## Docker 部署 ##

## 拉取镜像 ##

```bash

docker pull loicsharma/baget

```

### docker-compose 运行 ###

创建docker-compose.yml编排文件

```bash

vim docker-compose.yml

```

具体格式参考网上

```bash

version: '3.7'

services:
  nuget-server:
    image: loicsharma/baget:latest
    restart: always
    container_name: bagetserver
    ports:
      - 8050:80
    env_file: ./baget.env
    volumes:
      - ./data:/var/baget

```

启动服务

```bash

docker-compose up -d

```

### 直接运行 ###

```bash

docker run --privileged=true -d --restart=always --name baget
	-p 8624:80 --env-file baget.env 
	-v data:/var/baget loicsharma/baget:latest

```

### 运行结果 ###

<img src="/images/20201125143735.png" />

## 测试 ##

访问`ip地址:8624`即可访问

<img src="/images/20201125143800.png" />

## 上传包 ##

```bash

dotnet nuget push -s http://localhost:8624/v3/index.json -k NUGET-SERVER-API-KEY newtonsoft.json.11.0.2.nupkg

```

执行过程

<img src="/images/20201125144157.png" />

## 相关资料 ##

[https://loic-sharma.github.io/BaGet/installation/docker/](https://loic-sharma.github.io/BaGet/installation/docker/ "https://loic-sharma.github.io/BaGet/installation/docker/")
