---
lastUpdated: true
commentabled: true
recommended: true
title: 让LLM做选择题而不是问答题
description: 多Agent性能分析的分层架构
date: 2026-05-13 08:55:00 
pageClass: blog-page-class
cover: /covers/ai.svg
---

## 问题：LLM 不擅长什么 ##

我们先达成一个共识：*LLM 不擅长精确计算*。

这不是黑 LLM，这是事实。LLM 本质上是预测下一个 token 的概率模型，它擅长语言理解、代码阅读、文本生成，但在以下场景会翻车：

- 数值计算：FPS 9.8 对 60Hz 设备意味着什么？让 LLM 不同次调用回答，可能得到"严重卡顿"也可能得到"可以接受"
- 一致性判断：同一个 slice 第一次说是 P0，第二次说是 P1
- 排序和比较：50 个 slice 按耗时排序，LLM 可能漏掉中间几个

如果你直接把 Perfetto 采集到的 JSON（通常 5000+ 字）丢给 LLM 说"帮我分析一下"，你会得到：

```txt
从数据来看，FPS 偏低，建议优化布局层次。
RecyclerView 可能存在性能问题，建议使用 ViewHolder 缓存。
```

这种回复有什么价值？没有。它对任何数据都能说同样的话。

真正有价值的是："`帧#47 耗时 229ms，超出帧预算 13.7 倍，其中 DemoAdapter.onBindViewHolder 占了此帧 89.2% 的时间`"。

这种结论，LLM 算不准。但代码可以。

## SmartInspector 的分层策略 ##

核心思路一句话：让 LLM 做"选择题"而不是"问答题"。

- 选择题：给定一组预计算结论（"P0: DemoAdapter.onBindViewHolder, 145ms"），LLM 只需要组织成自然语言
- 问答题：给你原始 JSON 数据，自己算 FPS、自己判断严重度、自己排序

架构如下：

```txt
Perfetto trace JSON
       ↓
确定性预计算层 (Python) → 结构化中文事实
       ↓                         ↓
LLM 语言组织层              → 最终分析报告
```

确定性层用纯 Python 代码完成所有数值计算和逻辑判断，输出一份约 500 字的"中文事实摘要"。LLM 拿到这份摘要后，只需要理解语义、组织语言、补充建议。

> 效果：准确率从"看运气"变成"100%可预期"，token 用量从 5000 字降到 500 字。

## deterministic.py：6 个预计算模块详解 ##

`deterministic.py` 是整个预计算层的实现，入口是 `compute_hints(perf_json)` 函数：

```python
def compute_hints(perf_json: str) -> str:
    """Run all deterministic analysis helpers on perf JSON."""
    try:
        data = json.loads(perf_json)
    except (json.JSONDecodeError, TypeError):
        return ""

    frame_budget_ms = _detect_frame_budget_ms(data)

    sections = [
        _detect_empty_scenario(data),
        _classify_severity(data, frame_budget_ms),
        _compute_call_chain_distribution(data),
        _rank_rv_hotspots(data),
        _correlate_jank_frames(data, frame_budget_ms),
        _identify_cpu_hotspots(data),
    ]

    return "\n\n".join(s for s in sections if s)
```

六个模块各司其职，我来逐个拆解。

### 模块 1：空场景检测 ###

```python
def _detect_empty_scenario(data: dict) -> str:
    """Detect when there is no UI activity (FPS=0, no frames, low CPU)."""
    ft = data.get("frame_timeline") or {}
    fps = ft.get("fps", 0)
    total_frames = ft.get("total_frames", 0)
    cpu = data.get("cpu_usage") or {}
    cpu_pct = cpu.get("cpu_usage_pct", 0)

    if fps == 0 and total_frames == 0 and cpu_pct < 15:
        lines = [
            "[疑似无UI活动]",
            "  FPS为0，总帧数为0，CPU占用低。可能原因：",
            "  1) 应用未启动或未在前台运行",
            "  2) 采集期间未对应用进行操作",
            "  3) target_process 未匹配到目标进程",
        ]
        return "\n".join(lines)
    return ""
```

