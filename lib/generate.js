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
  let answer = plugins.answer ? plugins.answer : {}

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
      if (answer.autoInstall) {
        autoInstall(answer, projectPath, projectName)
      }
      done(err)
    })
}
