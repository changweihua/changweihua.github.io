---
outline: false
aside: false
layout: doc
date: 2025-03
title: systemd定时器
description: systemd定时器
category: 工具
pageClass: manual-page-class
---

在这篇攻略中，你会学到如何使用systemd定时器、探索它们的格式，并看到一些实用的例子和用例。到文章结束时，你将对如何使用systemd定时器有了扎实的理解。

##  什么是systemd定时器？ ##

一个systemd定时器就是用来安排在特定时间或间隔内执行任务或服务的一个单元文件。它类似于cron作业，但拥有更多的特性，并且与systemd生态系统有更好的集成。

相比于cron，systemd定时器具有以下优点：

- 更好地集中管理（通过systemctl）以提供更好的日志记录和错误跟踪。
- 与systemd服务更深层次的整合。
- 详细的日志记录功能journalctl。
- 更灵活、强大的调度选项。

默认情况下你的系统中已经运行了一些定时器，可以使用下面这条命令列出所有可用的定时器：

```bash
systemctl list-timers --all
```

例如，systemd-tmpfiles-clean.timer会根据tmpfiles.d定义的规则，在临时目录（如/tmp和/var/tmp）中清除过期文件。

## systemd 定时器的工作原理？ ##

与使用单一文件安排任务的cron不同，systemd定时器使用两个关键文件：服务和服务定时器文件。

- 定时器文件：指定任务何时执行（例如，每天、每周或特定时间点）。
- 服务文件：定义任务的具体内容（要运行的脚本或命令）。

定时器文件与服务文件是关联在一起的。也就是说，定时器决定调度安排，而服务处理实际的工作。

举个例子，如果你想每天都执行一个备份脚本：

1. 创建一个服务文件来定义将被执行的脚本。
2. 创建一个定时器文件设置该服务的运行时间表（例如每天午夜）。
3. 你可以像管理其他服务一样控制这些定时器。使用命令如 `systemctl start`, `systemctl stop`, `systemctl enable` 或 `systemctl status`来操作它们。

```ini
# 示例：创建一个简单的定时器文件 daily-backup.timer
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=daily
Persistent=true
Unit=daily-backup.service

[Install]
WantedBy=timers.target
```

```ini
# 对应的服务文件 daily-backup.service
[Unit]
Description=Run Daily Backup Script

[Service]
ExecStart=/usr/local/bin/backup.sh
```

现在你已经知道systemd定时器的原理和基本用法了，快去实践一下吧！

## 理解 Systemd 定时器表达式 ##

大家好，今天我们来聊聊 Systemd 的定时器（Timer）配置。不要害怕，这其实挺好玩的！先来看看基本语法：

```bash
* *-*-* *:*:*
```

这里有一个超级重要的秘密：“*” 表示每……。比如说，如果你写成 `* *-*-* *:*:*` ，那就意味着它会每一秒都运行一次直到你停止它（哈哈，这可能有点疯狂）。

具体来说：

- 第一个“*”代表一周中的每一天，从周日到周六。
- “*--”表示日期年月日。
- “*:**:”表示时间小时分钟秒。

### 理解 Systemd 定时器触发 ###

Systemd 定时器提供了很多酷炫的调度选项来定义什么时候执行任务。让我们轻松一下：

### 时间基触发 ###

这些相对定时器从特定事件开始计数。它们使用 `OnActiveSec`, `OnBootSec`, `OnStartupSec`, `OnUnitActiveSec` 和 `OnUnitInactiveSec` 选项。

举几个例子吧：

- `OnBootSec=1h` ：在系统启动后一小时运行。
- `OnUnitActiveSec=1d` ：服务上次激活后一天运行。
- `OnActiveSec=30min` ：定时器自身激活后半小时运行。

### 日历基触发 ###

这些基于预定义日期或周期性时间表，比如每天午夜、每周一早上九点，甚至每月第一天。完美适合那些需要遵循固定时间表的任务。

举几个例子吧：

- `OnCalendar=Mon,Thu --* 16:00:00` ：每周一和周四下午四点钟运行。
- `OnCalendar=--* *:00:00` ：每小时开始时运行。
- `OnCalendar=--* 9..17:00:00` ：从早上九点到五点，每隔一个小时运行。

示例列表

| 定义 | Systemd 定时器等价 | 描述 |
| :---: | :----: | :---: |
| 系统启动后 | OnBootSec=30s | 启动后 30 秒运行 |
| 每年一次 | OnCalendar=*-1-1 | 每年一月一日 |
| 每季度一次 | OnCalendar=quarterly | 每三个月一次 |
| 每月一次 | OnCalendar=*-*-1 | 每个月的第一天 |
| 每周一次 | OnCalendar=Sun | 每周日 |
| 每日一次 | OnCalendar=*-*-* 00:00:00 | 每天午夜 |
| 每小时一次 | OnCalendar=*-*-* *:00:00 | 每小时开始时 |
| 每周一早上九点 | OnCalendar=Mon 09:00:00 | 每周一早上九点钟 |

