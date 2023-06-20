# 使用 SkiaSharp 实现图片水印 #

## 项目依赖 ##

- `Microsoft.Maui.Graphics.Skia`
- `SkiaSharp.NativeAssets.Linux.NoDependencies`

## 完整代码 ##

```c#

namespace SunnyLand.Common.Interfaces
{
    public interface IWatermarkService
    {
        Task<byte[]> AddWatermarkAsync(string originFilePath);
    }
}


```

```csharp

using SkiaSharp;
using SunnyLand.Common.Interfaces;

namespace SunnyLand.Services
{
    public class WatermarkService : IWatermarkService
    {

        private readonly IConfiguration _configuration;
        public WatermarkService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<byte[]> AddWatermarkAsync(string originFilePath)
        {
            await Task.CompletedTask;
            //加载原始图片到内存中
            using (var input = File.OpenRead($"{originFilePath}"))
            {
                using (var inputStream = new SKManagedStream(input))
                {
                    using (var original = SKBitmap.Decode(inputStream))
                    {

                        var code = _configuration["Watermark:Content"];

                        // 获取宋体在字体集合中的下标
                        var index = SKFontManager.Default.FontFamilies.ToList().IndexOf("宋体");
                        // 创建宋体字形
                        var songtiTypeface = SKFontManager.Default.GetFontStyles(index).CreateTypeface(0);

                        var sKPaint = new SKPaint
                        {
                            TextSize = 20f,
                            IsAntialias = true,
                            Color = SKColor.Parse("#EE0A24"),
                            Typeface = SKTypeface.FromFamilyName("Microsoft YaHei"),
                            TextAlign = SKTextAlign.Left
                        };

                        //根据文字样式计算画布宽度
                        using (var canvas = new SKCanvas(original))
                        {
                            SKPath path = new SKPath();
                            path.MoveTo(original.Width / 10, original.Height - original.Height / 10);
                            path.LineTo(original.Width - original.Width / 10, original.Height / 10);

                            canvas.DrawTextOnPath(code, path, 0, 0, sKPaint);
                            path.Dispose();

                            canvas.Flush();

                            if (Path.GetExtension(originFilePath).ToLower() == ".png")
                            {
                                using (var skData = original.Encode(SKEncodedImageFormat.Png, 100))
                                {
                                    using (var memoryStream = new MemoryStream())
                                    {
                                        memoryStream.SetLength(0);
                                        skData.SaveTo(memoryStream);

                                        return memoryStream.ToArray();
                                    }
                                }
                            }
                            else
                            {
                                using (var skData = original.Encode(SKEncodedImageFormat.Jpeg, 100))
                                {
                                    using (var memoryStream = new MemoryStream())
                                    {
                                        memoryStream.SetLength(0);
                                        skData.SaveTo(memoryStream);

                                        return memoryStream.ToArray();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


```

```json

{
    "WatermarkOptions": {
      "Text": "水印水印水印水印",
      "TextSize": 20,
      "Font": "Microsoft YaHei",
      "Color": "#EE0A24"
    },
}

```