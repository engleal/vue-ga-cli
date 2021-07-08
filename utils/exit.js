const process = require('process')
const chalk = require('chalk')
exports.exit = function (code, msg) {
  process.on('exit', () => {
    console.log(chalk.red(`即将退出\r\n`))
    console.log(chalk.red(`退出原因：${msg}`))
  })
}
