const fs = require('fs-extra');
// const rfs = require('recursive-fs');
const path = require("path");
const rimraf = require('rimraf');

const rootFolder = process.cwd()

console.log("移动生成好的字体");

// 删除指定文件夹下面的所有文件或文件夹
fs.emptyDirSync(path.join(rootFolder, 'public/fonts/Alibaba'));

fs.copySync(path.join(rootFolder, 'font/Alibaba'), path.join(rootFolder, 'public/fonts/Alibaba'))
