---
lastUpdated: true
commentabled: true
recommended: true
title:  C#中使用AutoResetEvent或者ManualResetEvent做线程管理
description: C#中使用AutoResetEvent或者ManualResetEvent做线程管理
date: 2024-06-13 14:18:00
pageClass: blog-page-class
---

# C#中使用AutoResetEvent或者ManualResetEvent做线程管理 #

## 什么是AutoResetEvent和ManualResetEvent事件 ##

- 他们都是C#中System.Threading下面的类。用于在多个线程之间进行事件通知和管理。
- 他们的管理方法主要是三个：
  - Reset()：关闭
  - WaitOne()：阻挡
  - Set()：启动
- AutoResetEvent和ManualResetEvent的区别
  - 自动方法遵循set -> WaitOne -> Reset的流程自动执行，但是自动方法的一个set只能控制一个线程
  - 手动方法也是遵循set -> WaitOne -> Reset的流程，但是手动方法可以灵活的进行手动控制，一个手动的set可以控制多个同步线程。

**不管是auto还是manual，都要经历的步骤如下（其他地方看到一个很形象的举例）**

```text
车辆过高速收费站时：
自动：车闸默认关闭（new AutoResetEvent(false)） -> 车辆到达收费站被阻(waitone()) -> 交费,然后开闸（set()） -> 关闭车闸（reset()）

手动：车闸打开后（set()），并不会自动关闭，所以如果不去手动关闭（reset()），后面的车会一辆一辆的通过。

自动可以自动关闭车闸（reset（））,让一次只能过一个车，特点就是自动情况下，同步存在两个同步线程，最终只能执行第一个线程。
手动需要手动关闭车闸（reset（））,特点就是手动情况下，如果不手动reset（），所有线程都会被依次执行完毕。
WaitOne()是否生效取决于有没有Reset（）。如果一开始就是Reset()的，那么WaitOne不会阻挡任何线程执行。
```

**AutoResetEvent和ManualResetEvent的初始化状态**

- new Auto/ManualResetEvent(false):默认阻挡线程。
- new Auto/ManualResetEvent(true):默认通过线程。
- new Auto/ManualResetEvent(true)中，WaitOne没有任何意义，它阻挡不了线程

### autoresetevent中的验证代码 ###

```csharp
internal class Program
{
    static EventWaitHandle my_task1 = new AutoResetEvent(true);//默认自动执行
    static AutoResetEvent my_task2 = new AutoResetEvent(false);//默认自动阻挡
    //static ManualResetEvent my_task3 = new ManualResetEvent(false);//默认手动阻挡
    private static void Main(string[] args)
    {
        //thread
        new Thread(func1).Start();
 
        new Thread(func3).Start();

        my_task2.Set();//开启，因为func3的调用在func2的上面，所以set先管理到func3。func3能执行，func2不能执行，这表明autoresetevent是典型的队列操作形式

        new Thread(func2).Start();

        Console.ReadKey();
    }
    static void func1()
    {
        my_task1.WaitOne();
        Console.WriteLine("此时的waitOne不能阻挡线程执行");
    }
    static void func2()
    {
        my_task2.WaitOne();
        Console.WriteLine("此时的waitOne会阻挡线程执行");
    }
    static void func3()
    {
        my_task2.WaitOne();
        Console.WriteLine("此时的waitOne会阻挡线程执行，开启set后通过");
    }
}
```

### manualresetevent中的验证代码 ###

```csharp
internal class Program
{
    //static EventWaitHandle my_task1 = new AutoResetEvent(true);//默认自动执行
    //static AutoResetEvent my_task2 = new AutoResetEvent(false);//默认自动阻挡
    static ManualResetEvent my_task3 = new ManualResetEvent(false);//默认手动阻挡
    private static void Main(string[] args)
    {
        //thread
        new Thread(func1).Start();
 
        new Thread(func2).Start();

        new Thread(func3).Start();

        new Thread(func4).Start();

        my_task3.Set();//手动set一次，执行多个线程

        Timer my_time = new Timer(CloseDown,null,0,2000);//2秒计时器

        Console.ReadKey();
    }
    static void func1()
    {
        my_task3.WaitOne();
        Console.WriteLine("手动第一次执行");
    }
    static void func2()
    {
        my_task3.WaitOne();
        Console.WriteLine("手动第二次执行");
    }
    static void func3()
    {
        my_task3.WaitOne();
        Console.WriteLine("手动第三次执行");
    }
    static void func4()
    {
        Thread.Sleep(3000);//等待3秒，大于reset时间，故不会执行
        my_task3.WaitOne();
        Console.WriteLine("不会执行第四次");
    }

    /// <summary>
    /// 2秒后关闭线程
    /// </summary>
    /// <param name="o"></param>
    static void CloseDown(object o)
    { 
    my_task3.Reset();
    }

}
```

### 总结 ###

- auto一次只能执行一个线程
- manual开启后可以同步执行超多线程
- AutoResetEvent.Set() = ManualResetEvent.Set() + ManualResetEvent.Reset();
- 多个线程的暂停，继续，可以选择Manual。
