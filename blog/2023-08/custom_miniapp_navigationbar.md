---
commentabled: true
recommended: true
tags: ["小程序"]
---

# 自定义小程序导航栏 #

最近在做小程序的时候，UI 设计给出了个效果图，第一眼感觉，嗯~ o(*￣▽￣*)o 效果还可以。

再仔细一想，这个效果不简单呐。

不过这都不算事，一行代码代码解决不了的，那就一万行。

开干！！！

<video src="/videos/f61955f40743bedd5ece3d9f8df6c315.mp4" muted autoplay loop />

## 步骤解析 ##

首先得先实现自定义导航栏，自己定义返回按钮及标题栏，同时使用绝对定位将Logo图片置于顶部。

## 自定义导航栏 ###

```html
<view class="navigation-container" style="height: {{navigationBarAndStatusBarHeight}};--text-color: {{textcolor}};">
    <view style="{{'height: ' + statusBarHeight}}"></view>
    <view class="navigation-bar" style="{{'height:' + navigationBarHeight}}">
        <view catch:tap="handleBackClick"  data-navigationtype="{{navigationtype}}" data-navigationurl="{{navigationurl}}" class="navigation-buttons" style="{{'height:' + menuButtonHeight}}">
            <t-icon color="{{textcolor}}" name="chevron-left" size="56rpx" />
            <!-- <t-divider t-class="icon-seperator" t-class-content="icon-seperator-content" layout="vertical" />
            <t-icon color="{{textcolor}}" name="home" size="48rpx" /> -->
        </view>
        <view class="navigation-title" style="{{'line-height:' + navigationBarHeight}}">{{title}}</view>
    </view>
</view>
<view style="{{'height: ' + navigationBarAndStatusBarHeight}}"></view>
```

```less
.navigation-container {
    --text-color: #fff;
    --background-color: transparent;
    --td-divider-content-color: var(--text-color);
    position: fixed;
    width: 100%;
    z-index: 9999999;
    top: 0;
    left: 0;

    .navigation-bar {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;

        .navigation-buttons {
            display: flex;
            align-items: center;
            margin-left: 10px;
            box-sizing: border-box;
            background-color: transparent;
            width: 68rpx;

            .icon-seperator {
                height: initial;
            }
            .icon-seperator-content {
                color: var(--text-color) !important;
            }
        }

        .navigation-title {
            position: absolute;
            left: 104px;
            right: 104px;
            text-align: center;
            font-size: 32rpx;
            color: var(--text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
```
```typescript
type ICustomNavigationType = "navigateBack" | "navigateTo" | "switchTab";

interface ICustomNavigationEvent {
    currentTarget: {
        dataset: {
            navigationtype: ICustomNavigationType
            navigationurl: string
        }
    }
}

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: ""
        },
        navigationtype: {
            type: String,
            value: "navigateBack" as ICustomNavigationType
        },
        navigationurl: {
            type: String,
            value: "/pages/index/index"
        },
        textcolor: {
            type: String,
            value: "#fff"
        },
        backgroundcolor: {
            type: String,
            value: "transparent"
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        //是否是分享页面 由分享而来 不展示返回按钮
        isShare: false,
        // 状态栏高度
        statusBarHeight: 44 + 'px',
        // 导航栏高度
        navigationBarHeight: 44 + 'px',
        // 胶囊按钮高度
        menuButtonHeight: 44 + 'px',
        // 导航栏和状态栏高度
        navigationBarAndStatusBarHeight: 44 + 'px'
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleBackClick(evt: ICustomNavigationEvent) {
            const { navigationtype, navigationurl } = evt.currentTarget.dataset
            if (navigationtype === "navigateTo") {
                wx.navigateTo({
                    url: navigationurl
                })
                return
            }
            if (navigationtype === "switchTab") {
                wx.switchTab({
                    url: navigationurl
                })
                return
            }
            wx.navigateBack()
        }
    },
    lifetimes: {
        attached() {
            const that = this;
            const {
                statusBarHeight,
                platform
            } = wx.getSystemInfoSync();//获取系统信息
            const {
                top,
                height
            } = wx.getMenuButtonBoundingClientRect();
            console.log(wx.getSystemInfoSync())
            //状态栏高度
            // 胶囊按钮高度 一般是32px 如果获取不到就使用32px
            const menuButtonHeight = height ? height : 32;
            // 判断胶囊按钮信息是否成功获取
            let navigationBarHeight = platform === 'android' ? 48 : 40
            if (top && top !== 0 && height && height !== 0) {
                // 导航栏高度
                navigationBarHeight = (top - statusBarHeight) * 2 + height
            }
            //用于绝对定位 占用空间
            const navigationBarAndStatusBarHeight = navigationBarHeight + statusBarHeight;

            that.setData({
                // 状态栏高度
                statusBarHeight: statusBarHeight + 'px',
                // 导航栏高度
                navigationBarHeight: navigationBarHeight + 'px',
                // 胶囊按钮高度
                menuButtonHeight: menuButtonHeight + 'px',
                // 导航栏和状态栏高度
                navigationBarAndStatusBarHeight: navigationBarAndStatusBarHeight + 'px'
            })
        }
    }
})
```

