---
lastUpdated: true
commentabled: true
recommended: true
title: Android Studio 新版 Logcat
description: Android Studio 新版 Logcat
date: 2026-08-07 09:15:00
pageClass: blog-page-class
cover: /covers/android.svg
---

## 新版核心变化（和旧版区别） ##

- 采用 `字段:值` 键值对语法，支持*精确匹配、正则匹配、反向排除、多条件组合*；
- 自动联想提示（你截图里下拉列表就是语法提示）；
- 支持多条件空格叠加，同时生效（交集逻辑）。

*常用方法*：

```bash
# 多个key可以之间用空格，多个value之间用|；
tag~:CarTrace message~:PermissionUtils|CarPermissionConfig
#
tag~:CarTrace  level:error
#
tag~:CarTrace  message~:PermissionUtils|com.cars.adapterservice.demo.car_property
#
tag~:PermissionUtils package=:com.cars.adapterservice.demo.car_property
```

- 空格：区分「不同字段」（tag 字段 和 message 字段）

- `|` 竖线：同一个字段内部多个元素的分割符

### 基础符号规则（看懂截图里的 `tag~:` `package~:`） ###

| 符号 | 作用 | 示例与说明 |
| :--- | :--- | :--- |
| `字段:xxx` | 精确完整匹配，完全相等才命中 | `tag:PermissionUtils`*只匹配 TAG 完全等于 PermissionUtils 的日志* |
| `字段~:xxx` | 正则模糊匹配（截图里全部带 `~` 的就是这个） | `tag~:Permission`*匹配 TAG 包含 Permission 的所有日志* |
| `-字段:xxx` | 反向排除，不显示这条日志 | `-tag:System`*过滤掉 TAG 严格等于 System 的日志* |
| `-字段~:xxx` | 正则排除，剔除符合正则的日志 | `-tag~:System`*同时过滤掉 TAG 包含 System 或 UI 的日志* |

## 全部内置过滤字段（日常高频） ##

### package 包名过滤（最常用） ###

```bash
# 只看当前调试App日志（一键过滤系统杂日志，必记）
package:mine

# 精确匹配完整包名
package:com.cars.adapterservice.china

# 正则匹配包名（包含某段包路径）
package~:cars.adapter

# 排除其他第三方包
package:mine -package:com.android
```

截图里的 `package:mine`、`package~:com.cars.adapterservice.china `就是这个语法。

### tag TAG 过滤（你最关心的 log.xxx） ###

#### 精确匹配（完整 TAG） ####

```makefile
# 只看 PermissionUtils 这个TAG
tag:PermissionUtils
# 只看 DataCenterProvider
tag:DataCenterProvider
```

正则模糊匹配（截图里 `tag~:` 系列，匹配包含关键字的 TAG）

```ruby
# 所有包含 Permission 的TAG（PermissionUtils、PermissionTest 都会出来）
tag~:Permission

# 多TAG同时匹配（正则 | 分隔）
tag~:PermissionUtils|DataCenterUtils|CarService

# 匹配前缀为CarService的所有TAG
tag~:^CarService.*

# 排除指定TAG
package:mine -tag~:System|ActivityManager
```

截图里 `tag~:PermissionUtils`、`tag~:CarService|CarPropertyViewModel` 就是正则多 TAG 匹配。

### level 日志等级过滤 ###

等级：`verbose` / `debug` / `info` / `warn` / `error` / `assert`

```makefile
# 只看Error级别日志
level:error

# 只看Warn+Error
level~:warn|error

# 过滤掉Verbose调试日志
-level:verbose
```

截图里 `level:error` 就是只展示报错日志。

### message 日志内容过滤（搜日志里打印的文字） ###

```makefile
# 精确匹配日志内容完整文字
message:"加载数据失败"

# 正则模糊搜索包含关键字的日志
message~:权限申请|Property变更

# 过滤掉无用打印
-message~:心跳包
```

### process 进程过滤（多进程项目） ###

```ruby
# 匹配进程名
process:car_service
# 正则匹配多进程
process~:adapter|car
```

### 其他辅助字段 ###

- `age:10m`：只展示 10 分钟内的日志
- `is:stacktrace`：只展示崩溃堆栈日志
- `line:xxx`：匹配日志行内任意内容（等价于全局搜索）

## 多条件组合写法（日常开发最实用） ##

多个条件用*空格隔开*，同时满足才显示日志（交集）

### 示例 1：只看自己 App、Error 级别、TAG 含 CarService ###

```bash
package:mine level:error tag~:CarService
```

### 示例 2：只看权限相关 TAG，过滤系统日志 ###

```bash
package:mine tag~:Permission
```

### 示例 3：只看 CarProperty 相关日志，排除系统打印 ###

```bash
package:mine tag~:CarProperty -tag~:System
```

### 示例 4：同时监控多个业务 TAG，只看 Debug 及以上 ###

```bash
package:mine tag~:PermissionUtils|DataCenterProvider level~:debug|info|warn|error
```

## 针对你截图场景的实操示例 ##

你的日志 TAG：`PermissionUtils`、`DataCenterUtils`、`CarService|CarPropertyViewModel`

### 只看权限模块日志 ###

```bash
package:mine tag~:Permission
```

### 同时看权限 + 数据中心模块 ###

```bash
package:mine tag~:PermissionUtils|DataCenterUtils
```

### 只看车辆属性相关报错 ###

```bash
package:mine tag~:CarService level:error
```

### 过滤所有系统杂日志，只保留业务 TAG ###

```bash
package:mine tag~:PermissionUtils|DataCenterUtils|CarService -tag~:android|System
```

## 保存常用过滤模板（不用每次重复输入） ##

1. 输入过滤语句；
2. 输入框左侧星号⭐按钮点击，保存为预设过滤器；
3. 下次直接下拉选择，不用重复敲语法。

## 常见踩坑 & 技巧 ##

- **模糊匹配必须带`~`**直接写 `tag:Permission` 只会匹配 TAG 完全等于Permission，不会匹配 `PermissionUtils`；想要包含关键字必须 `tag~:Permission`。
- 多 TAG 同时匹配用 `|` 分隔正则 `tag~:A|B|C` 一次性匹配多个 TAG，不用写多条过滤。
- 快速降噪万能开头所有过滤语句最前面加上 `package:mine`，直接过滤 90% 系统、第三方进程垃圾日志。
**想切回旧版 Logcat（怀旧）**File → Settings → Experimental → Logcat → 取消勾选 Enable new Logcat tool window，重启 AS 恢复旧版。
- 引号处理带空格的 TAG / 内容TAG 带空格时：`tag:"My Permission Util"`
- 正则特殊字符转义TAG 含 `.` `|`  等符号，需要反斜杠转义 `tag~:CarService|CarProperty`

## 最简速查口诀 ##

- 精确匹配：`字段:完整值`
- 模糊搜 TAG / 包：`字段~:关键词`
- 排除日志：`-字段:值` / `-字段~:关键词`
- 只看自己 App：前缀必加 `package:mine`
- 多条件叠加：空格分隔多个过滤语句
