---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET System.Text.Json 详解
description: C#.NET System.Text.Json 详解
date: 2025-06-30 16:30:00 
pageClass: blog-page-class
---

# C#.NET System.Text.Json 详解 #

## 简介 ##

`System.Text.Json` 是 `.NET Core 3.0+` 和 `.NET 5+` 平台自带的高性能 `JSON` 序列化/反序列化库，位于 `System.Text.Json` 命名空间，无需额外安装包（针对早期版本可安装 `System.Text.Json`）。

设计目标：极致性能、低分配、零依赖，并且与现代 `.NET` 平台深度集成，支持 `UTF-8` 原生处理、管道化处理、源生成等高级功能。

相比 `Newtonsoft.Json`，更轻量、速度更快，但在灵活性和功能丰富度（如动态 `LINQ to JSON`）上略逊一筹

- 基于 `Span<byte>` 和 `Utf8`：直接处理 `UTF-8` 数据，避免编码转换开销。
- 少内存分配：通过值类型结构体（如 `Utf8JsonReader` / `Utf8JsonWriter` ） 减少 GC 压力。
- 源码生成器（`Source Generators`）：`.NET 6+` 支持编译时生成序列化代码，彻底避免反射。

## 基础用法（序列化/反序列化） ##

```c#
// 定义模型
public record Person(string Name, int Age);

// 序列化 → JSON 字符串
var person = new Person("Alice", 30);
string json = JsonSerializer.Serialize(person); 
// 输出: {"Name":"Alice","Age":30}

// 反序列化 → 对象
Person deserialized = JsonSerializer.Deserialize<Person>(json)!;
Console.WriteLine(deserialized.Name); // Alice
```

### 常用配置选项（通过 `JsonSerializerOptions` ） ###

```csharp
var options = new JsonSerializerOptions
{
    WriteIndented = true,              // 格式化输出
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase, // 属性名转驼峰
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // 忽略 null 值
    NumberHandling = JsonNumberHandling.AllowReadingFromString, // 允许数字从字符串解析
    DateTimeFormat = new DateTimeFormatter("yyyy-MM-dd") // 日期格式化  
    UnknownTypeHandling = JsonUnknownTypeHandling.JsonNode, // 忽略额外属性
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping // 处理特殊字符
    ReadCommentHandling = JsonCommentHandling.Skip, // 允许注释
    Converters = { new JsonStringEnumConverter(), new DateOnlyConverter() }, //  添加转换器
    ReferenceHandler = ReferenceHandler.IgnoreCycles, // // 处理循环引用
    PropertyNameCaseInsensitive = true, // 反序列化时忽略大小写
    TypeInfoResolver = AppJsonContext.Default, // 源生成器集成
    MaxDepth = 64 // 最大嵌套深度
};

string json = JsonSerializer.Serialize(person, options);
```

## 关键特性 ##

### 属性自定义控制 ###

**命名策略**：内置 `CamelCase` ，或自定义 `JsonNamingPolicy`

```csharp
options.PropertyNamingPolicy = new SnakeCaseNamingPolicy(); // 实现自定义蛇形命名
```

**忽略属性**：

```csharp
[JsonIgnore] // 始终忽略
public string Secret { get; set; }

[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] // 默认值时忽略
public int Score { get; set; }
```

**重命名属性**：

```csharp
[JsonPropertyName("full_name")]
public string Name { get; set; }
```

**私有字段序列化**

```csharp
// 包含私有字段
[JsonInclude]
private string InternalCode = "A100";
```

### 处理特殊类型 ###

**枚举**：序列化为字符串

```csharp
options.Converters.Add(new JsonStringEnumConverter());
```

**日期格式**：统一 ISO 8601 格式

```csharp
options.Converters.Add(new JsonDateOnlyConverter()); // .NET 6+ 日期类型
```

### 循环引用处理 ###

```csharp
options.ReferenceHandler = ReferenceHandler.IgnoreCycles; // 忽略循环引用
// 或
options.ReferenceHandler = ReferenceHandler.Preserve; // 保留引用 ($id/$ref)
```

## 高级功能 ##

### 自定义转换器 (`JsonConverter<T>`) ###

```csharp
public class DecimalConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, ...)
        => decimal.Parse(reader.GetString()!.Replace("USD", ""));

    public override void Write(Utf8JsonWriter writer, decimal value, ...)
        => writer.WriteStringValue($"{value} USD");
}

// 注册转换器
options.Converters.Add(new DecimalConverter());
```

