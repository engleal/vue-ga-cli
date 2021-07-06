const fs = require('fs')
const { getCurrenPath, concatPath } = require('./path')
const { getFileName, getDirectPath, getStep } = require('./path')
const { changeDir, resetDir } = require('./process')
const fs2 = require('fs-extra')
// console.log("fs2", fs2)
// 是否文件
exports.isFile = isFile
function isFile(
  fileName,
  options = {
    bigint: false,
    throwIfNoEntr: true,
  }
) {
  const result = fs.statSync(fileName, options)
  return result.isFile()
}

// 是否文件夹
exports.isDirectory = isDirectory
function isDirectory(
  dirName,
  options = {
    bigint: false,
    throwIfNoEntr: true,
  }
) {
  const result = fs.statSync(dirName, options)
  return result.isDirectory()
}

// 生成文件夹
exports.createDirectory = createDirectory
function createDirectory(directoryPath) {
  let sep = getStep()
  let folders = getDirectPath(directoryPath).split(sep)
  let p = ''
  while (folders.length) {
    p += folders.shift() + sep
    if (!existsFileOrDir(p)) {
      fs.mkdirSync(p)
    }
  }
}
// 生成文件
exports.crateFile = crateFile
function crateFile(filePath, content) {
  console.log('filePath', filePath)
  const fileName = getFileName(filePath)
  // 目标目录
  const directoryPath = getDirectPath(filePath)
  // 判断是否存在文件夹目录 如果不存在那么就要新建文件夹
  if (!existsFileOrDir(filePath)) {
    createDirectory(filePath)
  }
  // 切换node的执行进程到directoryPath
  changeDir(directoryPath)
  console.log('此时进程目录是', getCurrenPath())
  // 生成文件
  fs.writeFileSync(fileName, content)
  // 将node的执行进程恢复到原来的path
  resetDir(directoryPath)
  console.log('此时进程目录是', getCurrenPath())
}

// 读取文件内容
exports.readFileContent = readFileContent
function readFileContent(filePath) {
  return fs.readFileSync(filePath).toString()
}

// 读取媒体资源
exports.readMediaSource = readMediaSource
function readMediaSource(filePath) {
  return fs.readFileSync(filePath)
}

// 往文件中写入内容
exports.writeFileContent = writeFileContent
function writeFileContent(filePath, content) {
  return fs.writeFileSync(filePath, content)
}

// 删除目录
exports.rimrifDirectory = deleteFolderRecursive
function deleteFolderRecursive(url) {
  let files = []
  if (fs.existsSync(url)) {
    files = fs.readdirSync(url)
    files.forEach(function (file, index) {
      let curPath = concatPath(url, file)
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(url)
  } else {
    console.log('给定的路径不存在，请给出正确的路径')
  }
}

// 修改文件权限
exports.changeMod = changeMod
function changeMod(path, mode) {
  return fs.chmodSync(path, mode)
}

// 判断某个文件夹或者文件是否存在
exports.existsFileOrDir = existsFileOrDir
function existsFileOrDir(path) {
  return fs.existsSync(path)
}

// 复制文件夹和文件
exports.copyFileAndDirectory = copyFileAndDirectory
function copyFileAndDirectory(sourceDirName, targetDir,cb) {
  fs2.copy(sourceDirName, targetDir)
    .then(() => {
      cb && cb('复制成功')
    })
    .catch(err => new Error(err))
}
