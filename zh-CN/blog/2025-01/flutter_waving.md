---
lastUpdated: true
commentabled: true
recommended: true
title: Flutter 动画实战：绘制波浪动效详解
description: Flutter 动画实战：绘制波浪动效详解
date: 2025-01-14 11:18:00
pageClass: blog-page-class
---

# Flutter 动画实战：绘制波浪动效详解 #

在移动应用开发中，动画效果可以极大地提升用户体验。本文将详细介绍如何使用 Flutter 的 CustomPainter 和 AnimationController 实现一个简单的波浪动画效果。

## 技术描述 ##

我们将使用 Flutter 的 CustomPainter 来绘制波浪，并通过 AnimationController 控制波浪的动态效果。这个动画效果可以用于各种场景，比如加载动画、背景装饰等。

## 实现步骤 ##

### 创建波浪绘制类 ###

首先，我们需要创建一个继承自 CustomPainter 的类 WavePainter，用于绘制波浪的路径。

```dart
class WavePainter extends CustomPainter {
  final double waveProgress;

  WavePainter(this.waveProgress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blueAccent
      ..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(0, size.height * 0.5);
    for (double i = 0; i <= size.width; i++) {
      path.lineTo(i, size.height * 0.5 + 10 * sin((i / size.width * 2 * pi) + (waveProgress * 2 * pi)));
    }
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
```

### 创建波浪动画页面 ###

接下来，我们创建一个 WaveAnimationPage，使用 AnimationController 来控制波浪的动态效果。

```dart
class WaveAnimationPage extends StatefulWidget {
  @override
  _WaveAnimationPageState createState() => _WaveAnimationPageState();
}

class _WaveAnimationPageState extends State<WaveAnimationPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('波浪动画效果')),
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: WavePainter(_controller.value),
            child: Container(),
          );
        },
      ),
    );
  }
}
```

## 技术解析 ##

- CustomPainter: 用于自定义绘制图形。我们在 paint 方法中定义了波浪的路径。
- AnimationController: 控制动画的播放。通过 repeat 方法实现波浪的循环动画。
- AnimatedBuilder: 用于监听动画的变化并重建 CustomPaint，从而实现动态效果。

通过以上步骤，我们成功实现了一个简单的波浪动画效果。这个效果可以根据需求进行扩展，比如调整波浪的颜色、速度等。
