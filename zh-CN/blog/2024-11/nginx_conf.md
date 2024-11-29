---
lastUpdated: true
commentabled: true
recommended: true
title: nginx配置域名转发、反向代理、负载均衡
description: nginx配置域名转发、反向代理、负载均衡
date: 2024-11-29 11:18:00
pageClass: blog-page-class
---

# nginx配置域名转发、反向代理、负载均衡 #

## 重定向 Rewrite ##

### 介绍 ###

- Rewrite根据nginx提供的全局变量或自己设置的变量，结合正则表达式和标志位实现url重写和者重定向。
- Rewrite和location类似，都可以实现跳转，区别是rewrite是在同一域名内更改url，而location是对同类型匹配路径做控制访问，或者proxy_pass代理到其他服务器。
- Rewrite和location执行顺序：
  - 执行server下的rewrite
  - 执行location匹配
  - 执行location下的rewrite


### 语法和参数说明 ###

**rewrite语法格式**

```javascript
rewrite        <regex>        <replacement>        <flag>;
 关键字        正则表达式         代替的内容         重写类型

Rewrite：一般都是rewrite
Regex：可以是字符串或者正则来表示想要匹配的目标URL
Replacement：将正则匹配的内容替换成replacement
Flag：flag标示，重写类型：
  - last：本条规则匹配完成后，继续向下匹配新的location URI规则；相当于Apache里德(L)标记，表示完成rewrite，浏览器地址栏URL地址不变；一般写在server和if中;
  - break：本条规则匹配完成后，终止匹配，不再匹配后面的规则，浏览器地址栏URL地址不变；一般使用在location中；
  - redirect：返回302临时重定向，浏览器地址会显示跳转后的URL地址；
  - permanent：返回301永久重定向，浏览器地址栏会显示跳转后的URL地址；

```

**使用示例**

```yaml
server {
  # 访问 /last.html 的时候，页面内容重写到 /index.html 中，并继续后面的匹配，浏览器地址栏URL地址不变
  rewrite /last.html /index.html last;

  # 访问 /break.html 的时候，页面内容重写到 /index.html 中，并停止后续的匹配，浏览器地址栏URL地址不变；
  rewrite /break.html /index.html break;

  # 访问 /redirect.html 的时候，页面直接302定向到 /index.html中，浏览器地址URL跳为index.html
  rewrite /redirect.html /index.html redirect;

  # 访问 /permanent.html 的时候，页面直接301定向到 /index.html中，浏览器地址URL跳为index.html
  rewrite /permanent.html /index.html permanent;

  # 把 /html/*.html => /post/*.html ，301定向
  rewrite ^/html/(.+?).html$ /post/$1.html permanent;

  # 把 /search/key => /search.html?keyword=key
  rewrite ^/search\/([^\/]+?)(\/|$) /search.html?keyword=$1 permanent;
  
  # 把当前域名的请求，跳转到新域名上，域名变化但路径不变
  rewrite ^/(.*) http://www.jd.com/$1 permanent;
  }

```

### IF判断和内置全局环境变量 ###

**if判断**

```javascript
if (表达式) {
}
```

当表达式只是一个变量时，如果值为空或任何以0开头的字符串都会当做false直接比较变量和内容时，使用`=`或`!=~`正则表达式匹配，`~*`不区分大小写的匹配，`!~`区分大小写的不匹配 

**全局环境变量**

```yaml
$args ：这个变量等于请求行中的参数，同$query_string
$content_length ： 请求头中的Content-length字段。
$content_type ： 请求头中的Content-Type字段。
$document_root ： 当前请求在root指令中指定的值。
$host ： 请求主机头字段，否则为服务器名称。
$http_user_agent ： 客户端agent信息
$http_cookie ： 客户端cookie信息
$limit_rate ： 这个变量可以限制连接速率。
$request_method ： 客户端请求的动作，通常为GET或POST。
$remote_addr ： 客户端的IP地址。
$remote_port ： 客户端的端口。
$remote_user ： 已经经过Auth Basic Module验证的用户名。
$request_filename ： 当前请求的文件路径，由root或alias指令与URI请求生成。
$scheme ： HTTP方法（如http，https）。
$server_protocol ： 请求使用的协议，通常是HTTP/1.0或HTTP/1.1。
$server_addr ： 服务器地址，在完成一次系统调用后可以确定这个值。
$server_name ： 服务器名称。
$server_port ： 请求到达服务器的端口号。
$request_uri ： 包含请求参数的原始URI，不包含主机名，如：”/foo/bar.php?arg=baz”。
$uri ： 不带请求参数的当前URI，$uri不包含主机名，如”/foo/bar.html”。
$document_uri ： 与$uri相同。


URL：http://localhost:81/download/stat.php?id=1585378&web_id=1585378
Server_Dir：/var/www/html
$host：localhost
$server_port：81
$request_uri：/download/stat.php?id=1585378&web_id=1585378
$document_uri：/download/stat.php
$document_root：/var/www/html
$request_filename：/var/www/html/download/stat.php

# 如果文件不存在则返回400
if (!-f $request_filename) {
    return 400;
}

# 如果host是www.360buy.com，则301到www.jd.com中
if ( $host != "www.jd.com" ){
    rewrite ^/(.*)$ https://www.jd.com/$1 permanent;
}

# 如果请求类型是POST则返回405，return不能返回301,302
if ($request_method = POST) {
    return 405;
}

# 如果参数中有 a=1 则301到指定域名
if ($args ~ a=1) {
    rewrite ^ http://example.com/ permanent;
}
```

