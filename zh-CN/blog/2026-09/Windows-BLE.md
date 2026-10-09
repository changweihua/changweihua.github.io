---
lastUpdated: true
commentabled: true
recommended: true
title: Windows BLE 开发指南
description: Windows BLE 开发指南（Rust windows-rs)
date: 2026-09-08 13:55:00
pageClass: blog-page-class
cover: /covers/rust.svg
---


本演示在 Windows 平台使用 Rust 的 windows-rs 库进行 BLE（低功耗蓝牙）开发：扫描设备、连接与服务发现、选择特征、启用通知（CCCD）、发送与接收数据、断开与清理，同时给出“已配对设备重启”场景的稳态策略

## 依赖与准备 ##

在 `Cargo.toml` 添加依赖：

```ini
[dependencies]
windows = "0.56"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
uuid = "1"
```

常用导入（放在你的模块或文件顶部）：

```rust
use windows::{
    core::Result as WinResult,
    Devices::Bluetooth::Advertisement::{
        BluetoothLEAdvertisementWatcher, BluetoothLEAdvertisementReceivedEventArgs,
    },
    Devices::Bluetooth::{BluetoothLEDevice, BluetoothConnectionStatus},
    Devices::Bluetooth::GenericAttributeProfile::{
        GattDeviceService, GattCharacteristic, GattCharacteristicProperties,
        GattClientCharacteristicConfigurationDescriptorValue, GattCommunicationStatus,
        GattValueChangedEventArgs, GattProtectionLevel,
    },
    Devices::Enumeration::{
        DeviceInformationCustomPairing, DevicePairingKinds, DevicePairingRequestedEventArgs,
        DevicePairingResultStatus,
    },
    Foundation::TypedEventHandler,
    Storage::Streams::DataReader,
};
```

辅助函数：UUID 字符串转 Windows GUID：

```rust
fn guid_from_str(s: &str) -> windows::core::GUID {
    let u = uuid::Uuid::parse_str(s).expect("uuid parse error");
    let (d1, d2, d3, d4) = u.as_fields();
    windows::core::GUID::from_values(d1, d2, d3, *d4)
}
```

## 扫描与筛选设备 ##

扫描 5 秒并返回设备列表（MAC 为 12 位十六进制字符串）：

```rust
#[derive(Debug, Clone)]
struct BleDevice { mac: String, name: String, rssi: Option<i16> }

async fn scan_devices(timeout_ms: u64) -> Vec<BleDevice> {
    use std::{collections::HashMap, sync::Arc, time::Duration};
    use tokio::sync::Mutex as AsyncMutex; // 广播事件是异步回调，这里用异步互斥保护聚合表

    // address→设备信息 聚合表（Windows 提供 64 位地址，不是文本 MAC）
    let map = Arc::new(AsyncMutex::new(HashMap::<u64, BleDevice>::new()));
    let watcher = BluetoothLEAdvertisementWatcher::new().unwrap(); // 创建广播监听器
    let map_cb = map.clone();
    // 注册 Received 事件：每条广播提取地址/名称/RSSI 并写入聚合表
    let _token = watcher.Received(&TypedEventHandler::new(
        move |_sender: &Option<BluetoothLEAdvertisementWatcher>, args: &Option<BluetoothLEAdvertisementReceivedEventArgs>| -> WinResult<()> {
            if let Some(args) = args.as_ref() {
                let addr = args.BluetoothAddress()?; // 64 位地址（数值）
                let mac = format!( // 转为 12 位十六进制字符串，便于统一筛选
                    "{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
                    (addr >> 40) & 0xff, (addr >> 32) & 0xff, (addr >> 24) & 0xff,
                    (addr >> 16) & 0xff, (addr >> 8) & 0xff, addr & 0xff
                );
                let name = args.Advertisement()?.LocalName()?.to_string(); // 本地名（可能空）
                let rssi = args.RawSignalStrengthInDBm()?; // 信号强度（dBm）
                if let Ok(mut m) = map_cb.try_lock() { // 非阻塞写入，避免回调卡住
                    m.entry(addr).and_modify(|d| { if d.name.is_empty() && !name.is_empty() { d.name = name.clone(); } d.rssi = Some(rssi); })
                        .or_insert(BleDevice { mac, name, rssi: Some(rssi) });
                }
            }
            Ok(())
        }
    )).unwrap();
    watcher.Start().unwrap(); // 开始监听广播
    tokio::time::sleep(Duration::from_millis(timeout_ms)).await;
    watcher.Stop().unwrap(); // 停止监听
    let locked = map.lock().await; // 收敛为列表
    let mut list: Vec<_> = locked.values().cloned().filter(|d| !d.name.is_empty()).collect();
    list.sort_by_key(|d| d.mac.clone());
    list
}

async fn filter_device(mac: &str, list: Vec<BleDevice>) -> Option<BleDevice> {
    // 支持 "AA:BB:..." 或无分隔符/大小写不一致的输入
    let mut s = mac.replace(":", "").replace('-', "").to_lowercase();
    if s.len() != 12 || s.chars().any(|c| !c.is_ascii_hexdigit()) {
        if let Ok(addr_hex) = u64::from_str_radix(&s, 16) { s = format!("{:012x}", addr_hex); }
        else if let Ok(addr_dec) = s.parse::<u64>() { s = format!("{:012x}", addr_dec); }
    }
    list.into_iter().find(|d| d.mac == s)
}
```

