---
lastUpdated: true
commentabled: true
recommended: true
title: C# 高性能获取对象属性
description: C# 高性能获取对象属性
date: 2025-06-03 10:35:00 
pageClass: blog-page-class
cover: /covers/csharp.svg
---

# C# 高性能获取对象属性 #

目的：尝试几种不同的获取对象属性的方法，并对比他们的性能

## 获取属性的几种方法 ##

### 准备 ###

定义一个Person类，实例化一个对象，测试获取对象的属性。

```c#
public class Person
{
    /// <summary>
    /// 姓名
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// 英文名
    /// </summary>
    public string EnglishName { get; set; }

    /// <summary>
    /// 年龄
    /// </summary>
    public int Age { get; set; }

}
```

### 直接调用 ###

为了把if判断，放到for 循环外面，代码写的有些啰嗦。因为在千万级别的循环里面，if判断也会相对比较耗时，影响对比结果。

```c#
/// <summary>
/// 属性访问性能测试。
/// </summary>
public static string YuanShengTest(Person person, string fieldName)
{
    string result = "";
    Stopwatch stopwatch = new Stopwatch();
    stopwatch.Start();
    if (fieldName == nameof(person.Name))
    {
        for (int i = 0; i < Times; i++)
        {
            string name = person.Name;
            if (i == 0)
            {
                result = name;
            }
        }
    }
    else if (fieldName == nameof(person.EnglishName))
    {
        for (int i = 0; i < Times; i++)
        {
            string name = person.EnglishName;
            if (i == 0)
            {
                result = name;
            }
        }
    }
    else
    {
        for (int i = 0; i < Times; i++)
        {
            int age = person.Age;
            if (i == 0)
            {
                result = age.ToString();
            }
        }
    }
    stopwatch.Stop();
    Console.WriteLine($"{result}==>普通属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
    return result;
}
```

### 反射 ###

动态获取属性，非常常用的方式，方便，代码简洁。但是每次获取属性，都调用PropertyInfo.GetValue() ,需要运行时进行完整的方法查找和参数验证，在这里的几个方法中，理论上是性能最差的。

```c#
/// <summary>
///  反射性能测试
/// </summary>
public static string ReflectionTest(Person person, string fieldName)
{
    string result = "";
    Stopwatch stopwatch = new Stopwatch();
    stopwatch.Start();
    var personType = typeof(Person); //person.GetType();
    var personName = personType.GetProperty(fieldName);
    for (int i = 0; i < Times; i++)
    {
        object? propertyValue = personName?.GetValue(person);
        if (i == 0)
        {
            result = propertyValue.ToString();
        }
    }
    stopwatch.Stop();
    Console.WriteLine($"{result}==>反射属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
    return result;
}
```

### 动态构建Lambda ###

动态构建Linq的Lambda表达式，然后编译以后得到一个委托。首次运行成本高，需要编译表达式。后续调用，编译后的委托避免了，反射的运行时开销，性能接近直接调用。
生成的猥琐类似下面：

```C#
Func<Person, object> getName = p => p.Name;
```
原理图：

![示例图](/images/3590070-20250602150307169-294173874.png)

具体实现：

```C#
 /// <summary>
 /// lambda表达式性能测试
 /// </summary>
 public static string LambdaTest(Person person, string fieldName)
 {
     string result = "";
     Stopwatch stopwatch = new Stopwatch();
     stopwatch.Start();
     Type type = typeof(Person);
     //构建表达式：Func<People, object> getName = p => p.Name;
     var parameter = Expression.Parameter(type, "p");//参数m
     PropertyInfo property = type.GetProperty(fieldName);  //要访问的属性名
     Expression expProperty = Expression.Property(parameter, property.Name);  //p.Name
     //变成表达式 m => m.Name
     var propertyDelegateExpression = Expression.Lambda<Func<Person, object>>(
         property.PropertyType.IsValueType ? Expression.Convert(expProperty, typeof(object)) : expProperty,  //访问的属性如果是值类型，需要显式转成object
         parameter);
     var propertyDelegate = (Func<Person, object>)propertyDelegateExpression.Compile();   //编译为委托

     for (int i = 0; i < Times; i++)
     {
         object? propertyValue = propertyDelegate.Invoke(person);
         if (i == 0)
         {
             result = propertyValue.ToString();
         }
     }
     stopwatch.Stop();
     Console.WriteLine($"{result}==>Lambda属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
     return result;
 }
```

### Emit ###

Emit 在运行时动态生成IL代码方法，首次运行以后，后续会很快。跟表达式树的方式，非常类似，都是生成委托方法，后续不需要运行时查找方法和参数检查。但是少了额外包装，更快。缺点也很明显，写起来比较复杂。
原理图：

![](/images/3590070-20250602150329266-520941957.png)

