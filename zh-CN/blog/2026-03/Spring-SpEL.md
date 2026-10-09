---
lastUpdated: true
commentabled: true
recommended: true
title: Spring表达式详解
description: SpEL从入门到实战
date: 2026-03-24 15:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

SpEL（Spring Expression Language，Spring表达式语言）是Spring框架提供的强大表达式语言，支持在运行时查询和操作对象图。SpEL广泛应用于Spring的各个模块中，如Spring Security、Spring Data、Spring Cache等。本文将深入讲解SpEL的核心概念、语法特性和实战应用。

## 一、SpEL概述 ##

### 什么是SpEL ###

SpEL是一种功能强大的表达式语言，它支持：

- 字面量表达式
- 属性访问
- 方法调用
- 集合操作
- 逻辑运算
- 正则表达式
- 自定义函数

### SpEL在Spring中的应用 ###

```txt
┌─────────────────────────────────────────┐
│  Spring框架                              │
│  ┌───────────────────────────────────┐ │
│  │ @Value("${...}")                  │ │
│  │ @Cacheable(key = "#id")           │ │
│  │ @PreAuthorize("hasRole('ADMIN')")│ │
│  │ @EventListener(condition = "...")│ │
│  │ XML配置：<property value="#{...}"/>│ │
│  └───────────────────────────────────┘ │
│              ↓                           │
│  ┌───────────────────────────────────┐ │
│  │     SpEL解析引擎                  │ │
│  │  - 词法分析                       │ │
│  │  - 语法分析                       │ │
│  │  - 表达式求值                     │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### SpEL的优势 ###

```txt
SpEL vs 其他表达式语言
┌──────────────┬─────────────┬──────────────┐
│  特性         │  SpEL       │  EL/OGNL     │
├──────────────┼─────────────┼──────────────┤
│  Spring集成  │  原生支持    │  需要适配     │
│  类型安全     │  支持        │  有限支持     │
│  方法调用     │  全面支持    │  有限支持     │
│  集合操作     │  强大        │  基础         │
│  自定义函数   │  支持        │  有限         │
│  安全性       │  可控        │  风险较高     │
└──────────────┴─────────────┴──────────────┘
```

## 二、SpEL基础语法 ##

### 字面量表达式 ###

```java
/**
 * 字面量表达式示例
 */
public class LiteralExpressionsDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 字符串字面量
        Expression exp1 = parser.parseExpression("'Hello World'");
        String str = (String) exp1.getValue();
        System.out.println("字符串: " + str);  // Hello World

        // 数字字面量
        Expression exp2 = parser.parseExpression("100");
        Integer num = (Integer) exp2.getValue();
        System.out.println("数字: " + num);  // 100

        // 浮点数字面量
        Expression exp3 = parser.parseExpression("3.14159");
        Double pi = (Double) exp3.getValue();
        System.out.println("浮点数: " + pi);  // 3.14159

        // 布尔字面量
        Expression exp4 = parser.parseExpression("true");
        Boolean bool = (Boolean) exp4.getValue();
        System.out.println("布尔值: " + bool);  // true

        // null字面量
        Expression exp5 = parser.parseExpression("null");
        Object nullVal = exp5.getValue();
        System.out.println("null值: " + nullVal);  // null
    }
}
```

### 属性访问 ###

```java
/**
 * 属性访问示例
 */
public class PropertyAccessDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 创建上下文对象
        User user = new User("张三", 25, "zhangsan@example.com");

        // 访问属性
        Expression exp1 = parser.parseExpression("name");
        String name = exp1.getValue(user, String.class);
        System.out.println("姓名: " + name);  // 张三

        // 访问嵌套属性
        user.setAddress(new Address("北京市", "朝阳区"));
        Expression exp2 = parser.parseExpression("address.city");
        String city = exp2.getValue(user, String.class);
        System.out.println("城市: " + city);  // 北京市

        // 安全导航（避免空指针）
        user.setAddress(null);
        Expression exp3 = parser.parseExpression("address?.city");
        String safeCity = exp3.getValue(user, String.class);
        System.out.println("安全访问: " + safeCity);  // null

        // 数组/列表访问
        user.setHobbies(new String[]{"篮球", "游泳", "阅读"});
        Expression exp4 = parser.parseExpression("hobbies[0]");
        String hobby = exp4.getValue(user, String.class);
        System.out.println("第一个爱好: " + hobby);  // 篮球

        // Map访问
        Map<String, Object> map = new HashMap<>();
        map.put("key1", "value1");
        Expression exp5 = parser.parseExpression("['key1']");
        String value = exp5.getValue(map, String.class);
        System.out.println("Map值: " + value);  // value1
    }
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class User {
    private String name;
    private Integer age;
    private String email;
    private Address address;
    private String[] hobbies;

    public User(String name, Integer age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}

@Data
@AllArgsConstructor
class Address {
    private String city;
    private String district;
}
```

### 方法调用 ###

```java
/**
 * 方法调用示例
 */
public class MethodCallDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 字符串方法调用
        Expression exp1 = parser.parseExpression("'Hello'.concat(' World')");
        String result1 = exp1.getValue(String.class);
        System.out.println("字符串拼接: " + result1);  // Hello World

        // 对象方法调用
        User user = new User("zhangsan", 25, "zhangsan@example.com");
        Expression exp2 = parser.parseExpression("name.toUpperCase()");
        String result2 = exp2.getValue(user, String.class);
        System.out.println("大写: " + result2);  // ZHANGSAN

        // 链式调用
        Expression exp3 = parser.parseExpression("email.substring(0, 8).toUpperCase()");
        String result3 = exp3.getValue(user, String.class);
        System.out.println("链式调用: " + result3);  // ZHANGSAN

        // 静态方法调用
        Expression exp4 = parser.parseExpression(
            "T(java.lang.Math).random() * 100");
        Double random = exp4.getValue(Double.class);
        System.out.println("随机数: " + random);

        // 调用自定义方法
        Expression exp5 = parser.parseExpression(
            "T(com.example.StringUtils).isEmpty(name)");
        Boolean isEmpty = exp5.getValue(user, Boolean.class);
        System.out.println("是否为空: " + isEmpty);
    }
}

