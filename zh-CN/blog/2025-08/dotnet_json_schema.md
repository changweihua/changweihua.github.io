---
lastUpdated: true
commentabled: true
recommended: true
title: 还在手写JSON调教大模型？.NET 9有新玩法
description: 还在手写JSON调教大模型？.NET 9有新玩法
date: 2025-08-01 10:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 引言 ##

.NET 9 迎来了一项备受期待的功能更新：对JSON Schema的原生支持。这一新增功能极大地简化了JSON Schema的生成与使用。JSON Schema作为一种描述JSON数据结构的标准格式，能够帮助我们有效地验证数据结构和类型。尤其在与大语言模型（LLM）进行交互的场景中，它扮演着至关重要的角色，可以精确定义模型输入与输出的数据格式，从而确保通信的准确性和可靠性。

## .NET 9 的新利器：`JsonSchemaExporter` ##

让我们从一个简单的例子开始。在.NET 9中，我们可以利用 `System.Text.Json` 命名空间下的新工具 `JsonSchemaExporter`，轻松地将一个C#类转换为对应的 `JSON Schema`。

首先，我们定义一个名为 `Book` 的C#类。这个类包含三个属性：`Title`、`Author` 和 `PublishYear`。其中，`Title` 是一个必需的字符串属性，`Author` 是一个可空字符串属性，而 `PublishYear` 是一个整数。

```C#
// 定义一个名为 Book 的类
public class Book
{
    // 必须的字符串属性 Title
    public required string Title { get; set; }

    // 可选的字符串属性 Author，允许为 null
    public string? Author { get; set; }

    // 整数属性 PublishYear
    public int PublishYear { get; set; }
}
```

接下来，在主程序中，我们只需调用 `JsonSchemaExporter.GetJsonSchemaAsNode` 方法，并传入我们的 `Book` 类型，即可生成其 `JSON Schema`。

```C#
class Program
{
    static void Main()
    {
        // 使用 JsonSchemaExporter 为 .NET 类型生成 JSON schema
        var schema = JsonSchemaExporter.GetJsonSchemaAsNode(
            JsonSerializerOptions.Default, 
            typeof(Book)
        );

        // 输出生成的 JSON schema
        Console.WriteLine(schema);
    }
}
```
运行上述代码，我们将得到以下JSON Schema输出：

```json
{
  "type": [
    "object",
    "null"
  ],
  "properties": {
    "Title": {
      "type": [
        "string",
        "null"
      ]
    },
    "Author": {
      "type": [
        "string",
        "null"
      ]
    },
    "PublishYear": {
      "type": "integer"
    }
  },
  "required": [
    "Title"
  ]
}
```
这个特性使得我们能够以标准化的 `JSON Schema` 形式来表示一个.NET类型，这对于实现远程过程调用（`RPC`）或与 `OpenAI`、`Google Gemini` 等AI服务进行集成时非常有用。

## 实战：结合OpenAI实现结构化输出 ##

我们知道，从 `gpt-4o-0806` 开始，`OpenAI` 便支持了通过 `JSON Schema` 来约束模型的输出格式。这个功能极大地便利了开发者，尤其是在需要模型返回复杂数据结构时。然而，手动编写和维护这些JSON Schema既繁琐又容易出错。现在，借助.NET 9的 `JsonSchemaExporter`，这个过程变得前所未有的简单。

> 注意：以下示例需要依赖 `Azure.AI.OpenAI NuGet` 包 2.2.0 或更高版本。

让我们来看一个实际的例子。假设我们需要让大模型分析一段关于篮子里放球、取球的描述，并返回一个包含各种颜色球类数量的结构化数据。

首先，定义我们期望的输出数据结构 `BallCounts` 类：

```C#
public class BallCounts
{
    public string? Think { get; init; } // 模型的思考过程
    public int Red { get; init; }
    public int Blue { get; init; }
    public int Yellow { get; init; }
    public int Green { get; init; }
    public int Confidence { get; init; } // 模型对答案的置信度
}
```

然后，在调用模型时，我们可以将这个 `BallCounts` 类型动态生成 `JSON Schema`，并直接传递给 `ChatCompletionOptions` 的  `ResponseFormat`。

```C#
// 初始化OpenAI客户端
OpenAIClient api = new AzureOpenAIClient(new Uri($"https://{Util.GetPassword("azure-ai-resource")}.openai.azure.com/"), new AzureKeyCredential(Util.GetPassword("azure-ai-key")));
ChatClient cc = api.GetChatClient("gpt-4o");

// 准备请求
var result = await cc.CompleteChatAsync(
    [
        new SystemChatMessage("你是人工智能助理"),
        new UserChatMessage("""
        有个空篮子，放里面放1个红色球，再往里面放1个蓝色球，再把红色球和黄色球拿出来，再放2个绿色球，请问这个篮子里面有几个球？分别是什么颜色？
        """),
    ], 
    new ChatCompletionOptions()
    {
        Temperature = 0,
        // 关键点：动态生成并设置JSON Schema
        ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
            nameof(BallCounts), 
            BinaryData.FromBytes(
                JsonSerializer.SerializeToUtf8Bytes(
                    JsonSchemaExporter.GetJsonSchemaAsNode(
                        JsonSerializerOptions.Default, 
                        typeof(BallCounts), 
                        new JsonSchemaExporterOptions()
                        {
                            // 确保非可空引用类型不被视为可空
                            TreatNullObliviousAsNonNullable = true
                        }
                    )
                )
            )
        )
    });

// 反序列化并输出结果
var ballCountsResult = JsonSerializer.Deserialize<BallCounts>(result.Value.Content[0].Text, JsonSerializerOptions.Default);
Console.WriteLine(JsonSerializer.Serialize(ballCountsResult, new JsonSerializerOptions { WriteIndented = true }));
```

