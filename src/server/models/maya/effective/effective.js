import Promise from 'bluebird'
import fs from 'fs'
import moment from 'moment'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { systemDB } from 'server/helpers/database/'
import getHtml from 'server/models/maya/effective/template'
import nexeRequire from 'server/utils/nexe-require'

const pdf = nexeRequire('html-pdf')
const { reportPDFPath,
  maxblood_upper_tuning_value,
  maxblood_upper_tuning_unit,
  maxblood_middle_tuning_value,
  maxblood_middle_tuning_unit,
  maxblood_lower_tuning_value,
  maxblood_lower_tuning_unit,
  maxblood_upper,
  maxblood_lower,
  conductivity_threshold,
  dialysate_temp_threshold,
  urf_threshold,
  blood_flow_threshold,
} = global.config

export default class Effectiveness {
  static* getPDF(year, lang) {
    this.getReportValues = this.models && this.models.getReportValues ? this.models.getReportValues : getReportValues
    this.getPromisePdf = this.models && this.models.getPromisePdf ? this.models.getPromisePdf : getPromisePdf
    let reportValues = yield this.getReportValues(year, lang)
    const pdf = yield this.getPromisePdf(reportValues)
    return pdf
  }

  static* getList() {
    this.systemDB = this.models ? this.models.systemDB : systemDB
    let yearQuery = yield this.systemDB.Query(`SELECT distinct year
                                              FROM webportal.sbp_drop
                                              WHERE month != '00'
                                              ORDER BY year DESC`)
    if (yearQuery.rows.length > 0) {
      return yearQuery.rows.map((rows, idx) => rows.year)
    }
    return []
  }
}

function* getReportValues(year, lang) {
  this.systemDB = this.models ? this.models.systemDB : systemDB

  let startdate, enddate
  let startEndDate = yield this.systemDB.Query(`SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.sbp_drop WHERE year = '${year}'`)

  if (startEndDate.rows.length <= 0 ) {
    startEndDate = yield this.systemDB.Query(`SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.process_rate WHERE year = '${year}'`)
  }

  startdate = moment(startEndDate.rows[0].startdate).format('YYYY-MM-DD')
  enddate = moment(startEndDate.rows[0].enddate).format('YYYY-MM-DD')

  let eachMonth = Array(13).fill().map((_, idx) => {
    return idx < 10 ? '0' + idx : `${idx}`
  })

  let sbpDropQuery = yield this.systemDB.Query(
      `SELECT month, number, bpropevent_num, bpdrop_rate FROM webportal.sbp_drop WHERE year = '${year}'`)
  let numberValue = []
  let bpropevent_num = []
  let bpdrop_rate = []
  eachMonth.map((obj) => {
    let sbpDropValues = sbpDropQuery.rows.filter((rows) => rows.month == obj )
    if (sbpDropValues.length > 0) {
      numberValue.push(sbpDropValues[0].number)
      bpropevent_num.push(sbpDropValues[0].bpropevent_num)
      bpdrop_rate.push(sbpDropValues[0].bpdrop_rate)
    } else {
      numberValue.push(null)
      bpropevent_num.push(null)
      bpdrop_rate.push(null)
    }
    return
  })

  let processRateQuery = yield this.systemDB.Query(
      `SELECT month, process_rate FROM webportal.process_rate WHERE year = '${year}'`)

  let eachMonthProcessRate = eachMonth.map((obj) => {
    let processRateValues = processRateQuery.rows.filter((rows) => rows.month == obj )
    if (processRateValues.length > 0) {
      return processRateValues[0].process_rate
    } else {
      return null
    }
  })

  let alarmThreatQuery = yield this.systemDB.Query(
      `SELECT month, treat, nontreat FROM webportal.alarm_threat WHERE year = '${year}'`)
  let treat = []
  let nontreat = []
  eachMonth.map((obj) => {
    let alarmThreatValues = alarmThreatQuery.rows.filter((rows) => rows.month == obj )
    if (alarmThreatValues.length > 0) {
      treat.push(alarmThreatValues[0].treat)
      nontreat.push(alarmThreatValues[0].nontreat)
    } else {
      treat.push(null)
      nontreat.push(null)
    }
    return
  })

  return {
    reportDate: moment(Date.now().valueOf()).format('YYYY-MM-DD'),
    startDate: startdate,
    endDate: enddate,
    SBPDrop: [numberValue, bpropevent_num, bpdrop_rate],
    ProcessRate: eachMonthProcessRate,
    AlarmThreat: [treat, nontreat],
    lang,
    maxblood_upper_tuning_value,
    maxblood_upper_tuning_unit,
    maxblood_middle_tuning_value,
    maxblood_middle_tuning_unit,
    maxblood_lower_tuning_value,
    maxblood_lower_tuning_unit,
    maxblood_upper,
    maxblood_lower,
    conductivity_threshold,
    dialysate_temp_threshold,
    urf_threshold,
    blood_flow_threshold,
  }
}

function getPromisePdf(returnArray) {
  return new Promise((resolve, reject) => {
    this.pdf = this.models && this.models.pdf ? this.models.pdf : pdf
    this.reportPDFPath = this.models && this.models.reportPDFPath ? this.models.reportPDFPath : reportPDFPath
    this.getHtml = this.models && this.models.getHtml ? this.models.getHtml : getHtml
    this.fs = this.models && this.models.fs ? this.models.fs : fs

    const html = this.getHtml(returnArray)

    this.pdf.create(html).toStream((err, stream) => {
      if (err) return reject(err)
      stream.pipe(fs.createWriteStream(reportPDFPath))
      stream.on('error', (err) => {
        reject({ message: err, code: errorCode.RW_FILE_ERROR })
      })
      stream.on('end', () => {
        this.fs.readFile(this.reportPDFPath, (err, file) => {
          if (err) return reject(err)
          resolve(file)
        })
      })
    })
  })
}

export let effectiveFunc = {
  getReportValues,
  getPromisePdf,
}
