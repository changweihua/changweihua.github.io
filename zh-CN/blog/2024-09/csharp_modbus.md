---
lastUpdated: true
commentabled: true
recommended: true
title:  C# 使用NModbus4、EasyModbus
description: C# 使用NModbus4、EasyModbus
date: 2024-09-06 10:18:00
pageClass: blog-page-class
---

# C# 使用NModbus4、EasyModbus #

## NModbus4 ##

安装 `NModbus4` 稳定版v2.1.0


```c# NModbus4Helper.cs

using Modbus.Device;
using Modbus.Message;

namespace Sample {
  internal class NModbus4Helper {

    byte _DeviceId = 8;
    ModbusMaster master;

    /// <summary>
    /// 读取单个寄存器
    /// </summary>
    /// <param name="regAddr"></param>
    /// <param name="value"></param>
    /// <returns></returns>
    public byte[] ReadSingleRegister(ushort regAddr)
    {
        try
        {
            ReadHoldingInputRegistersRequest readRegistersReq = new ReadHoldingInputRegistersRequest(0x03, _DeviceId, regAddr, 1);
            //获取响应报文
            ReadHoldingInputRegistersResponse readRegistersRes = master.ExecuteCustomMessage<ReadHoldingInputRegistersResponse>(readRegistersReq);
            return readRegistersRes.ProtocolDataUnit;
        }
        catch (Exception ex)
        {
            return null;
        }
    }

            /// <summary>
    /// 读取多个保持型寄存器
    /// </summary>
    /// <returns></returns>
    public Task<byte[]> ReadHoldingRegisters(ushort regStartAddr, ushort regEndAddr)
    {
        try
        {
            ushort Lenth = (ushort)(regEndAddr - regStartAddr + 1);
            return Task.Run(() =>
            {
                ReadHoldingInputRegistersRequest readRegistersReq = new ReadHoldingInputRegistersRequest(0x03, _DeviceId, regStartAddr, Lenth);
                //获取响应报文
                ReadHoldingInputRegistersResponse readRegistersRes = master.ExecuteCustomMessage<ReadHoldingInputRegistersResponse>(readRegistersReq);
                return readRegistersRes.ProtocolDataUnit;
            });
        }
        catch (Exception ex)
        {
            return null;
        }
    }

            public byte[] ReadRegister(ushort regAddr)
    {
        try
        {
            ushort Lenth = 1;
            ushort[] rec = master.ReadHoldingRegisters(_DeviceId, regAddr, Lenth);
            byte[] recByte = new byte[rec.Length];
            Buffer.BlockCopy(rec, 0, recByte, 0, rec.Length);
            return recByte;
        }
        catch (Exception ex)
        {
            return null;
        }
    }

    public byte[] ReadRegisters(ushort regStartAddr, ushort regEndAddr)
    {
        try
        {
            ushort Lenth = (ushort)(regEndAddr - regStartAddr + 1);
            ushort[] rec = master.ReadHoldingRegisters(_DeviceId, regStartAddr, Lenth);
            byte[] recByte = new byte[rec.Length];
            Buffer.BlockCopy(rec, 0, recByte, 0, rec.Length);
            return recByte;
        }
        catch (Exception ex)
        {
            return null;
        }
    }
  }
}

```

## EasyModbus ## 

安装 `EasyModbusTCP` 5.6.0


```c#

using EasyModbus;

namespace Sample {
  internal class NModbus4Helper {

    byte _DeviceId = 8;
    ModbusClient modbusClient = null;
    object _transferLockObj = new object();

    public void OpenSerialPort()
    {
        try
        {
            modbusClient = new ModbusClient("COM1");
            modbusClient.UnitIdentifier = _DeviceId;
            modbusClient.Baudrate = _baudRate;
            modbusClient.Parity = Parity.None;
            modbusClient.StopBits = StopBits.One;
            modbusClient.ConnectionTimeout = 500;
            modbusClient.Connect();
        }
        catch (Exception ex)
        {
        }
    }

    /// <summary>
    /// 写入单个寄存器并获取响应
    /// </summary>
    public byte[] WriteSingleRegister(ushort regAddr, ushort value)
    {
        try
        {
            lock (_transferLockObj)
            {
                modbusClient.receiveData = null;
                modbusClient.WriteSingleRegister(regAddr, value);
                byte[] Rec = modbusClient.receiveData;
                return Rec;
            }
        }
        catch (Exception ex)
        {
            return null;
        }
    }

    /// <summary>
    /// 读取寄存器
    /// </summary>
    public int[] ReadRegisters(ushort regStartAddr, ushort regEndAddr)
    {
        try
        {
            lock (_transferLockObj)
            {
                ushort Lenth = (ushort)(regEndAddr - regStartAddr + 1);
                int[] rec = modbusClient.ReadHoldingRegisters(regStartAddr, Lenth);
                return rec;
            }
        }
        catch (Exception ex)
        {
            return null;
        }
    }
  }
}
```