```C#
/// <summary>
/// Emit 动态构建方法测试
/// </summary>
/// <param name="person"></param>
/// <param name="fieldName"></param>
/// <returns></returns>
private static string EmitTest(Person person, string fieldName)
{
    string result = "";
    Type type = typeof(Person);
    var property = type.GetProperty(fieldName);
    DynamicMethod method = new DynamicMethod("GetPropertyValue", typeof(object), new Type[] { type }, true);
    ILGenerator il = method.GetILGenerator();
    il.Emit(OpCodes.Ldarg_0);   //将索引0处的参数加载到求值堆栈上
    il.Emit(OpCodes.Callvirt, property.GetGetMethod());

    if (property.PropertyType.IsValueType)
    {
        il.Emit(OpCodes.Box, property.PropertyType);//值类型需要装箱，因为返回类型是object
    }
    il.Emit(OpCodes.Ret);
    Func<Person, object> fun = method.CreateDelegate(typeof(Func<Person, object>)) as Func<Person, object>;

    Stopwatch stopwatch = Stopwatch.StartNew();
    for (int i = 0; i < Times; i++)
    {
        object propertyValue = fun.Invoke(person);
        if (i == 0)
        {
            result = propertyValue.ToString();
        }
    }
    stopwatch.Stop();
    Console.WriteLine($"{result}==>Emit属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
    return result;
}
```

## 耗时对比 ##

用以下完整代码，循环100000000 ，来一个耗时测试

```C#
internal class Program
{
    public const int Times = 100000000;
    static void Main(string[] args)
    {
        var person = new Person() { Name = "狗蛋", EnglishName = "GouDan", Age = 10 };
        string[] fieldNames = new string[] { nameof(Person.Name), nameof(Person.EnglishName), nameof(Person.Age) };
        foreach (var item in fieldNames)
        {
            TestGetFieldValue(person, item);
        }
        //BenchmarkRunner.Run<PropertyAccessBenchmark>();
        Console.ReadLine();
    }

    /// <summary>
    ///  测试获取属性值性能
    /// </summary>
    /// <param name="person"></param>
    /// <returns></returns>
    private static void TestGetFieldValue(Person person, string fieldName)
    {
        Console.WriteLine($"开始测试{fieldName}属性的获取*************");
        YuanShengTest(person, fieldName);
        ReflectionTest(person, fieldName);
        LambdaTest(person, fieldName);
        EmitTest(person, fieldName);
        Console.WriteLine($"********************End*******************");
    }

    /// <summary>
    /// 属性访问性能测试。
    /// </summary>
    public static string YuanShengTest(Person person, string fieldName)
    {
        string result = "";
        Stopwatch stopwatch = Stopwatch.StartNew();
        if (fieldName == nameof(person.Name))
        {
            for (int i = 0; i < Times; i++)
            {
                string name = person.Name;
                if (i == 0)
                {
                    result = name;
                }
            }
        }
        else if (fieldName == nameof(person.EnglishName))
        {
            for (int i = 0; i < Times; i++)
            {
                string name = person.EnglishName;
                if (i == 0)
                {
                    result = name;
                }
            }
        }
        else
        {
            for (int i = 0; i < Times; i++)
            {
                int age = person.Age;
                if (i == 0)
                {
                    result = age.ToString();
                }
            }
        }
        stopwatch.Stop();
        Console.WriteLine($"{result}==>普通属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
        return result;
    }


    /// <summary>
    ///  反射性能测试
    /// </summary>
    public static string ReflectionTest(Person person, string fieldName)
    {
        string result = "";
        var personType = typeof(Person); //person.GetType();
        var personName = personType.GetProperty(fieldName);
        Stopwatch stopwatch = Stopwatch.StartNew();
        for (int i = 0; i < Times; i++)
        {
            object? propertyValue = personName?.GetValue(person);
            if (i == 0)
            {
                result = propertyValue.ToString();
            }
        }
        stopwatch.Stop();
        Console.WriteLine($"{result}==>反射属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
        return result;
    }

    /// <summary>
    /// lambda表达式性能测试
    /// </summary>
    public static string LambdaTest(Person person, string fieldName)
    {
        string result = "";
        Type type = typeof(Person);
        //构建表达式：Func<People, object> getName = p => p.Name;
        var parameter = Expression.Parameter(type, "p");//参数m
        PropertyInfo property = type.GetProperty(fieldName);  //要访问的属性名
        Expression expProperty = Expression.Property(parameter, property.Name);  //p.Name
        //变成表达式 m => m.Name
        var propertyDelegateExpression = Expression.Lambda<Func<Person, object>>(
            property.PropertyType.IsValueType ? Expression.Convert(expProperty, typeof(object)) : expProperty,  //访问的属性如果是值类型，需要显式转成object
            parameter);
        var propertyDelegate = (Func<Person, object>)propertyDelegateExpression.Compile();   //编译为委托

        Stopwatch stopwatch = Stopwatch.StartNew();
        for (int i = 0; i < Times; i++)
        {
            object? propertyValue = propertyDelegate.Invoke(person);
            if (i == 0)
            {
                result = propertyValue.ToString();
            }
        }
        stopwatch.Stop();
        Console.WriteLine($"{result}==>Lambda属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
        return result;
    }


    /// <summary>
    /// Emit 动态构建方法测试
    /// </summary>
    /// <param name="person"></param>
    /// <param name="fieldName"></param>
    /// <returns></returns>
    private static string EmitTest(Person person, string fieldName)
    {
        string result = "";
        Type type = typeof(Person);
        var property = type.GetProperty(fieldName);
        DynamicMethod method = new DynamicMethod("GetPropertyValue", typeof(object), new Type[] { type }, true);
        ILGenerator il = method.GetILGenerator();
        il.Emit(OpCodes.Ldarg_0);   //将索引0处的参数加载到求值堆栈上
        il.Emit(OpCodes.Callvirt, property.GetGetMethod());

        if (property.PropertyType.IsValueType)
        {
            il.Emit(OpCodes.Box, property.PropertyType);//值类型需要装箱，因为返回类型是object
        }
        il.Emit(OpCodes.Ret);
        Func<Person, object> fun = method.CreateDelegate(typeof(Func<Person, object>)) as Func<Person, object>;

        Stopwatch stopwatch = Stopwatch.StartNew();
        for (int i = 0; i < Times; i++)
        {
            object propertyValue = fun.Invoke(person);
            if (i == 0)
            {
                result = propertyValue.ToString();
            }
        }
        stopwatch.Stop();
        Console.WriteLine($"{result}==>Emit属性访问耗时：{stopwatch.ElapsedMilliseconds}ms");
        return result;
    }
}
```