就这样，轻松搞定 Systemd 定时器！希望这能让大家觉得定时任务没那么枯燥。

- 第一天的月初定时任务
  - OnCalendar=--01 00:00:00
  - 这表示每个月的第一天午夜（凌晨0点）运行一次。
- 周末下午2点定时任务
  - OnCalendar=Sat,Sun 14:00
  - 每周六和周日下午两点执行一次，记得给自己泡杯咖啡哦！
- 半年一次的定时任务
  - OnCalendar=semiannually
  - 这表示一年两次的任务，就像春分和秋分一样规律。

## systemd 定时器表达式实例 ##

现在你对systemd定时器表达式的结构和触发机制有了初步了解。接下来让我们看看一些实际应用的例子吧！
💡
系统定时任务的语法与cron不同，它提供了更多的灵活性来表示时间和日期。

| 描述 | 表达式 | 说明 |
| :---: | :----: | :---: |
| 每周五分钟执行一次（仅限周末） | Sat,Sun --* *:0/5:00 | 星期六和星期日的每五分钟执行一次，注意不要在休息时打扰到自己！ |
| 每天午夜及中午运行 | --* 0,12:00:00 | 每天凌晨零点和正午十二点各运行一次，可以安排在这两个时间吃点心。 |
| 凌晨开始每两小时执行一次 | --* 0-23/2:00:00 | 从零点到二十三点每隔两个小时执行一次，适合那些需要定时检查的任务。 |
| 每月第一天和十五日午夜运行 | --1,15 0:00:00 | 在每个月的1号和15号凌晨运行任务，记得给自己定个闹钟哦！ |

### systemd 定时器文件 ###

现在我们来了解下systemd定时器文件的基本构成。

一个典型的systemd定时器文件通常包含以下三部分：

- Unit：描述这个定时器。
- Timer：指定调度信息。
- Install：定义启动方式和目标。

这里有一个简单的定时器文件示例：

```ini
[Unit]
Description=A simple systemd timer

[Timer]
OnBootSec=10min
OnUnitActiveSec=1h
OnCalendar=Mon 10:10

[Install]
WantedBy=multi-user.target
```

- OnBootSec 设置定时器在系统启动后十分钟后开始运行。
- OnUnitActiveSec 在服务启动后一小时触发一次定时任务，这表示每个小时执行一次。
- OnCalendar 定义了每周一上午十点十分的定时运行时间。
- Persistent=true 表示如果错过了定时运行的时间，在系统重启时会补上错过的时间。
- WantedBy 确保在启动时自动链接到multi-user.target，使定时器可以自动开始执行。

更多关于配置的信息可以通过man命令查询。

### systemd 服务文件 ###

接下来我们要看看systemd服务文件的内容了。

像 systemd 定时器文件一样，systemd 服务文件也由三个部分组成：

- Unit：描述服务。
- Service：定义要执行的内容。
- Install：指定如何启动该单元以及目标。

这里是一个简单的服务文件示例：

```ini
[Timer]
OnCalendar=Mon-Fri:02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

在 Service 部分，你可以设置以下选项：

- ExecStart：要执行的命令或脚本。
- Restart：定义何时重启，可以是 on-failure 或 always。
- RestartSec：重启前等待的时间。
- StartLimitInterval：如果最大重试次数被达到，则等待指定时间后才允许再尝试启动。
- StartLimitBurst：在间隔内允许的最大尝试次数。

举个例子，假设服务在执行命令时失败了，它会尝试重新启动2次。如果重启限制已经达到了，那么它会在10分钟后再次尝试启动。在此期间，重启计数器会被重置，允许服务再试一次。

你可以使用 man 命令来获取更多关于定时器配置的信息。

## 实战演练：设置 Systemd 定时器 ##

让我们创建一个每周一至周五每两分钟写入文件的系统定时器。重要提示：这是一个演示示例，用于帮助理解 systemd 定时器。在实际场景中，备份通常会在午夜或每隔两天进行一次。这里使用2分钟的时间间隔是为了学习目的，以便快速看到结果。

按照以下步骤创建并测试一个systemd定时器：

### 第一步：编写脚本 ###

首先，创建一个名为 backup.sh 的脚本，该脚本由 systemd 定时器需要运行。

添加如下内容：

```bash
#!/bin/bash
echo "Backup Completed! $(date)" >> /tmp/backup_output.log
```

这个文件会在 /tmp/backup_output.log 中写入“Backup Completed!”及当前时间和日期信息。

将脚本 backup.sh 设为可执行的：

```bash
chmod +x backup.sh
```

### 第二步：创建服务文件 ###

在服务文件中定义你希望执行的任务。我们来创建一个名为 backup.service 的文件，添加如下内容：

```ini
[Unit]
Description=Backup Script

