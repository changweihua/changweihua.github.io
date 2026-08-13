---
lastUpdated: true
commentabled: true
recommended: true
title: Windows PowerShell Test-NetConnection 使用详解
description: Windows PowerShell Test-NetConnection 使用详解
date: 2026-08-12 09:15:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

在 Windows 网络排查中，`Test-NetConnection` 是一个非常实用的 PowerShell 命令。它可以用来测试目标主机是否可达、端口是否开放、DNS 是否解析正常、路由路径是否符合预期，也可以查看本机访问目标时使用的网络接口。

相比传统的 `ping`，`Test-NetConnection` 更适合排查真实业务连接问题。因为很多服务不依赖 ICMP，目标服务器也可能禁用了 ping，但 TCP 端口仍然是可用的。

## 基本语法 ##

```powershell
Test-NetConnection <目标主机或IP>
```

*测试指定端口*：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号>
```

*常见示例*：

```powershell
Test-NetConnection <目标主机或IP> -Port 80
Test-NetConnection <目标主机或IP> -Port 443
Test-NetConnection <目标主机或IP> -Port 3389
```

*其中*：

| 参数 | 含义 |
| :--- | :--- |
| `<目标主机或IP>` | 要测试的域名或 IP 地址 |
| `-Port` | 指定要测试的 TCP 端口 |
| `-InformationLevel` | 控制输出详细程度 |
| `-TraceRoute` | 显示到目标的路由路径 |
| `-ComputerName` | 指定目标主机名或 IP |

## 最常用：测试端口是否连通 ##

*例如测试目标主机的 HTTP 端口*：

```powershell
Test-NetConnection <目标主机或IP> -Port 80
```

*测试 HTTPS 端口*：

```powershell
Test-NetConnection <目标主机或IP> -Port 443
```

*测试远程桌面端口*：

```powershell
Test-NetConnection <目标主机或IP> -Port 3389
```

*如果端口连通，通常会看到*：

```text
TcpTestSucceeded : True
```

*如果端口不通，通常会看到*：

```text
TcpTestSucceeded : False
```

`TcpTestSucceeded` 是判断端口是否可达的关键字段。

## 输出结果怎么看 ##

*执行*：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号>
```

*常见输出字段如下*：

```text
ComputerName     : <目标主机或IP>
RemoteAddress    : <解析后的目标IP>
RemotePort       : <端口号>
InterfaceAlias   : <本机出接口名称>
SourceAddress    : <本机源IP>
TcpTestSucceeded : True
```

*字段说明*：

| 字段 | 说明 |
| :--- | :--- |
| ComputerName | 测试的目标名称或地址 |
| RemoteAddress | 实际连接的远端 IP |
| RemotePort | 测试的远端 TCP 端口 |
| InterfaceAlias | 本机使用的网络接口 |
| SourceAddress | 本机访问目标时使用的源 IP |
| TcpTestSucceeded | TCP 连接是否成功 |

*重点看三项*：

- `RemoteAddress`：确认 DNS 解析到的地址是否正确
- `SourceAddress`：确认本机使用的源地址是否正确
- `TcpTestSucceeded`：确认端口是否连通

## 替代 telnet 测试端口 ##

以前很多人会用 `telnet` 测试端口：

```bat
telnet <目标主机或IP> <端口号>
```

但 Windows 默认不一定安装 Telnet Client，而且 telnet 的输出不够直观。

*推荐改用*：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号>
```

*判断逻辑很简单*：

```text
TcpTestSucceeded : True   表示端口可连接
TcpTestSucceeded : False  表示端口不可连接
```

## 测试 DNS 解析 ##

*如果传入的是域名*：

```powershell
Test-NetConnection <域名> -Port 443
```

输出中的 `RemoteAddress` 会显示域名解析后的 IP。

*如果解析失败，可能是*：

- DNS 服务器不可用
- 域名写错
- 本机 DNS 配置错误
- 网络策略拦截解析

*可以配合下面命令进一步确认*：

```powershell
Resolve-DnsName <域名>
```

## 查看路由路径 ##

使用 `-TraceRoute` 可以查看访问目标经过的路径：

```powershell
Test-NetConnection <目标主机或IP> -TraceRoute
```

它的作用类似 tracert，但输出会和连接测试信息放在一起。

*常用于判断*：

- 流量是否走了预期网关
- VPN 或专线是否生效
- 多网卡环境下是否走错出口
- 哪一跳开始丢包或不可达

*也可以同时测试端口和路由*：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -TraceRoute
```

