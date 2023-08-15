const fs = require("fs");
const path = require("path");
console.log(__dirname);
console.log("------------------start--------------------");
let filesList = []; //文件路径列表
let jsFilesList = []; //文件路径列表
function readFile(dir, filesList = []) {
  console.log(`------------------${dir}--------------------`);

  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    if (dir.endsWith(".vue")) {
      filesList.push(dir);
    } else if (dir.endsWith(".md")) {
      filesList.push(dir);
    } else if (/(.ts|.js)$/g.test(dir)) {
      jsFilesList.push(dir);
    }
  }
  return filesList;
}
function readFileList(dir, filesList = []) {
  console.log(`------------------${dir}--------------------`);

  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList); //递归读取文件
    } else if (fullPath.endsWith(".vue")) {
      filesList.push(fullPath);
    } else if (fullPath.endsWith(".md")) {
      filesList.push(fullPath);
    } else if (/(.ts|.js)$/g.test(fullPath)) {
      jsFilesList.push(fullPath);
    }
  });
  return filesList;
}

readFileList(path.resolve(__dirname, "blog"), filesList);
readFileList(path.resolve(__dirname, "category"), filesList);
readFileList(path.resolve(__dirname, "gallery"), filesList);
readFileList(path.resolve(__dirname, ".vitepress/components"), filesList);
readFileList(path.resolve(__dirname, ".vitepress/src"), filesList);
readFileList(path.resolve(__dirname, ".vitepress/theme"), filesList);
readFileList(path.resolve(__dirname, ".vitepress/utils"), filesList);
readFile(path.resolve(__dirname, "index.md"), filesList);
readFile(path.resolve(__dirname, "CODE_OF_CONDUCT.md"), filesList);
readFile(path.resolve(__dirname, "CONTRIBUTING.md"), filesList);
readFile(path.resolve(__dirname, ".vitepress/config.ts"), filesList);

fs.stat(path.resolve(__dirname, "font/local"), function (err, statObj) {
  // 判断local文件是否存在，如果不存在则创建，如果创建则直接处理json文件
  if (!statObj) {
    fs.mkdir(path.resolve(__dirname, "font/local"), function (err) {
      writeFile(filesList, "index");
      writeFile(jsFilesList, "jsIndex");
    });
  } else {
    writeFile(filesList, "index");
    writeFile(jsFilesList, "jsIndex");
  }
});
function writeFile(fileArr, fileName) {
  const reg_1 =
    /(?<!\/\/\s*.*|<!--\s.*)([\u2E80-\u9FFF]*\$?{{0,2}\w*\.*\w*}{0,2}[\u2E80-\u9FFF]+)*/g;
  const obj = fileArr.reduce((pre, cur) => {
    let fileSuffix = cur.match(/(.ts|.js|.vue|.md)$/g)?.[0];
    let pathName = path.basename(cur, fileSuffix);
    // 如果文件名是index,取父级文件名
    if (pathName === "index") {
      const pathArr = cur.split(path.sep);
      pathName = pathArr[pathArr.length - 2];
    }
    pre[pathName] = {};
    let pkg = fs.readFileSync(cur, "utf-8");
    const strArr = pkg.match(reg_1);
    if (strArr?.length) {
      strArr.forEach((item, index) => {
        if (item.includes("{")) {
          let index = 0;
          item = item.replace(/\$?{{0,2}\w*\.*\w*}{0,2}/g, function (val) {
            if (val) {
              index++;
              return `{${index - 1}}`;
            } else {
              return "";
            }
          });
        }
        // 如果匹配的字符串的字数大于10，处理key 值
        if (item.length) {
          let str = item.length >= 10 ? `${item.substring(0, 7)}...` : item;
          pre[pathName][str] = item;
        }
      });
    }
    return pre;
  }, {});
  // 创建json文件
  fs.writeFile(
    path.resolve(__dirname, `font/local/${fileName}.json`),
    JSON.stringify(obj),
    "utf8",
    function (err) {
      // console.log(err)
    }
  );
}
