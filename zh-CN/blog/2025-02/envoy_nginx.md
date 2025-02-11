---
lastUpdated: true
commentabled: true
recommended: true
title: 使用Envoy代替Nginx作为反向代理服务
description: 使用Envoy代替Nginx作为反向代理服务
date: 2025-02-11 13:00:00
pageClass: blog-page-class
---

# 使用Envoy代替Nginx作为反向代理服务 #

## 介绍 ##

Envoy 是一个由 Lyft 开发并开源的高性能、可扩展的服务代理，属于 “Service Mesh” 领域。它主要用作反向代理、负载均衡器和 API 网关，但其灵活的架构使其也可以用于其他用途。Envoy 设计之初的目标就是为云原生应用提供更加智能的网络通信能力。Envoy 相比 Nginx 的优势如下：

### 云原生设计 ###

- Envoy：专为微服务架构设计，具有丰富的动态配置能力，适用于云原生环境和 Kubernetes 中的服务网格。
- Nginx：虽然可以在微服务环境中使用，但最初并不是为云原生设计的，动态配置和服务发现能力相对较弱。

### 动态配置 ###

- Envoy：支持动态配置更新，无需重启即可应用新配置，减少了服务中断的风险。
- Nginx：虽然支持某些程度的热加载，但大部分配置更新依然需要重启服务，导致短暂的服务中断。

### Service Mesh 支持 ###

- Envoy：是许多 Service Mesh 解决方案（如 Istio）的核心数据平面代理，提供先进的流量管理功能，如熔断、限流、负载均衡和故障注入。
- Nginx：虽然可以通过 Lua 脚本等方式实现某些功能，但不如 Envoy 集成得那么深入和简便。

### 高级协议支持 ###

- Envoy：支持 HTTP/1.1、HTTP/2 和 gRPC 的高级负载均衡和代理能力，还提供了全面的流量管理功能。
- Nginx：也支持这些协议，但在 gRPC 和 HTTP/2 处理方面，Envoy 更加灵活和高效。

### 可观测性 ###

- Envoy：提供了全面的可观测性，包括分布式追踪、详细的统计数据、日志和指标，这些对于微服务架构中的故障排查和性能优化非常有帮助。
- Nginx：虽然也提供日志和基本的指标收集，但在分布式追踪和深入的指标收集上，Envoy 更加强大。

### 扩展性 ###

- Envoy：设计为高度可扩展和可编程，支持通过插件扩展其功能，特别适合复杂的微服务架构。
- Nginx：虽然也有丰富的模块化支持，但其扩展能力和动态配置的灵活性不如 Envoy。

### 多协议支持 ###

- Envoy：不仅支持 HTTP，还支持 TCP、UDP、gRPC、Redis 等多种协议的代理，适应性更强。
- Nginx：主要针对 HTTP，但也支持 TCP 和 UDP，不过 Envoy 的多协议支持更加全面和灵活。

## 安装Envoy ##

笔者的项目最早使用Nginx作为反向代理服务，为了在反向代理连接中利用multiplexing，决定将应用服务器的协议升级到HTTP2，但是Nginx的反向代理只支持HTTP1.1，在经过一系列调研后，决定使用Envoy替换掉Nginx作为新的反向代理服务。