## 输出更详细的信息 ##

默认输出已经够用。如果需要更详细的信息，可以使用：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -InformationLevel Detailed
```

*常见取值*：

| 参数值 | 说明 |
| :--- | :--- |
| `Quiet` | 只返回 `True` 或 `False` |
| `Detailed` | 返回详细连接信息 |

例如只要布尔结果：

```powershell
Test-NetConnection <目标主机或IP> -Port 443 -InformationLevel Quiet
```

输出可能是：

```text
True
```

或：

```text
False
```

这种写法适合脚本判断。

## 在脚本中使用 ##

例如判断目标端口是否可用：

```powershell
$result = Test-NetConnection <目标主机或IP> -Port <端口号> -InformationLevel Quiet

if ($result) {
    Write-Host "端口可连接"
} else {
    Write-Host "端口不可连接"
}
```

批量测试多个端口：

```powershell
$ports = 80, 443, 3389

foreach ($port in $ports) {
    $result = Test-NetConnection <目标主机或IP> -Port $port -InformationLevel Quiet
    Write-Host "Port $port : $result"
}
```

批量测试多个目标：

```powershell
$targets = @(
    "<目标主机A>",
    "<目标主机B>",
    "<目标主机C>"
)

foreach ($target in $targets) {
    Test-NetConnection $target -Port 443
}
```

## 常见端口测试示例 ##

HTTP：

```powershell
Test-NetConnection <目标主机或IP> -Port 80
```

HTTPS：

```powershell
Test-NetConnection <目标主机或IP> -Port 443
```

SSH：

```powershell
Test-NetConnection <目标主机或IP> -Port 22
```

远程桌面：

```powershell
Test-NetConnection <目标主机或IP> -Port 3389
```

MySQL：

```powershell
Test-NetConnection <目标主机或IP> -Port 3306
```

SQL Server：

```powershell
Test-NetConnection <目标主机或IP> -Port 1433
```

Redis：

```powershell
Test-NetConnection <目标主机或IP> -Port 6379
```

## 常见排查场景 ##

### ping 不通，但业务可能正常 ###

很多服务器会禁用 ICMP，所以 ping 不通并不能直接说明业务端口不通。

*建议直接测试业务端口*：

```powershell
Test-NetConnection <目标主机或IP> -Port <业务端口>
```

如果：

```text
TcpTestSucceeded : True
```

说明 TCP 端口可连接，即使 ping 不通，业务也可能是正常的。

### 网站打不开 ###

*测试 HTTPS*：

```powershell
Test-NetConnection <域名> -Port 443
```

如果 TcpTestSucceeded 是 False，可能是：

- 本机网络不通
- DNS 解析错误
- 防火墙拦截
- 代理配置异常
- 目标服务未监听端口
- 中间网络设备拦截

### 远程桌面连接失败 ###

测试 RDP 端口：

```powershell
Test-NetConnection <目标主机或IP> -Port 3389
```

如果端口不通，需要检查：

- 目标机器是否开启远程桌面
- 目标机器防火墙是否允许 RDP
- 中间网络是否放行 TCP 3389
- 路由是否正确
- 目标机器是否在线

### 数据库连接失败 ###

例如 SQL Server：

```powershell
Test-NetConnection <数据库服务器> -Port 1433
```

例如 MySQL：

```powershell
Test-NetConnection <数据库服务器> -Port 3306
```

如果端口可达，但应用仍连接失败，问题可能不在网络层，而在：

- 用户名或密码错误
- 数据库权限不足
- 数据库监听地址限制
- SSL 或加密配置不匹配
- 应用连接字符串配置错误

### 多网卡或 VPN 路由异常 ###

执行：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -InformationLevel Detailed
```

