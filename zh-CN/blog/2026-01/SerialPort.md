---
lastUpdated: true
commentabled: true
recommended: true
title: C# 串口通信实战
description: 掌握 SerialPort类应用技巧，轻松搞定通信难题
date: 2026-01-19 09:00:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 前言

在工业自动化、物联网和嵌入式系统中，串口通信仍然扮演着不可替代的角色。尽管网络通信技术发展迅速，但在一些对稳定性、实时性要求较高的场景中，串口通信依然具有广泛的应用基础。

C# 语言通过 `System.IO.Ports` 命名空间中的 `SerialPort` 类，为开发者提供了便捷的串口编程接口。本文将从基础使用出发，深入讲解 `SerialPort` 类的属性、事件处理、异常捕获及 WinForm 中的实际应用，帮助开发开发稳定、安全的串口通信程序。

## 一、SerialPort 类

### SerialPort 类的基本属性与构造函数

C# 提供了 SerialPort 类用于串口通信，它支持多种构造函数。一个完整的构造函数如下：

```csharp
public SerialPort(
    string portName,
    int baudRate,
    Parity parity,
    int dataBits,
    StopBits stopBits
)
```

例如，设置串口为 COM1、波特率 9600、无奇偶校验、数据位 8 和停止位 1 的代码如下：

```cs
SerialPort serialPort = new SerialPort("COM1", 9600, Parity.None, 8, StopBits.One);
```

### 属性说明

| 属性名称     |                描述                 |           常用取值           |
| :----------- | :---------------------------------: | :--------------------------: |
| PortName     |      串口号，如 "COM1"、"COM2"      |       具体的系统端口号       |
| BaudRate     |            数据传输速率             |       9600、115200 等        |
| Parity       |              奇偶校验               |       None、Even、Odd        |
| DataBits     |          每个数据帧的位数           |              8               |
| StopBits     |           数据帧结束标志            |           One、Two           |
| Handshake    |       数据传输时的流控制措施        |       具体的系统端口号       |
| ReadTimeout  |         读取数据的超时时间          | None、XOnXOff、RequestToSend |
| WriteTimeout |         写入数据的超时时间          |        毫秒数，如 500        |
| CtsHolding   | `true` 表示对方设备已准备好接收数据 | true、false，需硬件 CTS 支持 |
| CDHolding    |       true 表示检测到载波信号       | true、false，需硬件 CD 支持  |

## 二、串口事件：数据接收与 UI 更新

在串口通信中，数据接收是核心环节。`SerialPort` 类通过 `DataReceived` 事件实现异步接收。在 WinForm 应用中，事件处理函数运行在后台线程，不能直接更新 UI 控件。为此，应使用 `BeginInvoke` 方法进行异步更新，避免阻塞主线程。

```csharp
public delegate void UpdateUIDelegate(byte[] data);

private void Comm_DataReceived(object sender, SerialDataReceivedEventArgs e)
{
    byte[] receivedData = new byte[8];
    try
    {
        serialPort.Read(receivedData, 0, 6);
        this.BeginInvoke(new UpdateUIDelegate(UpdateUI), receivedData);
    }
    catch (TimeoutException ex)
    {
        MessageBox.Show("超时：" + ex.Message);
    }
}

private void UpdateUI(byte[] data)
{
    string receivedStr = System.Text.Encoding.Default.GetString(data);
    this.textBoxData.Text = receivedStr;
}
```

## 三、串口的打开、关闭与参数配置

### 打开串口

打开串口前应确保参数配置完成，并进行异常捕获：

```cs
try
{
    serialPort.Open();
}
catch (UnauthorizedAccessException ex)
{
    MessageBox.Show("权限不足或串口正在使用：" + ex.Message);
}
catch (IOException ex)
{
    MessageBox.Show("I/O错误：" + ex.Message);
}
```

### 关闭串口与安全退出

关闭串口时，若存在未完成的线程操作，可能导致死锁。

建议使用标志变量控制流程：

