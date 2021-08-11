const process = require('process')
const { getCurrenPath } = require("./path")
const nodeProcessPath = {}
// 切换node的执行目录
exports.changeDir = function (directory) {
  nodeProcessPath[directory] = getCurrenPath()
  process.chdir(directory)
}

// 切换路径后的还原
exports.resetDir = function (directory) {
  let oldPath =nodeProcessPath[directory] ||  getCurrenPath()
  process.chdir(oldPath)
}