*为什么这么做*：

- Windows 广播提供的是数值地址，统一转为 12 位十六进制更利于设备筛选与日志定位。
- 事件回调中尽量使用 `try_lock`，避免广播高频导致锁争用。

*常见坑*：

- 某些设备广播不带本地名，需允许空名称并在后续才筛掉。
- 扫描过短可能错过目标设备；根据场景调整 `timeout_ms`。

## 连接与服务发现 ##

```rust
async fn connect_and_list_services(device: &BleDevice) -> BluetoothLEDevice {
    let addr = u64::from_str_radix(&device.mac.replace(":", "").to_lowercase(), 16).unwrap(); // 文本 MAC → 数值地址
    let dev = BluetoothLEDevice::FromBluetoothAddressAsync(addr).unwrap().await.unwrap(); // WinRT 异步获取设备对象
    // 等待连接就绪：避免紧接着读服务/写 CCCD 命中未连接状态
    for _ in 0..10 {
        if dev.ConnectionStatus().unwrap() == BluetoothConnectionStatus::Connected { break; }
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
    }
    // 列出服务（可选）：用于确认目标服务是否存在与刷新完成
    let services = dev.GetGattServicesAsync().unwrap().await.unwrap();
    if services.Status().unwrap() == GattCommunicationStatus::Success {
        let list = services.Services().unwrap();
        for s in list.into_iter() { println!("service uuid {:?}", s.Uuid().unwrap()); }
    }
    dev
}
```

某些设备在建立物理连接后，需要数百毫秒才进入 `Connected`；过早操作常导致不可达或读空服务。

*常见坑*：

- 忽略连接就绪轮询会触发后续“Unreachable”或启用通知中止（E_ABORT）。

## 特征选择（通知/写入） ##

按 GUID 过滤，否则枚举回退，并根据属性判定：

