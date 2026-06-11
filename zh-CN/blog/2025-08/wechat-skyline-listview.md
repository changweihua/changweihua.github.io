---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序中使用skyline渲染实现聊天室长列表丝滑滚动
description: 微信小程序中使用skyline渲染实现聊天室长列表丝滑滚动
date: 2025-08-11 10:45:00 
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

## 一、使用原因 ##

最初的微信 `scrollview` 组件需要每次打开页面的时候去设置 `scroll-into-view` 让页面去滚动到最底部的元素位置（这里每次打开页面用户看到的就是一个页面滚动），用户下拉获取历史消息时需要往页面顶部添加数据，这个时候页面会自动滚动到最顶部，这个时候也需要使用  `scroll-into-view` 滚动回去原来的位置，体验效果非常的不友好。

因此急需需要优化聊天室，经过调研发现可以使用微信小程序提供的skyline渲染模式去处理，可以进一步优化小程序性能，提供更为接近原生的用户体验。

但是 `skyline` 模型也是官方刚刚发布不久的新东西，使用过程中也存在者很多的问题，目前只在聊天室中使用了该模式，因此将目前在优化聊天室中遇到的问题输出相对应的处理方案。


### 接入步骤 ###

**单页面接入**

(调试时开发者工具需要开启 `skyline` 渲染，否则不生效)

在 `app.json` 中

```json:app.json
{
    lazyCodeLoading: 'requiredComponents',
    rendererOptions: {
        skyline: {
            disableABTest: true,（全量开启）
            defaultDisplayBlock: true
        }
    }
}
```

在接入页面中 `page.json`

```json:page.json
{
    renderer: 'skyline',
    componentFramework: 'glass-easel'
}
```

```html
<ScrollView scrollY type='list' reverse>
    <View>配置 type='list' reverse 开始反向滚动<View>
</<ScrollView>
```

### 页面布局 ###

```html
<View>
    <NavBar>自定义导航</NavBar>
    <View style={{height: `calc(100% - ${navBarHeight}px - ${footerHeight}px)`}}>
        需要动态减去自定义导航和底部输入框的高度作为聊天内容的滚动区域
        <ScrollView scrollY type='list' reverse>
            内容
        </<ScrollView>
    </View>
    <Footer>底部输入框位置</Footer>
</View>
```

## 使用 `skyline` 模式后 `scrollView` 设置翻转产生的问题及处理 ##

### 自定义navbar ###

- 当前页面开启 `skyline` 之后页面会变成自定义导航，所以需要我们自行写好自定义导航，我们可以使用第三方提供的UI组件即可，但是需要注意的一点就是手机头部的安全距离
- 我们使用 `Taro.getSystemInfoSync()` 去获取到 `statusBarHeight` 即可

### 聊天页面内容不满一屏幕时，页面顶部为空 ###

在需要在 `ScorllView` 内增加一个 `View` 标签并且设置该标签的 `minHeight` 为 `ScorllView` 的父级的高度即可

```html
<View>
    <NavBar>自定义导航</NavBar>
    <View style={{height: `calc(100% - ${navBarHeight}px - ${footerHeight}px)`}}>
        <ScrollView scrollY type='list' reverse>
            <View style={{minHeight:`calc(100% - ${navBarHeight}px - ${footerHeight}px)`}}}}>处理页面消息不满一屏页面顶部为空的问题</View>
        </<ScrollView>
    </View>
    <Footer>底部输入框位置</Footer>
</View>
```

### 聊天室输入框导致内容被遮挡 & 自定义navbar被页面推出可视范围 ###

因为是聊天室因此页面底部会需要输入框（使用 TextArea 组件作为输入框）

#### 方案一（不适用） ####

每次点击输入框时聊天室底部内容会被遮挡，因此开启 TextArea 组件的 `adjustPosition = true`,每次键盘开启时自动上推页面，处理页面内容处理问题，但是这个时候自定义navbar会被退出可视范围，因此该方案不适应，需要将设置 `adjustPosition=false`

#### 方案二（最终处理方案，页面高度动态减去键盘高度） ####

每次点击输入框时需要获取键盘的高度，动态减去页面的高度，让页面内容不被键盘遮挡

#### skyline模式获取键盘高度的问题（多个API结合处理ios和安卓分别不同的问题） ####

