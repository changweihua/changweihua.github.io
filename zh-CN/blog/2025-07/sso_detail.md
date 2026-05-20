---
lastUpdated: true
commentabled: true
recommended: true
title: 什么是单点登录SSO吗？来看看最详细的SSO讲解！
description: 什么是单点登录SSO吗？来看看最详细的SSO讲解！
date: 2025-07-29 15:05:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 什么是单点登录（SSO） ##

单点登录的英文名叫做：**Single Sign On**（简称SSO），它是一种身份验证解决方案，**可让用户通过一次性用户身份验证登录多个应用程序和网站**。想象一下你们公司有N多个业务系统，什么邮箱、CRM、报销、知识库等全都是你们公司的并且各个系统独立的，而你的工作需要每天都用上这些系统，所以你不得不挨个儿登录一个又一个系统，即便你把密码设置成一样的也还是很繁琐。那么你们公司就非常需要SSO了，他就是用来解决多个业务之间只需要登录一个既可，而无需重复登录。故名为：**单点登录！**

## 如何实现单点登录 ##

### 单点登录的种类 ###

单点登录根据域名不同分为 `同域SSO` 和 `不同域SSO`，来看看区别：

### 同域名SSO ###

如果公司只有一个域名，通过二级域名区分不同的系统。比如公司有个域名 `a.com`，同时有两个业务系统 `service1.a.com` 和 `service2.a.com`。我们要做单点登录（SSO），需要一个登录系统 `sso.a.com`。用户只要在 `sso.a.com` 登录，那么 `service1.a.com` 和 `service2.a.com` 就也登录了。

用户在 `sso.a.com` 中登录之后，其实是在 `sso.a.com` 的服务端 `session` 中记录了登录状态，同时在浏览器端的 `sso.a.com` 下写入了Cookie。那么我们怎么才能让 `service1.a.com` 和 `service2.a.com` 登录呢？这里有两个问题：

- **Cookie跨域**：Cookie是不能跨域的，Cookie的domain属性是 `sso.a.com`，在给 `service1.a.com` 和 `service2.a.com` 发送请求是带不上的。
- **Session不共享**：sso、service1和service2是不同的应用，它们的session存在自己的应用内，是不共享的。 针对第一个问题，sso登录以后，可以将Cookie的域设置为顶域，即.a.com，这样所有子域的系统都可以访问到顶域的Cookie。也就是.a.com这个域名下。

Cookie的问题解决了，我们再来看看session的问题。我们在SSO系统登录了，这时再访问service1，Cookie也带到了service1的服务端，service1的服务端怎么找到这个Cookie对应的Session呢？这里就要把3个系统的Session共享。共享Session的解决方案有很多，例如：Redis。

同域下的单点登录是巧用了Cookie顶域的特性。实现起来很简单，但是很多时候域名是不一样的...

### 不同域名SSO ###

对于不同的域名，我们就使用不了顶层域cookie的手段了。

单点登录的魔力在于它巧妙地分离了 **“认证 (Authentication) ”** 和 **“授权访问应用 (Access to Application) ”**  这两个动作，并通过 **可信的第三方（身份提供者 - Identity Provider, IdP）** 在 **用户（User）、应用（Service Provider, SP）** 和 **IdP** 之间建立信任链。其核心思想是：

- 认证中心化： 用户只在一个地方（IdP） 登录一次，证明自己的身份。
- 信任传递： IdP 向用户访问的各个应用（SP） 安全地传递一个证明（Assertion/Token），证明“这个用户已经在我这里登录过了，他是谁（身份标识）”。
- 应用信任 IdP： 应用（SP）信任 IdP 发出的证明（通过加密签名、密钥验证等方式确保证明真实且未被篡改）。
- 建立本地会话： 应用（SP）验证证明有效后，为用户在其自身系统内创建一个登录会话（Session），允许用户访问。用户无需再向该应用提供用户名密码。

> 关键在于：**应用（SP）自己不再执行主要的用户名密码认证过程，而是委托并信任 IdP 的认证结果。**

有点拖沓了，直接上图：

### service2访问 ###


我在用口水话讲一下逻辑。假设现在有三个域名的系统：

- service1：www.service1.com
- service2：www.service2.com
- 认证中心SSO：www.sso.com

service1对应上图应用（service provider），认证中心就是（身份提供者）。

1. 假设用户第一次登录service1，此时service1发现用户并没有登录。随即重定向到SSO，并附带自己的地址参数。如：`www.sso.com?service=www.service1.com`
2. 到了SSO后，认证中心发现用户没有登录，跳转登录。用户登录完成后，**SSO根据用户信息生成session存到服务器端并生成token返回给浏览器存在SSO的域名下，也就是sso.com**。同时SSO还会生成一个来**令牌（后面解释）**。然后根据service1的重定向地址跳转到service1，同时在连接上带上这个令牌，如：`www.service1.com?token=xxxxxxx`
3. 回到service1后，service1拿到**令牌**去调用SSO的服务端接口验证令牌是否合法。SSO拿到令牌后，与服务端session比对，合法后返回token给service1.service1拿到token存在本域名下。即：service1.com。到此service1的登录完成了。
4. 很好，那如果此时用户访问service2呢，service2肯定没有登录，此时，service2也带上自己的地址参数去访问SSO。此时的SSO已经通过service1登录过了，SSO会先请求验证是否有登录以及登录是否有效。发现已经登录成功了，随即跳过登录认证步骤，直接返回令牌给service2，service拿到后就和service1一样的操作了。注意：**验证是否登录的操作是在SSO里面完成的，所以SSO能拿到在sso.com域名下的Cookie**

到此，SSO的授权多系统登录就完成了。

## 拓展疑问 ##

1. 在第一个案例中使用顶层域名来存贮和自动携带cookie的方式里面，能不能存多个域名来实现SSO？就不用第二种方式那么麻烦了。

  在设置 Cookie 的 Domain 属性时，不允许指定多个域名。这是由 HTTP Cookie 标准（RFC 6265）明确规定的行为。

2. 在第二个方案中，是否有可以让SSO直接返回各个service系统可以直接使用的token，而不是令牌，因为拿到令牌后还要去验证一次，*登录链条过长*且用户可能感知到很慢。

  这个问题的话，需要根据自身业务情况去取舍，如果想要快速一些，可以在SSO返回的token里面进行一些加密处理。service拿到后再去解析出来，这样可以节省一个请求，确实会快一些。

  but，缺点就是，再返回的过程中*被拦截了，用户信息容易暴露，有安全隐患*。因为通常我们令牌有效期非常短，可能就只有几秒钟。安全性更高

3. （这一点是补充的，感谢汪同学的评论提醒）即SSO凭什么信任一个service的访问？当第二个service来访问的时候，SSO怎么判定service2和service1是一伙的呢？

  其实这个问题分成两个来说：

  如果说service系统本身是可以访问到用户数据库的，那么这个很好理解，service自己可以有一层AOP去做登录状态的验证，也就是说，service层自己能访问数据库的前提，这个就属于公司内部系统没有权限划分的情况。

  如果service层并不能访问用户数据，是隔离的。白名单！那么就需要service子系统提供一个凭证给SSO，SSO去核实白名单内是否有该子系统的注册信息（信息是需要子系统提前认证注册的），有就放行，没有就不严重不通过。

  比如：

  - SSO 需要配置 service1 的 **公钥证书** 来验证 service1 发送的 “令牌” 认证请求的签名。
  - service1 需要配置 SSO 的 **公钥证书** 来验证 ”令牌“ 响应的签名。