```rust
async fn select_notify(service: &GattDeviceService, guid: windows::core::GUID) -> Option<GattCharacteristic> {
    let res = service.GetCharacteristicsForUuidAsync(guid).unwrap().await.unwrap();
    if res.Status().unwrap() == GattCommunicationStatus::Success {
        let list = res.Characteristics().unwrap();
        for c in list.into_iter() {
            let props = c.CharacteristicProperties().unwrap(); // 判定具备 Notify 或 Indicate
            let ok = (props.0 & GattCharacteristicProperties::Notify.0) != 0 || (props.0 & GattCharacteristicProperties::Indicate.0) != 0;
            if ok { return Some(c); }
        }
    }
    // GUID 过滤失败时，枚举全部特征并匹配 GUID
    let all = service.GetCharacteristicsAsync().unwrap().await.unwrap().Characteristics().unwrap();
    for c in all.into_iter() { if c.Uuid().unwrap() == guid { return Some(c); } }
    None
}

async fn select_write(service: &GattDeviceService, guid: windows::core::GUID) -> Option<GattCharacteristic> {
    let res = service.GetCharacteristicsForUuidAsync(guid).unwrap().await.unwrap();
    if res.Status().unwrap() == GattCommunicationStatus::Success {
        let list = res.Characteristics().unwrap();
        for c in list.into_iter() {
            let p = c.CharacteristicProperties().unwrap(); // 判定具备 Write 或 WriteWithoutResponse
            let ok = (p.0 & GattCharacteristicProperties::Write.0) != 0 || (p.0 & GattCharacteristicProperties::WriteWithoutResponse.0) != 0;
            if ok { return Some(c); }
        }
    }
    let all = service.GetCharacteristicsAsync().unwrap().await.unwrap().Characteristics().unwrap();
    for c in all.into_iter() { if c.Uuid().unwrap() == guid { return Some(c); } }
    None
}
```

设备端在刷新期间可能返回空列表，枚举回退能避免漏选；属性判定可避免误选不可用特征。

*常见坑*：

- 仅按 GUID 命中但属性不满足（无 Notify/Write），后续启用或写入会失败。

## 启用通知（CCCD）与回调注册 ##

```rust
async fn enable_notify_with_retry(ch: &GattCharacteristic) -> bool {
    tokio::time::sleep(std::time::Duration::from_millis(1000)).await; // 预延时，避开设备忙/栈刷新
    for _ in 0..3 {
        if let Ok(op) = ch.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::Notify) {
            if let Ok(status) = op.await { if status == GattCommunicationStatus::Success { return true; } } // 首选 Notify
        }
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
    for _ in 0..2 {
        if let Ok(op) = ch.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::Indicate) {
            if let Ok(status) = op.await { if status == GattCommunicationStatus::Success { return true; } } // 回退 Indicate
        }
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
    false
}

fn register_value_changed(ch: &GattCharacteristic, mut on_notify: impl FnMut(Vec<u8>) + Send + 'static) {
    let handler = TypedEventHandler::<GattCharacteristic, GattValueChangedEventArgs>::new(
        move |_sender: &Option<GattCharacteristic>, args: &Option<GattValueChangedEventArgs>| {
            if let Some(args) = args.as_ref() {
                if let Ok(buf) = args.CharacteristicValue() {
                    if let Ok(reader) = DataReader::FromBuffer(&buf) { // IBuffer → Vec<u8>
                        if let Ok(len) = buf.Length() {
                            let mut data = vec![0u8; len as usize];
                            let _ = reader.ReadBytes(&mut data);
                            on_notify(data);
                        }
                    }
                }
            }
            Ok(())
        }
    );
    let _ = ch.ValueChanged(&handler);
}
```

- `Notify` 不需要 `ACK`，实时性好；设备只支持 `Indicate` 时需回退。
- `IBuffer` 转字节后交给上层解析，避免 `WinRT` 读取阻塞。

*常见坑*：

- 启用通知过早会被中止（`E_ABORT`）；加延时与重试能显著降低概率。

## 写入（带响应优先，失败回退无响应） ##

```rust
async fn write_with_result_and_fallback(ch: &GattCharacteristic, data: &[u8]) -> GattCommunicationStatus {
    use windows::Storage::Streams::{InMemoryRandomAccessStream, DataWriter};
    let stream = InMemoryRandomAccessStream::new().unwrap(); // 构造内存流
    let out = stream.GetOutputStreamAt(0).unwrap(); // 取输出流
    let writer = DataWriter::CreateDataWriter(&out).unwrap(); // 创建写入器
    writer.WriteBytes(data).unwrap(); // 写入字节
    let buf = writer.DetachBuffer().unwrap(); // 拆出 IBuffer

    let res = ch.WriteValueWithResultAsync(&buf).unwrap().await.unwrap(); // 带响应写入
    let status = res.Status().unwrap(); // 读取通信状态（可结合 ProtocolError 定位 ATT 错误）
    if status != GattCommunicationStatus::Success {
        let fb = ch.WriteValueAsync(&buf).unwrap().await.unwrap(); // 回退：无响应写入
        return fb;
    }
    status
}
```