这是最简单但最实用的模块。如果采集到的 trace 里 FPS=0、帧数为 0、CPU 占用低，说明根本没抓到有效数据。与其让 LLM 对着一堆空数据编故事，不如直接告诉它：没数据，别分析了。

### 模块 2：严重度分类（P0/P1/P2） ###

这个模块是整个预计算层最重要的部分。

```python
def _classify_severity(data: dict, frame_budget_ms: float = 16.67) -> str:
    slices = (data.get("view_slices") or {}).get("slowest_slices") or []
    custom = [s for s in slices if s.get("is_custom") and s.get("dur_ms", 0) >= 1.0]
    if not custom:
        return ""

    p0_threshold = frame_budget_ms
    p1_threshold = frame_budget_ms * 0.25

    p0, p1, p2 = [], [], []
    for s in custom:
        dur = s["dur_ms"]
        name = s.get("name", "?")
        if dur > p0_threshold:
            p0.append((dur, name))
        elif dur >= p1_threshold:
            p1.append((dur, name))
        else:
            p2.append((dur, name))
```

关键设计：*阈值不是硬编码的，而是基于设备帧预算动态计算*。

`_detect_frame_budget_ms()` 会从 frame timeline 数据中取 expected_dur_ms 的中位数，推断设备刷新率。60Hz 设备帧预算 16.67ms，120Hz 是 8.33ms，240Hz 是 4.17ms。

- P0：超过一帧预算 → 必然造成卡顿
- P1：超过帧预算 25% → 累积可能卡顿
- P2：低于 25% → 基本无害

这个分类逻辑，代码写一次永远一致。LLM 来做？每次可能不同。

### 模块 3：调用链时间分布 ###

```python
def _format_breakdown(items: list, parent_dur: float, lines: list, indent: int):
    if parent_dur <= 0:
        return
    significant = [
        (item, item.get("dur_ms", 0) / parent_dur * 100)
        for item in items
        if item.get("dur_ms", 0) / parent_dur * 100 >= 5
    ]
    significant.sort(key=lambda x: -x[1])
```

把调用链按时间占比拆解成树形结构，过滤掉占比 `<5%` 的噪音，按占比降序排列。输出类似：

```txt
[调用链时间分布]
dispatchLayout (229.15ms):
  89.2% └─ SI$RV#recyclerView#DemoAdapter.onBindViewHolder (204.31ms)
  8.5% ├─ SI$RV#recyclerView#DemoAdapter.onCreateViewHolder (19.48ms)
```

LLM 拿到这个结构，一眼就能看出瓶颈在哪。

### 模块 4：RV 热点排名 ###

```python
def _rank_rv_hotspots(data: dict) -> str:
    instances = (data.get("view_slices") or {}).get("rv_instances") or []
    # ...
    ranked = sorted(
        methods.items(),
        key=lambda kv: kv[1].get("max_ms", 0),
        reverse=True,
    )
    for method, stats in ranked[:5]:
        count = stats.get("count", 0)
        max_ms = stats.get("max_ms", 0)
        total_ms = stats.get("total_ms", 0)
        avg_ms = total_ms / count if count > 0 else 0
```

RecyclerView 的每个方法按 max_ms 降序排列，同时计算 avg_ms。这是纯数学排序，交给 LLM 做没有任何优势，反而可能出错。

### 模块 5：卡顿帧关联 ###

这个模块最复杂，也最能体现"确定性计算"的价值：

```python
def _correlate_jank_frames(data: dict, frame_budget_ms: float = 16.67) -> str:
    for frame in jank_detail[:5]:
        f_ts = frame.get("ts_ns", 0)
        f_end = f_ts + f_dur * 1_000_000

        # 检查帧开始前 50ms 内是否有输入事件
        INPUT_WINDOW_NS = 50_000_000
        for ie in input_events:
            ie_ts = ie.get("ts_ns", 0)
            if ie_ts > 0 and f_ts - INPUT_WINDOW_NS <= ie_ts <= f_ts:
                delta_ms = (f_ts - ie_ts) / 1_000_000
                input_info = f" [触发: {activity}#{action}, {delta_ms:.1f}ms前]"
                break

        # 查找与此帧时间重叠的自定义 slice
        for s in slowest:
            overlap_ns = min(s_end, f_end) - max(s_ts, f_ts)
            overlap_ms = overlap_ns / 1_000_000
            pct = overlap_ms / f_dur * 100
            if pct >= 5:
                matched.append((pct, s.get("name", "?"), s_dur_ms))
```

