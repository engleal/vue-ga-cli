// 检查项目名字
const { exit } = require('./exit')
module.exports = {
  // 模板相关
  template: {
    isEmpty: function (templateName) {
      if (!templateName) {
        exit(1, '模板不存在')
        return
      }
    },
  },
  // 项目相关
  project: {
    isEmpty: function (projectName) {
      if (!projectName) {
        exit(1, '项目名字不能为空')
        return
      }
    },
    isLegal: function (projectName) {
      let reg = /^[a-z0-9\.-]*$/g
      // 工程名是否合法
      if (!reg.test(projectName)) {
        exit(1, '项目名无效，只能由数字、字母和中划线组成')
        return
      }
    },
  },
  // 数据类型
  dataType: {
    dataType: function () {
      let toString = Object.prototype.toString
      let map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object',
      }
      if (obj instanceof Element) {
        return 'element'
      }
      return map[toString.call(obj)]
    },
    obj: {
      emptyObj: function (obj = {}) {
        return Object.keys(obj).length !== 0 ? false : true
      },
      length:function(obj) {
        return Object.keys(obj).length
      }
    },
  },
}
