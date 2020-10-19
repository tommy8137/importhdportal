import path from 'path'
import * as xlsx from 'node-xlsx' // need to install node-xlsx manually!
import fs from 'fs'
import through2 from 'through2'

const parsed = xlsx.parse(path.join(__dirname, 'WiPrognosis 20-Xx v2.00.xlsx'))
const data = {
  zhtw: {},
  zhcn: {},
  en: {},
}
let firstWrite = true
let previousGID

const localeStream = (lang) => {
  const stream = through2(
    { objectMode: false },
    (chunk, enc, callback) => callback(null, chunk),
    function (callback) {
      this.push(` //${previousGID}\n}`)
      callback()
    }
  )
  stream.pipe(fs.createWriteStream(path.join(__dirname, '../../src/app/locales/',`${lang}.txt`)))
  return stream
}
const streams = [localeStream('zh-tw'), localeStream('zh-cn'), localeStream('en')]
const names = {}
parsed[1].data.forEach((row, idx) => {
  if (row.length == 0) {
    return
  }
  let [gid, name, en, zhtw, zhcn] = row
  if (!en || /glossary/i.test(gid)) {
    return
  }
  !zhtw && (zhtw = en)
  !zhcn && (zhcn = en)
  !name && (name = en)
  if (!names[name]) {
    names[name] = 1
  } else {
    names[name] = names[name] + 1
    name = `${name}${names[name]}`
  }
  const locales = [zhtw, zhcn, en]
  if (!firstWrite) {
    streams.forEach(s => s.push(`, //${previousGID}\n`))
  } else {
    streams.forEach(s => s.push('{\n'))
  }

  firstWrite = false
  // two space lead in each row
  streams.forEach((s, i) => s.push(`  ${JSON.stringify(name)}: ${JSON.stringify(locales[i])}`))
  previousGID = gid
})

streams.forEach(s => s.end())