### 源码生成器（.NET 6+） ###

**彻底消除反射开销，提升启动性能**

```csharp
[JsonSerializable(typeof(Person))]
internal partial class AppJsonContext : JsonSerializerContext { }

// 使用生成的序列化方法
var json = JsonSerializer.Serialize(person, AppJsonContext.Default.Person);
```

### DOM 模型（JsonNode） ###

**动态操作 `JSON`（类似 `Newtonsoft` 的 `JObject`）**

```csharp
JsonNode node = JsonNode.Parse("{\"Name\":\"Alice\"}");
node["Age"] = 30; // 动态添加属性

string json = node.ToJsonString(); // 输出: {"Name":"Alice","Age":30}
```

### 流式 API（高性能大文件处理） ###

**读取 (Utf8JsonReader)**

```csharp
var reader = new Utf8JsonReader(jsonData);
while (reader.Read()) 
{
    if (reader.TokenType == JsonTokenType.PropertyName 
        && reader.GetString() == "Name")
    {
        reader.Read();
        Console.WriteLine(reader.GetString()); // Alice
    }
}
```

**写入 (Utf8JsonWriter)**

```csharp
using var stream = new MemoryStream();
var writer = new Utf8JsonWriter(stream);
writer.WriteStartObject();
writer.WriteString("Name", "Alice");
writer.WriteEndObject();
writer.Flush();
```

### 多态序列化 ###

```csharp
[JsonDerivedType(typeof(Student), "student")]
[JsonDerivedType(typeof(Teacher), "teacher")]
public class Person { public string Name { get; set; } }

var people = new Person[] { new Student(), new Teacher() };
string json = JsonSerializer.Serialize(people, options);
// 输出: [{"$type":"student",...}, {"$type":"teacher",...}]
```

```csharp
public abstract class Animal {
    public string Name { get; set; }
}

public class Dog : Animal {
    public string Breed { get; set; }
}

// 使用 Polymorphism 特性（.NET 6+）
var options = new JsonSerializerOptions {
    TypeInfoResolver = new DefaultJsonTypeInfoResolver {
        Modifiers = {
            typeInfo => {
                if (typeInfo.Type == typeof(Animal)) {
                    typeInfo.PolymorphismOptions = new JsonPolymorphismOptions {
                        TypeDiscriminatorPropertyName = "$type",
                        DerivedTypes = {
                            new JsonDerivedType(typeof(Dog), "Dog")
                        }
                    };
                }
            }
        }
    }
};

string json = JsonSerializer.Serialize(dog, options);
```

### 使用 UTF-8 字节数组：避免字符串转换开销 ###

```csharp
byte[] utf8Json = JsonSerializer.SerializeToUtf8Bytes(person);
```

### 复用 JsonSerializerOptions：减少配置对象创建 ###

```csharp
private static readonly JsonSerializerOptions Options = new() {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

string json = JsonSerializer.Serialize(person, Options);
```

### 源生成器（Source Generators - .NET 6+） ###

```csharp
// 1. 创建上下文类（自动生成序列化代码）
[JsonSerializable(typeof(Product))]
internal partial class AppJsonContext : JsonSerializerContext {}

// 2. 使用源生成序列化（无反射开销）
var json = JsonSerializer.Serialize(product, AppJsonContext.Default.Product);
Product obj = JsonSerializer.Deserialize(json, AppJsonContext.Default.Product)!;
```

### EF Core 集成 ###

**值转换器存储 JSON 列**

```csharp
modelBuilder.Entity<User>()
    .Property(u => u.Metadata)
    .HasConversion(
        v => JsonSerializer.Serialize(v),
        v => JsonSerializer.Deserialize<Metadata>(v)
    );
```

**错误处理**

```csharp
try
{
    User user = JsonSerializer.Deserialize<User>(invalidJson);
}
catch (JsonException ex)
{
    Console.WriteLine($"JSON Error: {ex.Message}");
}   
```

### 与 Newtonsoft.Json 共存 ###

```csharp
builder.Services.AddControllers()
    .AddNewtonsoftJson() // 部分控制器使用 Newtonsoft.Json
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);
```

## 核心类型与 API ##

### JsonSerializer ###

