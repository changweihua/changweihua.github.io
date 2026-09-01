---
lastUpdated: true
commentabled: true
recommended: true
title: 从经典的三层架构到DDD
description: 一次对“业务逻辑层”的解剖与重构
date: 2026-08-19 09:15:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

> 三层架构把所有“业务相关”的代码塞进一个叫Service的黑盒里。DDD把这个黑盒打开了。

## 三层架构：一个被我们默认为“标准答案”的起点 ##

先定标。经典三层架构长这样：

| 层级 | 职责 | 典型组件 |
| :--- | :--- | :--- |
| 表示层 | 接收请求、返回响应 | Controller |
| 业务逻辑层 | 处理业务规则、流程编排 | Service |
| 数据访问层 | 操作数据库 | DAO / Mapper |

依赖方向是*自上而下*：Controller 依赖 Service，Service 依赖 DAO。新人三天上手，因为规律简单——一个请求进来，Controller 调 Service，Service 调 DAO，返回数据。这套模式统治了绝大多数企业级开发。

但这里藏着一个*极其隐蔽的缺陷*：业务逻辑层这三个字，像一个“万能口袋”——所有说不清该放哪里的代码，全扔进去了。随着业务增长，这个袋子越来越鼓，直到你发现修改一个业务规则，要改三四个Service，漏掉一个就是线上Bug。

*根本原因是什么？* 三层架构从未定义“业务逻辑层”的内部结构。它只画了一个方框，写了“Service”三个字，然后说：里面装的是业务逻辑。至于业务逻辑内部有没有结构、不同性质的逻辑该不该分开——*架构层面没有答案*。

## 打开黑盒：业务逻辑层里到底装着什么？ ##

我们解剖一段典型的三层架构代码。用户下单支付成功，扣钱包余额，然后加积分：

```java
// 文件: service/OrderService.java（三层架构）

@Service
public class OrderService {
    @Autowired private UserDao userDao;
    @Autowired private OrderDao orderDao;
    @Autowired private CreditLogDao creditLogDao;
    @Autowired private RedisTemplate redis;
    @Autowired private MqProducer mq;

    @Transactional
    public void payOrder(Long orderId, Long userId) {
        // 1. 技术动作：查数据
        Order order = orderDao.findById(orderId);
        User user = userDao.findById(userId);

        // 2. 业务规则：校验订单状态
        if (order.getStatus() != OrderStatus.UNPAID) {
            throw new BizException("订单已支付或已取消");
        }
        // 3. 业务规则：校验余额是否充足
        if (user.getBalance() < order.getTotalAmount()) {
            throw new BizException("余额不足");
        }

        // 4. 业务规则：扣余额
        user.setBalance(user.getBalance() - order.getTotalAmount());
        // 5. 技术动作：存数据库
        userDao.save(user);

        // 6. 业务规则：加积分（消费1元积1分）
        int points = order.getTotalAmount().intValue();
        user.setPoints(user.getPoints() + points);
        // 7. 技术动作：存数据库
        userDao.save(user);

        // 8. 业务规则：更新订单状态
        order.setStatus(OrderStatus.PAID);
        order.setPayTime(LocalDateTime.now());
        // 9. 技术动作：存数据库
        orderDao.save(order);

        // 10. 技术动作：记录积分流水
        creditLogDao.save(new CreditLog(userId, points, "订单支付"));

        // 11. 技术动作：更新缓存
        redis.opsForValue().set("user:" + userId, JSON.toJSONString(user));

        // 12. 技术动作：发送消息
        mq.send("order.paid", orderId);
    }
}
```

现在我问你：*这个方法里，哪些行是在说“业务规则”，哪些行是在说“怎么落地”？*

仔细数一数：

- *业务规则*（说“是什么”）：第2行（校验状态）、第3行（校验余额）、第4行（扣余额）、第6行（加积分）、第8行（更新状态）
- *技术协调*（说“怎么落地”）：第1行（查数据）、第5行（存用户）、第7行（存用户）、第9行（存订单）、第10行（记流水）、第11行（写缓存）、第12行（发消息）

