const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const spawn = require('child_process').spawn



/**
 * Runs `npm install` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.installDependencies = function installDependencies(
  targerPath,
  installMethod = 'npm',
) {
  console.log(`\n\n# ${chalk.green('开始安装项目依赖 ...')}`)
  console.log('# ========================\n')
  return runCommand(installMethod, ['install'], {
    targerPath,
  })
}


// 打印信息
exports.printMessage = function printMessage(projectName) {
  const message = `
To get started:

  ${chalk.yellow(
    `cd ${projectName}\n`
  )}
  ${chalk.yellow(
    `npm run dev\n`
  )}
`
  console.log(message)
}

// 在子进程使用shell启动自定义命令
function runCommand(installMethod, args, options) {
  return new Promise((resolve, reject) => {
    const spwan = spawn(
      installMethod,
      args,
      Object.assign(
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )

    spwan.on('exit', () => {
      resolve()
    })
  })
}

function sortObject(object) {
  // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
  const sortedObject = {}
  Object.keys(object)
    .sort()
    .forEach(item => {
      sortedObject[item] = object[item]
    })
  return sortedObject
}
