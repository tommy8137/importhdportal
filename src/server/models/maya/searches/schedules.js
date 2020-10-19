import moment from 'moment'
import { hospitalDB } from 'server/helpers/database'
import R from 'ramda'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

const validateDate = (d) => /* R.isNil(d) || */ moment(d, 'YYYY-MM-DD', true).isValid()
const validateInteger = (num) => R.isNil(num) || /^[0-9]+$/.test(num)
const validateSort = s => R.isNil(s) || /^-{0,1}(date|name|gender|patient_id|bed_no|schedule|progress)$/i.test(s)

export default class Schedules {
  static* getSchedules(startDate, endDate, offset, limit, sort, q) {
    if (!validateDate(startDate)
      || !validateDate(endDate)
      || !validateInteger(limit)
      || !validateInteger(offset)
      || !validateSort(sort)) {
      throwApiError('Invalid parameter', errorCode.ACCESS_DENY)
    }
    let dbStartDate, dbEndDate, dbOffset, dbLimit, dbSort
    dbStartDate = startDate /* || '1970-01-01'*/
    dbEndDate = endDate /* || moment().format('YYYY-MM-DD')*/
    dbOffset = offset ? Number(offset) : 0
    dbLimit = limit ? Number(limit) : 0
    dbSort = sort || ''
    let schedule_patients = [], userlist, dbOrder, dbQ
    let sortSql = ''
    let order = dbSort.charAt(0)
    if (order === '-') {
      dbOrder = 'DESC'
      dbSort = dbSort.split('-')[1]
    } else {
      dbOrder = 'ASC'
    }

    switch(dbSort) {
      case 'date': {
        dbSort = 'TPHM.HD_DATE'
        break
      }

      case 'name': {
        dbSort = 'TPHB.PAT_NAME_UNICODE'
        break
      }

      case 'gender': {
        dbSort = 'TPHB.SEX'
        break
      }

      case 'patient_id': {
        dbSort = 'TPHM.PAT_NO'
        break
      }

      case 'bed_no': {
        dbSort = 'TPHM.BED_NO'
        break
      }

      case 'schedule': {
        dbSort = 'TPHM.APP_PRIOD'
        break
      }

      case 'progress': {
        dbSort = 'TPHM.HD_STATUS'
        break
      }
      default: {
        dbSort = 'TPHM.HD_DATE, TPHM.APP_PRIOD, TPHM.BED_NO'
      }
    }
    sortSql = `ORDER BY ${dbSort} ${dbOrder}`
    let lower = dbOffset
    let upper = dbOffset + dbLimit

    if (q) {
      dbQ = decodeURI(q)
      const pdbQ = dbQ.replace(/[^a-zA-Z0-9]/gi, '')
      const unicodeQ = dbQ.replace(/[@|#|$|%|!|&|*|(|)|^|~|+|-|\'|\"]/gi, '')
      let orderCondition = ''
      if (pdbQ != '') {
        orderCondition = `OR TPHB.PAT_NO LIKE '%${pdbQ}%'`
      }
      userlist = yield hospitalDB.Query(
        `SELECT * FROM (
          SELECT ROW_NUMBER() Over(${sortSql}) num,TPHM.HD_DATE, TPHB.PAT_NAME_UNICODE, TPHB.SEX, TPHB.BIRTH_DATE, TPHB.PAT_NO,
            TPHM.BED_NO, TPHM.HDREC_ID, TPHM.APP_PRIOD, TPHM.HD_STATUS
          FROM TYHD_PAT_HD_BASE AS TPHB
          INNER JOIN vi_TYHD_PAT_HD_MASTER AS TPHM
            ON TPHB.PAT_NO = TPHM.PAT_NO
          WHERE TPHM.HD_DATE >= '${dbStartDate}'
            AND TPHM.HD_DATE <= '${dbEndDate}'
            AND (TPHB.PAT_NAME_UNICODE LIKE N'%${unicodeQ}%' ${orderCondition})
            AND TPHM.APP_PRIOD IS NOT NULL
        ) AS tmp WHERE num > ${lower} and num <= ${upper}`, {})
    } else {
      userlist = yield hospitalDB.Query(
        `SELECT * FROM (
          SELECT ROW_NUMBER() Over(${sortSql}) num, TPHM.HD_DATE, TPHB.PAT_NAME_UNICODE, TPHB.SEX, TPHB.BIRTH_DATE, TPHB.PAT_NO,
          TPHM.BED_NO, TPHM.HDREC_ID, TPHM.APP_PRIOD, TPHM.HD_STATUS
          FROM TYHD_PAT_HD_BASE AS TPHB
          INNER JOIN vi_TYHD_PAT_HD_MASTER AS TPHM
          ON TPHB.PAT_NO = TPHM.PAT_NO
          WHERE TPHM.HD_DATE >= '${dbStartDate}'
          AND TPHM.HD_DATE <= '${dbEndDate}'
          AND TPHM.APP_PRIOD IS NOT NULL
       ) AS tmp WHERE num > ${lower} and num <= ${upper}`, {})
    }

    const userList = userlist.rows
    for (let user of userList) {
      let { BED_NO, SEX, HD_DATE, PAT_NAME_UNICODE, APP_PRIOD, HDREC_ID, PAT_NO, HD_STATUS } = user
      BED_NO = BED_NO || '-'
      SEX = SEX || '-'
      switch (HD_STATUS) {
        case '已報到': {
          HD_STATUS = 'Not Started'
          break
        }

        case '透析中': {
          HD_STATUS = 'Under Dialysis'
          break
        }

        case '透析結束': {
          HD_STATUS = 'Finished'
          break
        }
      }

      schedule_patients.push({
        date: HD_DATE,
        name: PAT_NAME_UNICODE,
        gender: SEX,
        bed_no: BED_NO,
        patient_id: PAT_NO,
        schedule: Number(APP_PRIOD),
        r_id: HDREC_ID,
        progress: HD_STATUS,
      })
    }

    return {
      total_nums: -9527,
      schedule_patients,
    }
  }
}