*两种不同性质的逻辑，在同一个方法里交错出现。*这就是三层架构Service的真实面貌——它同时承担了“定规则”和“跑流程”两件事，而且把它们绞在一起，分不清彼此。

如果你再看User这个类：

```java
// 文件: entity/User.java（三层架构）

@Entity
public class User {
    private Long id;
    private BigDecimal balance;
    private Integer points;
    // 只有 getter 和 setter，没有任何行为
}
```

User是个“空心人”——知道自己有余额和积分，但不知道自己能做什么。扣余额的逻辑在Service里，加积分的逻辑在Service里，一切行为都在Service里。Martin Fowler称之为贫血模型。

*贫血模型带来的直接后果*：如果AdminService也要给用户加积分（比如活动赠送），你只能把第6行那段复制粘贴过去。业务规则散布在各处，修改时遗漏一处就产生Bug。

好，现在我们看清了三层架构的核心困境：

> 贫血模型导致业务逻辑散布四处 → 低内聚。
> Service直接依赖DAO、Redis、MQ导致业务逻辑与技术绑定 → 高耦合。
> 根本原因：业务逻辑层是一个未定义内部结构的黑盒。

## 核心追问：原来的Service到底错在哪里？ ##

回到上一节的代码。我问一个更刁钻的问题：*这个方法里，到底有几种不同性质的“逻辑”？*

我数给你看：

- “余额够不够？”“积分按什么比例加？” ——这是业务规则。它回答的是“这个业务场景在本质上是怎样的”。换了MySQL换成Oracle，这条规则不会变。
- “从哪个表查数据？”“存到哪个表？” ——这是持久化逻辑。它回答的是“数据放在哪里”。换了数据库，这块要变。
- “缓存怎么更新？”“消息发到什么Topic？” ——这是技术辅助逻辑。它回答的是“怎么让系统运行得更快或更联动”。
- “先扣余额再加积分还是反过来？”“事务边界在哪里？” ——这是流程编排逻辑。它回答的是“步骤的顺序和边界”。

原来的Service把这四种完全不同性质的逻辑混在同一个方法里。这就是问题所在：

> 原来的Service不是因为“太大”而坏掉的，而是因为它同时承担了四种不同性质的职责，却没有在结构上把它们分开。

当业务规则变化时（比如积分配置从消费1元积1分改为黄金会员积2分），你要去Service里找。当技术方案变化时（Redis换Caffeine），你又要去Service里找。业务人员和技术人员的变更，都瞄准同一个文件——Service变成了所有变化的交汇点，任何一个维度的变动都会冲击其他维度。

## DDD的回应：不是“加一层”，而是“拆一类” ##

DDD的第一刀就落在这里：把不同性质的逻辑拆开，各自归位。

DDD把三层架构的“业务逻辑层”一分为二，同时把“数据访问层”的角色重定义为“基础设施层”：

| 三层架构 | DDD四层架构 | 拆分的逻辑 |
| :--- | :--- | :--- |
| 表示层 | 用户接口层 | 对应，但更宽（HTTP/RPC/MQ） |
| 业务逻辑层（Service） | 应用层（Application Service） | 接手“流程编排”+“技术协调”—查、存、事务、发消息 |
| 业务逻辑层（Service） | 领域层（Domain Layer） | 接手“业务规则”—余额够不够、积分怎么算、状态对不对 |
| 数据访问层 | 基础设施层 | 接手“持久化实现”+“技术辅助”——实现仓储接口、Redis、MQ |

最关键的一点：原来的Service里四种逻辑交织在一起。DDD不是简单地把一个类拆成两个类，而是强制把四种不同性质的代码放到不同的层级里，并且规定它们不能互相越界。

- 应用层只能做流程编排和技术协调，不允许出现任何业务规则（不能有`if (balance < amount)`这样的判断）。
- 领域层只能做业务规则，不允许出现任何技术代码（不能有 `@Autowired`、`@Transactional`、`@Table`）。

现在用“下单支付，扣余额加积分”这个场景，逐层展示拆分后的样子：

### 领域层：定义“业务规则是什么” ###

领域层是所有业务规则的唯一居所。它由纯Java对象组成，没有任何框架注解，不依赖任何技术组件。

