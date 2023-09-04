/*
 * @created: Monday, 2020-05-18 01:00:45
 * @author: chendq
 * ---------
 * @desc Unit test case
 */

const path = require('path')
const test = require('ava')
const json2excel = require('./packages/lib/json2excel')
const { excel2json, json2FormatLangObj, writeToFile } = require('./packages/lib/excel2json')

// Return relative path
function convertRelativePath(dirname, pathname) {
  // console.log(__dirname, pathname, path.isAbsolute(pathname), path.relative(dirname, pathname));
  const relativePath = path.relative(dirname, pathname).split(path.sep).join('/')
  return relativePath.startsWith('./') || relativePath.startsWith('../') ? relativePath : './' + relativePath
}

test.cb('#excel2json()', t => {
  const jsonArray = excel2json(
    process.cwd(),
    convertRelativePath(process.cwd(), String.raw`./packages/examples/helloworld.xlsx`)
  )
  writeToFile(process.cwd(), json2FormatLangObj(jsonArray[0]), 'new')
    .then(res => {
      t.true(true)
      t.end()
    })
    .catch(error => {
      t.true(error !== undefined)
      t.end()
    })
})

test.cb('#json2excel()', t => {
  const zhJSON = require(convertRelativePath(__dirname, String.raw`packages/examples/zh-cn.js`))
  const enJSON = require(convertRelativePath(__dirname, String.raw`packages/examples/en.js`))
  json2excel(process.cwd(), zhJSON, enJSON, 'new_helloworld.xlsx')
    .then(res => {
      console.log('json2excel-then: ', res)
      t.true(true)
      t.end()
    })
    .catch(error => {
      console.log('json2excel-catch: ', error)
      t.true(error !== undefined)
      t.end()
    })
})
