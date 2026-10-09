---
lastUpdated: true
commentabled: true
recommended: true
title: Spring AI 2.0.0 接 Skill 最小 Demo
description: SkillsTool 加载 SKILL.md 一次跑通
date: 2026-09-15 09:35:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

把 Skill 接进 Java 项目，最容易写偏成一件事：

> 在 system prompt 里多塞几条规则。

比如代码审查。

*你可以直接写*：

```txt
你是一个 Java 代码审查专家，请帮我看看下面这段代码。
```

模型通常也能回答。

但这种写法有一个问题：它更像临场发挥。

这一次它可能先看空指针，下一次可能先讲代码风格。再换一个人写 Prompt，又可能把安全、异常、测试全漏掉。

真正适合沉淀成 Skill 的，不是一句“你很专业”，而是一套稳定流程：

1. 先判断代码场景
2. 再按风险优先级检查
3. 发现问题后给出原因和修改建议
4. 最后补充测试建议

这篇用 Spring AI 2.0.0 跑一个最小 Demo：

```txt
本地 SKILL.md
→ SkillsTool 加载技能说明
→ ChatClient.tools(...)
→ 模型根据说明调用 Java Tool
→ 返回代码审查报告
```

先说清楚边界。

这里不是接入某个厂商的原生 Skills Runtime，也不是让 Spring AI 自动执行完整 Skill 包。

这里用的是 `spring-ai-agent-utils` 里的 SkillsTool，把本地 SKILL.md 接进 Spring AI 的 Tool Calling 链路。

