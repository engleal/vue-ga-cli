const clone = require('git-clone')
// 文字着色
const chalk = require('chalk')
// loading
const ora = require('ora')
/**
 *
 * @param {*} repo git地址
 * @param {*} dest 输出的目录名字
 * @param {*} cloneOptions clone的配置
 * @param {*} cb 回调函数
 */
function downloadGit(repo = '', dest, cloneOptions = {}, cb) {
  if (repo) {
    console.log(chalk.green('\n Start Downloading Template From Remote , Please Wait A Moment   ... \n'))
    const spinner = ora('Downloading...')
    spinner.start()
    clone(repo, dest, cloneOptions, (err) => {
      if (err) {
        spinner.fail()
        console.log(chalk.red(`Template Downloading failed. ${err}`))
        return
      } else {
        // 结束加载图标
        spinner.succeed()
        console.log(chalk.green('\n Template Downloading completed! \n'))
        cb && cb()
      }
    })
  }
}

module.exports = downloadGit
