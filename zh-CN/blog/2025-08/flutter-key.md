---
lastUpdated: true
commentabled: true
recommended: true
title: flutter key：ValueKey、ObjectKey、UniqueKey、GlobalKey的使用场景
description: flutter key：ValueKey、ObjectKey、UniqueKey、GlobalKey的使用场景
date: 2025-08-06 13:25:00  
pageClass: blog-page-class
cover: /covers/flutter.svg
---

在 Flutter 中，`Key` 的主要作用是用于标识 `Widget` ，帮助框架在 `Widget` 重建过程中更好地进行复用、比对和更新，从而提升性能并避免 UI 异常重建。

## 一、Key 的作用 ##

在 Widget 重建时，Flutter 会尝试复用旧 Widget 树中的元素。如果没有 `Key`，Flutter 只能通过 Widget 类型和位置来判断是否可以复用。如果 Widget 类型相同但内容不同，就可能出现 UI 错乱，例如 `ListView` 滚动后元素错位等问题。

引入 `Key` 后，Flutter 可以精准识别一个 Widget 的身份，即使它的位置发生变化，也能进行正确的复用或替换，避免不必要的重建。

## 二、Key 类型详解及最优使用场景 ##

### LocalKey（抽象类） ###

- 所有局部键（`ValueKey`、`ObjectKey`、`UniqueKey`）的基类。
- 作用范围仅限于当前 widget subtree，不会跨 widget 树传递。
- 通常我们不直接使用它，但它是以下常见 key 的基础。

### UniqueKey ###

- 每次创建时都唯一，即使内容相同也不会相等。
- 用于标识 完全独立的 widget 实例，防止复用。

**✅ 推荐场景**

- `AnimatedList`、`ReorderableListView` 中动态添加的元素，每个 item 都应该是一个唯一实例。

```dart
List<Widget> items = data.map((item) => 
    MyItemWidget(
        key: UniqueKey(), 
        data: item)
    ).toList();
```

**⛔ 注意**

- 频繁使用 `UniqueKey` 会导致 widget 无法复用，增加重建成本。

### `ValueKey<T>(value)` ###

- 用于通过一个简单的值（如字符串、数字）标识 widget。
- 当 value 相等时，Key 被认为是相同的。

**✅ 推荐场景**

`ListView.builder` 渲染列表时，item 有稳定的 ID。

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return MyItemWidget(key: ValueKey(item.id), data: item);
  },
);
```

✅ 性能最优：因为 Flutter 能通过 value 快速查找旧元素并复用。

### ObjectKey(Object value) ###

- 使用任意对象作为 key 的值，内部使用 `==` 和 `hashCode` 比较。
- 常用于 model 本身作为标识。

**✅ 推荐场景**

`ListView` 中 item 是复杂 model，且 `==` 方法已重载。

```dart
ListView(
  children: models.map((model) => MyItemWidget(key: ObjectKey(model), data: model)).toList(),
);
```

### GlobalKey ###

- 不仅用于识别 widget，还能访问其 `State`、`BuildContext` 等。
- 适用于需要跨 widget 树访问的场景。

**✅ 推荐场景**

表单校验（Form）：

```dart
final _formKey = GlobalKey<FormState>();
Form(key: _formKey, child: ...)
```

拿到某个 widget 的位置、尺寸等。

**⛔ 注意**

慎用。每个 `GlobalKey` 都会注册在全局表中，有内存开销且会影响 diff 性能。

## 三、使用场景 ##

下面我用实际 Flutter 示例分别演示 `UniqueKey`、`ValueKey`、`ObjectKey` 和 `GlobalKey` 的典型使用场景，并说明为什么这样使用是最合适的。

### `UniqueKey` 示例：避免动画/排序时 widget 重用 ###

```dart
class UniqueKeyExample extends StatefulWidget {
  @override
  _UniqueKeyExampleState createState() => _UniqueKeyExampleState();
}

class _UniqueKeyExampleState extends State<UniqueKeyExample> {
  List<Color> colors = [Colors.red, Colors.green, Colors.blue];