```java
// 文件: domain/user/User.java

public class User {
    private Long id;
    private String name;
    private Money balance;        // 值对象：金额
    private Points points;        // 值对象：积分
    private UserLevel level;      // 枚举：普通/黄金/钻石

    public User(String name) {
        this.name = name;
        this.balance = Money.zero();
        this.points = Points.zero();
        this.level = UserLevel.NORMAL;
    }

    // 业务规则：扣余额（只有这一个入口）
    public void deductBalance(Money amount) {
        if (amount == null || amount.isNegative()) {
            throw new DomainException("扣减金额不能为空或负数");
        }
        if (this.balance.lessThan(amount)) {
            throw new DomainException("余额不足");
        }
        this.balance = this.balance.minus(amount);
    }

    // 业务规则：加积分（根据会员等级计算不同倍数）
    public void addPointsForConsumption(Money spentAmount) {
        if (spentAmount == null || spentAmount.isNegative()) {
            throw new DomainException("消费金额不能为空或负数");
        }
        int basePoints = spentAmount.getAmount().intValue(); // 1元=1积分
        int multiplier = this.level.getPointMultiplier();    // 普通:1, 黄金:2, 钻石:3
        this.points = this.points.add(basePoints * multiplier);
    }
}
```

```java
// 文件: domain/user/Money.java

public class Money {
    private BigDecimal value;

    public Money(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("金额不能为负");
        }
        this.value = value;
    }

    public static Money zero() {
        return new Money(BigDecimal.ZERO);
    }

    public boolean isNegative() {
        return this.value.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean lessThan(Money other) {
        return this.value.compareTo(other.value) < 0;
    }

    public Money minus(Money other) {
        return new Money(this.value.subtract(other.value));
    }

    public BigDecimal getAmount() {
        return this.value;
    }
}
```

```java
// 文件: domain/user/Points.java

public class Points {
    private int value;

    public Points(int value) {
        if (value < 0) throw new DomainException("积分不能为负");
        this.value = value;
    }

    public static Points zero() {
        return new Points(0);
    }

    public Points add(int amount) {
        if (amount < 0) throw new DomainException("增加积分必须为正");
        return new Points(this.value + amount);
    }
}
```

```java
// 文件: domain/user/UserLevel.java

public enum UserLevel {
    NORMAL(1, "普通"),
    GOLD(2, "黄金"),
    DIAMOND(3, "钻石");

    private int pointMultiplier;
    private String desc;

    UserLevel(int pointMultiplier, String desc) {
        this.pointMultiplier = pointMultiplier;
        this.desc = desc;
    }

    public int getPointMultiplier() {
        return pointMultiplier;
    }
}
```

```java
// 文件: domain/order/Order.java

public class Order {
    private Long id;
    private Long userId;
    private Money totalAmount;
    private OrderStatus status;
    private LocalDateTime payTime;

    public Order(Long userId, Money totalAmount) {
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = OrderStatus.UNPAID;
    }

    // 业务规则：支付（状态校验 + 状态变更）
    public void pay() {
        if (this.status != OrderStatus.UNPAID) {
            throw new DomainException("订单已支付或已取消，无法再次支付");
        }
        this.status = OrderStatus.PAID;
        this.payTime = LocalDateTime.now();
    }

    public Money getTotalAmount() {
        return totalAmount;
    }
}
```

```java
// 文件: domain/order/OrderStatus.java

public enum OrderStatus {
    UNPAID,
    PAID,
    CANCELLED
}
```

```java
// 文件: domain/repositories/UserRepository.java

public interface UserRepository {
    User findById(Long id);
    void save(User user);
}
```

```java
// 文件: domain/repositories/OrderRepository.java

public interface OrderRepository {
    Order findById(Long id);
    void save(Order order);
}
```

领域层的特征：没有任何`@Autowired`、`@Transactional`、`@Table`注解。它不知道数据库的存在，不知道Redis的存在，不知道MQ的存在。它只关心三件事——业务规则、业务规则、业务规则。

### 应用层：负责“流程怎么跑” ###

应用层接手原来Service里的流程编排和技术协调工作。但它不做任何业务判断——所有判断都调用领域层的方法。