- **静态入口**：`JsonSerializer.Serialize` / `Deserialize` 支持泛型和非泛型重载，能够直接在对象与 `UTF-8 byte[]`、`Stream`、`string`、`Utf8JsonReader` 间转换
- **无状态**：所有调用都是线程安全的，根据传入的 `JsonSerializerOptions` 决定行为

```csharp
// 序列化到字符串
string json = JsonSerializer.Serialize(obj);
// 反序列化
T obj2 = JsonSerializer.Deserialize<T>(json);
```

### JsonDocument / JsonElement ###

- **只读 DOM**：JsonDocument 提供 JSON 文档的只读 DOM，解析后可多次遍历但不支持修改。
- **低分配**：内部使用 UTF-8 解析，JsonElement 代表树中的节点，避免生成中间对象。

```csharp
using var doc = JsonDocument.Parse(json);
JsonElement root = doc.RootElement;
if (root.TryGetProperty("name", out var nameProp))
    Console.WriteLine(nameProp.GetString());
```

### Utf8JsonWriter ###

- **高性能写入**：基于 `UTF-8 Span<byte>`，支持流式、增量写入，无需先构建中间对象。
- **用法**：创建时提供 `IBufferWriter<byte>` 或 `Stream`，然后逐步写入对象、数组、属性、原始值。

```csharp
using var stream = new MemoryStream();
using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions{ Indented = true });
writer.WriteStartObject();
writer.WriteString("name", "Alice");
writer.WriteNumber("age", 30);
writer.WriteEndObject();
writer.Flush();
string json = Encoding.UTF8.GetString(stream.ToArray());
```

**常用设置**

| 属性        |      说明      |  备注 |
| :-------------: | :-----------: | :----: |
| WriteIndented      | 是否缩进输出 |  |
| DefaultIgnoreCondition      |   空值/默认值忽略策略 (Never/WhenWritingNull)   |  |
| PropertyNamingPolicy      |   属性名重命名策略 (CamelCase 或 自定义)   |  |
| DictionaryKeyPolicy      |   字典键名策略   |  |
| PropertyNameCaseInsensitive      |   反序列化时属性名大小写是否忽略   |  |
| AllowTrailingCommas      |   允许尾逗号   |  |
| IgnoreReadOnlyProperties      |   忽略只读属性   |  |
| NumberHandling      |   数字处理策略 (AllowReadingFromString, WriteAsString)   |  |

### 属性特性 ###

| 特性        |      用途      |  备注 |
| :-------------: | :-----------: | :----: |
| `[JsonPropertyName("json_name")]`      |   指定序列化/反序列化时的 JSON 字段名   |  |
| `[JsonIgnore]`      |   忽略该属性   |  |
| `[JsonInclude]`      |   包括非 public 字段或属性   |  |
| `[JsonConverter(typeof(MyConverter))]`      |   为该成员或类型指定自定义转换器   |  |
| `[JsonNumberHandling]`      |   针对数字字段定义特殊处理（例如从字符串读取）   |  |
| `[JsonExtensionData]`      |   捕获额外字段到 `IDictionary<string, JsonElement>`   |  |


```csharp
public class Person
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("full_name")]
    public string Name { get; set; }

    [JsonIgnore]
    public string InternalSecret { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]  // 自定义转换器
    public ProductType Type { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtraProperties { get; set; }
}
```

## 定制转换器（JsonConverter） ##

**继承 `JsonConverter<T>`，重写 Read 与 Write 方法**

```csharp
public class UnixTimestampConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => DateTimeOffset.FromUnixTimeSeconds(reader.GetInt64()).UtcDateTime;

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        => writer.WriteNumberValue(new DateTimeOffset(value).ToUnixTimeSeconds());
}

// 注册
options.Converters.Add(new UnixTimestampConverter());
```

## 与 ASP.NET Core 集成 ##

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.IgnoreNullValues = true;
    });

var app = builder.Build();
app.MapControllers();
app.Run();
```

<llm-only>

## Section for LLMs

This content appears only in the generated LLMs files without the `<llm-only>` tag
</llm-only>

<llm-exclude>
## Section for humans

This content will not be in the generated files for LLMs
</llm-exclude>

VitePress is built with Vue.

To prevent linking: //VitePress//


<!-- ::: example
example=@/demos/ClipPathDemo.vue
::: -->

