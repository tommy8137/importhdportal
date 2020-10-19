import Promise from 'bluebird'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import Protos from 'common/protos'
import https from 'https'
// import { hospitalDB } from 'server/helpers/database'

const { spIp, spPort } = global.config

export default class Risks {
  static getLibs(lang) {
    const spyThis = this && this.models ? this : {}
    spyThis.getSpframeworkLibs = spyThis.models && spyThis.models.getSpframeworkLibs ? spyThis.models.getSpframeworkLibs : getSpframeworkLibs
    return Promise.try(function(){
      return spyThis.getSpframeworkLibs(lang)
    })
  }
  static* getCharts(predictData, categoryId, moduleId) {
    const spyThis = this && this.models ? this : {}
    spyThis.getSpFrameworkChart = spyThis.models && spyThis.models.getSpFrameworkChart ? spyThis.models.getSpFrameworkChart : getSpFrameworkChart
    try {
      const chart = yield spyThis.getSpFrameworkChart.apply(this, [predictData, categoryId, moduleId])
      return chart
    } catch(e) {
      throwApiError(e.message, e.code)
    }
  }

  /*
    deprecated
   */
  static* getAccess(categoryId, moduleId, time, p_id, r_id) {
    return true
    // let datetime
    // if (categoryId == 1 && (moduleId == 2 || moduleId == 3)) {
    //   datetime = yield hospitalDB.Query(
    //     `SELECT REPLACE(DATA_TIME, '/', '-') AS datatime
    //     FROM TYHD_CIS_DATA AS hemvip
    //     INNER JOIN vi_TYHD_PAT_HD_MASTER AS record
    //     ON hemvip.pat_no = record.pat_no AND SUBSTRING(REPLACE(hemvip.DATA_TIME, '/', '-') ,1,10) = record.hd_date
    //     WHERE hemvip.pat_no=@p_id AND record.hdrec_id=@r_id
    //      AND MAX_BLOOD != '' AND time >= 1 AND data_time < GETDATE()
    //     ORDER BY DATA_TIME DESC`,
    //     { p_id, r_id }
    //   )
    //   datetime = datetime.rows
    //   if (datetime.length === 0) {
    //     throwApiError('Data expired, please refresh this page. Thank you.', errorCode.ACCESS_DENY)
    //   } else {
    //     datetime = new Date(datetime[0].datatime).valueOf()
    //     if (datetime > Number(time)) {
    //       throwApiError('Data expired, please refresh this page. Thank you.', errorCode.ACCESS_DENY)
    //     } else {
    //       return true
    //     }
    //   }
    // } else {
    //   throwApiError('Data expired, please refresh this page. Thank you.', errorCode.ACCESS_DENY)
    // }
  }
  static* getRisksProbs(predictData, categoryId, moduleId) {
    const spyThis = this && this.models ? this : {}
    spyThis.getSpFrameworkRiskProb = spyThis.models && spyThis.models.getSpFrameworkRiskProb ? spyThis.models.getSpFrameworkRiskProb : getSpFrameworkRiskProb
    try {
      const chart = yield spyThis.getSpFrameworkRiskProb.apply(this, [predictData, categoryId, moduleId])
      return chart
    } catch(e) {
      throwApiError(e.message, e.code)
    }
  }
}

export let ricksFunc = {
  getSpFrameworkChart,
  getSpframeworkLibs,
  getSpFrameworkRiskProb,
}

function getSpFrameworkChart(predictData, categoryId, moduleId) {
  return new Promise((fulfill, reject) => {
    const options = {
      hostname: spIp,
      port: spPort,
      path: `/api/v1alpha/risks/categories/${categoryId}/modules/${moduleId}/charts`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      rejectUnauthorized: false,
    }
    this.https = this.models && this.models.https ? this.models.https : https
    const req = this.https.request(options, (res) => {
      if (res.statusCode == 200) {
        let data = []
        res.on('data', function(chunk) {
          data.push(chunk)
        })
        res.on('end', function() {
          const buffer = Buffer.concat(data)
          fulfill(buffer)
        })
      } else if (res.statusCode == 400) {
        res.on('data', function(d) {
          const errorMessage = JSON.parse(d.toString())
          reject({ message: errorMessage.message, code: errorMessage.code })
        })
      } else if (res.statusCode == 408) {
        reject({ message: 'Request Timeout', code: errorCode.TIMEOUT })
      } else {
        reject({ message: 'modles/risks test err', code: errorCode.INTERNAL_ERROR })
      }
    })

    req.on('error', ex => reject({ message: ex.message, code: errorCode.INTERNAL_ERROR }))
    req.write(predictData)
    req.end()
  })
}

function getSpframeworkLibs(lang) {
  return new Promise((fulfill, reject) => {
    const options = {
      hostname: spIp,
      port: spPort,
      path: '/api/v1alpha/risks/libs?lang=' + lang,
      method: 'GET',
      rejectUnauthorized: false,
    }
    this.https = this.models && this.models.https ? this.models.https : https
    const req = this.https.request(options, (res) => {
      if(res.statusCode == 200) {
        res.on('data', (d) => {
          try {
            const data = Protos.Libs.response.decode(d)
            fulfill(data)
          } catch (ex) {
            reject(ex)
          }
        })
      } else if (res.statusCode == 408) {
        reject({ message: 'Request Timeout', code: errorCode.TIMEOUT })
      } else {
        reject({ message: 'modles/risks get libs err', code: errorCode.INTERNAL_ERROR })
      }
    })

    req.end()

    req.on('error', ex => reject({ message: ex.message, code: errorCode.INTERNAL_ERROR }))

  })
}

function getSpFrameworkRiskProb(predictData, categoryId, moduleId) {
  return new Promise((fulfill, reject) => {
    const options = {
      hostname: spIp,
      port: spPort,
      path: '/api/v1alpha/risks/probs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      rejectUnauthorized: false,
    }
    this.https = this.models && this.models.https ? this.models.https : https
    const req = this.https.request(options, (res) => {
      if (res.statusCode == 200) {
        let data = []
        res.on('data', function(chunk) {
          data.push(chunk)
        })
        res.on('end', function() {
          const buffer = Buffer.concat(data)
          fulfill(buffer)
        })
      } else if (res.statusCode == 400) {
        res.on('data', function(d) {
          const errorMessage = JSON.parse(d.toString())
          reject({ message: errorMessage.message, code: errorMessage.code })
        })
      } else if (res.statusCode == 408) {
        reject({ message: 'Request Timeout', code: errorCode.TIMEOUT })
      } else {
        reject({ message: 'modles/risks test err', code: errorCode.INTERNAL_ERROR })
      }
    })

    req.on('error', ex => reject({ message: ex.message, code: errorCode.INTERNAL_ERROR }))
    req.write(predictData)
    req.end()
  })
}