使用 `Taro.onKeyboardHeightChange` API，在ios设备中每次会输出两次，第一次为键盘的正常高度，第二次为0，因此在ios中会存获取到键盘高度为0的情况，因此需要在该API内将返回的高度为0的情况剔除即可，处理ios获取高度异常的问题

```ts
Taro.onKeyboardHeightChange(listenerKeyboard);
const listenerKeyboard = (res: {height: number}) => {
    if (res?.height > 0) {
        setKeyboardHeight(res.height);
    }
};
```

因为上面的方法中将获取为零的情况剔除了，所以每次键盘收起的时候页面为重新计算会导致页面存在空白区域，所以需要在键盘失去焦距的时候将保存的键盘高度变量设置为零

```html
<Textarea 
    autoHeight
    placeholder='请输入新消息'
    confirmType='send'
    value={value}
    adjustPosition={false}
    onBlur={(e) => {
        // 失去焦点，键盘就会收起，直接设置为零即可
        setKeyboardHeight(0);
    }}
>
</<Textarea>
```

但是在安卓设备中键盘收起以后 Textarea 还会处在聚焦的状态，因此每次导致安卓中收起键盘获取需要多次点击输入框才能弹起键盘，因此我们需要当键盘高度为零的时候使用代码的方案去让键盘失去焦点，让输入框处于正常的状态，因此最终需要结合focus、onFocus、onKeyboardHeightChange等方法和上面在ios中使用的方法一起结合去处理键盘导致的键盘问题

```ts
Taro.onKeyboardHeightChange(listenerKeyboard);
const listenerKeyboard = (res: {height: number}) => {
    if (res?.height > 0) {
        setKeyboardHeight(res.height);
    }
};
```


```html
<Textarea 
    autoHeight
    placeholder='请输入新消息'
    confirmType='send'
    value={value}
    adjustPosition={false}
    focus={keyboardHeight === 0 ? false : true} <!-- 处理安卓输入框失焦问题-->
    onBlur={(e) => {
        <!-- 失去焦点，键盘就会收起，直接设置为零即可-->
        setKeyboardHeight(0);
    }}
    onFocus={(e) => {
        <!-- 获取焦点设置键盘高度-->
        setKeyboardHeight(e.detail.height);
    }}
    onKeyboardHeightChange={(e) => {
        if (platform === 'android') {
            setKeyboardHeight(e.detail.height);
        }
    }}
>
</<Textarea>
```

### skyline模式导致Video视频组件异常 ###

视频组件点击全屏时，自定义navbar和底部输入框会遮挡全屏视频。

因此需要每次视频组件点击全屏播放时异常遮挡的组件。

在 `onFullScreenChange` 回调函数获取对应的内容做异常处理。

```html
<Video
    id='视频ID'
    onFullScreenChange={(e) => {
        <!-- 当视频打开全屏时和关闭全屏时会输出对应的内容，根据输入的内容做对应操作即可-->
        e.detail.fullScreen
    }
>
</Video>
```

在安卓中，视频全屏以后手势返回会导致不能退出全屏。

使用 `Taro.createVideoContext` 对视频组件做对应的退出全屏操作。


```ts
videoRef.current = Taro.createVideoContext('对应的视频ID');

<Video
    id='视频ID'
    onFullScreenChange={(e) => {
        // 当视频打开全屏时和关闭全屏时会输出对应的内容，根据输入的内容做对应操作即可
        // 执行对应退出全屏的API接口处理安卓设置手势返回无法退出全屏的问题
        videoRef.current?.exitFullScreen();
    }
>
</Video>
```

在IOS设备中 视频全屏以后左上角返回按钮会被手机安全状态栏遮挡
同样是使用 `Taro.createVideoContext` 处理

```ts
videoRef.current = Taro.createVideoContext('对应的视频ID');

<Video
    id='视频ID'
    onFullScreenChange={(e) => {
        // 当视频打开全屏时和关闭全屏时会输出对应的内容，根据输入的内容做对应操作即可
        handleIsFull(Boolean(e.detail.fullScreen));
        if (!Boolean(e.detail.fullScreen)) {
        videoRef.current?.showStatusBar();
        videoRef.current?.exitFullScreen();
        } else {
            // ios设备需要调动一次全屏方法后，隐藏状态栏方法才生效
            if (platform === 'ios') {
                videoRef?.current?.requestFullScreen({
                     direction: 0
                });
                videoRef.current?.hideStatusBar();
            }
        }
    }
>
</Video>
```
