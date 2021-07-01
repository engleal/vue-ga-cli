const chalk = require('chalk')
const Diff3 = require('node-diff3')
const Diff = require('diff')
const fs = require('fs')
const { getCurrenPath, concatPath } = require('../utils/path')
const {
  isFile,
  changeMod,
  readFileContent,
  writeFileContent,
  rimrifDirectory,
  crateFile
} = require('../utils/fs')
const localProjectPath = getCurrenPath()
/**
 * 思路：
 *    1、获取本地项目的文件和模板项目的文件
 *    2、读取本地项目的所有文件（过滤某部分，如node_modules）
 *    3、执行node-diff3的merge方法，返回合并后的文件结果
 *    4、如果是svg文件如何处理
 *    5、如果是ico文件如何处理
 *    6、如果是图片文件如何处理
 *    7、如果是.md文件如何处理
 *    8、node-diff3需要3个参数
 * **/
// 文件进行merge覆盖
module.exports = function mergeFile(dirName) {
  console.log(
    chalk.white(
      '\n Start Automatic Merge of File , Please Wait A Moment  ... \n'
    )
  )
  const { localObj, templateObj } = createLocalAndTemplateObj(dirName)
  const templatePath = concatPath(localProjectPath, dirName)
  console.log("templatePath", templatePath)
  diffFile(localObj, templateObj)
  setTimeout(() => {
    rimrifDirectory(templatePath)
  }, 1000)
}

// 对比文件差异
function diffFile(localObj, templateObj) {
  const templateList = Object.keys(templateObj) || []
  templateList.forEach((filePath, index) => {
    // 如果不存在该文件  那么直接在本地对应处生成改文件
    if (!localObj[filePath]) {
      crateFile(filePath, templateObj[filePath])
    } else {
      const localFilePath = localObj[filePath]
      const localFileContent = readFileContent(localFilePath)
      const templateFilePath = templateObj[filePath]
      const templateFileContent = readFileContent(templateFilePath)
      // 祖先分支
      const ancestorsBranch = ''
      // 目标分支 也就是本地项目的内容
      const targeBranch = localFileContent
      // merge分支 也就是网上的模板项目的内容
      const mergeBranch = templateFileContent
      getDiffContent(targeBranch,mergeBranch,localFilePath)
    }
  })
}

// mergeBranch覆盖targetBranch
function getDiffContent(targeBranch,mergeBranch,localFilePath) {
  const contentList = Diff.diffChars(targeBranch, mergeBranch) || []
  let newFileContent = ''
  contentList.forEach((item) => {
    newFileContent += item.value
  })
  changeMod(localFilePath, 700)
  writeFileContent(localFilePath, newFileContent)
}

// 生成模板项目和本地项目的fileObj对象
function createLocalAndTemplateObj(dirName) {
  // 本地项目的目录结构list
  const localProjectDirectoryStructureList = fs.readdirSync(localProjectPath)
  // 本地项目的文件对象
  const localProjectFileObj = {}
  createMapFileObj(
    localProjectDirectoryStructureList,
    dirName,
    localProjectPath,
    localProjectPath,
    localProjectFileObj
  )
  // 模板项目path
  const templateProjectPath = dirName
  // 模板项目的目录结构list
  const templateProjectDirectoryStructureList =
    fs.readdirSync(templateProjectPath)
  // 模板项目的文件对象
  const templateProjectFileObj = {}
  createMapFileObj(
    templateProjectDirectoryStructureList,
    dirName,
    localProjectPath,
    concatPath(localProjectPath, templateProjectPath),
    templateProjectFileObj
  )
  return { localObj: localProjectFileObj, templateObj: templateProjectFileObj }
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
