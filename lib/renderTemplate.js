const async = require('async')
const {
  handlebars: { render },
} = require('consolidate')
// 修改模板中的指定内容 然后重新渲染
module.exports = function renderTemplateFiles(answer) {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    async.each(
      keys,
      (file, next) => {
        const str = files[file].contents.toString()
        // 提取{{}}之间的内容
        const match = str.match(/{{{([^{}]+)}}}/g)
        if (match && match.length) {
          render(str, answer, (err, res) => {
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