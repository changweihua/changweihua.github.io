---
lastUpdated: true
commentabled: true
recommended: true
title: 在 .NET 9 中使用 Scalar 替代 Swagger
description: 在 .NET 9 中使用 Scalar 替代 Swagger
date: 2025-02-06 15:00:00
pageClass: blog-page-class
---

# 在 .NET 9 中使用 Scalar 替代 Swagger #

## 前言 ##

在.NET 9发布以后ASP.NET Core官方团队发布公告已经将Swashbuckle.AspNetCore（一个为ASP.NET Core API提供Swagger工具的项目）从ASP.NET Core Web API模板中移除，这意味着以后我们创建Web API项目的时候不会再自动生成Swagger API文档了。那么今天咱们一起来试试把我们的EasySQLite .NET 9的项目使用Scalar用于交互式API文档。

## Scalar介绍 ##

Scalar是一个功能强大、易于使用的API客户端和文档生成工具，适用于各种规模的API项目，支持多种编程语言和平台。

### 安装 Scalar.AspNetCore 包 ###

在NuGet包管理器中搜索：Scalar.AspNetCore （支持.NET 8和.NET 9）选择安装：

### 安装 Microsoft.AspNetCore.OpenApi 包 ###

用于添加OpenApi服务，这是Scalar所需的：

### 在 Program 中配置 ###

```csharp
// 添加OpenApi服务，这是Scalar所需的
            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Info = new()
                    {
                        Title = "EasySQLite API",
                        Version = "V1",
                        Description = ".NET 8操作SQLite入门到实战"
                    };
                    return Task.CompletedTask;
                });
            });
            
            // 在开发环境中启用Scalar
            if (app.Environment.IsDevelopment())
            {
                app.MapScalarApiReference();//映射Scalar的API参考文档路径
                app.MapOpenApi();//映射OpenApi文档路径
            }
```

### 查看Scalar交互式API文档 ###

在访问端口后面增加scalar/v1即可查看效果：