测试结果：

![](/images/3590070-20250602150357329-2007154472.png)

**获取第一个属性`Name`的时候，最快的居然不是直接获取**，没想明白。需要预热？知道的大哥告诉一下。既然如此，再来一个基准测试看看结果。

## 基准测试 ##

### 安装Nuget包 ###

```bash
NuGet\InstallPackage BenchmarkDotNet Version 0.15.0
```

### 编写`PropertyAccessBenchmark`类 ###

```C#
using BenchmarkDotNet.Attributes;
using fanshe.Model;
using System.Linq.Expressions;
using System.Reflection;
using System.Reflection.Emit;

public class PropertyAccessBenchmark
{
    private Person person;
    private PropertyInfo property;
    private Func<Person, object> lambdaDelegate;
    private Func<Person, object> emitDelegate;

    [Params("Name", "EnglishName", "Age")]
    public string FieldName { get; set; }

    [GlobalSetup]
    public void Setup()
    {
        person = new Person { Name = "狗蛋", EnglishName = "GouDdan", Age = 10 };
        //反射
        var type = typeof(Person);
        property = type.GetProperty(FieldName);  //要访问的属性名

        //构建表达式：Func<People, object> getName = p => p.Name;
        //参数p
        var parameter = Expression.Parameter(type, "p");
        //要访问的属性p.Name
        Expression expProperty = Expression.Property(parameter, property.Name);
        //变成表达式 m => m.Name
        var propertyDelegateExpression = Expression.Lambda<Func<Person, object>>(
            property.PropertyType.IsValueType ? Expression.Convert(expProperty, typeof(object)) : expProperty,  //访问的属性如果是值类型，需要显式转成object
            parameter);
        lambdaDelegate = (Func<Person, object>)propertyDelegateExpression.Compile();   //编译为委托       

        // Emit
        DynamicMethod method = new DynamicMethod("GetPropertyValue", typeof(object), new Type[] { type }, true);
        ILGenerator il = method.GetILGenerator();
        il.Emit(OpCodes.Ldarg_0);
        il.Emit(OpCodes.Callvirt, property.GetGetMethod());
        if (property.PropertyType.IsValueType)
        {
            il.Emit(OpCodes.Box, property.PropertyType);
        }
        il.Emit(OpCodes.Ret);
        emitDelegate = (Func<Person, object>)method.CreateDelegate(typeof(Func<Person, object>));
    }

    [Benchmark]
    public object YuanSheng()
    {
        return person.EnglishName;
        //return FieldName switch
        //{
        //    "Name" => person.Name,
        //    "EnglishName" => person.EnglishName,
        //    "Age" => person.Age,
        //    _ => null
        //};
    }

    [Benchmark]
    public object Reflection()
    {
        return property.GetValue(person);
    }

    [Benchmark]
    public object Lambda()
    {
        return lambdaDelegate(person);
    }

    [Benchmark]
    public object Emit()
    {
        return emitDelegate(person);
    }
}

```

### 调用`PropertyAccessBenchmark` ###

```C#
BenchmarkRunner.Run<PropertyAccessBenchmark>();
```

### Release生成，运行测试 ###

![](/images/3590070-20250602150419107-1115134864.png)

结果：**直接访问(YuanSheng) > 表达式树(Lambda) ≈ Emit > 反射(Reflection)**

Emit 略微慢于表达式树(Lambda)，这是没想到的。应该是Emit代码，什么地方没有优化好。Emit 不怎么会，欢迎大佬指导！
