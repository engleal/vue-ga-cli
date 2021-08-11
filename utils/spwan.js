
const spawn = require('child_process').spawn

// 在子进程使用shell启动自定义命令
exports.runCommand =  function(installMethod, args, options) {
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