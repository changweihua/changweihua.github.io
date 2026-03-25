---
lastUpdated: true
commentabled: true
recommended: true
title: Spring EL表达式 抽象到极致的艺术品
description: Spring EL表达式 抽象到极致的艺术品
date: 2026-03-23 08:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

Spring表达式语言（SpEL）是Spring框架提供的一种功能强大且灵活的表达式语言，支持运行时查询和操作对象图，类似于JSP的EL和OGNL，但功能更为丰富。SpEL广泛应用于Spring生态系统（如IoC容器、Spring Security等），支持属性访问、方法调用、算术逻辑运算、集合操作等特性，并能通过配置文件或注解灵活配置，为Spring应用开发提供了高效的数据处理和动态配置能力。

## 一、Literal Expressions（文字表达式） ##

### 基本介绍 ###

文字表达式是SpEL中最简单的表达式，用于表示常量值，包括字符串、数字、布尔值和null。它们是SpEL的基础构建块，通常与其他复杂表达式结合使用。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello, SpEL!'");
String result = (String) exp.getValue();
System.out.println(result); // 输出: Hello, SpEL!

exp = parser.parseExpression("42");
Integer number = (Integer) exp.getValue();
System.out.println(number); // 输出: 42

exp = parser.parseExpression("true");
Boolean bool = (Boolean) exp.getValue();
System.out.println(bool); // 输出: true
```

### 注意事项 ###

- 字符串需加引号：字符串必须用单引号或双引号括起来，否则会被解析为变量或属性名。
- 类型推断：SpEL会根据字面值自动推断类型（如42为Integer，3.14为Double）。
- 转义字符：字符串中支持标准的Java转义字符，如 `\n`、`\t` 等。

### 鲜为人知的点 ###

- SpEL支持Unicode转义字符（如 `\u0041` 表示字符A），这在国际化场景中非常有用。
- 布尔值的字面量 `true` 和 `false` 是大小写敏感的，写成 `TRUE` 会导致解析错误。

## 二、Accessing Properties, Arrays, Lists, and Maps（访问属性、数组、列表和映射） ##

### 基本介绍 ###

SpEL支持通过点号（`.`）或方括号（`[]`）访问对象的属性、数组、列表和映射。这种灵活的访问方式是SpEL的核心功能之一。

### 代码示例 ###

```java
public class User {
    private String name = "Alice";
    private List<String> hobbies = Arrays.asList("reading", "gaming");
    private Map<String, Integer> scores = new HashMap<>();
    public String getName() { return name; }
    public List<String> getHobbies() { return hobbies; }
    public Map<String, Integer> getScores() { return scores; }
}

User user = new User();
user.getScores().put("math", 90);

EvaluationContext context = new StandardEvaluationContext(user);
ExpressionParser parser = new SpelExpressionParser();

// 访问属性
Expression exp = parser.parseExpression("name");
String name = (String) exp.getValue(context);
System.out.println(name); // 输出: Alice

// 访问列表
exp = parser.parseExpression("hobbies[0]");
String hobby = (String) exp.getValue(context);
System.out.println(hobby); // 输出: reading

// 访问映射
exp = parser.parseExpression("scores['math']");
Integer score = (Integer) exp.getValue(context);
System.out.println(score); // 输出: 90
```

### 注意事项 ###

- 属性访问优先级：SpEL会优先尝试调用getter方法，若无getter，则直接访问字段（需为public）。
- 空指针安全：访问不存在的属性或索引会导致异常，需配合安全导航运算符（?.）使用。
- 大小写敏感：属性名和键名严格区分大小写。

### 鲜为人知的点 ###

- SpEL支持嵌套属性访问（如 `user.address.city`），但嵌套层次过深可能影响性能。
- 对于数组或列表，SpEL支持负索引（如 `list[-1]`表示最后一个元素），但需确保SpEL实现支持此特性（Spring 5.3+）。

## 三、Inline Lists（内联列表） ##

### 基本介绍 ###

内联列表允许在表达式中直接定义一个列表，语法为{元素1, 元素2, ...}，常用于初始化或临时数据处理。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("{'apple', 'banana', 'orange'}");
List<String> fruits = (List<String>) exp.getValue();
System.out.println(fruits); // 输出: [apple, banana, orange]
```

