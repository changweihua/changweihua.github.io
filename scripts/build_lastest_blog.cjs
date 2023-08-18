const fs = require("fs");
const path = require("path");
const lineReader = require("line-reader"),
  Promise = require("bluebird");

const rootFolder = process.cwd();
console.log(rootFolder);

console.log("------------------start--------------------");
let fileList = []; //文件路径列表

const compareByDescending = (a, b) => b.localeCompare(a);

function readFileList(dir, fileList = []) {
  console.log(`------------------${dir}--------------------`);

  let files = fs.readdirSync(dir);

  files = files.filter((f) => f !== "index.md").sort(compareByDescending);

  console.log(files);

  files.forEach((item) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), fileList); //递归读取文件
    } else if (fullPath.endsWith(".md") && item !== "index.md") {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writeFile(fileArr, fileName) {
  // const reg_1 =
  //   /(?<!\/\/\s*.*|<!--\s.*)([\u2E80-\u9FFF]*\$?{{0,2}\w*\.*\w*}{0,2}[\u2E80-\u9FFF]+)*/g;
  // const obj = fileArr.reduce((pre, cur) => {
  //   let fileSuffix = cur.match(/(.ts|.js|.vue|.md)$/g)?.[0];
  //   let pathName = path.basename(cur, fileSuffix);
  //   // 如果文件名是index,取父级文件名
  //   if (pathName === "index") {
  //     const pathArr = cur.split(path.sep);
  //     pathName = pathArr[pathArr.length - 2];
  //   }
  //   pre[pathName] = {};
  //   let pkg = fs.readFileSync(cur, "utf-8");
  //   const strArr = pkg.match(reg_1);
  //   if (strArr?.length) {
  //     strArr.forEach((item, index) => {
  //       if (item.includes("{")) {
  //         let index = 0;
  //         item = item.replace(/\$?{{0,2}\w*\.*\w*}{0,2}/g, function (val) {
  //           if (val) {
  //             index++;
  //             return `{${index - 1}}`;
  //           } else {
  //             return "";
  //           }
  //         });
  //       }
  //       // 如果匹配的字符串的字数大于10，处理key 值
  //       if (item.length) {
  //         let str = item.length >= 10 ? `${item.substring(0, 7)}...` : item;
  //         pre[pathName][str] = item;
  //       }
  //     });
  //   }
  //   return pre;
  // }, {});

  let blogs = [];
  const eofContent = "---";

  //   var lineReader = require('line-reader'),
  //   Promise = require('bluebird');

  // var eachLine = Promise.promisify(lineReader.eachLine);
  // eachLine('file.txt', function(line) {
  // console.log(line);
  // }).then(function() {
  // console.log('done');
  // }).catch(function(err) {
  // console.error(err);
  // });

  // var lineReader = require('line-reader'),
  //     Promise = require(...);

  // var eachLine = function(filename, options, iteratee) {
  //   return new Promise(function(resolve, reject) {
  //     lineReader.eachLine(filename, options, iteratee, function(err) {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve();
  //       }
  //     });
  //   });
  // }
  // eachLine('file.txt', function(line) {
  //   console.log(line);
  // }).then(function() {
  //   console.log('done');
  // }).catch(function(err) {
  //   console.error(err);
  // });

  const fileFrontmatterMap = new Map();
  const pedingMap = new Map();
  let pedingCount = fileArr.length;

  var eachLine = Promise.promisify(lineReader.eachLine);

  Promise.all(
    fileArr.map((file) => {
      fileFrontmatterMap.set(file, {});
      pedingMap.set(file, 0);

      return eachLine(file, function (line) {
        console.log(file, line);
        if (line === eofContent) {
          const count = pedingMap.get(file);
          pedingMap.set(file, count + 1);
        }
        if (pedingMap.get(file) >= 2) {
          pedingCount--;
          return false;
        }
        if (line !== eofContent) {
          let frontmatter = fileFrontmatterMap.get(file);
          const segments = line.split(":");
          frontmatter[segments[0].trim()] = segments[1].trim();
          fileFrontmatterMap.set(file, frontmatter);
        }
      });
    })
  ).then((json) => {
    console.log(fileFrontmatterMap);

    const blogs = [];

    fileFrontmatterMap.forEach((map, key) => {
      console.log(key, map);

      let fileSuffix = key.match(/(.ts|.js|.vue|.md)$/g)?.[0];
      let pathName = path.basename(key, fileSuffix);

      const fPath = key.slice(key.indexOf("blog")).replaceAll("\\", "/");
      const filePath = `${fPath.slice(0, fPath.lastIndexOf(".md"))}`;

      blogs.push({
        blogName: map["title"] || pathName,
        blogDescription: map["description"] || pathName,
        blogCover: map["cover"] || pathName,
        fileName: pathName,
        filePath: `/${filePath}`,
      });
    });

    // 创建json文件
    fs.writeFile(
      path.resolve(rootFolder, `public/jsons/${fileName}.json`),
      JSON.stringify(blogs),
      "utf8",
      function (err) {
        // console.log(err)
      }
    );
  });

  // fileArr.forEach((file) => {
  //   // console.log(file);
  //   let fileSuffix = file.match(/(.ts|.js|.vue|.md)$/g)?.[0];
  //   let pathName = path.basename(file, fileSuffix);

  //   fileFrontmatterMap.set(file, []);
  //   pedingMap.set(file, 0);

  //   lineReader.eachLine(file, (line) => {
  //     console.log(file, line);
  //     if (line === eofContent) {
  //       const count = pedingMap.get(file);
  //       pedingMap.set(file, count + 1);
  //     }
  //     if (pedingMap.get(file) >= 2) {
  //       pedingCount--;
  //       return false;
  //     }
  //     const frontmatters = fileFrontmatterMap.get(file);
  //     frontmatters.push(line);
  //     fileFrontmatterMap.set(file, frontmatters);
  //     // // stop if line contains `NEW`
  //     // if(line.includes('NEW')) {
  //     //     // stop reading and close the file
  //     //     return false;
  //     // }
  //   });

  //   // console.log(frontmatters);

  //   // let pkg = fs.readFileSync(file, "utf-8");

  //   // const titleArr = pkg.match(/title: [\S]*/g);
  //   // const descriptionArr = pkg.match(/description: [\S]*/g);
  //   // const coverArr = pkg.match(/cover: [\S]*/g);
  //   // // console.log(file.indexOf("blog"));
  //   // blogs.push({
  //   //   blogName: titleArr ? titleArr[0].split(":")[1].trim() : pathName,
  //   //   blogDescription: descriptionArr
  //   //     ? descriptionArr[0].split(":")[1].trim()
  //   //     : pathName,
  //   //   blogCover: coverArr ? coverArr[0].split(":")[1].trim() : pathName,
  //   //   fileName: pathName,
  //   //   filePath: `/${file.slice(file.indexOf("blog")).replaceAll("\\", "/")}`,
  //   // });
  // });

  // while (pedingCount > 0) {
  //   sleep(500);
  // }
}

readFileList(path.resolve(rootFolder, "blog"), fileList);

fs.stat(path.resolve(rootFolder, "public/jsons"), function (err, statObj) {
  // 判断local文件是否存在，如果不存在则创建，如果创建则直接处理json文件
  if (!statObj) {
    fs.mkdir(path.resolve(rootFolder, "public/jsons"), function (err) {
      writeFile(fileList.slice(0, 9), "lastest_blogs");
    });
  } else {
    writeFile(fileList.slice(0, 9), "lastest_blogs");
  }
});