*为什么这么做*：

- 带响应写可获 ATT 错码（权限/长度/不允许等）；设备仅支持无响应写时自动回退。

*常见坑*：

- 未加密/未配对时常见 `Insufficient Authentication`；需先建立加密会话。

## 断开与清理（顺序至关重要） ##

```ts
async fn disconnect_cleanup(dev: &BluetoothLEDevice, notify_char: &GattCharacteristic, token: windows::Foundation::EventRegistrationToken) {
    let _ = notify_char.RemoveValueChanged(token); // 先移除通知事件，避免回调残留
    if let Ok(op) = notify_char.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::None) { let _ = op.await; } // 关闭订阅（CCCD=None）
    if let Ok(svc) = notify_char.Service() { if let Ok(sess) = svc.Session() { let _ = sess.SetMaintainConnection(false); } } // 取消保持连接
    let _ = dev.Close(); // 关闭设备句柄
}
```

- 不正确的清理顺序会导致下次连接启用通知失败或会话不可达。

*常见坑*：

- 忘记 `RemoveValueChanged` 导致 `ValueChanged` 持有对象，写入 `None` 时报错。

## 已配对设备重启的稳态策略（清理 + 重试） ##

设备已在系统层“配对且连接”，当设备重启进入配对模式时，Windows 保留旧连接/GATT 缓存，常见错误：

- `“notify characteristic not found”`
- `“enable notify/indicate failed”` 或 `E_ABORT（0x80004004）`

*建议在连接前执行 OS 级清理*：

```rust
async fn unpair_and_close(address: u64) {
    let dev = BluetoothLEDevice::FromBluetoothAddressAsync(address).unwrap().await.unwrap();
    if let Ok(di) = dev.DeviceInformation() {
        if let Ok(pairing) = di.Pairing() {
            if pairing.IsPaired().unwrap_or(false) {
                let _ = pairing.UnpairAsync().unwrap().await;
            }
        }
    }
    let _ = dev.Close();
    tokio::time::sleep(std::time::Duration::from_millis(800)).await;
}
```

随后再进行连接、服务发现、特征选择与 CCCD 启用，并在各步骤加入适度延时与重试。

## 组合示例：连接→订阅→发送→接收→断开 ##

```rust
#[tokio::main]
async fn main() {
    let list = scan_devices(5000).await;
    let dev = filter_device("208B37997529", list).expect("device not found");

    let addr = u64::from_str_radix(&dev.mac, 16).unwrap();
    unpair_and_close(addr).await; // 已配对场景建议先清理

    let device = connect_and_list_services(&dev).await;
    let service = {
        let guid = guid_from_str("01000100-0000-1000-8000-009078563412");
        let list = device.GetGattServicesAsync().unwrap().await.unwrap().Services().unwrap();
        list.into_iter().find(|s| s.Uuid().unwrap() == guid).expect("service not found")
    };

    tokio::time::sleep(std::time::Duration::from_millis(800)).await;
    let notify = select_notify(&service, guid_from_str("02000200-0000-1000-8000-009178563412")).expect("notify not found");
    let writec = select_write(&service, guid_from_str("03000300-0000-1000-8000-009278563412")).expect("write not found");

    let _ = notify.SetProtectionLevel(GattProtectionLevel::EncryptionRequired);
    let _ = writec.SetProtectionLevel(GattProtectionLevel::EncryptionRequired);

    if !enable_notify_with_retry(&notify).await { panic!("enable notify failed"); }
    register_value_changed(&notify, |data| { println!("notify: {} bytes", data.len()); });

    let payload = b"example payload";
    let status = write_with_result_and_fallback(&writec, payload).await;
    println!("write status: {:?}", status);

    // 清理
    // 注意：真实项目中保存 ValueChanged 注册的 token，并在断开时传入
    let dummy_token = windows::Foundation::EventRegistrationToken { value: 0 };
    disconnect_cleanup(&device, &notify, dummy_token).await;
}
```

