const Metalsmith = require('metalsmith')
const chalk = require('chalk')
const askQuestions = require('./ask')
const renderTemplateFiles = require('./renderTemplate')
const autoInstall = require('./install')
const validate = require('../utils/validate')
module.exports = function generate(
  { projectName, projectPath, templateName, tags },
  plugins = {},
  done
) {
  console.log(
    chalk.green('\n Start Template Compile , Please Wait A Moment   ... \n')
  )
  const metalsmith = Metalsmith(projectPath)
  let answer = !validate.dataType.obj.emptyObj(plugins.answer) ? plugins.answer : {}
  if (validate.dataType.obj.emptyObj(answer)) {
    metalsmith.use(askQuestions(answer, projectName))
  }
  metalsmith.use(renderTemplateFiles(answer, projectName, templateName, tags))
  metalsmith
    .clean(false)
    .source('.')
    .destination(projectPath)
    .build((err, files) => {
      console.log(chalk.green(`\n Template Compile Finish \n`))
      // 如果外部传入的这个是空对象那就执行自动化依赖的步骤  代表是init操作 否则是update操作
      if (validate.dataType.obj.emptyObj(plugins.answer)) {
        autoInstall(answer, projectPath, projectName)
      }
      // 设置git忽略文件的权限变化
      done(err)
    })
}
