---
lastUpdated: true
commentabled: true
recommended: true
title: Redis Stream —— 可靠消息队列
description: Redis 从入门到精通
date: 2026-06-18 13:35:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

List 做队列、Pub/Sub 做广播，但它们都有一个硬伤：消息可靠性不足。List 弹出的消息就没了，客户端崩溃则消息丢失；Pub/Sub 干脆不持久化，订阅者不在线时消息直接蒸发。对于订单处理、异步任务、日志收集这类不能丢消息的场景，需要的是可靠消息队列。

Redis 5.0 推出的 Stream 正是为此而生。它像 Kafka 一样支持消息持久化、消费者组、ACK 确认和消息回溯，又保持了 Redis 的简洁与高性能。本文将带你从命令到 Python 实战，用 Stream 构建一个真正生产可用的消息队列。

## Stream 是什么？为什么要用？

Stream 是 Redis 追加日志型数据结构，用于存储时间序列的消息。每条消息有一个全局唯一的 ID 和若干键值对。它的核心能力：

- 消息持久化：消息写入 Stream 后不会因消费者离线而丢失。

- 消费者组：同组消费者竞争消费同一条消息，实现负载均衡。

- ACK 确认：消费者处理完后发送 XACK，消息从“待确认”变为“已确认”。

- 消息回溯：可以按 ID 重新消费历史消息，不会像 List 一样弹出即销毁。

- 阻塞读取：XREAD 可阻塞等待新消息，避免空轮询。

对比其他队列方案：_一句话总结：要可靠，上 Stream。_

## 核心命令速览

### 添加消息：XADD

```bash
127.0.0.1:6379> XADD orders * action create user_id 1001 amount 99.9
"1680000000000-0"
```

- `orders` 是 `Stream` 的 key。

- `*` 表示让 Redis 自动生成消息 ID（格式：`毫秒时间戳-序号`）。

- 后面跟着若干 `field-value` 对，构成了消息体。

- 返回自动生成的 ID。

可以手动指定 ID，但强烈建议用 `*` 自动生成，保证单调递增。

### 读取消息：XREAD

```bash
# 读取所有消息（从头开始）
127.0.0.1:6379> XREAD STREAMS orders 0-0
1) 1) "orders"
   2) 1) 1) "1680000000000-0"
         2) 1) "action"
            2) "create"
            3) "user_id"
            4) "1001"
            5) "amount"
            6) "99.9"

# 阻塞等待新消息（类似 BRPOP）
127.0.0.1:6379> XREAD BLOCK 5000 STREAMS orders $
(nil)   # 5秒内没有新消息，返回空
```

- `0-0` 表示从头读，`$` 表示只读最新（类似 tail -f）。

- `BLOCK` 毫秒数，0 表示永久阻塞。

### 消费者组与 XREADGROUP

Stream 可以创建多个消费者组，每组独立维护消费进度。同组内的消费者竞争消费，各自处理完后 ACK。

```bash
# 创建消费者组（从头部开始消费）
127.0.0.1:6379> XGROUP CREATE orders group1 0-0
OK

# 消费者 A 读取 group1 未确认的消息（> 表示从未消费过的新消息）
127.0.0.1:6379> XREADGROUP GROUP group1 consumerA COUNT 1 STREAMS orders >
1) 1) "orders"
   2) 1) 1) "1680000000000-0"
         2) 1) "action"
            2) "create"
            ...

# 确认消息处理完毕
127.0.0.1:6379> XACK orders group1 "1680000000000-0"
(integer) 1
```

- `>`：只返回从未投递给任何消费者组内成员的新消息。

- `XACK` 将消息标记为已处理，从待确认列表移除。

### 查看待处理消息：XPENDING

如果有消费者拿到消息后崩溃，消息会一直处于待确认状态，XPENDING 可以查看这些消息。

```bash
# 查看待处理消息概要
127.0.0.1:6379> XPENDING orders group1
1) (integer) 0   # 待确认消息数

# 如果消费者 A 挂掉，消息会显示在 pending 列表中：
127.0.0.1:6379> XPENDING orders group1 - + 10
(列出具体的待处理消息及其空闲时间)
```

### 消息转移：XCLAIM

当一个消费者长时间未 ACK（可能已死），可以由另一个消费者通过 `XCLAIM` 将消息“抢”过来处理。

```bash
127.0.0.1:6379> XCLAIM orders group1 consumerB 60000 "1680000000000-0"
```

把空闲超过 60000 毫秒的消息转交给 consumerB。

## Python 实战：订单处理系统

我们用 Stream 构建一个订单处理流水线：一个生产者发布订单，多个消费者组成消费组并行处理订单，处理失败的消息重试或转移。

### 环境准备

确保 Redis 版本 ≥ 5.0（Docker 镜像 `redis:7.2` 满足）。

