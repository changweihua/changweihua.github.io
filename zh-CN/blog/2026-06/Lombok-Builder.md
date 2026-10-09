---
lastUpdated: true
commentabled: true
recommended: true
title: Lombok @Builder 越用越爽
description: 直到生产上构造函数的参数顺序全乱了
date: 2026-06-26 09:35:00
pageClass: blog-page-class
cover: /covers/java.svg
---

去年接手一个订单模块，一个 `OrderCreateRequest` 类加了三十多个字段，同事为了省事直接怼了个 `@Builder`。开发自测都跑得好好的，上线那天晚上就开始出事了——订单金额和运费金额两个字段交换了，发货地址写到了收货地址里面。

翻代码一看，`@Builder` 生成了什么？所有字段一股脑扔进 builder，字段一多根本分不清哪个是哪个。`orderCreateRequestBuilder.amount(shippingFee).shippingFee(amount)` —— 就这种低级错误，因为类型相同编译器一个字都不会报。

## Builder 本来是个好东西，但 Lombok 把它整成了手榴弹

GoF 书里的建造者模式长这样：

```java
// 正经的建造者模式
public class Order {
    private final String orderId;
    private final BigDecimal amount;
    private final String address;

    private Order(Builder builder) {
        this.orderId = builder.orderId;
        this.amount = builder.amount;
        this.address = builder.address;
    }

    public static class Builder {
        private String orderId;
        private BigDecimal amount;
        private String address;

        public Builder orderId(String orderId) { this.orderId = orderId; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder address(String address) { this.address = address; return this; }

        public Order build() {
            // 可以在这里做校验
            if (orderId == null) throw new IllegalStateException("orderId is required");
            if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalStateException("amount must be positive");
            return new Order(this);
        }
    }
}
```

注意两点：`build()` 方法里可以做参数校验，构造函数是 `private` 的所以外部没法绕过。这是建造者模式的核心价值——把复杂对象的构建和表示分离，让你能一步步凑齐参数再一次性校验。

Lombok 的 `@Builder` 干了什么？它确实生成了链式 setter，但把 `build()` 方法变成了一个简单的 new——没有任何校验逻辑，也不强制你必须调用某些方法。字段数量上来之后，你没法保证 `build()` 之前所有必需字段都 `set` 了。

更坑的是，Lombok `@Builder` 默认会把所有字段都变成可选。真正需要 `builder` 的场景——参数超过 4 个、有必选有可选——Lombok 反而让你更容易写出不完整的对象。

## StringBuilder 才是建造者模式最成功的案例

Java 标准库里 `StringBuilder` 就是建造者模式的教科书：

```java
String result = new StringBuilder()
    .append("订单号: ")
    .append(orderId)
    .append(", 金额: ")
    .append(amount)
    .append(", 地址: ")
    .append(address)
    .toString();
```

每次 `append()` 返回 `this`，最后 `toString()` 作为 `build()` 方法产出最终结果。你说这个模式简单吧——确实简单。但简单不等于没用，只是大部分人已经习惯到不觉得自己在用设计模式了。

OkHttp 的 `Request.Builder` 也是一个经典：

```java
Request request = new Request.Builder()
    .url("https://api.example.com/order")
    .header("Authorization", "Bearer " + token)
    .post(RequestBody.create(mediaType, jsonBody))
    .build();
```

区别在哪？OkHttp 的 `Builder.build()` 里有真正的校验逻辑——如果你没设 url，它会抛异常，不是等到请求发出去了才发现。Lombok 的 `@Builder.build()` 就是个空壳。

## 你到底什么时候该用建造者模式

三个条件同时满足就该用：

- 构造函数参数超过 4 个。参数少的时候 new 直接传就够了，三四个参数加 builder 是过度设计。
- 参数里有可选有必选。全部必选用构造函数，全部可选用 setter。builder 的甜点在"一部分必选、一部分可选"。
- 参数之间有约束关系。比如 `startDate` 不能晚于 `endDate`，`amount` 和 `discount` 加起来不能超过原价——这种逻辑放在 `build()` 里是最合适的，Lombok 做不到。

用建造者模式之前先问自己：我是不是只是懒得多写一个构造函数？如果是，别用 builder。

## 用 Lombok @Builder 的正确姿势

如果你坚持要用 Lombok，至少知道怎么补坑：

```java
@Builder
public class OrderCreateRequest {
    @NonNull  // 加上这个，Lombok 会生成 null 检查
    private final String orderId;

    private final BigDecimal amount;
    private final BigDecimal shippingFee;

    // 自定义 build 方法，覆盖 Lombok 生成的
    public static class OrderCreateRequestBuilder {
        public OrderCreateRequest build() {
            // 你的校验逻辑
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("amount must be positive");
            }
            return new OrderCreateRequest(orderId, amount, shippingFee);
        }
    }
}
```

外层类用 `@Builder`，内部 `Builder` 类里自己写 `build()` 方法覆盖 Lombok 生成的——这是目前比较实用的折中方案。链式调用的便利有了，校验也不会丢。

## 总结一下心态问题

建造者模式被忽视不是因为难，是因为"太简单了"。很多面试官觉得 `builder` 不值一问，面试者觉得 `builder` 就是写几个 setter 返回 this。但真写到生产上，参数校验、不可变对象、必选 vs 可选的设计——这些东西建造者模式都能帮你管起来，前提是你别只是 `@Builder` 一怼就完事。
