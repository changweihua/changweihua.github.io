---
lastUpdated: true
commentabled: true
recommended: true
title: 基于Docnet和SkiaSharp的实现
description: C# PDF转图片工具类
date: 2026-05-18 10:35:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

在 .NET 开发中，PDF 转图片是一个常见需求。本文介绍如何使用 Docnet.Core 和 SkiaSharp 实现一个跨平台的 PDF 转图片工具类。

## 核心代码 ##

```csharp
using Docnet.Core;
using Docnet.Core.Models;
using SkiaSharp;

namespace PdfTools
{
    /// <summary>
    /// PDF 页面转图片工具类
    /// 基于 Docnet.Core 和 SkiaSharp 实现跨平台 PDF 渲染
    /// </summary>
    public class PdfSplitter
    {
        /// <summary>
        /// 将 PDF 文件的所有页面转换为图片
        /// </summary>
        public static void SplitPdfToImages(
            string pdfPath, 
            string outputDirectory, 
            int dpi = 150, 
            ImageFormat imageFormat = ImageFormat.Png)
        {
            if (!File.Exists(pdfPath))
                throw new FileNotFoundException("PDF 文件不存在", pdfPath);

            if (!Directory.Exists(outputDirectory))
                Directory.CreateDirectory(outputDirectory);

            double scale = dpi / 72.0;

            using (var docReader = DocLib.Instance.GetDocReader(
                pdfPath, new PageDimensions(scale)))
            {
                int pageCount = docReader.GetPageCount();
                Console.WriteLine($"开始转换: {Path.GetFileName(pdfPath)}, 共 {pageCount} 页");

                for (int pageIndex = 0; pageIndex < pageCount; pageIndex++)
                {
                    using (var pageReader = docReader.GetPageReader(pageIndex))
                    {
                        int pixelWidth = pageReader.GetPageWidth();
                        int pixelHeight = pageReader.GetPageHeight();
                        byte[] imageBytes = pageReader.GetImage();
                        
                        string fileName = $"{Path.GetFileNameWithoutExtension(pdfPath)}_p{pageIndex + 1}_{pixelWidth}x{pixelHeight}.{imageFormat.ToString().ToLower()}";
                        string outputPath = Path.Combine(outputDirectory, fileName);
                        
                        SaveImageWithSkia(imageBytes, pixelWidth, pixelHeight, outputPath, imageFormat);
                        Console.WriteLine($"已生成: {fileName}");
                    }
                }
            }
        }

        private static void SaveImageWithSkia(
            byte[] bgraBytes, int width, int height,
            string outputPath, ImageFormat format, SKColor backgroundColor = default)
        {
            if (backgroundColor == default) 
                backgroundColor = SKColors.White;

            SKImageInfo info = new SKImageInfo(width, height);
            using (var surface = SKSurface.Create(info))
            {
                var canvas = surface.Canvas;
                canvas.Clear(backgroundColor);
                
                using (var sourceBitmap = new SKBitmap(width, height, SKColorType.Bgra8888, SKAlphaType.Premul))
                {
                    unsafe
                    {
                        fixed (byte* src = bgraBytes)
                        {
                            Buffer.MemoryCopy(src, (void*)sourceBitmap.GetPixels(), bgraBytes.Length, bgraBytes.Length);
                        }
                    }
                    canvas.DrawBitmap(sourceBitmap, 0, 0);
                }

                using (var image = surface.Snapshot())
                using (var data = EncodeImage(image, format))
                {
                    using (var stream = File.OpenWrite(outputPath)) 
                        data.SaveTo(stream);
                }
            }
        }

        private static SKData EncodeImage(SKImage image, ImageFormat format)
        {
            return format switch
            {
                ImageFormat.Jpeg => image.Encode(SKEncodedImageFormat.Jpeg, 90),
                ImageFormat.Png => image.Encode(SKEncodedImageFormat.Png, 100),
                ImageFormat.Webp => image.Encode(SKEncodedImageFormat.Webp, 90),
                _ => image.Encode(SKEncodedImageFormat.Png, 100)
            };
        }
    }

    public enum ImageFormat { Png, Jpeg, Webp }
}
```

## 使用示例 ##

```csharp
PdfSplitter.SplitPdfToImages(
    @"C:\input.pdf", 
    @"C:\output", 
    dpi: 150, 
    imageFormat: ImageFormat.Png
);
```

## 依赖包 ##

```xml
<PackageReference Include="Docnet.Core" Version="2.6.0" />
<PackageReference Include="SkiaSharp" Version="2.88.8" />
```

## 总结 ##

本文介绍了一个基于 Docnet.Core 和 SkiaSharp 的 PDF 转图片工具类，支持自定义 DPI、多种图片格式和背景色设置。