```java
// 文件: application/service/PayOrderAppService.java

@Service
public class PayOrderAppService {
    // 注意：依赖的是领域层定义的接口，不是具体的DAO！
    private final UserRepository userRepo;
    private final OrderRepository orderRepo;
    private final EventPublisher eventPublisher;  // 基础设施层

    public PayOrderAppService(UserRepository userRepo,
                              OrderRepository orderRepo,
                              EventPublisher eventPublisher) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void handle(Long orderId, Long userId) {
        // 1. 技术协调：获取领域对象
        Order order = orderRepo.findById(orderId);
        User user = userRepo.findById(userId);

        // 2. 【核心】调用领域方法——这里没有任何if/else业务判断！
        //    所有业务规则都在领域层内部执行
        order.pay();                         // 校验状态 + 改状态
        user.deductBalance(order.getTotalAmount());  // 校验余额 + 扣钱
        user.addPointsForConsumption(order.getTotalAmount());  // 计算积分 + 加分

        // 3. 技术协调：持久化
        orderRepo.save(order);
        userRepo.save(user);

        // 4. 技术协调：发布领域事件
        eventPublisher.publish(new OrderPaidEvent(orderId, userId));
    }
}
```

应用层Service的特征：没有一行`if`/`else`是在写业务规则的。你找不到`if (balance < amount)`，找不到`points = amount * level`。它只做四件事：获取、调用、保存、发事件。所有“能不能”“对不对”“怎么算”的判断，都藏在领域对象的方法里。

### 基础设施层：实现“技术怎么落地” ###

基础设施层实现领域层定义的仓储接口，并封装Redis、MQ等技术细节。

```java
// 文件: infrastructure/persistence/UserRepositoryImpl.java

@Repository
public class UserRepositoryImpl implements UserRepository {
    @Autowired private UserJpaMapper userMapper;  // 具体ORM

    @Override
    public User findById(Long id) {
        UserPo po = userMapper.selectById(id);
        if (po == null) return null;
        return UserConverter.toDomain(po);
    }

    @Override
    public void save(User user) {
        UserPo po = UserConverter.toPo(user);
        userMapper.updateById(po);
    }
}
```

```java
// 文件: infrastructure/persistence/converter/UserConverter.java

public class UserConverter {
    public static User toDomain(UserPo po) {
        User user = new User(po.getName());
        // 通过setter注入持久化状态（领域层提供内部方法）
        user.setId(po.getId());
        user.setBalance(new Money(po.getBalance()));
        user.setPoints(new Points(po.getPoints()));
        user.setLevel(UserLevel.valueOf(po.getLevel()));
        return user;
    }

    public static UserPo toPo(User user) {
        UserPo po = new UserPo();
        po.setId(user.getId());
        po.setName(user.getName());
        po.setBalance(user.getBalance().getAmount());
        po.setPoints(user.getPoints().getValue());
        po.setLevel(user.getLevel().name());
        return po;
    }
}
```

```java
// 文件: infrastructure/persistence/OrderRepositoryImpl.java

@Repository
public class OrderRepositoryImpl implements OrderRepository {
    @Autowired private OrderJpaMapper orderMapper;

    @Override
    public Order findById(Long id) {
        OrderPo po = orderMapper.selectById(id);
        return OrderConverter.toDomain(po);
    }

    @Override
    public void save(Order order) {
        OrderPo po = OrderConverter.toPo(order);
        orderMapper.updateById(po);
    }
}
```

```java
// 文件: infrastructure/message/EventPublisherImpl.java

@Component
public class EventPublisherImpl implements EventPublisher {
    @Autowired private MqProducer mqProducer;

    @Override
    public void publish(DomainEvent event) {
        if (event instanceof OrderPaidEvent) {
            OrderPaidEvent paidEvent = (OrderPaidEvent) event;
            mqProducer.send("order.paid", paidEvent.getOrderId());
        }
    }
}
```

### 用户接口层：接收请求 ###

```java
// 文件: interfaces/web/OrderController.java

@RestController
@RequestMapping("/order")
public class OrderController {
    @Autowired private PayOrderAppService appService;

    @PostMapping("/pay")
    public Result pay(@RequestBody PayRequest req) {
        // 只做参数校验和路由，不包含任何业务逻辑
        appService.handle(req.getOrderId(), req.getUserId());
        return Result.success();
    }
}
```

