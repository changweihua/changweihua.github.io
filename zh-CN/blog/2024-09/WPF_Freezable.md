---
lastUpdated: true
commentabled: true
recommended: true
title:  C# + WPF 性能优化：Freezable 对象
description: C# + WPF 性能优化：Freezable 对象
date: 2024-09-27 14:18:00
pageClass: blog-page-class
---

# C# + WPF 性能优化：Freezable 对象 #

## Header {.ignore-header}

## 前言 ##

Freezable是WPF中一个特殊的基类，用于创建可以冻结（Freeze）的可变对象。冻结一个对象意味着将其状态设置为只读，从而提高性能并允许在多线程环境中共享对象。

## Freezable的应用 ##

我们定义画刷资源的时候常常会这样写：

```xml
<SolidColorBrush x:Key="RedBrush" Color="Red" o:Freeze="True"/>
```

代码中的`o:Freeze="True"`其实就是使用`Freezable`的`Freeze`方法冻结画刷，使之不可修改，系统不必监视该画刷对象，从而减少资源消耗。

`o:Freeze="True"`乍一看像附加属性，其实并不是的。Freeze属性是`http://schemas.microsoft.com/winfx/2006/xaml/presentation/options`XML命名空间中定义的唯一属性或其他编程元素。Freeze属性专门存在于此特殊命名空间中，以便在根元素声明中可以使用。处理 Freeze属性的功能专门内置于处理已编译应用程序的 XAML的XAML处理器中。

那是不是WPF中的所有资源都可以（需要）使用Freeze方法冻结来提高性能呢？
Freezable类通常用于WPF中的资源和动画，例如创建可重用的画刷、几何图形和动画。从Freezable继承的类型包括Brush、Transform和Geometry类。由于它们包含非托管资源，因此系统必须监视这些对象发生的修改，然后在原始对象发生更改时更新对应的非托管资源。即使实际上并未修改图形系统对象，系统仍必须消耗一些资源来监视该对象，以防更改它。

例如，假设创建一个SolidColorBrush画笔并用它来绘制按钮的背景。

```xml
<Window.Resources>
    <SolidColorBrush x:Key="RedBrush" Color="Red"/>
</Window.Resources>
<Button Background="{StaticResource RedBrush}"/>
```

呈现按钮时，WPF图形子系统使用你提供的信息来绘制一组像素，以创建按钮的外观。尽管使用纯色画笔来描述按钮的绘制方式，但纯色画笔实际上并没有进行绘制。图形系统为按钮和画笔生成快速、低级别的对象，实际显示在屏幕上的就是这些对象。
如果要修改画笔，则必须重新生成这些低级别对象。Freezable类使画笔能够找到生成的相应低级别对象并在更改时更新它们。

## 注意事项 ##

并非每个Freezable对象都可以冻结。为避免引发InvalidOperationException，请在尝试冻结Freezable对象之前检查该对象的CanFreeze属性值，以确定是否可以将其冻结。如果满足以下任一条件，则无法冻结Freezable：

- 它具有动画属性或数据绑定属性。
- 它具有由动态资源设置的属性。
- 它包含无法冻结的Freezable子对象。

Freezable对象调用Freeze方法冻结后，就无法解冻。修改冻结对象属性时会引发InvalidOperationException。但是，可以使用Clone或CloneCurrentValue方法创建(深拷贝)解冻的副本。如果Freezable包含其他已冻结的 Freezable对象，它们也会被克隆并变为可修改。

无论使用哪种克隆方法，动画都不会复制到新的 Freezable。
由于无法对冻结的Freezable进行动画处理，因此使用Storyboard对其进行动画处理时，动画系统会自动创建冻结的Freezable对象的可修改克隆。为了消除克隆导致的性能开销，如果需要对对象进行动画处理，请让其保持解冻状态。

## Clone和CloneCurrentValue的区别 ##

Clone或CloneCurrentValue方法都可以创建(深拷贝)解冻的副本。**需要注意的是，这两个方法不拷贝未设置的属性，如果一个未设置的属性的默认值是冻结的Freezable对象，在其他解冻的拷贝中，这个属性依旧是冻结的。**

下表中总结了两个方法的不同之处:

| 操作        |      Clone      |  CloneCurrentValue |
| ------------- | :-----------: | ----: |
| 复制具有表达式的依赖项属性      | 复制了表达式，但可能不再解析。 | 复制表达式的当前值，但不复制表达式本身。 |
| 复制一个动画依赖属性      |   复制属性的基本(非动画)值。动画不会被复制。    |   复制属性的当前动画值。动画不会被复制。 |


## 附加属性实现XAML中Freeze ##

上文中提到`o:Freeze="True"`并不是通过附加属性实现，而是内置于XAML处理器中实现。我们自己也可以通过附加属性的方式实现，代码如下：

```csharp
public class PresentationOptionsAttach
{
    public static bool GetFreeze(Freezable freezable)
    {
        return (bool)freezable.GetValue(FreezeProperty);
    }

    public static void SetFreeze(Freezable freezable, bool value)
    {
        freezable.SetValue(FreezeProperty, value);
    }

    public static readonly DependencyProperty FreezeProperty =
        DependencyProperty.RegisterAttached("Freeze", typeof(bool), typeof(PresentationOptionsAttach), new PropertyMetadata(false, OnFreezeChanged));

    private static void OnFreezeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (DesignerProperties.GetIsInDesignMode(d)) return;

        if ((bool)e.NewValue)
        {
            Freezable freezable = d as Freezable;
            if (freezable.CanFreeze)
                freezable.Freeze();
        }
    }
}
```

## 总结 ##

Freezable是一个我们既熟悉又陌生的类，熟悉是因为我们经常使用，陌生是因为很少关注其优化性能的机制以及需要注意的地方。本文简单介绍了Freezable优化性能的机制以及注意事项，并提供了通过附加属性的方式在XAML中冻结资源（纯属探索，实际意义不大）。
