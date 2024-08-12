---
lastUpdated: true
commentabled: true
recommended: true
title: 软键盘挡住输入框问题的终极解决方案
description: 软键盘挡住输入框问题的终极解决方案
date: 2024-07-10 15:18:00
pageClass: blog-page-class
---

# 软键盘挡住输入框问题的终极解决方案 #

![alt text](/images/cmono-QQ图片20240710143215.png){data-zoomable}

## 原生输入控件 ##

在页面底部有一个`EditText`，如果不做任何处理，那么在软键盘弹出的时候，就有可能会挡住`EditText`。
对于这种情况的处理其实很简单，只需要在`AndroidManifest`文件中对`activity`设置：`android:windowSoftInputMode`的值`adjustPan`或者`adjustResize`即可，像这样：

```xml
<activity
    android:name=".MainActivity"
    android:windowSoftInputMode="adjustPan"  >
    ...
</activity>
```

一般来说，他们都可以解决问题，当然，`adjustPan`跟`adjustResize`的效果略有区别。

- adjustPan 是把整个界面向上平移，使输入框露出，不会改变界面的布局；
- adjustResize 则是重新计算弹出软键盘之后的界面大小，相当于是用更少的界面区域去显示内容，输入框一般自然也就在内了。

## WebView & H5 ##

在`H5`、`Hybrid`几乎已经成为`App`标配的时候，我们经常还会碰到的情况是：软键盘是由`WebView`中的网页元素所触发弹出的。

这时候，情况就会变得复杂了:

首先，页面是非全屏模式的情况下，给`activity`设置`adjustPan`会失效。
其次，页面是全屏模式的情况，`adjustPan`跟`adjustResize`都会失效。
——解释一下，这里的全屏模式即是页面是全屏的，包括`Application`或`activity`使用了`Fullscreen`主题、使用了『状态色着色』、『沉浸式状态栏』、『Immersive Mode』等等——总之，基本上只要是`App`自己接管了状态栏的控制，就会产生这种问题。

下面这个表格可以简单列举了具体的情况。

![alt text](/images/cmono-422451-21900dcf02e664f5.webp){data-zoomable}

上面表格的这种情况并非是Google所期望的，理想的情况当然是它们都能正常生效才对——所以这其实是Android系统本身的一个BUG。

为什么文章开头说这是个坑呢？
——因为这个`BUG`从`Android1.x`时代（2009年）就被报告了，而一直到了如今的`Android14.0`（2024年）还是没有修复……/(ㄒoㄒ)/
可以说这不仅是个坑，而且还是个官方挖的坑~

**Issue 5497**

如前文所示，出现坑的条件是：带有`WebView`的`activity`使用了全屏模式或者`adjustPan`模式。
那么躲坑的姿势就很简单了——
如果`activity`中有`WebView`，就不要使用全屏模式，并且把它的`windowSoftInputMode`值设`为adjustResize`就好了嘛

但总有些时候，是需要`全屏模式`跟`WebView`兼得的，这时候，躲坑就不行了，我们需要一个新的填坑的姿势。幸好，开发者的智慧是无穷的，这个坑出现了这么多年，还是有人找到了一些解决方案的。

**AndroidBug5497Workaround**

```java
public class AndroidBug5497Workaround {

    // For more information, see https://code.google.com/p/android/issues/detail?id=5497
    // To use this class, simply invoke assistActivity() on an Activity that already has its content view set.

    public static void assistActivity (Activity activity) {
        new AndroidBug5497Workaround(activity);
    }

    private View mChildOfContent;
    private int usableHeightPrevious;
    private FrameLayout.LayoutParams frameLayoutParams;

    private AndroidBug5497Workaround(Activity activity) {
        FrameLayout content = (FrameLayout) activity.findViewById(android.R.id.content);
        mChildOfContent = content.getChildAt(0);
        mChildOfContent.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            public void onGlobalLayout() {
                possiblyResizeChildOfContent();
            }
        });
        frameLayoutParams = (FrameLayout.LayoutParams) mChildOfContent.getLayoutParams();
    }

    private void possiblyResizeChildOfContent() {
        int usableHeightNow = computeUsableHeight();
        if (usableHeightNow != usableHeightPrevious) {
            int usableHeightSansKeyboard = mChildOfContent.getRootView().getHeight();
            int heightDifference = usableHeightSansKeyboard - usableHeightNow;
            if (heightDifference > (usableHeightSansKeyboard/4)) {
                // keyboard probably just became visible
                frameLayoutParams.height = usableHeightSansKeyboard - heightDifference;
            } else {
                // keyboard probably just became hidden
                frameLayoutParams.height = usableHeightSansKeyboard;
            }
            mChildOfContent.requestLayout();
            usableHeightPrevious = usableHeightNow;
        }
    }

    private int computeUsableHeight() {
        Rect r = new Rect();
        mChildOfContent.getWindowVisibleDisplayFrame(r);
        return (r.bottom - r.top);// 全屏模式下： return r.bottom
    }

}
```

总结起来，就是这样：

- 普通Activity（不带WebView），直接使用adjustpan或者adjustResize
- 带WebView：
  - 如果非全屏模式，可以使用adjustResize
  - 如果是全屏模式，则使用AndroidBug5497Workaround进行处理。

## MAUI 适配 ##

```C#
[Activity(Theme = "@style/Maui.SplashTheme", WindowSoftInputMode = Android.Views.SoftInput.AdjustResize, MainLauncher = true, LaunchMode = LaunchMode.SingleTop, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
}
```
