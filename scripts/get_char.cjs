const fs = require("fs");

/*
fs.stat               检测是文件还是目录
fs.mkdir              创建目录
fs.writeFile          创建写入文件
fs.appendFile         追加文件
fs.readFile           读取文件
fs.readdir            读取目录
fs.rename             重命名  1,表示重命名 2,移动文件
fs.unlink             删除文件
fs.rmdir              删除目录
*/

// 相对路径 目录地址
const path = "./font/local/";

// 是否为目录
function isDir(path) {
  return new Promise((resolve, rejects) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
      if (stats.isDirectory()) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// 读取目录文件
const redPath = (path) => {
  fs.readdir(path, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    data.forEach(async (item) => {
      let pathItem = path + item;
      if (!(await isDir(pathItem))) {
        ocrText(pathItem);
      } else redPath(pathItem + "/");
    });
  });
};

// 识别文字
const ocrText = (pathItem) => {
  const reg = /['"][\u4e00-\u9fa5]+.*['"]/g;
  const res = fs.readFileSync(pathItem, "utf8");
  const lines = res.split(/\r?\n/);
  append("\n 路径：" + pathItem);
  lines.forEach((item) => {
    if (item.match(reg)) {
      append(item.match(reg)[0]);
    }
  });
};

// 读入文件内容
const append = (text) => {
  fs.appendFile("./font/translateFiles.txt", "\n" + text, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("写入成功");
  });
};

redPath(path);
