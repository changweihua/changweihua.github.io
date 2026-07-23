---
lastUpdated: true
commentabled: true
recommended: true
title: Docker搭建Mysql8的主从复制
description: Docker搭建Mysql8的主从复制
date: 2026-01-07 10:35:00 
pageClass: blog-page-class
cover: /covers/mysql.svg
---

通过Docker部署Mysql主从复制，Docker安装在前篇有，直接演示：

## 拉取镜像 ##

```bash
# 获取有哪些镜像
docker search mysql

# 拉取MySQL镜像
docker pull mysql:8.0.32

# 查看镜像
docker images
```

## 主节点的配置 ##

### 创建数据存储目录 ###

```bash
mkdir -p /docker/mysql/master/data
```

### 创建日志目录 ###

```bash
mkdir -p /docker/mysql/master/logs
```

### 创建配置文件目录 ###

```bash
mkdir -p /docker/mysql/master/conf
```

进行快速启动 - 查看镜像是否有问题

> 注：不同的版本的配置文件位置不同，可通过快速创建，查看mysql的对应的配置文件位置，进行对应映射。

```bash
# 快速启动  -d是进行守护进程启动
docker run -p 3306:3306 --name mysql8 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0.32
 
# 启动成功后，进入容器内部拷贝配置文件，到宿主主机
docker cp  mysql8:/etc/mysql /docker/mysql/master/conf
 
# 删除刚才的容器，重新创建容器
docker stop mysql8
docker rm mysql8
```

### 运行容器 ###

```bash
docker run -p 3340:3306 --name mysql_master --privileged=true \
-v /docker/mysql/master/conf:/etc/mysql/conf.d \
-v /docker/mysql/master/logs:/var/log/mysql \
-v /docker/mysql/master/data:/var/lib/mysql \
-v /etc/localtime:/etc/localtime \
-e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0.32 --init-connect="SET collation_connection=utf8mb4_0900_ai_ci" --init-connect="SET NAMES utf8mb4" --skip-character-set-client-handshake 
```

### 进入容器 ###

```bash
docker ps -a
docker exec -it mysql_master /bin/bash
docker exec -it mysql_master env LANG=C.UTF-8 /bin/bash # 进入容器，这种进入避免显示中午乱码

# 打开MySQL，输入密码
mysql -uroot -p
# 查看数据库
show databases;
# 创建数据库
create database 数据库;

# 如果远程链接失败，可以修改默认密码校验方式（第三方工具可以连接上）
ALTER USER 'root'@'%' IDENTIFIED  WITH mysql_native_password BY '密码';
```

### 配置远程连接（对外连接的） ###

```bash
# 在MySQL下执行
use mysql;
# 创建对外访问的用户和权限
CREATE USER '用户名'@'%' IDENTIFIED WITH mysql_native_password BY '密码';
# 授权全部的权限（范围大）
# GRANT ALL ON *.* TO '用户名'@'%' WITH GRANT OPTION;
# 刷新权限
FLUSH PRIVILEGES;

# 退出
exit
```

### 创建自定义的配置文件（主服务器配置文件） ###

```bash
cd /docker/mysql/master/conf
touch my.cnf
```

**my.cnf文件内容**

```ini:my.cnf
[client]
# mysql客户端默认字符集
default-character-set=utf8mb4
[mysql]
default-character-set=utf8mb4
[mysqld]
# 跳过密码登录
#skip-grant-tables
#bind-address = 127.0.0.1
init_connect='SET collation_connection = utf8mb4_general_ci'
init_connect='SET NAMES utf8mb4'
# mysql服务端默认字符集
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
skip-character-set-client-handshake
# datadir=/var/lib/mysql  

# 主服务器唯一ID 默认是1
server-id=1
# 设置不要复制的数据库
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
binlog-ignore-db=performance_schema
# 设置需要复制的数据库（先创建好）
binlog-do-db=数据库名
# 启用二进制日志，日志的存放地址(默认是binlog)，就是在show master status;看到Filed名字
log-bin=/var/lib/mysql/mysql-bin
# 主机，1 只读 0 读写（默认是0）
read-only=0
# 设置logbin格式 有3种格式 
# STATEMENT(函数支持不好) 写指令，会出现主从数据不同步，now（）函数
# ROW(行模式大量修改效率不行，但支持存储引擎) - 默认的
# MIXED (综合，推荐)
binlog_format=mixed
## 跳过主从复制中遇到的所有错误或指定类型的错误，避免slave端复制中断。
## 如：1062错误是指一些主键重复，1032错误是因为主从数据库数据不一致
slave_skip_errors=1062
# 二进制日志过期清理时间，默认是0（不自动清理）
expire_logs_days=7
# 单个二进制日志大小
max_binlog_size=200M
# 设置每隔多少次事务提交操作，将这些操作写入二进制日志文件
sync_binlog=1
# 使用mysql_native_password插件的认证
# default_authentication_plugin=mysql_native_password
```

### 重启mysql容器 ###

```bash
docker ps -a
docker restart 容器id
```

## 创建用户并授权给从机 ##

### 主机创建用户 ###

```bash
# 连接上Mysql服务，执行
create user '用户名'@'%' identified with mysql_native_password by '密码';
# 授权复制的权限 ON后的*.*代表全部的库和表
GRANT REPLICATION SLAVE ON *.* TO '用户名'@'%';
# 刷新权限
FLUSH PRIVILEGES;

# 如果远程链接失败，可以修改默认密码校验方式（第三方工具可以连接上）
alter user '用户名'@'%' identified with mysql_native_password by '密码';
```

### 查询主机的状态 ###