两步关联：

- 输入事件关联：卡顿帧开始前 50ms 内是否有触摸/滑动事件 → 定位"滑动到哪个位置时卡了"
- 时间重叠匹配：卡顿帧和哪个 SI$ tag 的 slice 时间重叠超过 5% → 定位"哪个方法导致了这帧卡顿"

这种纳秒级的时间计算和百分比比较，交给 LLM 做？想想就可怕。

### 模块 6：CPU 热点识别 ###

```python
def _identify_cpu_hotspots(data: dict) -> str:
    for proc in top_procs[:3]:
        hot_threads = [t for t in threads if t.get("cpu_pct", 0) > 5]
        if not hot_threads and proc_cpu < 5:
            continue
```

过滤系统进程，只展示 CPU 占用 >5% 的用户进程线程。又一个纯数学过滤。

## LangGraph 编排：DAG 式 Agent 协作 ##

预计算层解决的是"分析准不准"的问题，LangGraph 解决的是"多个 Agent 怎么协作"的问题。

### State 设计 ###

```python
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    perf_summary: str            # collector 输出的 JSON
    perf_analysis: str           # analyzer 输出的分析
    attribution_data: str        # attributor 输出的归因数据
    attribution_result: str      # attributor 输出的归因结果
    _route: str                  # orchestrator 路由决策
    _trace_path: str             # trace 文件路径
```

TypedDict + pass-through 模式：每个节点只修改自己负责的字段，其余透传。

```python
def _pass_through(state: AgentState, *, extra_keys: tuple = ()) -> dict:
    keys = _PASS_THROUGH_KEYS + extra_keys
    return {k: state.get(k, "") for k in keys}
```

### DAG 拓扑 ###

```python
def create_graph():
    builder = StateGraph(AgentState)

    # 所有节点
    builder.add_node("orchestrator", orchestrator_node)
    builder.add_node("collector", collector_node)
    builder.add_node("analyzer", analyzer_node)
    builder.add_node("attributor", attributor_node)
    builder.add_node("reporter", reporter_node)
    # ... 其他节点

    # 入口
    builder.add_edge(START, "orchestrator")

    # orchestrator 条件路由
    builder.add_conditional_edges("orchestrator", route_from_orchestrator, path_map={
        "collector": "collector",
        "android_expert": "android_expert",
        "perf_analyzer": "perf_analyzer",
        "explorer": "explorer",
        "fallback": "fallback",
    })

    # 全量分析管线
    builder.add_edge("collector", "analyzer")
    builder.add_conditional_edges("analyzer", _route_from_analyzer, path_map={
        "attributor": "attributor",
        "end": END,
    })
    builder.add_edge("attributor", "reporter")
    builder.add_edge("reporter", END)
```

整个 DAG 的核心路径是：

```txt
用户输入 → orchestrator（LLM 分类）
  ├── full_analysis → collector → analyzer → attributor → reporter → END
  ├── android → android_expert → analyzer → END
  ├── analyze → perf_analyzer → END
  ├── explorer → explorer → END
  └── end → fallback → END
```

### 路由设计：LLM few-shot + max_tokens=5 ###

orchestrator 是唯一一个用 LLM 做路由决策的节点，设计上极尽克制：

```python
_ROUTE_PROMPT = """Classify this user message. Reply with ONE word only.

Categories (pick ONE):
- full_analysis : wants a COMPLETE performance analysis pipeline...
- explorer : wants to SEARCH or READ source code...
- android : wants to COLLECT or ANALYZE performance from Android device...
- analyze : wants deep interpretation of an ALREADY EXISTING perf JSON...
- end : general Q&A...

Examples:
- "帮我全面分析一下这个页面的性能" → full_analysis
- "搜索一下 LazyForEach 的实现" → explorer
- "你好" → end

Reply with exactly one word: full_analysis explorer android analyze end"""
```