/**
 * 工具类
 */
class StringUtils {
    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }
}
```

### 运算符 ###

```java
/**
 * 运算符示例
 */
public class OperatorDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 算术运算符
        System.out.println("加法: " + parser.parseExpression("1 + 2").getValue());  // 3
        System.out.println("减法: " + parser.parseExpression("5 - 2").getValue());  // 3
        System.out.println("乘法: " + parser.parseExpression("3 * 4").getValue());  // 12
        System.out.println("除法: " + parser.parseExpression("10 / 2").getValue()); // 5
        System.out.println("取模: " + parser.parseExpression("10 % 3").getValue()); // 1

        // 关系运算符
        System.out.println("等于: " + parser.parseExpression("5 == 5").getValue());   // true
        System.out.println("不等于: " + parser.parseExpression("5 != 3").getValue()); // true
        System.out.println("大于: " + parser.parseExpression("5 > 3").getValue());    // true
        System.out.println("小于: " + parser.parseExpression("3 < 5").getValue());    // true
        System.out.println("大于等于: " + parser.parseExpression("5 >= 5").getValue());  // true

        // 逻辑运算符
        System.out.println("与: " + parser.parseExpression("true and false").getValue()); // false
        System.out.println("或: " + parser.parseExpression("true or false").getValue());  // true
        System.out.println("非: " + parser.parseExpression("!true").getValue());         // false

        // 三元运算符
        System.out.println("三元: " + parser.parseExpression("5 > 3 ? 'yes' : 'no'").getValue());  // yes

        // 字符串连接
        System.out.println("拼接: " + parser.parseExpression("'Hello' + ' ' + 'World'").getValue());

        // Elvis运算符（简化三元）
        User user = new User();
        user.setName(null);
        Expression exp = parser.parseExpression("name?:'匿名用户'");
        System.out.println("Elvis: " + exp.getValue(user, String.class));  // 匿名用户
    }
}
```

### 集合操作 ###

```java
/**
 * 集合操作示例
 */
public class CollectionDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 创建列表
        Expression exp1 = parser.parseExpression("{1,2,3,4,5}");
        List<Integer> list = (List<Integer>) exp1.getValue();
        System.out.println("列表: " + list);  // [1, 2, 3, 4, 5]

        // 创建Map
        Expression exp2 = parser.parseExpression("{name:'张三',age:25}");
        Map<String, Object> map = (Map<String, Object>) exp2.getValue();
        System.out.println("Map: " + map);  // {name=张三, age=25}

        // 集合选择（筛选）
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        StandardEvaluationContext context = new StandardEvaluationContext();
        context.setVariable("numbers", numbers);

        // 选择偶数
        Expression exp3 = parser.parseExpression("#numbers.?[#this % 2 == 0]");
        List<Integer> evenNumbers = (List<Integer>) exp3.getValue(context);
        System.out.println("偶数: " + evenNumbers);  // [2, 4, 6, 8, 10]

        // 集合投影（映射）
        List<User> users = Arrays.asList(
            new User("张三", 25, "zhangsan@example.com"),
            new User("李四", 30, "lisi@example.com"),
            new User("王五", 35, "wangwu@example.com")
        );
        context.setVariable("users", users);

        // 提取所有用户名
        Expression exp4 = parser.parseExpression("#users.![name]");
        List<String> names = (List<String>) exp4.getValue(context);
        System.out.println("用户名列表: " + names);  // [张三, 李四, 王五]

        // 查找第一个匹配
        Expression exp5 = parser.parseExpression("#users.^[age > 25]");
        User firstMatch = (User) exp5.getValue(context);
        System.out.println("第一个年龄>25: " + firstMatch.getName());  // 李四

        // 查找最后一个匹配
        Expression exp6 = parser.parseExpression("#users.$[age > 25]");
        User lastMatch = (User) exp6.getValue(context);
        System.out.println("最后一个年龄>25: " + lastMatch.getName());  // 王五
    }
}
```

### 正则表达式 ###

```java
/**
 * 正则表达式示例
 */