笔者的服务器系统为ubuntu 22.04 LTS，可以直接在Envoy官网下载二进制包，[下载链接](https://github.com/envoyproxy/envoy/releases/download/v1.33.0/envoy-1.33.0-linux-x86_64)，目前最新版本为1.33.0，下载后得到名为envoy-1.33.0-linux-x86_64的文件，将该文件放到/usr/local/bin下并改名为envoy：

```bash
$ sudo cp envoy-1.33.0-linux-x86_64 /usr/local/bin/envoy
$ sudo chmod 777 /usr/local/bin/envoy
```

可以查看一下envoy的版本:

```bash
$ sudo envoy --version
envoy  version: 7b8baff1758f0a584dcc3cb657b5032000bcb3d7/1.31.0/Clean/RELEASE/BoringSSL
```

## 配置Envoy ##

为便于管理，我们可以将envoy配置为`systemd`服务，创建文件`/etc/systemd/system/envoy.service`，编辑内容如下：

```text
[Unit]
Description=Envoy Proxy
After=network.target

[Service]
ExecStart=/usr/local/bin/envoy -l debug -c /etc/envoy/envoy.yaml
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
LimitNOFILE=1048576
LimitNPROC=1048576
TimeoutStartSec=0
StartLimitBurst=3
StartLimitInterval=60s
TasksMax=infinity
User=root
Group=root

[Install]
WantedBy=multi-user.target
```

从服务配置中可以看到envoy自身的配置文件应位于`/etc/envoy/envoy.yaml`，我们稍后进行配置，首先了解下服务的整体架构：

- envoy安装在192.168.3.31，监听80和443端口
- 应用服务器1位于192.168.3.32，监听8443端口
- 应用服务器2位于192.168.3.33，监听8443端口
- 
证书的创建以及应用服务器的HTTP2协议配置过程不在此赘述，假设envoy和应用服务的证书已经配置好，编辑配置文件`/etc/envoy/envoy.yaml`如下：

```yml
# 管理员控制台的相关配置
admin:
  access_log_path: "/var/log/envoy/admin_access.log"
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 9901

static_resources:
  listeners:	
  # 为80端口创建一个监听器
  - name: main_listener_http
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 80
    per_connection_buffer_limit_bytes: 32768  # 每个连接的缓存大小限制在32 KiB
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: AUTO
          stat_prefix: ingress_http
          use_remote_address: true
          normalize_path: true
          merge_slashes: true
          path_with_escaped_slashes_action: UNESCAPE_AND_REDIRECT
          common_http_protocol_options:
            idle_timeout: 3600s
            headers_with_underscores_action: REJECT_REQUEST
          stream_idle_timeout: 300s
          request_timeout: 300s
          generate_request_id: false
          access_log:
          - name: envoy.access_loggers.file
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
              path: "/var/log/envoy/access.log"
              log_format: # 访问日志格式与nginx相同，便于迁移
                text_format: "%DOWNSTREAM_REMOTE_ADDRESS_WITHOUT_PORT% - - [%START_TIME%] \"%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%\" %RESPONSE_CODE% %BYTES_SENT% \"%REQ(REFERER)%\" \"%REQ(USER-AGENT)%\" \"%REQ(X-FORWARDED-FOR)%\"\n"
          route_config:
            name: local_route
            request_headers_to_add:
            - header:
                key: X-Client-IP
                value: "%DOWNSTREAM_REMOTE_ADDRESS_WITHOUT_PORT%"
            - header:
                key: X-Proxy
                value: "envoy"
            - header:
                key: X-Request-Start
                value: "%START_TIME(%s.%3f)%"
            virtual_hosts:
            - name: backend
              domains:
              - "192.168.3.31:80" # 该域名下的请求匹配当前路由规则
              routes:
              - match:
                  prefix: "/"
                redirect: # 所有http请求重定向为https
                  scheme_redirect: "https"
                  port_redirect: 443
          http_filters:
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
  # 为443端口创建一个监听器
  - name: main_listener_https 
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 443
    listener_filters:
    - name: "envoy.filters.listener.tls_inspector"
      typed_config:
        "@type": type.googleapis.com/envoy.extensions.filters.listener.tls_inspector.v3.TlsInspector
    per_connection_buffer_limit_bytes: 32768  # 每个连接的缓存大小限制在32 KiB
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: AUTO
          stat_prefix: ingress_http
          use_remote_address: true
          normalize_path: true
          merge_slashes: true
          path_with_escaped_slashes_action: UNESCAPE_AND_REDIRECT
          common_http_protocol_options:
            idle_timeout: 3600s
            headers_with_underscores_action: REJECT_REQUEST
          http2_protocol_options:
            max_concurrent_streams: 100
            initial_stream_window_size: 65536
            initial_connection_window_size: 1048576
          stream_idle_timeout: 300s
          request_timeout: 300s
          generate_request_id: false
          access_log:
          - name: envoy.access_loggers.file
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
              path: "/var/log/envoy/access.log"
              log_format: # 访问日志格式与nginx相同，便于迁移
                text_format: "%DOWNSTREAM_REMOTE_ADDRESS_WITHOUT_PORT% - - [%START_TIME%] \"%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%\" %RESPONSE_CODE% %BYTES_SENT% \"%REQ(REFERER)%\" \"%REQ(USER-AGENT)%\" \"%REQ(X-FORWARDED-FOR)%\"\n"
          route_config:
            name: local_route
            request_headers_to_add:
            - header:
                key: X-Client-IP
                value: "%DOWNSTREAM_REMOTE_ADDRESS_WITHOUT_PORT%"
            - header:
                key: X-Proxy
                value: "envoy"
            - header:
                key: X-Request-Start
                value: "%START_TIME(%s.%3f)%"
            virtual_hosts:
            - name: backend
              domains:
              - "192.168.3.31:443"
              routes:
              - match:
                  prefix: "/"
                route:
                  cluster: service # 将请求代理到service集群
                  max_stream_duration:
                    max_stream_duration: 0s
          http_filters:
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
      # envoy证书配置
      transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
          common_tls_context:
            alpn_protocols: ["h2", "http/1.1"]
            tls_certificates:
            - certificate_chain:
                filename: "/etc/envoy/cert/server.pem"
              private_key:
                filename: "/etc/envoy/cert/server.key"
  clusters:
  # 后端集群配置
  - name: service # 名为service的代理集群，与route_config中配置的一致
    per_connection_buffer_limit_bytes: 32768  # 每个连接的缓存大小限制在32 KiB
    type: STRICT_DNS
    load_assignment:
      cluster_name: service
      endpoints: # 两个后端服务器配置
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: 192.168.3.32
                port_value: 8443
        - endpoint:
            address:
              socket_address:
                address: 192.168.3.33
                port_value: 8443
    transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
          common_tls_context:
            alpn_protocols: ["h2", "http/1.1"]
    # http2相关配置
    typed_extension_protocol_options:
      envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
        "@type": type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions
        explicit_http_config:
          http2_protocol_options:
            initial_stream_window_size: 65536  # 64 KiB
            initial_connection_window_size: 1048576  # 1 MiB
overload_manager:
  resource_monitors:
  - name: envoy.resource_monitors.global_downstream_max_connections
    typed_config:
      "@type": type.googleapis.com/envoy.extensions.resource_monitors.downstream_connections.v3.DownstreamConnectionsConfig
      max_active_downstream_connections: 50000
```

编辑完毕后，启动envoy服务：

```bash
$ sudo systemctl start envoy
```

现在可以通过浏览器在443端口访问服务了，并且可以通过Chrome中的开发人员工具看到请求均使用http2协议，除此之外可以在后端应用服务处理请求时打印协议版本号，也可以发现从envoy向应用服务器发送的请求也使用http2协议。

## 其他 ##

由于Envoy官方并未提供日志切分压缩功能，因此需要使用logrotate工具处理，先确认下logrotate是否在cron任务中：

```bash
sudo vi /etc/cron.daily/logrotate
```

然后创建文件/etc/logrotate.d/envoy，内容如下：

```yml
/var/log/envoy/access.log {
    daily
    rotate 7
    missingok
    compress
    notifempty
    nocreate
    sharedscripts
    copytruncate
}
```

该配置对envoy的访问日志/var/log/envoy/access.log进行切分并压缩，且只保留7天内的日志

## 为什么 ##

你觉得为什么它能击败Nginx以及HAProxy等竞品，成为Service Mesh体系核心？

Envoy 是由 Lyft 开发并开源的一款高性能开源代理，近年来迅速成为 Service Mesh 体系的核心组件之一。它之所以能够击败 Nginx 和 HAProxy 等竞品，成为众多微服务架构中的首选，有以下几个主要原因：

### 设计现代化 ###

- 初始设计即为云原生和微服务：Envoy 从一开始就设计为服务代理，专注于服务间通信的复杂性，而不是像 Nginx 和 HAProxy 那样起源于传统的 L7 代理和负载均衡。
- 面向分布式系统：Envoy 的设计考虑了现代分布式系统的需求，例如动态配置、服务发现、健康检查等。

### 可观察性 ###

- 高级监控和追踪：Envoy 提供丰富的指标、日志和分布式追踪功能，能够与 Prometheus、Grafana、Jaeger 等工具无缝集成，使得服务之间的调用和性能问题能够被详细地监控和追踪。
- 丰富的可视化数据：支持详细的统计数据和可视化，帮助运维人员了解系统内部的工作情况。

### 动态配置和管理 ###

- xDS API：Envoy 使用 xDS API 进行动态配置，允许管理者通过中心化的控制平面动态调整路由、限流、熔断等配置，而无需重新启动代理。这在频繁变化的微服务环境中尤为重要。
- 热重载配置：配置变更不需要重启服务，这一点在生产环境中尤其关键，能够保证服务的连续性。

### 丰富的功能 ###

- 全面的 L7 代理功能：除了基本的 L4 负载均衡，Envoy 还提供 L7 代理功能，如 HTTP/2 和 gRPC 支持、流量劫持、路由控制、流量镜像等，适用于复杂的微服务通信需求。
- 服务发现和负载均衡：Envoy 支持多种服务发现机制和负载均衡策略，能够适应不同的微服务架构和部署环境。

### 扩展性和插件化 ###

- 可扩展架构：Envoy 的架构设计允许开发者通过插件扩展其功能，使其能够适应特定的业务需求。
- WebAssembly（Wasm）支持：Envoy 支持通过 Wasm 插件进行扩展，提供了一种灵活、安全且高效的扩展机制。

### 社区和生态系统 ###

- 活跃的社区：Envoy 由一个活跃且不断壮大的开源社区支持，Lyft、Google 等大型科技公司积极参与，确保了项目的持续发展和创新。
- 广泛的集成：Envoy 已被集成到许多开源项目和商业产品中，特别是在 Service Mesh 领域，如 Istio 和 Consul Connect，这些项目将 Envoy 作为数据平面代理，进一步扩大了其影响力和应用范围。

### 安全性 ###

- 先进的安全特性：Envoy 提供全面的安全功能，包括 TLS 终结和起源验证、mTLS（双向 TLS）、RBAC（基于角色的访问控制）等，确保服务间通信的安全性。

## 对比 Nginx 和 HAProxy ##

虽然 Nginx 和 HAProxy 也在不断发展并引入了许多现代功能，但 Envoy 的设计初衷和功能集更贴合微服务架构的需求。具体对比：

- 动态配置：Envoy 的 xDS API 和热重载配置比 Nginx 和 HAProxy 的静态配置文件和较为复杂的动态配置管理更为先进。
- L7 代理功能：Envoy 的 L7 代理功能和对 HTTP/2、gRPC 的支持更为全面，而 Nginx 和 HAProxy 主要还是在 L4 和基础的 L7 代理功能上。
- 可观察性：Envoy 原生支持高级监控和分布式追踪，而 Nginx 和 HAProxy 需要依赖额外的插件或外部工具。
- 扩展性：Envoy 通过 Wasm 插件提供了高效的扩展机制，而 Nginx 和 HAProxy 在插件化和扩展性上较为有限。

综上所述，Envoy 的现代化设计、高度的可观察性、动态配置能力、丰富的功能集、强大的扩展性和活跃的社区，使得它在微服务架构中更具优势，从而在与 Nginx 和 HAProxy 的竞争中脱颖而出，成为 Service Mesh 体系的核心组件。
