// 文字着色
const chalk = require('chalk')
const { installDependencies, printMessage } = require('../utils/dependency')

module.exports = function autoInstall(answer, projectPath, projectName) {
  process.chdir(projectPath)
  installDependencies(projectPath, answer.autoInstall)
    .then(() => {
      console.log(chalk.green(`\n ${chalk.green('✔')} 项目依赖下载完成 \n`))
      printMessage(projectName)
    })
    .catch((e) => {
      console.log(chalk.red('Error:'), e)
    })
}