## 故障排查与最佳实践 ##

- WinRT await 与并发：将涉及 WinRT await 的代码放到阻塞线程或在当前线程执行，避免 Send 约束问题
- 连接就绪：轮询 `BluetoothConnectionStatus::Connected` 再进行特征与 CCCD 操作
- 特征与 CCCD：获取服务后延时、特征选择重试；CCCD 启用延时、Notify→Indicate 回退；必要时重新抓取一次特征再启用
- 已配对设备重启：务必先执行 UnpairAsync + Close + 延时 再连接，显著降低缓存不一致导致的失败
- 断开顺序：移除事件→CCCD=None→取消保持连接→Close 设备；不当的顺序会让下次连接启用通知失败

## 小结 ##

本文给出了一套完整的、可直接复制的 Windows BLE 开发代码片段与操作步骤，涵盖扫描、连接与服务发现、特征选择、启用通知、写入与接收、断开清理，以及已配对设备重启场景的稳态策略。将这些片段按需组合，即可搭建稳定的 BLE 通信链路。

## 带详注的代码片段（逐行说明） ##

### 扫描与筛选（详注版） ###

```rust
use windows::{
    core::Result as WinResult,
    Devices::Bluetooth::Advertisement::{
        BluetoothLEAdvertisementWatcher, BluetoothLEAdvertisementReceivedEventArgs,
    },
    Foundation::TypedEventHandler,
};
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::sync::Mutex as AsyncMutex;

#[derive(Debug, Clone)]
struct BleDevice { mac: String, name: String, rssi: Option<i16> }

// 扫描指定时长，聚合设备到列表
async fn scan_devices(timeout_ms: u64) -> Vec<BleDevice> {
    // 使用共享 HashMap 聚合：Windows 广播给出的是 64 位地址（非文本 MAC）
    let map = Arc::new(AsyncMutex::new(HashMap::<u64, BleDevice>::new()));

    // 创建广播监听器
    let watcher = BluetoothLEAdvertisementWatcher::new().unwrap();
    let map_cb = map.clone();

    // 注册接收事件：每条广播中提取地址、设备名与 RSSI
    let _token = watcher.Received(&TypedEventHandler::new(
        move |_sender: &Option<BluetoothLEAdvertisementWatcher>, args: &Option<BluetoothLEAdvertisementReceivedEventArgs>| -> WinResult<()> {
            if let Some(args) = args.as_ref() {
                // 设备地址为 64 位整型，转为 12 位十六进制字符串（不含分隔符）
                let addr = args.BluetoothAddress()?;
                let mac = format!(
                    "{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
                    (addr >> 40) & 0xff, (addr >> 32) & 0xff, (addr >> 24) & 0xff,
                    (addr >> 16) & 0xff, (addr >> 8) & 0xff, addr & 0xff
                );
                // 广告包中的本地名
                let name = args.Advertisement()?.LocalName()?.to_string();
                // 信号强度（可能不存在）
                let rssi = args.RawSignalStrengthInDBm()?;

                // 聚合到共享表：若已有记录则更新更有价值的信息（非空名称、最新 RSSI）
                if let Ok(mut m) = map_cb.try_lock() {
                    m.entry(addr)
                        .and_modify(|d| { if d.name.is_empty() && !name.is_empty() { d.name = name.clone(); } d.rssi = Some(rssi); })
                        .or_insert(BleDevice { mac, name, rssi: Some(rssi) });
                }
            }
            Ok(())
        }
    )).unwrap();

    // 开始监听指定时间窗口
    watcher.Start().unwrap();
    tokio::time::sleep(Duration::from_millis(timeout_ms)).await;
    watcher.Stop().unwrap();

    // 收敛为列表并按 MAC 排序，过滤空名称
    let locked = map.lock().await;
    let mut list: Vec<_> = locked.values().cloned().filter(|d| !d.name.is_empty()).collect();
    list.sort_by_key(|d| d.mac.clone());
    list
}

// 按 MAC 文本筛选设备：支持去分隔符与大小写统一，兼容十六/十进制
async fn filter_device(mac: &str, list: Vec<BleDevice>) -> Option<BleDevice> {
    let mut s = mac.replace(":", "").replace('-', "").to_lowercase();
    if s.len() != 12 || s.chars().any(|c| !c.is_ascii_hexdigit()) {
        if let Ok(addr_hex) = u64::from_str_radix(&s, 16) { s = format!("{:012x}", addr_hex); }
        else if let Ok(addr_dec) = s.parse::<u64>() { s = format!("{:012x}", addr_dec); }
    }
    list.into_iter().find(|d| d.mac == s)
}
```

