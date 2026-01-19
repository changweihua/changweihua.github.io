---
lastUpdated: true
commentabled: true
recommended: true
title: Agent Skills 完全指南
description: 让你的 AI Agent 拥有超能力
date: 2026-01-19 10:20:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

Agent Skills 完全指南：让你的 AI Agent 拥有超能力

> 摘要： 本文详细介绍 Agent Skills 的概念、实现原理和最佳实践，通过实战案例教你如何为 AI Agent 添加自定义技能，让其能够调用外部工具、API 和服务，实现真正的自主任务执行。

## 📌 前言

随着大语言模型的快速发展，AI Agent 已经从简单的对话机器人进化成能够自主完成复杂任务的智能体。但是，仅仅依靠语言模型本身是不够的——Agent 需要 **Skills（技能）** 来与外部世界交互。

就像人类需要学习使用工具一样，AI Agent 也需要掌握各种技能：搜索网页、读写文件、调用 API、执行代码等。本文将带你深入了解 Agent Skills 的核心机制，并手把手教你实现自己的技能系统。

**适合人群**：

- AI Agent 开发者
- LangChain/AutoGPT 用户
- 想要扩展 AI 能力的工程师

## 🎯 什么是 Agent Skills？

### 核心概念

_Agent Skills_ 是赋予 AI Agent 执行特定任务的能力模块。每个 Skill 本质上是一个*可调用的函数*，包含：

- 函数名称：Agent 知道何时调用它
- 函数描述：告诉 Agent 这个技能能做什么
- 参数定义：需要什么输入
- 执行逻辑：实际的业务代码

### 工作原理

```txt
用户输入 → Agent 分析 → 选择合适的 Skill → 执行 Skill → 返回结果 → 继续推理
```

**典型流程**：

1. 用户："帮我查一下北京今天的天气"
2. Agent 识别需要使用 `get_weather` 技能
3. 提取参数：`{"city": "北京"}`
4. 执行技能，调用天气 API
5. 返回结果："北京今天多云，22-28°C"
6. Agent 组织语言回复用户

### 为什么需要 Skills？

| **挑战**         |        **解决方案**         |
| :--------------- | :-------------------------: |
| LLM 训练数据过时 | 通过搜索 Skill 获取实时信息 |
| 无法执行计算     |     添加代码执行 Skill      |
| 不能访问私有数据 |    创建数据库查询 Skill     |
| 无法操作外部系统 |     开发 API 调用 Skill     |

## 💻 实现你的第一个 Skill

### 基础示例：天气查询 Skill

以 Python 和 LangChain 为例：

```python
from langchain.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain.llms import OpenAI
import requests
​
def get_weather(city: str) -> str:
    """
    查询指定城市的天气信息
​
    Args:
        city: 城市名称（中文或英文）
​
    Returns:
        天气信息字符串
    """
    # 这里使用模拟数据，实际应调用真实天气API
    api_url = f"https://api.weatherapi.com/v1/current.json"
    params = {
        "key": "YOUR_API_KEY",
        "q": city,
        "lang": "zh"
    }
​
    try:
        response = requests.get(api_url, params=params)
        data = response.json()
​
        weather_info = f"{city}当前天气：{data['current']['condition']['text']}，" \
                      f"温度 {data['current']['temp_c']}°C，" \
                      f"体感温度 {data['current']['feelslike_c']}°C"
        return weather_info
    except Exception as e:
        return f"查询天气失败：{str(e)}"
​
# 将函数包装成 Tool
weather_tool = Tool(
    name="WeatherQuery",
    func=get_weather,
    description="用于查询城市的实时天气信息。输入城市名称，返回天气状况、温度等信息。"
)
​
# 创建 Agent
llm = OpenAI(temperature=0)
tools = [weather_tool]
​
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)
​
# 使用 Agent
response = agent.run("北京今天天气怎么样？")
print(response)
```

**关键点说明**：

- `name`：简洁明确的技能名称
- `description`：详细描述功能，帮助 Agent 判断何时使用
- `func`：实际执行的函数
- 错误处理：必须捕获异常并返回友好信息

### 进阶示例：文件操作 Skill

