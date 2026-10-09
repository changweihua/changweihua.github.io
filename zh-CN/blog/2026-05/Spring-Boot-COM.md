---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 中实现 COM 口数据监听
description: 结合多线程处理并解析十六进制数据
date: 2026-05-21 11:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在 Spring Boot 中实现 COM 口数据监听并解析十六进制数据，结合多线程处理，可通过以下步骤实现：

## 一、依赖配置 ##

在 `pom.xml` 中添加串口通信库 ​*​RXTXcomm*​​：

```xml
<dependency>
    <groupId>org.rxtx</groupId>
    <artifactId>rxtx</artifactId>
    <version>2.2pre2</version>
</dependency>
```

## 二、串口配置类 ##

创建串口参数配置类，定义波特率、数据位等参数：

```java
public class SerialConfig {
    private String portName = "COM3";  // 串口号
    private int baudRate = 9600;       // 波特率
    private int dataBits = 8;          // 数据位
    private int stopBits = 1;          // 停止位
    private int parity = SerialPort.PARITY_NONE; // 校验位

    // Getters and Setters
}
```

## 三、多线程串口监听实现 ##

### 串口服务类（使用 `@Async` 异步处理） ###

```java
@Service
public class SerialPortListener {

    @Autowired
    private SerialConfig config;

    private SerialPort serialPort;
    private ExecutorService executor = Executors.newFixedThreadPool(5); // 线程池

    @PostConstruct
    public void init() throws Exception {
        CommPortIdentifier portIdentifier = CommPortIdentifier.getPortIdentifier(config.getPortName());
        if (portIdentifier.isCurrentlyOwned()) {
            throw new RuntimeException("串口被占用");
        }
        CommPort commPort = portIdentifier.open(this.getClass().getName(), 2000);
        if (commPort instanceof SerialPort) {
            serialPort = (SerialPort) commPort;
            serialPort.setSerialPortParams(
                config.getBaudRate(),
                config.getDataBits(),
                config.getStopBits(),
                config.getParity()
            );
            serialPort.addEventListener(new SerialReader());
            serialPort.notifyOnDataAvailable(true);
        }
    }

    // 异步处理接收数据
    private class SerialReader implements SerialPortEventListener {
        @Override
        @Async("serialTaskExecutor") // 指定自定义线程池
        public void serialEvent(SerialPortEvent event) {
            if (event.getEventType() == SerialPortEvent.DATA_AVAILABLE) {
                try (InputStream in = serialPort.getInputStream()) {
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = in.read(buffer)) > 0) {
                        byte[] data = Arrays.copyOf(buffer, len);
                        executor.submit(() -> processData(data)); // 多线程处理
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 十六进制解析方法
    private void processData(byte[] data) {
        String hexString = bytesToHex(data);
        System.out.println("接收数据（Hex）: " + hexString);
        // 在此添加业务逻辑（如校验、协议解析等）
    }

    // 字节数组转十六进制字符串
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X ", b));
        }
        return sb.toString().trim();
    }

    @PreDestroy
    public void close() {
        if (serialPort != null) {
            serialPort.close();
        }
    }
}
```

### 自定义线程池配置 ###

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "serialTaskExecutor")
    public Executor serialTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);    // 核心线程数
        executor.setMaxPoolSize(10);     // 最大线程数
        executor.setQueueCapacity(100);  // 队列容量
        executor.setThreadNamePrefix("Serial-Thread-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

## 四、关键实现原理 ##

### ​​事件驱动模型​​ ###

通过 `SerialPortEventListener` 监听 `DATA_AVAILABLE` 事件，避免轮询带来的性能损耗。

### ​​多线程处理​​ ###

- 使用 `@Async` 注解将数据处理逻辑异步化
- 自定义线程池 `serialTaskExecutor` 控制并发量，防止资源耗尽

### ​​十六进制解析 ###
​​
通过 `String.format("%02X ", b)` 将字节转为标准十六进制字符串，保留空格分隔符便于阅读。

## 五、使用示例 ##

```java
@RestController
public class SerialController {

    @Autowired
    private SerialPortListener listener;

    @GetMapping("/start")
    public String startListening() {
        return "COM监听已启动";
    }

    @GetMapping("/hex-data")
    public String getLatestHexData() {
        // 此处可添加数据缓存逻辑
        return "最新数据需通过异步回调获取";
    }
}
```

## 六、注意事项 ##

### ​​依赖冲突​​ ###

确保 `rxtxSerial.dll`（Windows）或 `librxtxSerial.so`（Linux）存在于 JVM 的 bin 目录下。

### ​​线程安全​​ ###

若需共享数据，使用 `ConcurrentLinkedQueue` 或 `BlockingQueue` 保证线程安全。

### ​​异常处理​​ ###

添加 `try-catch` 块捕获 `PortInUseException`、`UnsupportedCommOperationException` 等异常。

### ​​性能优化​​ ###

- 调整串口缓冲区大小：`serialPort.setInputBufferSize`(4096)
- 使用 DMA 模式减少 CPU 占用（需硬件支持）

## 七、扩展功能 ##

### ​​协议解析​​ ###

添加 MODBUS、自定义二进制协议等解析逻辑：

```java
private void parseModbus(byte[] data) {
    // 解析从站地址、功能码、数据区等
}
```

### ​​数据持久化​​ ###

结合数据库或消息队列（如 Kafka）存储解析后的数据：

```java
@Autowired
private KafkaTemplate<String, String> kafkaTemplate;

private void saveToKafka(String hexData) {
    kafkaTemplate.send("serial-data-topic", hexData);
}
```

### ​​心跳检测​​ ###

定时发送检测命令验证设备在线状态：

```java
@Scheduled(fixedRate = 5000)
public void sendHeartbeat() {
    byte[] cmd = hexStringToBytes("01 03 00 00 00 01 84 0A");
    serialPort.getOutputStream().write(cmd);
}
```

通过上述方案，可实现高效稳定的 COM 口数据监听与处理，适用于工业控制、物联网设备通信等场景。
