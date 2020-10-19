import { systemDB, hospitalDB } from 'server/helpers/database'
import moment from 'moment'
import http from 'http'
import https from 'https'
const { mayaSystemIP, mayaSystemPORT, mayaSystemPROTOCOL } = global.config.maya
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import MayaAlarmSystem from 'server/models/maya/alarm-system'
import co from 'co'

const updateSbpToMaya = (httpReq, reqData, notesformat) => {
  return new Promise((fulfill, reject) => {
    const body = JSON.stringify([reqData])
    let mayaAPIpath
    switch (notesformat) {
      case "dart":
        mayaAPIpath = '/Wistron/WistronDART'
        break;
      default:
        mayaAPIpath = '/Wistron/WistronProcess'
        break;
    }
    const options = {
      hostname: mayaSystemIP,
      port: mayaSystemPORT,
      path: mayaAPIpath,
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const req = httpReq.request(options, (res) => {
      if (res.statusCode == 200) {
        let data = ''
        res.on('data', function(chunk) {
          data = chunk.toString()
          if(data !== 'Y'){
            reject({ message:'Sbs update status err,format error', code: errorCode.REQUEST_FORMAT_ERROR })
          }
        })
        res.on('end', function() {
          fulfill(data)
        })
      } else {
        reject({ message: `Sbs update status err, status code = ${res.statusCode}`, code: errorCode.INTERNAL_ERROR })
      }
    })
    req.on('socket', function (socket) {
      socket.setTimeout(5000)
      socket.on('timeout', function() {
        req.abort()
      })

    })
    req.on('error', ex => reject({ message: ex.message, code: errorCode.INTERNAL_ERROR }))
    req.write(body)
    req.end()
  })

}
export default class Alarm {
  static * updateSbpStatus(reqData, notesformat) {
    const httpReq = mayaSystemPROTOCOL == 'https' ? https : this.mockhttp ? this.mockhttp : http
    const { hdrec_id, sbp_time, ev_status } = reqData
    let record_date = moment().format('YYYY-MM-DD HH:mm:ss')
    switch (notesformat) {
      case "dart":
        reqData.Create_Date = record_date
        reqData.RContent = " "
        reqData.TContent = " "
        break;
      default:
        reqData.record_date = record_date
        break;
    }
    if(ev_status === 2) {
      try{
        yield updateSbpToMaya(httpReq, reqData, notesformat)
      }catch(e) {
        throwApiError(e.message, e.code)
      }
    }
    if(ev_status === 1 || ev_status === 2) {
      co(function*() {
        yield MayaAlarmSystem.processMayaAlarmSystem()
      })
      const result = yield systemDB.Query('UPDATE webportal.risk SET ev_status =$1, record_date = $2 WHERE hemno =$3 AND sbp_time = $4',
      [ev_status, record_date, hdrec_id, sbp_time])
      if(result.rowCount === 0) {
        throwApiError('Patient not found', errorCode.REQUEST_NOT_FOUND)
      }
    } else {
      throwApiError('Sbs update status err,format error', errorCode.REQUEST_FORMAT_ERROR)
    }
    return true
  }
}
