/*
 * @created: Saturday, 2020-02-15 10:45:06
 * @author: chendq
 * ---------
 * @description 根据多语言文件输出多语言对照的Excel表(支持xls或xlsx)，当前支持中英文
 * @depedence Node环境，安装xlsx模块
 */

const json2Excel = function (dirname, zh, en, fileName) {
  let zh_array = []
  let en_array = []
  let zhen_xlsxArray = []
  let ObjectKeys = ''
  /**
   * @description 资源文件JSON对象转换为对应的数组
   * @param {*} obj 中文或英文语言JSON对象en
   * @param {*} arr 保存中文或英文语言JSON数据的对象数组，格式为[{key: zh}]或[{key: en}]，key包含对象层级
   */
  const object2Array = function (object, array) {
    for (const k in object) {
      if (!['number', 'string'].includes(typeof object[k])) {
        ObjectKeys += ObjectKeys ? '.' + k.toString() : String(k.toString())
        object2Array(object[k], array)
      } else {
        array.push({ [ObjectKeys ? `${ObjectKeys}.${k}` : k.toString()]: object[k] })
      }
    }

    if (ObjectKeys) {
      if (ObjectKeys.includes('.')) {
        let a = ObjectKeys.split('.')
        a.length -= 1
        ObjectKeys = a.join('.')
      } else {
        ObjectKeys = ''
      }
    }
  }

  object2Array(zh, zh_array)
  object2Array(en, en_array)
  for (let i = 0; i < zh_array.length; i++) {
    const key = Object.keys(zh_array[i])[0]
    let enValue = ''
    for (let j = 0; j < en_array.length; j++) {
      const vkey = Object.keys(en_array[j])[0]
      if (key === vkey) {
        enValue = en_array[j][vkey]
        break
      }
    }

    zhen_xlsxArray.push({
      key,
      简体中文: zh_array[i][key],
      英文: enValue || ''
    })
  }

  // Console.log("em: ", zh_array, en_array, zhen_xlsxArr);
  const path = require('path')
  const xlsx = require('xlsx')
  const { utils } = xlsx
  const { writeFile } = require('fs').promises
  const workBook = utils.book_new()
  const workSheet = utils.json_to_sheet(zhen_xlsxArray, {
    origin: 'A1', // 从A1开始增加内容
    header: ['key', '简体中文', '英文'],
    skipHeader: false // 跳过上面的标题行
  })

  // 向工作簿中追加工作表
  utils.book_append_sheet(workBook, workSheet, 'helloWorld')
  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = xlsx.write(workBook, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  })
  // 写入文件
  return writeFile(path.resolve(dirname, fileName), result)
}

module.exports = json2Excel
