#!/usr/bin/env node
const path = require('path')
const program = require('commander')
const minimist = require('minimist')
const chalk = require('chalk')
const ora = require('ora')
const json2excel = require('../packages/lib/json2excel')
const { excel2json, json2FormatLangObj, writeToFile } = require('../packages/lib/excel2json')

const appInfo = require(path.resolve(__dirname, '../package.json'))
program
  .version(appInfo.version, '-v, --version')
  .option('-r, --reverse <path>', 'convert excel to json')
  .option('-m, --merge <path>', 'incremental merge')
  .on('--help', () => {
    console.log('')
    console.log(
      chalk.magentaBright(`Support Three mode:
      1. convert language json file to excel file, Example call:
        ${chalk.yellow('json2excel <../zh-cn.json> <../en.json> [helloworld.xlsx]')}
      2. convert excel file to language json file, Example call:
        ${chalk.yellow('json2excel -r <../helloworld.xlsx> [helloworld]')}
      3. incremental merge, generate new language file according to excel file and
        source language file, Example call:
        ${chalk.yellow('json2excel -m <../helloworld.xlsx> <../source-zh-cn.json> <../source-en.json> [helloworld]')}
      PS：<>表示必填，[]表示选填
    `)
    )
  })
  .parse(process.argv) // 拿到 package.json 你定义的版本
executeCommand()

function executeCommand() {
  const args = minimist(process.argv.slice(2)) // 前两个是编译器相关路径信息，可以忽略
  const cmd = args._
  if (args.r && [1, 0].includes(cmd.length)) {
    const spinner = getSpinner()

    const jsonArray = excel2json(process.cwd(), convertRelativePath(process.cwd(), String.raw`${args.r}`))
    writeToFile(process.cwd(), json2FormatLangObj(jsonArray[0]), cmd[0] || 'helloworld')
      .then(res => {
        spinner.succeed('处理完成\r\n') // 加载状态 => 成功状态
      })
      .catch(error => {
        console.error(error)
        spinner.fail('处理失败\r\n') // 加载状态 => 失败状态
      })
  } else if (args.m && [2, 3].includes(cmd.length)) {
    const spinner = getSpinner()

    const source_zhJSON = require(convertRelativePath(__dirname, String.raw`${cmd[0]}`))
    const source_enJSON = require(convertRelativePath(__dirname, String.raw`${cmd[1]}`))
    const jsonArray = excel2json(process.cwd(), convertRelativePath(process.cwd(), String.raw`${args.m}`))
    const excelData = json2FormatLangObj(jsonArray[0])
    const newData = { zh: source_zhJSON, en: {} }
    mergeKeyValue(newData.en, source_zhJSON, source_enJSON, excelData.en)
    writeToFile(process.cwd(), newData, cmd[2] || 'helloworld')
      .then(res => {
        spinner.succeed('处理完成\r\n') // 加载状态 => 成功状态
      })
      .catch(error => {
        console.error(error)
        spinner.fail('处理失败\r\n') // 加载状态 => 失败状态
      })
  } else if (!args.r && [2, 3].includes(cmd.length)) {
    const spinner = getSpinner()

    const zhJSON = require(convertRelativePath(__dirname, String.raw`${cmd[0]}`))
    const enJSON = require(convertRelativePath(__dirname, String.raw`${cmd[1]}`))
    json2excel(process.cwd(), zhJSON, enJSON, cmd[2] || 'helloworld.xlsx')
      .then(res => {
        spinner.succeed('处理完成\r\n') // 加载状态 => 成功状态
      })
      .catch(error => {
        console.error(error)
        spinner.fail('处理失败\r\n') // 加载状态 => 失败状态
      })
  } else {
    console.log(chalk.red('命令参数不对，请重新输入'))
  }
}

// Define function of show process progress information
function getSpinner() {
  const spinner = ora({ text: '正在处理中...\r\n' }).start() // 开始状态 => 加载状态
  return spinner
}

// Return relative path
function convertRelativePath(dirname, pathname) {
  // Console.log(__dirname, pathname, path.isAbsolute(pathname), path.relative(dirname, pathname));
  return path.relative(dirname, pathname).split(path.sep).join('/')
}

// 增量合并，以原中文json文件为依据，结合原英文json文件和专业翻译人员提供的中英文对照表生成新的中英文json文件
function mergeKeyValue(targetENObject, sourceZhObject, sourceEnObject, excelObject) {
  for (const key in sourceZhObject) {
    if (sourceZhObject[key]) {
      if (!targetENObject[key]) {
        targetENObject[key] = {}
      }

      if (typeof sourceZhObject[key] === 'object') {
        if (!sourceEnObject[key]) {
          sourceEnObject[key] = {}
        }

        if (!excelObject[key]) {
          excelObject[key] = {}
        }

        mergeKeyValue(targetENObject[key], sourceZhObject[key], sourceEnObject[key], excelObject[key])
      } else {
        targetENObject[key] = excelObject[key] || sourceEnObject[key] || ''
      }
    }
  }
}
