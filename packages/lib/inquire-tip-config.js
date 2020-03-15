var chalk = require("chalk");
var inquirer = require("inquirer");
var terminal = "";
var type = [
  {
    name: "operateType",
    type: "list",
    message: "选择执行方式： ",
    choices: [
      { name: "根据多语言json文件生成中英文对照的excel表", value: 1 },
      { name: "根据中英文对照excel表转换为多语言文件", value: 2 }
    ]
  }
];
var json2excelInit = [
  {
    name: "inputCommands",
    type: "input",
    message: "请输入命令" + chalk.gray("(例: ../zh-cn.json ../zh-cn.json helloworld.xlsx)： "),
    validate(value) {
      if (value.length) {
        console.log("inputCommands: ", value);
        return true;
      } else {
        return "请输入带路径的多语言文件名：";
      }
    }
  }
];
var excel2jsonInit = [
  {
    name: "inputCommands",
    type: "input",
    message: "请输入命令" + chalk.gray("(例: helloworld.xlsx)： "),
    validate(value) {
      if (value.length) {
        console.log("inputCommands: ", value);
        return true;
      } else {
        return "请输入中英文对照表的文件名：";
      }
    }
  }
];
module.exports = {
  type,
  json2excelInit,
  excel2jsonInit
};
