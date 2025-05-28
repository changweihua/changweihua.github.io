---
outline: false
aside: false
layout: doc
date: 2025-02
title: 统一身份平台
description: 统一身份平台
category: 平台
pageClass: manual-page-class
---



## 网络拓扑图 ##

```echarts
{
        "title": {
            "text": "第一个 ECharts 实例"
        },
        "tooltip": {},
        "legend": {
            "data":["小红", "小明", "小黑"]
        },
        "xAxis": {
            "data": ["语文","数学","英语"]
        },
        "yAxis": {},
        "series": [
        {
            "name": "小红",
            "type": "bar",
            "data": [45, 15, 32]
        },
        {
            "name": "小明",
            "type": "bar",
            "data": [44, 14, 33]
        },
        {
            "name": "小黑",
            "type": "bar",
            "data": [38, 10, 35]
        }
        ]
    }
```


```mermaid
architecture-beta
  group api(logos:aws-lambda)[API]

    service web_platform(logos:chrome)[Web]
    service mobile_platform(logos:android-vertical)[H5]

    service envoy(devicon:envoy)[Gateway]
    service idp(devicon:packer)[IDP]
    service ro(devicon:readthedocs)[Resource Owner]
    service tool(devicon:html5)[ToolCheck Service]
    service flightDelay(devicon:html5)[FlightDelay Service]
    service newlife(devicon:html5)[NewLife Service]
    service database(logos:mysql)[Database]

    junction junctionCenter
    junction junctionRight

    web_platform:R -- L:junctionCenter
    junctionCenter:R -- L:envoy

```

## 开发计划 ##


```mermaid
---
title: Hello Title
zoomable: true
---
gantt
	dateFormat YY-MM-DD
	axisFormat %y.%m.%d
	excludes weekends
	title XXX项目开发计划

	% 定义第一个section
	section 预研
	技术预研: done, preface1, 25-01-01, 1w
	方案预研: done, preface2, 25-01-01, 1w
	内部讨论: crit, done, preface3, after preface2, 2d
	
	section 研发
	前端: done, dev1, after preface3, 15d
	后端: done, dev2, after preface3, 30d
	前后端联调: active, co-dev, after b2, 7d
	
	section 测试
	功能测试: test1, after co-dev, 7d
	性能测试: test2, after co-dev, 14d
	打包: test3, after test2, 3d
	
	section 发布
	预发布: release1, after c3, 2025-03-31
	正式发布: release2, after release1, 2d
	功能上线: milestone, release3, after release2, 0d
```

```mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid

```

## 网络拓扑图 ##


```mermaid
architecture-beta
  group api(logos:aws-lambda)[API]

    service web_platform(logos:chrome)[Web]
    service mobile_platform(logos:android-vertical)[H5]

    service envoy(devicon:envoy)[Gateway]
    service idp(devicon:packer)[IDP]
    service ro(devicon:readthedocs)[Resource Owner]
    service tool(devicon:html5)[ToolCheck Service]
    service flightDelay(devicon:html5)[FlightDelay Service]
    service newlife(devicon:html5)[NewLife Service]
    service database(logos:mysql)[Database]

    junction junctionCenter
    junction junctionRight

    web_platform:R -- L:junctionCenter
    junctionCenter:R -- L:envoy

```

## WEB/H5 独立开放平台访问 ##

```mermaid
zenuml
  title WEB/H5 独立开放平台访问

  @Actor User
  @AzureCDN SP as BusinessApp
  @PubSub Gateway as Envoy
  @CosmosDB IDP as IdentityProvider
  @Database RO as ResourceOwner
  
  SP->SP: 检测登录状态
  // **BusinessApp 认证授权**
  par {
      SP->IDP: 跳转至IdentityProvider
      IDP->IDP: 检测IdentityProvider认证状态
      // IdentityProvider 已认证
      opt {
        IDP->IDP: 跳转至授权页
        // 同意
        IDP->SP: 跳转至BusinessApp默认回调页
        // 拒绝
        IDP->IDP: 跳转至授权失败页
      }
      // IdentityProvider 未认证
      opt {
        SP->IDP: 跳转至认证页
        IDP->IDP: 用户输入用户名、密码等登录
        IDP->IDP: 认证通过，跳转至授权页
        // 同意
        IDP->SP: 跳转至BusinessApp默认回调页
        // 拒绝
        IDP->IDP: 跳转至授权失败页
      }
  }

  SP->Gateway: 获取应用资源
  Gateway->IDP: 认证
  if(Unauthenticated) {
      IDP->Gateway: 401
      Gateway->SP: 401
      SP->IDP: 跳转至IdentityProvider
  } else {
    Gateway->IDP: 鉴权
    if(Unauthorized) {
      IDP->Gateway: 403
      Gateway->SP: 403
      SP->SP: 自定义处理
    } else {
      IDP->Gateway: 200
      Gateway->RO: 转发请求
      RO->SP: 返回资源
      SP->SP: 资源展示
    }
  }

```



## WEB/H5 内嵌雀巢访问 ##

```mermaid
zenuml
  title WEB/H5 内嵌雀巢访问(用户已登录)

  @Actor User
  @CloudFront Cares as NewLife
  @AzureCDN SP as BusinessApp
  @PubSub Gateway as Envoy
  @Database RO as ResourceOwner
  @CosmosDB IDP as IdentityProvider
  
  Cares->SP: 携带Token打开
  SP->SP: 解析Token
  // Token Invalid
  opt {
      SP->Cares: Error
      SP->SP: 关闭应用
  }

  // **获取资源**
  par {
    SP->Gateway: 获取应用资源
    Gateway->Gateway: 认证
    // Gateway Token Invalid
    opt {
      Gateway->SP: 401
      SP->Cares: 401
      Cares->Cares: 刷新Token
    }

    // Gateway Token Valid
    opt {
      Gateway->IDP: 鉴权
      if(Unauthorized) {
        IDP->Gateway: 403
        Gateway->SP: 403
        SP->SP: 自定义处理
      } else {
        IDP->Gateway: 200
        Gateway->RO: 转发请求
        RO->SP: 返回资源
        SP->SP: 资源展示
      }
    }
  }
```



```mermaid
zenuml
  // **获取资源**
  par {
    SP->Gateway: 获取应用资源
    Gateway->Gateway: 验证Token合法性
    // Gateway Token Invalid
    opt {
      Gateway->SP: 401
      SP->IDP: 跳转至IdentityProvider
    }

    // Gateway Token Valid
    opt {
      Gateway->RO: 转发请求
      RO->RO: 权限判定
      RO->SP: 资源内容
      SP->SP: 资源展示
    }
  }
```