```cs
private bool isReceiving = false;
private bool isTryingToClose = false;

public void SafeCloseSerialPort()
{
    isTryingToClose = true;
    while (isReceiving)
    {
        System.Windows.Forms.Application.DoEvents();
    }
    serialPort.Close();
}
```

### 参数配置示例

```cs
SerialPort serialPort = new SerialPort();
serialPort.PortName = "COM5";
serialPort.BaudRate = 115200;
serialPort.Parity = Parity.None;
serialPort.DataBits = 8;
serialPort.StopBits = StopBits.One;
serialPort.Handshake = Handshake.None;
serialPort.ReadTimeout = 500;
serialPort.WriteTimeout = 500;
```

## 四、常见异常处理策略

### 端口占用与权限问题

```cs
try
{
    serialPort.Open();
}
catch (UnauthorizedAccessException ex)
{
    MessageBox.Show("串口访问权限不足：" + ex.Message);
}
catch (IOException ex)
{
    MessageBox.Show("串口可能不存在或被占用：" + ex.Message);
}
```

### 超时异常处理

```cs
try
{
    byte[] buffer = new byte[serialPort.BytesToRead];
    int bytesRead = serialPort.Read(buffer, 0, buffer.Length);
}
catch (TimeoutException ex)
{
    MessageBox.Show("数据读取超时：" + ex.Message);
}
```

### 未打开串口的操作

```cs
if (!serialPort.IsOpen)
{
    MessageBox.Show("串口尚未打开，请先调用 Open() 方法。");
    return;
}
```

### CtsHolding 与 CDHolding 支持

```cs
public static bool IsHardwareFlowControlSupported(SerialPort port)
{
    try
    {
        bool originalRts = port.RtsEnable;
        bool originalDtr = port.DtrEnable;

        port.RtsEnable = false;
        Thread.Sleep(10);
        bool ctsLow = port.CtsHolding;

        port.RtsEnable = true;
        Thread.Sleep(10);
        bool ctsHigh = port.CtsHolding;

        port.RtsEnable = originalRts;
        port.DtrEnable = originalDtr;

        return ctsLow != ctsHigh;
    }
    catch
    {
        return false;
    }
}
```

## 五、WinForm 环境下串口通信的实现示例

以下是一个完整的 WinForm 示例核心代码结构：