### 注意事项 ###

- 类型推断：内联列表的元素类型由SpEL推断，需确保元素类型一致以避免运行时异常。
- 空列表：空列表用 `{}` 表示，但不能直接赋值给需要具体类型的变量。

### 鲜为人知的点 ###

- 内联列表是只读的（`java.util.Collections.unmodifiableList`），尝试修改会抛出UnsupportedOperationException。
- 内联列表在SpEL中非常轻量，适合小规模数据，但不建议用于复杂数据结构。

## 四、Inline Maps（内联映射） ##

### 基本介绍 ###

内联映射用于在表达式中定义键值对，语法为{key1:value1, key2:value2}，适用于临时构造映射数据。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("{name:'Alice', age:25}");
Map<String, Object> map = (Map<String, Object>) exp.getValue();
System.out.println(map); // 输出: {name=Alice, age=25}
```

### 注意事项 ###

- 键类型：键通常为字符串，但也可以是其他类型（如数字）。
- 值类型：值的类型由SpEL推断，需注意类型一致性。

### 鲜为人知的点 ###

- 内联映射同样是只读的，尝试修改会抛出异常。
- 在复杂场景下，内联映射的性能可能不如Java代码直接构造映射，需权衡使用。

## 五、Array Construction（数组构造） ##

### 基本介绍 ###

SpEL支持通过new关键字构造数组，语法为 `new 类型[长度]`，并可通过索引初始化元素。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("new int[]{1, 2, 3}");
int[] numbers = (int[]) exp.getValue();
System.out.println(Arrays.toString(numbers)); // 输出: [1, 2, 3]
```

### 注意事项 ###

- 类型限制：仅支持基本类型和String类型的数组构造。
- 长度固定：构造后的数组长度不可变。

### 鲜为人知的点 ###

- 数组构造在SpEL中较为少用，因为内联列表更灵活，且列表可以动态扩展。
- SpEL不支持多维数组的直接构造，需通过嵌套列表间接实现。

## 六、Relational Operators（关系运算符） ##

### 基本介绍 ###

SpEL支持标准的关系运算符，包括==、!=、<、>、<=、>=，以及关键字形式（如eq、ne、lt等），用于比较值。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("5 > 3");
Boolean result = (Boolean) exp.getValue();
System.out.println(result); // 输出: true

exp = parser.parseExpression("'abc' eq 'abc'");
result = (Boolean) exp.getValue();
System.out.println(result); // 输出: true
```

### 注意事项 ###

- 类型安全：比较的双方需为兼容类型，否则会抛出异常。
- 关键字形式：关键字（如 `eq`）在XML配置中更友好，因为符号可能需要转义。

### 鲜为人知的点 ###

- SpEL的关系运算符支持 `null` 比较，`null == null` 返回 `true`。
- 对于字符串比较，SpEL使用 `equals` 方法，而非 `==`，这与Java行为一致。

## 七、Regular Expressions（正则表达式） ##

### 基本介绍 ###

SpEL支持正则表达式匹配，通过 `matches` 关键字实现，用于验证字符串是否符合指定模式。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'test@example.com' matches '[a-z]+@[a-z]+\\.com'");
Boolean result = (Boolean) exp.getValue();
System.out.println(result); // 输出: true
```

### 注意事项 ###

- 性能开销：正则表达式匹配可能较慢，需避免在高频场景中滥用。
- 异常处理：无效的正则表达式会导致PatternSyntaxException。

### 鲜为人知的点 ###

- SpEL的正则表达式基于Java的 `java.util.regex`，支持所有Java正则特性。
- 正则表达式在SpEL中不支持动态构造，需硬编码或通过变量注入。

## 八、Logical Operators（逻辑运算符） ##

### 基本介绍 ###

SpEL支持逻辑运算符 `and`、`or`、`not`（或`&&`、`||`、`!`），用于组合布尔表达式。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("true and false");
Boolean result = (Boolean) exp.getValue();
System.out.println(result); // 输出: false

