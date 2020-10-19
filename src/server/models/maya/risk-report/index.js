import moment from 'moment'
import co from'co'
import R from 'ramda'
import json2csv from 'json2csv'
import { hospitalDB, systemDB } from 'server/helpers/database'
import { ALARM_STATUS_TALBE } from 'server/risk.js'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class Report {
  static* getReport(date) {
    //  hemno, hemarea, shift, prcessrate
    if (date) {
      if (moment(date, 'YYYY-MM-DD', true).isValid()) {
        return yield co(getRisk(date))
      } else {
        throwApiError('Please input date which format is YYYY-MM-DD, ex:' + moment().format('YYYY-MM-DD'), errorCode.REQUEST_FORMAT_ERROR)
      }
    } else {
      date = moment().format('YYYY-MM-DD')
      return yield co(getRisk(date))
    }
  }
}

function* getRisk(date) {
  const risk = yield systemDB.Query(`Select hemno, hemarea, shift, ev_status, count(*) from webportal.risk
                        WHERE ev_status >= 0 AND substring(sbp_time from 1 for 10) = '${date}' group by ev_status, hemno, hemarea, shift order by hemarea ASC`)
  if (risk.rows.length == 0) {
    throwApiError(`No data at ${date}`, errorCode.REQUEST_NOT_FOUND)
    return
  }

  let bedno = yield getBedNo(risk)
  let report = calReportData(risk, bedno)
  return genCSV(report)
}


function* getBedNo(risk) {
  const list  = R.map(data => {
    return `'${data}'`
  }, R.pluck('hemno')(risk.rows))

  let bedno = yield hospitalDB.Query(`select LEFT(bed_no, 1) AS hemarea, bed_no, hdrec_id as hemno FROM vi_TYHD_PAT_HD_MASTER WHERE hdrec_id in (${list.toString()}) ORDER BY bed_no ASC`)
  return bedno.rows
}

function calReportData(risks, bedno) {
  let report = {}
  bedno.forEach((bed)=>{
    let { bed_no, hemarea } = bed
    if (!report[bed_no]) {
      report[bed_no] = { hemarea, bed_no, 'd': 0, 'e': 0, 'n': 0, handle: [0, 0, 0] }
    }
  })

  bedno.forEach((bed)=>{
    risks.rows.forEach(risk =>{
      if ( bed.hemno == risk.hemno) {
        let { shift, count, ev_status } = risk
        let { bed_no } = bed
        switch (shift) {
          case 1:
            report[bed_no]['d'] +=  count
            break
          case 2:
            report[bed_no]['e'] +=  count
            break
          case 3:
            report[bed_no]['n'] +=  count
            break
        }
        if (ev_status == ALARM_STATUS_TALBE.PROCESSED || ev_status == ALARM_STATUS_TALBE.KEEP_OBSERVE) {
          report[bed_no]['handle'][(shift - 1)] += count
        }
      }
    })
  })
  for (let r of Object.keys(report)) {
    report[r]['d'] = report[r]['d'] == 0  ? 0 : Number((report[r]['handle'][0] / report[r]['d']).toFixed(2))
    report[r]['e'] = report[r]['e'] == 0  ? 0 : Number((report[r]['handle'][1] / report[r]['e']).toFixed(2))
    report[r]['n'] = report[r]['n'] == 0  ? 0 : Number((report[r]['handle'][2] / report[r]['n']).toFixed(2))
  }
  return report
}
//  hemno, hemarea, shift, prcessrate
function genCSV(report) {
  let csv = []
  for (let risk in report) {
    csv.push(report[risk])
  }

  const fieldNames = ['area', 'Bed No', 'D', 'E', 'N']
  try {
    return json2csv({ data: csv, fields: ['hemarea', 'bed_no', 'd', 'e', 'n'], fieldNames })
  } catch (err) {
    throwApiError('csv modules error', errorCode.INTERNAL_ERROR)
  }
}
