const inquirer = require('inquirer')
const async = require('async')
const getGitUser = require('../utils/gitUser')
const promptMapping = {
  string: 'input',
  boolean: 'confirm',
}
// 问题列表
const questionObj = {
  name: {
    when: 'isNotTest',
    type: 'string',
    required: true,
    message: '请输入项目名称',
  },
  description: {
    when: 'isNotTest',
    type: 'string',
    required: false,
    message: '请输入项目描述',
    default: 'A Vue.js project',
  },
  author: {
    when: 'isNotTest',
    type: 'string',
    message: '请输入作者名字',
  },
  menuId: {
    when: 'isNotTest',
    type: 'number',
    message: '请输入menuId',
    default: 1
  },
  templateName: {
    when: 'isNotTest',
    type: 'string',
    message: '设置模板标识(用于nigix代理，如opms、rjcos等)',
    default: 'template'
  },
  // build: {
  //   when: 'isNotTest',
  //   type: 'list',
  //   message: '打包配置',
  //   choices: [
  //     {
  //       name: 'Runtime + Compiler: recommended for most users',
  //       value: 'standalone',
  //       short: 'standalone',
  //     },
  //     {
  //       name: 'Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere',
  //       value: 'runtime',
  //       short: 'runtime',
  //     },
  //   ],
  // },
  // router: {
  //   when: 'isNotTest',
  //   type: 'confirm',
  //   message: '是否安装vue-router?',
  // },
  // lint: {
  //   when: 'isNotTest',
  //   type: 'confirm',
  //   message: '是否启用eslint',
  // },
  // lintConfig: {
  //   when: 'isNotTest && lint',
  //   type: 'list',
  //   message: '选择eslint风格',
  //   choices: [
  //     {
  //       name: 'Standard (https://github.com/standard/standard)',
  //       value: 'standard',
  //       short: 'Standard',
  //     },
  //     {
  //       name: 'Airbnb (https://github.com/airbnb/javascript)',
  //       value: 'airbnb',
  //       short: 'Airbnb',
  //     },
  //     {
  //       name: 'none (configure it yourself)',
  //       value: 'none',
  //       short: 'none',
  //     },
  //   ],
  // },
  // unit: {
  //   when: 'isNotTest',
  //   type: 'confirm',
  //   message: '是否启用单元测试',
  // },
  // runner: {
  //   when: 'isNotTest && unit',
  //   type: 'list',
  //   message: '选择单元测试模式',
  //   choices: [
  //     {
  //       name: 'Jest',
  //       value: 'jest',
  //       short: 'jest',
  //     },
  //     {
  //       name: 'Karma and Mocha',
  //       value: 'karma',
  //       short: 'karma',
  //     },
  //     {
  //       name: 'none (configure it yourself)',
  //       value: 'noTest',
  //       short: 'noTest',
  //     },
  //   ],
  // },
  // e2e: {
  //   when: 'isNotTest',
  //   type: 'confirm',
  //   message: 'Setup e2e tests with Nightwatch?',
  // },
  autoInstall: {
    when: 'isNotTest',
    type: 'list',
    message: '是否启动自动安装依赖',
    choices: [
      {
        name: 'Yes, use NPM',
        value: 'npm',
        short: 'npm',
      },
      {
        name: 'Yes, use Yarn',
        value: 'yarn',
        short: 'yarn',
      },
      {
        name: 'No, I will handle that myself',
        value: false,
        short: 'no',
      },
    ],
  },
}

module.exports = function askQuestions(answer, projectName) {
  return (files, metalsmith, done) => {
    ask(answer, projectName, done)
  }
}

function ask(answerSheet, projectName, done) {
  questionObj.name.default = projectName
  questionObj.author.default = (getGitUser() && getGitUser().name) || ''
  async.eachSeries(
    Object.keys(questionObj),
    (key, next) => {
      prompt(answerSheet, key, questionObj[key], next)
    },
    done
  )
}

function prompt(answerSheet, key, prompt, done) {
  let promptDefault = prompt.default
  inquirer
    .prompt([
      {
        type: promptMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true),
      },
    ])
    .then((answers) => {
      answerSheet[key] = answers[key]
      done()
    })
    .catch(done)
}