```bash
show master status;
# 执行上面命令，得到 File(binlog日志) Position(接入点) Binlog_Do_DB(要复制的数据库) Binlog_IgnoreDB()
# 需要记录一下File、Position
```

## 从节点配置 ##

### 创建数据目录 ###

```bash
mkdir -p /docker/mysql/slave/data
```

### 创建日志目录 ###

```bash
mkdir -p /docker/mysql/slave/logs
```

### 创建配置文件目录 ###

```bash
mkdir -p /docker/mysql/slave/conf
```

### 创建自定义的配置文件 ###

```bash
cd /docker/mysql/slave/conf
touch my.cnf
```

**mysql.cnf文件内容**：

```ini:mysql.cnf
[client]
# mysql客户端默认字符集
default-character-set=utf8mb4
[mysql]
default-character-set=utf8mb4
[mysqld]
# 跳过密码登录
#skip-grant-tables
#bind-address = 127.0.0.1
init_connect='SET collation_connection = utf8mb4_general_ci'
init_connect='SET NAMES utf8mb4'
# mysql服务端默认字符集
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
skip-character-set-client-handshake
# datadir=/var/lib/mysql  

# 从服务器唯一ID
server-id = 2  
# 开启中继日志
relay-log=mysql-relay
# 从机，1 只读 0 读写（默认是0）
read-only=1
# 启用二进制日志，日志的存放地址，如果从机变成主机可以继续使用bin日志
# log-bin=mysql-slave-bin
# 使用mysql_native_password插件的认证
# default_authentiction_plugin=mysql_native_password
```

### 运行容器 ###

```bash
docker run -p 3341:3306 --name mysql_slave --privileged=true \
-v /docker/mysql/slave/conf:/etc/mysql/conf.d \
-v /docker/mysql/slave/logs:/var/log/mysql \
-v /docker/mysql/slave/data:/var/lib/mysql \
-v /etc/localtime:/etc/localtime \
-e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0.32 --init-connect="SET collation_connection=utf8mb4_0900_ai_ci" --init-connect="SET NAMES utf8mb4" --skip-character-set-client-handshake 
```

### 进入容器 ###

```bash
docker ps -a
docker exec -it mysql_slave /bin/bash
```

### 配置远程连接（对外连接的） ###

```bash
# 打开MySQL，输入密码
mysql -uroot -p
# 查看数据库
show databases;
# 创建数据库
create database 数据库;
# 查看数据库
# 在MySQL下执行
use mysql;
# 创建对外访问的用户和权限
CREATE USER '用户名'@'%' IDENTIFIED BY '密码';
GRANT ALL ON *.* TO '用户名'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

# 退出
exit
```

## 设置同步信息 ##

```bash
# 停止同步(之前配置过，需要执行)
stop slave;

# 设置同步
CHANGE MASTER TO MASTER_HOST='主机IP地址',
MASTER_PORT=端口,
MASTER_USER='主机用户',MASTER_PASSWORD='主机用户的密码',
MASTER_LOG_FILE='binlog日志名字',
MASTER_CONNECT_RETRY=30,
MASTER_LOG_POS=具体的接入点值;

# MASTER_CONNECT_RETRY 是如果连接失败，重试时间间隔，默认60秒
```

如果操作失败，需要重新配置，执行下面2个命令

```bash
stop slave;    # 停止同步操作
reset master;  # 重置主从配置，删除之前的中继日志，会再生成一份新的
```

开始同步

```bash
start slave;
```

检查是否成功

```bash
show slave status \G;  # 检查状态
# 如果结果下面的字段为Yes 代表配置成功
- Slave_IO_Running: Yes
- Slave_SQL_Running: Yes
```

停止和重置

```bash
# 从机上执行，停止I/O 线程和SQL线程的操作
stop slave; 

# 从机上执行，用于删除SLAVE数据库的relaylog日志文件，并重新启用新的relaylog文件
reset slave;

# 主机上执行，删除所有的binglog日志文件，并将日志索引文件清空，重新开始所有新的日志文件
reset master;
```

## 验证 ##

```bash
# 从主机上，创建表、插入SQL语句
# 创建表
CREATE TABLE `emp` (
  `id` int(11) NOT NULL COMMENT '主键',
  `name` varchar(255)  DEFAULT NULL COMMENT '员工名',
  `age` int(11) DEFAULT NULL COMMENT '年龄',
  `did` int(11) DEFAULT NULL COMMENT '部门id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='部门表';
INSERT INTO emp (`id`, `name`, `age`, `did`) VALUES (1, '刘备', 55, 1);
# 分别 在主机和从机进行查询该SQL语句
select * from  emp;
# 如：都看到相同的数据，代表成功
```

## 常见问题 ##

启动主从同步后，常见错误是 `Slave_IO_Running： No` 或者 `Connecting` 的情况，此时查看下方的 `Last_IO_ERROR` 错误日志，根据日志中显示的错误信息在网上搜索解决方案即可

**一 常见错误**：

```txt
Last_IO_Error: Got fatal error 1236 from master when reading data from binary log: 'Client requested master to start replication from position > file size'
```

**解决**：

```sql
-- 在从机停止slave
SLAVE STOP;

-- 在主机查看mater状态
SHOW MASTER STATUS;
-- 在主机刷新日志
FLUSH LOGS;
-- 再次在主机查看mater状态（会发现File和Position发生了变化）
SHOW MASTER STATUS;
-- 修改从机连接主机的SQL，并重新连接即可
```

**二：启动docker容器后提示 WARNING: IPv4 forwarding is disabled. Networking will not work.**

**解决**：

```ini
#修改配置文件：
vim /usr/lib/sysctl.d/00-system.conf
#追加
net.ipv4.ip_forward=1
#接着重启网络
systemctl restart network
```