## 一张表讲透：原来的Service vs 应用层 vs 领域层 ##

很多人第一次接触DDD时最大的困惑是：“应用层不也叫Service吗？它和原来的Service到底有什么不同？”

现在用“下单支付”这个例子，直接对比：

| 对比维度 | 传统三层 (Service) | DDD 应用层 (Application Service) | DDD 领域层 (Domain Model) |
| :--- | :--- | :--- | :--- |
| 代码位置 | `service/OrderService.java` | `application/service/PayOrderAppService.java` | `domain/user/User.java`、`domain/order/Order.java` |
| 代码示例 | `order.pay(); if (balance < amount) throw...; user.setBalance(...); redis.set(...); mq.send(...)` | `user.deductBalance(...); user.addPoints(...); userRepo.save(user); eventPublisher.publish(...)` | （领域对象封装业务规则，如 `Order.pay()` 等） |
| 包含业务规则吗？ | 包含（混杂在技术代码中） | ❌ 不包含 | ✅ 包含（全部） |
| 包含技术协调吗？ | 包含（混杂在业务代码中） | ✅ 包含（查、存、发事件） | ❌ 不包含 |
| 包含流程编排吗？ | 包含（谁先谁后混在代码里） | ✅ 包含（显式按顺序调用） | ❌ 不包含 |
| 依赖什么？ | 依赖 DAO、Redis、MQ | 依赖领域层定义的接口（Repository、EventListener） | 谁都不依赖（纯 Java POJO） |
| 单元测试 | 需 Mock DAO、Redis、MQ，启动 Spring | 需 Mock Repository 接口，相对轻量 | 直接 new 对象即可，毫秒级执行 |
| 业务规则变更影响面 | 需修改 Service，可能牵连技术代码 | 只需修改领域层，应用层不动 | 只改当前类，内聚性极高 |
| 技术方案变更影响面 | 需修改 Service，可能牵连业务代码 | 只需修改基础设施层，应用层和领域层不动 | 完全不受影响 |

## 高内聚、低耦合：两把尺子量到底 ##

现在用“高内聚、低耦合”来检验两种架构的成色。

### 三层架构：低内聚 + 高耦合 ###

低内聚：扣余额、加积分的规则散布在OrderService、AdminService、ActivityService里。改一处规则（比如积分改为黄金会员2倍），要在多个地方找修改点，漏一个就产生Bug。同一业务概念（用户）的行为没有待在一起。

高耦合：Service直接`@Autowired` DAO、Redis、MQ。换缓存方案（Redis→Caffeine）、换ORM（MyBatis→JPA），Service代码跟着改。业务逻辑被绑在技术实现上，没法独立演进。

### DDD：高内聚 + 低耦合 ###

高内聚：User的所有行为（deductBalance、addPointsForConsumption）都封装在`User.java`内部；Order的支付行为封装在`Order.java`内部。改积分规则，只改`User.java`和`Points.java`，其他地方不用动。同一业务概念的行为，全部收拢在一处。

极低耦合：领域层不知道数据库、缓存、消息的存在，只依赖Repository接口。换MySQL为Redis、MyBatis为JPA，只需要换基础设施层的实现（`UserRepositoryImpl.java`、`OrderRepositoryImpl.java`），领域层毫不知情。业务和技术实现了物理隔离。

一句话总结：

> 三层架构 = 业务低内聚 + 技术高耦合
> DDD = 业务高内聚 + 技术极低耦合

## 包结构：这一切如何在代码里“长”出来？ ##

理论落地的最终检验是包结构。看一个项目的根目录，就能判断它是三层还是DDD。

### 三层架构的包结构（按技术角色分） ###

```text
com.company.project
├── controller/          # 表示层
├── service/             # 业务逻辑层（大而全，四种逻辑混在一起）
├── dao/                 # 数据访问层
└── entity/              # 贫血实体（带@Table，与表一一对应）
```

### DDD的包结构（先按业务领域分，再按层分） ###

