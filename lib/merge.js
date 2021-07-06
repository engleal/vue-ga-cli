const chalk = require('chalk')
const Diff3 = require('node-diff3')
const process = require('process')
const jsonFormat = require('json-format')
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
  readMediaSource,
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
  oldTag,
  lastTag
) {
  console.log(
    chalk.white(
      '\n Start Automatic Merge of File , Please Wait A Moment  ... \n'
    )
  )
  let oldUrl = getCurrenPath()
  let ancestorUrl = concatPath(oldUrl, ancestorsDirName)
  copyFileAndDirectory(mergeDirName, ancestorsDirName, (res) => {
    runCommandCommit(oldUrl, ancestorUrl, (err) => {
      console.log(chalk.red(err))
      runCommandCheck(oldUrl, ancestorUrl, oldTag, (err) => {
        console.log(chalk.red(err))
        // 祖先项目
        const ancestorsProjectPath = concatPath(
          localProjectPath,
          ancestorsDirName
        )
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
        const { localObj, templateObj } =
          createLocalAndTemplateObj(mergeDirName)
        diffFile(localObj, templateObj, ancestorsProjectFileObj, lastTag)
        const mergePath = concatPath(localProjectPath, mergeDirName)
        const ancestorsPath = concatPath(localProjectPath, ancestorsDirName)
        setTimeout(() => {
          rimrifDirectory(mergePath)
          rimrifDirectory(ancestorsPath)
        }, 1000)
      })
    })
  })
}

// 对比文件差异
function diffFile(localObj, templateObj, ancestorsObj, tags) {
  const templateList = Object.keys(templateObj) || []
  console.log(
    chalk.green(
      '\n Start comparing file differences , Please Wait A Moment ... \n'
    )
  )
  const spinner = ora('Comparing file ...\r\n')
  spinner.start()
  templateList.forEach((filePath, index) => {
    // 如果不存在该文件  那么直接在本地对应处生成该文件 图片资源呢？
    if (!localObj[filePath]) {
      crateFile(filePath, templateObj[filePath])
    } else {
      // console.log('filePath', filePath)
      const localFilePath = localObj[filePath]
      const ancestorsFilePath = ancestorsObj[filePath]
      const templateFilePath = templateObj[filePath]
      // 区分媒体资源（图片、音乐、视频）和其他资源
      if (isMediaSource(filePath)) {
        // 先获取对应的文件的二进制流的信息  然后拿二进制流进行对比 是否发生变化 变化执行下面的步骤
        // 如果本地和祖先部分不同，那么先执行mege 然后执行merge和本地对比
        const localFileContent = readMediaSource(localFilePath)
        const templateFileContent = readMediaSource(templateFilePath)
        const ancestorsFileContent = readMediaSource(ancestorsFilePath)
        if (isImg(filePath)) {
          console.log(
            chalk.green(`文件：${filePath}，正在进行comparing，请稍候`)
          )
          let result = localFileContent.compare(templateFileContent)
          let result2 = localFileContent.compare(ancestorsFileContent)
          //  本地和merge不相同
          if (result !== 0) {
            // 本地和祖先相同 merge覆盖
            if (result2 === 0) {
              writeFileContent(localFilePath, templateFileContent)
            } else {
              // 三者都不同 merge覆盖
              writeFileContent(localFilePath, templateFileContent)
            }
          }
          // 本地和merge相同
          else {
            //  无反应
          }
        }
      } else {
        const localFileContent = readFileContent(localFilePath)
        const templateFileContent = readFileContent(templateFilePath)
        const ancestorsFileContent = readFileContent(ancestorsFilePath)
        let ancestorsList = splitlines(ancestorsFileContent) || []
        let targetList = splitlines(localFileContent) || []
        let mergeList = splitlines(templateFileContent) || []
        let newAncestorsContent = ancestorsList
          .map((rowContent) => {
            // console.log("rowContent", rowContent)
            return `${rowContent}GanyiAnRowEnd`
          })
          .join('')
        let newTargetContent = targetList
          .map((rowContent) => {
            // console.log("rowContent", rowContent)
            return `${rowContent}GanyiAnRowEnd`
          })
          .join('')
        let newMergeContent = mergeList
          .map((rowContent) => {
            // console.log("rowContent", rowContent)
            return `${rowContent}GanyiAnRowEnd`
          })
          .join('')
        // 祖先分支
        const ancestorsBranch = newAncestorsContent
        // 目标分支 也就是本地项目的内容
        const targetBranch = newTargetContent
        // merge分支 也就是网上的模板项目的内容
        const mergeBranch = newMergeContent
        getDiffContent(
          ancestorsBranch,
          targetBranch,
          mergeBranch,
          localFilePath,
          tags
        )
      }
    }
  })
  spinner.succeed()
  console.log(chalk.green('\n Comparing file completed! \n'))
}