### 连接与服务发现（详注版） ###

```rust
use windows::Devices::Bluetooth::{BluetoothLEDevice, BluetoothConnectionStatus};
use windows::Devices::Bluetooth::GenericAttributeProfile::{GattCommunicationStatus};

// 建立到设备的连接，并打印服务列表（用于诊断）
async fn connect_and_list_services(device: &BleDevice) -> BluetoothLEDevice {
    // 文本 MAC → 64 位地址（十六进制解析）
    let addr = u64::from_str_radix(&device.mac.replace(":", "").to_lowercase(), 16).unwrap();
    // 异步获取设备对象（WinRT）
    let dev = BluetoothLEDevice::FromBluetoothAddressAsync(addr).unwrap().await.unwrap();

    // 连接就绪等待：部分设备需要一点时间进入 Connected 状态
    for _ in 0..10 {
        if dev.ConnectionStatus().unwrap() == BluetoothConnectionStatus::Connected { break; }
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
    }

    // 枚举 GATT 服务并打印 UUID（便于确认服务是否刷新与存在）
    let services = dev.GetGattServicesAsync().unwrap().await.unwrap();
    if services.Status().unwrap() == GattCommunicationStatus::Success {
        let list = services.Services().unwrap();
        for s in list.into_iter() { println!("service uuid {:?}", s.Uuid().unwrap()); }
    }
    dev
}
```

### 特征选择（详注版） ###

```rust
use windows::Devices::Bluetooth::GenericAttributeProfile::{
    GattDeviceService, GattCharacteristic, GattCharacteristicProperties, GattCommunicationStatus,
};

// 选择通知特征：先 GUID 过滤 + 按属性检查；失败枚举全部回退
async fn select_notify(service: &GattDeviceService, guid: windows::core::GUID) -> Option<GattCharacteristic> {
    let res = service.GetCharacteristicsForUuidAsync(guid).unwrap().await.unwrap();
    if res.Status().unwrap() == GattCommunicationStatus::Success {
        let list = res.Characteristics().unwrap();
        for c in list.into_iter() {
            let props = c.CharacteristicProperties().unwrap();
            let ok = (props.0 & GattCharacteristicProperties::Notify.0) != 0 || (props.0 & GattCharacteristicProperties::Indicate.0) != 0;
            if ok { return Some(c); }
        }
    }
    // 枚举回退：某些设备在刷新期间 GUID 过滤可能返回空
    let all = service.GetCharacteristicsAsync().unwrap().await.unwrap().Characteristics().unwrap();
    for c in all.into_iter() { if c.Uuid().unwrap() == guid { return Some(c); } }
    None
}

// 选择写特征：同理，需具备 Write 或 WriteWithoutResponse 属性
async fn select_write(service: &GattDeviceService, guid: windows::core::GUID) -> Option<GattCharacteristic> {
    let res = service.GetCharacteristicsForUuidAsync(guid).unwrap().await.unwrap();
    if res.Status().unwrap() == GattCommunicationStatus::Success {
        let list = res.Characteristics().unwrap();
        for c in list.into_iter() {
            let p = c.CharacteristicProperties().unwrap();
            let ok = (p.0 & GattCharacteristicProperties::Write.0) != 0 || (p.0 & GattCharacteristicProperties::WriteWithoutResponse.0) != 0;
            if ok { return Some(c); }
        }
    }
    let all = service.GetCharacteristicsAsync().unwrap().await.unwrap().Characteristics().unwrap();
    for c in all.into_iter() { if c.Uuid().unwrap() == guid { return Some(c); } }
    None
}
```