```python
import os
from typing import Optional
​
def read_file_skill(file_path: str, encoding: str = "utf-8") -> str:
    """
    读取文件内容
​
    Args:
        file_path: 文件路径（绝对路径或相对路径）
        encoding: 文件编码，默认 utf-8
​
    Returns:
        文件内容字符串
    """
    try:
        if not os.path.exists(file_path):
            return f"错误：文件 {file_path} 不存在"
​
        with open(file_path, 'r', encoding=encoding) as f:
            content = f.read()
​
        return f"成功读取文件，内容：\n{content[:500]}..."  # 限制返回长度
    except Exception as e:
        return f"读取文件失败：{str(e)}"
​
def write_file_skill(file_path: str, content: str, mode: str = "w") -> str:
    """
    写入内容到文件
​
    Args:
        file_path: 目标文件路径
        content: 要写入的内容
        mode: 写入模式，'w' 覆盖，'a' 追加
​
    Returns:
        操作结果描述
    """
    try:
        with open(file_path, mode, encoding='utf-8') as f:
            f.write(content)
        return f"成功写入文件 {file_path}"
    except Exception as e:
        return f"写入文件失败：{str(e)}"
​
# 创建工具集
file_tools = [
    Tool(
        name="ReadFile",
        func=read_file_skill,
        description="读取指定路径的文件内容。输入文件路径，返回文件内容。"
    ),
    Tool(
        name="WriteFile",
        func=write_file_skill,
        description="将内容写入指定文件。需要文件路径和要写入的内容作为参数。"
    )
]
```

## 🚀 实战案例：构建多技能 Agent

### 需求场景

创建一个能够：

1. 搜索网页信息
2. 进行数学计算
3. 生成并保存代码文件

的全能型 Agent。

### 完整实现

```python
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.llms import OpenAI
from langchain.utilities import SerpAPIWrapper
import math
import os
​
# Skill 1: 网页搜索
search = SerpAPIWrapper()
search_tool = Tool(
    name="WebSearch",
    func=search.run,
    description="用于搜索互联网信息。输入搜索关键词，返回相关网页结果摘要。"
)
​
# Skill 2: 数学计算
def calculator_skill(expression: str) -> str:
    """安全的数学表达式计算"""
    try:
        # 仅允许数学运算，防止代码注入
        allowed_names = {k: v for k, v in math.__dict__.items() if not k.startswith("__")}
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{str(e)}"
​
calculator_tool = Tool(
    name="Calculator",
    func=calculator_skill,
    description="执行数学计算。输入数学表达式（如 '2+2' 或 'sqrt(16)'），返回计算结果。"
)
​
# Skill 3: 代码生成与保存
def save_code_skill(code: str, filename: str, language: str = "python") -> str:
    """生成代码文件"""
    try:
        # 根据语言确定扩展名
        ext_map = {"python": "py", "javascript": "js", "java": "java", "cpp": "cpp"}
        ext = ext_map.get(language.lower(), "txt")
​
        full_path = f"{filename}.{ext}"
​
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(code)
​
        return f"代码已保存到 {full_path}"
    except Exception as e:
        return f"保存失败：{str(e)}"
​
code_tool = Tool(
    name="SaveCode",
    func=save_code_skill,
    description="保存代码到文件。需要提供代码内容、文件名和编程语言类型。"
)
​
# 组装 Agent
llm = OpenAI(temperature=0, model_name="gpt-4")
tools = [search_tool, calculator_tool, code_tool]
​
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    max_iterations=5
)
​
# 测试复杂任务
if __name__ == "__main__":
    # 任务：搜索 Python 排序算法，计算时间复杂度，生成示例代码
    result = agent.run("""
    请帮我完成以下任务：
    1. 搜索快速排序算法的原理
    2. 计算对 1000 个元素排序，平均需要多少次比较（假设 O(n log n)）
    3. 生成一个 Python 快速排序的实现代码并保存为 quicksort.py
    """)
​
    print("\n" + "="*50)
    print("最终结果：")
    print(result)
```

**运行效果**：

```txt
> Entering new AgentExecutor chain...
​
Thought: 我需要先搜索快速排序的原理
Action: WebSearch
Action Input: "快速排序算法原理"
​
Observation: 快速排序是一种分治算法...
​
Thought: 现在计算比较次数
Action: Calculator
Action Input: "1000 * log(1000, 2)"
​
Observation: 计算结果：9965.784284662087
​
Thought: 生成代码并保存
Action: SaveCode
Action Input: code="def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    ...", filename="quicksort", language="python"
​
Observation: 代码已保存到 quicksort.py
​
Final Answer: 已完成所有任务。快速排序采用分治策略...
```

## 📊 Skills 设计最佳实践

### 设计原则