## 使用 ##

```html
<t-navigation-bar navigationtype="navigateBack" title="航班详情"></t-navigation-bar>
<view class="container">
    <view class="header">
        <image class="header-logo" src="/modules/service/flight/images/pic_home_logo@3x.png" />
    </view>
    <view class="body">
        <view class="flight-card">
            <view class="title">
                <view class="title-flighticon">
                    <image style="width: 56rpx;height: 56rpx;" src="/modules/service/flight/images/icon_flight_detail@3x.png" />
                </view>
                <view class="title-flightinfo">
                    <view class="title-flightnumber">
                        <view>{{flightInfo.flightCarrier}} {{flightInfo.flightNO}} {{flightInfo.sharedFlight?'共享':''}}</view>
                        <view class="title-flightdate">
                            {{flightInfo.flightDate}}
                        </view>
                    </view>
                    <view class="title-flightnumber-share">实际乘坐航班：{{flightInfo.actualFlight}}</view>
                </view>
            </view>
            <t-divider></t-divider>
            <view class="content">
                <view class="progress">
                    <view class="progress-left">
                        <text>{{flightInfo.progressTitle}}</text>
                    </view>
                    <view class="progress-right">
                        <text>{{flightInfo.progressLabel}}</text>
                    </view>
                </view>

                <view class="times">
                    <view class="times-row">
                        <view class="times-row-left">预计起飞时间</view>
                        <view class="times-row-center">
                        </view>
                        <view class="times-row-right">预计到达时间</view>
                    </view>
                    <view class="times-row">
                        <view class="times-row-left">{{flightInfo.estimateDepartureTime}}</view>
                        <view class="times-row-center">
                            <image style="width: 56rpx;height: 56rpx;" src="/modules/service/flight/images/icon_home_wdgz_flight@3x.png" />
                        </view>
                        <view class="times-row-right">{{flightInfo.estimateArrivalTime}}</view>
                    </view>
                    <view class="times-row">
                        <view class="times-row-left">计划起飞时间：{{flightInfo.planDepartureTime}}</view>
                        <view class="times-row-center">
                        </view>
                        <view class="times-row-right">计划到达时间：{{flightInfo.planArrivalTime}}</view>
                    </view>
                    <view class="times-row">
                        <view class="times-row-left">{{flightInfo.departure}}</view>
                        <view class="times-row-center"></view>
                        <view class="times-row-right">{{flightInfo.arrival}}</view>
                    </view>
                </view>

                <view class="cells">
                    <view class="cell">
                        <text>{{flightInfo.gateNumber}}</text>
                        <text>值机柜台</text>
                    </view>
                    <view class="cell">
                        <text>{{flightInfo.checkInNumber}}</text>
                        <text>登机口</text>
                    </view>
                    <view class="cell">
                        <text>{{flightInfo.planBoardingTime}}</text>
                        <text>预计登机时间</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="action">
            <t-button t-class="checkin-button" variant="outline" theme="primary" size="large" block>
                <view class="image-button">
                    <image style="width: 48rpx;height: 48rpx;" src="/modules/service/flight/images/icon_flight_zxzj@3x.png" />在线值机
                </view>
            </t-button>
            <t-button wx:if="{{flightInfo.isConcerned}}" theme="primary" size="large" block>
                <view class="image-button">
                    <image style="width: 48rpx;height: 48rpx;" src="/modules/service/flight/images/icon_flight_qxgz_1@3x.png" />取消关注
                </view>
            </t-button>
            <t-button t-class="image-button unconcerned-button" wx:else size="large" block>
                <view class="image-button">
                    <image style="width: 48rpx;height: 48rpx;" src="/modules/service/flight/images/icon_flight_follow@3x.png" />关注航班
                </view>
            </t-button>
        </view>
    </view>
</view>
```