public class RegexDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 邮箱验证
        Expression exp1 = parser.parseExpression(
            "'zhangsan@example.com' matches '^[A-Za-z0-9+_.-]+@(.+)$'");
        Boolean isEmail = exp1.getValue(Boolean.class);
        System.out.println("是否为邮箱: " + isEmail);  // true

        // 手机号验证
        Expression exp2 = parser.parseExpression(
            "'13800138000' matches '^1[3-9]\\d{9}$'");
        Boolean isPhone = exp2.getValue(Boolean.class);
        System.out.println("是否为手机号: " + isPhone);  // true

        // 在对象上使用
        User user = new User("张三", 25, "invalid-email");
        Expression exp3 = parser.parseExpression(
            "email matches '^[A-Za-z0-9+_.-]+@(.+)$'");
        Boolean validEmail = exp3.getValue(user, Boolean.class);
        System.out.println("邮箱格式正确: " + validEmail);  // false
    }
}
```

## 三、Spring中的SpEL应用 ##

### @Value注解 ###

```java
/**
 * @Value注解使用SpEL
 */
@Component
public class ValueDemo {

    // 1. 字面量
    @Value("#{100}")
    private Integer literalValue;

    // 2. 系统属性
    @Value("#{systemProperties['user.home']}")
    private String userHome;

    // 3. 环境变量
    @Value("#{systemEnvironment['PATH']}")
    private String path;

    // 4. 配置文件属性
    @Value("${server.port:8080}")
    private Integer serverPort;

    // 5. Bean属性
    @Value("#{userService.userCount}")
    private Integer userCount;

    // 6. 表达式计算
    @Value("#{T(java.lang.Math).random() * 100}")
    private Double randomValue;

    // 7. 列表注入
    @Value("#{'${user.roles}'.split(',')}")
    private List<String> roles;

    // 8. 三元表达式
    @Value("#{${user.enabled:true} ? '启用' : '禁用'}")
    private String userStatus;

    // 9. Elvis运算符
    @Value("#{config.name ?: 'default'}")
    private String configName;

    public void printValues() {
        System.out.println("字面量: " + literalValue);
        System.out.println("用户主目录: " + userHome);
        System.out.println("随机值: " + randomValue);
        System.out.println("用户角色: " + roles);
        System.out.println("用户状态: " + userStatus);
    }
}
```

### Spring Cache ###

```java
/**
 * Spring Cache中使用SpEL
 */
@Service
public class ProductService {

    /**
     * 缓存Key使用SpEL
     */
    @Cacheable(
        value = "products",
        key = "#id",                    // 简单参数
        condition = "#id > 0",          // 缓存条件
        unless = "#result == null"     // 排除条件
    )
    public Product findById(Long id) {
        System.out.println("从数据库查询: " + id);
        return new Product(id, "商品" + id, new BigDecimal("99.99"));
    }

    /**
     * 复杂Key生成
     */
    @Cacheable(
        value = "productList",
        key = "#root.methodName + ':' + #category + ':' + #page + ':' + #size"
    )
    public List<Product> findByCategory(String category, int page, int size) {
        System.out.println("查询分类: " + category);
        return Arrays.asList(new Product(1L, "商品1", new BigDecimal("99.99")));
    }

    /**
     * 使用对象属性作为Key
     */
    @Cacheable(
        value = "searchResults",
        key = "#query.keyword + ':' + #query.page"
    )
    public List<Product> search(SearchQuery query) {
        System.out.println("搜索: " + query.getKeyword());
        return new ArrayList<>();
    }

    /**
     * 缓存删除
     */
    @CacheEvict(
        value = "products",
        key = "#product.id",
        condition = "#product.id != null"
    )
    public void updateProduct(Product product) {
        System.out.println("更新商品: " + product.getId());
    }

    /**
     * 批量删除缓存
     */
    @CacheEvict(value = "products", allEntries = true)
    public void clearAllCache() {
        System.out.println("清空所有缓存");
    }
}

@Data
@AllArgsConstructor
class Product {
    private Long id;
    private String name;
    private BigDecimal price;
}

@Data
class SearchQuery {
    private String keyword;
    private int page;
    private int size;
}

