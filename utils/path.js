const path = require('path')
// 获取项目路径
exports.getProjectPath = function (projectName) {
  let projectPath = path.resolve(projectName || '.')
  return projectPath
}