exp = parser.parseExpression("not true");
result = (Boolean) exp.getValue();
System.out.println(result); // 输出: false
```

### 注意事项 ###

- 短路求值：`and` 和 `or` 支持短路求值，优化性能。
- 优先级：逻辑运算符的优先级低于关系运算符，需注意括号的使用。

### 鲜为人知的点 ###

- SpEL的逻辑运算符在处理 `null` 值时较为宽松，`null and true` 不会抛异常，而是返回 `false`。
- 在复杂表达式中，建议显式使用括号以提高可读性和避免优先级错误。

## 九、String Operators（字符串运算符） ##

### 基本介绍 ###

SpEL支持字符串连接（通过 `+` 运算符），以及字符串相关的操作（如 `toUpperCase` 等方法调用）。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello' + ' ' + 'World'");
String result = (String) exp.getValue();
System.out.println(result); // 输出: Hello World
```

### 注意事项 ###

- 性能：字符串连接在循环中可能导致性能问题，建议使用 `StringBuilder` 替代。
- 类型转换：非字符串值会自动调用 `toString` 方法。

### 鲜为人知的点 ###

- SpEL支持字符串的隐式方法调用，如 `'hello'.toUpperCase()`，无需显式调用String类方法。
- 字符串连接的结果总是新的 `String` 对象，需注意内存分配。

## 十、Mathematical Operators（数学运算符） ##

### 基本介绍 ###

SpEL支持基本的数学运算符，包括 `+`、`-`、`*`、`/`、`%`、`^`（幂运算），适用于数字类型。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("2 + 3 * 4");
Integer result = (Integer) exp.getValue();
System.out.println(result); // 输出: 14

exp = parser.parseExpression("2 ^ 3");
result = (Integer) exp.getValue();
System.out.println(result); // 输出: 8
```

### 注意事项 ###

- 类型转换：运算结果的类型由操作数决定（如 `int` 与 `double` 运算返回 `double`）。
- 除零异常：除法和模运算需避免除以零。

### 鲜为人知的点 ###

- SpEL的幂运算（`^`）不支持负数底数，需通过其他方式处理。
- 数学运算符的优先级与Java一致，但建议使用括号以提高可读性。

## 十一、Assignment（赋值） ##

### 基本介绍 ###

SpEL支持通过 `=` 运算符为变量或属性赋值，通常在动态配置或上下文更新中使用。

### 代码示例 ###

```java
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("myVar", 0);

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("#myVar = 42");
Integer result = (Integer) exp.getValue(context);
System.out.println(result); // 输出: 42
System.out.println(context.lookupVariable("myVar")); // 输出: 42
```

### 注意事项 ###

- 作用域：赋值仅影响当前 `EvaluationContext`，不会修改原始对象。
- 类型安全：赋值时需确保类型兼容。

### 鲜为人知的点 ###

- 赋值表达式本身会返回赋值后的值，可用于链式操作。
- SpEL不支持直接修改 `final` 字段或不可变对象的属性。

## 十二、Type Expressions（类型表达式） ##

### 基本介绍 ###

SpEL通过 `T()` 运算符访问Java类型，用于调用静态方法或构造实例。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("T(java.lang.Math).PI");
Double pi = (Double) exp.getValue();
System.out.println(pi); // 输出: 3.141592653589793
```

### 注意事项 ###

- 类路径：需提供完整的类路径，SpEL不会自动导入。
- 性能：频繁使用 `T()`可能增加解析开销。

### 鲜为人知的点 ###

- `T()` 可以结合 `new` 关键字构造实例，如 `T(java.util.Date).newInstance()`。
- SpEL不支持泛型类型的直接解析，需通过具体类处理。

## 十三、Method Invocation（方法调用） ##

### 基本介绍 ###

SpEL支持调用对象的方法，方法名需与JavaBean规范一致。

### 代码示例 ###

```java
public class User {
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}

User user = new User();
EvaluationContext context = new StandardEvaluationContext(user);

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("greet('Alice')");
String result = (String) exp.getValue(context);
System.out.println(result); // 输出: Hello, Alice!
```

### 注意事项 ###

- 方法重载：SpEL会根据参数类型选择最匹配的方法。
- 异常传播：方法抛出的异常会直接传播到调用者。

### 鲜为人知的点 ###

- SpEL支持链式方法调用（如 `obj.method1().method2()`），但需确保中间结果非空。
- 方法调用支持变长参数，但需谨慎处理参数类型。