3.3 Spring Security
java 体验AI代码助手 代码解读复制代码/**
 * Spring Security中使用SpEL
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * 方法级权限控制
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return new ArrayList<>();
    }

    /**
     * 基于参数的权限控制
     */
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return new User();
    }

    /**
     * 复杂权限表达式
     */
    @PreAuthorize("hasRole('ADMIN') and #user.department == authentication.principal.department")
    @PostMapping
    public User createUser(@RequestBody User user) {
        return user;
    }

    /**
     * 方法返回后检查
     */
    @PostAuthorize("returnObject.owner == authentication.principal.username")
    @GetMapping("/{id}/details")
    public UserDetails getUserDetails(@PathVariable Long id) {
        return new UserDetails();
    }

    /**
     * 过滤集合
     */
    @PostFilter("filterObject.owner == authentication.principal.username")
    @GetMapping("/my-items")
    public List<Item> getMyItems() {
        return new ArrayList<>();
    }
}

@Data
class UserDetails {
    private Long id;
    private String owner;
}

@Data
class Item {
    private Long id;
    private String owner;
}
```

### Spring事件监听 ###

```java
/**
 * 事件监听中使用SpEL
 */
@Component
public class OrderEventListener {

    /**
     * 条件事件监听
     */
    @EventListener(condition = "#event.order.amount > 1000")
    public void handleLargeOrder(OrderCreatedEvent event) {
        System.out.println("处理大额订单: " + event.getOrder().getAmount());
    }

    /**
     * 复杂条件
     */
    @EventListener(condition = "#event.order.status == 'PAID' and #event.order.amount > 500")
    public void handlePaidOrder(OrderCreatedEvent event) {
        System.out.println("处理已支付订单");
    }

    /**
     * 使用SpEL调用方法
     */
    @EventListener(condition = "#event.isVipOrder()")
    public void handleVipOrder(OrderCreatedEvent event) {
        System.out.println("处理VIP订单");
    }
}

class OrderCreatedEvent extends ApplicationEvent {
    private Order order;

    public OrderCreatedEvent(Object source, Order order) {
        super(source);
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }

    public boolean isVipOrder() {
        return order.getAmount().compareTo(new BigDecimal("5000")) > 0;
    }
}

@Data
class Order {
    private Long id;
    private String status;
    private BigDecimal amount;
}
```

## 四、高级特性 ##

### 自定义函数 ###

```java
/**
 * 自定义函数示例
 */
public class CustomFunctionDemo {

    public static void main(String[] args) throws NoSuchMethodException {
        ExpressionParser parser = new SpelExpressionParser();
        StandardEvaluationContext context = new StandardEvaluationContext();

        // 注册自定义函数
        Method method = StringUtils.class.getDeclaredMethod("reverse", String.class);
        context.registerFunction("reverse", method);

        // 使用自定义函数
        Expression exp = parser.parseExpression("#reverse('Hello')");
        String result = exp.getValue(context, String.class);
        System.out.println("反转: " + result);  // olleH
    }

    static class StringUtils {
        public static String reverse(String str) {
            return new StringBuilder(str).reverse().toString();
        }
    }
}
```

### 变量定义 ###

```java
/**
 * 变量定义示例
 */
public class VariableDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();
        StandardEvaluationContext context = new StandardEvaluationContext();

        // 定义变量
        context.setVariable("name", "张三");
        context.setVariable("age", 25);
        context.setVariable("hobbies", Arrays.asList("篮球", "游泳", "阅读"));

        // 使用变量
        Expression exp1 = parser.parseExpression("#name");
        System.out.println("姓名: " + exp1.getValue(context));  // 张三

        // 在表达式中计算
        Expression exp2 = parser.parseExpression("#age > 18 ? '成年' : '未成年'");
        System.out.println("年龄状态: " + exp2.getValue(context));  // 成年

        // 集合操作
        Expression exp3 = parser.parseExpression("#hobbies.size()");
        System.out.println("爱好数量: " + exp3.getValue(context));  // 3

        // #this和#root
        User user = new User("李四", 30, "lisi@example.com");
        context.setRootObject(user);

        Expression exp4 = parser.parseExpression("#root.name");
        System.out.println("#root: " + exp4.getValue(context));  // 李四

        Expression exp5 = parser.parseExpression("name");
        System.out.println("直接访问: " + exp5.getValue(context));  // 李四
    }
}
```

### Bean引用 ###

```java
/**
 * Bean引用示例
 */
@Configuration
public class BeanReferenceDemo {

    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }

    @Component
    public class ConfigService {

        // 引用Bean
        @Value("#{@dataSource.jdbcUrl}")
        private String jdbcUrl;

        // 调用Bean方法
        @Value("#{@userService.getUserCount()}")
        private Integer userCount;

        // Bean属性访问
        @Value("#{@environment['spring.application.name']}")
        private String appName;
    }

    @Service
    public class UserService {

        public Integer getUserCount() {
            return 100;
        }

        @Cacheable(value = "users", key = "@userService.generateKey(#id)")
        public User findById(Long id) {
            return new User();
        }

        public String generateKey(Long id) {
            return "user:" + id;
        }
    }
}
```

### 类型转换 ###

```java
/**
 * 类型转换示例
 */