```json
{
    "usingComponents": {
        "t-divider": "tdesign-miniprogram/divider/divider",
        "t-navigation-bar":"../../components/navigation-bar/navigation-bar"
    },
    "navigationBarTitleText": "航班详情",
    "navigationStyle": "custom"
}
```

```typescript
Page({

    /**
     * 页面的初始数据
     */
    data: {
        flightInfo: {
            flightNO: 'CA1350',
            flightCarrier: '中国国航',
            flightDate: '2023-08-08',
            sharedFlight: true,
            actualFlight: 'ZH9420',
        
            departure: '苏南硕放机场',
            planDepartureTime: '08:06',
            estimateDepartureTime: '08:06',
            actualDepartureTime: '08:06',
        
            arrival: '北京大兴机场',
            planArrivalTime: '10:16',
            estimateArrivalTime: '10:16',
            actualArrivalTime: '10:16',
        
            gateNumber: '33-36',
            checkInNumber: '09',
            planBoardingTime: '07:40',
        
            progressTitle: '正在办票',
            progressLabel: '',

            isConcerned: false
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(params: {
        flightNO: string
    }) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
```


```less
page {
    background-color: #F8F8F8;
}

.container {
    --td-brand-color: #00A4C5;
    --td-divider-color: #c0bcbc;
    padding: 0;
    gap: 60rpx;
    background-color: #F8F8F8;
    position: absolute;
    top: 0;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .header {
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        height: 400rpx;
        align-items: center;
        justify-content: center;
        z-index: 0;

        .header-logo {
            width: 300rpx;
            height: 300rpx;
            z-index: 2;
        }

        &::after {
            content: '';
            width: 120%;
            height: 400rpx;
            position: absolute;
            z-index: 1;
            left: -10%;
            top: 0;
            border-radius: 0 0 50% 50%;
            background-color: #f3f3f3;
            background: linear-gradient(0deg, #12507b, #12507b);
        }
    }

    .body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 60rpx;
        width: 96vw;

        .flight-card {
            margin-top: -200rpx;
            border-radius: 10rpx;
            background-color: #fff;
            width: 100%;
            z-index: 3;
            font-size: 28rpx;

            .title {
                display: flex;
                gap: 30rpx;
                padding: 0 40rpx;
                align-items: center;
                height: 120rpx;

                .title-flighticon {
                    width: 56rpx;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .title-flightinfo {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;

                    .title-flightnumber {
                        font-size: 32rpx;
                        font-weight: bold;
                        display: flex;
                        justify-content: space-between;

                        .title-flightdate {
                            font-size: 32rpx;
                            font-weight: bold;
                        }
                    }

                    .title-flightnumber-share {
                        font-weight: normal;
                        font-size: 28rpx;
                    }
                }
            }

            .content {
                padding: 10rpx 40rpx;
                gap: 30rpx;
                display: flex;
                flex-direction: column;

                .progress {
                    display: flex;
                    background-color: #BCF7C7;
                    border-radius: 10rpx;
                    height: 68rpx;
                    color: #fff;

                    .progress-left {
                        flex: 3;
                        display: flex;
                        align-items: center;
                        border-radius: 10rpx;
                        background-color: #58BE6B;
                        justify-content: center;
                    }

                    .progress-right {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        flex: 7;
                    }
                }

                .times {
                    display: flex;
                    flex-direction: column;
                    gap: 10rpx;

                    .times-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .times-row-left {}

                        .times-row-center {}

                        .times-row-right {
                            text-align: right;
                        }
                    }

                    .times-row:nth-child(2) {
                        font-size: 56rpx;
                        font-weight: bold;
                    }

                    .times-row:nth-child(4) {
                        font-size: 32rpx;
                    }
                }

                .cells {
                    display: flex;
                    gap: 30rpx;

                    .cell {
                        display: flex;
                        flex: 1;
                        flex-direction: column;
                        justify-content: space-around;
                        align-items: center;
                        border-radius: 10rpx;
                        background-color: #f2f2f2;
                        height: 200rpx;

                        text:first-child {
                            flex: 3;
                            font-size: 48rpx;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                        }

                        text:last-child {
                            flex: 2;
                            display: flex;
                            align-items: center;
                        }
                    }

                }
            }


        }


        .action {
            width: 100%;
            display: flex;
            // grid-template-columns: repeat(2, 1fr);
            gap: 10rpx;
        }
    }

}

.image-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    width: 100%;
}

.checkin-button {
    color: var(--td-brand-color, #0052d9) !important;
    border: solid 1px var(--td-brand-color, #0052d9);
}

.unconcerned-button {
    color: var(--td-brand-color, #0052d9) !important;
    background-color: #fff !important;
}
```
