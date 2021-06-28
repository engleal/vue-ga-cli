const clone = require('git-clone')
// 文字着色
const chalk = require('chalk')
// loading
const ora = require('ora')
const generate = require('./generate')
/**
 *
 * @param {*} repo git地址
 * @param {*} dest 输出的目录名字
 * @param {*} cloneOptions clone的配置
 * @param {*} projectPath 项目完整路径
 * @param {*} cb 回调函数
 */
function downloadGit(repo = '', dest, cloneOptions = {}, projectPath, cb) {
  if (repo) {
    console.log(chalk.white('\n Start Downloading... \n'))
    const spinner = ora('Downloading...')
    spinner.start()
    clone(repo, dest, cloneOptions, (err) => {
      if (err) {
        spinner.fail()
        console.log(chalk.red(`Downloading failed. ${err}`))
        return
      } else {
        // 结束加载图标
        spinner.succeed()
        console.log(chalk.green('\n Downloading completed! \n'))
        generate(dest, projectPath, (err) => {})
        cb && cb()
      }
    })
  }
}

module.exports = downloadGit
