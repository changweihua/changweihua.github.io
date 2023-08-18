const fs = require('fs-extra');
// const rfs = require('recursive-fs');
const path = require("path");
const rimraf = require('rimraf');

const rootFolder = process.cwd()

console.log(rootFolder);

console.log("清空字体缓存");


// 删除指定文件夹下面的所有文件或文件夹
fs.emptyDirSync(path.join(rootFolder, 'font/Alibaba'));

fs.copySync(path.join(rootFolder, 'font/ttf'), path.join(rootFolder, 'font/Alibaba/ttf'))

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
