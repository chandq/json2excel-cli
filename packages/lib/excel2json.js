/*
 * @created: Sunday, 2020-02-16 09:36:50
 * @author: chendq
 * ---------
 * @desc 将多语言（目前支持中英文）Excel文件(支持xls或xlsx)对照表转换为不同语言对应的资源文件(JSON格式)
 * @params Excel表格式，表头
 *  key | 简体中文 | 英文
 *  common.title	线索	Leads
 *  common.appCenter	应用列表	App List
 */

// 读取多语言对照表的excel文件，并转换为JSON对象
const excel2json = function (dirname, fileName = 'hello.xlsx') {
  let jsonArray = []
  const xlsx = require('xlsx')
  // Const { utils } = xlsx
  const path = require('path')
  // 获取数据
  const workbook = xlsx.readFile(path.resolve(dirname, fileName))
  const sheet_name_list = workbook.SheetNames
  // Console.time("sheet_to_json");
  // console.log(
  //   xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
  //     defval: ""
  //   })
  // );
  // console.timeEnd("sheet_to_json");

  // console.time("customlize generate JSON");
  sheet_name_list.forEach(y => {
    const worksheet = workbook.Sheets[y]
    let headers = {}
    let data = []
    for (const z in worksheet) {
      if (z[0] === '!') {
        continue
      }

      // Parse out the column, row, and value
      let tt = 0
      for (let i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i
          break
        }
      }

      const col = z.substring(0, tt)
      const row = parseInt(z.substring(tt), 10)
      const value = worksheet[z].v

      // Store header names
      if (row === 1 && value) {
        headers[col] = value
        continue
      }

      if (!data[row]) {
        data[row] = {}
      }

      data[row][headers[col]] = value
    }

    // Drop those first two rows which are empty
    data.shift()
    data.shift()
    jsonArray.push(data)
  })
  // Console.timeEnd("customlize generate JSON");
  return jsonArray
}

// 将JSON对象格式化为不同语言的JSON对象
const json2FormatLangObject = function (array) {
  let zh = {}
  let en = {}
  const assignValue = function (originObject, zh_target_object, en_target_object, keysArray) {
    !zh_target_object && (zh_target_object = {})
    !en_target_object && (en_target_object = {})
    if (keysArray.length > 1) {
      !zh_target_object[keysArray[0]] && (zh_target_object[keysArray[0]] = {})
      !en_target_object[keysArray[0]] && (en_target_object[keysArray[0]] = {})
      const key = keysArray[0]
      keysArray.shift()
      assignValue(originObject, zh_target_object[key], en_target_object[key], keysArray)
    } else {
      zh_target_object[keysArray[0]] = originObject['简体中文']
      en_target_object[keysArray[0]] = originObject['英文']
    }
  }

  array.forEach((v, i) => {
    !v.key && (v.key = 'xiaoyaozi-' + i)
    if (v.key.includes('.')) {
      assignValue(v, zh, en, v.key.split('.'))
    } else {
      zh[v.key] = v['简体中文']
      en[v.key] = v['英文']
    }
  })
  return { zh, en }
}

// 将多语言JSON对象写入文件
const writeToFile = function (dirname, data, fileName = 'helloworld') {
  const path = require('path')
  const { writeFile } = require('fs').promises
  // Zh语言对象写入文件
  const zhPromise = function () {
    return writeFile(path.resolve(dirname, `${fileName}_zh.json`), JSON.stringify(data.zh, null, 2))
  }

  // En语言对象写入文件
  const enPromise = function () {
    return writeFile(path.resolve(dirname, `${fileName}_en.json`), JSON.stringify(data.en, null, 2))
  }

  return Promise.all([zhPromise(), enPromise()])
}

module.exports = {
  excel2json,
  json2FormatLangObj: json2FormatLangObject,
  writeToFile
}
