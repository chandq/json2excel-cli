#!/usr/bin/env node
const program = require("commander");
const inquirer = require("inquirer");
const minimist = require("minimist");
const chalk = require("chalk");
const path = require("path");
const ora = require("ora");
const json2excel = require("../packages/lib/json2excel");
const { excel2json, json2FormatLangObj, writeToFile } = require("../packages/lib/excel2json");
var appInfo = require(path.resolve(__dirname, "../package.json"));
var inquireTipConfig = require("../packages/lib/inquire-tip-config.js");
let configTemp = {};
program
  .version(appInfo.version, "-v, --version")
  .option("-r, --reverse <path>", "convert excel to json")
  .on("--help", () => {
    console.log("");
    console.log(
      chalk.magentaBright(`Support two mode:
      1. convert language json file to excel file, Example call:
        ${chalk.yellow("json2excel <../zh-cn.json> <../en.json> [helloworld.xlsx]")}
      2. convert excel file to language json file, Example call:
        ${chalk.yellow("json2excel -r <../helloworld.xlsx> [helloworld]")}
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
    writeToFile(process.cwd(), json2FormatLangObj(jsonArr[0]), cmd[0] || "helloworld");
    spinner.succeed("处理完成\r\n"); // 加载状态 => 成功状态
  } else if (!args.r && [2, 3].includes(cmd.length)) {
    const spinner = getSpinner();

    let zhJSON = require(convertRelativePath(__dirname, String.raw`${cmd[0]}`));
    let enJSON = require(convertRelativePath(__dirname, String.raw`${cmd[1]}`));
    json2excel(process.cwd(), zhJSON, enJSON, cmd[2] || "helloworld.xlsx");
    spinner.succeed("处理完成"); // 加载状态 => 成功状态
  } else {
    console.log(chalk.red("命令参数不对，请重新输入"));
  }
}

// define function of show process progress information
function getSpinner() {
  let spinner = ora({
    text: "正在处理中...\r\n"
  }).start(); // 开始状态 => 加载状态
  setTimeout(() => {
    spinner.color = "yellow";
    spinner.text = "网速有点慢\r\n";
  }, 5000); // 还是 加载状态, 更新文案和颜色
  return spinner;
}
// return relative path
function convertRelativePath(dirname, pathname) {
  // console.log(__dirname, pathname, path.isAbsolute(pathname), path.relative(dirname, pathname));
  return path
    .relative(dirname, pathname)
    .split(path.sep)
    .join("/");
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
function excel2jsonInit() {
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