| **原则** |        **说明**         |                             **示例**                              |
| :------- | :---------------------: | :---------------------------------------------------------------: |
| 单一职责 |  每个 Skill 只做一件事  |           ❌ `handle_data` → ✅ `read_csv`, `write_csv`           |
| 清晰命名 |     名称要表达功能      |                   ❌ `tool1` → ✅ `GetWeather`                    |
| 详细描述 | 帮助 Agent 理解使用场景 | "查询天气" → "查询指定城市的实时天气，包括温度、湿度、风速等信息" |
| 容错处理 |      必须捕获异常       |                    返回错误信息而不是抛出异常                     |
| 参数验证 |     检查输入合法性      |                 验证城市名不为空，文件路径存在等                  |

### 描述文本优化技巧

好的描述能让 Agent 更准确地选择技能：

```txt
# ❌ 不好的描述
description = "查天气"
​
# ✅ 优秀的描述
description = """
查询指定城市的实时天气信息。
​
使用场景：
- 用户询问某个城市的天气
- 需要获取温度、天气状况、体感温度等信息
​
输入：城市名称（支持中英文，如 "北京" 或 "Beijing"）
输出：天气描述文本，包含温度、天气状况、风力等
​
示例：
输入: "上海"
输出: "上海当前天气：多云，温度 25°C，体感温度 27°C，东南风 3 级"
"""
```

### 安全考虑

```python
def safe_skill_wrapper(func):
    """安全包装器：限制执行时间和资源"""
    def wrapper(*args, **kwargs):
        import signal
​
        def timeout_handler(signum, frame):
            raise TimeoutError("技能执行超时")
​
        # 设置 5 秒超时
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(5)
​
        try:
            result = func(*args, **kwargs)
            signal.alarm(0)  # 取消超时
            return result
        except Exception as e:
            signal.alarm(0)
            return f"执行失败：{str(e)}"
​
    return wrapper
​
@safe_skill_wrapper
def risky_skill(command: str) -> str:
    """可能耗时的操作"""
    # 执行逻辑
    pass
```

## ⚠️ 常见问题与解决方案

### Q1: Agent 不使用我的 Skill？

**原因**：

- 描述不够清晰
- 名称有歧义
- 功能与其他 Skill 重叠

**解决**：

```txt
# 改进描述，明确使用场景
description = """
当用户明确要求读取文件内容时使用此技能。
不要用于写入、删除或修改文件。
输入必须是具体的文件路径。
"""
```

### Q2: Skill 执行失败但 Agent 没有重试？

**解决方案**：

```python
def robust_skill(param: str) -> str:
    """带重试机制的技能"""
    max_retries = 3
​
    for attempt in range(max_retries):
        try:
            # 执行逻辑
            result = external_api_call(param)
            return result
        except Exception as e:
            if attempt == max_retries - 1:
                return f"重试 {max_retries} 次后仍然失败：{str(e)}"
            time.sleep(1)  # 等待后重试
```

### Q3: 如何传递复杂参数（如 JSON）？

```python
import json
​
def complex_skill(json_str: str) -> str:
    """接受 JSON 字符串参数"""
    try:
        params = json.loads(json_str)
        city = params.get("city")
        date = params.get("date")
        # 处理逻辑
        return f"查询 {city} 在 {date} 的数据"
    except json.JSONDecodeError:
        return "参数格式错误，请提供有效的 JSON 字符串"
​
# 使用时
Tool(
    name="ComplexQuery",
    func=complex_skill,
    description='需要 JSON 格式参数，例如：{"city": "北京", "date": "2024-01-01"}'
)
```

## 📝 总结

通过本文，你已经掌握了 Agent Skills 的核心知识：

**关键要点**：

- ✅ Skills 是 Agent 与外部世界交互的桥梁
- ✅ 设计 Skill 要遵循单一职责、清晰命名、容错处理原则
- ✅ 优秀的描述文本能显著提升 Agent 的技能选择准确率
- ✅ 实战中要注意安全性、超时控制和错误处理

**下一步建议**：

- 🔨 动手实现 3-5 个自己业务相关的 Skills
- 📚 深入学习 LangChain 或 Semantic Kernel 框架
- 🌐 探索 Function Calling 的高级用法
- 🤝 加入 AI Agent 开发社区，分享你的技能库

**记住**： 一个强大的 Agent 不仅取决于底层模型，更取决于你为它配备了哪些"武器"（Skills）。现在就开始构建你的技能库吧！
