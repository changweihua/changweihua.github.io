const fs = require('fs-extra');
// const rfs = require('recursive-fs');
const path = require("path");
const rimraf = require('rimraf');

const rootFolder = process.cwd()

console.log("移动生成好的字体");

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

let fontName = 'JetBrainsMapleMono'

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

// 删除指定文件夹下面的所有文件或文件夹
fs.emptyDirSync(path.join(rootFolder, `public/fonts/${fontName}`));
fs.copySync(path.join(rootFolder, `font/${fontName}`), path.join(rootFolder, `public/fonts/${fontName}`))

// fs.emptyDirSync(path.join(rootFolder, `public/fonts/JetBrains`));
// fs.copySync(path.join(rootFolder, `font/JetBrains`), path.join(rootFolder, `public/fonts/JetBrains`))

// fs.emptyDirSync(path.join(rootFolder, `public/fonts/Alibaba`));
// fs.copySync(path.join(rootFolder, `font/Alibaba`), path.join(rootFolder, `public/fonts/Alibaba`))

// fs.emptyDirSync(path.join(rootFolder, `public/fonts/JetBrainsMapleMono`));
// fs.copySync(path.join(rootFolder, `font/JetBrainsMapleMono`), path.join(rootFolder, `public/fonts/JetBrainsMapleMono`))

console.log(`生成好的字体 ${fontName} 已完成移动`);