### 启用通知与注册回调（详注版） ###

```rust
use windows::Devices::Bluetooth::GenericAttributeProfile::{
    GattCharacteristic, GattClientCharacteristicConfigurationDescriptorValue, GattCommunicationStatus,
};
use windows::Devices::Bluetooth::GenericAttributeProfile::{GattValueChangedEventArgs};
use windows::Storage::Streams::DataReader;
use windows::Foundation::TypedEventHandler;

// 启用通知：优先 Notify，失败回退 Indicate；加入预延时与重试以跨过设备刷新窗口
async fn enable_notify_with_retry(ch: &GattCharacteristic) -> bool {
    // 预延时：避免立即写 CCCD 命中设备忙或栈刷新
    tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
    // 尝试 Notify 多次
    for _ in 0..3 {
        if let Ok(op) = ch.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::Notify) {
            if let Ok(status) = op.await { if status == GattCommunicationStatus::Success { return true; } }
        }
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
    // 回退 Indicate
    for _ in 0..2 {
        if let Ok(op) = ch.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::Indicate) {
            if let Ok(status) = op.await { if status == GattCommunicationStatus::Success { return true; } }
        }
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
    false
}

// 注册通知回调：将 IBuffer 转为 Vec<u8> 并交给调用者处理
fn register_value_changed(ch: &GattCharacteristic, mut on_notify: impl FnMut(Vec<u8>) + Send + 'static) {
    let handler = TypedEventHandler::<GattCharacteristic, GattValueChangedEventArgs>::new(
        move |_sender: &Option<GattCharacteristic>, args: &Option<GattValueChangedEventArgs>| {
            if let Some(args) = args.as_ref() {
                if let Ok(buf) = args.CharacteristicValue() {
                    if let Ok(reader) = DataReader::FromBuffer(&buf) {
                        if let Ok(len) = buf.Length() {
                            let mut data = vec![0u8; len as usize];
                            let _ = reader.ReadBytes(&mut data);
                            on_notify(data);
                        }
                    }
                }
            }
            Ok(())
        }
    );
    let _ = ch.ValueChanged(&handler);
}
```

### 写入（详注版） ###

```rust
use windows::Devices::Bluetooth::GenericAttributeProfile::{GattCharacteristic, GattCommunicationStatus};
use windows::Storage::Streams::{InMemoryRandomAccessStream, DataWriter};

// 写入封装：优先带响应写入（便于获取协议错误），失败回退无响应
async fn write_with_result_and_fallback(ch: &GattCharacteristic, data: &[u8]) -> GattCommunicationStatus {
    // WinRT 写入 API 需要 IBuffer；这里通过内存流 + DataWriter 构造缓冲区
    let stream = InMemoryRandomAccessStream::new().unwrap();
    let out = stream.GetOutputStreamAt(0).unwrap();
    let writer = DataWriter::CreateDataWriter(&out).unwrap();
    writer.WriteBytes(data).unwrap();
    let buf = writer.DetachBuffer().unwrap();

    // 带响应写入：可读取状态与协议错误码（ATT），便于定位权限或长度问题
    let res = ch.WriteValueWithResultAsync(&buf).unwrap().await.unwrap();
    let status = res.Status().unwrap();
    if status != GattCommunicationStatus::Success {
        // 回退为无响应写：部分设备仅允许无响应写
        let fb = ch.WriteValueAsync(&buf).unwrap().await.unwrap();
        return fb;
    }
    status
}
```

### 断开与清理（详注版） ###