```text
com.company.project
├── interfaces/                    # 用户接口层
│   ├── web/
│   │   └── OrderController.java   # 只做路由和参数校验
│   └── mq/
│       └── OrderEventListener.java
│
├── application/                   # 应用层（极薄，只做流程编排和技术协调）
│   └── service/
│       └── PayOrderAppService.java   # 无业务规则，只做调用和持久化
│
├── domain/                        # 领域层（核心！全部业务规则）
│   ├── user/                      # 用户聚合
│   │   ├── User.java              # 聚合根，含deductBalance、addPoints等行为
│   │   ├── Money.java             # 值对象
│   │   ├── Points.java            # 值对象
│   │   └── UserLevel.java         # 枚举
│   ├── order/                     # 订单聚合
│   │   ├── Order.java             # 聚合根，含pay行为
│   │   └── OrderStatus.java
│   ├── repositories/              # 仓储接口（定义，不实现）
│   │   ├── UserRepository.java
│   │   └── OrderRepository.java
│   └── event/
│       └── OrderPaidEvent.java
│
└── infrastructure/                # 基础设施层（实现domain的接口）
    ├── persistence/
    │   ├── UserRepositoryImpl.java   # 实现domain.UserRepository
    │   ├── OrderRepositoryImpl.java
    │   └── converter/                # 领域对象↔PO转换
    │       ├── UserConverter.java
    │       └── OrderConverter.java
    ├── message/
    │   └── EventPublisherImpl.java
    └── config/
```

*关键区别*：

- 三层架构：一打开根目录，看到的是技术组件（controller/service/dao），看不出系统是做什么业务的。
- DDD：一打开根目录，看到的是业务领域（user/order），业务高内聚在包结构上的直接体现。

**快速判断法**：

- 顶级包是controller/service/dao/entity → 三层
- 顶级包是interfaces/application/domain/infrastructure，且domain包最大最活跃 → DDD
- domain里的类如果带`@Table`注解 → 假DDD（仍是贫血模型）；如果是纯Java且包含行为方法（如deductBalance）→ 真DDD

## 何时选择？并非取代，而是演进 ##

三层架构不是被淘汰的，而是被超越的。它们适用于不同场景：

| 维度 | 三层架构 | DDD |
| :--- | :--- | :--- |
| 业务复杂度 | 中低（CRUD、表单系统） | 高（金融、供应链、电商核心） |
| 变化频率 | 业务稳定 | 规则频繁迭代 |
| 团队规模 | 小团队快速交付 | 多团队协作 |
| 学习成本 | 低，新人三天上手 | 极高，需懂业务建模、战术设计 |
| 测试成本 | 高（需Mock容器和技术组件） | 低（领域层纯内存，new即可测） |

*从三层渐进到DDD的路径*：

- 仍用三层，但把复杂逻辑从Service移到Entity方法里（先充血，让对象有行为）
- 引入Repository接口，Service依赖接口而非具体DAO（实现依赖倒置）
- 拆分Service为Application Service + Domain Service
- 按业务边界划分限界上下文，拆微服务

## 总结：一条清晰的主脉 ##

回看整篇文章，我们用一条线索贯穿始终：

- 三层架构有一个未定义内部结构的“业务逻辑层”黑盒（Service）→ 打开黑盒，发现里面混着四种不同性质的逻辑：业务规则、持久化、技术辅助、流程编排 → 同时，贫血模型导致业务逻辑散落四处，同一业务概念的行为没有内聚 → DDD把黑盒拆成应用层（流程编排+技术协调）和领域层（全部业务规则）→ 用充血模型把所有规则内聚到领域对象里（扣余额在User里，支付在Order里）→ 依赖方向随之倒置，领域层成为不依赖任何技术的纯核心 → 实现了业务高内聚和技术低耦合 → 这一切最终落地在包结构上，从代码目录就能一眼分辨。

三层架构解决的是“怎么分层”的问题。DDD回答的是更深一层的问题：业务逻辑层里面到底是什么，以及怎么组织它。

当你在代码里写下第一个充血模型时——比如把`if (balance < amount)`从Service挪到`User.java`里——你其实是在用代码说：我知道这个业务规则属于谁，以及它应该待在哪里。  

这才是架构从“能用”走向“好用”的那一步。
