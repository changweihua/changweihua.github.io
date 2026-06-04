---
lastUpdated: true
commentabled: true
recommended: true
title: Jenkins Pipeline 定时构建
description: 两种配置方式的硬核对比！
date: 2026-05-28 08:45:00 
pageClass: blog-page-class
cover: /covers/devops.svg
---

你是否曾经因为在 Jenkins Pipeline 中配置定时构建时遇到过问题，而感到头疼？定时构建作为 Jenkins 的基础功能之一，其配置方式的差异可能会导致意想不到的结果，尤其是在流水线规模逐渐扩大时。今天，我们就来探讨两种定时构建的配置方式，看看它们在实际应用中的表现如何，让你在选择时更加得心应手。

在 Jenkins Pipeline 中，定时构建可以通过 `triggers` 块来实现。这里，我们将对比使用 `cron` 和 `pollSCM` 两种触发器的配置方式。每种方式都有其特色和适用场景，我们将通过具体的代码示例和性能数据来分析它们的不同之处。

## Cron 触发器 ##

cron 触发器允许你通过 `Cron` 表达式来定义构建的时间点。这种方式非常适合需要在固定的、预定义的时间点执行构建任务的场景。下面是使用 cron 触发器的一个简单示例：

```groovy
pipeline {
    agent any
    triggers {
        cron('H 4 * * 1-5') // 每个工作日的 4 点执行构建，使用 H 降低并发概率
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

## PollSCM 触发器 ##

pollSCM 触发器则是在指定的时间点检查源代码仓库是否有变化，如果有变化则触发构建。这种方式适用于依赖于代码变更的流水线，比如你希望在每天固定时间检查代码库并自动构建最新代码。下面是一个使用 pollSCM 触发器的示例：

```groovy
pipeline {
    agent any
    triggers {
        pollSCM('H/15 * * * *') // 每 15 分钟检查一次源代码仓库，有变更则触发构建
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

## 性能对比 ##

为了更直观地展示这两种触发器的性能差异，我们进行了一组对比实验。实验环境为 Jenkins 2.289.1，使用相同的 Maven 项目，构建时间约为 5 分钟。实验中，我们使用了 4 个不同的流水线配置，分别测试了 cron 和 pollSCM 的性能表现。

### 实验 1：使用 cron 每 15 分钟构建一次 ###

```groovy
pipeline {
    agent any
    triggers {
        cron('H/15 * * * *') // 每 15 分钟构建一次
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

结果：

- 构建次数：每 15 分钟一次
- 构建时间：平均 5 分钟
- 资源消耗：每次构建会消耗完整资源

### 实验 2：使用 pollSCM 每 15 分钟检查一次 ###

```groovy
pipeline {
    agent any
    triggers {
        pollSCM('H/15 * * * *') // 每 15 分钟检查一次
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

结果：

- 构建次数：仅在代码有变更时才会触发构建
- 构建时间：平均 5 分钟
- 资源消耗：无变更时检查消耗较少资源，有变更时消耗完整资源

## 适用场景分析 ##

*cron 触发器*：

- 优点：定时触发，适用于需要定期执行的任务，比如每天定时构建一个测试环境。
- 缺点：无论代码是否有变更，都会定时执行构建，可能会浪费资源。
- 适用场景：适合需要定期执行的任务，例如每日构建、周报生成等。

*pollSCM 触发器*：

- 优点：仅在代码有变更时触发构建，节省资源。
- 缺点：需要频繁检查代码仓库，如果检查频率过高，也可能增加资源消耗。
- 适用场景：适合依赖于代码变更的流水线，例如持续集成（CI）和持续交付（CD）。

## 代码示例：更复杂的场景 ##

### 多时间点的 cron 触发 ###

如果你需要在多个时间点触发构建，可以使用多个 Cron 表达式。例如，每天早上 9 点和下午 5 点执行构建：

```groovy
pipeline {
    agent any
    triggers {
        cron('H 9,17 * * 1-5') // 每个工作日的 9 点和 17 点执行构建
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

#### 多仓库的 pollSCM 触发 ###

如果你的项目依赖于多个代码仓库，可以配置多个 pollSCM 触发器。例如，每小时检查一次 repo1 和 repo2 的变更：

```groovy
pipeline {
    agent any
    triggers {
        pollSCM('H * * * *') // 每小时检查一次
    }
    stages {
        stage('Clone Repositories') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/repo1.git'
                git branch: 'main', url: 'https://github.com/your-repo/repo2.git'
            }
        }
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'mvn clean install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'mvn test'
            }
        }
    }
}
```

## 安全性与可靠性 ##

*cron 触发器*：

- 安全性：相对简单，只需确保 Cron 表达式的正确性。
- 可靠性：定时任务可能会因为系统负载高而延迟执行，可以通过配置 H 来降低并发概率。

*pollSCM 触发器*：

- 安全性：需要确保代码仓库的访问权限和凭证安全。
- 可靠性：检查频率过高可能会增加 Jenkins 的负担，建议合理配置检查频率。

## 实际案例：缩减构建频率 ##

假设你有一个大型项目，每天的代码提交非常频繁，但你发现频繁的构建导致了资源浪费和构建队列积压。你可以通过以下两种方式来优化构建频率：

*使用 pollSCM 降低检查频率*：

- 原配置：`pollSCM('H/5 * * * *')`（每 5 分钟检查一次）
- 优化后：`pollSCM('H/15 * * * *')`（每 15 分钟检查一次）

优化后，构建次数显著减少，资源消耗也随之降低。

*使用 cron 定时构建*：

- 原配置：无定时构建
- 优化后：`cron('H 9,17 * * 1-5')`（每个工作日的 9 点和 17 点执行构建）

优化后，尽管构建次数减少，但每次构建的时间点固定，便于团队协同。

## 调试与监控 ##

Cron 触发器：

- 调试：可以通过 Jenkins 的 "Build History" 页面查看每次构建的时间点。
- 监控：可以使用 Jenkins 插件如 "Build Monitor Plugin" 来监控构建频率和资源消耗。

PollSCM 触发器：

- 调试：可以通过 Jenkins 的 "SCM Polling Log" 页面查看每次检查的日志。
- 监控：同样可以使用 "Build Monitor Plugin" 来监控检查频率和构建次数。

## 生成 Cron 表达式的小工具 ##

配置定时构建时，编写 Cron 表达式可能会让人感到头疼。幸运的是，有一个在线工具 [Hey Cron](https://www.heycron.com/) 可以帮助你轻松生成 Cron 表达式。只需要输入中文描述，比如“每天工作日的 9 点和 17 点”，它就能自动为你生成相应的 Cron 表达式。

此外，Hey Cron 还提供了其他实用工具，如正则表达式生成器、中英互译、JSON 格式化、Base64 编码解码和时间戳转换，非常适合在编写 Jenkins Pipeline 时使用。

例如，你可以使用 Hey Cron 生成 Cron 表达式，然后直接复制到你的 Pipeline 配置中：

*Cron 表达式生成器*：

- 输入：每天工作日的 9 点和 17 点
- 输出：`H 9,17 * * 1-5`

*时间戳转换*：

- 输入：1633072800
- 输出：2021-10-01 17:00:00

*Base64 编码解码*：

- 输入：Hello, World!
- 输出：`SGVsbG8sIFdvcmxkIQ==`

通过这些工具，你可以快速生成和验证 Cron 表达式，提高配置效率和准确性。

## 结论 ##

通过上述对比和实验，我们可以看到 cron 和 pollSCM 两种触发器各有优缺点。cron 适用于需要定期执行的任务，而 pollSCM 则更适合依赖于代码变更的流水线。具体选择哪种方式，取决于你的项目需求和资源情况。

如果你需要生成和验证 Cron 表达式，不妨试试 Hey Cron，它不仅能帮助你快速生成 Cron 表达式，还能提供其他一些实用工具，让 Jenkins Pipeline 的配置更加便捷和高效。

在实际应用中，你可以根据项目的具体情况，灵活选择和调整定时构建的配置方式，以达到最佳的资源利用和团队协作效果。