例如，文件名及参数重写。当访问`/index.html`时，会转发到`/test.html`

```javascript
 # 文件名及参数重写
 location = /index.html {
	 # 修改默认值为
	 set $name test;

	 # 如果参数中有 name=xx 则使用该值
	 if ($args ~* name=(\w+?)(&|$)) {
	     set $name $1;
	 }
	
	 # permanent 301重定向
	 rewrite ^ /$name.html permanent;
}
```

例如，隐藏真实目录。用 `/html_test` 来掩盖真实路径`/html`

```javascript
# 隐藏真实目录
server {
  root /var/www/html;
  # 用 /html_test 来掩饰 html
  location / {
      # 使用break拿一旦匹配成功则忽略后续location
      rewrite /html_test /html break;
  }

  # 访问真实地址直接报没权限
  location /html {
      return 403;
  }
}
```

禁止指定IP访问

```javascript
 location / {
        if ($remote_addr = 192.168.1.253) {
                return 403;
        }
 }
```

如果请求的文件不存在，则反向代理到`localhost`。这里的break也是停止继续rewrite

```javascript
if (!-f $request_filename){
    break;
    proxy_pass http://127.0.0.1;
}
```

如果请求的文件不存在，则反向代理到localhost。这里的break也是停止继续rewrite

```javascript
if (!-f $request_filename){
    break;
    proxy_pass http://127.0.0.1;
}
```

对/images/bla_500x400.jpg文件请求，重写到/resizer/bla.jpg?width=500&height=400地址，并会继续尝试匹配location。

```javascript
rewrite ^/images/(.*)_(\d+)x(\d+)\.(png|jpg|gif)$ /resizer/$1.$4?width=$2&height=$3? last;
```

## 反向代理 Proxy_Pass ##

Proxy_pass作用是nginx的反向代理，用的是nginx的Proxy模块。 具体使用示例如下，仅改动`proxy_pass`部分。

```javascript
# 第一种：
location /proxy/ {
    proxy_pass http://127.0.0.1;
}
# 代理到URL：http://127.0.0.1/index.html


# 第二种：
location /proxy/ {
    proxy_pass http://127.0.0.1;  
}
# 代理到URL：http://127.0.0.1/proxy/index.html


# 第三种：
location /proxy/ {
    proxy_pass http://127.0.0.1/aaa/;
}
# 代理到URL：http://127.0.0.1/aaa/index.html


# 第四种（相对于第三种，最后少一个 / ）
location /proxy/ {
    proxy_pass http://127.0.0.1/aaa;
}
# 代理到URL：http://127.0.0.1/aaaindex.html
```

### 参数 ###

- `proxy_set_header  Host  $host;`  作用web服务器上有多个站点时，用该参数header来区分反向代理哪个域名。比如下边的代码举例。
- `proxy_set_header X-Forwarded-For  $remote_addr;` 作用是后端服务器上的程序获取访客真实IP，从该header头获取。部分程序需要该功能。

```javascript
# Proxy_pass配合upstream实现负载均衡
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
 
    # 待选服务器列表
    upstream servers {
      # ip_hash指令，将同一用户引入同一服务器。
      server 192.168.1.253:80      weight=5  max_fails=3 fail_timeout=30;
      server 192.168.1.252:80      weight=1  max_fails=3 fail_timeout=30;
      server 192.168.1.251:80      backup;
    }

    server {
        # 监听端口
        listen       80;
        # 域名配置
        server_name  www.test.com;
        # 根目录下
        location / {
            proxy_pass http://servers;
            proxy_set_header  Host  $host;
        }
    }
 }
```

## 负载均衡 ##

当一台服务器的单位时间内的访问量越大时，服务器压力就越大，大到超过自身承受能力时，服务器就会崩溃。为了避免服务器崩溃，让用户有更好的体验，就需要通过`负载均衡`的方式来分担服务器压力。

假设建立很多的服务器，组成一个服务器集群，当用户访问网站时，先访问一个中间服务器，在让这个中间服务器在服务器集群中选择一个压力较小的服务器，然后将该访问请求引入该服务器。如此以来，用户的每次访问，都会保证服务器集群中的每个服务器压力趋于平衡，分担了服务器压力，避免了服务器崩溃的情况。

### Nginx负载均衡的几种模式 ###

**轮询（默认）**：每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除，就不在分配

