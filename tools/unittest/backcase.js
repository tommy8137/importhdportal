import moment from 'moment'
import co from 'co'
import R from 'ramda'
// 使用前請閱讀公開說明書
// 使用unittest db去還原備份出的sql, 但是要確認 HD 的 cretaed 代碼是否與 unittest一樣
// 如有特殊字元 or 特殊type請確認如何處理 search key words dataTimeColumns,String(val).replace(/\'/g, `''`) in tyhd_pat_hd_qa
// test step  ->          1. clear table in unittest db,
//                        2. npm run back-unit-db
//                        3. confirm create script between unittest db and HD
//                        4. restore sql into unittest db
//                        5. change jest-base env.mayadbdatabase  into unittest
//                        6. remember delete *.sql wouldn't commit to git.
const fs = require('fs')
global.config = require('../../src/config')
const hospitalDB = require('server/helpers/database/').hospitalDB
const api_hdrec_id =  ['0207A008BE915FD7742C85C70AC3C8F0']
const api_pat_no =  ['0001157440']
const TYPE_ID_OF_DATATIME = '61'
const unit_hdrec_id = [
  ...api_hdrec_id,
  '2FEB7A33A72527B060470FE87A4BDE1F',
  '0010535CFF4DE9E8D0B1968CDDDF5B5C',
  '00054A5AAEF2CE727539E81971A18CC7',
  '022141CCB9B741756B347DCAD1FF013E',
  '0007554E77610174C6D904EE71471BC4',
  '0007A88E16092910996AADFDC1A0CB39',
  '7FD5715B166310ECB733F168DDABCF3C',
  'BF581AE739988F298D6E4424057F7098',
  '97EFD102E8B298AAA4AD5DCFE46D027E',
  '9B304203C27D9ECE695D94E0C9F6FE01',
  '016D5ECC554A27290115CA8F1F4AEAA9',
  '22F3E5A029BB610013DD3CD255125A58',
  '60EA601AF751216E70C7C8DBCDED0AC7',
  '0FEB69FE55446B7BDEB9B0BA69AAAB2D',
  '0006B730D36326D9292AC58382CBDFA3',
  '07D9682135171CDC3FD9C17B9639AABD',
  '03CF414D1D04A9012FCE84948347C9A9',
  '3059B7B5B437C9AE1844510878A9010D',
  '86971A6208B52EC0BD93F6BF3150B5C5',
  'A286FC1B3A8886105B86C6EFDE51DE1A',
  '5CB690E9B29698B81E4E0BDBDFA87E6D',
]
const unit_pat_no =  [
  ...api_pat_no,
  '0001273157',
  '0001267917',
  '0001770107',
  '0001815362',
  '0001917182',
  '0001380307',
  '0001038654',
  '0001771067',
  '0001982205',
  '0001786333',
  '0001521343',
  '0000033417',
  '0001551072',
  '0001031329',
  '0001192941',
  '0000226748',
  '0001101077',
  '0001530133',
]
let dataTimeColumns = {}
function* optimalBackup(db, wherecase, list) {
  // get type and name for insert schema
  const columnsInfo = yield co(hospitalDB.Query(`SELECT name, user_type_id FROM sys.columns WHERE object_id = OBJECT_ID('dbo.${db}')`))
  dataTimeColumns[db] = []
  columnsInfo.rows.forEach(row => {
    if (row.user_type_id == TYPE_ID_OF_DATATIME)  {
      dataTimeColumns[db].push(row.name)
    }
  })
  let columnsName = R.pluck('name', columnsInfo.rows)
  list = R.map(data=> `'${data}'`, list)
  let datas = yield co(hospitalDB.Query(`SELECT * FROM ${db} WHERE ${wherecase} in (${list})`))
  datas = datas.rows
  // 避免batch insert > 1000個數問題
  const batchList = R.splitEvery(50, datas)
  let sql = ''
  for (let list of batchList) {
    let insert = genInsertSql(db, columnsName, list)
    sql += insert
  }
  // wrtie to file
  fs.writeFile(`${db}.sql`, `\n${sql}`, function (err) {
    if (err) {
      console.log(err)
    }
  })
}

const genInsertSql = (db, columns, rows) => {
  let sql = `INSERT INTO ${db} (${columns}) VALUES `
  rows.forEach((row, index) => {
    row = R.mapObjIndexed((val, key, obj) => turnColumnValue(db, val, key, obj), row)
    sql += '(' + R.values(row).toString() + ') '
    if (index !=  rows.length - 1) {
      sql += ',\n'
    }
  })
  sql += '\n'
  return sql
}

const turnColumnValue = (db, val, key) => {
  if (val == null) {
    return 'NULL'
  }
  const timeCheck = dataTimeColumns[db]
  // DATETIME INDEX (db == 'tyhd_pat_hd_base' && (key == 'UPDATE_DT' || key == 'CREATE_DT'))
  if (timeCheck.indexOf(key) >= 0) {
    const d = moment(val).format('YYYY-MM-DD hh:mm:ss')
    return `'${d}'`
  }
  if (db == 'tyhd_pat_hd_qa') {
    const d = String(val).replace(/\'/g, `''`)
    return `'${d}'`
  }
  return `N'${val}'`
}

function* batchBack(pat_no, hdrec_id) {
  yield optimalBackup('tyhd_pat_hd_base', 'pat_no', pat_no)
  yield optimalBackup('tyhd_appointment', 'pat_no', pat_no)
  yield optimalBackup('tyhd_lab_data', 'patient_id', pat_no)
  yield optimalBackup('tyhd_pat_hd_memo', 'hdrec_id', hdrec_id)
  yield optimalBackup('tyhd_pat_hd_master', 'hdrec_id', hdrec_id)
  yield optimalBackup('tyhd_pat_hd_qa', 'hdrec_id', hdrec_id)
  yield optimalBackup('tyhd_cis_data', 'hdrec_id', hdrec_id)
  yield optimalBackup('tyhd_pat_hd_rec', 'hdrec_id', hdrec_id)
}

co(batchBack(unit_pat_no, unit_hdrec_id)).then(()=>{})
