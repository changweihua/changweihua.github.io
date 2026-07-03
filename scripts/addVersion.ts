//npm run build打包前执行此段代码
let fs = require('fs')

//返回package的json数据
function getPackageJson() {
  let data = fs.readFileSync('./sysInfo.json') //fs读取文件
  return JSON.parse(data) //转换为json对象
}

const packageData = getPackageJson() //获取package的json
const arr = packageData.version.split('@') //切割后的版本号数组
const date = new Date()
const year = date.getFullYear()
const month = date.getMonth() + 1
const day = date.getDate()
const compileMonth  = month > 9 ? month : '0' + month
const compileDay = day < 10 ? '0' + day : day
const compileVerrsion = `${year}${month}${day}`
let verarr = arr[1].split('.')
verarr[2] = parseInt(verarr[2]) + 1
// packageData.version = compileVerrsion + '@' + verarr.join('.') //转换为以"."分割的字符串
//用packageData覆盖package.json内容
fs.writeFile('./sysInfo.json', JSON.stringify(packageData, null, '\t'), err => {
  console.log(err)
})