```rust
use windows::Devices::Bluetooth::BluetoothLEDevice;
use windows::Devices::Bluetooth::GenericAttributeProfile::{GattCharacteristic, GattClientCharacteristicConfigurationDescriptorValue};

// 断开顺序：RemoveValueChanged → CCCD=None → MaintainConnection(false) → Close
async fn disconnect_cleanup(dev: &BluetoothLEDevice, notify_char: &GattCharacteristic, token: windows::Foundation::EventRegistrationToken) {
    let _ = notify_char.RemoveValueChanged(token);
    if let Ok(op) = notify_char.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue::None) { let _ = op.await; }
    if let Ok(svc) = notify_char.Service() { if let Ok(sess) = svc.Session() { let _ = sess.SetMaintainConnection(false); } }
    let _ = dev.Close();
}
```

### 已配对设备重启的清理（详注版） ###

```rust
use windows::Devices::Bluetooth::BluetoothLEDevice;

// 在已配对且系统持有旧连接的情况下：先 Unpair + Close 再连接，降低缓存不一致导致的失败
async fn unpair_and_close(address: u64) {
    let dev = BluetoothLEDevice::FromBluetoothAddressAsync(address).unwrap().await.unwrap();
    if let Ok(di) = dev.DeviceInformation() {
        if let Ok(pairing) = di.Pairing() {
            if pairing.IsPaired().unwrap_or(false) {
                let _ = pairing.UnpairAsync().unwrap().await; // 解除配对，释放旧权限与密钥
            }
        }
    }
    let _ = dev.Close(); // 关闭旧设备句柄
    tokio::time::sleep(std::time::Duration::from_millis(800)).await; // 等待栈刷新
}
```

### 组合流程（详注版） ###

```rust
#[tokio::main]
async fn main() {
    // 1) 扫描并选择目标设备
    let list = scan_devices(5000).await;
    let dev = filter_device("208B37997529", list).expect("device not found");

    // 2) 已配对场景建议先清理旧状态（Unpair + Close + 延时）
    let addr = u64::from_str_radix(&dev.mac, 16).unwrap();
    unpair_and_close(addr).await;

    // 3) 连接并输出服务列表（诊断用途）
    let device = connect_and_list_services(&dev).await;

    // 4) 获取目标服务（按 GUID 匹配）
    let service = {
        let guid = guid_from_str("01000100-0000-1000-8000-009078563412");
        let list = device.GetGattServicesAsync().unwrap().await.unwrap().Services().unwrap();
        list.into_iter().find(|s| s.Uuid().unwrap() == guid).expect("service not found")
    };

    // 5) 特征选择前短暂等待，随后选择通知与写特征
    tokio::time::sleep(std::time::Duration::from_millis(800)).await;
    let notify = select_notify(&service, guid_from_str("02000200-0000-1000-8000-009178563412")).expect("notify not found");
    let writec = select_write(&service, guid_from_str("03000300-0000-1000-8000-009278563412")).expect("write not found");

    // 6) 若设备要求加密，设置保护级别为加密
    let _ = notify.SetProtectionLevel(windows::Devices::Bluetooth::GenericAttributeProfile::GattProtectionLevel::EncryptionRequired);
    let _ = writec.SetProtectionLevel(windows::Devices::Bluetooth::GenericAttributeProfile::GattProtectionLevel::EncryptionRequired);

    // 7) 启用通知（带重试/回退），并注册通知回调
    if !enable_notify_with_retry(&notify).await { panic!("enable notify failed"); }
    register_value_changed(&notify, |data| { println!("notify: {} bytes", data.len()); });

    // 8) 写入示例负载（带响应优先，失败回退）
    let payload = b"example payload";
    let status = write_with_result_and_fallback(&writec, payload).await;
    println!("write status: {:?}", status);

    // 9) 断开与清理（真实项目中保存并传入 ValueChanged 的 token）
    let dummy_token = windows::Foundation::EventRegistrationToken { value: 0 };
    disconnect_cleanup(&device, &notify, dummy_token).await;
}
```