### 生产者：发布订单

```py
import redis
import time
import json
import random

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

STREAM_KEY = 'orders'
GROUP_NAME = 'order_processors'

# 创建消费者组（如果不存在）
try:
    r.xgroup_create(STREAM_KEY, GROUP_NAME, id='0-0', mkstream=True)
    print(f'消费者组 {GROUP_NAME} 已创建')
except redis.exceptions.ResponseError as e:
    if 'BUSYGROUP' in str(e):
        print(f'消费者组 {GROUP_NAME} 已存在')
    else:
        raise

def publish_order(order_id, user_id, amount):
    """发布订单消息"""
    msg = {
        'order_id': order_id,
        'user_id': user_id,
        'amount': amount,
        'timestamp': time.time()
    }
    msg_id = r.xadd(STREAM_KEY, msg)
    print(f'[生产者] 发布订单 {order_id}: ID {msg_id}')
    return msg_id

# 模拟发布 10 个订单
for i in range(1, 11):
    publish_order(f'ORD-{1000+i}', random.randint(1, 100), round(random.uniform(10, 500), 2))
    time.sleep(0.5)
```

_输出示例_：

```txt
消费者组 order_processors 已存在
[生产者] 发布订单 ORD-1001: ID 1680000001234-0
[生产者] 发布订单 ORD-1002: ID 1680000001735-0
...
```

### 消费者：处理订单并 ACK

每个消费者从组中读取新消息，模拟处理（如扣减库存），成功后 ACK。

```py
def process_order(msg_id, msg_data):
    """模拟订单处理：成功返回 True，失败返回 False"""
    order_id = msg_data.get('order_id', 'unknown')
    amount = float(msg_data.get('amount', 0))
    print(f'[消费者] 处理订单 {order_id} 金额 {amount}')
    # 模拟处理：随机成功或失败（80% 成功）
    success = random.random() < 0.8
    if success:
        print(f'[消费者] 订单 {order_id} 处理成功')
    else:
        print(f'[消费者] 订单 {order_id} 处理失败！')
    return success

def start_consumer(consumer_name):
    """启动一个消费者，持续读取并处理消息"""
    print(f'[消费者 {consumer_name}] 启动')
    while True:
        try:
            # 读取新消息（>），每次最多 1 条，阻塞 2 秒
            result = r.xreadgroup(
                GROUP_NAME, consumer_name,
                {STREAM_KEY: '>'},
                count=1,
                block=2000
            )
            if not result:
                # 没有消息，尝试处理本消费者的 pending 消息
                pending = r.xpending(STREAM_KEY, GROUP_NAME)
                if pending['pending'] > 0:
                    # 读取自己的 pending 消息
                    pending_msgs = r.xpending_range(
                        STREAM_KEY, GROUP_NAME,
                        min='-', max='+', count=1,
                        consumername=consumer_name
                    )
                    if pending_msgs:
                        for p in pending_msgs:
                            msg_id = p['message_id']
                            # 重新获取消息内容
                            msgs = r.xrange(STREAM_KEY, min=msg_id, max=msg_id)
                            if msgs:
                                msg_data = msgs[0][1]
                                print(f'[消费者 {consumer_name}] 重试 pending 消息 {msg_id}')
                                if process_order(msg_id, msg_data):
                                    r.xack(STREAM_KEY, GROUP_NAME, msg_id)
                continue

            stream_name, messages = result[0]
            for msg_id, msg_data in messages:
                print(f'[消费者 {consumer_name}] 收到消息 {msg_id}')
                if process_order(msg_id, msg_data):
                    r.xack(STREAM_KEY, GROUP_NAME, msg_id)
                else:
                    # 处理失败，不 ACK，消息留在 pending 中
                    # 后续可以由 XCLAIM 转移或手动重试
                    pass
        except Exception as e:
            print(f'[消费者 {consumer_name}] 异常: {e}')
            time.sleep(1)

# 启动消费者
if __name__ == '__main__':
    import sys
    consumer_name = sys.argv[1] if len(sys.argv) > 1 else 'consumer-1'
    start_consumer(consumer_name)
```

_启动多个消费者终端_：

```
python consumer.py consumer-A &
python consumer.py consumer-B &
```

生产者发布消息后，消费者输出（示例）：

```txt
[消费者 consumer-A] 收到消息 1680000001234-0
[消费者] 处理订单 ORD-1001 金额 99.90
[消费者] 订单 ORD-1001 处理成功
[消费者 consumer-B] 收到消息 1680000001735-0
[消费者] 处理订单 ORD-1002 金额 250.00
[消费者] 订单 ORD-1002 处理失败！
```

注意：消息不会重复消费，A 和 B 竞争。

### 处理失败消息（死信队列与重试）

