import scpClient from "node-scp2"; // 自动化部署
import chalk from "chalk"; // 控制台输出的语句
import ora from "ora"; // 命令行加载动画库

const spinner = ora("xxx系统正在自动部署...");
const server = {
  host: "192.168.1.x", // 服务器的IP地址
  port: 22, // 服务器端口，默认一般为22
  username: "root", // 用户名
  password: "xxxxx", // 密码
  path: "/data/test", // 项目部署的服务器目标位置
};

spinner.start();

// 本地打包文件的位置 ./dist
scpClient.upload("./dist", server, (err: any) => {
  spinner.stop();
  if (!err) {
    console.log(chalk.blue("xxx系统自动化部署完毕!"));
  } else {
    console.log(chalk.red("xxx系统自动化部署出现异常"), err);
  }
});
