---
lastUpdated: true
commentabled: true
recommended: true
title: Flutter 自定义 CustomPaint 实现流体液态加载动画
description: Flutter 自定义 CustomPaint 实现流体液态加载动画
date: 2025-03-25 15:20:00
pageClass: blog-page-class
---

# Flutter 自定义 CustomPaint 实现流体液态加载动画 #

## 前言 ##

在移动应用开发中，精美的加载动画不仅能提升用户体验，还能有效缓解用户等待过程中的焦虑感。今天要分享的是一个基于 Flutter CustomPaint 实现的流体液态加载动画，它通过模拟液体流动、波浪起伏，并添加气泡和光晕效果，打造出一个极具视觉冲击力的加载指示器。

## 技术要点 ##

- CustomPaint 与 CustomPainter 的应用
- 贝塞尔曲线绘制平滑波浪
- 动画控制与状态管理
- 手势交互实现
- 粒子效果(气泡)与光晕处理

## 效果实现 ##

### 页面结构设计 ###

首先创建一个基础页面，包含动画显示区域和交互控件：

```dart
class LiquidLoaderPage extends StatefulWidget {
  @override
  _LiquidLoaderPageState createState() => _LiquidLoaderPageState();
}

class _LiquidLoaderPageState extends State<LiquidLoaderPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _progress = 0.0;
  final _dragHeight = 100.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 3000),
    )..addListener(() {
        setState(() {
          _progress = _controller.value;
        });
      });

    _controller.repeat();
  }
  
  // 其他代码省略...
}
```

这里使用 AnimationController 控制动画进度，将动画设为循环模式（repeat），动画时长为3秒。

