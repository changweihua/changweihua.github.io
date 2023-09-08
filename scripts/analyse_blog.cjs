const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const fm = require("front-matter");

const rootFolder = process.cwd();

const out = [];
let re = /---(.*?)---/gs;
function readAll(parentPath) {
  const files = fs.readdirSync(parentPath);
  console.log(files);
  files.map((item) => {
    let tempPath = path.join(parentPath, item); //当前文件或文件夹的路径
    let stats = fs.statSync(tempPath); //判断是文件还是文件夹
    if (stats.isDirectory()) {
      //文件夹递归处理
      readAll(tempPath);
    } else {
      const content = fs.readFileSync(tempPath, "utf8"); //获取文件内容
      let s = re.exec(content); //通过正则获取frontmatter的内容
      re.lastIndex = 0; // 这里如果不操作，在后面正则判断时会有问题，当时在这里卡了很久

      const formatter = fm(content);
      console.log(formatter);
      // console.log(s)
      if (formatter) {
        let docs = yaml.load(s[1]); // 通过yaml转换成对象
        console.log(docs)
        docs.link = "/littlear" + tempPath.slice(4, -3); // 这里是为了文章列表的跳转
        out.push(docs);
      }
    }
  });

  const filePath = path.resolve(rootFolder, "public", "docs.json");
  fs.writeFileSync(filePath, JSON.stringify(out), {
    encoding: "utf8",
  });
}
readAll(path.resolve(rootFolder, "blog"));