// 对比文件内容差异
function getDiffContent(
  ancestorsBranch,
  targetBranch,
  mergeBranch,
  filePath,
  tags
) {
  const option = {
    stringSeparator: /GanyiAnRowEnd/,
  }
  const nodeDiffResult =
    Diff3.merge(targetBranch, ancestorsBranch, mergeBranch, option) || {}
  let content = ''
  nodeDiffResult.result.map((row, index) => {
    if (/((>>>){3,8}|(<<<){3,8}|(===){3,8})/.test(row)) {
      if (/((>>>){8}|(<<<){8}|(===){8})/.test(row)) {
        content += `${row}\r\n`
      } else {
        if (row.indexOf('<') !== -1) {
          content += `<<<<<<<<<\r\n`
        } else if (row.indexOf('>') !== -1) {
          content += `>>>>>>>>>\r\n`
        } else if (row.indexOf('=') !== -1) {
          content += `=========\r\n`
        }
      }
    } else {
      if (index === nodeDiffResult.result.length - 1) {
      } else if (index === nodeDiffResult.result.length - 2) {
        content += `${row}`
      } else {
        content += `${row}\r\n`
      }
    }
  })
  changeMod(filePath, 700)
  // 更新package.json的tags字段
  if (tags && filePath.indexOf('package.json') !== -1) {
    // console.log("content", content)
    if (!(content.indexOf(">>>")!==-1 && content.indexOf("===")!==-1 &&  content.indexOf("<<<")!==-1)) {
      let packageJson = JSON.parse(content)
      if (packageJson.templateInfo && packageJson.templateInfo.tags) {
        packageJson.templateInfo.tags = tags
      }
      content = jsonFormat(packageJson)
    }
  }
  console.log(chalk.green(`文件：${filePath}，正在进行comparing，请稍候`))
  writeFileContent(filePath, content)
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

// git commit
function runCommandCommit(oldUrl, ancestorUrl, cb) {
  runCommand(
    'commit',
    oldUrl,
    ancestorUrl,
    ['-am', '模板数据同步'],
    cb
  )
}

// git checkout命令
function runCommandCheck(oldUrl, ancestorUrl, tags, cb) {
  runCommand('checkout', oldUrl, ancestorUrl, [tags], cb)
}

// 运行命令
function runCommand(
  command,
  oldUrl,
  ancestorUrl,
  option = [],
  cb
) {
  process.chdir(ancestorUrl)
  let args = [command, ...option]
  // console.log('args', args)
  let childProcess = spawn('git', args, { cwd: ancestorUrl })
  childProcess.on('close', function (status) {
    console.log(`${command}结果：`, `${status}\r\n`)
    if (status == 0) {
      cb && cb()
    } else {
      cb && cb(new Error("'git checkout' failed with status " + status))
    }
    process.chdir(oldUrl)
  })
}

// 将多行字符串转为为多行
function splitlines(inString) {
  if (!inString) return inString
  return inString.replace(/\r\n/g, '\r').replace(/\n/g, '\r').split(/\r/)
}

// 是否是媒体资源
function isMediaSource(name) {
  if (isImg(name)) {
    return true
  } else if (isMusic(name)) {
    return true
  } else if (isVideo(name)) {
    return true
  } else {
    return false
  }
}

// 判断是否是图片资源
function isImg(name) {
  let isImg = false
  if (/(.png|.jpg|.jpeg|.bmp|.gif|.ico)$/.test(name)) {
    isImg = true
  }
  return isImg
}

// 是否是音乐
function isMusic(name) {
  let isMusic = false
  if (/(.mp3|.wav|.aif|.midi)$/.test(name)) {
    isMusic = true
  }
  return isMusic
}

// 是否是视频
function isVideo(name) {
  let isVideo = false
  if (/(.flv|.mp4|.swf|.ogg|.webm|mpeg4)$/.test(name)) {
    isVideo = true
  }
  return isVideo
}
