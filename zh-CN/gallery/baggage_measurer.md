---
layout: doc
# 开启推荐
recommended: true
mermaids: 3
pageClass: gallery-page-class
---

## 项目目标 ##

为从无锡硕放机场出发的常旅客提供随身行李额度自助查询，避免旅客在通过安检时因携带行李尺寸和重量限制需前往值机柜台办理行李托运，通过降低往返值机柜台频次及节省重复安检排队时间，充分满足旅客对顺畅出行的美好向往，以此提升无锡硕放机场地面服务的整体水平、维护机场良好形象。

::: tip 个性功能
每一步操作均有语音引导提示，尽可能降低用户理解难度，增强应用产品力，提高设备利用率。
:::

## 系统要求 ##

- Windows 10 X64 及以上版本
- DOTNET 8 Runntime
- 人脸识别、证件识别、登机牌识别等相关硬件要求环境依赖

## 业务流程 ##

```mermaid
graph TB
  A[开始] --> B[点击查询按钮]
  B --> C[提示用户放置行李]
  C --> D[检测重量和体积]
  D --> E[满足最低要求]
  E --是--> F[提示用户可携带]
  F --> Z[结束]
  E --否--> G[提示用户验证航班舱位]
  G --> H[选择验证方式]
  H --> I1[人脸验证]
  H --> I2[身份证验证]
  H --> I3[护照验证]
  H --> I4[登机牌验证]
  I1 --> J[满足最低要求]
  I2 --> J[满足最低要求]
  I3 --> J[满足最低要求]
  I4 --> J[满足最低要求]
  J --是--> K[提示用户可携带]
  J --否--> L[提示用户不可携带]
  K --> Z[结束]
  L --> Z[结束]

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
        B -->> A: 获取授权
        A ->> B: 确认授权
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

## 功能页面 ##

<div class="grid grid-cols-3 gap-4">

![alt text](/images/cmono-QQ截图20240517084528.png)

![alt text](/images/cmono-QQ截图20240517084704.png)

![alt text](/images/cmono-QQ截图20240517084718.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240517084738.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240517084745.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240517110048.png){data-zoomable}

</div>

## 横版设计 ##

![alt text](/images/cmono-QQ截图20240514151035.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151042.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151050.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151054.png){data-zoomable}

![alt text](/images/cmono-QQ截图20240514151106.png){data-zoomable}

## 硬件交互 ##

```mermaid
flowchart TD;
  subgraph 行李检测仪
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
  subgraph 后台服务器
    I[后台服务器] -.->|消息传递| B
  end
```