```javascript
upstream servers {
    server 192.168.1.253:80      max_fails=3 fail_timeout=30;
    server 192.168.1.252:80      max_fails=3 fail_timeout=30;
 }
```

**weight权重轮询**：根据后端服务器性能不同配置轮询的权重比，权重越高访问的比重越高，如下例，访问分配率分别是20%，80%；

```javascript
upstream servers {
    server 192.168.1.253:80      weight=2  max_fails=3 fail_timeout=30;
    server 192.168.1.252:80      weight=8  max_fails=3 fail_timeout=30;
}
#假如有十个请求，八个会指向第二台服务器，两个指向第一台；
```

**ip_hash**：根据请求的ip地址hash结果进行分配，第一次分配到A服务器，后面再请求默认还是分配到A服务器。可以解决Session失效重新登录问题；

```javascript
upstream servers {
  ip_hash;
  server 192.168.1.253:80      max_fails=3 fail_timeout=30;
  server 192.168.1.252:80      max_fails=3 fail_timeout=30;
}
# 如果客户已经访问了某个服务器，当用户再次访问时，会将该请求通过哈希算法，自动定位到该服务器。
```

**fair**：按后端服务器的响应时间来分配请求，响应时间短的优先分配；

```javascript
upstream servers {
  fair;
  server 192.168.1.253:80      max_fails=3 fail_timeout=30;
  server 192.168.1.252:80      max_fails=3 fail_timeout=30;
}
```

**Url_hash**：按访问url的hash结果来分配请求，使每个url定向到同一个后端服务器，后端服务器为缓存时比较有效；

```javascript
upstream servers {
  hash  $request_uri；
  hash_method crc32;
  server 192.168.1.253:80      max_fails=3 fail_timeout=30;
  server 192.168.1.252:80      max_fails=3 fail_timeout=30;
}
```

每个设备的状态设置为:

- down 表示这个server不参与负载均衡分配。
- weight 默认为1.weight越大，负载的权重就越大。
- max_fails：允许请求失败的次数默认为1.当超过最大次数时，返回 proxy_next_upstream模块定义的错误。
- fail_timeout:max_fails次失败后，暂停的时间。
- backup： 其它所有的非backup机器down或者忙的时候，请求backup机器。所以这台机器压力会最轻。

## nginx反向代理实例 ##

### 实例一 ###

代理 8023.com 到 192.168.227.3:8082/demo

```javascript
    server {
        listen       80;
        server_name  8023.com;

        location / {
            proxy_pass http://192.168.227.3:8082/demo/;
            root   html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```

### 实例二 ###

代理 8023.com/8082 到 192.168.227.3:8082/demo

代理 8023.com/8081到 192.168.227.3:8081

```javascript
    server {
        listen       80;
        server_name  8023.com;

        location /8082 {
            proxy_pass http://192.168.227.3:8082/demo/;
            root   html;
            index  index.html index.htm;
        }
        
        location /8081 {
            proxy_pass http://192.168.227.3:8081/;
            root   html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```

## nginx负载均衡实例 ##

请求8023.com，负载均衡，平均分配到8081和8083端口中

```javascript
http {
    ......
    upstream myserver {
        ip_hash;
        server 192.168.227.3:8081 weight=1;
        server 192.168.227.3:8083 weight=1;
    }
    ......
    server {
        location / {
            ......
            proxy_pass http://myserver;
            proxy_connect_timeout 10;
        }
        ......
    }
}
```

随着互联网信息的爆炸性增长,负载均衡( load balance)已经不再是一个很陌生的话题,顾名思义,负载均衡即是将负载分摊到不同的服务单元,既保证服务的可用性,又保证响应足够快,给用户很好的体验。快速增长的访问量和数据流量催生了各式各样的负载均衡产品,很多专业的负载均衡硬件提供了很好的功能,但却价格不菲,这使得负载均衡软件大受欢迎,nginx就是其中的一个,在linux下有 Nginx、LVS、 Haproxy等等服务可以提供负载均衡服务,而且 Nginx提供了几种分配方式(策略)

### 1、轮询(默认) ###

每个请求按时间顷序逐一分配到不同的后端服务器,如果后端服务器down掉,能自动剔除。

### 2、weight ###

weight代表权重，默认为1,权重越高被分配的客户端越多

指定轮询几率, weight和访问比率成正比,用于后端服务器性能不均的情况。例如:

```javascript
upstream myserver {
    server 192.168.227.3:8081;
    server 192.168.227.3:8083;
}
```

### 3、ip_hash ###

每个请求按访问ip的hash结果分配,这样每个访客固定访问一个后端服务器,可以解决 session的问题。例如:

```javascript
upstream myserver {
    ip_hash;
    server 192.168.227.3:8081;
    server 192.168.227.3:8083;
}
```

### 4、fair(第三方) ###

按后端服务器的响应时间来分配请求,响应时间短的优先分配

```javascript
upstream myserver {
    server 192.168.227.3:8081;
    server 192.168.227.3:8083;
    fair;
}
```
