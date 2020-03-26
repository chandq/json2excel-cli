## json2excel - 多语言资源文件转换成 excel 表

### 支持中英文语言 json 文件和中英文对照表 excel 文件互相转换，提高国际化开发效率

> 主要功能：

- 结合中文、英文资源文件生成中英文对照 excel 表（json、js => xls、xlsx）
- 根据中文对照表转换成中文和英文资源文件（xls、xlsx => json）
- 以原中文资源文件为依据，结合原英文资源文件和专业翻译人员提供的中英文对照表进行增量合并，生成新的中英文 json 文件（xls、xlsx，json、js => json）

> 应用场景

- 项目工程中需要支持国际化，将工程里中英文资源 json 文件转换成中英文对照表，提供给专业人员翻译（适合使用方式 1 的需求）
- 以工程里持续变化的中文语言文件为依据，结合专业人员翻译并提供的中英文对照表和原英文语言文件，进行增量合并，生成新的中英文 json 文件（适合使用方式 3 的需求）

> 项目依赖

- nodejs

> 安装方式

- 全局安装
  npm install -g json-excel-cli
- 升级最新版
  npm install -g json-excel-cli@latest

> 使用方式（源文件支持相对路径和绝对路径两种输入方式）

```
1. convert language json file to excel file, Example call:
  json2excel ../zh-cn.json ../en.json helloworld.xlsx
2. convert excel file to language json file, Example call:
  json2excel -r ../helloworld.xlsx
3. incremental merge, generate new language file according to excel file and
   source language file, Example call:
  json2excel -m <../helloworld.xlsx> <../source-zh-cn.json> <../source-en.json> [helloworld]
```

## 其他文档

[发布 node 模块](./docs/publish-node-readme.md)
