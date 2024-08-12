---
lastUpdated: true
commentabled: true
recommended: true
title:  WPF 视频播放
description: WPF 视频播放
date: 2024-06-11 13:18:00
pageClass: blog-page-class
---

# WPF 视频播放 #

## LibVLCSharp.WPF ##

```xml
<Window
    x:Class="NModbusCommander.Views.MainWindow"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:lvs="clr-namespace:LibVLCSharp.WPF;assembly=LibVLCSharp.WPF"
    xmlns:prism="http://prismlibrary.com/"
    Title="{Binding Title}"
    Width="525"
    Height="350"
    prism:ViewModelLocator.AutoWireViewModel="True">
    <Grid>
        <ContentControl prism:RegionManager.RegionName="ContentRegion" />
        <Image
            x:Name="VideoImage"
            HorizontalAlignment="Stretch"
            VerticalAlignment="Stretch" />
        <lvs:VideoView
            x:Name="videoView"
            HorizontalAlignment="Stretch"
            VerticalAlignment="Stretch" />
    </Grid>
</Window>
```

```csharp

namespace NModbusCommander.Views
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            this.Loaded += MainWindow_Loaded;

            this.Closing += MainWindow_Closing;
        }

        private LibVLC _libVLC;
        private MediaPlayer _mediaPlayer;

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            Cleanup();
        }

        public void Cleanup()
        {
            _mediaPlayer?.Stop();
            _mediaPlayer?.Dispose();
            _libVLC.Dispose();
        }

        int _videoWidth = 500;
        int _videoHeight = 500;
        byte[] _buffer = null;
        nint _plane = 0;
        SKImageInfo _imageInfo;
        SKSurface _surface;
        WriteableBitmap _bitmap;
        Int32Rect _rect;

        private uint OnLibVLCVideoFormat(ref IntPtr opaque, IntPtr chroma,
        ref uint width, ref uint height, ref uint pitches, ref uint lines)
        // ReSharper restore RedundantAssignment
        {
            var bytes = Encoding.ASCII.GetBytes("RV32"); //I420, RV32, AVC1
            for (var i = 0; i < bytes.Length; i++)
            {
                Marshal.WriteByte(chroma, i, bytes[i]);
            }

            if (_mediaPlayer.Media is Media media)
            {
                foreach (MediaTrack track in media.Tracks)
                {
                    if (track.TrackType == TrackType.Video)
                    {
                        var trackInfo = track.Data.Video;
                        if (trackInfo.Width > 0 && trackInfo.Height > 0)
                        {
                            width = trackInfo.Width;
                            height = trackInfo.Height;
                        }

                        break;
                    }
                }
            }

            var pixelFormat = PixelFormats.Bgra32;
            pitches = (uint)(width * pixelFormat.BitsPerPixel) / 8;
            lines = height;

            _videoWidth = (int)width;
            _videoHeight = (int)height;

            _buffer = new byte[_videoWidth * _videoHeight * 4];
            _plane = Marshal.UnsafeAddrOfPinnedArrayElement(_buffer, 0);

            Dispatcher.Invoke(delegate
            {
                _bitmap = new WriteableBitmap(_videoWidth, _videoHeight, 96, 96, PixelFormats.Bgra32, null);
                _imageInfo = new SKImageInfo(_videoWidth, _videoHeight, SKColorType.Bgra8888);
                _surface = SKSurface.Create(
                   new SKImageInfo(_videoWidth, _videoHeight, SKImageInfo.PlatformColorType, SKAlphaType.Premul),
                   _bitmap.BackBuffer, _bitmap.BackBufferStride);
                _rect = new Int32Rect(0, 0, _videoWidth, _videoHeight);

                VideoImage.Source = _bitmap;
                VideoImage.Stretch = Stretch.Fill;
            });
            return 1;
        }

        //获取输出目录
        private static string appPath = AppDomain.CurrentDomain.BaseDirectory;

        private IntPtr OnLibVLCVideoLock(IntPtr opaque, IntPtr planes)
        {
            IntPtr[] dataArray = { _plane };
            Marshal.Copy(dataArray, 0, planes, dataArray.Length);
            return IntPtr.Zero;
        }

        private void OnLibVLCVideoDisplay(IntPtr opaque, IntPtr picture)
        {
            var image = SKImage.FromPixels(_imageInfo, _plane);
            _surface.Canvas.DrawImage(image, new SKPoint(0, 0));

            Dispatcher.Invoke(delegate
            {
                _bitmap.Lock();
                _bitmap.AddDirtyRect(_rect);
                _bitmap.Unlock();
            });
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            LibVLCSharp.Shared.Core.Initialize();

            _libVLC = new LibVLC(true);
            var _mediaPlayer = new MediaPlayer(_libVLC)
            {
                Volume = 0, //静音
                EnableHardwareDecoding = false, //硬件加速
                Media = new Media(_libVLC, System.IO.Path.Combine(appPath, "ad.mp4"), FromType.FromPath, new string[] { "input-repeat=-1" })
            };
            //_mediaPlayer.EndReached += OnPlayerEndReached;
            //_mediaPlayer.Stopped += OnPlayerStopped;

            _libVLC.Log += (sender, e) =>
            {
                Console.WriteLine($"[LibVLC Log] {e.Level}: {e.Message}");
            };

            _mediaPlayer.EncounteredError += (sender, e) =>
            {
                MessageBox.Show("播放过程中遇到错误。");
            };

            videoView.MediaPlayer = _mediaPlayer;
            _mediaPlayer.Play();

            //_mediaPlayer.SetVideoFormatCallbacks(OnLibVLCVideoFormat, null);
            //_mediaPlayer.SetVideoCallbacks(OnLibVLCVideoLock, null, OnLibVLCVideoDisplay);

            //var options = new[]
            //{
            //    "file-caching=300",
            //    "live-capture-caching=300",
            //    "disc-caching-caching=300",
            //    "network-caching=333",
            //    "live-caching=300"
            //};

            ////_mediaPlayer.Play(new Media(_libVLC, new Uri(System.IO.Path.Combine(appPath, "ad.mp4"), UriKind.RelativeOrAbsolute), options));

            //using (var media = new Media(_libVLC, new Uri("http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8"), options))
            //{
            //    _mediaPlayer.Play(media);
            //}
        }
    }
}

```