[Service]
ExecStart=/path/to/backup.sh
Restart=on-failure
RestartSec=10s
StartLimitInterval=60s
StartLimitBurst=5
```

这里我们已经添加了重启功能，如果服务以非零退出码结束，则会尝试在定义的时间间隔内重新启动至指定的次数。

### 第三步：创建定时器文件 ###

接下来，我们将按照以下格式创建一个定时器文件：

```ini
[Unit]
Description=Backup Timer

[Timer]
OnCalendar=Mon-Fri:02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

以上就是设置 systemd 定时器的基本步骤，赶紧试试吧！

### 创建定时器文件，轻松搞定备份任务 ###

现在我们来创建一个定时器文件以安排服务。我们将这个文件命名为 backup.timer。

在文件中添加如下内容：

```ini
[Timer]
OnCalendar=Mon..Fri *-*-* *:0/2:00
Persistent=true
```
这里，表达式 Mon..Fri *-*-* *:0/2:00 表示从周一到周五每两分钟触发一次任务。而 Persistent=true 则确保在系统重启后执行任何错过的运行。

### 启用并启动定时器 ###

要让系统识别新的文件，我们需要重新加载 systemd：

```bash
sudo systemctl daemon-reload
```

然后启用和启动定时器：

```bash
sudo systemctl enable backup.timer
sudo systemctl start backup.timer
```

### 验证定时器状态 ###

过两分钟后，检查 /tmp/backup_output.log 文件，看看是否每两分钟写入一次。

你可以看到文件中确实每两分钟被写入了一次。

让我们查看 backup.service 的日志以了解其输出情况：

```bash
journalctl -u backup.service
```

你会发现在日志里 backup.service 每两分钟执行一次备份脚本，并在完成任务后成功停止服务。

你还可以列出所有已安排的定时器：

```bash
systemctl list-timers --all
```

### 清理定时器 ###

一旦不再需要该定时器，你可以选择停止或删除它。

如果你想停止定时器，可以运行以下命令：

```bash
sudo systemctl stop backup.timer
```

如果你想彻底移除定时器，则需删除 backup.timer 和 backup.service 文件，并重新加载 systemd：

```bash
rm /etc/systemd/system/backup.timer
rm /etc/systemd/system/backup.service
sudo systemctl daemon-reload
```

## 解决 Systemd 定时器问题 ##

如果遇到问题，请尝试以下步骤来解决问题：

- 如果对定时器或服务文件进行了修改，需要重新加载 systemd：

```bash
sudo systemctl daemon-reload
```

- 直接启动服务以确保其正常工作：

```bash
sudo systemctl start <service-name>.service
```

- 查看日志信息：

```bash
journalctl -u <timer-name>.service
```

- 检查定时器状态：

```bash
sudo systemctl status <timer-name>.timer
```

## Systemd 定时器的优势 ##

- 使用 journalctl 查看定时器和服务的日志信息。
- 通过设置 Persistent=true，在系统重启后可以执行任何错过的任务。
- 使用 systemctl status 轻松检查定时器和服务的状态。
- 定时器与 systemd 服务直接集成，简化了依赖关系管理。

## OnCalendar的魔法时刻 ##

OnCalendar这个家伙就像是你的私人调度员，无论是日常备份还是系统维护任务，它都能轻松搞定。比如定时在启动后几秒内执行某个操作（用 OnBootSec），或者在服务活跃一段时间之后执行某些事情（用 OnUnitActiveSec）。

## 真实世界的魔法时刻 ##

这里有一些常见的场景，让你看看systemd timers是如何大展神威的：

- 日常备份：定时创建那些令人头疼的系统快照。
- 自动化维护任务：例如日志清理、磁盘整理和更新管理。这些活儿交给systemd timers，你就可以放心地喝杯咖啡了！
- 健康检查脚本：定期运行监控脚本以确保一切都正常运转。

## 结论 ##

Systemd timers就像是Linux世界的魔法棒，它们是现代cron的替代品，提供了增强的功能、更好的集成和更强大的日志记录能力。无论是管理备份、执行维护任务还是自动化部署，systemd timers都能为你提供一个灵活且可靠的解决方案！

> 温馨提示： 不要犹豫，赶快试试systemd timers吧！你会发现你的Linux环境变得更加简单和高效。
