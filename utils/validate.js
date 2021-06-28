// 检查项目名字
const validateProjectName = require('validate-npm-package-name')
const { exit } = require('./exit')
module.exports = {
  template: {
    isEmpty: function (templateName) {
      if (!templateName) {
        exit(1, '模板不存在')
        return
      }
    },
  },
  project: {
    isEmpty: function (projectName) {
      if (!projectName) {
        exit(1, '项目名字不能为空')
        return
      }
    },
    isLegal: function (projectName) {
      // 工程名是否合法
      const result = validateProjectName(projectName)
      if (!result.validForNewPackages) {
        exit(1, '无效的项目名字')
        return
      }
    },
  },
}