## 十四、Constructor Invocation（构造函数调用） ##

### 基本介绍 ###

SpEL通过 `new` 关键字调用构造函数，支持基本类型和自定义类的实例化。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("new java.util.Date()");
Date date = (Date) exp.getValue();
System.out.println(date); // 输出: 当前时间
```

### 注意事项 ###

- 参数匹配：需提供正确的参数类型和数量。
- 异常处理：构造函数抛出的异常需由调用者捕获。

### 鲜为人知的点 ###

- SpEL支持通过构造函数初始化复杂对象，但性能可能不如Java代码直接调用。
- 构造函数调用不支持泛型参数推断，需显式指定类型。

## 十五、Variables（变量） ##

### 基本介绍 ###

SpEL通过 `#variableName` 访问 `EvaluationContext` 中的变量，支持动态数据绑定。

### 代码示例 ###

```java
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("username", "Alice");

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("#username");
String result = (String) exp.getValue(context);
System.out.println(result); // 输出: Alice
```

### 注意事项 ###

- 变量未定义：访问未定义的变量会导致 `SpelEvaluationException`。
- 作用域：变量仅在当前上下文有效。

### 鲜为人知的点 ###

- SpEL支持变量的动态更新，适合在循环或条件语句中处理临时状态。
- 变量名支持下划线和数字，但建议遵循Java命名规范。

## 十六、User-defined Functions（用户定义函数） ##

### 基本介绍 ###

SpEL允许通过 `EvaluationContext` 注册自定义函数，扩展表达式功能。

### 代码示例 ###

```java
public class Utils {
    public static String reverse(String input) {
        return new StringBuilder(input).reverse().toString();
    }
}

EvaluationContext context = new StandardEvaluationContext();
context.registerFunction("reverse", Utils.class.getDeclaredMethod("reverse", String.class));

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("#reverse('hello')");
String result = (String) exp.getValue(context);
System.out.println(result); // 输出: olleh
```

### 注意事项 ###

- 方法签名：自定义函数需为静态方法，且需正确声明异常。
- 性能：函数调用会增加反射开销，需权衡使用。

### 鲜为人知的点 ###

- SpEL支持函数的链式调用，但需确保函数返回类型匹配。
- 自定义函数在Spring Integration中常用于复杂消息处理。

## 十七、Bean References（Bean引用） ##

### 基本介绍 ###

SpEL通过 `@beanName` 引用Spring容器中的Bean，常用于依赖注入或配置，Spring Security中常用。

### 代码示例 ###

```java
ApplicationContext context = new GenericApplicationContext();
ConfigurableListableBeanFactory beanFactory = ((GenericApplicationContext) context).getBeanFactory();
beanFactory.registerSingleton("myBean", new User());

SpelExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext evalContext = new StandardEvaluationContext();
evalContext.setBeanResolver(new BeanFactoryResolver(context));

Expression exp = parser.parseExpression("@myBean.name");
String result = (String) exp.getValue(evalContext);
System.out.println(result); // 输出: Alice
```

### 注意事项 ###

- Bean解析器：需配置BeanResolver，否则无法解析@符号。
- 性能：Bean引用可能涉及容器查找，需避免频繁调用。

### 鲜为人知的点 ###

- SpEL支持嵌套Bean引用（如 `@bean1.bean2` ），但需确保中间Bean非空。
- 在Spring Boot中，Bean引用常用于@Value注解的动态配置。

## 十八、Ternary, Elvis, and Safe-navigation Operators（三元运算符、Elvis运算符和安全导航运算符） ##

### 基本介绍 ###

- 三元运算符：`condition ? value1 : value2`，根据条件选择值。
- Elvis运算符：`expr ?: default`，当 `expr` 为 `null` 时返回默认值。
- 安全导航运算符：`?.`，避免空指针异常。

### 代码示例 ###

```java
ExpressionParser parser = new SpelExpressionParser();

// 三元运算符
Expression exp = parser.parseExpression("true ? 'yes' : 'no'");
String result = (String) exp.getValue();
System.out.println(result); // 输出: yes

// Elvis运算符
exp = parser.parseExpression("null ?: 'default'");
result = (String) exp.getValue();
System.out.println(result); // 输出: default

// 安全导航运算符
EvaluationContext context = new StandardEvaluationContext(new User());
exp = parser.parseExpression("address?.city");
result = (String) exp.getValue(context);
System.out.println(result); // 输出: null
```

