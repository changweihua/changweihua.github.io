---
outline: false
aside: false
layout: doc
date: 2025-04
title: Microsoft REST API 指南
description: Microsoft REST API 指南
category: 手册
pageClass: manual-page-class
---

## 什么是 REST API？ ##

REST（Representational State Transfer）是一种基于 HTTP 协议的架构风格，用于构建网络服务。REST API 是遵循 REST 架构风格的接口，通过标准的 HTTP 方法（如 GET、POST、PUT、DELETE）与客户端进行交互。

Microsoft 提供了一套 REST API 指南，旨在设计一致性高、易用性强的 RESTful 接口。指南广泛应用于 Microsoft 的云服务（如 Azure 和 Microsoft Graph）以及其他产品中。

## Microsoft REST API 的核心原则 ##

Microsoft 的 REST API 指南基于以下核心原则：

### 一致性 ###

- **统一的资源命名**：所有资源应使用一致的命名规则，通常为小写字母和连字符（-）。
- **标准化的 HTTP 方法**：使用标准的 HTTP 动词来表示操作，如：
  - **GET**：获取资源。
  - **POST**：创建资源。
  - **PUT**：更新资源。
  - **DELETE**：删除资源。

### 可预测性 ###

- **清晰的 URL 结构**：API 的 URL 应清晰地表示资源的层次关系。如：

```text
https://api.example.com/users/{userId}/orders/{orderId}
```

- **一致的响应格式**：API 应返回一致的 JSON 格式响应，包含标准的状态码和错误信息。

### 可扩展性 ###

- **版本控制**：通过 URL 或 HTTP 头部实现 API 的版本控制，例如：`https://api.example.com/v1/users`
- **使用 Accept 头部**：`Accept: application/vnd.example.v1+json`

### 安全性 ###

- **身份验证**：推荐使用 OAuth 2.0 或其他安全协议进行身份验证。
- **HTTPS**：所有 API 通信必须通过 HTTPS 加密。

## Microsoft REST API 的设计规范 ##

### 资源命名 ###

- 使用名词表示资源，避免使用动词。
- 资源名称应为复数形式，如：

```text
/users
/orders
```

### HTTP 方法的使用 ###

- **GET**：获取资源或资源集合。
- **POST**：创建新资源。
- **PUT**：更新资源（幂等操作）。
- **PATCH**：部分更新资源。
- **DELETE**：删除资源。

### 状态码 ###

API 应返回标准的 HTTP 状态码以表示操作结果：

- **200 OK**：请求成功。
- **201 Created**：资源创建成功。
- **204 No Content**：请求成功，但无返回内容。
- **400 Bad Request**：请求无效。
- **401 Unauthorized**：未授权。
- **404 Not Found**：资源未找到。
- **500 Internal Server Error**：服务器内部错误。

### 错误处理 ###

错误响应应包含详细的错误信息，通常以 JSON 格式返回。如：

```json
{
  "error":{
    "code":"InvalidRequest",
    "message":"The request is invalid.",
    "details":[
      {
        "target":"email",
        "message":"The email address is invalid."
      }
    ]
  }
}
```

### 分页 ###

对于返回大量数据的 API，推荐使用分页机制。如：

```bash
GET /users?page=1&pageSize=50
```

响应中应包含分页信息：

```json
{
  "data":[...],
  "pagination":{
      "currentPage":1,
      "pageSize":50,
      "totalPages":10,
      "totalItems":500
  }
}
```

### 版本控制 ###

API 的版本控制可以通过以下方式实现：

- **URL 路径**：`/v1/users`
- **HTTP 头部**：`Accept: application/vnd.example.v1+json`

## 设计一个用户管理 REST API ##

### API 端点设计 ###

|  操作  |  HTTP方法  |  URL  |  描述  |
|  :---  |  :----:  |  :---  |   :---  |
| 获取所有用户 | GET | /users | 获取用户列表 |
| 获取单个用户 | GET | /users/{userId} | 获取指定用户详情 |
| 创建新用户 | POST | /users | 创建新用户 |
| 更新用户信息 | PUT | /users/{userId} | 更新用户信息 |
| 删除用户 | DELETE | /users/{userId} | 删除用户 |

### 示例 ###

```C#
[ApiController]
[Route("api/v1/users")]
publicclassUsersController : ControllerBase
{
    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = new List<object>
        {
            new { Id = 1, Name = "Alice", Email = "alice@example.com" },
            new { Id = 2, Name = "Bob", Email = "bob@example.com" }
        };
        return Ok(users);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var user = new { Id = id, Name = "Alice", Email = "alice@example.com" };
        return Ok(user);
    }

    [HttpPost]
    public IActionResult CreateUser([FromBody] object user)
    {
        return Created("/api/v1/users/3", user);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] object user)
    {
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        return NoContent();
    }
}
```

## Microsoft REST API 的优势 ##

- **一致性**：通过统一的设计规范，减少了开发和使用 API 的学习成本。
- **可扩展性**：支持版本控制和分页，便于扩展和维护。
- **安全性**：推荐使用 HTTPS 和 OAuth 2.0，确保数据传输安全。
- **易用性**：清晰的 URL 结构和标准化的错误响应，提升了开发者体验。

## 总结 ##

Microsoft REST API 指南提供了一套清晰的设计规范，帮助构建一致性高、可扩展性强的 RESTful 接口。在实际开发中，遵循这些指南可以显著提升 API 的可维护性和用户体验。