```cs
using System.IO.Ports;
using Timer = System.Windows.Forms.Timer;

namespace AppSerialPortExplained
{
    public partial class Form1 : Form
    {
        private SerialPort serialPort = new SerialPort();
        private Timer statusTimer = new Timer();

        public Form1()
        {
            InitializeComponent();
            RefreshPortList();
            comboBoxBaud.Items.AddRange(new object[] { "1200", "2400", "4800", "9600", "19200", "38400", "57600", "115200" });
            comboBoxBaud.SelectedIndex = 3;
            comboBoxParity.Items.AddRange(new object[] { "None", "Even", "Odd", "Mark", "Space" });
            comboBoxParity.SelectedIndex = 0;
            comboBoxDataBits.Items.AddRange(new object[] { "5", "6", "7", "8" });
            comboBoxDataBits.SelectedIndex = 3;
            comboBoxStopBits.Items.AddRange(new object[] { "One", "Two", "OnePointFive" });
            comboBoxStopBits.SelectedIndex = 0;
            comboBoxHandshake.Items.AddRange(new object[] { "None", "XOnXOff", "RequestToSend", "RequestToSendXOnXOff" });
            comboBoxHandshake.SelectedIndex = 0;
            numericUpDownReadTimeout.Value = 500;
            numericUpDownWriteTimeout.Value = 500;
            serialPort.DataReceived += SerialPort_DataReceived;
            serialPort.ErrorReceived += SerialPort_ErrorReceived;
            serialPort.PinChanged += SerialPort_PinChanged;
            InitializeTimer();
        }

        private void InitializeTimer()
        {
            statusTimer.Interval = 100;
            statusTimer.Tick += StatusTimer_Tick;
        }

        private void RefreshPortList()
        {
            string selectedPort = comboBoxPort.Text;
            comboBoxPort.Items.Clear();
            comboBoxPort.Items.AddRange(SerialPort.GetPortNames());
            if (comboBoxPort.Items.Count > 0)
            {
                if (comboBoxPort.Items.Contains(selectedPort))
                    comboBoxPort.Text = selectedPort;
                else
                    comboBoxPort.SelectedIndex = 0;
            }
        }

        private void buttonRefresh_Click(object sender, EventArgs e)
        {
            RefreshPortList();
        }

        private void buttonOpen_Click(object sender, EventArgs e)
        {
            if (!serialPort.IsOpen)
            {
                try
                {
                    serialPort.PortName = comboBoxPort.Text;
                    serialPort.BaudRate = int.Parse(comboBoxBaud.Text);
                    switch (comboBoxParity.Text)
                    {
                        case "None": serialPort.Parity = Parity.None; break;
                        case "Even": serialPort.Parity = Parity.Even; break;
                        case "Odd": serialPort.Parity = Parity.Odd; break;
                        case "Mark": serialPort.Parity = Parity.Mark; break;
                        case "Space": serialPort.Parity = Parity.Space; break;
                    }
                    serialPort.DataBits = int.Parse(comboBoxDataBits.Text);
                    switch (comboBoxStopBits.Text)
                    {
                        case "One": serialPort.StopBits = StopBits.One; break;
                        case "Two": serialPort.StopBits = StopBits.Two; break;
                        case "OnePointFive": serialPort.StopBits = StopBits.OnePointFive; break;
                    }
                    serialPort.Handshake = (Handshake)Enum.Parse(typeof(Handshake), comboBoxHandshake.Text.Replace("XOnXOff", "XonXOff"));
                    serialPort.ReadTimeout = (int)numericUpDownReadTimeout.Value;
                    serialPort.WriteTimeout = (int)numericUpDownWriteTimeout.Value;
                    serialPort.Open();
                }
                catch (Exception ex)
                {
                    MessageBox.Show("打开串口失败：" + ex.Message);
                }
            }
        }
    }
}
```

## 六、常见问题与解决方案

在实际开发过程中，使用 `SerialPort` 类时会遇到许多常见问题，下面列举并详细介绍解决方案：

### 死锁问题与 UI 更新阻塞

在调用 `serialPort.Close()` 时，如果数据接收线程仍在运行，采用 `Invoke` 调用 UI 更新方法会导致同步等待，最终引起死锁问题。解决这一问题的方法是改为使用 `BeginInvoke` 进行异步调用，以避免线程阻塞。

### 串口线程安全性问题

在多线程环境下，数据接收线程与 UI 主线程可能同时访问共享资源，若不加保护，容易引起数据竞争问题。通常的解决办法是采用标志控制（如 `isReceiving` 和 `isTryingToClose`）以及使用 `Application.DoEvents()` 循环确保所有后台线程结束后再关闭串口。

### 异常捕获不足

许多开发在编写串口通信代码时，往往忽略了对各种异常（超时、I/O 错误、未打开串口等）的充分捕获。应在关键操作（如 Open、Read、Write）处使用 try-catch 结构，将异常信息反馈给用户，并记录日志以便后续分析。

### 串口数据粘包或格式不正确

在数据连续传输的场景中，串口可能会因为数据粘包的问题导致解析错误。为解决这一问题，建议在数据传输协议中明确数据边界，如采用特定的分隔符，或者在数据头部增加包长度信息，然后在接收时进行数据拆包解析。

## 总结

通过对 `SerialPort` 类的详细解析，本文展示了如何在 WinForm 环境下正确设置串口参数、打开关闭串口以及处理常见的异常情况。合理的异常捕获、线程安全机制以及 UI 数据更新策略，不仅提高了应用的稳定性，也为编写高质量串口通信程序提供了有效的技术支持。

在工业自动化、嵌入式设备通信等领域，串口通信依然是不可替代的技术手段。随着国产软硬件生态的不断完善，开发在串口通信方面的实践经验也日益丰富。面对未来不断变化的硬件通信需求，开发应继续关注异常自愈和智能数据解析技术的进步，为行业应用提供更全面、可靠的解决方案。
