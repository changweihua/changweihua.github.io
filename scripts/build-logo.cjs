const TextToSVG = require("text-to-svg");
const opentype = require("opentype.js");
const fs = require("fs");

// 异步加载字体文件（推荐低内存模式）
const font = opentype.loadSync("font/MapleMono/ttf/MapleMono-NF-CN-Regular.ttf", {
  lowMemory: true,
});
const textToSVG = new TextToSVG(font);
const options = {
  fontSize: 72, // 字体大小
  anchor: "middle", // 对齐方式（start/middle/end）
  kerning: true, // 启用字符间距调整
  y: 48,
};

const pathData = textToSVG.getD('Hello SVG', options);
// console.log(pathData); // 输出路径数据，如 "M0 0 L100 0..."

const metrics = textToSVG.getMetrics('Hello SVG', { fontSize: 36 });
// console.log(metrics.width);  // 文本宽度
// console.log(metrics.height); // 文本高度
// console.log(metrics.y);      // 基线位置

const svgContent = textToSVG.getSVG("CMONO.NET", options);
fs.writeFileSync("logo.svg", svgContent);