### 注意事项 ###

- 优先级：三元运算符优先级较低，需注意括号使用。
- Elvis运算符局限：仅适用于null检查，不支持其他条件。

### 鲜为人知的点 ###

- 安全导航运算符在处理复杂嵌套对象时非常实用，但不支持写操作。
- Elvis运算符可以与方法调用结合，如 `obj?.method() ?: default`。

## 十九、Collection Projection（集合投影） ##

### 基本介绍 ###

集合投影通过 `![]` 语法对集合中的每个元素应用表达式，生成新的集合。类似 `stream.map.collect`

### 代码示例 ###

```java
List<String> names = Arrays.asList("alice", "bob");
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("names", names);

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("#names.![toUpperCase()]");
List<String> result = (List<String>) exp.getValue(context);
System.out.println(result); // 输出: [ALICE, BOB]
```

### 注意事项 ###

- 空集合：投影空集合返回空集合，不会抛异常。
- 性能：投影操作涉及迭代，需避免在大数据集上频繁使用。

### 鲜为人知的点 ###

- 投影支持嵌套操作，如 `list.![innerList.![#this]]`。
- 投影结果的类型由元素类型决定，需确保类型一致。

## 二十、Collection Selection（集合选择） ##

### 基本介绍 ###

- 集合选择通过 `.?[]` 语法过滤集合元素，仅保留满足条件的元素。类似 `stream.filter.collect`
- 除了返回所有选定元素外，您还可以仅检索第一个或最后一个元素。

  - 要获取与选择表达式匹配的第一个元素，语法为 `.^[selectionExpression]` 。类似 `stream.findFirst`
  - 要获取与选择表达式匹配的最后一个元素，语法为 `.$[selectionExpression]` 。

### 代码示例 ###

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4);
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("numbers", numbers);

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("#numbers.?[#this > 2]");
List<Integer> result = (List<Integer>) exp.getValue(context);
System.out.println(result); // 输出: [3, 4]
```

### 注意事项 ###

- 条件表达式：选择条件必须返回布尔值。
- 性能：选择操作涉及全量迭代，需注意集合大小。

### 鲜为人知的点 ###

- SpEL支持多条件选择，如 `list.?[#this > 0 and #this < 10]`。
- 选择操作可以与投影结合，形成强大的数据处理链。

## 二十一、Templated Expressions（模板表达式） ##

### 基本介绍 ###

模板表达式通过 `#{}` 嵌入SpEL代码，结合普通文本生成动态内容，常用于配置或消息格式化。

### 代码示例 ###

```java
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("name", "Alice");

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("Hello, #name!", new TemplateParserContext());
String result = (String) exp.getValue(context);
System.out.println(result); // 输出: Hello, Alice!
```

### 注意事项 ###

- 解析器配置：需使用 `TemplateParserContext` 解析模板表达式。
- 安全性：模板表达式可能引入注入风险，需验证输入。

### 鲜为人知的点 ###

- 模板表达式支持多段SpEL代码，如 `#{expr1}text#{expr2}`。
- 在Spring Boot的 `@Value` 注解中，模板表达式常用于复杂属性注入。

## 总结与实践建议 ##

SpEL作为Spring框架的强大工具，其功能远超简单的属性访问。从文字表达式到集合操作，再到模板表达式，SpEL提供了灵活的动态计算能力，适用于配置、验证、消息处理等多个场景。然而，SpEL的强大也伴随着复杂性，以下是一些实践建议：

- 性能优化：避免在高频场景中使用复杂表达式（如正则或投影），必要时缓存解析结果。
- 安全性：对用户输入的表达式进行严格验证，防止注入攻击。
- 可读性：在复杂表达式中善用括号和注释，提高代码可维护性。
- 调试技巧：使用SpelExpression.getAST()查看表达式抽象语法树，便于排查问题。

理解SpEL的每个特性，并结合实际场景灵活运用，可以显著提升Spring应用的动态性和可扩展性。
