---
layout: doc
# 开启推荐
recommended: true
---

## 项目目标 ##

为从无锡硕放机场出发的常旅客提供随身行李限额检测，避免用户值机时错误预估行李尺寸而在安检时要求办理行李托运带来的不良影响，提升无锡硕放机场地面服务整体水平、维护良好形象。

## 系统要求 ##

- Windows 10 X64 及以上版本
- DOTNET 8 Runntime
- 人脸识别、证件识别、登机牌识别等相关硬件要求环境依赖

## 业务流程 ##

```mermaid
graph TB
  A[开始] --> B[处理]
  B --> C[判断]
  C --是--> D[结束]
  C --否--> E[处理]
  E --> B
```

## 操作流程 ##

```mermaid
  sequenceDiagram
    actor A as 旅客
    participant B as 行李智能检测
    participant C as 服务器

    autonumber

    break 最低要求查询
    A ->> B: 点击，查询随身行李携带限额
    B -->> A: 正在查询
    B ->> B: 测量行李重量和体积
    B ->> C: 提交测量结果
    C ->> C: 校验测量结果
    C ->> B: 返回检测结果
      alt 符合最低要求
      B -->> A: 显示检测结果及通过提示
      else 不符合最低要求
      B -->> A: 显示检测结果(高亮不符合项)及未通过提示，提示进行航司校验
      end
    end
    
    critical 进行航司校验
      A ->> B: 提交航班校验方式
      alt 人脸识别
        B --) B: 获取人脸信息
        B -->> A: 正在查询
        B ->> C: 提交人脸数据
        C ->> C: 查询航班、舱位，二次校验
        C ->> B: 航司校验结果
        B ->> A: 航司校验结果
      else 证件
        B --) B: 获取证件信息
        B -->> A: 正在查询
        B ->> C: 提交证件信息
        C ->> C: 查询航班、舱位，二次校验
        C ->> B: 航司校验结果
        B ->> A: 航司校验结果
      else 登机牌
        B --) B: 获取登机牌信息
        B -->> A: 正在查询
        B ->> C: 提交登机牌信息
        C ->> C: 查询航班、舱位，二次校验
        C ->> B: 航司校验结果
        B ->> A: 航司校验结果
      end
    option 放弃航司校验
      B -->> B: 返回主页
      B --x A: 终止查询
    end
```

## 硬件交互 ##

```mermaid
graph TD;
  subgraph 用户界面
    A[智能手机] -->|MQTT消息| B[消息代理器]
    B -->|App控制| C[树莓派1]
    B -->|App控制| D[树莓派2]
  end
  subgraph 树莓派设备
    C -->|设备控制| E[智能灯1]
    C -->|设备控制| F[智能插座1]
    D -->|设备控制| G[智能灯2]
    D -->|设备控制| H[智能插座2]
    E -->|实时状态| B
    F -->|实时状态| B
    G -->|实时状态| B
    H -->|实时状态| B
  end
  subgraph MQTT服务器
    I[MQTT服务器] -.->|消息传递| B
  end
```

## 功能页面 ##

<div class="grid grid-cols-3 gap-4">

![alt text](/images/cmono-QQ截图20240507130931.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240507130451.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240507130942.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240507130513.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240507131119.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240507130528.png){data-zoomable}

</div>

## 横版设计 ##

![alt text](/images/cmono-QQ截图20240514151035.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151042.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151050.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151054.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151106.png){data-zoomable}