`max_tokens=5` 确保只输出一个词，`temperature=0` 确保确定性。这不是让 LLM "思考"，而是让它做"分类"——few-shot 示例覆盖了所有常见输入模式。

### 全链路异常保护 ###

每个节点都套了 `node_error_handler` 装饰器：

```python
def node_error_handler(node_name: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(state: AgentState) -> dict:
            try:
                return func(state)
            except Exception as e:
                from langchain_core.messages import AIMessage
                print(f"  [{node_name}] ERROR: {e}", flush=True)
                return {
                    "messages": [AIMessage(content=f"[{node_name}] Error: {e}")],
                    **_pass_through(state),
                }
        return wrapper
    return decorator
```

单节点失败不丢会话状态，用户可以继续交互。这是"可用性"的基本要求。

## 效果对比 ##

预计算前后的 LLM 输入差异：

*预计算前（直接喂 JSON）*：

```json
{"frame_timeline": {"fps": 9.8, "total_frames": 587, "jank_frames": 342, ...},
 "view_slices": {"slowest_slices": [{"name": "SI$RV#recyclerView#DemoAdapter.onBindViewHolder",
  "dur_ms": 145.23, "ts_ns": 1234567890000, ...}, ...]},
 "cpu_usage": {"cpu_usage_pct": 45.2, "top_processes": [...]}}
```

~5000 字，LLM 需要自己算 FPS 是否正常、排序 slice、判断严重度。

*预计算后（喂中文事实摘要）*：

```txt
[严重度分类] (帧预算: 16.67ms)
  P0: SI$RV#recyclerView#DemoAdapter.onBindViewHolder (145.23ms)

[RV热点排名]
RV#recyclerView#DemoAdapter:
  onBindViewHolder: 120次, 最大145.23ms, 均值12.34ms

[卡顿帧关联]
帧#47 (229.15ms, 预期16.67ms, 超出13.7x) [触发: MainActivity#ACTION_MOVE, 8.2ms前]:
  → SI$RV#recyclerView#DemoAdapter.onBindViewHolder (145.23ms) 占此帧63.3%
```

~500 字，LLM 只需要说："帧#47 严重卡顿，主要由 onBindViewHolder 导致，建议检查该方法实现。"

> Token 节省：约 90%。准确率：从"看运气"到 100%。

## 踩过的坑 ##

### 坑 1：起初让 LLM 直接分析 JSON ###

FPS 评价前后矛盾。第一次说"FPS 9.8 严重偏低"，第二次说"FPS 9.8 在低端设备上可接受"——同样的数据，不同的结论。
解法：不让 LLM 判断"好不好"，只让它描述"是什么"。

### 坑 2：不同模型质量差异大 ###

Attributor 环节依赖 LLM 的代码理解能力（读源码 → 理解业务逻辑 → 输出归因），不同模型表现差异很大：

- DeepSeek：结构化输出不稳定，需要文本解析 fallback
- Claude：代码理解更强，但成本高

解法：归因环节可单独配置模型（SI_ATTRIBUTOR_MODEL 环境变量），路由用便宜模型，归因用强模型。

### 坑 3：TypedDict 无运行时校验 ###

AgentState 用 TypedDict 定义，字段拼写错误只能靠测试发现。比如把 perf_summary 写成 perf_summery，Python 不会报错，但下游节点拿到空字符串。

这是当前架构的一个技术债。如果重新设计，会考虑用 Pydantic Model 替代。

## 小结 ##

> 确定性代码做确定性的事，LLM 做 LLM 擅长的事。

这个分层策略看起来简单，但在实际项目中非常有效：

- 所有数值计算、排序、比较、阈值判断 → Python 代码，100% 确定性
- 语言组织、代码理解、建议生成 → LLM，发挥其语言能力
- 中间通过"中文事实摘要"这个薄层衔接

LangGraph 负责 Agent 编排，但编排的前提是每个 Agent 的职责清晰。SmartInspector 的设计思路是：能用代码解决的，别给 LLM 添麻烦。
