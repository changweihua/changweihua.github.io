---
outline: false
aside: false
layout: doc
date: 2025-04
title: Zod 深度解析
description: TypeScript 运行时类型安全的终极实践指南
category: 工具
pageClass: manual-page-class
---

## 前言 ##

在现代 TypeScript 开发中，我们经常面临一个关键挑战：编译时类型安全 ≠ 运行时数据安全。

即使你的代码通过了 TypeScript 类型检查，来自 API 响应、用户输入或配置文件的数据仍可能在运行时导致意外错误。

Zod 应运而生，它填补了 TypeScript 类型系统与运行时验证之间的关键空白。

## 核心概念解析 ##

### 类型安全的三层架构 ###

- **静态类型**：`TypeScript` 编译时检查
- **运行时验证**：`Zod` 的数据校验
- **类型生成**：`z.infer` 自动推导

### Schema 即真理来源（Single Source of Truth） ###

Zod 的核心理念是：

```typescript
// 定义一次，多处使用
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email()
});

type User = z.infer<typeof UserSchema>; // 自动生成类型
function saveUser(user: User) { ... }  // 复用类型
```

## 完整的示例 ##

我们以提交表单数据并发送数据请求为例：

```jsx
// RegisterForm.tsx
import { useRequest } from "ahooks";
import { Button, Form, Input, message } from "antd";
import React from "react";
import { z } from "zod";

// 定义表单数据的 zod schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(20, "用户名最多20个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
}); 

// 转换为 TypeScript 类型
type RegisterFormData = z.infer<typeof registerSchema>;

// 模拟 API 请求
const mockRegisterApi = (
  data: RegisterFormData
): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

const RegisterForm: React.FC = () => {
  const [form] = Form.useForm();
  // 使用 useRequest 处理数据请求
  const { loading, run } = useRequest(mockRegisterApi, {
    manual: true, // 手动触发
    onSuccess: (result) => {
      if (result.success) {
        message.success("注册成功");
        form.resetFields();
      }
    },
    onError: (error) => {
      message.error("注册失败: " + error.message);
    },
  });
  // 表单提交处理
  const onFinish = async (values: RegisterFormData) => {
    try {
      // 使用 zod 验证表单数据
      const validatedData = registerSchema.parse(values);
      // 触发 API 请求
      await run(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 处理 zod 验证错误
        const errors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = { validateStatus: "error", help: curr.message };
          return acc;
        }, {} as any);
        form.setFields(
          Object.entries(errors).map(([name, value]) => ({ name, ...value }))
        );
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px" }}>
      <h2>用户注册</h2>
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ username: "", email: "", password: "" }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ required: true, message: "请输入邮箱" }]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterForm;
```

这个示例展示了如何将 `zod` 的类型安全验证与 `antd` 表单和 `useRequest` 这类的数据请求结合起来，创建一个更加安全的表单提交场景。

## 最后 ##

Zod 正在成为 TypeScript 生态中数据验证的事实标准，其设计哲学完美契合现代 TypeScript 应用的开发需求。