public class TypeConversionDemo {

    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

        // 自动类型转换
        Expression exp1 = parser.parseExpression("'100'");
        Integer num = exp1.getValue(Integer.class);
        System.out.println("字符串转整数: " + num);  // 100

        // 显式类型转换
        Expression exp2 = parser.parseExpression("T(Integer).parseInt('123')");
        Integer parsed = exp2.getValue(Integer.class);
        System.out.println("解析整数: " + parsed);  // 123

        // 日期转换
        Expression exp3 = parser.parseExpression(
            "T(java.time.LocalDate).parse('2024-01-01')");
        LocalDate date = exp3.getValue(LocalDate.class);
        System.out.println("日期: " + date);

        // 自定义类型转换
        StandardEvaluationContext context = new StandardEvaluationContext();
        DefaultConversionService conversionService = new DefaultConversionService();
        conversionService.addConverter(new StringToUserConverter());
        context.setTypeConverter(new StandardTypeConverter(conversionService));

        Expression exp4 = parser.parseExpression("'张三,25,zhangsan@example.com'");
        User user = exp4.getValue(context, User.class);
        System.out.println("自定义转换: " + user.getName());
    }

    static class StringToUserConverter implements Converter<String, User> {
        @Override
        public User convert(String source) {
            String[] parts = source.split(",");
            return new User(parts[0], Integer.parseInt(parts[1]), parts[2]);
        }
    }
}
```

## 五、实战案例 ##

### 案例1：动态权限校验 ###

```java
/**
 * 动态权限校验系统
 */
@Service
public class PermissionService {

    @Autowired
    private ExpressionParser parser;

    private final Map<String, String> resourcePermissions = new HashMap<>();

    public PermissionService() {
        // 初始化资源权限表达式
        resourcePermissions.put("/api/users", "hasRole('ADMIN')");
        resourcePermissions.put("/api/users/{id}",
            "hasRole('ADMIN') or #id == principal.id");
        resourcePermissions.put("/api/orders",
            "hasRole('USER') and principal.department == 'SALES'");
    }

    /**
     * 检查权限
     */
    public boolean checkPermission(String resource, Map<String, Object> variables) {
        String expression = resourcePermissions.get(resource);
        if (expression == null) {
            return true;  // 无限制
        }

        StandardEvaluationContext context = new StandardEvaluationContext();

        // 设置变量
        variables.forEach(context::setVariable);

        // 注册自定义函数
        registerFunctions(context);

        Expression exp = parser.parseExpression(expression);
        return Boolean.TRUE.equals(exp.getValue(context, Boolean.class));
    }

    private void registerFunctions(StandardEvaluationContext context) {
        // 注册hasRole函数
        context.setVariable("hasRole", (Function<String, Boolean>) role -> {
            // 模拟从SecurityContext获取角色
            Set<String> roles = getCurrentUserRoles();
            return roles.contains(role);
        });

        // 设置principal
        context.setVariable("principal", getCurrentUser());
    }

    private Set<String> getCurrentUserRoles() {
        return new HashSet<>(Arrays.asList("USER", "ADMIN"));
    }

    private UserPrincipal getCurrentUser() {
        return new UserPrincipal(1L, "zhangsan", "SALES");
    }
}

@Data
@AllArgsConstructor
class UserPrincipal {
    private Long id;
    private String username;
    private String department;
}

/**
 * 使用示例
 */
public class PermissionDemo {
    public static void main(String[] args) {
        PermissionService service = new PermissionService();
        service.parser = new SpelExpressionParser();

        // 检查访问/api/users权限
        boolean canAccess = service.checkPermission("/api/users", new HashMap<>());
        System.out.println("可以访问用户列表: " + canAccess);

        // 检查访问特定用户权限
        Map<String, Object> vars = new HashMap<>();
        vars.put("id", 1L);
        boolean canAccessUser = service.checkPermission("/api/users/{id}", vars);
        System.out.println("可以访问用户1: " + canAccessUser);
    }
}
```

### 案例2：动态查询构建器 ###

```java
/**
 * 动态查询构建器
 */
@Service
public class DynamicQueryService {

    @Autowired
    private ExpressionParser parser;

    /**
     * 根据条件表达式构建查询
     */
    public List<User> query(String condition, Map<String, Object> params) {
        StandardEvaluationContext context = new StandardEvaluationContext();
        params.forEach(context::setVariable);

        // 模拟数据
        List<User> allUsers = Arrays.asList(
            new User("张三", 25, "zhangsan@example.com"),
            new User("李四", 30, "lisi@example.com"),
            new User("王五", 35, "wangwu@example.com"),
            new User("赵六", 28, "zhaoliu@example.com")
        );

        context.setVariable("users", allUsers);

        // 使用SpEL过滤
        String expression = "#users.?[" + condition + "]";
        Expression exp = parser.parseExpression(expression);

        return (List<User>) exp.getValue(context);
    }

