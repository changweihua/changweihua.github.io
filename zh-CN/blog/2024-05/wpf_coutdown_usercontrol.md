---
lastUpdated: true
commentabled: true
recommended: true
title:  WPF 自定义倒计时控件
description: WPF 自定义倒计时控件
date: 2024-05-27 09:18:00
pageClass: blog-page-class
---

# WPF 自定义倒计时控件 #

> 支持文本和倒计时同时显示

![示例图](/images/cmono_wpf_countdown_.gif){data-zoomable}

## XAML ##

```xml
<UserControl
    x:Class="BaggageMeasurer.UserControls.Countdown"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    xmlns:uc="clr-namespace:BaggageMeasurer.UserControls"
    d:DesignHeight="450"
    d:DesignWidth="450"
    Loaded="UserControl_Loaded"
    mc:Ignorable="d">
    <UserControl.Triggers>
        <EventTrigger RoutedEvent="UserControl.Loaded">
            <BeginStoryboard>
                <Storyboard>
                    <DoubleAnimation
                        Name="Animation"
                        Storyboard.TargetName="Arc"
                        Storyboard.TargetProperty="EndAngle"
                        From="-90"
                        To="270" />
                </Storyboard>
            </BeginStoryboard>
        </EventTrigger>
    </UserControl.Triggers>
    <Viewbox>
        <Grid Width="100" Height="100">
            <Border
                Margin="5"
                Background="Transparent"
                CornerRadius="50">
                <StackPanel
                    HorizontalAlignment="Center"
                    VerticalAlignment="Center"
                    Orientation="Vertical">
                    <TextBlock
                        HorizontalAlignment="Center"
                        FontFamily="{DynamicResource HarmonyOS}"
                        FontSize="30"
                        Text="{Binding Seconds}" />
                    <Label
                        HorizontalAlignment="Center"
                        Content="秒"
                        FontSize="20" />
                </StackPanel>
            </Border>

            <uc:Arc
                x:Name="Arc"
                Center="50, 50"
                EndAngle="-90"
                Radius="45"
                StartAngle="-90"
                StrokeThickness="8">
                <uc:Arc.Stroke>
                    <LinearGradientBrush StartPoint="0.5, 0" EndPoint="0.5, 1">
                        <GradientStop Offset="0" Color="{StaticResource CountdownForegroundBrush}" />
                        <GradientStop Offset="0.5" Color="{StaticResource CountdownForegroundBrush}" />
                        <GradientStop Offset="1.0" Color="{StaticResource CountdownForegroundBrush}" />
                    </LinearGradientBrush>
                </uc:Arc.Stroke>
            </uc:Arc>
        </Grid>
    </Viewbox>
</UserControl>
```

## XAML.CS ##

```csharp
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;

namespace BaggageMeasurer.UserControls
{
    /// <summary>
    /// Countdown.xaml 的交互逻辑
    /// </summary>
    public partial class Countdown : UserControl
    {
        public int Seconds
        {
            get => (int)GetValue(SecondsProperty);
            set => SetValue(SecondsProperty, value);
        }

        public static readonly DependencyProperty SecondsProperty =
            DependencyProperty.Register(nameof(Seconds), typeof(int), typeof(Countdown), new PropertyMetadata(10));

        private readonly DispatcherTimer _timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };

        public Countdown()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void UserControl_Loaded(object sender, EventArgs e)
        {
            Animation.Duration = new Duration(TimeSpan.FromSeconds(Seconds));
            if (Seconds > 0)
            {
                _timer.Start();
                _timer.Tick += Timer_Tick;
            }
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            Seconds--;
            if (Seconds == 0)
            {
                _timer.Stop();
                //3、激发路由事件
                RoutedEventArgs arg = new RoutedEventArgs();
                arg.RoutedEvent = CountdownStoppedEvent;
                RaiseEvent(arg);
            }
        }

        public void Cancel()
        {
            _timer.Stop();
        }

        public void Pause()
        {
            _timer.IsEnabled = false;
        }

        public void Start()
        {
            _timer.IsEnabled = true;
            _timer.Start();
        }

        //1、声明并注册路由事件，使用冒泡策略
        public static readonly RoutedEvent CountdownStoppedEvent = EventManager.RegisterRoutedEvent("CountdownStopped",
            RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(Countdown));

        //2、通过.NET事件包装路由事件
        public event RoutedEventHandler CountdownStopped
        {
            add
            {
                AddHandler(CountdownStoppedEvent, value);
            }
            remove
            {
                RemoveHandler(CountdownStoppedEvent, value);
            }
        }
    }
}

```

## 使用 ##

### XAML ###

```csharp
<Button
                Padding="30,10"
                Command="{Binding ExecuteBackCommand}"
                Style="{StaticResource LargeMaterialDesignRaisedLightButton}"
                Template="{StaticResource RoundButtonTemplate}">
                <Button.Content>
                    <Grid>
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="6*" />
                            <ColumnDefinition Width="4*" />
                        </Grid.ColumnDefinitions>
                        <Grid>
                            <StackPanel HorizontalAlignment="Left" VerticalAlignment="Center">
                                <Label
                                    HorizontalAlignment="Center"
                                    VerticalAlignment="Center"
                                    Content="{localize:Loc Key=BackButton}"
                                    FontSize="{DynamicResource ButtonFontSizeLevel4}" />
                                <Label
                                    HorizontalAlignment="Center"
                                    VerticalAlignment="Center"
                                    Content="{localize:Loc Key=BackButton,
                                    ForceCulture=en-US}"
                                    FontSize="{DynamicResource ButtonFontSizeLevel5}" />
                            </StackPanel>
                        </Grid>
                        <Grid Grid.Column="1" HorizontalAlignment="Right">
                            <Viewbox>
                                <uc:Countdown
                                    x:Name="Countdown"
                                    Width="50"
                                    Height="50"
                                    CountdownStopped="Countdown_CountdownStopped"
                                    Seconds="10" />
                            </Viewbox>
                        </Grid>
                    </Grid>
                </Button.Content>
            </Button>
```
