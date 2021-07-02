const chalk = require('chalk')
const Diff3 = require('node-diff3')
const process = require('process')
var spawn = require('child_process').spawn
const ora = require('ora')
const fs = require('fs')
const { getCurrenPath, concatPath } = require('../utils/path')
const {
  isFile,
  changeMod,
  readFileContent,
  writeFileContent,
  rimrifDirectory,
  crateFile,
  copyFileAndDirectory,
} = require('../utils/fs')
const localProjectPath = getCurrenPath()
/**
 * 思路：
 *    1、复制当前项目为当前项目名字+ancestors
 *    2、切换进行到 新项目中执行git checkout tag名字
 *    3、切换完成之后 获取最新的代码
 *    4、读取本地项目、ancestors和temp项目
 *    5、进行利用node_diff3.merge进行对比
 * **/
// 文件进行merge覆盖
module.exports = function mergeFile(
  mergeDirName,
  targetDirName,
  ancestorsDirName,
  tags
) {
  console.log(
    chalk.white(
      '\n Start Automatic Merge of File , Please Wait A Moment  ... \n'
    )
  )
  copyFileAndDirectory(mergeDirName, ancestorsDirName, (res) => {
    gitCheckout(ancestorsDirName, tags, () => {
      // 祖先项目
      const ancestorsProjectPath = concatPath(
        localProjectPath,
        ancestorsDirName
      )
      // console.log('ancestorsProjectPath', ancestorsProjectPath)
      // 祖先项目的目录结构list
      const ancestorsProjectDirectoryStructureList =
        fs.readdirSync(ancestorsProjectPath)
      // 祖先项目的文件对象
      const ancestorsProjectFileObj = {}
      createMapFileObj(
        ancestorsProjectDirectoryStructureList,
        ancestorsDirName,
        localProjectPath,
        concatPath(localProjectPath, ancestorsDirName),
        ancestorsProjectFileObj
      )
      const { localObj, templateObj } = createLocalAndTemplateObj(mergeDirName)
      diffFile(localObj, templateObj, ancestorsProjectFileObj)
      const mergePath = concatPath(localProjectPath, mergeDirName)
      const ancestorsPath = concatPath(localProjectPath, ancestorsDirName)
      setTimeout(() => {
        rimrifDirectory(mergePath)
        rimrifDirectory(ancestorsPath)
      }, 1000)
    })
  })
}

// 对比文件差异
function diffFile(localObj, templateObj, ancestorsObj) {
  const templateList = Object.keys(templateObj) || []
  console.log(chalk.green('\n Comparing content differences , Please Wait A Moment ... \n'))
  const spinner = ora('Comparing...')
  spinner.start()
  templateList.forEach((filePath, index) => {
    // 如果不存在该文件  那么直接在本地对应处生成改文件
    if (!localObj[filePath]) {
      crateFile(filePath, templateObj[filePath])
    } else {
      // console.log('filePath', filePath)
      const localFilePath = localObj[filePath]
      const localFileContent = readFileContent(localFilePath)
      const templateFilePath = templateObj[filePath]
      const templateFileContent = readFileContent(templateFilePath)
      const ancestorsFilePath = ancestorsObj[filePath]
      const ancestorsFileContent = readFileContent(ancestorsFilePath)
      // 祖先分支
      const ancestorsBranch = ancestorsFileContent
      // 目标分支 也就是本地项目的内容
      const targeBranch = localFileContent
      // merge分支 也就是网上的模板项目的内容
      const mergeBranch = templateFileContent
      getDiffContent(ancestorsBranch, targeBranch, mergeBranch, localFilePath)
    }
  })
  spinner.succeed()
  console.log(chalk.green('\n Comparing content differences completed! \n'))
}

// mergeBranch覆盖targetBranch
function getDiffContent(
  ancestorsBranch,
  targeBranch,
  mergeBranch,
  localFilePath
) {
  const nodeDiffResult =
    Diff3.merge(ancestorsBranch, targeBranch, mergeBranch, {
      stringSeparator: /((\r\n)|\n|\r)+/,
    }) || []
  let content = ''
  nodeDiffResult.result.map((row, index) => {
    if (row !== '\r' && row !== '\n' && row !== '\r\n') {
      if (/((>>>){3,}|(<<<){3,}|(===){3,})/.test(row)) {
        if (row.indexOf('<') !== -1) {
          content += `<<<<<<<<<\r\n`
        } else if (row.indexOf('>') !== -1) {
          content += `>>>>>>>>>\r\n`
        } else if (row.indexOf('=') !== -1) {
          content += `=========\r\n`
        }
      } else if (/undefined/.test(row)) {
        content += ''
      } else {
        content += `${row}\r\n`
      }
    }
  })
  changeMod(localFilePath, 700)
  writeFileContent(localFilePath, content)
}

// 生成模板项目和本地项目的fileObj对象
function createLocalAndTemplateObj(mergeDirName) {
  // 本地项目的目录结构list
  const localProjectDirectoryStructureList = fs.readdirSync(localProjectPath)
  // 本地项目的文件对象
  const localProjectFileObj = {}
  createMapFileObj(
    localProjectDirectoryStructureList,
    mergeDirName,
    localProjectPath,
    localProjectPath,
    localProjectFileObj
  )
  // 模板项目path
  const templateProjectPath = concatPath(localProjectPath, mergeDirName)
  // 模板项目的目录结构list
  const templateProjectDirectoryStructureList =
    fs.readdirSync(templateProjectPath)
  // 模板项目的文件对象
  const templateProjectFileObj = {}
  createMapFileObj(
    templateProjectDirectoryStructureList,
    mergeDirName,
    localProjectPath,
    templateProjectPath,
    templateProjectFileObj
  )
  return {
    localObj: localProjectFileObj,
    templateObj: templateProjectFileObj,
  }
}

// 生成可遍历的文件名列表
function createMapFileObj(
  fileNameList = [],
  projectName,
  keyParentDirPath,
  parentDirPath,
  fileNameObj = {}
) {
  fileNameList.map((fileName) => {
    if (
      fileName === 'node_modules' ||
      fileName === projectName ||
      fileName === '.git'
    ) {
    } else {
      const keyPath = concatPath(keyParentDirPath, fileName)
      const valuePath = concatPath(parentDirPath, fileName)
      // console.log('key', fileName, 'value:', valuePath)
      if (isFile(valuePath)) {
        fileNameObj[keyPath] = valuePath
      } else {
        const fileNameList = fs.readdirSync(valuePath)
        // 获取父级key目录
        const keyParentDirectoryPath = concatPath(keyParentDirPath, fileName)
        // 获取父级目录
        const parentDirectoryPath = concatPath(parentDirPath, fileName)
        createMapFileObj(
          fileNameList,
          projectName,
          keyParentDirectoryPath,
          parentDirectoryPath,
          fileNameObj
        )
      }
    }
  })
}

// git checkout命令
function gitCheckout(ancestorsDirName, tags, cb) {
  let oldUrl = getCurrenPath()
  let ancestorUrl = concatPath(oldUrl, ancestorsDirName)
  process.chdir(ancestorUrl)
  let args = ['checkout', tags]
  // console.log('args', args)
  let childProcess = spawn('git', args, { cwd: ancestorUrl })
  childProcess.on('close', function (status) {
    // console.log('切换tag', status)
    if (status == 0) {
      cb && cb()
    } else {
      cb && cb(new Error("'git checkout' failed with status " + status))
    }
    process.chdir(oldUrl)
  })
}
