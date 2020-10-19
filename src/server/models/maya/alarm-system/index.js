import http from 'http'
import https from 'https'
const { mayaSystemIP, mayaSystemPORT, mayaSystemPROTOCOL } = global.config.maya
import { errorCode } from 'server/helpers/api-error-helper'
import moment from 'moment'
import Overview, { tuningMaxbloodLower } from 'server/models/maya/searches/overviews'
import { ALARM_STATUS_TALBE as BESTSHAPE_ALARM_STATUS_TALBE } from 'server/risk.js'

export default class MayaAlarmSystem {
  static* processMayaAlarmSystem() {
    const risk = yield MayaAlarmSystem.getRisk()
    yield MayaAlarmSystem.sendRisk(risk)
  }

  // static for easly full coverage for unit test
  static getAlarmSpec() {
    const httpReq = this && this.mockhttp || http
    return new Promise((fulfill, reject) => {
      const options = {
        hostname: mayaSystemIP,
        port: mayaSystemPORT,
        path: '/Wistron/WistronIni',
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
            data += chunk.toString()
          })
          res.on('end', function() {
            data = JSON.parse(data)
            fulfill(data)
          })
        } else {
          reject({ message: `getAlarmSpec query maya system err, status code = ${res.statusCode}`, code: errorCode.INTERNAL_ERROR  })
        }
      })
      req.on('socket', function (socket) {
        socket.setTimeout(5000)
        socket.on('timeout', function() {
          req.abort()
        })
      })
      req.on('error', ex => reject({ message: ex.message, code: errorCode.INTERNAL_ERROR }))
      req.end()
    })
  }

  // static for easly full coverage for unit test
  static sendRisk(risk) {
    const httpReq = mayaSystemPROTOCOL == 'https' ? https : this.mockhttp || http
    return new Promise((fulfill, reject) => {
      const body = JSON.stringify(risk)
      const options = {
        hostname: mayaSystemIP,
        port: mayaSystemPORT,
        path: '/Wistron/WistronAssess',
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
          })
          res.on('end', function() {
            fulfill(data)
          })
        } else {
          console.log(reject({ message: `Risks update alram err, status code = ${res.statusCode}`, code: errorCode.INTERNAL_ERROR }))
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

  static *getRisk() {
    const models = this.models || Overview
    let risk =  {
      alarm : 'N',
      pat_list : [],
    }
    let abnormal_list = yield models.getAbnormals('all', 'all', 'all')
    abnormal_list = abnormal_list.abnormal_list
    if(abnormal_list.length > 0) {
      risk.alarm = 'Y'
    }
    for(let k in abnormal_list) {
      let alarm_status
      if(abnormal_list[k].alarm_status == BESTSHAPE_ALARM_STATUS_TALBE.NOT_PROCESSED_YET) {
        alarm_status = ALARM_STATUS_TALBE.HAS_RISK
      }
      if(abnormal_list[k].alarm_status == BESTSHAPE_ALARM_STATUS_TALBE.KEEP_OBSERVE) {
        alarm_status = ALARM_STATUS_TALBE.KEEP_OBSERVE
      }
      if(abnormal_list[k].alarm_status == BESTSHAPE_ALARM_STATUS_TALBE.PROCESSED) {
        alarm_status = ALARM_STATUS_TALBE.PROCESSED
      }
      risk.pat_list.push({
        pat_no: abnormal_list[k].patient_id,
        alarm_typ: '血壓',
        assess_time : abnormal_list[k].sbp_time,
        alarm_time : abnormal_list[k].risk_time,
        alarm_msg : '',
        alarm_status: alarm_status,
      })
    }
    return risk
  }
}

export const ALARM_STATUS_TALBE = {
  PROCESSED: '0',
  HAS_RISK: '1',
  KEEP_OBSERVE: '2',
}
