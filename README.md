## json2excel - 多语言资源文件转换成 excel 表

> 主要功能：

- 结合中文、英文资源文件生成中英文对照 excel 表（json => xls、xlsx）
- 根据中文对照表转换成中文和英文资源文件（xls、xlsx => json）

> 应用场景

- 项目工程中需要支持国际化，可通过此工具提高开发效率

> 项目依赖

- nodejs

> 使用方式（源文件支持相对路径和绝对路径两种输入方式）

```
1. convert language json file to excel file, Example call:
  json2excel ../zh-cn.json ../en.json helloworld.xlsx
2. convert excel file to language json file, Example call:
  json2excel -r ../helloworld.xlsx
```

## 其他文档

[发布 node 模块](./docs/publish-node-readme.md)
