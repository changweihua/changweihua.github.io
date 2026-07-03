---
lastUpdated: true
commentabled: true
recommended: true
title: Apache Kafka 4.0
description: 简化部署、提升性能
date: 2026-04-13 13:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

Apache Kafka 的最新版本 *4.0* 于 2025 年 3 月 18 日发布，带来了多项重要的新能力和改进。以下是其中一些关键特性：

## 无 ZooKeeper 模式（KRaft 模式） ##

- 简化部署和管理：Kafka 4.0 默认运行在 `KRaft` 模式下，这意味着它不再需要 Apache ZooKeeper。这种变化使得部署和管理变得更简单，降低了运营复杂性，提高了可扩展性，并简化了管理任务。

## 新消费者组协议（KIP-848） ##

- 提高消费者组性能：引入了一种新的消费者组协议，旨在显著改善重新平衡性能。这种优化通过将逻辑转移到代理端，减少了停机时间和延迟，提高了消费者组的可靠性和响应速度，尤其是在大规模部署中。

## 队列功能（KIP-932） ##

- 支持传统队列语义：提供了对传统队列语义的支持，允许多个消费者协同处理同一个分区。这扩展了 Kafka 的适用范围，使其成为更通用的消息平台，特别适用于需要点对点消息模式的场景。

## Java 版本要求 ##

- Java 版本升级：Kafka 客户端和 Kafka Streams 需要 Java 11，而 Kafka 代理、Connect 和工具现在需要 Java 17。

## API 更新 ##

- 简化平台：删除了至少 12 个月前被废弃的 API，以简化平台并鼓励采用新功能。

## 示例代码：使用 Kafka 4.0 的 KRaft 模式 ##

以下是一个简单的示例，展示如何在 KRaft 模式下创建 Kafka 主题：

```java
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.CreateTopicsResult;
import org.apache.kafka.clients.admin.NewTopic;

import java.util.Collections;
import java.util.Properties;

public class KafkaTopicCreator {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put("bootstrap.servers", "localhost:9092");
        props.put("acks", "all");

        AdminClient adminClient = AdminClient.create(props);

        NewTopic newTopic = new NewTopic("my-topic", 1, (short) 1);
        CreateTopicsResult result = adminClient.createTopics(Collections.singleton(newTopic));

        System.out.println("Topic created: " + result.all().get());
    }
}
```

## 示例代码：使用新消费者组协议 ##

以下是使用新消费者组协议的基本示例：

```java
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class KafkaConsumerExample {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singleton("my-topic"));

        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
            for (ConsumerRecord<String, String> record : records) {
                System.out.println(record.value());
            }
            consumer.commitSync();
        }
    }
}
```

## 队列功能示例 ##

队列功能允许多个消费者处理同一个分区，这在需要点对点消息模式的场景中尤其有用。以下是一个基本的示例，展示如何在 Kafka 中实现类似队列的行为：

```java
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class KafkaQueueExample {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-queue-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Collections.singleton("my-queue-topic"));

        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
            for (ConsumerRecord<String, String> record : records) {
                System.out.println(record.value());
                // 处理消息后，手动确认以避免重复消费
                consumer.commitSync(Collections.singleton(record));
            }
        }
    }
}
```

这些示例展示了如何在 Kafka 4.0 中利用新特性进行开发。
