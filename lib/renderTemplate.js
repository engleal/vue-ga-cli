const async = require('async')
const {
  handlebars: { render },
} = require('consolidate')
const jsonFormat = require('json-format')
// 修改模板中的指定内容 然后重新渲染
module.exports = function renderTemplateFiles(
  answer,
  projectName,
  templateName,
  tags
) {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    async.each(
      keys,
      (file, next) => {
        let fileContent = files[file].contents.toString()
        // 提取{{}}之间的内容
        const match = fileContent.match(/{{{([^{}]+)}}}/g)
        if (match && match.length) {
          if (file === 'package.json') {
            let fileJSON = JSON.parse(fileContent)
            // 往package.json中塞入信息 为update功能做准备
            fileJSON.templateInfo = {
              dest: projectName,
              templateName: templateName,
              answer: {
                name: answer.name,
                description: answer.description,
                author: answer.author,
                menuId: answer.menuId,
                templateName: answer.templateName,
              },
              tags: tags,
            }
            // json字符串格式化 并删除前面的type类型
            let content = jsonFormat(fileJSON)
            fileContent = content
          }
          render(fileContent, answer, (err, res) => {
            if (err) {
              err.message = `[${file}] ${err.message}`
              return next(err)
            }
            files[file].contents = new Buffer.from(res)
            next()
          })
        } else {
          return next()
        }
      },
      done
    )
  }
}