对于长时间 pending 的消息（消费者崩溃或处理失败），可以定时扫描，用 XCLAIM 转移给健康消费者，或超过最大重试次数后移入死信 Stream。

```py
def recover_pending(stream_key, group_name, idle_ms=60000, max_retries=3):
    """恢复空闲消息：将超时的 pending 消息转移给活跃消费者"""
    # 获取所有 pending 消息
    pending = r.xpending(stream_key, group_name)
    if pending['pending'] == 0:
        return

    # 获取空闲超过 idle_ms 的消息
    claimed = r.xpending_range(
        stream_key, group_name, min='-', max='+', count=10
    )
    for p in claimed:
        msg_id = p['message_id']
        # 检查重试次数（可存储在消息字段或额外 Redis key）
        msgs = r.xrange(stream_key, min=msg_id, max=msg_id)
        if not msgs:
            continue
        msg_data = msgs[0][1]
        retry_count = int(msg_data.get('retry', 0))
        if retry_count >= max_retries:
            # 移入死信队列
            r.xadd(f'{stream_key}:dead', msg_data)
            r.xack(stream_key, group_name, msg_id)
            r.xdel(stream_key, msg_id)
            print(f'消息 {msg_id} 超过重试次数，移入死信队列')
        elif p['time_since_delivered'] >= idle_ms:
            # XCLAIM 转移给恢复消费者
            r.xclaim(stream_key, group_name, 'recovery_consumer', idle_ms, msg_id)
            print(f'消息 {msg_id} 被 recovery_consumer 接管')

# 定时任务调用
while True:
    recover_pending('orders', 'order_processors', idle_ms=30000)
    time.sleep(10)
```

### 异步消费者（redis.asyncio）

在异步框架中，Stream 同样适用。

```py
import asyncio
import redis.asyncio as aioredis

async def async_consumer(consumer_name):
    r = await aioredis.from_url('redis://localhost', decode_responses=True)
    try:
        await r.xgroup_create('orders', 'async_group', id='0-0', mkstream=True)
    except:
        pass

    while True:
        result = await r.xreadgroup(
            'async_group', consumer_name,
            {'orders': '>'},
            count=1, block=2000
        )
        if result:
            for msg_id, msg_data in result[0][1]:
                print(f'[异步 {consumer_name}] 处理 {msg_id}')
                await r.xack('orders', 'async_group', msg_id)
        await asyncio.sleep(0.1)

asyncio.run(async_consumer('worker-1'))
```

## Stream 高级特性

- 消息裁剪：`XTRIM` 限制 Stream 长度，避免无限膨胀。`XADD ... MAXLEN ~ 1000` 近似裁剪。

- 消息范围查询：`XRANGE` / `XREVRANGE` 按 ID 范围查询历史消息。

- 消费组删除：`XGROUP DESTROY orders group1`。

- 监控：`XINFO STREAM orders` 查看 Stream 概览（长度、最后 ID 等）。

## 常见误区与最佳实践

- 别忘了 ACK：未 ACK 的消息会堆积在 pending 列表，占内存且影响消费进度。

- 合理设置 Stream 长度：历史消息会一直保存，用 `MAXLEN` 控制容量。

- 消费者组名全局唯一：不要把不同业务的消费组名重名。

- XREADGROUP 的 `>` 用法：`>` 是读取新消息，`0-0` 是读取历史，`具体 ID` 是读取未确认的。

- 死信队列：生产必须设计重试上限和死信转移，避免无限重试阻塞队列。

## 动手试试

- 搭建三消费者组：一个 Stream 创建两个消费者组 groupA 和 groupB，每个组各有两个消费者，验证同一条消息会被两个组独立消费，组内竞争消费。

- 模拟消费者崩溃：消费者读到消息后不 ACK，然后杀掉进程，用 `XPENDING` 和 `XCLAIM` 将消息转移给另一个消费者。

- 死信队列：实现一个最多重试 2 次的处理逻辑，超过后移入 `dead:orders` Stream，并定期巡检死信 Stream。

- 性能测试：生产者批量 XADD 10 万条消息，观察消费者组吞吐量，及 XINFO STREAM 长度变化。

> 预期效果：多组消费互不影响；崩溃消息自动转移；死信队列正确隔离失败消息；批量处理稳定。

## 总结

Redis Stream 把“可靠消息队列”集成到 Redis 内核中，具备持久化、消费者组、ACK、消息回溯等专业 MQ 的核心特性，且保持了 Redis 的简单与高性能。相比独立的 Kafka/RabbitMQ，它更适合中轻量级异步任务、事件驱动架构，且复用现有 Redis 基础设施，大幅降低运维成本。

掌握 Stream，你就拥有了在 Redis 生态中构建可靠消息管道的能力。下一篇，我们将进入性能调优，用慢日志、基准测试、大 Key 优化等手段，把 Redis 的性能彻底榨干。