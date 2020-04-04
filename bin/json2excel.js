#!/usr/bin/env node
const program = require("commander");
// const inquirer = require("inquirer");
const minimist = require("minimist");
const chalk = require("chalk");
const path = require("path");
const ora = require("ora");
const json2excel = require("../packages/lib/json2excel");
const { excel2json, json2FormatLangObj, writeToFile } = require("../packages/lib/excel2json");
var appInfo = require(path.resolve(__dirname, "../package.json"));
// var inquireTipConfig = require("../packages/lib/inquire-tip-config.js");
// let configTemp = {};
program
  .version(appInfo.version, "-v, --version")
  .option("-r, --reverse <path>", "convert excel to json")
  .option("-m, --merge <path>", "incremental merge")
  .on("--help", () => {
    console.log("");
    console.log(
      chalk.magentaBright(`Support two mode:
      1. convert language json file to excel file, Example call:
        ${chalk.yellow("json2excel <../zh-cn.json> <../en.json> [helloworld.xlsx]")}
      2. convert excel file to language json file, Example call:
        ${chalk.yellow("json2excel -r <../helloworld.xlsx> [helloworld]")}
      3. incremental merge, generate new language file according to excel file and
        source language file, Example call:
        ${chalk.yellow("json2excel -m <../helloworld.xlsx> <../source-zh-cn.json> <../source-en.json> [helloworld]")}
      PS：<>表示必填，[]表示选填
    `)
    );
  })
  .parse(process.argv); // 拿到 package.json 你定义的版本
executeCommand();

function executeCommand() {
  const args = minimist(process.argv.slice(2)); //前两个是编译器相关路径信息，可以忽略
  let cmd = args._;
  if (args.r && [1, 0].includes(cmd.length)) {
    const spinner = getSpinner();

    const jsonArr = excel2json(process.cwd(), convertRelativePath(process.cwd(), String.raw`${args.r}`));
    writeToFile(process.cwd(), json2FormatLangObj(jsonArr[0]), cmd[0] || "helloworld")
      .then((res) => {
        spinner.succeed("处理完成\r\n"); // 加载状态 => 成功状态
      })
      .catch((error) => {
        console.error(error);
        spinner.fail("处理失败\r\n"); // 加载状态 => 失败状态
      });
  } else if (args.m && [2, 3].includes(cmd.length)) {
    const spinner = getSpinner();

    const source_zhJSON = require(convertRelativePath(__dirname, String.raw`${cmd[0]}`));
    const source_enJSON = require(convertRelativePath(__dirname, String.raw`${cmd[1]}`));
    const jsonArr = excel2json(process.cwd(), convertRelativePath(process.cwd(), String.raw`${args.m}`));
    const excelData = json2FormatLangObj(jsonArr[0]);
    let newData = { zh: source_zhJSON, en: {} };
    mergeKeyValue(newData.en, source_zhJSON, source_enJSON, excelData.en);
    writeToFile(process.cwd(), newData, cmd[2] || "helloworld")
      .then((res) => {
        spinner.succeed("处理完成\r\n"); // 加载状态 => 成功状态
      })
      .catch((error) => {
        console.error(error);
        spinner.fail("处理失败\r\n"); // 加载状态 => 失败状态
      });
  } else if (!args.r && [2, 3].includes(cmd.length)) {
    const spinner = getSpinner();

    const zhJSON = require(convertRelativePath(__dirname, String.raw`${cmd[0]}`));
    const enJSON = require(convertRelativePath(__dirname, String.raw`${cmd[1]}`));
    json2excel(process.cwd(), zhJSON, enJSON, cmd[2] || "helloworld.xlsx")
      .then((res) => {
        spinner.succeed("处理完成\r\n"); // 加载状态 => 成功状态
      })
      .catch((error) => {
        console.error(error);
        spinner.fail("处理失败\r\n"); // 加载状态 => 失败状态
      });
  } else {
    console.log(chalk.red("命令参数不对，请重新输入"));
  }
}

// define function of show process progress information
function getSpinner() {
  let spinner = ora({ text: "正在处理中...\r\n" }).start(); // 开始状态 => 加载状态
  return spinner;
}
// return relative path
function convertRelativePath(dirname, pathname) {
  // console.log(__dirname, pathname, path.isAbsolute(pathname), path.relative(dirname, pathname));
  return path.relative(dirname, pathname).split(path.sep).join("/");
}
// 增量合并，以原中文json文件为依据，结合原英文json文件和专业翻译人员提供的中英文对照表生成新的中英文json文件
function mergeKeyValue(targetENObj, sourceZhObj, sourceEnObj, excelObj) {
  for (let key in sourceZhObj) {
    if (sourceZhObj[key]) {
      if (!targetENObj[key]) {
        targetENObj[key] = {};
      }
      if (typeof sourceZhObj[key] === "object") {
        if (!sourceEnObj[key]) {
          sourceEnObj[key] = {};
        }
        if (!excelObj[key]) {
          excelObj[key] = {};
        }
        mergeKeyValue(targetENObj[key], sourceZhObj[key], sourceEnObj[key], excelObj[key]);
      } else {
        targetENObj[key] = excelObj[key] || sourceEnObj[key] || "";
      }
    }
  }
}
// Commands 操作
// program
//   // 命令与参数: <> 必填; [] 选填
//   .command("exec <cmd> [env] [env]")
//   // 别名
//   .alias("ex")
//   // 帮助信息
//   .description("execute the given remote cmd")
//   // 执行的操作
//   .action((cmd, env, options) => {
//     // 参数可以拿到
//     console.log(`env is ${env}`, process.argv);
//     console.log('exec "%s" using %s mode', cmd, options.exec_mode);
//   })
//   .parse(process.argv);

/**
 * @description 交互命令操作
 * @author chendq
 * @date 2020-03-15
 */
// inquirer.prompt(inquireTipConfig.type).then(function(args) {
//   assignConfig(args);
//   if (configTemp.operateType === 1) {
//     json2excelInit();
//   } else {
//     excel2jsonInit();
//   }
// });
/* function excel2jsonInit() {
  inquirer.prompt(inquireTipConfig.excel2jsonInit).then(function(args) {
    assignConfig(args, true);
  });
}
//json转换生成excel
function json2excelInit() {
  inquirer.prompt(inquireTipConfig.json2excelInit).then(function(args) {
    assignConfig(args, true);
  });
}
function assignConfig(args, last) {
  configTemp = Object.assign(configTemp, args);
  console.log("configTemp: ", configTemp);
  if (last) {
    createrFn();
  }
}
 */