### 布局设计 ###

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: Colors.black,
    appBar: AppBar(
      title: Text('流体液态加载动画'),
      backgroundColor: Colors.black87,
      elevation: 0,
    ),
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.5),
                  blurRadius: 20,
                  spreadRadius: 5,
                )
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: CustomPaint(
                painter: LiquidPainter(
                  progress: _progress,
                  color1: Colors.blue,
                  color2: Colors.purple,
                ),
              ),
            ),
          ),
          SizedBox(height: 50),
          GestureDetector(
            onVerticalDragUpdate: (details) {
              setState(() {
                _progress -= details.delta.dy / _dragHeight;
                _progress = _progress.clamp(0.0, 1.0);
              });
              // 暂停自动动画
              _controller.stop();
            },
            onVerticalDragEnd: (details) {
              // 恢复自动动画
              _controller.repeat();
            },
            child: Container(
              width: 200,
              height: 60,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                gradient: LinearGradient(
                  colors: [Colors.blue, Colors.purple],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  '拖动调整液位',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
```

**布局设计要点**：

- 以深色背景为基础，营造出高科技感
- 为动画容器添加圆角和阴影，增强立体感
- 底部添加一个可交互按钮，让用户通过拖拽来控制液位高度
- 使用渐变色和阴影增强视觉效果

### 核心绘制代码：CustomPainter 实现 ###

```dart
class LiquidPainter extends CustomPainter {
  final double progress;
  final Color color1;
  final Color color2;

  LiquidPainter({
    required this.progress,
    required this.color1,
    required this.color2,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 绘制背景
    final backgroundPaint = Paint()..color = Colors.black87;
    canvas.drawRect(
        Rect.fromLTWH(0, 0, size.width, size.height), backgroundPaint);

    // 绘制液体
    final liquidHeight = size.height * progress;
    final liquidRect =
        Rect.fromLTWH(0, size.height - liquidHeight, size.width, liquidHeight);

    // 创建液体渐变
    final gradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [color1, color2],
    );

    final liquidPaint = Paint()..shader = gradient.createShader(liquidRect);

    // 创建液体波浪路径
    final path = Path();
    
    // 省略部分代码...
  }
  
  // 其他方法省略...
}
```

### 波浪效果实现 ###

波浪效果是这个动画的精髓，通过贝塞尔曲线和三角函数来实现：

```dart
// 使用平滑的贝塞尔曲线绘制波浪
final waveHeight = 6.0; // 减小波浪高度
final baseHeight = size.height - liquidHeight;

// 先添加第一个点
path.lineTo(0, baseHeight);

// 使用更多的点和quadraticBezierTo绘制平滑曲线
final segments = 16;
double previousX = 0;
double previousY = baseHeight;

for (int i = 1; i <= segments; i++) {
  final t = i / segments;
  final x = size.width * t;

  // 使用单一的正弦函数，避免尖锐的波峰
  final sinValue = sin((progress * 2 * pi) + (t * 4 * pi));
  final y = baseHeight + sinValue * waveHeight;

  // 控制点，在前一点和当前点之间
  final controlX = (previousX + x) / 2;
  final controlY = baseHeight +
      sin((progress * 2 * pi) + ((t - 0.5 / segments) * 4 * pi)) *
          waveHeight;

  // 使用二次贝塞尔曲线连接点
  path.quadraticBezierTo(controlX, controlY, x, y);

  previousX = x;
  previousY = y;
}

// 右边界和底部
path.lineTo(size.width, size.height - liquidHeight);
path.lineTo(size.width, size.height);
path.close();

// A绘制液体
canvas.drawPath(path, liquidPaint);
```

这段代码的关键点：

- 将波浪线分为16个段落，确保曲线平滑
- 使用正弦函数计算每个点的y坐标，实现波浪效果
- 通过动画控制器的progress值来驱动正弦函数，使波浪流动起来
- 使用quadraticBezierTo绘制二次贝塞尔曲线，连接各个点，让波浪看起来更加自然

### 气泡效果实现 ###

为增强液体的真实感，添加随机气泡效果：

```dart
void drawBubbles(Canvas canvas, Size size, Rect liquidRect) {
  final random = Random(progress.toInt() * 1000);
  final bubblePaint = Paint()..color = Colors.white.withOpacity(0.5);

  for (int i = 0; i < 15; i++) {
    final bubbleSize = random.nextDouble() * 8 + 2;
    final bubbleX = random.nextDouble() * size.width;
    final bubbleY =
        size.height - (random.nextDouble() * liquidRect.height * 0.8);
    final offset = sin((progress * 2 * pi) + i) * 5;

    canvas.drawCircle(
        Offset(bubbleX, bubbleY + offset), bubbleSize, bubblePaint);
  }
}
```

**气泡效果的实现要点**：

- 使用Random生成随机位置和大小的气泡
- 通过progress播放进度作为随机种子，使气泡位置在动画不同阶段保持一致
- 添加正弦函数偏移，让气泡上下浮动，增强液体流动感

### 光晕效果实现 ###

为提升视觉质感，添加光晕和高光效果：

```dart
void drawGlow(Canvas canvas, Size size, Path path, Paint paint) {
  // 添加发光效果
  for (int i = 0; i < 5; i++) {
    final glowPaint = Paint()
      ..color = color1.withOpacity(0.1 - i * 0.02)
      ..style = PaintingStyle.stroke
      ..strokeWidth = i * 2.0;

    canvas.drawPath(path, glowPaint);
  }

  // 添加顶部高光
  final highlightPaint = Paint()
    ..color = Colors.white.withOpacity(0.3)
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.0;

  final highlightPath = Path();
  final baseHeight = size.height - size.height * progress;

  // 省略部分代码...

  canvas.drawPath(highlightPath, highlightPaint);
}
```

**光晕效果的技术要点**：

- 通过多次绘制轮廓线，并逐渐降低透明度，营造出光晕扩散效果
- 在液面顶部添加白色高光，增强液体光泽感
- 高光同样使用贝塞尔曲线，保持与波浪形状一致

## 交互性实现 ##

这个动画不仅视觉效果出色，还具备交互功能。通过垂直拖动可以调整液位高度：

```dart
GestureDetector(
  onVerticalDragUpdate: (details) {
    setState(() {
      _progress -= details.delta.dy / _dragHeight;
      _progress = _progress.clamp(0.0, 1.0);
    });
    // 暂停自动动画
    _controller.stop();
  },
  onVerticalDragEnd: (details) {
    // 恢复自动动画
    _controller.repeat();
  },
  // ...
)
```

**交互实现重点**：

- 通过GestureDetector捕获垂直拖动手势
- 根据拖动距离计算progress值，实现液位调整
- 拖动时暂停自动动画，拖动结束后恢复动画
- 使用clamp函数确保progress值在0.0到1.0之间

## 性能优化 ##

在实现这类复杂动画时，需要注意以下性能优化点：

- **减少不必要的重绘**：通过shouldRepaint方法只在progress变化时才重绘

```dart
@override
bool shouldRepaint(covariant LiquidPainter oldDelegate) {
  return oldDelegate.progress != progress;
}
```

- **优化Path构建**：使用适当的segments数量，既保证平滑度，又不过度消耗性能
- **减小波浪和气泡数量**：根据设备性能调整气泡数量和波浪分段数
- **避免透明度叠加**：谨慎使用半透明效果，过多的透明度叠加会导致渲染性能下降

## 小结 ##

这个流体液态加载动画通过CustomPaint和数学曲线，实现了一个既美观又实用的加载指示器。关键技术包括：

- 贝塞尔曲线绘制波浪效果
- 三角函数控制液体流动
- 随机函数生成气泡效果
- 多层绘制实现光晕和高光
- 手势交互增强用户体验

通过这个案例，我们可以看到Flutter强大的自定义绘制能力。灵活运用CustomPaint，配合数学函数和动画控制器，可以实现各种复杂而精美的动画效果。