    /**
     * 动态排序
     */
    public List<User> sort(List<User> users, String sortExpression) {
        users.sort((u1, u2) -> {
            StandardEvaluationContext context1 = new StandardEvaluationContext(u1);
            StandardEvaluationContext context2 = new StandardEvaluationContext(u2);

            Expression exp = parser.parseExpression(sortExpression);
            Comparable v1 = exp.getValue(context1, Comparable.class);
            Comparable v2 = exp.getValue(context2, Comparable.class);

            return v1.compareTo(v2);
        });

        return users;
    }
}

/**
 * 使用示例
 */
@SpringBootTest
public class DynamicQueryDemo {

    @Autowired
    private DynamicQueryService queryService;

    @Test
    public void testDynamicQuery() {
        // 查询年龄大于25的用户
        Map<String, Object> params1 = new HashMap<>();
        params1.put("minAge", 25);
        List<User> result1 = queryService.query("#this.age > #minAge", params1);
        System.out.println("年龄>25: " + result1.size());

        // 查询邮箱包含特定域名的用户
        Map<String, Object> params2 = new HashMap<>();
        params2.put("domain", "example.com");
        List<User> result2 = queryService.query(
            "#this.email.contains(#domain)", params2);
        System.out.println("邮箱包含example.com: " + result2.size());

        // 复合条件
        Map<String, Object> params3 = new HashMap<>();
        params3.put("minAge", 25);
        params3.put("maxAge", 32);
        List<User> result3 = queryService.query(
            "#this.age >= #minAge and #this.age <= #maxAge", params3);
        System.out.println("年龄25-32: " + result3.size());

        // 动态排序
        List<User> sorted = queryService.sort(result3, "age");
        System.out.println("排序后: " + sorted);
    }
}
```

### 案例3：配置表达式引擎 ###

```java
/**
 * 配置表达式引擎
 */
@Service
public class ConfigExpressionService {

    @Autowired
    private Environment environment;

    @Autowired
    private ExpressionParser parser;

    /**
     * 解析配置表达式
     */
    public <T> T evaluateConfig(String expression, Class<T> type) {
        StandardEvaluationContext context = new StandardEvaluationContext();

        // 添加环境变量
        context.setVariable("env", environment);

        // 添加系统属性
        context.setVariable("sys", System.getProperties());

        // 添加自定义函数
        registerFunctions(context);

        Expression exp = parser.parseExpression(expression);
        return exp.getValue(context, type);
    }

    private void registerFunctions(StandardEvaluationContext context) {
        try {
            // 注册环境相关函数
            context.registerFunction("isProd",
                ConfigExpressionService.class.getMethod("isProdEnvironment"));
            context.registerFunction("isWindows",
                ConfigExpressionService.class.getMethod("isWindows"));
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
    }

    public static boolean isProdEnvironment() {
        String profile = System.getProperty("spring.profiles.active", "");
        return "prod".equals(profile);
    }

    public static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}

/**
 * 配置类
 */
@Configuration
public class DynamicConfig {

    @Autowired
    private ConfigExpressionService configService;

    /**
     * 动态线程池配置
     */
    @Bean
    public ThreadPoolExecutor threadPoolExecutor() {
        // 根据环境动态配置
        int coreSize = configService.evaluateConfig(
            "#isProd() ? 20 : 5", Integer.class);

        int maxSize = configService.evaluateConfig(
            "#isProd() ? 50 : 10", Integer.class);

        int queueSize = configService.evaluateConfig(
            "#isProd() ? 1000 : 100", Integer.class);

        return new ThreadPoolExecutor(
            coreSize, maxSize, 60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(queueSize),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }

    /**
     * 动态数据源配置
     */
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 根据系统动态选择驱动
        String driver = configService.evaluateConfig(
            "#isWindows() ? 'com.mysql.cj.jdbc.Driver' : 'org.postgresql.Driver'",
            String.class);

        config.setDriverClassName(driver);

        return new HikariDataSource(config);
    }
}
```

### 案例4：规则引擎 ###

```java
/**
 * 简单规则引擎
 */
@Service
public class RuleEngine {

    @Autowired
    private ExpressionParser parser;

    private final List<Rule> rules = new ArrayList<>();

    public RuleEngine() {
        initRules();
    }

    private void initRules() {
        // 订单金额折扣规则
        rules.add(new Rule(
            "大额订单折扣",
            "order.amount > 1000",
            "order.discount = 0.9"
        ));

        rules.add(new Rule(
            "VIP用户折扣",
            "user.vip == true",
            "order.discount = order.discount * 0.95"
        ));

        rules.add(new Rule(
            "首单优惠",
            "user.orderCount == 0",
            "order.discount = order.discount * 0.85"
        ));

        rules.add(new Rule(
            "节假日优惠",
            "T(java.time.LocalDate).now().dayOfWeek.value >= 6",
            "order.discount = order.discount * 0.98"
        ));
    }

