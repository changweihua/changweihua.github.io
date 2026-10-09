---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 自定义 View
description: Java 自定义 View → Kotlin 自定义 View
date: 2026-08-07 10:55:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

## 老写法（Java） ##

```java
public class CircleView extends View {

    private Paint paint;
    private int circleColor;

    public CircleView(Context context) {
        super(context);
        init(null);
    }

    public CircleView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs);
    }

    public CircleView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(attrs);
    }

    private void init(AttributeSet attrs) {
        paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        circleColor = Color.RED;

        if (attrs != null) {
            TypedArray a = getContext().obtainStyledAttributes(attrs, R.styleable.CircleView);
            circleColor = a.getColor(R.styleable.CircleView_circleColor, Color.RED);
            a.recycle();
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        paint.setColor(circleColor);
        int radius = Math.min(getWidth(), getHeight()) / 2;
        canvas.drawCircle(getWidth() / 2f, getHeight() / 2f, radius, paint);
    }

    public void setCircleColor(int color) {
        this.circleColor = color;
        invalidate();
    }
}
```

## 问题在哪里 ##

三个重载构造函数纯属样板代码。每个自定义 View 都要写一遍，十几个 View 的项目光构造函数就占上百行。`init()` 方法的存在也只是为了绕过构造函数不能互相调用的限制。

## 新写法（Kotlin） ##

```kotlin
class CircleView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private var circleColor = Color.RED

    init {
        if (attrs != null) {
            val typedArray = context.obtainStyledAttributes(attrs, R.styleable.CircleView)
            circleColor = typedArray.getColor(R.styleable.CircleView_circleColor, Color.RED)
            typedArray.recycle()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        paint.color = circleColor
        val radius = minOf(width, height) / 2
        canvas.drawCircle(width / 2f, height / 2f, radius.toFloat(), paint)
    }

    fun setCircleColor(color: Int) {
        circleColor = color
        invalidate()
    }
}
```

## 一句话注意 ##

`@JvmOverloads` 配合 Kotlin 默认参数，会自动生成 Java 调用方需要的三个重载构造函数。如果自定义 View 需要在 XML 中使用，这个注解不能省，否则布局填充器找不到对应签名的构造函数会直接崩溃。

`paint.color = circleColor` 是 Kotlin 的属性访问语法，等价于 Java 的 `paint.setColor(circleColor)`。Android SDK 里所有 `getXxx()`/`setXxx()` 方法对在 Kotlin 中都会自动映射为属性，不需要像 Java 那样显式调用 setter。
