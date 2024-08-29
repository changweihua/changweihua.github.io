const fs = require('fs-extra');
// const rfs = require('recursive-fs');
const path = require("path");
const rimraf = require('rimraf');

const rootFolder = process.cwd()

console.log(rootFolder);
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

let fontName = 'JetBrains'

switch (myArgs[0]) {
  case '--font':
    console.log(myArgs[1]);
    fontName = myArgs[1]
    break;
  case 'compliment':
    console.log(myArgs[1], 'is really cool.');
    break;
  default:
    console.log('使用默认字体设置');
}
console.log("清空字体缓存");


// 删除指定文件夹下面的所有文件或文件夹
fs.emptyDirSync(path.join(rootFolder, `font/JetBrains`));
fs.copySync(path.join(rootFolder, `font/JetBrainsTtf`), path.join(rootFolder, `font/JetBrains/ttf`))

fs.emptyDirSync(path.join(rootFolder, `font/Alibaba`));
fs.copySync(path.join(rootFolder, `font/AlibabaTtf`), path.join(rootFolder, `font/Alibaba/ttf`))

fs.emptyDirSync(path.join(rootFolder, `font/Fangyuan`));
fs.copySync(path.join(rootFolder, `font/FangyuanTtf`), path.join(rootFolder, `font/Fangyuan`))

// 删除指定文件夹下面的所有文件或文件夹
// rfs.rmdirr(path.join(rootFolder, 'font/Alibaba'), function(err) {
//   if (err) {
//       console.error(err);
//   } else {
//       console.log('成功删除指定文件夹下面的所有内容！');
//   }
// });

// rimraf(path.join(rootFolder, 'font/Alibaba'), function () { console.log('done'); });

// fs.rmdir(path.join(rootFolder, 'font/Alibaba'), { recursive: true }, (err) => {
//   if (err) throw err;
//   console.log(`${path}directory deleted`);
// });