    /**
     * 执行规则
     */
    public void execute(OrderContext context) {
        StandardEvaluationContext evalContext = new StandardEvaluationContext(context);

        for (Rule rule : rules) {
            // 检查条件
            Expression conditionExp = parser.parseExpression(rule.getCondition());
            Boolean matched = conditionExp.getValue(evalContext, Boolean.class);

            if (Boolean.TRUE.equals(matched)) {
                System.out.println("规则匹配: " + rule.getName());

                // 执行动作
                Expression actionExp = parser.parseExpression(rule.getAction());
                actionExp.getValue(evalContext);
            }
        }
    }
}

@Data
@AllArgsConstructor
class Rule {
    private String name;
    private String condition;
    private String action;
}

@Data
class OrderContext {
    private OrderInfo order;
    private UserInfo user;

    public OrderContext(OrderInfo order, UserInfo user) {
        this.order = order;
        this.user = user;
        this.order.setDiscount(1.0);  // 初始折扣
    }
}

@Data
class OrderInfo {
    private BigDecimal amount;
    private Double discount;

    public BigDecimal getFinalAmount() {
        return amount.multiply(BigDecimal.valueOf(discount));
    }
}

@Data
class UserInfo {
    private boolean vip;
    private int orderCount;
}

/**
 * 使用示例
 */
@SpringBootTest
public class RuleEngineDemo {

    @Autowired
    private RuleEngine ruleEngine;

    @Test
    public void testRuleEngine() {
        // 场景1：大额订单 + VIP用户
        OrderInfo order1 = new OrderInfo();
        order1.setAmount(new BigDecimal("1500"));

        UserInfo user1 = new UserInfo();
        user1.setVip(true);
        user1.setOrderCount(5);

        OrderContext context1 = new OrderContext(order1, user1);
        ruleEngine.execute(context1);

        System.out.println("原价: " + order1.getAmount());
        System.out.println("折扣: " + order1.getDiscount());
        System.out.println("实付: " + order1.getFinalAmount());
        System.out.println();

        // 场景2：首单用户
        OrderInfo order2 = new OrderInfo();
        order2.setAmount(new BigDecimal("500"));

        UserInfo user2 = new UserInfo();
        user2.setVip(false);
        user2.setOrderCount(0);

        OrderContext context2 = new OrderContext(order2, user2);
        ruleEngine.execute(context2);

        System.out.println("原价: " + order2.getAmount());
        System.out.println("折扣: " + order2.getDiscount());
        System.out.println("实付: " + order2.getFinalAmount());
    }
}
```

## 六、性能优化 ##

### 表达式缓存 ###

```java
/**
 * 表达式缓存
 */
@Service
public class CachedExpressionService {

    private final ExpressionParser parser = new SpelExpressionParser();
    private final Map<String, Expression> cache = new ConcurrentHashMap<>();

    /**
     * 获取表达式（带缓存）
     */
    public Expression getExpression(String expressionString) {
        return cache.computeIfAbsent(expressionString, parser::parseExpression);
    }

    /**
     * 评估表达式
     */
    public <T> T evaluate(String expressionString, Object rootObject, Class<T> type) {
        Expression exp = getExpression(expressionString);
        return exp.getValue(rootObject, type);
    }

    /**
     * 性能测试
     */
    public void performanceTest() {
        String expr = "name.toUpperCase() + ' - ' + age";
        User user = new User("张三", 25, "zhangsan@example.com");

        // 不使用缓存
        long start1 = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            parser.parseExpression(expr).getValue(user, String.class);
        }
        long time1 = System.currentTimeMillis() - start1;

        // 使用缓存
        long start2 = System.currentTimeMillis();
        Expression cached = getExpression(expr);
        for (int i = 0; i < 10000; i++) {
            cached.getValue(user, String.class);
        }
        long time2 = System.currentTimeMillis() - start2;

        System.out.println("不使用缓存: " + time1 + "ms");
        System.out.println("使用缓存: " + time2 + "ms");
        System.out.println("性能提升: " + (time1 - time2) + "ms");
    }
}
```

### 编译模式 ###

```java
/**
 * 编译模式优化
 */
public class CompilationDemo {

