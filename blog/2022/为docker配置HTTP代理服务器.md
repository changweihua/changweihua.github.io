# 为docker配置HTTP代理服务器 #

> 背景： node1不能访问外网， node2可以访问外网，node1通过node2的代理服务来访问外网。

 

## node1不能访问外网 ##

```bash

vim /etc/resolv.conf

```

注释掉DNS配置文件

## node2搭建代理服务器， 这里是在centos7.2上用Squid搭建HTTP代理服务器 [如果已经有其他代理服务器，可以忽略这步] ##

### 2.1 安装 ###

```bash

yum install  -y squid
yum install  -y httpd-tools

```

### 2.2 生成密码文件 ###

```bash

mkdir /etc/squid/
# pill 是用户名
htpasswd -cd /etc/squid/passwords pill
# 提示输入密码，在此pill设密码为 pill
# 注意密码不要超过8位

```

### 2.3 测试密码文件 ###

```bash

/usr/lib64/squid/basic_ncsa_auth /etc/squid/passwords
# 输入 用户名 密码
pill pill
# 提示OK说明成功，ERR是有问题，请检查一下之前步骤
OK
# 测试完成，crtl + c 打断

```

### 2.4 配置Squid ###

```bash

vim /etc/squid/squid.conf
# 在最后添加
auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwords
auth_param basic realm proxy
acl authenticated proxy_auth REQUIRED
http_access allow authenticated
# 这里是端口号，可以按需修改
http_port 3128

```

### 2.5 启动Squid ###

```bash

systemctl restart squid.service

```

## 为docker设置代理 ##

### 3.1 创建目录 ###

```bash

mkdir -p /etc/systemd/system/docker.service.d

```

### 3.2 创建文件/etc/systemd/system/docker.service.d/http-proxy.conf，内容如下： ###

```bash

[Service]
Environment="HTTP_PROXY=http://pill:pill@node2:3128/"

```

### 3.3 重启docker ###

```bash

systemctl daemon-reload
systemctl restart docker

```

### 3.4 验证docker代理是否设置成功 ###

```bash

systemctl show --property=Environment docker

```

显示如下结果说明设置成功

```bash

Environment=GOTRACEBACK=crash HTTP_PROXY=http://pill:pill@node2:3128/

```