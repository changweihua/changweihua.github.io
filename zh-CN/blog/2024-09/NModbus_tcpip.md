---
lastUpdated: true
commentabled: true
recommended: true
title:  C# 使用NModbus库创建Modbus从站
description: C# 使用NModbus库创建Modbus从站
date: 2024-09-24 10:18:00
pageClass: blog-page-class
---

# C# 使用NModbus库创建Modbus从站 #

## 使用NModbus库创建Modbus从站 ##

```c#
using NModbus;
using System;
using System.Net;
using System.Net.Sockets;
 
namespace ModbusSlaveTest
{
    internal class Program
    {
        static void Main(string[] args)
        {
            //设置从站ID和端口
            byte slaveId = 1;
            int port = 502;
            //创建并配置监听TCP客户端的TcpListener
            var listener = new TcpListener(new IPAddress(new byte[] { 127, 0, 0, 1 }), port);
            listener.Start();
            //创建从站并开启监听
            var factory = new ModbusFactory();
            var modbusTcpSlaveNetwork = factory.CreateSlaveNetwork(listener);
            var slave = factory.CreateSlave(slaveId);
            modbusTcpSlaveNetwork.AddSlave(slave);
            modbusTcpSlaveNetwork.ListenAsync();
 
            //输入寄存器
            slave.DataStore.InputRegisters.WritePoints(0, new ushort[] { 1, 2, 3 });
            //保持寄存器
            slave.DataStore.HoldingRegisters.WritePoints(0, new ushort[] { 3, 2, 1 });
            //线圈
            slave.DataStore.CoilDiscretes.WritePoints(0, new bool[] { true, false, true });
            //离散输入
            slave.DataStore.CoilInputs.WritePoints(0, new bool[] { true, true, true });
 
            Console.ReadKey();
        }
    }
}
```

## 使用NModbus库验证从站数据 ##

```c#
using NModbus;
using System;
using System.Net.Sockets;
 
namespace ModbusMasterTest
{
    internal class Program
    {
        static void Main(string[] args)
        {
            using (TcpClient client = new TcpClient("127.0.0.1", 502))
            {
                var factory = new ModbusFactory();
                IModbusMaster master = factory.CreateMaster(client);
 
                //线圈
                Console.WriteLine("Coils: " + string.Join(",", master.ReadCoils(1, 0, 3)));
                //离散输入
                Console.WriteLine("Discrete Inputs: " + string.Join(",", master.ReadInputs(1, 0, 3)));
                //保持寄存器
                Console.WriteLine("Holding Registers: " + string.Join(",", master.ReadHoldingRegisters(1, 0, 3)));
                //输入寄存器
                Console.WriteLine("Input Registers: " + string.Join(",", master.ReadInputRegisters(1, 0, 3)));
 
                Console.ReadKey();
            }
        }
    }
}
```

### 输出结果 ###

```txt
Coils: True,False,True
Discrete Inputs: True,True,True
Holding Registers: 3,2,1
Input Registers: 1,2,3
```