    public static void main(String[] args) {
        SpelExpressionParser parser = new SpelExpressionParser();
        SpelParserConfiguration config = new SpelParserConfiguration(
            SpelCompilerMode.IMMEDIATE,  // 立即编译
            null
        );
        SpelExpressionParser compilingParser = new SpelExpressionParser(config);

        String expr = "#this * 2 + 1";
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

        // 普通模式
        long start1 = System.currentTimeMillis();
        Expression exp1 = parser.parseExpression(expr);
        StandardEvaluationContext context1 = new StandardEvaluationContext();
        for (int i = 0; i < 100000; i++) {
            for (Integer num : numbers) {
                context1.setRootObject(num);
                exp1.getValue(context1);
            }
        }
        long time1 = System.currentTimeMillis() - start1;

        // 编译模式
        long start2 = System.currentTimeMillis();
        Expression exp2 = compilingParser.parseExpression(expr);
        StandardEvaluationContext context2 = new StandardEvaluationContext();
        for (int i = 0; i < 100000; i++) {
            for (Integer num : numbers) {
                context2.setRootObject(num);
                exp2.getValue(context2);
            }
        }
        long time2 = System.currentTimeMillis() - start2;

        System.out.println("普通模式: " + time1 + "ms");
        System.out.println("编译模式: " + time2 + "ms");
        System.out.println("性能提升: " + ((time1 - time2) * 100.0 / time1) + "%");
    }
}
```

## 七、最佳实践 ##

### 安全性 ###

```java
/**
 * SpEL安全性最佳实践
 */
public class SecurityDemo {

    /**
     * ❌ 不安全：直接使用用户输入
     */
    public void unsafeEvaluation(String userInput) {
        ExpressionParser parser = new SpelExpressionParser();
        Expression exp = parser.parseExpression(userInput);
        // 危险！用户可以执行任意代码
        // 如输入：T(java.lang.Runtime).getRuntime().exec('rm -rf /')
        exp.getValue();
    }

    /**
     * ✓ 安全：使用SimpleEvaluationContext
     */
    public void safeEvaluation(String userInput) {
        ExpressionParser parser = new SpelExpressionParser();

        // 创建受限的上下文
        SimpleEvaluationContext context = SimpleEvaluationContext
            .forReadOnlyDataBinding()  // 只读绑定
            .build();

        Expression exp = parser.parseExpression(userInput);
        // 只能访问有限的功能
        exp.getValue(context);
    }

    /**
     * ✓ 安全：白名单验证
     */
    public void validatedEvaluation(String userInput) {
        // 白名单验证
        if (!isValidExpression(userInput)) {
            throw new IllegalArgumentException("非法表达式");
        }

        ExpressionParser parser = new SpelExpressionParser();
        Expression exp = parser.parseExpression(userInput);
        exp.getValue();
    }

    private boolean isValidExpression(String expr) {
        // 只允许简单的属性访问和运算符
        return expr.matches("^[a-zA-Z0-9.+\\-*/()\\s]+$");
    }
}
```

### 错误处理 ###

```java
/**
 * 错误处理最佳实践
 */
public class ErrorHandlingDemo {

    private final ExpressionParser parser = new SpelExpressionParser();

    /**
     * 安全的表达式求值
     */
    public <T> Optional<T> safeEvaluate(String expr, Object root, Class<T> type) {
        try {
            Expression expression = parser.parseExpression(expr);
            T value = expression.getValue(root, type);
            return Optional.ofNullable(value);

        } catch (ParseException e) {
            // 表达式语法错误
            System.err.println("表达式解析失败: " + e.getMessage());
            return Optional.empty();

        } catch (EvaluationException e) {
            // 表达式求值错误
            System.err.println("表达式求值失败: " + e.getMessage());
            return Optional.empty();

        } catch (Exception e) {
            // 其他错误
            System.err.println("未知错误: " + e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 带默认值的求值
     */
    public <T> T evaluateWithDefault(String expr, Object root,
                                     Class<T> type, T defaultValue) {
        return safeEvaluate(expr, root, type).orElse(defaultValue);
    }
}
```

## 八、总结 ##

### 核心知识点回顾 ###

```txt
Spring表达式语言(SpEL)核心要点
│
├── 基础语法
│   ├── 字面量表达式
│   ├── 属性访问（含安全导航）
│   ├── 方法调用
│   ├── 运算符
│   ├── 集合操作
│   └── 正则表达式
│
├── Spring集成
│   ├── @Value注解
│   ├── Spring Cache
│   ├── Spring Security
│   └── 事件监听
│
├── 高级特性
│   ├── 自定义函数
│   ├── 变量定义
│   ├── Bean引用
│   └── 类型转换
│
├── 实战应用
│   ├── 动态权限校验
│   ├── 动态查询构建
│   ├── 配置表达式引擎
│   └── 规则引擎
│
└── 最佳实践
    ├── 表达式缓存
    ├── 编译模式
    ├── 安全性控制
    └── 错误处理
```

SpEL是Spring框架的重要组成部分，它提供了强大而灵活的表达式计算能力。掌握SpEL不仅能帮助我们更好地使用Spring的各种特性，还能在实际项目中构建动态、可配置的系统。在使用SpEL时，要特别注意安全性问题，避免执行不受信任的表达式。