重点查看：

```text
InterfaceAlias
SourceAddress
```

如果 SourceAddress 不是预期地址，说明系统可能走了错误网卡或错误路由。

可以继续查看路由表：

```powershell
route print
```

或者查看路径：

```powershell
Test-NetConnection <目标主机或IP> -TraceRoute
```

## Test-NetConnection 和 ping 的区别 ##

| 工具 | 主要用途 | 适合场景 |
| :--- | :--- | :--- |
| ping | 测试 ICMP 连通性 | 判断主机是否响应 ICMP |
| tracert | 查看路由路径 | 判断经过哪些网络节点 |
| telnet | 简单测试 TCP 端口 | 老式端口连通性测试 |
| Test-NetConnection | 综合网络连接测试 | 推荐用于 Windows 端口、路由、DNS 排查 |

*简单理解*：

- ping 通，不代表业务端口通
- ping 不通，也不代表业务端口一定不通
- Test-NetConnection -Port 更接近真实业务连接测试

## 常见问题 ##

### `TcpTestSucceeded` 是 `False` 一定是服务器问题吗 ###

不一定。

可能原因包括：

- 本机网络异常
- DNS 解析错误
- 本机防火墙拦截
- 中间防火墙拦截
- 目标服务器防火墙拦截
- 目标服务没有监听该端口
- 路由不正确
- VPN 或代理影响了连接路径

### `PingSucceeded` 是 `False`，但 `TcpTestSucceeded` 是 `True`，正常吗 ###

正常。

这通常说明目标不响应 ICMP，但 TCP 端口可以连接。很多生产服务器都会这样配置。

### `RemoteAddress` 不是我预期的地址怎么办 ###

如果测试的是域名，说明 DNS 解析结果和预期不一致。

可以检查：

```powershell
Resolve-DnsName <域名>
ipconfig /displaydns
ipconfig /flushdns
```

也要确认是否存在 hosts 文件配置、代理、VPN 或内网 DNS 策略。

### 命令执行很慢怎么办 ###

端口不通时，连接需要等待超时，所以看起来会比较慢。这通常是正常现象。

如果要在脚本中批量测试大量目标，建议控制目标数量，或者使用并发方式处理。

## 推荐排查流程 ##

当一个服务访问失败时，可以按下面顺序排查：

- 确认目标地址和端口是否正确
- 使用 `Test-NetConnection <目标> -Port <端口>` 测试端口
- 查看 `RemoteAddress` 是否解析正确
- 查看 `SourceAddress` 和 `InterfaceAlias` 是否符合预期
- 使用 `-TraceRoute` 查看路径
- 检查本机防火墙、目标防火墙和中间网络策略
- 如果端口可达，再检查应用层配置

## 实用命令汇总 ##

测试主机连通性：

```powershell
Test-NetConnection <目标主机或IP>
```

测试 TCP 端口：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号>
```

详细输出：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -InformationLevel Detailed
```

只返回 True 或 False：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -InformationLevel Quiet
```

查看路由路径：

```powershell
Test-NetConnection <目标主机或IP> -TraceRoute
```

测试端口并查看路由路径：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号> -TraceRoute
```

## 总结 ##

`Test-NetConnection` 是 Windows PowerShell 中非常适合网络排查的命令，尤其适合测试 TCP 端口是否可达。

日常排查时，最常用的是：

```powershell
Test-NetConnection <目标主机或IP> -Port <端口号>
```

重点关注：

- TcpTestSucceeded：端口是否连通
- RemoteAddress：目标解析是否正确
- SourceAddress：本机源地址是否正确
- InterfaceAlias：是否走了正确网卡

如果需要进一步判断路径，可以加上：

```powershell
Test-NetConnection <目标主机或IP> -TraceRoute
```

在 Windows 环境中，它可以替代很多传统的 `ping`、`telnet` 和 `tracert` 排查场景，是定位网络、端口、DNS、路由问题时非常值得掌握的工具。