对应的参考是 Spring 博客 [《Spring AI Agentic Patterns: Agent Skills - Modular, Reusable Capabilities》](https://spring.io/blog/2026/01/13/spring-ai-generic-agent-skills)

## 这套方案到底接了什么 ##

Spring 官方文章里，Agent Skills 的核心不是“更长的 Prompt”。

它更像一个目录：

```txt
my-skill/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

其中 `SKILL.md` 至少包含技能名称、描述和执行说明，也可以再配脚本、参考资料、模板和资源文件。

官方文章还强调了 progressive disclosure，也就是渐进式披露：

- Discovery：启动时只暴露 Skill 的 name 和 description
- Activation：任务匹配时，再加载完整 SKILL.md
- Execution：执行时，再按需要读取参考文件或执行脚本

这样做的好处是：

- 不需要一上来把所有 Skill 的完整内容都塞进上下文。
- 模型先知道“有哪些 Skill”，等任务真的匹配，再加载对应说明。
- 放到 Spring AI 里，这套方式是 tool-based integration。

官方文章提到的核心工具包括：

- SkillsTool：发现和加载 Skill
- FileSystemTools：读取参考文件
- ShellTools：执行辅助脚本

这个最小版本先只接两个东西：

- SkillsTool：加载本地 SKILL.md
- CodeReviewTools：执行基础代码检查

这条链路的分工是：

- SKILL.md：定义代码审查流程
- SkillsTool：让模型按需加载这本技能书
- CodeReviewTools：真正执行基础检查
- ChatClient：把模型、Skill、Tool 串起来

最重要的边界是：

> Skill 负责给流程，Tool 负责做动作，模型负责把它们串起来。

## 准备依赖和配置 ##

示例环境：

- Java 17
- Spring Boot 4.1.0
- Spring AI 2.0.0
- deepseek-v4-flash
- spring-ai-agent-utils 0.10.0

`pom.xml` 保留三个核心依赖：

```xml
<properties>
    <java.version>17</java.version>
    <spring-ai.version>2.0.0</spring-ai.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-deepseek</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springaicommunity</groupId>
        <artifactId>spring-ai-agent-utils</artifactId>
        <version>0.10.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

配置文件分两块。

一块是模型配置。

一块是代码审查 Prompt。

Prompt 不建议硬编码在 Controller 里，放到配置文件更容易改。

*application.yaml*：

```yml
spring:
  application:
    name: springai-deepseek-demo
  ai:
    deepseek:
      api-key: ${DEEPSEEK_API_KEY}
      chat:
        model: deepseek-v4-flash
        temperature: 0.3

app:
  code-review:
    prompt:
      system: |
        你是一个 Java 代码审查助手。

        长期规则：
        - 如果用户提交 Java 代码并要求审查，先调用 Skill 工具加载 code-review-skill。
        - 加载技能书后，再按照技能书里的审查顺序调用 reviewJavaCode 工具。
        - 优先指出 bug、安全风险、边界条件、异常处理和缺失测试。
        - 如果信息不足，要说明缺少哪些上下文，不要编造项目背景。
        - 不要输出与代码审查无关的泛泛建议。

        输出要求：
        - 用中文回答。
        - 使用 Markdown。
        - 先给总体结论，再列主要问题，最后给测试建议和下一步。
      user-template: |
        请审查下面这段 Java 代码。

        代码内容：
        {code}
```

如果用 IDEA 启动，在这里配置 Key：

```txt
Run/Debug Configurations
→ SpringaiDeepseekDemoApplication
→ Environment variables
→ DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

命令行启动：

```bash
export DEEPSEEK_API_KEY=你的 DeepSeek API Key
./mvnw spring-boot:run
```

## 写一本代码审查 Skill ##

在项目里新建：

```txt
src/main/resources/skills/code-review-skill/SKILL.md
```

内容如下：

```markdown
---
name: code-review-skill
description: 按固定流程审查 Java 代码，优先发现 bug、安全风险、边界条件、可维护性问题和缺失测试。当用户要求 review、审查、检查 Java 代码或判断代码有没有风险时使用。
---

# Java Code Review Skill

这个 Skill 用来审查 Java 代码。

它不是简单评价“代码好不好”，而是要求 Agent 按固定顺序检查：

1. 明显 bug
2. 空值、空集合、非法输入等边界条件
3. 安全风险，例如硬编码密钥、敏感信息泄露、权限绕过
4. 异常处理和日志
5. 可维护性问题
6. 缺失的测试场景

## 工作流程

### Step 1：先判断代码场景

先识别代码属于哪一类：

- Controller / API 入参处理
- Service 业务逻辑
- Repository / 数据访问
- 工具类
- 配置类
- 测试代码

不同类型代码的审查重点不同。

### Step 2：按风险优先级审查

优先输出会导致线上问题的内容。

输出顺序：

1. 高风险问题
2. 中风险问题
3. 低风险建议
4. 建议补充的测试

不要把格式问题放在 bug 前面。

### Step 3：调用代码审查工具

当用户提供 Java 代码时，调用 `reviewJavaCode` 工具。

工具返回的是基础审查报告。你可以在报告基础上补充解释，但不要改写成空泛建议，也不要删除审查路径。

### Step 4：输出格式

输出结构：

- 代码审查报告
- 审查路径
- 总体结论
- 主要问题
- 建议补充的测试
- 下一步

## 边界

- 不确定的问题要说明“不确定”，不要编造上下文。
- 没有看到完整工程时，不要断言一定会出问题。
- 涉及安全、权限、数据删除、支付、订单状态流转时，要提高风险级别。
- 如果代码片段太短，要指出还需要哪些上下文。

## 参考资料

如果需要更细的检查项，读取 `references/checklist.md`。
```

再放一个参考清单：

`src/main/resources/skills/code-review-skill/references/checklist.md`

```markdown
# Java 代码审查检查清单

## Bug 和边界条件

- 参数是否可能为 null
- 集合是否可能为空
- 字符串是否可能为空白
- 下标、分页、金额、数量是否有边界

## 安全风险

- 是否硬编码密码、Token、API Key
- 是否缺少权限校验
- 是否暴露敏感字段

## 异常和日志

- 是否吞掉异常
- 日志是否包含必要上下文
- 日志是否泄露敏感信息
```

这一步才是 Skill 的核心。

它不是让模型“更努力一点”，而是把团队希望长期复用的审查顺序写下来。

## 用 SkillsTool 加载 Skill ##

*新建配置类*：

```java
package com.example.springaideepseekdemo.config;

import org.springaicommunity.agent.tools.SkillsTool;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class SkillToolConfig {

    @Bean
    public ToolCallback skillTool() {
        return SkillsTool.builder()
                .addSkillsResource(new ClassPathResource("skills"))
                .build();
    }
}
```

这段代码会扫描：

- `src/main/resources/skills/`

然后把里面的 Skill 注册成一个 ToolCallback。

模型需要时，可以通过这个工具加载 code-review-skill 的完整 SKILL.md。

注意，它加载的是 Skill 说明，不是直接执行代码审查。

## 准备真正做检查的 Tool ##

SkillsTool 负责加载说明。

真正检查代码的，是应用侧 Tool。

这里可以先写一个朴素但确定的 CodeReviewTools：检查空指针、吞异常、`System.out.println`、疑似硬编码密钥、接口入参缺少校验。

它不是为了替代完整静态扫描，而是为了让 Demo 有一个确定结果：读者不需要猜模型有没有真的发现问题。

## 用 Controller 串起来 ##

Controller 提供三个接口：

```txt
POST /skills/code-review/run
POST /skills/code-review/run/stream
POST /skills/code-review/review
```

其中 `/run` 是主链路：

```txt
模型看到用户请求
→ 调用 SkillsTool 加载 code-review-skill
→ 根据 SKILL.md 的流程调用 reviewJavaCode
→ 返回报告
```

`/run/stream` 是同一条链路的流式版本。

`/review` 不经过模型，只直接调用 Java Tool。

保留它是为了做对比：如果 `/review` 能返回报告，说明本地 Tool 没问题；如果 `/run` 返回了带审查路径的报告，才说明模型链路也串起来了。

代码里建议加一个兜底：

```java
try {
    String content = chatClient.prompt()
            .user(user -> user.text(promptProperties.userTemplate())
                    .param("code", source))
            .tools(skillTool, codeReviewTools)
            .call()
            .content();
    if (content != null && content.contains("代码审查报告")) {
        return content;
    }
} catch (Exception ex) {
    log.warn("Code review model call failed, fallback to local tool. reason={}", ex.getMessage());
}
return codeReviewTools.reviewJavaCode(source);
```

这里加兜底，不是为了掩盖模型调用失败。

真实项目里反而应该这么做。

模型是否触发工具，受模型能力、Prompt、工具描述和上下文影响。应用侧要保证：即使模型这轮没有稳定触发工具，接口也能给出一个可解释的结果。

## 运行测试 ##

先编译：

```bash
./mvnw -DskipTests compile
```

启动项目：

```bash
export DEEPSEEK_API_KEY=你的 DeepSeek API Key
./mvnw spring-boot:run
```

测试主链路：

```bash
curl -X POST "http://localhost:8080/skills/code-review/run" \
  -H "Content-Type: text/plain" \
  --data-binary 'public String getName(User user) { return user.getName(); }'
```

如果模型稳定触发工具，会返回代码审查报告。

如果模型没有触发工具，接口会走应用侧兜底，也会返回类似结果：

```markdown
# 代码审查报告

审查依据：code-review-skill / references/checklist.md

## 审查路径

- Step 1：识别代码场景
- Step 2：按风险优先级检查
- Step 3：调用 reviewJavaCode 工具执行基础检查
- Step 4：按固定结构输出报告

## 总体结论

这段代码发现 1 个需要关注的问题，建议先处理高风险项。

## 主要问题

1. **存在空指针风险**

   风险级别：高

   问题说明：代码直接调用对象方法，但没有看到空值保护。参数为 null 时可能触发 NullPointerException。

   修改建议：在进入业务逻辑前做参数校验，或者使用明确的异常提示，让调用方知道问题出在哪里。
```

再测流式接口：

```bash
curl -N -X POST "http://localhost:8080/skills/code-review/run/stream" \
  -H "Content-Type: text/plain" \
  --data-binary 'public String getName(User user) { return user.getName(); }'
```

这里的 `-N` 很关键。

它会关闭 curl 的输出缓冲，更容易看到流式返回。

最后测本地 Tool：

```bash
curl -X POST "http://localhost:8080/skills/code-review/review" \
  -H "Content-Type: text/plain" \
  --data-binary 'public String getName(User user) { return user.getName(); }'
```

这条接口不经过模型，只用来验证本地检查逻辑。

对比这三条接口，重点不是多写一个 endpoint，而是看清楚分工：

- `/review`：验证本地 Tool 能不能产出确定报告
- `/run`：验证模型能不能按 Skill 说明调用 Tool
- `/run/stream`：验证同一条链路能不能流式返回

## 后面可以怎么扩展 ##

这个 Demo 只做了代码片段审查。

真实项目里，可以继续往研发流程里扩展：

1. 读取 Git Diff
2. 加载团队代码规范
3. 扫描 Pull Request
4. 生成 Review Comment
5. 补充测试建议

也可以把 `FileSystemTools` 接进来，让模型按 Skill 里的说明读取 `references/checklist.md`。

再往后，还可以接 `ShellTools`，执行一些确定性的脚本，比如跑单元测试、生成依赖树、检查格式。

但只要涉及读文件、执行命令、访问外部系统，就要补安全边界：

- 限制目录
- 限制命令
- 高风险操作二次确认
- 记录工具调用日志
- 必要时放进容器执行

Skill 的价值不是“让 Agent 什么都能自动做”。

更实际的价值是：

> 把一套可复用的工作方法，变成 Agent 能按需加载的流程说明。

## 写在最后 ##

Spring AI 2.0.0 接 Skill，不是为了追一个新名词。

更关键的是把三件事拆开：

- SKILL.md 定流程
- SkillsTool 加载流程
- Java Tool 执行动作

当这三件事分清楚以后，Skill 就不只是概念里的“技能书”。

它会变成项目里可以版本管理、可以复用、可以逐步增强的工程能力。
