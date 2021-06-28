const process = require('process')
const chalk = require('chalk')
exports.exit = function (code, msg) {
  process.on('exit', () => {
    console.log(chalk.red(`即将退出，退出码:${code}`))
    console.log(chalk.red(`退出原因：${msg}`))
  })
}