模型返回的将是严格符合我们C#类结构的JSON：

```json
{
  "Think": "Let's break down the steps:\n\n1. Start with an empty basket.\n2. Add 1 red ball. (Basket: 1 red)\n3. Add 1 blue ball. (Basket: 1 red, 1 blue)\n4. Remove the red ball. (Basket: 1 blue)\n5. Remove the yellow ball. (Since there is no yellow ball in the basket, this step doesn't change anything. Basket: 1 blue)\n6. Add 2 green balls. (Basket: 1 blue, 2 green)\n\nSo, the basket contains 3 balls: 1 blue and 2 green.",
  "Red": 0,
  "Blue": 1,
  "Yellow": 0,
  "Green": 2,
  "Confidence": 100
}
```

## 随心所欲，轻松扩展 ##

这个方法的强大之处在于其灵活性。如果我们想调整输出结构，比如增加两种颜色（紫色和橙色），并将 `Confidence` 属性改为布尔类型的 Sure，我们 *只需要修改C#类定义* 即可。

```C#
public class BallCounts
{
    public string? Think { get; init; }
    public int Red { get; init; }
    public int Blue { get; init; }
    public int Yellow { get; init; }
    public int Green { get; init; }
    public int Purple { get; init; } // 新增
    public int Orange { get; init; } // 新增
    public bool Sure { get; init; }   // 修改
}
```

我们无需改动任何调用逻辑，只需重新运行程序，模型就会自动适应新的 `BallCounts` 结构，输出的JSON会神奇地包含所有新的颜色属性，并且 Sure 属性也被正确地处理为布尔值。

```json
{
  "Think": "Let's break down the steps:\n\n1. Start with an empty basket.\n2. Add 1 red ball.\n3. Add 1 blue ball.\n4. Remove the red ball.\n5. Remove the yellow ball (though there was no yellow ball added, so this step doesn't change the count).\n6. Add 2 green balls.\n\nAfter these steps, the basket contains:\n- 1 blue ball\n- 2 green balls\n\nTotal: 3 balls.",
  "Red": 0,
  "Blue": 1,
  "Yellow": 0,
  "Green": 2,
  "Purple": 0,
  "Orange": 0,
  "Sure": true
}
```

可见，模型完美地适应了新的数据契约。这种开发体验简直不要太方便！

## 对比：新方法 vs. 传统方法 ##

有趣的是，在OpenAI官方的.NET SDK文档中，关于结构化响应的示例 (openai-dotnet/README.md) 并没有采用 `JsonSchemaExporter`，而是手动编写了一大段 `JSON Schema` 字符串。这可能是因为官方文档旨在展示其库的原始能力，而非特定于.NET 9的便捷特性。

这是官网的示例代码，我们可以看到它相当繁琐：

```C#
// ...
ChatCompletionOptions options = new()
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
        jsonSchemaFormatName: "math_reasoning",
        jsonSchema: BinaryData.FromBytes("""
            {
                "type": "object",
                "properties": {
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "explanation": { "type": "string" },
                                "output": { "type": "string" }
                            },
                            "required": ["explanation", "output"],
                            "additionalProperties": false
                        }
                    },
                    "final_answer": { "type": "string" }
                },
                "required": ["steps", "final_answer"],
                "additionalProperties": false
            }
            """u8.ToArray()),
        jsonSchemaIsStrict: true)
};
// ...
```

与我们前面的方法相比，这种 `硬编码Schema` 的方式不仅工作量大，而且在需求变更时极难维护。而.NET 9的 `JsonSchemaExporter` 真正实现了“*定义一次，处处使用*”的优雅编程范式。

值得一提的是，据我了解，`Google Gemini`、`Ollama` 等其他主流模型服务提供商也已支持 `JSON Schema` 格式化。这意味着您学到的这项技巧具有广泛的适用性。

## 总结 ##

.NET 9中引入的 `JsonSchemaExporter` 无疑是.NET开发者与大语言模型协作时的一大福音。它将繁琐、易错的JSON Schema手动编写过程，转变为基于C#类型定义的自动化、强类型、可维护的流程。

这项功能特别好，它是将基于概率、本质不稳定的语言模型进行工程化，提升其输出结果稳定性和可靠性的关键手段。强烈建议您在自己的项目中，尤其是在与大模型交互时，全面拥抱JSON Schema来定义数据契约。借助.NET 9，我们现在可以无比轻松地生成和使用JSON Schema，从而显著提高代码的可读性、可维护性和整体开发效率。
