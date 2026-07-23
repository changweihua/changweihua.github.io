---
lastUpdated: true
commentabled: true
recommended: true
title: flutter 利用flutter_libserialport 实现SQ800 串口通信
description: flutter 利用flutter_libserialport 实现SQ800 串口通信
date: 2026-05-21 13:15:00 
pageClass: blog-page-class
cover: /covers/flutter.svg
---

> SQ800TicketService 出票模块通信服务说明

## 背景与目标 ##

- 设备背景：SQ800 是一款通过串口与主机通信的出票模块，使用自定义二进制协议。
- 本类作用：SQ800TicketService 封装了 串口连接、协议帧构造与解析、CRC 校验、出票队列管理、错误恢复 等全部底层逻辑，对上层只暴露一个基于事件流的服务。
- 设计目标：

  - 上层不用关心串口/协议细节，只通过方法调用 + 监听事件即可。
  - 支持成批出票、自动连续、故障暂停、恢复后自动继续。
  - 所有关键状态和错误都通过统一事件流抛出，方便 UI 展示与日志记录。

## 核心类与整体结构 ##

- 依赖：依赖于 `flutter_libserialport`，需要自行安装：[地址](https://link.juejin.cn/?target=https%3A%2F%2Fpub.dev%2Fpackages%2Fflutter_libserialport)
- 核心类：`SQ800TicketService`
- 相关类型：

  - `SQ800Event`：对外事件对象（类型 + 文本描述 + 可选原始值）。
  - `SQ800EventType`：事件类型枚举（日志、连接、出票成功/失败、传感器状态、恢复结果、设备信息等）。

- 主要组成模块：

  - 串口管理：打开/关闭串口、设置波特率、监听串口数据。
  - 命令发送：统一 `_sendCmd`，按协议构造帧并写入串口。
  - 响应解析：缓冲组帧、CRC 校验、按 statusType 分发到对应解析函数。
  - 出票队列：支持批量排队、自动连续打印、失败暂停、手动恢复。
  - 错误恢复：切刀故障、卡纸故障恢复，并在恢复成功后自动继续队列。
  - 事件流：`eventStream` 对外发布所有状态变化和日志。

## 快速上手示例 ##

```dart
final service = SQ800TicketService();

// 1. 订阅事件（建议在页面 initState 中）
late final StreamSubscription<SQ800Event> sub;
sub = service.eventStream.listen((e) {
  // 根据 e.type 分类处理，例如追加日志、更新 UI、弹提示等
  print('[${e.type}] ${e.message}');
});

// 2. 枚举并连接串口（实际项目中可让用户选择端口）
final ports = service.listPorts();
if (ports.isNotEmpty) {
  final ok = service.connect(ports.first);
  if (ok) {
    // 3. 加入 5 张 4 寸票到队列，自动连续出票
    service.enqueueTickets(5, lengthInch: 4);

    // 可选：查询状态、固件版本、剩余票数等
    service.queryStatus();
    service.readFirmwareVersion();
    service.readRemainingTickets();
  }
}

// 4. 出现切刀/卡纸错误后，UI 上提供按钮调用：
// service.recoverCutter();
// service.recoverJam();

// 5. 页面销毁时释放资源
@override
void dispose() {
  sub.cancel();
  service.dispose();
  super.dispose();
}
```

## 事件模型 ##

### SQ800Event ###

结构：

- `type: SQ800EventType`：事件类型。
- `message: String`：人类可读的中文描述，直接可用于日志或 UI 展示。
- `rawValue: int?`：可选的原始数值（例如传感器状态码、错误码等）。

### SQ800EventType 常见类型 ###

- log：调试日志、错误信息（例如连接异常、发送失败、CRC 错误等）。
- connected / disconnected：串口连接/断开。
- printSuccess / printFailed：单次出票结果。
- sensorStatus：单个或综合传感器状态（入纸口、出纸口、切刀、卡纸等）。
- recoverySuccess / recoveryFailed：切刀/卡纸恢复结果。
- deviceInfo：固件版本、设备型号、剩余票数等配置/信息。
- configValue：写配置返回。
- crcError / invalidParam：设备端 CRC 错误、无效参数。
- queueUpdate / queuePaused：队列状态变化、队列暂停（达到重试上限等待人工确认等）。

上层 UI 只需要订阅 `eventStream`，根据 type 做分支处理即可，例如：

```dart
service.eventStream.listen((e) {
  switch (e.type) {
    case SQ800EventType.printSuccess:
      // 显示“出票成功”，并更新计数
      break;
    case SQ800EventType.printFailed:
      // 弹出错误提示，提示用户检查切刀/卡纸情况并手动点击恢复
      break;
    case SQ800EventType.sensorStatus:
      // 实时展示传感器状态，例如“入纸口无票”、“卡纸”等
      break;
    default:
      // 其他类型根据需要处理
      break;
  }
});
```

## 对外 API 一览 ##

### 连接与资源管理 ###

- `listPorts(): List<String>`

  - 返回当前可用串口地址列表。
  - 内部异常会通过 log 事件抛出。

- `getPortInfo(String address): Map<String, String>`

  - 返回指定串口的描述信息：description、transport（USB/BT/Native）、manufacturer、product、serial 等。

- `connect(String address): bool`

  - 按 9600 波特率、8N1 配置打开串口并开始监听。
  - 成功后派发 connected 事件；失败会通过 log 事件给出失败原因。

- `disconnect(): void`

  - 关闭串口并清理监听，派发 disconnected 事件。

- `dispose(): void`

  - 完整释放串口与事件流资源，适合应用退出或页面销毁时调用。

### 出票队列与单张出票 ###

- `enqueueTickets(int count, {int lengthInch = 4})`

  - 向队列中追加 count 张票，票长 lengthInch（单位：寸）。
  - 若当前未处于打印状态，会自动启动 _printNext() 连续出票。
  - 每次队列变化会通过 queueUpdate 事件告知外部。

- `resumeQueue()`

  - 当发生故障导致自动连续打印中断时，用户排除故障后，可调用此方法手动恢复队列。
  - 若队列为空则只会发出日志提示。

- `clearQueue()`

  - 清空当前排队的所有票，并停止自动打印。

- `printOneTicket({int lengthInch = 4})`

  - 直接发送一张出票命令，不计入队列。
  - 适合测试或手动单张出票场景。

- `resetCounters()`

  - 重置成功/失败计数（printedCount / failedCount），并通过 queueUpdate 事件通知。

- 统计字段（只读）

  - printedCount：当前会话内成功出票张数。
  - failedCount：当前会话内失败次数。
  - ticketQueue：当前队列剩余张数。
  - isPrinting：当前是否处于自动连打状态。

### 状态查询与设备信息 ###

- `queryStatus()`

  - 查询综合状态（入纸口、出纸口、切刀、卡纸等），结果会通过 sensorStatus 事件抛出。

- `querySensor(int param)`

  - 查询单个传感器状态，param 取值 0x01 ~ 0x05。

- `readFirmwareVersion()`

  - 读取固件版本号，通过 deviceInfo 事件返回字符串信息。

- `readDeviceModel()`

  - 读取设备型号，通过 deviceInfo 事件返回字符串信息。

- `readRemainingTickets()`

  - 读取设备内部记录的剩余票数，通过 deviceInfo 事件返回数值。

### 错误恢复 ###

- `recoverCutter()`

  - 发送恢复切刀错误命令，并将内部 _isPrinting 置为 false。
  - 当设备返回恢复结果时，由 _parseRecoveryResult 解析并触发 recoverySuccess / recoveryFailed 事件。
  - 恢复成功且队列仍有剩余时，会自动延时后继续 _printNext()。

- `recoverJam()`

  - 与 `recoverCutter()` 类似，用于恢复卡纸错误。

## 协议与 CRC 简述 ##

### 发送帧格式 ###

发送帧格式为：

> `0x1F 0x0F + addr + cmd + type + length + data... + crcHigh + crcLow`

- addr：设备地址，仅低 4 位有效。
- cmd：命令字（读传感器 / 写配置 / 读配置 / 出票 / 错误恢复等）。
- type：命令参数或子类型（例如传感器编号、长度单位等）。
- length：data 数据区的字节数。
- data：具体业务数据（如票长）。
- crcHigh + crcLow：对前面所有字节按技术手册算法计算出的 CRC16 校验。

构帧逻辑由静态方法 buildFrame 负责，内部会调用 crcCalc 计算 CRC，并最终返回 Uint8List 以写入串口。

### 接收与解析 ###

所有串口接收数据先进入 _rxBuffer，然后由 _tryParseFrames()：

- 查找帧头 0x1F 0x0F；
- 根据长度字段计算完整帧长度；
- 数据不足则等待下一批数据；
- 取到完整帧后计算 CRC，与帧尾两字节对比。

CRC 通过后，由 _parseResponse(frame) 根据 statusType 派发到不同解析函数：

- _parseSensorStatus：解析传感器/综合状态；
- _parseReadConfig：解析固件版本、型号、剩余票数等；
- _parsePrintResult：解析单次出票结果，并更新队列与计数；
- _parseRecoveryResult：解析切刀/卡纸恢复结果，并决定是否继续队列。

## UI 集成和使用建议 ###

- 事件驱动：推荐在页面初始化时订阅 eventStream，将所有事件统一写入一份“设备日志”列表，并根据类型做额外 UI 反馈。

- 显式操作按钮：

  - “连接设备”：调用 listPorts + connect。
  - “单张出票”：调用 printOneTicket。
  - “批量出票”：输入张数与票长，调用 enqueueTickets。
  - “恢复切刀 / 恢复卡纸”：在 printFailed 提示中根据错误码，引导用户点击相应按钮调用 recoverCutter / recoverJam。
  - “清空队列”：调用 clearQueue，防止误继续。

- 日志与故障排查：

  - 建议 UI 中保留一个“调试日志”区域，将所有 log / crcError / invalidParam 事件记录下来，方便现场排查。
  - 十六进制原始帧字符串（hexString）在设备通信问题上非常有价值。

## 源码 ##

```dart
import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_libserialport/flutter_libserialport.dart';

/// SQ800 设备返回的响应事件
class SQ800Event {
  final SQ800EventType type;
  final String message;
  final int? rawValue;

  const SQ800Event(this.type, this.message, {this.rawValue});

  @override
  String toString() => message;
}

enum SQ800EventType {
  log,
  connected,
  disconnected,
  printSuccess,
  printFailed,
  sensorStatus,
  recoverySuccess,
  recoveryFailed,
  deviceInfo,
  configValue,
  crcError,
  invalidParam,
  queueUpdate,
  /// 连续失败达到上限，队列暂停，等待用户确认是否继续
  queuePaused,
}

/// SQ800 出票模块通信服务
///
/// 封装了串口连接、协议帧构建/解析、CRC、出票队列、错误恢复等全部逻辑。
/// 通过 [eventStream] 向外抛出所有事件，UI 层只需监听即可。
///
/// 用法：
/// ```dart
/// final service = SQ800TicketService();
/// service.eventStream.listen((e) => print(e.message));
/// service.connect('/dev/ttyS3');
/// service.enqueueTickets(5, lengthInch: 4);
/// service.queryStatus();
/// service.dispose();
/// ```
class SQ800TicketService {
  SQ800TicketService({int deviceAddr = 0x00}) : _deviceAddr = deviceAddr;

  // ── 协议命令常量 ──

  static const int cmdReadSensor = 0x01;
  static const int cmdWriteConfig = 0x02;
  static const int cmdReadConfig = 0x03;
  static const int cmdPrintTicket = 0x04;
  static const int cmdErrorRecovery = 0x05;

  static const int paramInch = 0x01;
  static const int paramMm = 0x02;
  static const int paramAllStatus = 0x05;

  // ── 状态 ──

  int _deviceAddr;
  int get deviceAddr => _deviceAddr;
  set deviceAddr(int v) => _deviceAddr = v & 0x0F;

  SerialPort? _port;
  SerialPortReader? _reader;
  StreamSubscription<Uint8List>? _subscription;

  bool get isConnected => _port?.isOpen ?? false;
  String get connectedPortName => _port?.name ?? '';

  int _ticketQueue = 0;
  int get ticketQueue => _ticketQueue;

  bool _isPrinting = false;
  bool get isPrinting => _isPrinting;

  int _ticketLengthInch = 4;


  int _printedCount = 0;
  int get printedCount => _printedCount;

  int _failedCount = 0;
  int get failedCount => _failedCount;

  /// 重置出票计数（成功 + 失败）
  void resetCounters() {
    _printedCount = 0;
    _failedCount = 0;
    _emit(SQ800EventType.queueUpdate, '计数已重置');
  }

  // ── 事件流 ──

  final _eventCtrl = StreamController<SQ800Event>.broadcast();
  Stream<SQ800Event> get eventStream => _eventCtrl.stream;

  void _emit(SQ800EventType type, String msg, {int? raw}) {
    _eventCtrl.add(SQ800Event(type, msg, rawValue: raw));
  }

  // ════════════════════════════════════════════════════════
  //  串口管理
  // ════════════════════════════════════════════════════════

  /// 枚举可用串口，返回地址列表
  List<String> listPorts() {
    try {
      return SerialPort.availablePorts;
    } catch (e) {
      _emit(SQ800EventType.log, '枚举串口异常: $e');
      return [];
    }
  }

  /// 获取指定串口的描述信息
  Map<String, String> getPortInfo(String address) {
    try {
      final p = SerialPort(address);
      final info = {
        'description': p.description ?? '',
        'transport': _transportName(p.transport),
        'manufacturer': p.manufacturer ?? '',
        'product': p.productName ?? '',
        'serial': p.serialNumber ?? '',
      };
      p.dispose();
      return info;
    } catch (_) {
      return {};
    }
  }

  /// 连接指定串口（9600, 8N1）
  bool connect(String address) {
    if (isConnected) {
      _emit(SQ800EventType.log, '已有连接，请先断开');
      return false;
    }

    _cleanup();
    _emit(SQ800EventType.log, '正在打开 $address …');

    try {
      _port = SerialPort(address);

      if (!_port!.openReadWrite()) {
        final err = SerialPort.lastError;
        _emit(SQ800EventType.log, '打开失败: $err');
        _port!.dispose();
        _port = null;
        return false;
      }

      final config = _port!.config;
      config.baudRate = 9600;
      config.bits = 8;
      config.stopBits = 1;
      config.parity = SerialPortParity.none;
      _port!.config = config;
      config.dispose();

      _reader = SerialPortReader(_port!);
      _subscription = _reader!.stream.listen(
        _onDataReceived,
        onError: (e) => _emit(SQ800EventType.log, '读取异常: $e'),
      );

      _emit(SQ800EventType.connected, '已连接 $address (9600, 8N1)');
      return true;
    } catch (e) {
      _emit(SQ800EventType.log, '连接异常: $e');
      _cleanup();
      return false;
    }
  }

  /// 断开串口
  void disconnect() {
    _cleanup();
    _isPrinting = false;
    _emit(SQ800EventType.disconnected, '已断开');
  }

  void _cleanup() {
    _subscription?.cancel();
    _subscription = null;
    _reader?.close();
    _reader = null;
    if (_port != null) {
      try { _port!.close(); } catch (_) {}
      try { _port!.dispose(); } catch (_) {}
      _port = null;
    }
  }

  /// 释放资源
  void dispose() {
    _cleanup();
    _eventCtrl.close();
  }

  // ════════════════════════════════════════════════════════
  //  出票队列
  // ════════════════════════════════════════════════════════

  /// 加入出票队列
  void enqueueTickets(int count, {int lengthInch = 4}) {
    if (count <= 0) return;
    if (!isConnected) {
      _emit(SQ800EventType.log, '请先连接串口');
      return;
    }
    _ticketLengthInch = lengthInch;
    _ticketQueue += count;
    _emit(SQ800EventType.queueUpdate, '加入队列 $count 张 → 共 $_ticketQueue');
    if (!_isPrinting) {
      _isPrinting = true;
      _printNext();
    }
  }

  /// 手动恢复打印队列（重置重试计数）
  void resumeQueue() {
    if (_ticketQueue <= 0) {
      _emit(SQ800EventType.log, '队列为空');
      return;
    }
    if (_isPrinting) return;
    _emit(SQ800EventType.queueUpdate, '手动恢复队列，剩余 $_ticketQueue 张');
    _isPrinting = true;
    _printNext();
  }

  /// 清空队列
  void clearQueue() {
    _ticketQueue = 0;
    _isPrinting = false;
    _emit(SQ800EventType.queueUpdate, '队列已清空');
  }

  void _printNext() {
    if (_ticketQueue <= 0 || !isConnected) {
      _isPrinting = false;
      _emit(SQ800EventType.queueUpdate, '队列完成');
      return;
    }
    _sendCmd(cmdPrintTicket, paramInch, [_ticketLengthInch], '出票 $_ticketLengthInch 寸');
  }

  // ════════════════════════════════════════════════════════
  //  命令发送
  // ════════════════════════════════════════════════════════

  /// 查询综合状态
  void queryStatus() => _sendCmd(cmdReadSensor, paramAllStatus, const [], '查询综合状态');

  /// 查询单项传感器状态 (param: 0x01~0x05)
  void querySensor(int param) => _sendCmd(cmdReadSensor, param, const [], '查询传感器 0x${param.toRadixString(16)}');

  /// 读固件版本
  void readFirmwareVersion() => _sendCmd(cmdReadConfig, 0x06, const [], '读固件版本');

  /// 读设备型号
  void readDeviceModel() => _sendCmd(cmdReadConfig, 0x07, const [], '读设备型号');

  /// 读剩余票数
  void readRemainingTickets() => _sendCmd(cmdReadConfig, 0x05, const [], '读剩余票数');

  /// 恢复切刀错误，恢复完成后自动继续出票
  void recoverCutter() {
    _sendCmd(cmdErrorRecovery, 0x01, const [], '恢复切刀');
    _isPrinting = false;
  }

  /// 恢复卡纸错误，恢复完成后自动继续出票
  void recoverJam() {
    _sendCmd(cmdErrorRecovery, 0x02, const [], '恢复卡纸');
    _isPrinting = false;
  }

  /// 发送一张出票命令（不经过队列）
  void printOneTicket({int lengthInch = 4}) {
    _sendCmd(cmdPrintTicket, paramInch, [lengthInch], '单张出票 $lengthInch 寸');
  }

  bool _sendCmd(int cmd, int type, List<int> data, String desc) {
    if (!isConnected) {
      _emit(SQ800EventType.log, '未连接，无法发送: $desc');
      return false;
    }
    try {
      final frame = buildFrame(_deviceAddr, cmd, type, data);
      _port!.write(frame);
      _emit(SQ800EventType.log, 'TX [$desc]: ${hexString(frame)}');
      return true;
    } catch (e) {
      _emit(SQ800EventType.log, '发送失败: $e');
      return false;
    }
  }

  // ════════════════════════════════════════════════════════
  //  接收 & 解析
  // ════════════════════════════════════════════════════════

  final List<int> _rxBuffer = [];

  void _onDataReceived(Uint8List data) {
    _rxBuffer.addAll(data);
    _tryParseFrames();
  }

  void _tryParseFrames() {
    while (_rxBuffer.length >= 8) {
      final idx = _findHeader();
      if (idx < 0) { _rxBuffer.clear(); return; }
      if (idx > 0) _rxBuffer.removeRange(0, idx);

      if (_rxBuffer.length < 6) return;
      final dataLen = _rxBuffer[5];
      final totalLen = 6 + dataLen + 2;
      if (_rxBuffer.length < totalLen) return;

      final frame = Uint8List.fromList(_rxBuffer.sublist(0, totalLen));
      _rxBuffer.removeRange(0, totalLen);

      final crcGot = crcCalc(frame.sublist(0, totalLen - 2));
      final crcIn = (frame[totalLen - 2] << 8) | frame[totalLen - 1];
      if (crcGot != crcIn) {
        _emit(SQ800EventType.crcError, 'RX CRC错误: ${hexString(frame)}');
        continue;
      }
      _parseResponse(frame);
    }
  }

  int _findHeader() {
    for (var i = 0; i < _rxBuffer.length - 1; i++) {
      if (_rxBuffer[i] == 0x1F && _rxBuffer[i + 1] == 0x0F) return i;
    }
    return -1;
  }

  void _parseResponse(Uint8List frame) {
    final statusType = frame[3];
    final statusParam = frame[4];
    final dataLen = frame[5];

    _emit(SQ800EventType.log, 'RX: ${hexString(frame)}');

    switch (statusType) {
      case 0x00:
        _emit(SQ800EventType.crcError, '设备返回 CRC 校验错误');
        break;
      case 0x01:
        if (dataLen >= 1) _parseSensorStatus(statusParam, frame[6]);
        break;
      case 0x02:
        _emit(SQ800EventType.configValue, '写配置返回 param=0x${statusParam.toRadixString(16)}');
        break;
      case 0x03:
        _parseReadConfig(statusParam, dataLen, frame);
        break;
      case 0x04:
        if (dataLen >= 1) _parsePrintResult(frame[6]);
        break;
      case 0x05:
        if (dataLen >= 1) _parseRecoveryResult(statusParam, frame[6]);
        break;
      case 0x06:
        _emit(SQ800EventType.invalidParam, '无效参数');
        break;
      default:
        _emit(SQ800EventType.log, '未知状态类型 0x${statusType.toRadixString(16)}');
    }
  }

  void _parseSensorStatus(int param, int m) {
    String msg;
    switch (param) {
      case 0x01: msg = '入纸口: ${m == 1 ? "无票" : "有票"}'; break;
      case 0x02: msg = '出纸口: ${m == 1 ? "有票未取走" : "无票"}'; break;
      case 0x03: msg = '切刀: ${m == 1 ? "位置出错" : "正常"}'; break;
      case 0x04: msg = '卡纸: ${m == 1 ? "卡纸" : "正常"}'; break;
      case 0x05:
        const map = {0: '正常', 1: '入纸口无票', 2: '出纸口有票未取走', 3: '切刀出错', 4: '卡纸'};
        msg = '综合状态: ${map[m] ?? "未知($m)"}';
        break;
      default: msg = '传感器[$param] = $m'; break;
    }
    _emit(SQ800EventType.sensorStatus, msg, raw: m);
  }

  void _parsePrintResult(int m) {
    const map = {0: '出票成功', 1: '失败:无票', 2: '失败:出纸口有票未取走', 3: '失败:切刀故障', 4: '失败:卡票'};
    final desc = map[m] ?? '未知($m)';

    if (m == 0) {
      _printedCount++;
      if (_ticketQueue > 0) _ticketQueue--;
      _emit(SQ800EventType.printSuccess, '$desc (已出 $_printedCount 张，队列剩余 $_ticketQueue)', raw: m);
      if (_ticketQueue > 0) {
        Future.delayed(const Duration(milliseconds: 200), _printNext);
      } else {
        _isPrinting = false;
        _emit(SQ800EventType.queueUpdate, '队列全部完成');
      }
    } else {
      _isPrinting = false;
      final hint = (m == 3 || m == 4)
          ? '请排除故障后点击「恢复${m == 4 ? "卡纸" : "切刀"}」'
          : '请排除故障后点击恢复按钮';
      _emit(SQ800EventType.printFailed,
          '$desc (队列剩余 $_ticketQueue 张)，$hint', raw: m);
    }
  }

  void _parseRecoveryResult(int param, int m) {
    final target = param == 0x01 ? '切刀' : '卡纸';
    if (m == 0) {
      _emit(SQ800EventType.recoverySuccess, '$target恢复成功');
      // 恢复成功 → 继续出票
      if (_ticketQueue > 0) {
        _emit(SQ800EventType.queueUpdate, '$target恢复成功，继续出票 (剩余 $_ticketQueue 张)');
        _isPrinting = true;
        Future.delayed(const Duration(milliseconds: 500), _printNext);
      }
    } else {
      _emit(SQ800EventType.recoveryFailed, '$target恢复失败', raw: m);
    }
  }

  void _parseReadConfig(int param, int dataLen, Uint8List frame) {
    if (dataLen < 1) return;
    String msg;
    switch (param) {
      case 0x06:
        msg = '固件版本: ${String.fromCharCodes(frame.sublist(6, 6 + dataLen))}';
        break;
      case 0x07:
        msg = '设备型号: ${String.fromCharCodes(frame.sublist(6, 6 + dataLen))}';
        break;
      case 0x05:
        msg = '剩余票数: ${_bytesToInt(frame, 6, dataLen)}';
        break;
      default:
        msg = '配置[0x${param.toRadixString(16)}] = ${_bytesToInt(frame, 6, dataLen)}';
    }
    _emit(SQ800EventType.deviceInfo, msg);
  }

  // ════════════════════════════════════════════════════════
  //  协议工具（静态，可直接调用）
  // ════════════════════════════════════════════════════════

  static const List<int> _crcTable = [
    0x0000, 0x8005, 0x800f, 0x000a, 0x801b, 0x001e, 0x0014, 0x8011,
    0x8033, 0x0036, 0x003c, 0x8039, 0x0028, 0x802d, 0x8027, 0x0022,
    0x8063, 0x0066, 0x006c, 0x8069, 0x0078, 0x807d, 0x8077, 0x0072,
    0x0050, 0x8055, 0x805f, 0x005a, 0x804b, 0x004e, 0x0044, 0x8041,
    0x80c3, 0x00c6, 0x00cc, 0x80c9, 0x00d8, 0x80dd, 0x80d7, 0x00d2,
    0x00f0, 0x80f5, 0x80ff, 0x00fa, 0x80eb, 0x00ee, 0x00e4, 0x80e1,
    0x00a0, 0x80a5, 0x80af, 0x00aa, 0x80bb, 0x00be, 0x00b4, 0x80b1,
    0x8093, 0x0096, 0x009c, 0x8099, 0x0088, 0x808d, 0x8087, 0x0082,
    0x8183, 0x0186, 0x018c, 0x8189, 0x0198, 0x819d, 0x8197, 0x0192,
    0x01b0, 0x81b5, 0x81bf, 0x01ba, 0x81ab, 0x01ae, 0x01a4, 0x81a1,
    0x01e0, 0x81e5, 0x81ef, 0x01ea, 0x81fb, 0x01fe, 0x01f4, 0x81f1,
    0x81d3, 0x01d6, 0x01dc, 0x81d9, 0x01c8, 0x81cd, 0x81c7, 0x01c2,
    0x0140, 0x8145, 0x814f, 0x014a, 0x815b, 0x015e, 0x0154, 0x8151,
    0x8173, 0x0176, 0x017c, 0x8179, 0x0168, 0x816d, 0x8167, 0x0162,
    0x8123, 0x0126, 0x012c, 0x8129, 0x0138, 0x813d, 0x8137, 0x0132,
    0x0110, 0x8115, 0x811f, 0x011a, 0x810b, 0x010e, 0x0104, 0x8101,
    0x8303, 0x0306, 0x030c, 0x8309, 0x0318, 0x831d, 0x8317, 0x0312,
    0x0330, 0x8335, 0x833f, 0x033a, 0x832b, 0x032e, 0x0324, 0x8321,
    0x0360, 0x8365, 0x836f, 0x036a, 0x837b, 0x037e, 0x0374, 0x8371,
    0x8353, 0x0356, 0x035c, 0x8359, 0x0348, 0x834d, 0x8347, 0x0342,
    0x03c0, 0x83c5, 0x83cf, 0x03ca, 0x83db, 0x03de, 0x03d4, 0x83d1,
    0x83f3, 0x03f6, 0x03fc, 0x83f9, 0x03e8, 0x83ed, 0x83e7, 0x03e2,
    0x83a3, 0x03a6, 0x03ac, 0x83a9, 0x03b8, 0x83bd, 0x83b7, 0x03b2,
    0x0390, 0x8395, 0x839f, 0x039a, 0x838b, 0x038e, 0x0384, 0x8381,
    0x0280, 0x8285, 0x828f, 0x028a, 0x829b, 0x029e, 0x0294, 0x8291,
    0x82b3, 0x02b6, 0x02bc, 0x82b9, 0x02a8, 0x82ad, 0x82a7, 0x02a2,
    0x82e3, 0x02e6, 0x02ec, 0x82e9, 0x02f8, 0x82fd, 0x82f7, 0x02f2,
    0x02d0, 0x82d5, 0x82df, 0x02da, 0x82cb, 0x02ce, 0x02c4, 0x82c1,
    0x8243, 0x0246, 0x024c, 0x8249, 0x0258, 0x825d, 0x8257, 0x0252,
    0x0270, 0x8275, 0x827f, 0x027a, 0x826b, 0x026e, 0x0264, 0x8261,
    0x0220, 0x8225, 0x822f, 0x022a, 0x823b, 0x023e, 0x0234, 0x8231,
    0x8213, 0x0216, 0x021c, 0x8219, 0x0208, 0x820d, 0x8207, 0x0202,
  ];

  /// CRC16 校验（技术手册附录算法）
  static int crcCalc(Uint8List data) {
    int crc = 0;
    for (final b in data) {
      crc = ((crc << 8) & 0xFFFF) ^ _crcTable[((crc >> 8) ^ b) & 0xFF];
    }
    return crc & 0xFFFF;
  }

  /// 构造发送帧: 0x1F 0x0F + addr + cmd + type + length + data + crc
  static Uint8List buildFrame(int addr, int cmd, int type, [List<int> data = const []]) {
    final len = data.length;
    final frame = Uint8List(6 + len + 2);
    frame[0] = 0x1F;
    frame[1] = 0x0F;
    frame[2] = addr & 0x0F;
    frame[3] = cmd & 0xFF;
    frame[4] = type & 0xFF;
    frame[5] = len & 0xFF;
    for (var i = 0; i < len; i++) {
      frame[6 + i] = data[i] & 0xFF;
    }
    final crc = crcCalc(frame.sublist(0, 6 + len));
    frame[6 + len] = (crc >> 8) & 0xFF;
    frame[6 + len + 1] = crc & 0xFF;
    return frame;
  }

  /// Uint8List 转十六进制字符串
  static String hexString(Uint8List d) =>
      d.map((b) => b.toRadixString(16).padLeft(2, '0').toUpperCase()).join(' ');

  static int _bytesToInt(Uint8List frame, int offset, int len) {
    int v = 0;
    for (var i = 0; i < len && (offset + i) < frame.length; i++) {
      v |= frame[offset + i] << (8 * i);
    }
    return v;
  }

  static String _transportName(int t) {
    switch (t) {
      case SerialPortTransport.usb: return 'USB';
      case SerialPortTransport.bluetooth: return 'Bluetooth';
      case SerialPortTransport.native: return 'Native';
      default: return 'Unknown';
    }
  }
}
```
