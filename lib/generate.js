const Metalsmith = require('metalsmith')
const chalk = require('chalk')

const askQuestions = require('./ask')
const renderTemplateFiles = require('./renderTemplate')
const autoInstall = require('./install')
module.exports = function generate(projectName, projectPath, done) {
  const metalsmith = Metalsmith(projectPath)
  const answer = {}
  metalsmith
    .use(askQuestions(answer, projectName))
    .use(renderTemplateFiles(answer))
  metalsmith
    .clean(false)
    .source('.')
    .destination(projectPath)
    .build((err, files) => {
      console.log(chalk.green(`\n 模板编译完成 \n`))
      if (answer.autoInstall) {
        autoInstall(answer, projectPath,projectName)
      }
      done(err)
    })
}