  void _shuffle() {
    setState(() {
      colors.shuffle();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(onPressed: _shuffle, child: Text("Shuffle")),
        Column(
          children: colors
              .map((color) => Container(
                    key: UniqueKey(), // 强制每次都当作新 widget
                    width: 100,
                    height: 50,
                    margin: EdgeInsets.all(5),
                    color: color,
                  ))
              .toList(),
        )
      ],
    );
  }
}
```

📌 场景说明：

- 每次 `shuffle` 后，Flutter 因 key 不同，全部重新构建，适合动画或删除效果。
- 不适合频繁更新但数据稳定的列表（浪费性能）。

### `ValueKey` 示例：按 id 精准复用列表项 ###

```dart
class ValueKeyExample extends StatefulWidget {
  @override
  _ValueKeyExampleState createState() => _ValueKeyExampleState();
}

class _ValueKeyExampleState extends State<ValueKeyExample> {
  List<Map<String, dynamic>> users = [
    {'id': 1, 'name': 'Alice'},
    {'id': 2, 'name': 'Bob'},
    {'id': 3, 'name': 'Charlie'},
  ];

  void _reverseList() {
    setState(() {
      users = users.reversed.toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(onPressed: _reverseList, child: Text("Reverse")),
        Column(
          children: users
              .map((user) => ListTile(
                    key: ValueKey(user['id']), // 稳定 id，避免错位
                    title: Text(user['name']),
                  ))
              .toList(),
        ),
      ],
    );
  }
}
```

📌 场景说明：

- 即使顺序变化，ID 不变时 Flutter 可以复用旧 widget，性能最佳。
- 非常适合列表、`Grid`、`Sliver` 等需要频繁重建但内容稳定的场景。

### `ObjectKey` 示例：使用对象做 key，要求对象有适当的 `==` 和 `hashCode` ###

```dart
class Person {
  final String name;
  final int age;

  Person(this.name, this.age);

  @override
  bool operator ==(Object other) =>
      other is Person && name == other.name && age == other.age;

  @override
  int get hashCode => name.hashCode ^ age.hashCode;
}

class ObjectKeyExample extends StatelessWidget {
  final List<Person> people = [
    Person('Lily', 18),
    Person('John', 20),
    Person('Zoe', 22),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: people
          .map((person) => ListTile(
                key: ObjectKey(person),
                title: Text("${person.name} (${person.age})"),
              ))
          .toList(),
    );
  }
}
```

📌 场景说明：

- 如果对象是业务主数据，可直接用对象作为 key，更自然。
- `==` 必须重写，否则可能导致判断失败。

### `GlobalKey` 示例：跨 Widget 获取状态或 BuildContext ###

```dart
class GlobalKeyExample extends StatelessWidget {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey, // 全局 Key 可访问 FormState
      child: Column(
        children: [
          TextFormField(
            validator: (value) => value == null || value.isEmpty ? 'Required' : null,
          ),
          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Valid!")));
              }
            },
            child: Text("Validate"),
          )
        ],
      ),
    );
  }
}
```

📌 场景说明：

- 用于需要访问状态的组件（例如 `FormState`、`ScaffoldState`）。
- 尽量少用，避免性能问题和 widget 树混乱。

## 四、性能最优的理由总结 ##

| Key类型  |  是否可复用  |  查找效率  |   使用开销 |  性能适用场景 |
| :-------: | :---------: | :--------: | :----------: | :----------: |
| UniqueKey | ❌（不可复用） | ❌（唯一） | 高 | 插入/删除动画 |
| ValueKey | ✅（可复用） | ✅（快速） | 低 | 稳定 ID 的列表 |
| ObjectKey | ✅（可复用） | ⚠️（依赖==） | 中 | 对象有 `==` 重载 |
| GlobalKey | ✅（全局） | ❌（慢） | 高 | 需要状态访问 |

### 所以为什么合理使用 key 能让性能最优？ ###

- **减少 widget 重建** —— Flutter 会 diff 前后 widget 树，key 能帮它“识别出自己”。
- **减少 render tree 重建** —— 精准复用 element 和 render object，降低布局/绘制开销。
- **避免 UI 闪动或动画异常** —— 保持 UI 状态稳定的一致性。
