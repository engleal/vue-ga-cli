const path = require('path')
// 获取项目路径
exports.getProjectPath = function (projectName) {
  let projectPath = path.resolve(projectName || '.')
  return projectPath
}

// 获取当前执行命令时候的路径
exports.getCurrenPath = function () {
  let cPath = path.resolve('.')
  return cPath
}

// 合成一个path路径
exports.concatPath = function (...paths) {
  const fPath = path.join(...paths)
  return fPath
}

// 获取路径最后的文件名字
exports.getFileName = function (filePath) {
  return path.basename(filePath)
}

// 获取路径对应的目录名字
exports.getDirectPath = function (filePath) {
  return path.dirname(filePath)
}

// 获取对应平台的路径分隔符
exports.getStep = function () {
  return path.sep
}
