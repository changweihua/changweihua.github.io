// 1.由 web page 发送消息
// 	- worker.postMessage(发送数据)
// 2.web worker 接收消息并执行相关逻辑
// 	- onmessage = (e) => {
// 		接收数据并处理逻辑
// 		postMessage(传递处理后的数据)
// 	  }
// 3.由 web page 监听 worker 消息，包括：
// 	- 处理数据的监听
// 		worker.onmessage = （得到处理的数据）=> {}
// 	- 执行中报错监听
// 		worker.onerror = (报错信息) => {}
import ColorThief from "colorthief";

const colorThief = new ColorThief();

onmessage = async (e) => {
  console.log("发送来的数据" + e);
  const { image, index } = e.data;
  try {
    //通过colorThief.getPalette(img,3) 获取图片中的三种颜色
    //getPalette()函数接受两个参数 第一个参数是目标图片，第二个参数是要获取颜色的数量，该函数返回的是一个二维数组 二维数组的每一个元素是 rgb格式的颜色
    const colors = await colorThief.getPalette(image.querySelector("img"), 3);
    console.log(colors);
    //遍历二维数组 将颜色处理成我们想要的rgb格式
    const nColors = colors.map((c) => `rgba(${c[0]},${c[1]},${c[2]},0.5)`);

    postMessage({
      colors: nColors,
      index: index,
    });
  }
  finally{}
};
